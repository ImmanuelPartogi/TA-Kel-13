// src/services/auth.js
import api from './api';

export const login = async (credentials) => {
  try {
    const response = await api.post('/operator-panel/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/operator-panel/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    // Force logout even if API fails
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};