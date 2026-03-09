import axios from 'axios';

// ── Token key — must match AuthContext ───────────────────────────────────────
// IMPORTANT: change this if you change the key in AuthContext.jsx
const TOKEN_KEY = 'sanad_token';

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        // Read the token every request (not captured in closure) so it's always fresh
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Debug: know exactly which endpoint rejected the token
            console.warn('[Sanad] 401 Unauthorized from:', error.config?.url);
            console.warn('[Sanad] Token used:', localStorage.getItem(TOKEN_KEY) ? 'present' : 'MISSING');

            // Only auto-logout and redirect if we are not already on the login page
            const isAuthRoute = ['/auth/login', '/auth/register'].some(p => error.config?.url?.includes(p));
            if (!isAuthRoute) {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem('sanad_user');
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
