import { supabase } from '../db/supabase.js';

export const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: 'Forbidden: User profile not found' });
    }

    const role = (profile.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: Super Admin or Admin role required' });
    }

    req.user = user;
    req.adminProfile = profile;
    next();
  } catch (err) {
    console.error('Admin Auth Middleware error:', err);
    return res.status(500).json({ error: 'Internal server error during authorization' });
  }
};
