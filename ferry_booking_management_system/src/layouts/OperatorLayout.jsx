// src/layouts/OperatorLayout.jsx
import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OperatorLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/operator/login');
  };

  const menuItems = [
    { path: '/operator/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/operator/bookings', label: 'Bookings', icon: 'book' },
    { path: '/operator/schedules', label: 'Schedules', icon: 'calendar' },
    { path: '/operator/reports', label: 'Reports', icon: 'chart' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Ferry Operator Panel</h1>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.path
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-700">
                {user?.email || 'Operator'}
              </span>
              <button
                onClick={handleLogout}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Global alert if no routes assigned */}
          {(!user?.assigned_routes || user.assigned_routes.length === 0) && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
              <p className="font-bold">Perhatian</p>
              <p>Anda belum memiliki rute yang ditugaskan. Silakan hubungi administrator untuk mendapatkan akses ke rute.</p>
            </div>
          )}
          
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OperatorLayout;