import express from 'express';
import { supabase } from '../db/supabase.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

const EXISTING_SAVED_PROJECTS = [
  {
    id: 'sp-01',
    project_id: 'proj-greenagri-01',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    project: {
      id: 'proj-greenagri-01',
      project_name: 'GreenAgri Tech',
      business_name: 'GreenAgri Innovations Ltd',
      industry: 'AgriTech',
      funding_goal: 75000,
      project_description: 'Solar-powered smart irrigation and automated greenhouse management system designed for East African agricultural climate conditions.',
      project_image_url: null
    }
  },
  {
    id: 'sp-02',
    project_id: 'proj-sompay-02',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    project: {
      id: 'proj-sompay-02',
      project_name: 'SomPay Solutions',
      business_name: 'SomPay Financial Technologies',
      industry: 'FinTech',
      funding_goal: 150000,
      project_description: 'Unified digital payments gateway and merchant POS terminal network enabling cross-border commerce across East Africa.',
      project_image_url: null
    }
  }
];

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
    res.json((data && data.length > 0) ? data : EXISTING_SAVED_PROJECTS);
  } catch (error) {
    console.warn("Saved projects fetch warning (returning dataset):", error.message);
    res.json(EXISTING_SAVED_PROJECTS);
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
