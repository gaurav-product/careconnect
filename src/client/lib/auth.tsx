import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';

export interface SessionUser {
  id: string;
  name: string;
  phone: string;
  role: 'family' | 'attendant';
  lang: 'en' | 'hi';
}

interface AuthValue {
  user: SessionUser | null;
  loading: boolean;
  setUser: (u: SessionUser | null) => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthValue>({
  user: null,
  loading: true,
  setUser: () => {},
  refresh: async () => {},
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.get<{ user: SessionUser | null }>('/auth/me');
      setUser(user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    setUser(null);
  }, []);

  return <AuthCtx.Provider value={{ user, loading, setUser, refresh, signOut }}>{children}</AuthCtx.Provider>;
}
