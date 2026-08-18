import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        setProfile(data);
        return;
      }
    } catch (err) {
      console.warn('Supabase profile fetch error:', err);
    }

    // Check local profile fallback
    const localProfileRaw = localStorage.getItem('maalhub_local_profile');
    if (localProfileRaw) {
      try {
        setProfile(JSON.parse(localProfileRaw));
      } catch (e) {
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadLocalAuthSession = () => {
      const localSessionRaw = localStorage.getItem('maalhub_local_session');
      if (localSessionRaw) {
        try {
          const localSession = JSON.parse(localSessionRaw);
          if (localSession?.user) {
            setUser(localSession.user);
            const localProfileRaw = localStorage.getItem('maalhub_local_profile');
            if (localProfileRaw) {
              setProfile(JSON.parse(localProfileRaw));
            } else {
              setProfile({
                id: localSession.user.id,
                email: localSession.user.email,
                full_name: localSession.user.user_metadata?.full_name || 'Sumaya Anwar',
                role: 'entrepreneur',
                city: 'Mogadishu',
                country: 'Somalia'
              });
            }
            setLoading(false);
            return true;
          }
        } catch (err) {
          console.error("Local session parse error:", err);
        }
      }
      return false;
    };

    // Check active sessions and sets the user
    const fetchSession = async () => {
      let supabaseSessionFound = false;
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
          supabaseSessionFound = true;
        }
      } catch (err) {
        console.warn("Supabase getSession failed, trying local fallback.");
      }

      if (!supabaseSessionFound) {
        loadLocalAuthSession();
      }
      setLoading(false);
    };
    
    fetchSession();

    // Listen for custom local auth state changes
    const handleCustomAuthChange = () => {
      if (!loadLocalAuthSession()) {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    window.addEventListener('maalhub_auth_change', handleCustomAuthChange);

    // Listen for changes on Supabase auth state
    let subscription = null;
    try {
      const res = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          loadLocalAuthSession();
        }
      });
      subscription = res?.data?.subscription;
    } catch (e) {
      console.warn("Supabase onAuthStateChange setup skipped");
    }

    return () => {
      window.removeEventListener('maalhub_auth_change', handleCustomAuthChange);
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore network errors on signout
    }
    localStorage.removeItem('maalhub_local_session');
    localStorage.removeItem('maalhub_local_profile');
    setUser(null);
    setProfile(null);
    window.dispatchEvent(new Event('maalhub_auth_change'));
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
