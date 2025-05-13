import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data.data);
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password, role = 'admin') => {
    try {
      // Determine the login endpoint based on role
      const endpoint = role === 'admin' ? '/admin-panel/login' : '/operator-panel/login';
      
      const response = await api.post(endpoint, { email, password });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      // Redirect based on role
      navigate(role === 'admin' ? '/admin/dashboard' : '/operator/dashboard');
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login gagal' 
      };
    }
  };

  const logout = async () => {
    try {
      // Determine logout endpoint based on user role
      const endpoint = user?.role === 'admin' ? '/admin-panel/logout' : '/operator-panel/logout';
      await api.post(endpoint);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};