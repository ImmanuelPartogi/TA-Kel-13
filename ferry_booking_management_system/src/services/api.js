import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging
    console.log('Request URL:', config.url);
    console.log('Request Headers:', config.headers);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor untuk handle error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Debug logging untuk 403 errors
    if (error.response?.status === 403) {
      console.error('403 Error Details:', {
        url: error.config.url,
        message: error.response.data?.message,
        data: error.response.data
      });
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/operator/login';
    }
    
    // Re-throw error untuk di-handle di component
    return Promise.reject(error);
  }
);

export { api };
export default api;