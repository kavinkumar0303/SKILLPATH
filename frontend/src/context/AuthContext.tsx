import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { supabaseService } from '../lib/supabaseService';
import { MOCK_USER } from '../api/mockData';

export interface User {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  education_level?: string;
  branch?: string;
  target_role?: string;
  is_new?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: (credential?: string) => Promise<User>;
  loginWithDemo: () => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (fields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Initial session check (Supabase + localStorage fallback)
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            const profile = await supabaseService.getProfile(session.user.id);
            const userObj: User = {
              id: session.user.id,
              name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Learner',
              email: session.user.email || '',
              avatar: profile?.avatar || session.user.user_metadata?.avatar_url,
              bio: profile?.bio,
              phone: profile?.phone,
              location: profile?.location,
              linkedin: profile?.linkedin,
              github: profile?.github,
              education_level: profile?.education_level || 'B.Tech',
              branch: profile?.branch || 'Computer Science',
              target_role: profile?.target_role || 'role_fullstack',
            };
            setUser(userObj);
            localStorage.setItem('sb-user', JSON.stringify(userObj));
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase session lookup error:', e);
        }
      }

      // Fallback to local storage
      const cached = localStorage.getItem('sb-user');
      if (cached && mounted) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          setUser(null);
        }
      }
      if (mounted) setLoading(false);
    }

    checkSession();

    // Listen to Supabase auth state changes
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user && mounted) {
          const profile = await supabaseService.getProfile(session.user.id);
          const userObj: User = {
            id: session.user.id,
            name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Learner',
            email: session.user.email || '',
            avatar: profile?.avatar || session.user.user_metadata?.avatar_url,
            bio: profile?.bio,
            phone: profile?.phone,
            location: profile?.location,
            linkedin: profile?.linkedin,
            github: profile?.github,
            education_level: profile?.education_level || 'B.Tech',
            branch: profile?.branch || 'Computer Science',
            target_role: profile?.target_role || 'role_fullstack',
          };
          setUser(userObj);
          localStorage.setItem('sb-user', JSON.stringify(userObj));
        } else if (event === 'SIGNED_OUT' && mounted) {
          setUser(null);
          localStorage.removeItem('sb-user');
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const loginWithGoogle = async (credential?: string): Promise<User> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        if (credential) {
          // Sign in using Supabase IdP token exchange
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: credential,
          });
          if (error) {
            console.warn('Supabase signInWithIdToken warning:', error);
          } else if (data.user) {
            const profile = await supabaseService.getProfile(data.user.id);
            const userObj: User = {
              id: data.user.id,
              name: profile?.name || data.user.user_metadata?.full_name || 'Learner',
              email: data.user.email || '',
              avatar: profile?.avatar || data.user.user_metadata?.avatar_url,
              is_new: false,
            };
            setUser(userObj);
            localStorage.setItem('sb-user', JSON.stringify(userObj));
            return userObj;
          }
        } else {
          // Standard OAuth popup or redirect flow
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/dashboard`,
            },
          });
        }
      }

      // Client-side fallback if offline or testing
      const demoUser = { ...MOCK_USER, is_new: false };
      setUser(demoUser);
      localStorage.setItem('sb-user', JSON.stringify(demoUser));
      return demoUser;
    } catch {
      const demoUser = { ...MOCK_USER, is_new: false };
      setUser(demoUser);
      localStorage.setItem('sb-user', JSON.stringify(demoUser));
      return demoUser;
    } finally {
      setLoading(false);
    }
  };

  const loginWithDemo = async (): Promise<User> => {
    setLoading(true);
    try {
      const demoUser: User = { ...MOCK_USER, is_new: false };
      setUser(demoUser);
      localStorage.setItem('sb-user', JSON.stringify(demoUser));
      return demoUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase logout error:', e);
    } finally {
      setUser(null);
      localStorage.removeItem('sb-user');
      window.location.href = '/';
    }
  };

  const updateUser = (fields: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...fields };
      setUser(updated);
      localStorage.setItem('sb-user', JSON.stringify(updated));

      if (isSupabaseConfigured && typeof user.id === 'string') {
        supabaseService.upsertProfile({
          id: user.id,
          name: updated.name,
          email: updated.email,
          bio: updated.bio,
          phone: updated.phone,
          location: updated.location,
          linkedin: updated.linkedin,
          github: updated.github,
          education_level: updated.education_level,
          branch: updated.branch,
          target_role: updated.target_role,
        }).catch((err) => console.warn('Supabase async profile sync warning:', err));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithDemo, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
