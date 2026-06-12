import { create } from 'zustand';
import { getItem, setItem, deleteItem } from '../utils/storage';
import { authApi } from '../services/endpoints';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: { first_name: string; last_name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login({ email, password });
      const result = data.data!;
      await setItem('access_token', result.access_token);
      await setItem('refresh_token', result.refresh_token);
      set({ user: result.user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: res } = await authApi.register(data);
      const result = res.data!;
      await setItem('access_token', result.access_token);
      await setItem('refresh_token', result.refresh_token);
      set({ user: result.user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      const refreshToken = await getItem('refresh_token');
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {} finally {
      await deleteItem('access_token');
      await deleteItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  loadUser: async () => {
    try {
      const token = await getItem('access_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const { data } = await authApi.getProfile();
      set({ user: data.data!, isAuthenticated: true, isLoading: false });
    } catch {
      await deleteItem('access_token');
      await deleteItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
