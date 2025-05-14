// pages/admin/auth/Login.js
import React from 'react';
import { Link } from 'react-router-dom';
import BaseLogin from '../../../components/auth/BaseLogin';

const AdminLogin = () => {
  return (
    <BaseLogin 
      title="Login Admin"
      subtitle="Masukkan kredensial untuk akses dashboard admin"
      role="admin"
      endpoint="/admin-panel/login"
      redirectPath="/admin/dashboard"
      primaryColor="indigo"
      alternateLoginLink={
        <p className="text-sm text-gray-600">
          Masuk sebagai operator?
          <Link to="/operator/login" className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors ml-1">
            <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Login Operator
          </Link>
        </p>
      }
    />
  );
};

export default AdminLogin;