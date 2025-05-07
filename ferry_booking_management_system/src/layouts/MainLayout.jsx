// src/layouts/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import Toast from '../components/common/Toast';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [toast, setToast] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) setPageTitle('Beranda');
    else if (path.includes('/bookings/check-in')) setPageTitle('Check-in Penumpang');
    else if (path.includes('/bookings')) setPageTitle('Data Pemesanan');
    else if (path.includes('/schedules')) setPageTitle('Jadwal Keberangkatan');
    else if (path.includes('/reports')) setPageTitle('Laporan');
    else setPageTitle('Dashboard');
    
    // Tutup sidebar di perangkat mobile ketika berpindah halaman
    setSidebarOpen(false);
  }, [location]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={pageTitle} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto bg-gray-50 relative">
          {/* Background blobs */}
          <div className="blob-wrapper opacity-10">
            <div className="absolute right-0 top-10">
              <svg className="animate-morph-slow" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                style={{ width: "400px" }}>
                <path fill="#3aa3ff"
                  d="M48.2,-71.1C59.4,-61.9,63.6,-43.1,67.2,-25.7C70.9,-8.4,74,7.6,69.7,20.8C65.4,33.9,53.6,44.2,40.9,52.8C28.1,61.4,14.1,68.3,-1.2,69.9C-16.5,71.5,-33,67.7,-46.9,59C-60.8,50.3,-72.1,36.7,-75.6,21.3C-79.1,6,-74.9,-11.1,-65.8,-23.2C-56.6,-35.3,-42.5,-42.6,-29.6,-51.2C-16.6,-59.8,-4.9,-69.8,8.9,-74.9C22.7,-80,45.5,-80.2,48.2,-71.1Z"
                  transform="translate(100 100)" />
              </svg>
            </div>
            <div className="absolute left-0 bottom-0">
              <svg className="animate-drift" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                style={{ width: "350px" }}>
                <path fill="#4470f4"
                  d="M45,-54.3C55.6,-45.4,60.2,-28.4,63.3,-11.3C66.4,5.9,68,23.1,60.9,35.6C53.9,48.1,38.2,55.8,22.3,60.5C6.4,65.3,-9.7,67.1,-26.4,63.7C-43.1,60.2,-60.3,51.6,-67.9,37.2C-75.4,22.8,-73.3,2.6,-68.4,-15.7C-63.5,-34,-55.8,-50.4,-43.2,-58.7C-30.6,-67,-15.3,-67.2,0.9,-68.4C17.2,-69.5,34.4,-63.2,45,-54.3Z"
                  transform="translate(100 100)" />
              </svg>
            </div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
            <Outlet context={{ showToast }} />
          </div>
        </main>

        <Footer />
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onDismiss={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default MainLayout;