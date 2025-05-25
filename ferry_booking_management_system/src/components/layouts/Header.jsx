import React, { useState, useEffect } from 'react';
import { Menu, Bell, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  // const [notificationOpen, setNotificationOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    const titles = {
      dashboard: 'Dashboard',
      routes: 'Daftar Rute',
      ferries: 'Data Kapal',
      schedules: 'Jadwal Keberangkatan',
      bookings: 'Data Pemesanan',
      refunds: 'Pengembalian Dana',
      users: 'Data Penumpang',
      reports: 'Laporan',
      operators: 'Data Operator',
    };

    return titles[lastSegment] || 'Dashboard';
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatFullDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  return (
    <header className="relative z-10 flex-shrink-0 h-16 bg-white shadow-sm overflow-hidden">
      {/* Header blob decorations */}
      <div className="absolute opacity-15 -right-16 -top-16">
        <svg
          className="animate-morph-slow"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: 180 }}
        >
          <path
            fill="#4470f4"
            d="M48.6,-58.3C62.3,-49.4,72.6,-33.6,76.3,-16.3C80.1,1.1,77.3,19.9,68.4,33.5C59.5,47.2,44.6,55.6,28.7,62.5C12.9,69.4,-4,74.8,-19.1,71.3C-34.2,67.8,-47.6,55.6,-57.2,40.8C-66.8,26.1,-72.6,8.8,-71.2,-7.9C-69.8,-24.6,-61.3,-40.5,-48.4,-49.8C-35.6,-59.1,-18.3,-61.7,-0.3,-61.3C17.7,-60.9,34.8,-67.3,48.6,-58.3Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
      <div className="absolute opacity-15 left-20 top-0">
        <svg
          className="animate-drift-right"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: 120 }}
        >
          <path
            fill="#3aa3ff"
            d="M46.7,-47.9C59.1,-34.4,67.3,-16.9,67.7,1.3C68,19.5,60.4,38.6,46.9,52.1C33.4,65.6,14,73.4,-5.2,73.1C-24.4,72.7,-43.5,64.2,-55.5,49.8C-67.5,35.4,-72.4,15,-69.4,-3.1C-66.3,-21.2,-55.4,-36.9,-41.6,-49.8C-27.8,-62.7,-10.9,-72.7,3.7,-74.1C18.3,-75.5,34.3,-61.4,46.7,-47.9Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      <div className="flex h-full px-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 self-center"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex-1 px-4 flex justify-between">
          <div className="flex-1 flex items-center">
            <h1 className="text-xl font-bold text-gray-800">{getPageTitle()}</h1>
          </div>

          <div className="ml-4 flex items-center md:ml-6">
            {/* Date display */}
            <div className="hidden sm:flex items-center bg-gray-100 text-gray-600 rounded-lg py-1 px-3 mr-4">
              <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium shadow-sm flex flex-col items-center justify-center mb-3 md:mb-0 md:mr-3">
                <div className='flex items-center'>
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{formatTime(currentTime)}</span>
                </div>
              </div>
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatFullDate(currentTime)}</span>
            </div>

            {/* Notifications dropdown
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" />
              </button>

              {notificationOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <i className="fas fa-ticket-alt text-primary-600"></i>
                            </div>
                          </div>
                          <div className="ml-3 w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">New booking received</p>
                            <p className="text-xs text-gray-500">5 minutes ago</p>
                          </div>
                        </div>
                      </a>
                    </div>

                    <div className="border-t">
                      <a href="#" className="block px-4 py-2 text-xs text-center text-primary-600 font-medium">
                        View all notifications
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div> */}

            {/* Profile dropdown - visible only on mobile */}
            <div className="md:hidden flex items-center ml-3">
              <span className="inline-block text-sm text-gray-700 mr-2">{user?.name || 'Guest'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
