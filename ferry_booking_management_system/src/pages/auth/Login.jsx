// pages/auth/Login.js - Hapus atau update untuk redirect saja
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect ke admin login sebagai default
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  return null;
};

export default Login;