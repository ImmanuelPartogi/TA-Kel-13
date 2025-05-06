import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    // Redirect ke halaman login dengan menyimpan intended URL
    return <Navigate to={`/${requiredRole}/login`} state={{ from: location }} replace />;
  }

  // Cek apakah user memiliki role yang dibutuhkan
  if (requiredRole && userRole !== requiredRole) {
    // Redirect ke dashboard yang sesuai dengan role user
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;