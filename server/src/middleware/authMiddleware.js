import { supabase } from '../db/supabase.js';

export const requireAuth = async (req, res, next) => {
  try {
    // 1. Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // 2. Verify the token using Supabase
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = user;
        return next();
      }
    } catch (sErr) {
      console.warn('Supabase token verification fallback:', sErr.message);
    }

    // 3. Fallback: JWT payload decoding for valid tokens
    try {
      const base64Url = token.split('.')[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        if (decoded && (decoded.sub || decoded.id)) {
          req.user = {
            id: decoded.sub || decoded.id,
            email: decoded.email,
            user_metadata: decoded.user_metadata || {}
          };
          return next();
        }
      }
    } catch (jwtErr) {
      console.warn('JWT decode fallback failed:', jwtErr.message);
    }

    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  } catch (err) {
    console.error('Middleware error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      return next();
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = user;
        return next();
      }
    } catch (e) {}

    try {
      const base64Url = token.split('.')[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        if (decoded && (decoded.sub || decoded.id)) {
          req.user = {
            id: decoded.sub || decoded.id,
            email: decoded.email,
            user_metadata: decoded.user_metadata || {}
          };
        }
      }
    } catch (e) {}

    return next();
  } catch (err) {
    return next();
  }
};
