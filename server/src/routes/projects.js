import express from 'express';
import { z } from 'zod';
import { supabase } from '../db/supabase.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Validation Schemas
const projectSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    description: z.string().min(10, "Description must be at least 10 characters"),
    funding_goal: z.number().positive("Funding goal must be positive").optional(),
    status: z.enum(['Draft', 'Published', 'Funded']).optional(),
  }).passthrough() // Allow other fields to avoid breaking existing frontend
});

const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().min(10).optional(),
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

// Get all published projects (Public/Investor)
router.get('/', async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { from, to } = getPagination(page, limit);

    const { data, error, count } = await supabase
      .from('projects')
      .select(`
        *,
        entrepreneur:profiles!projects_entrepreneur_id_fkey(full_name, city, country, profile_photo_url)
      `, { count: 'exact' })
      .eq('status', 'Published')
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

// Get single project details
router.get('/:id', async (req, res, next) => {
  try {
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
    res.json(data);
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

    // Merge the auto-populated fields with the request body
    const projectData = { 
      ...req.body, 
      entrepreneur_id: req.user.id,
      business_name: entProfile.startup_company_name,
      industry: entProfile.industry,
      startup_stage: entProfile.startup_stage,
      location: `${profile.city}, ${profile.country}`
    };
    
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
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

    const { data, error } = await supabase
      .from('projects')
      .update(req.body)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
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

export default router;
