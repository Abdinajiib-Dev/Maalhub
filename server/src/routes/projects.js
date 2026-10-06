import express from 'express';
import { z } from 'zod';
import { supabase } from '../db/supabase.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { getReportsForProject, saveReportForProject, deleteReportById } from '../utils/reportsHelper.js';

const router = express.Router();

// Validation Schemas
const projectSchema = z.object({
  body: z.object({
    project_name: z.string().min(3, "Title must be at least 3 characters").max(100),
    project_description: z.string().min(10, "Description must be at least 10 characters"),
    funding_goal: z.number().positive("Funding goal must be positive").optional(),
    status: z.enum(['Draft', 'Published', 'Funded']).optional(),
  }).passthrough() // Allow other fields to avoid breaking existing frontend
});

const updateProjectSchema = z.object({
  body: z.object({
    project_name: z.string().min(3).max(100).optional(),
    project_description: z.string().min(10).optional(),
    funding_goal: z.number().positive().optional(),
    status: z.enum(['Draft', 'Published', 'Funded']).optional(),
  }).passthrough()
});

// Helper for pagination
const getPagination = (page, size) => {
  const limit = size ? +size : 50; // Default limit
  const from = page ? (page - 1) * limit : 0;
  const to = page ? from + limit - 1 : limit - 1;
  return { from, to };
};

// Get projects (scoped by user role if authenticated, otherwise all published)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { from, to } = getPagination(page, limit);

    let profile = null;
    if (req.user?.id) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();
      profile = data;
    }

    let query = supabase
      .from('projects')
      .select(`
        *,
        entrepreneur:profiles!projects_entrepreneur_id_fkey(full_name, city, country, profile_photo_url)
      `, { count: 'exact' });

    if (profile?.role === 'entrepreneur') {
      // Entrepreneurs only see their own created projects
      query = query.eq('entrepreneur_id', req.user.id);
    } else {
      // Investors see all published projects from any entrepreneur
      query = query.eq('status', 'Published');
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    res.json({
      data,
      meta: {
        total: count,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get logged-in user's projects
router.get('/my-projects', requireAuth, async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { from, to } = getPagination(page, limit);

    const { data, error, count } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('entrepreneur_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    res.json({
      data,
      meta: {
        total: count,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single project details with access control
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        entrepreneur:profiles!projects_entrepreneur_id_fkey(full_name, city, country, profile_photo_url, about)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PGRST116 is the Supabase error for no rows returned in .single()
        return res.status(404).json({ error: 'Project not found' });
      }
      throw error;
    }

    // Role check: Entrepreneurs cannot view projects created by other entrepreneurs
    if (profile?.role === 'entrepreneur' && data.entrepreneur_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: Entrepreneurs can only view their own projects.' });
    }

    // Attempt to fetch investment phases for this project
    let phases = [];
    try {
      const { data: phaseData, error: phaseError } = await supabase
        .from('project_investment_phases')
        .select('*')
        .eq('project_id', req.params.id)
        .order('phase_number', { ascending: true });

      if (!phaseError && phaseData) {
        phases = phaseData;
      }
    } catch (phaseErr) {
      console.warn('Phase fetch warning:', phaseErr.message);
    }

    res.json({ ...data, phases });
  } catch (error) {
    next(error);
  }
});

// Create a project (Entrepreneur only)
router.post('/', requireAuth, validate(projectSchema), async (req, res, next) => {
  try {
    // Fetch the user's main profile (for location)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('city, country')
      .eq('id', req.user.id)
      .single();

    if (profileError) throw profileError;

    // Fetch the entrepreneur profile (for business_name, industry, startup_stage)
    const { data: entProfile, error: entError } = await supabase
      .from('entrepreneur_profiles')
      .select('startup_company_name, industry, startup_stage')
      .eq('user_id', req.user.id)
      .single();

    if (entError) throw entError;

    // Separate phases from the project columns
    const { phases, ...rawProjectData } = req.body;

    // Merge the auto-populated fields with the request body
    // All projects created by entrepreneurs default to Draft (Awaiting Admin Review)
    const projectData = { 
      ...rawProjectData, 
      status: 'Draft',
      entrepreneur_id: req.user.id,
      business_name: req.body.business_name || entProfile?.startup_company_name || 'Startup Business',
      industry: req.body.industry || req.body.category || entProfile?.industry || 'Agriculture',
      startup_stage: req.body.startup_stage || entProfile?.startup_stage || 'Growth',
      location: profile ? `${profile.city}, ${profile.country}` : 'Location unverified'
    };
    
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) throw error;

    // Insert investment phases if provided
    let insertedPhases = [];
    if (Array.isArray(phases) && phases.length > 0) {
      try {
        const phasesToInsert = phases.map((p, index) => ({
          project_id: data.id,
          phase_number: p.phase_number || (index + 1),
          title: p.title || `Phase ${index + 1}`,
          description: p.description || '',
          target_amount: Number(p.target_amount) || 0,
          current_amount: 0,
          status: p.status || (index === 0 ? 'Active' : 'Upcoming'),
          target_date: p.target_date || null
        }));

        const { data: phaseResult, error: phaseInsertError } = await supabase
          .from('project_investment_phases')
          .insert(phasesToInsert)
          .select();

        if (!phaseInsertError && phaseResult) {
          insertedPhases = phaseResult;
        }
      } catch (phaseErr) {
        console.warn('Could not insert phases during project creation:', phaseErr.message);
      }
    }

    res.status(201).json({ ...data, phases: insertedPhases });
  } catch (error) {
    next(error);
  }
});

// Update a project
router.put('/:id', requireAuth, validate(updateProjectSchema), async (req, res, next) => {
  try {
    const projectId = req.params.id;
    
    // Check if project belongs to the user
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('entrepreneur_id')
      .eq('id', projectId)
      .single();
      
    if (fetchError || !existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (existingProject.entrepreneur_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own projects' });
    }

    const updates = { ...req.body };
    if (updates.progress_percentage !== undefined) {
      const val = Math.min(100, Math.max(0, parseInt(updates.progress_percentage) || 0));
      updates.progress_percentage = val;
      updates.current_progress = `${val}%`;
    }

    let { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error && error.message && error.message.toLowerCase().includes('progress_percentage')) {
      delete updates.progress_percentage;
      const retry = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Project update DB error:', error);
      return res.status(400).json({ error: error.message || 'Failed to update project' });
    }

    res.json(data || { id: projectId, ...updates });
  } catch (error) {
    console.error('Project update route error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during project update' });
  }
});

// Delete a project
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const projectId = req.params.id;
    
    // Check if project belongs to the user
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('entrepreneur_id')
      .eq('id', projectId)
      .single();
      
    if (fetchError || !existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (existingProject.entrepreneur_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own projects' });
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Add a phase to an existing project (Entrepreneur only)
router.post('/:id/phases', requireAuth, async (req, res, next) => {
  try {
    const projectId = req.params.id;

    // Verify ownership
    const { data: project, error: pErr } = await supabase
      .from('projects')
      .select('entrepreneur_id')
      .eq('id', projectId)
      .single();

    if (pErr || !project) return res.status(404).json({ error: 'Project not found' });
    if (project.entrepreneur_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Only the project owner can add phases' });
    }

    const { phase_number, title, description, target_amount, status, target_date } = req.body;
    if (!title || !target_amount) {
      return res.status(400).json({ error: 'Title and target amount are required' });
    }

    const { data, error } = await supabase
      .from('project_investment_phases')
      .insert([{
        project_id: projectId,
        phase_number: phase_number || 1,
        title,
        description: description || '',
        target_amount: Number(target_amount),
        current_amount: 0,
        status: status || 'Upcoming',
        target_date: target_date || null
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Update a phase (Entrepreneur only)
router.put('/:id/phases/:phaseId', requireAuth, async (req, res, next) => {
  try {
    const { id: projectId, phaseId } = req.params;

    // Verify ownership
    const { data: project, error: pErr } = await supabase
      .from('projects')
      .select('entrepreneur_id')
      .eq('id', projectId)
      .single();

    if (pErr || !project) return res.status(404).json({ error: 'Project not found' });
    if (project.entrepreneur_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Only the project owner can update phases' });
    }

    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.target_amount !== undefined) updates.target_amount = Number(req.body.target_amount);
    if (req.body.current_amount !== undefined) updates.current_amount = Number(req.body.current_amount);
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.phase_number !== undefined) updates.phase_number = Number(req.body.phase_number);
    if (req.body.target_date !== undefined) updates.target_date = req.body.target_date;
    if (req.body.evidence_url !== undefined) updates.evidence_url = req.body.evidence_url;
    if (req.body.evidence_name !== undefined) updates.evidence_name = req.body.evidence_name;
    if (req.body.evidence_submitted_at !== undefined) updates.evidence_submitted_at = req.body.evidence_submitted_at;

    const { data, error } = await supabase
      .from('project_investment_phases')
      .update(updates)
      .eq('id', phaseId)
      .eq('project_id', projectId)
      .select()
      .single();

    if (error) throw error;

    // If phase completion report parameters are provided, post an evidence report
    if (req.body.create_evidence_report && req.body.evidence_url) {
      try {
        const reportTitle = req.body.report_title || `Phase ${data.phase_number} Completion Evidence: ${data.title}`;
        const reportSummary = req.body.report_summary || `Entrepreneur submitted phase completion evidence file (${req.body.evidence_name || 'Deliverable ZIP archive'}).`;
        
        await saveReportForProject(projectId, req.user.id, {
          title: reportTitle,
          summary: reportSummary,
          key_achievements: req.body.key_achievements || `Completed Phase ${data.phase_number} deliverables.`,
          next_steps: req.body.next_steps || 'Proceeding to next phase.',
          phase_id: phaseId,
          report_type: 'Achievements',
          attachment_url: req.body.evidence_url
        });
      } catch (repErr) {
        console.warn('Auto-create evidence report error:', repErr.message);
      }
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete a phase (Entrepreneur only)
router.delete('/:id/phases/:phaseId', requireAuth, async (req, res, next) => {
  try {
    const { id: projectId, phaseId } = req.params;

    // Verify ownership
    const { data: project, error: pErr } = await supabase
      .from('projects')
      .select('entrepreneur_id')
      .eq('id', projectId)
      .single();

    if (pErr || !project) return res.status(404).json({ error: 'Project not found' });
    if (project.entrepreneur_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Only the project owner can delete phases' });
    }

    const { error } = await supabase
      .from('project_investment_phases')
      .delete()
      .eq('id', phaseId)
      .eq('project_id', projectId);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get reports for a project
router.get('/:id/reports', requireAuth, async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const reports = await getReportsForProject(projectId);
    res.json(reports);
  } catch (error) {
    next(error);
  }
});

// Create a progress report for a project (Entrepreneur only)
router.post('/:id/reports', requireAuth, async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { title, summary, key_achievements, next_steps, phase_id, report_type, attachment_url, progress_percentage } = req.body;

    if (!title || !summary) {
      return res.status(400).json({ error: 'Report title and summary are required' });
    }

    // Check ownership
    const { data: project, error: pErr } = await supabase
      .from('projects')
      .select('entrepreneur_id')
      .eq('id', projectId)
      .single();

    if (pErr || !project) return res.status(404).json({ error: 'Project not found' });
    if (project.entrepreneur_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Only the project owner can post reports' });
    }

    // Optionally update project progress percentage if passed
    if (progress_percentage !== undefined && progress_percentage !== null) {
      const val = Math.min(100, Math.max(0, parseInt(progress_percentage) || 0));
      try {
        await supabase
          .from('projects')
          .update({ progress_percentage: val, current_progress: `${val}%` })
          .eq('id', projectId);
      } catch (progErr) {
        console.warn('Progress percentage update warning:', progErr.message);
      }
    }

    const report = await saveReportForProject(projectId, req.user.id, {
      title,
      summary,
      key_achievements: key_achievements || null,
      next_steps,
      phase_id,
      report_type: report_type || 'Progress',
      attachment_url
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
});

// Delete a report (Entrepreneur only)
router.delete('/:id/reports/:reportId', requireAuth, async (req, res, next) => {
  try {
    const { id: projectId, reportId } = req.params;

    // Verify ownership
    const { data: project, error: pErr } = await supabase
      .from('projects')
      .select('entrepreneur_id')
      .eq('id', projectId)
      .single();

    if (pErr || !project) return res.status(404).json({ error: 'Project not found' });
    if (project.entrepreneur_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Only the project owner can delete reports' });
    }

    await deleteReportById(reportId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
