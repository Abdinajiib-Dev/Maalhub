import { supabase } from '../db/supabase.js';

export const requireAuth = async (req, res, next) => {
  try {
    // 1. Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];



    // 2. Verify the token using Supabase
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = user;
        return next();
      }
    } catch (sErr) {
      console.error('Supabase token verification error:', sErr);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  } catch (err) {
    console.error('Middleware error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
