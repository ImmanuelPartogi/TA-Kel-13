import api from './api';

// Konstanta untuk autentikasi
const TOKEN_KEY = 'token';
const USER_KEY = 'user_data';

// Fungsi login untuk admin
export const adminLogin = async (credentials) => {
  try {
    const response = await api.post('/admin-panel/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user || {}));
      return response.data;
    }
    
    throw new Error('Login gagal, respons server tidak memiliki token');
  } catch (error) {
    console.error('Admin login error:', error.response?.data);
    throw error;
  }
};

// Fungsi login untuk operator
export const operatorLogin = async (credentials) => {
  try {
    const response = await api.post('/operator-panel/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user || {}));
      return response.data;
    }
    
    throw new Error('Login gagal, respons server tidak memiliki token');
  } catch (error) {
    console.error('Operator login error:', error.response?.data);
    throw error;
  }
};

// Fungsi logout untuk admin
export const adminLogout = async () => {
  try {
    if (isAuthenticated()) {
      await api.post('/admin-panel/logout');
    }
  } catch (error) {
    console.error('Admin logout error:', error);
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/admin/login';
  }
};

// Fungsi logout untuk operator
export const operatorLogout = async () => {
  try {
    if (isAuthenticated()) {
      await api.post('/operator-panel/logout');
    }
  } catch (error) {
    console.error('Operator logout error:', error);
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/operator/login';
  }
};

// Cek apakah user terautentikasi
export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return !!token;
};

// Dapatkan token autentikasi
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Dapatkan informasi user saat ini
export const getCurrentUser = () => {
  const userString = localStorage.getItem(USER_KEY);
  return userString ? JSON.parse(userString) : null;
};

// Cek apakah user saat ini memiliki role tertentu
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

// Cek apakah user adalah admin
export const isAdmin = () => {
  return hasRole('admin');
};

// Cek apakah user adalah operator
export const isOperator = () => {
  return hasRole('operator');
};

// Update informasi user saat ini
export const updateCurrentUser = (userData) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

// Fungsi umum untuk logout, akan memanggil adminLogout atau operatorLogout sesuai role
export const logout = async () => {
  const user = getCurrentUser();
  if (user && user.role === 'admin') {
    return adminLogout();
  } else if (user && user.role === 'operator') {
    return operatorLogout();
  } else {
    // Fallback jika tidak ada role yang jelas
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  }
};

export default {
  adminLogin,
  operatorLogin,
  adminLogout,
  operatorLogout,
  logout,
  isAuthenticated,
  getToken,
  getCurrentUser,
  hasRole,
  isAdmin,
  isOperator,
  updateCurrentUser
};