'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/user';
import { api } from './api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Validate session on mount
  useEffect(() => {
    async function checkSession() {
      const { data, status } = await api.get<{ user: User }>('/auth/me');
      if (data?.user && data.user.platformAdmin) {
        setUser(data.user);
      } else {
        // Clear invalid session
        await fetch('/api/auth/session', { method: 'DELETE' });
      }
      setIsLoading(false);
    }
    checkSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await api.post<{ user: User; session: { token: string; expiresAt: string } }>(
      '/auth/signin',
      { email, password }
    );

    if (error || !data) {
      return { error: error || 'Login failed' };
    }

    // Check platformAdmin
    if (!data.user.platformAdmin) {
      // Sign out the non-admin session
      await api.post('/auth/signout');
      return { error: 'Access restricted to platform administrators' };
    }

    // Set session cookie via API route
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: data.session.token, expiresAt: data.session.expiresAt }),
    });

    setUser(data.user);
    router.push('/');
    return { error: null };
  }, [router]);

  const logout = useCallback(async () => {
    await api.post('/auth/signout');
    await fetch('/api/auth/session', { method: 'DELETE' });
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
