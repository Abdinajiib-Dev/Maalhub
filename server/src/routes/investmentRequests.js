import express from 'express';
import { supabase } from '../db/supabase.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get investment requests involving the authenticated user from real database
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('investment_requests')
      .select(`
        *,
        investor:profiles!investment_requests_investor_id_fkey(full_name, role),
        entrepreneur:profiles!investment_requests_entrepreneur_id_fkey(full_name, role),
        project:projects(project_name, business_name, status)
      `)
      .or(`investor_id.eq.${userId},entrepreneur_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.warn("Investment requests fetch warning:", error.message);
    res.json([]);
  }
});

// Create an investment request
router.post('/', requireAuth, async (req, res) => {
  try {
    const { project_id, proposed_amount, message } = req.body;
    const investor_id = req.user.id;

    // We need to fetch the entrepreneur_id from the project
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

    const { data, error } = await supabase
      .from('investment_requests')
      .insert([{
        investor_id,
        entrepreneur_id: project.entrepreneur_id,
        project_id,
        proposed_amount,
        message,
        status: 'Pending'
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
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
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
