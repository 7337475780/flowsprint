import axios from 'axios';

/**
 * Centralised Axios instance for all FlowSprint API calls.
 * – Reads base URL from Vite env (VITE_API_URL)
 * – Attaches Bearer token on every request
 * – Intercepts 401s and wipes stale tokens automatically
 */
const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Request interceptor: inject auth token ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 globally ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale session data and redirect to login
      localStorage.removeItem('fs_token');
      localStorage.removeItem('fs_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
