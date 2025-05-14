// pages/operator/auth/Login.js
import React from 'react';
import { Link } from 'react-router-dom';
import BaseLogin from '../../../components/auth/BaseLogin';

const OperatorLogin = () => {
  return (
    <BaseLogin 
      title="Login Operator"
      subtitle="Masukkan kredensial untuk akses sistem operasional"
      role="operator"
      endpoint="/operator-panel/login"
      redirectPath="/operator/dashboard"
      primaryColor="cyan"
      alternateLoginLink={
        <p className="text-sm text-gray-600">
          <Link to="/admin/login" className="text-cyan-600 hover:text-cyan-800 transition-colors duration-200">
            <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Login sebagai Admin
          </Link>
        </p>
      }
    />
  );
};

export default OperatorLogin;