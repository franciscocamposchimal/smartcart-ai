import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check stored token
    const storedToken = localStorage.getItem('smartcart_token');
    if (storedToken) {
      setToken(storedToken);
      api.setToken(storedToken);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          // When coming back from a Google OAuth redirect there is no backend
          // JWT yet – exchange the Supabase access token for one.
          if (event === 'SIGNED_IN' && !localStorage.getItem('smartcart_token')) {
            try {
              const data = await api.post<{ success: boolean; data: { accessToken: string; user: User } }>(
                '/auth/exchange-token',
                { supabaseToken: session.access_token },
              );
              const backendToken = data.data.accessToken;
              setToken(backendToken);
              localStorage.setItem('smartcart_token', backendToken);
              api.setToken(backendToken);
            } catch {
              // non-fatal: user will need to log in again
            }
          }
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem('smartcart_token');
        }
        setLoading(false);
      },
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ success: boolean; data: { accessToken: string; user: User } }>('/auth/login', { email, password });
    setToken(data.data.accessToken);
    setUser(data.data.user);
    localStorage.setItem('smartcart_token', data.data.accessToken);
    api.setToken(data.data.accessToken);
  };

  const register = async (email: string, password: string, fullName?: string) => {
    const data = await api.post<{ success: boolean; data: { accessToken: string; user: User } }>('/auth/register', { email, password, fullName });
    setToken(data.data.accessToken);
    setUser(data.data.user);
    localStorage.setItem('smartcart_token', data.data.accessToken);
    api.setToken(data.data.accessToken);
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartcart_token');
    api.setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
