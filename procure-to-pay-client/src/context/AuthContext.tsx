import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import type { Role } from '../types';
import { api } from '../api/client';

interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  department?: string;
  role: Role;
  dateJoined?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  initializing: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'smartp2p_token';
const USER_KEY = 'smartp2p_user';

const normalizeUser = (payload: any): AuthUser => ({
  id: payload.id,
  username: payload.username,
  fullName: payload.full_name || payload.username,
  email: payload.email,
  department: payload.department,
  role: payload.role,
  dateJoined: payload.date_joined,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const queryClient = useQueryClient();

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    queryClient.clear();
  }, [queryClient]);

  const refreshProfile = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      return null;
    }
    try {
      const res = await api.get('/auth/me/');
      const normalized = normalizeUser(res.data);
      setUser(normalized);
      localStorage.setItem(USER_KEY, JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        clearSession();
      }
      throw error;
    }
  }, [clearSession]);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedToken) {
      setInitializing(false);
      return;
    }
    setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    refreshProfile()
      .catch(() => {
        // refreshProfile clears the session on unauthorized responses.
      })
      .finally(() => setInitializing(false));
  }, [refreshProfile]);

  const login = useCallback(async ({ email, password }: LoginPayload) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login/', { email, password });
      const normalized = normalizeUser(res.data.user);
      setToken(res.data.token);
      setUser(normalized);
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(normalized));
      return normalized;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout/');
    } catch {
      // Ignore network errors on logout; session will still be cleared locally.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, initializing, login, logout, refreshProfile }),
    [user, token, loading, initializing, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
