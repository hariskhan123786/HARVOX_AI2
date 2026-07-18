import { create } from 'zustand';
import { authAPI } from '../services/api';
import { supabase } from '../config/supabaseClient';

// Build a minimal user object from a Supabase auth user (fallback mode)
const buildUserFromSession = (sbUser, extra = {}) => ({
  _id: sbUser.id,
  id: sbUser.id,
  name: sbUser.user_metadata?.name || sbUser.email.split('@')[0],
  email: sbUser.email,
  avatar: sbUser.user_metadata?.avatar || '',
  bio: '',
  location: '',
  developerRole: 'Full Stack Developer',
  experienceLevel: 'Intermediate',
  skills: [],
  socialLinks: { github: '', twitter: '', linkedin: '', website: '' },
  role: extra.role || 'free',
  subscription: extra.subscription || 'free',
  usage: { chats: 0, codeGen: 0, files: 0, projects: 0 },
  createdAt: sbUser.created_at,
});

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('harvox_token') || null,
  user: null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });

    // ── 1. Try the Express/Railway backend first ────────────────────────────
    try {
      const { data } = await authAPI.login(credentials);
      if (!data?.token || !data?.user) {
        throw new Error('Backend returned an invalid authentication response');
      }
      localStorage.setItem('harvox_token', data.token);
      set({ token: data.token, user: data.user, loading: false });
      return data;
    } catch (backendErr) {
      // Network error or backend is down → fall through to Supabase direct auth
      const isNetworkOrServer =
        !backendErr.response ||
        backendErr.response.status === 404 ||
        backendErr.response.status >= 500;

      if (!isNetworkOrServer) {
        // 401 = wrong password — surface that immediately, don't fall through
        const msg = backendErr.response?.data?.message || 'Invalid email or password';
        set({ loading: false, error: msg });
        throw backendErr;
      }

      console.warn('[Auth] Backend unreachable — using Supabase direct auth');
    }

    // ── 2. Supabase direct auth fallback ────────────────────────────────────
    try {
      const { data: sbData, error: sbErr } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (sbErr) {
        const msg = sbErr.message || 'Invalid email or password';
        set({ loading: false, error: msg });
        throw new Error(msg);
      }

      const token = sbData.session.access_token;
      const user = buildUserFromSession(sbData.user);
      localStorage.setItem('harvox_token', token);
      set({ token, user, loading: false });
      return { token, user };
    } catch (sbError) {
      const msg = sbError.message || 'Login failed';
      set({ loading: false, error: msg });
      throw sbError;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });

    // ── 1. Try the Express/Railway backend first (creates all DB records) ───
    try {
      const { data } = await authAPI.register(userData);
      if (!data || typeof data !== 'object' || (!data.token && !data.user)) {
        throw new Error('Backend returned an invalid registration response');
      }
      if (data.token) {
        localStorage.setItem('harvox_token', data.token);
        set({ token: data.token, user: data.user, loading: false });
      } else {
        // No token = email confirmation required by backend
        set({ loading: false });
      }
      return data;
    } catch (backendErr) {
      const isNetworkOrServer =
        !backendErr.response ||
        backendErr.response.status === 404 ||
        backendErr.response.status >= 500;

      if (!isNetworkOrServer) {
        const msg = backendErr.response?.data?.message || 'Registration failed';
        set({ loading: false, error: msg });
        throw backendErr;
      }

      console.warn('[Auth] Backend unreachable — using Supabase direct signup');
    }

    // ── 2. Supabase direct signup fallback ──────────────────────────────────
    try {
      const { data: sbData, error: sbErr } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: { data: { name: userData.name } },
      });

      if (sbErr) {
        const msg = sbErr.message || 'Registration failed';
        set({ loading: false, error: msg });
        throw new Error(msg);
      }

      if (!sbData.session) {
        // Email confirmation pending
        set({ loading: false });
        return { token: '', user: null };
      }

      const token = sbData.session.access_token;
      const user = buildUserFromSession(sbData.user);
      localStorage.setItem('harvox_token', token);
      set({ token, user, loading: false });
      return { token, user };
    } catch (sbError) {
      const msg = sbError.message || 'Registration failed';
      set({ loading: false, error: msg });
      throw sbError;
    }
  },

  loadUser: async () => {
    try {
      const { data } = await authAPI.me();
      if (!data?.user) {
        throw new Error('Backend returned an invalid user response');
      }
      set({ user: data.user });
    } catch {
      // Backend unreachable — try to restore user from active Supabase session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const user = buildUserFromSession(session.user);
          // Refresh the stored token in case it was rotated
          localStorage.setItem('harvox_token', session.access_token);
          set({ token: session.access_token, user });
        } else {
          localStorage.removeItem('harvox_token');
          set({ token: null, user: null });
        }
      } catch {
        localStorage.removeItem('harvox_token');
        set({ token: null, user: null });
      }
    }
  },

  updateUser: (userData) => {
    set((state) => ({
      user: { ...state.user, ...userData },
    }));
  },

  logout: async () => {
    localStorage.removeItem('harvox_token');
    set({ token: null, user: null });
    // Also sign out from active Supabase browser session
    try { await supabase.auth.signOut(); } catch { /* silent */ }
  },

  clearError: () => set({ error: null }),
}));

