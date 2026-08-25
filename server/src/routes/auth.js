import express from 'express';
import { supabase } from '../db/supabase.js';

const router = express.Router();

// Basic registration route (Profile creation handled here after Supabase Auth registers user)
router.post('/register', async (req, res) => {
  const { id, email, full_name, date_of_birth, city, country, role } = req.body;
  
  try {
    // 1. Create base profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        { id, email, full_name, date_of_birth, city, country, role }
      ])
      .select()
      .single();

    if (profileError) throw profileError;

    // 2. Create role-specific profile based on role
    if (role === 'entrepreneur') {
      const { startup_company_name, industry, startup_stage, funding_goal } = req.body;
      const { error: entError } = await supabase
        .from('entrepreneur_profiles')
        .insert([
          { user_id: id, startup_company_name, industry, startup_stage, funding_goal }
        ]);
      if (entError) throw entError;
    } else if (role === 'investor') {
      const { investor_type, minimum_investment, maximum_investment, target_industries, preferred_stages } = req.body;
      const { data: invProfile, error: invError } = await supabase
        .from('investor_profiles')
        .insert([
          { user_id: id, investor_type, minimum_investment, maximum_investment }
        ])
        .select()
        .single();
        
      if (invError) throw invError;

      // Insert industries
      if (target_industries && target_industries.length > 0) {
        const indData = target_industries.map(ind => ({ investor_id: invProfile.id, industry: ind }));
        await supabase.from('investor_industries').insert(indData);
      }

      // Insert stages
      if (preferred_stages && preferred_stages.length > 0) {
        const stageData = preferred_stages.map(stage => ({ investor_id: invProfile.id, stage }));
        await supabase.from('investor_stages').insert(stageData);
      }
    }

    res.status(201).json({ message: 'Profile created successfully', profile });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Route to get current user profile
router.get('/me/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && profile) {
      let roleDetails = null;
      if (profile.role === 'entrepreneur') {
         const { data } = await supabase.from('entrepreneur_profiles').select('*').eq('user_id', id).single();
         roleDetails = data;
      } else if (profile.role === 'investor') {
         const { data } = await supabase.from('investor_profiles').select('*').eq('user_id', id).single();
         roleDetails = data;
      }
      return res.status(200).json({ profile, roleDetails });
    }
  } catch (error) {
    // Ignore Supabase connection error and fallback below
  }

  // Local fallback profile for development testing
  const fallbackProfile = {
    id: id,
    email: id === 'test-user-sumaya-932' ? 'sumayaanwar932@gmail.com' : 'user@example.com',
    full_name: id === 'test-user-sumaya-932' ? 'Sumaya Anwar' : 'Test User',
    role: 'entrepreneur',
    city: 'Mogadishu',
    country: 'Somalia',
    created_at: new Date().toISOString()
  };

  const fallbackRoleDetails = {
    user_id: id,
    startup_company_name: 'MaalHub Innovation',
    industry: 'FinTech',
    startup_stage: 'Seed',
    funding_goal: 50000
  };

  res.status(200).json({ profile: fallbackProfile, roleDetails: fallbackRoleDetails });
});
// Route to update user profile
router.put('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { full_name, city, country, profile_photo_url } = req.body;

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({ full_name, city, country, profile_photo_url })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
