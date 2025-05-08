import axios from 'axios';

// Define constants for the authentication
const TOKEN_KEY = 'operator_token';
const USER_KEY = 'operator_user';

// Login function for operator users
export const login = async (email, password) => {
  try {
    const response = await axios.post('/api/operator-panel/login', {
      email,
      password
    });
    
    // If login is successful, store the token and user info
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      return response.data;
    }
    
    throw new Error('Login gagal, respons server tidak memiliki token');
  } catch (error) {
    // Handle error responses
    if (error.response) {
      throw new Error(error.response.data.message || 'Login gagal, coba lagi');
    }
    throw error;
  }
};

// Logout function to clear the stored authentication data
export const logout = async () => {
  try {
    // Call the logout API endpoint if the user is authenticated
    if (isAuthenticated()) {
      await axios.post('/api/operator-panel/logout', {}, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear the localStorage regardless of API success/failure
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Redirect to login page after logout
    window.location.href = '/login';
  }
};

// Check if the user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return !!token;
};

// Get the authentication token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Get the current user information
export const getCurrentUser = () => {
  const userString = localStorage.getItem(USER_KEY);
  return userString ? JSON.parse(userString) : null;
};

// Check if the current user has a specific role
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

// Update the current user information
export const updateCurrentUser = (userData) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

export default {
  login,
  logout,
  isAuthenticated,
  getToken,
  getCurrentUser,
  hasRole,
  updateCurrentUser
};