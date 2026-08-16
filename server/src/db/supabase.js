import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder_key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ Warning: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server environment variables.');
}

// Use service role key in backend to bypass RLS when necessary (e.g. creating user profiles after auth)
export const supabase = createClient(supabaseUrl, supabaseKey);
