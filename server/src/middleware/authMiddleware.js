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
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Auth error:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // 3. Attach user object to the request
    req.user = user;
    
    // 4. Continue to the next middleware/route handler
    next();
  } catch (err) {
    console.error('Middleware error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
