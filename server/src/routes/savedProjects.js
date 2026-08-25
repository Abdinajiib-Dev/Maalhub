import express from 'express';
import { supabase } from '../db/supabase.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all saved projects for the authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('saved_projects')
      .select(`
        id,
        project_id,
        created_at,
        project:projects(*)
      `)
      .eq('investor_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save a project
router.post('/', requireAuth, async (req, res) => {
  try {
    const { project_id } = req.body;
    
    if (!project_id) {
      return res.status(400).json({ error: 'project_id is required' });
    }

    const { data, error } = await supabase
      .from('saved_projects')
      .insert([{ investor_id: req.user.id, project_id }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Project is already saved' });
      }
      throw error;
    }
    
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Unsave a project
router.delete('/:projectId', requireAuth, async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const { error } = await supabase
      .from('saved_projects')
      .delete()
      .eq('investor_id', req.user.id)
      .eq('project_id', projectId);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
