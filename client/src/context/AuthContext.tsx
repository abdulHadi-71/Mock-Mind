'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '@/lib/auth';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializedRef = useRef(false);

  const refreshUser = useCallback(async () => {
    try {
      if (!api.getAccessToken()) {
        const refreshed = await authApi.refreshAccessToken();
        if (!refreshed) {
          setUser(null);
          return;
        }
      }

      const profile = await authApi.getCurrentUser();
      setUser(profile);
    } catch {
      setUser(null);
      api.setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    authApi.initAuthFromStorage();
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login(email, password);
      setUser(result.user);
      router.replace('/dashboard');
    },
    [router]
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const result = await authApi.register(email, password, name);
      setUser(result.user);
      router.replace('/dashboard');
    },
    [router]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    router.replace('/login');
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
