import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layouts/Sidebar';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import BlobBackgrounds from '../components/layouts/BlobBackgrounds';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 relative">
          <BlobBackgrounds />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;