import api from './services/api/config';

// Authentication untuk Admin Panel
export const adminLogin = (credentials) => 
  api.post('/admin-panel/login', credentials);

export const adminLogout = () => 
  api.post('/admin-panel/logout');

// Authentication untuk Operator Panel
export const operatorLogin = (credentials) => 
  api.post('/operator-panel/login', credentials);

export const operatorLogout = () => 
  api.post('/operator-panel/logout');

// Set token setelah login
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Hapus token saat logout
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Cek apakah user sudah login
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};