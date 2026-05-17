import { api } from './api';
import type { ApiResponse, User } from '@/types';

export interface AuthResult {
  user: User;
  accessToken: string;
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  const res = await api.post<ApiResponse<AuthResult>>(
    '/auth/register',
    { email, password, name },
    { skipAuth: true }
  );
  api.setAccessToken(res.data.accessToken);
  return res.data;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const res = await api.post<ApiResponse<AuthResult>>(
    '/auth/login',
    { email, password },
    { skipAuth: true }
  );
  api.setAccessToken(res.data.accessToken);
  return res.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    api.setAccessToken(null);
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', undefined, {
      skipAuth: true,
    });
    api.setAccessToken(res.data.accessToken);
    return res.data.accessToken;
  } catch {
    api.setAccessToken(null);
    return null;
  }
}

export async function getCurrentUser(): Promise<User> {
  const res = await api.get<ApiResponse<User>>('/auth/me');
  return res.data;
}

export function initAuthFromStorage(): void {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('accessToken');
    if (token) api.setAccessToken(token);
  }
}
