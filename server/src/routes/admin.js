import express from 'express';
import { supabase } from '../db/supabase.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Apply requireAdmin middleware to all admin endpoints
router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Platform overview metrics
 */
router.get('/stats', async (req, res) => {
  try {
    const [profilesRes, projectsRes, requestsRes] = await Promise.all([
      supabase.from('profiles').select('id, role, created_at'),
      supabase.from('projects').select('id, status, funding_goal, created_at'),
      supabase.from('investment_requests').select('id, status, proposed_amount, created_at')
    ]);

    const profiles = profilesRes.data || [];
    const projects = projectsRes.data || [];
    const requests = requestsRes.data || [];

    const stats = {
      totalUsers: profiles.length,
      entrepreneurs: profiles.filter(p => (p.role || '').toLowerCase() === 'entrepreneur').length,
      investors: profiles.filter(p => (p.role || '').toLowerCase() === 'investor').length,
      admins: profiles.filter(p => ['admin', 'super_admin'].includes((p.role || '').toLowerCase())).length,
      
      totalProjects: projects.length,
      publishedProjects: projects.filter(p => p.status === 'Published').length,
      draftProjects: projects.filter(p => p.status === 'Draft').length,
      pendingProjects: projects.filter(p => p.status === 'Pending').length,
      
      totalRequests: requests.length,
      acceptedRequests: requests.filter(r => r.status === 'Accepted').length,
      totalProposedCapital: requests.reduce((sum, r) => sum + Number(r.proposed_amount || 0), 0),
      totalAcceptedCapital: requests
        .filter(r => r.status === 'Accepted')
        .reduce((sum, r) => sum + Number(r.proposed_amount || 0), 0)
    };

    res.status(200).json(stats);
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch admin stats' });
  }
});

/**
 * GET /api/admin/users
 * List all registered profiles
 */
router.get('/users', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(users || []);
  } catch (err) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch users' });
  }
});

/**
 * PATCH /api/admin/users/:id/role
 * Update user role
 */
router.patch('/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['entrepreneur', 'investor', 'admin', 'super_admin'];
  if (!role || !validRoles.includes(role.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: role.toLowerCase() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: 'User role updated successfully', profile: data });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: err.message || 'Failed to update user role' });
  }
});

/**
 * PATCH /api/admin/users/:id/verification
 * Update user identity verification status (pending, verified, rejected)
 */
router.patch('/users/:id/verification', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'verified', 'rejected'];
  if (!status || !validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid verification status specified' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ verification_status: status.toLowerCase() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: 'Verification status updated successfully', profile: data });
  } catch (err) {
    console.error('Error updating verification status:', err);
    res.status(500).json({ error: err.message || 'Failed to update verification status' });
  }
});


/**
 * DELETE /api/admin/users/:id
 * Delete user profile
 */
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'User profile deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: err.message || 'Failed to delete user' });
  }
});

/**
 * GET /api/admin/projects
 * List all projects across the platform
 */
router.get('/projects', async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles!entrepreneur_id ( full_name, email )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(projects || []);
  } catch (err) {
    console.error('Error fetching admin projects:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch projects' });
  }
});

/**
 * PATCH /api/admin/projects/:id/status
 * Update project status (Published, Draft, Rejected, etc.)
 */
router.patch('/projects/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: 'Project status updated successfully', project: data });
  } catch (err) {
    console.error('Error updating project status:', err);
    res.status(500).json({ error: err.message || 'Failed to update project status' });
  }
});

/**
 * DELETE /api/admin/projects/:id
 * Delete project
 */
router.delete('/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: err.message || 'Failed to delete project' });
  }
});

export default router;
