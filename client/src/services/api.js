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

const streamRequest = async (url, data, onChunk) => {
  const token = localStorage.getItem('harvox_token');
  const response = await fetch(`${API_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ ...data, stream: true })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Stream request failed' }));
    throw new Error(err.message || 'Stream request failed');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

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
            onChunk(JSON.parse(dataStr));
          } catch (e) { }
        }
      }
    }
  }
};

export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  streamChat: (data, onChunk) => streamRequest('/ai/chat', data, onChunk),
  generateCode: (data) => api.post('/ai/generate-code', data),
  streamGenerateCode: (data, onChunk) => streamRequest('/ai/generate-code', data, onChunk),
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

export default api;
