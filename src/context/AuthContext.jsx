import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Helper to normalize role to match backend expectations (head_authority, citizen)
const normalizeRole = (role) => {
  if (!role) return 'citizen';
  
  const r = role.toLowerCase().replace(/[-_ ]/g, '').trim();
  if (r === 'headauthority' || r === 'authorityhead' || r === 'admin') return 'head_authority';
  return 'citizen';
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // Check active sessions and sets the user
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // 1. Get data from session metadata immediately (FAST)
          const roleFromMetadata = normalizeRole(session.user.user_metadata?.role || 'citizen');
          const initialUser = {
            ...session.user,
            role: roleFromMetadata,
            ...(session.user.user_metadata || {}),
          };
          
          setUser(initialUser);
          setLoading(false); // Stop showing loading screen immediately
          
          // 2. Background fetch to get the most accurate role/department from DB
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data: profile, error: profileError }) => {
              if (profile && !profileError) {
                const normalizedProfileRole = normalizeRole(profile.role);
                setUser(prev => ({ 
                  ...prev,
                  ...profile, 
                  role: normalizedProfileRole 
                }));
              }
            });
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('AuthContext: Error checking user:', err);
        setLoading(false);
      }
    };

    checkUser();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        // Optimistic update from session
        const roleFromMetadata = normalizeRole(session.user.user_metadata?.role || 'citizen');
        const initialUser = {
          ...session.user,
          role: roleFromMetadata,
          ...(session.user.user_metadata || {}),
        };
        setUser(initialUser);
        setLoading(false);

        // Background profile fetch
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (profile) {
              const normalizedProfileRole = normalizeRole(profile.role);
              setUser(prev => ({ 
                ...prev,
                ...profile, 
                role: normalizedProfileRole 
              }));
            }
          });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password, name, role = 'Citizen') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold">Initializing CivicLens...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
