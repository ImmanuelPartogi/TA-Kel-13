import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, Route, Ship, Calendar, Ticket, DollarSign, Users, ChartLine, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAssetUrl } from '../../utils/api';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOperator = user?.role === 'operator';

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Beranda', icon: Home },
    { path: '/admin/routes', label: 'Daftar Rute', icon: Route },
    { path: '/admin/ferries', label: 'Data Kapal', icon: Ship },
    { path: '/admin/schedules', label: 'Jadwal Keberangkatan', icon: Calendar },
    { path: '/admin/bookings', label: 'Data Pemesanan', icon: Ticket },
    { path: '/admin/refunds', label: 'Pengembalian Dana', icon: DollarSign },
    { path: '/admin/users', label: 'Data Penumpang', icon: Users },
    { path: '/admin/reports', label: 'Laporan', icon: ChartLine },
    { path: '/admin/operators', label: 'Data Operator', icon: Shield },
  ];

  const operatorNavItems = [
    { path: '/operator/dashboard', label: 'Beranda', icon: Home },
    { path: '/operator/bookings', label: 'Data Pemesanan', icon: Ticket },
    { path: '/operator/schedules', label: 'Jadwal Keberangkatan', icon: Calendar },
    { path: '/operator/reports', label: 'Laporan', icon: ChartLine },
  ];

  const navItems = isAdmin ? adminNavItems : operatorNavItems;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col lg:hidden transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            onClick={onClose}
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        <SidebarContent navItems={navItems} isActive={isActive} user={user} logout={logout} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navItems={navItems} isActive={isActive} user={user} logout={logout} />
        </div>
      </div>
    </>
  );
};

const SidebarContent = ({ navItems, isActive, user, logout }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-primary-900 to-primary-700 shadow-xl relative">
      {/* Blob background */}
      <div className="blob-wrapper opacity-30">
        <svg
          className="absolute blob animate-drift"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: 300, right: -150, top: -50 }}
        >
          <path
            fill="#FFFFFF"
            d="M43.6,-57.3C56.1,-49.8,65.8,-35.6,71.7,-19.4C77.7,-3.2,79.9,14.9,73.8,29.4C67.6,44,53.2,55,37.5,61.5C21.9,68,4.9,70.1,-11.3,68.1C-27.5,66.1,-43.1,60,-55.8,48.5C-68.5,37,-78.4,20.1,-78.1,3.5C-77.8,-13,-67.3,-26,-56.5,-35.4C-45.7,-44.8,-34.7,-50.5,-23.4,-57.9C-12.1,-65.3,-0.6,-74.5,9.5,-72.8C19.6,-71.1,31.2,-64.8,43.6,-57.3Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      <div className="content-wrapper">
        <div className="flex-shrink-0 flex items-center px-4 py-5">
          <img className="h-10 w-auto" src={getAssetUrl('images/logo.png')} alt="Ferry Ticket" />
          <span className="ml-3 text-xl font-semibold text-white">FerryLink</span>
        </div>

        <div className="mt-2 flex-1 px-2">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.path)
                      ? 'bg-primary-800 text-white'
                      : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                  }`}
                >
                  <div className="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
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
              <p className="text-sm font-medium text-white">{user?.name || 'Operator'}</p>
              <button
                onClick={logout}
                className="text-xs text-primary-200 hover:text-white flex items-center mt-1"
              >
                <LogOut className="h-3 w-3 mr-1" /> Keluar dari Sistem
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;