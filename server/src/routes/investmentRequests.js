import express from 'express';
import { supabase } from '../db/supabase.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get investment requests involving the authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Try fetching with phase join first
    try {
      const { data, error } = await supabase
        .from('investment_requests')
        .select(`
          *,
          investor:profiles!investment_requests_investor_id_fkey(full_name, role),
          entrepreneur:profiles!investment_requests_entrepreneur_id_fkey(full_name, role),
          project:projects(project_name, business_name, status),
          phase:project_investment_phases(id, phase_number, title, target_amount, current_amount, status)
        `)
        .or(`investor_id.eq.${userId},entrepreneur_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return res.json(data);
      }
    } catch (joinErr) {
      // Fallback if phase relation does not exist yet
    }

    // Fallback query without phase join
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('investment_requests')
      .select(`
        *,
        investor:profiles!investment_requests_investor_id_fkey(full_name, role),
        entrepreneur:profiles!investment_requests_entrepreneur_id_fkey(full_name, role),
        project:projects(project_name, business_name, status)
      `)
      .or(`investor_id.eq.${userId},entrepreneur_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (fallbackError) throw fallbackError;
    res.json(fallbackData || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create an investment request
router.post('/', requireAuth, async (req, res) => {
  try {
    const { project_id, proposed_amount, message, phase_id } = req.body;
    const investor_id = req.user.id;

    // Fetch the entrepreneur_id from the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('entrepreneur_id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.entrepreneur_id === investor_id) {
      return res.status(400).json({ error: 'You cannot invest in your own project' });
    }

    // If phase_id is provided, verify it belongs to this project
    let validPhaseId = null;
    if (phase_id) {
      try {
        const { data: phase } = await supabase
          .from('project_investment_phases')
          .select('id, project_id')
          .eq('id', phase_id)
          .single();

        if (phase && phase.project_id === project_id) {
          validPhaseId = phase.id;
        }
      } catch (pErr) {
        console.warn('Phase lookup error:', pErr.message);
      }
    }

    const insertPayload = {
      investor_id,
      entrepreneur_id: project.entrepreneur_id,
      project_id,
      proposed_amount,
      message,
      status: 'Pending'
    };

    if (validPhaseId) {
      insertPayload.phase_id = validPhaseId;
    }

    let result = null;
    try {
      const { data, error } = await supabase
        .from('investment_requests')
        .insert([insertPayload])
        .select()
        .single();

      if (error && validPhaseId && error.message?.includes('phase_id')) {
        // Fallback without phase_id if column does not exist yet
        delete insertPayload.phase_id;
        const retry = await supabase
          .from('investment_requests')
          .insert([insertPayload])
          .select()
          .single();
        if (retry.error) throw retry.error;
        result = retry.data;
      } else if (error) {
        throw error;
      } else {
        result = data;
      }
    } catch (insertErr) {
      throw insertErr;
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update investment request status (Accept/Reject by entrepreneur, or Withdraw by investor)
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;
    
    const validStatuses = ['Accepted', 'Rejected', 'Withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Fetch the request to check permissions
    const { data: request, error: fetchError } = await supabase
      .from('investment_requests')
      .select('*')
      .eq('id', requestId)
      .single();
      
    if (fetchError || !request) {
      return res.status(404).json({ error: 'Investment request not found' });
    }

    if (status === 'Withdrawn' && request.investor_id !== userId) {
      return res.status(403).json({ error: 'Only the investor can withdraw the request' });
    }

    if (['Accepted', 'Rejected'].includes(status) && request.entrepreneur_id !== userId) {
      return res.status(403).json({ error: 'Only the entrepreneur can accept or reject the request' });
    }

    const { data, error } = await supabase
      .from('investment_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    // If accepted and tied to a phase, update the phase progress
    if (status === 'Accepted' && request.phase_id) {
      try {
        const { data: phase } = await supabase
          .from('project_investment_phases')
          .select('*')
          .eq('id', request.phase_id)
          .single();

        if (phase) {
          const newCurrent = Number(phase.current_amount || 0) + Number(request.proposed_amount);
          const newPhaseStatus = newCurrent >= Number(phase.target_amount) 
            ? 'Funded' 
            : (phase.status === 'Upcoming' ? 'Active' : phase.status);

          await supabase
            .from('project_investment_phases')
            .update({
              current_amount: newCurrent,
              status: newPhaseStatus
            })
            .eq('id', request.phase_id);
        }
      } catch (phaseUpdateErr) {
        console.warn('Phase amount update warning:', phaseUpdateErr.message);
      }
    }

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
