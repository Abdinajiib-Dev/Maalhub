import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { API_URL } from '../lib/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId, userMetadata = null) => {
    try {
      // 1. First attempt to fetch from backend Express API (which joins roleDetails and target_industries)
      try {
        const response = await fetch(`${API_URL}/auth/me/${userId}`);
        if (response.ok) {
          const resJson = await response.json();
          if (resJson?.profile) {
            const targetIndustries = resJson.roleDetails?.target_industries || userMetadata?.target_industries || [];
            setProfile({
              ...resJson.profile,
              roleDetails: resJson.roleDetails,
              target_industries: targetIndustries
            });
            return;
          }
        }
      } catch (apiErr) {
        console.warn('Backend API profile fetch fallback:', apiErr.message);
      }

      // 2. Fallback to direct Supabase query
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        let targetIndustries = userMetadata?.target_industries || [];
        if (data.role === 'investor' && targetIndustries.length === 0) {
          try {
            const { data: invProfile } = await supabase
              .from('investor_profiles')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();

            if (invProfile?.id) {
              const { data: indData } = await supabase
                .from('investor_industries')
                .select('industry')
                .eq('investor_id', invProfile.id);
              if (indData && indData.length > 0) {
                targetIndustries = indData.map(i => i.industry);
              }
            }
          } catch (e) {}
        }

        setProfile({
          ...data,
          target_industries: targetIndustries
        });
        return;
      }
    } catch (err) {
      console.warn('Profile fetch error:', err);
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.user_metadata);
        }
      } catch (err) {
        console.warn("Supabase getSession failed:", err);
      }
      setLoading(false);
    };
    
    fetchSession();

    // Listen for changes on Supabase auth state
    let subscription = null;
    try {
      const res = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.user_metadata);
        } else {
          setUser(null);
          setProfile(null);
        }
      });
      subscription = res?.data?.subscription;
    } catch (e) {
      console.warn("Supabase onAuthStateChange setup skipped");
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore network errors on signout
    }
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
