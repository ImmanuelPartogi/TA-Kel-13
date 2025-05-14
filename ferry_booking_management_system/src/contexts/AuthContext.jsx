import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user dari localStorage saat pertama kali mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          console.log('Loaded user from localStorage:', userData);
          
          // Set default assigned_routes jika null
          if (userData.role === 'operator' && !userData.assigned_routes) {
            userData.assigned_routes = [];
          }
          
          setUser(userData);
          // Set default axios header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (userData, token) => {
    console.log('Login - User data:', userData);
    console.log('Login - Token:', token);
    
    // Set default assigned_routes jika null untuk operator
    if (userData.role === 'operator' && !userData.assigned_routes) {
      userData.assigned_routes = [];
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const hasRoutes = () => {
    if (user?.role === 'operator') {
      return user.assigned_routes && Array.isArray(user.assigned_routes) && user.assigned_routes.length > 0;
    }
    return true;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOperator: user?.role === 'operator',
    hasRoutes,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};