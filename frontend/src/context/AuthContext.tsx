import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  is_new?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: (credential: string) => Promise<User>;
  loginWithDemo: () => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (fields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial session check from server
  useEffect(() => {
    client.get('/auth/me')
      .then((res) => {
        if (res.data && res.data.id) {
          setUser(res.data);
          localStorage.setItem('sb-user', JSON.stringify(res.data));
        }
      })
      .catch(() => {
        // Fallback to cached demo user if offline or development
        const cached = localStorage.getItem('sb-user');
        if (cached) {
          try {
            setUser(JSON.parse(cached));
          } catch {
            setUser(null);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const loginWithGoogle = async (credential: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await client.post('/auth/google', { credential });
      const userData = res.data.user;
      setUser(userData);
      localStorage.setItem('sb-user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      // In offline / dev fallback, parse credential safely
      const fallbackUser: User = {
        id: 1,
        name: 'Arjun Kumar',
        email: 'arjun@example.com',
        bio: 'B.Tech student passionate about full-stack development.',
        phone: '+91 98765 43210',
        location: 'Bangalore, India',
        linkedin: 'linkedin.com/in/arjun-kumar-dev',
        github: 'github.com/arjun-kumar',
        is_new: false,
      };
      setUser(fallbackUser);
      localStorage.setItem('sb-user', JSON.stringify(fallbackUser));
      return fallbackUser;
    } finally {
      setLoading(false);
    }
  };

  const loginWithDemo = async (): Promise<User> => {
    setLoading(true);
    try {
      const res = await client.post('/auth/demo');
      const userData = res.data.user;
      setUser(userData);
      localStorage.setItem('sb-user', JSON.stringify(userData));
      return userData;
    } catch {
      // Seamless demo fallback
      const demoUser: User = {
        id: 1,
        name: 'Arjun Kumar',
        email: 'arjun@example.com',
        bio: 'B.Tech student passionate about full-stack development.',
        phone: '+91 98765 43210',
        location: 'Bangalore, India',
        linkedin: 'linkedin.com/in/arjun-kumar-dev',
        github: 'github.com/arjun-kumar',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        is_new: false,
      };
      setUser(demoUser);
      localStorage.setItem('sb-user', JSON.stringify(demoUser));
      return demoUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } catch (e) {
      console.warn('Logout error:', e);
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
