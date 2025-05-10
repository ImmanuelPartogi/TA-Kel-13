import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faTicketAlt, faCalendarAlt, 
  faChartBar, faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName] = useState('Operator');
  
  // Cek autentikasi saat komponen dimount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
    // Di implementasi nyata, tambahkan panggilan API untuk mendapatkan data user
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Ferry Booking System</h1>
          </div>
          <div className="flex items-center">
            <div className="mr-4">
              <p className="text-sm text-gray-600">
                Selamat datang, <span className="font-medium">{userName}</span>
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-1.5" />
              Logout
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md">
          <nav className="px-3 py-4">
            <div className="space-y-1">
              <Link 
                to="/operator/dashboard" 
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                  location.pathname === '/operator/dashboard' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FontAwesomeIcon icon={faHome} className="mr-3 h-4 w-4" />
                Dashboard
              </Link>
              <Link 
                to="/operator/bookings" 
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                  location.pathname.includes('/operator/bookings') 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FontAwesomeIcon icon={faTicketAlt} className="mr-3 h-4 w-4" />
                Bookings
              </Link>
              <Link 
                to="/operator/schedules" 
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                  location.pathname.includes('/operator/schedules') 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 h-4 w-4" />
                Jadwal
              </Link>
              <Link 
                to="/operator/reports" 
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                  location.pathname.includes('/operator/reports') 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FontAwesomeIcon icon={faChartBar} className="mr-3 h-4 w-4" />
                Laporan
              </Link>
            </div>
          </nav>
        </aside>
        
        {/* Page content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;