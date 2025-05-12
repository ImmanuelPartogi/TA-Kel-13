// src/layouts/AdminLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faUsers, faShip, faRoute, faCalendarAlt, 
  faChartBar, faSignOutAlt, faBars, faTimes,
  faTicketAlt, faUserShield, faMoneyBillWave, faUndo
} from '@fortawesome/free-solid-svg-icons';
import { getCurrentUser, adminLogout } from '/src/services/auth.js';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);
  
  const handleLogout = async () => {
    await adminLogout();
  };
  
  const toggleSubmenu = (key) => {
    setExpandedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const menuItems = [
    { 
      path: '/admin/dashboard', 
      icon: faHome, 
      text: 'Dashboard',
      exact: true 
    },
    {
      icon: faUsers,
      text: 'Manajemen User',
      key: 'users',
      submenu: [
        { path: '/admin/admins', text: 'Admin' },
        { path: '/admin/operators', text: 'Operator' },
        { path: '/admin/users', text: 'Pengguna' },
      ]
    },
    {
      icon: faShip,
      text: 'Manajemen Ferry',
      key: 'ferry',
      submenu: [
        { path: '/admin/ferries', text: 'Data Ferry' },
        { path: '/admin/routes', text: 'Rute' },
        { path: '/admin/schedules', text: 'Jadwal' },
      ]
    },
    {
      icon: faTicketAlt,
      text: 'Manajemen Booking',
      key: 'booking',
      submenu: [
        { path: '/admin/bookings', text: 'Daftar Booking' },
        { path: '/admin/refunds', text: 'Refund' },
      ]
    },
    { 
      path: '/admin/reports', 
      icon: faChartBar, 
      text: 'Laporan' 
    },
  ];
  
  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-600 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-3 text-white hover:text-gray-200 focus:outline-none"
              >
                <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faUserShield} className="text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                  <p className="text-indigo-200 text-sm">Ferry Booking System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="hidden sm:block mr-4">
                <p className="text-sm text-indigo-200">
                  Selamat datang,
                </p>
                <p className="text-sm font-medium text-white">
                  {user?.name || 'Administrator'}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className={`w-64 bg-white shadow-md transition-all duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:static inset-y-0 left-0 z-50 lg:z-0 top-16 lg:top-0`}>
          <nav className="px-3 py-4 h-full overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <div key={item.path || item.key}>
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.key)}
                        className="group flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={item.icon} className="mr-3 h-4 w-4" />
                          {item.text}
                        </div>
                        <FontAwesomeIcon 
                          icon={expandedMenus[item.key] ? faTimes : faBars} 
                          className="h-3 w-3"
                        />
                      </button>
                      {expandedMenus[item.key] && (
                        <div className="ml-8 mt-1 space-y-1">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={() => setSidebarOpen(false)}
                              className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                isActive(subItem.path)
                                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {subItem.text}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link 
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.path, item.exact)
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FontAwesomeIcon icon={item.icon} className="mr-3 h-4 w-4" />
                      {item.text}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </aside>
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;