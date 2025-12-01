import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Token storage keys
const TOKEN_KEY = 'citypulse_access_token';
const TOKEN_EXPIRY_KEY = 'citypulse_token_expiry';
const REFRESH_TOKEN_KEY = 'citypulse_refresh_token';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      // Check if token is expired
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      const isExpired = expiry && Date.now() > parseInt(expiry) - 5 * 60 * 1000;

      if (isExpired) {
        // Try to refresh the token
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_URL}/api/auth/refresh`, {
              refresh_token: refreshToken,
            });

            // Update stored tokens
            localStorage.setItem(TOKEN_KEY, response.data.access_token);
            const newExpiry = Date.now() + response.data.expires_in * 1000;
            localStorage.setItem(TOKEN_EXPIRY_KEY, newExpiry.toString());

            config.headers.Authorization = `Bearer ${response.data.access_token}`;
          } catch (refreshError) {
            // Refresh failed - clear tokens and let the request proceed
            // The 401 response will trigger logout in the response interceptor
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(TOKEN_EXPIRY_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
          }
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // Handle 401 Unauthorized - token invalid or expired
      if (status === 401) {
        // Clear tokens and redirect to login
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem('citypulse_id_token');
        localStorage.removeItem('citypulse-auth'); // Zustand store

        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Handle 429 Too Many Requests (rate limiting)
      if (status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
      }

      // Server responded with error status
      console.error('API Error:', error.response.data);

      // Return the error with response data for proper handling
      return Promise.reject(error);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default api;
