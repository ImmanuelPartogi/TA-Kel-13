// services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Untuk mengirim cookies jika diperlukan
});

// CSRF Token management
const getCsrfToken = async () => {
  try {
    // Coba ambil CSRF token dari Laravel
    await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true
    });
  } catch (error) {
    console.error('CSRF token error:', error);
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log('Request URL:', config.url);
    console.log('Request Data:', config.data);
    
    // Untuk login endpoints, get CSRF token dulu
    if (config.url.includes('login')) {
      await getCsrfToken();
    }
    
    // Add X-Requested-With header (Laravel requirement)
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.error('Response Error:', error);
    console.error('Error Response Data:', error.response?.data);
    console.error('Error Response Status:', error.response?.status);
    return Promise.reject(error);
  }
);

export default api;

// Named export untuk backward compatibility
export { api };