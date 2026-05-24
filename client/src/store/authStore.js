import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('harvox_token') || null,
  user: null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('harvox_token', data.token);
      set({ token: data.token, user: data.user, loading: false });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      set({ loading: false, error: msg });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('harvox_token', data.token);
      set({ token: data.token, user: data.user, loading: false });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      set({ loading: false, error: msg });
      throw error;
    }
  },

  loadUser: async () => {
    try {
      const { data } = await authAPI.me();
      set({ user: data.user });
    } catch (error) {
      localStorage.removeItem('harvox_token');
      set({ token: null, user: null });
    }
  },

  updateUser: (userData) => {
    set((state) => ({
      user: { ...state.user, ...userData },
    }));
  },

  logout: () => {
    localStorage.removeItem('harvox_token');
    set({ token: null, user: null });
  },

  clearError: () => set({ error: null }),
}));
