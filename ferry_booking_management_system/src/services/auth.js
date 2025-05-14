// src/services/auth.js
import api from './api';

// Token management
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

// User management
export const getUser = () => {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

// Role checks
export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  return !!token && !!user;
};

export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'admin';
};

export const isOperator = () => {
  const user = getUser();
  return user?.role === 'operator';
};

// Auth functions
export const login = async (credentials, role = 'admin') => {
  try {
    const endpoint = role === 'admin' ? '/admin-panel/login' : '/operator-panel/login';
    
    // Data yang akan dikirim
    const loginData = {
      email: credentials.email,
      password: credentials.password
    };
    
    console.log('Login attempt:', { endpoint, loginData });
    
    const response = await api.post(endpoint, loginData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    if (response.data.status === 'success') {
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      
      // Set default axios header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, user };
    }
    
    return { success: false, error: response.data.message };
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error response:', error.response?.data);
    
    // Handle validation errors (422)
    if (error.response?.status === 422) {
      const errorData = error.response.data;
      
      // Cek berbagai format response error
      if (errorData.errors) {
        // Laravel style validation errors
        const firstError = Object.values(errorData.errors)[0];
        return { 
          success: false, 
          error: Array.isArray(firstError) ? firstError[0] : firstError 
        };
      } else if (errorData.message) {
        return { 
          success: false, 
          error: errorData.message 
        };
      } else if (errorData.error) {
        return { 
          success: false, 
          error: errorData.error 
        };
      } else {
        return { 
          success: false, 
          error: 'Validasi gagal' 
        };
      }
    }
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Login failed' 
    };
  }
};

export const logout = () => {
  removeToken();
  removeUser();
  delete api.defaults.headers.common['Authorization'];
};

// Initialize auth header if token exists
const initializeAuth = () => {
  const token = getToken();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

initializeAuth();