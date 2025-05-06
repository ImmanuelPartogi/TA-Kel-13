import { useState, useEffect, useContext, createContext } from 'react';
import api from '../services/api/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek status autentikasi saat aplikasi dimuat
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (token) {
      setUser({ role });
    }
    
    setLoading(false);
  }, []);

  const adminLogin = async (credentials) => {
    try {
      const response = await api.post('/admin-panel/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', 'admin');
      setUser({ ...user, role: 'admin' });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login gagal' 
      };
    }
  };

  const operatorLogin = async (credentials) => {
    try {
      const response = await api.post('/operator-panel/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', 'operator');
      setUser({ ...user, role: 'operator' });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login gagal' 
      };
    }
  };

  const logout = async () => {
    try {
      const role = localStorage.getItem('userRole');
      
      if (role === 'admin') {
        await api.post('/admin-panel/logout');
      } else if (role === 'operator') {
        await api.post('/operator-panel/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        userRole: user?.role,
        loading,
        adminLogin,
        operatorLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};