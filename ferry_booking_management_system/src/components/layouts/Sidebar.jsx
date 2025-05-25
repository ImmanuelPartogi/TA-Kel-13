import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  Home,
  Route,
  Ship,
  Calendar,
  Ticket,
  DollarSign,
  Users,
  LineChart,
  Shield,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  Settings,
  List,
  Car 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAssetUrl } from '../../utils/api';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Beranda', icon: Home },
    { path: '/admin/routes', label: 'Daftar Rute', icon: Route },
    { path: '/admin/ferries', label: 'Data Kapal', icon: Ship },
    { path: '/admin/schedules', label: 'Jadwal Keberangkatan', icon: Calendar },
    { path: '/admin/bookings', label: 'Data Pemesanan', icon: Ticket },
    {
      key: 'refunds',
      label: 'Pengembalian Dana',
      icon: DollarSign,
      hasSubmenu: true,
      submenu: [
        { path: '/admin/refunds/settings', label: 'Kebijakan Refund', icon: Settings },
        { path: '/admin/refunds', label: 'Daftar Refund', icon: List }
      ]
    },
    { path: '/admin/vehicleCategories', label: 'Kategori Kendaraan', icon: Car },
    { path: '/admin/users', label: 'Data Penumpang', icon: Users },
    { path: '/admin/reports', label: 'Laporan', icon: LineChart },
    { path: '/admin/operators', label: 'Data Operator', icon: Shield },
  ];

  const operatorNavItems = [
    { path: '/operator/dashboard', label: 'Beranda', icon: Home },
    { path: '/operator/bookings', label: 'Data Pemesanan', icon: Ticket },
    { path: '/operator/schedules', label: 'Jadwal Keberangkatan', icon: Calendar },
    { path: '/operator/reports', label: 'Laporan', icon: LineChart },
  ];

  const navItems = isAdmin ? adminNavItems : operatorNavItems;

  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (submenu) => {
    return submenu.some(item => location.pathname === item.path);
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar panel */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col lg:hidden transform transition ease-in-out duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Close button */}
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            type="button"
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        <SidebarContent
          navItems={navItems}
          isActive={isActive}
          isSubmenuActive={isSubmenuActive}
          user={user}
          logout={logout}
          expandedMenus={expandedMenus}
          toggleMenu={toggleMenu}
        />
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent
            navItems={navItems}
            isActive={isActive}
            isSubmenuActive={isSubmenuActive}
            user={user}
            logout={logout}
            expandedMenus={expandedMenus}
            toggleMenu={toggleMenu}
          />
        </div>
      </div>
    </>
  );
};

const SidebarContent = ({ navItems, isActive, isSubmenuActive, user, logout, expandedMenus, toggleMenu }) => {
  const isAdmin = user?.role === 'admin';
  const isOperator = user?.role === 'operator';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-blue-900 to-blue-700 shadow-xl relative overflow-hidden">
      {/* Blob background */}
      <div className="blob-wrapper opacity-30">
        <svg
          className="absolute"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '300px',
            right: '-150px',
            top: '-50px',
            animation: 'drift 20s ease-in-out infinite'
          }}
        >
          <path
            fill="#FFFFFF"
            d="M43.6,-57.3C56.1,-49.8,65.8,-35.6,71.7,-19.4C77.7,-3.2,79.9,14.9,73.8,29.4C67.6,44,53.2,55,37.5,61.5C21.9,68,4.9,70.1,-11.3,68.1C-27.5,66.1,-43.1,60,-55.8,48.5C-68.5,37,-78.4,20.1,-78.1,3.5C-77.8,-13,-67.3,-26,-56.5,-35.4C-45.7,-44.8,-34.7,-50.5,-23.4,-57.9C-12.1,-65.3,-0.6,-74.5,9.5,-72.8C19.6,-71.1,31.2,-64.8,43.6,-57.3Z"
            transform="translate(100 100)"
          />
        </svg>
        <svg
          className="absolute"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '300px',
            left: '-150px',
            bottom: '100px',
            animation: 'morph 30s ease-in-out infinite'
          }}
        >
          <path
            fill="#FFFFFF"
            d="M35.6,-53.8C45.4,-44.9,52.6,-33.3,58.5,-20C64.5,-6.7,69.2,8.3,67.1,22.7C64.9,37.1,56.1,51,43.3,58.2C30.6,65.5,15.3,66.2,0.8,65C-13.6,63.9,-27.3,61,-39.3,53.7C-51.3,46.4,-61.7,34.6,-67.3,20.2C-72.9,5.9,-73.6,-11,-67.8,-25.4C-61.9,-39.8,-49.4,-51.7,-36,-59.1C-22.5,-66.4,-8.1,-69.2,2.9,-68.1C14,-67,25.9,-62.8,35.6,-53.8Z"
            transform="translate(100 100)"
          />
        </svg>
        <svg
          className="absolute"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '200px',
            right: '-50px',
            bottom: '200px',
            animation: 'waves 25s ease-in-out infinite'
          }}
        >
          <path
            fill="#FFFFFF"
            d="M48.2,-71.1C59.4,-61.9,63.6,-43.1,67.2,-25.7C70.9,-8.4,74,7.6,69.7,20.8C65.4,33.9,53.6,44.2,40.9,52.8C28.1,61.4,14.1,68.3,-1.2,69.9C-16.5,71.5,-33,67.7,-46.9,59C-60.8,50.3,-72.1,36.7,-75.6,21.3C-79.1,6,-74.9,-11.1,-65.8,-23.2C-56.6,-35.3,-42.5,-42.6,-29.6,-51.2C-16.6,-59.8,-4.9,-69.8,8.9,-74.9C22.7,-80,45.5,-80.2,48.2,-71.1Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      <div className="content-wrapper relative z-10">
        {/* Logo header */}
        <div className="flex-shrink-0 flex items-center px-4 py-5">
          <img className="h-10 w-auto" src={getAssetUrl('images/logo.png')} alt="Ferry Ticket" />
          <span className="ml-3 text-xl font-semibold text-white">FerryLink</span>
        </div>

        {/* Navigation */}
        <div className="mt-2 flex-1 flex flex-col overflow-y-auto px-2">
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.hasSubmenu) {
                const Icon = item.icon;
                const isExpanded = expandedMenus[item.key];
                const hasActiveSubmenu = isSubmenuActive(item.submenu);

                return (
                  <div key={item.key}>
                    {/* Parent menu item */}
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className={`nav-item group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors ${hasActiveSubmenu
                          ? 'bg-blue-800 text-white'
                          : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                        }`}
                    >
                      <div className="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-left">{item.label}</span>
                      <div className="ml-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </button>

                    {/* Submenu items */}
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.submenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const active = isActive(subItem.path);

                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className={`nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${active
                                  ? 'bg-blue-800 text-white'
                                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                                }`}
                            >
                              <div className="nav-icon mr-3 flex-shrink-0 h-5 w-5 flex items-center justify-center">
                                <SubIcon className="h-3 w-3" />
                              </div>
                              <span>{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${active
                        ? 'bg-blue-800 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                      }`}
                  >
                    <div className="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{item.label}</span>
                  </Link>
                );
              }
            })}
          </nav>
        </div>

        {/* User info section */}
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {user?.name || (isAdmin ? 'Admin' : 'Operator')}
              </p>
              {(isAdmin || isOperator) && (
                <button
                  onClick={logout}
                  className="mt-1 text-xs text-blue-200 hover:text-white flex items-center transition-colors cursor-pointer"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Keluar dari Sistem
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes drift {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes morph {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          50% { transform: translate(-20px, 10px) scale(1.1) rotate(180deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
        }
        
        @keyframes waves {
          0% { transform: translate(0px, 0px) scale(1); }
          25% { transform: translate(10px, -10px) scale(0.95); }
          50% { transform: translate(-10px, 10px) scale(1.05); }
          75% { transform: translate(15px, 5px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;