// src/components/common/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen, user = { name: 'Operator' } }) => {
  const location = useLocation();

  const handleLogout = () => {
    // Implementasi logout
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Determine active route
  const isActiveRoute = (route) => {
    return location.pathname.startsWith(route);
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col lg:hidden transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        {/* Close button */}
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setIsOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-primary-900 to-primary-700 shadow-xl overflow-y-auto relative">
          {/* Blob background */}
          <div className="blob-wrapper opacity-30">
            {/* SVG blobs here */}
          </div>

          <div className="content-wrapper">
            <div className="flex-shrink-0 flex items-center px-4 py-5">
              <img className="h-10 w-auto" src="/images/logo.png" alt="Ferry Ticket" />
              <span className="ml-3 text-xl font-semibold text-white">FerryLink</span>
            </div>
            
            <div className="mt-2 flex-1 px-2">
              <nav className="space-y-1">
                <Link
                  to="/operator/dashboard"
                  className={`nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActiveRoute('/operator/dashboard') 
                      ? 'bg-primary-800 text-white' 
                      : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                  }`}
                >
                  <div className="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                    <i className="fas fa-tachometer-alt"></i>
                  </div>
                  <span>Beranda</span>
                </Link>

                <Link
                  to="/operator/bookings"
                  className={`nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActiveRoute('/operator/bookings') 
                      ? 'bg-primary-800 text-white' 
                      : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                  }`}
                >
                  <div className="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                    <i className="fas fa-ticket-alt"></i>
                  </div>
                  <span>Data Pemesanan</span>
                </Link>

                <Link
                  to="/operator/schedules"
                  className={`nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActiveRoute('/operator/schedules') 
                      ? 'bg-primary-800 text-white' 
                      : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                  }`}
                >
                  <div className="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <span>Jadwal Keberangkatan</span>
                </Link>

                <Link
                  to="/operator/reports"
                  className={`nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActiveRoute('/operator/reports') 
                      ? 'bg-primary-800 text-white' 
                      : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                  }`}
                >
                  <div className="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <span>Laporan</span>
                </Link>
              </nav>
            </div>
            
            <div className="p-4 border-t border-primary-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <button 
                    onClick={handleLogout}
                    className="text-xs text-primary-200 hover:text-white flex items-center mt-1"
                  >
                    <i className="fas fa-sign-out-alt mr-1"></i> Keluar dari Sistem
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-primary-900 to-primary-700 shadow-xl relative">
            {/* Blob background */}
            <div className="blob-wrapper opacity-30">
              {/* SVG blobs */}
            </div>

            <div className="content-wrapper">
              <div className="flex-shrink-0 flex items-center px-4 py-5">
                <img className="h-10 w-auto" src="/images/logo.png" alt="Ferry Ticket" />
                <span className="ml-3 text-xl font-semibold text-white">FerryLink</span>
              </div>
              
              <div className="mt-2 flex-1 flex flex-col overflow-y-auto px-2">
                <nav className="space-y-1">
                  <Link
                    to="/operator/dashboard"
                    className={`nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActiveRoute('/operator/dashboard') 
                        ? 'bg-primary-800 text-white' 
                        : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                    }`}
                  >
                    <div className="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                      <i className="fas fa-tachometer-alt"></i>
                    </div>
                    <span>Beranda</span>
                  </Link>

                  <Link
                    to="/operator/bookings"
                    className={`nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActiveRoute('/operator/bookings') 
                        ? 'bg-primary-800 text-white' 
                        : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                    }`}
                  >
                    <div className="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                      <i className="fas fa-ticket-alt"></i>
                    </div>
                    <span>Data Pemesanan</span>
                  </Link>

                  <Link
                    to="/operator/schedules"
                    className={`nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActiveRoute('/operator/schedules') 
                        ? 'bg-primary-800 text-white' 
                        : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                    }`}
                  >
                    <div className="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                    <span>Jadwal Keberangkatan</span>
                  </Link>

                  <Link
                    to="/operator/reports"
                    className={`nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActiveRoute('/operator/reports') 
                        ? 'bg-primary-800 text-white' 
                        : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                    }`}
                  >
                    <div className="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <span>Laporan</span>
                  </Link>
                </nav>
              </div>
              
              <div className="p-4 border-t border-primary-800">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                      <i className="fas fa-user"></i>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <button 
                      onClick={handleLogout}
                      className="text-xs text-primary-200 hover:text-white flex items-center mt-1"
                    >
                      <i className="fas fa-sign-out-alt mr-1"></i> Keluar dari Sistem
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;