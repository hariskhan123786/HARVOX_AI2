import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('harvox_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('harvox_token');
      import('../store/authStore')
        .then(({ useAuthStore }) => {
          useAuthStore.getState().logout();
        })
        .catch(() => {});
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

const streamRequest = async (url, data, onChunk, signal) => {
  const token = localStorage.getItem('harvox_token');
  
  // AbortController with 60s timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  if (signal) {
    signal.addEventListener('abort', () => {
      controller.abort();
    });
    if (signal.aborted) {
      controller.abort();
    }
  }

  let response;
  try {
    response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ ...data, stream: true }),
      signal: controller.signal,
    });
  } catch (fetchErr) {
    clearTimeout(timeoutId);
    if (fetchErr.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw new Error(fetchErr.message || 'Network error. Please check your connection.');
  }

  if (!response.ok) {
    clearTimeout(timeoutId);
    let errMsg = 'Unable to generate response. Please try again.';
    try {
      const errBody = await response.json();
      errMsg = errBody.message || errMsg;
    } catch {
      // Non-JSON error response — use status text
      errMsg = response.statusText || errMsg;
    }
    throw new Error(errMsg);
  }

  if (!response.body) {
    clearTimeout(timeoutId);
    throw new Error('Empty response from server.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.substring(6).trim();
          if (dataStr) {
            try {
              const parsed = JSON.parse(dataStr);
              // Surface server-side stream errors to the caller
              if (parsed.error && !parsed.content) {
                console.warn('[Stream] Server error:', parsed.error);
              }
              onChunk(parsed);
            } catch (parseErr) {
              // Skip malformed JSON chunks
              console.warn('[Stream] Malformed chunk skipped:', dataStr);
            }
          }
        }
      }
    }
  } catch (readErr) {
    if (readErr.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw readErr;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  streamChat: (data, onChunk, signal) => streamRequest('/ai/chat', data, onChunk, signal),
  generateCode: (data) => api.post('/ai/generate-code', data),
  streamGenerateCode: (data, onChunk, signal) => streamRequest('/ai/generate-code', data, onChunk, signal),
  debug: (data) => api.post('/ai/debug', data),
  explain: (data) => api.post('/ai/explain', data),
  project: (data) => api.post('/ai/project', data),
  analyzeFile: (formData) =>
    api.post('/ai/analyze-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const chatAPI = {
  list: () => api.get('/chats'),
  get: (id) => api.get(`/chats/${id}`),
  delete: (id) => api.delete(`/chats/${id}`),
  bookmark: (data) => api.patch('/chats/bookmark', data),
};

export const noteAPI = {
  list: (search) => api.get('/notes', { params: { search } }),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  search: (q) => api.get('/notes/search', { params: { q } }),
};

export const userAPI = {
  stats: () => api.get('/user/stats'),
  projects: () => api.get('/user/projects'),
  files: () => api.get('/user/files'),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const fsAPI = {
  getTree: () => api.get('/fs/tree'),
  getFile: (path) => api.get(`/fs/file?path=${encodeURIComponent(path)}`),
  saveFile: (path, content) => api.post('/fs/file', { path, content }),
  create: (path, type, content) => api.post('/fs/create', { path, type, content }),
};

export const profileAPI = {
  getData: () => api.get('/profile/data'),
  updateAchievements: (data) => api.post('/profile/achievements', data),
  getNotifications: () => api.get('/profile/notifications'),
};

export const paymentsAPI = {
  getSettings: () => api.get('/payments/settings'),
  submitRequest: (formData) => 
    api.post('/payments/request', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getStatus: () => api.get('/payments/status'),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  updateSubscription: (id, subscription) => api.put(`/admin/users/${id}/subscription`, { subscription }),
  toggleBan: (id) => api.put(`/admin/users/${id}/ban`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPayments: () => api.get('/admin/payments'),
  approvePayment: (id) => api.put(`/admin/payments/${id}/approve`),
  rejectPayment: (id, reason) => api.put(`/admin/payments/${id}/reject`, { reason }),
  getAnalytics: () => api.get('/admin/analytics'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

export const memoryAPI = {
  list: (params) => api.get('/memory', { params }),
  create: (data) => api.post('/memory', data),
  update: (id, data) => api.put(`/memory/${id}`, data),
  togglePin: (id) => api.put(`/memory/${id}/pin`),
  delete: (id) => api.delete(`/memory/${id}`),
  summarizeIdentity: () => api.post('/memory/summarize-identity'),
  detectConflicts: () => api.get('/memory/detect-conflicts'),
  autoTag: (data) => api.post('/memory/auto-tag', data),
  exportUrl: () => `${API_URL}/memory/export?token=${localStorage.getItem('harvox_token')}`,
};

export const automationAPI = {
  executeStep: (step) => api.post('/automation/execute-step', { step }),
  getDashboard: () => api.get('/automation/dashboard'),
  createTask: (data) => api.post('/automation/tasks', data),
  updateTask: (id, data) => api.put(`/automation/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/automation/tasks/${id}`),
  logLearning: (data) => api.post('/automation/learning', data),
  getLearning: () => api.get('/automation/learning'),
};

export default api;
