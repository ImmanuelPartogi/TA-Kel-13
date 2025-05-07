// src/layouts/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="font-sans auth-background min-h-screen flex flex-col">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Logo and App Name */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 w-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full mx-auto shadow-lg">
              <i className="fas fa-ship text-white text-2xl animate-float"></i>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Ferry Ticket System</h1>
          <p className="text-gray-500">Sistem Pemesanan Tiket Kapal Ferry</p>
        </div>

        {/* Content Container */}
        <div className="w-full max-w-md">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Ferry Ticket System. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;