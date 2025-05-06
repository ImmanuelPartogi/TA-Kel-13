import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="logo">Ferry Booking System</div>
        <nav className="admin-nav">
          <ul>
            <li><a href="/admin/dashboard">Dashboard</a></li>
            <li><a href="/admin/routes">Rute</a></li>
            <li><a href="/admin/ferries">Kapal</a></li>
            <li><a href="/admin/schedules">Jadwal</a></li>
            <li><a href="/admin/bookings">Pemesanan</a></li>
            <li><a href="/admin/reports">Laporan</a></li>
            <li><a href="/admin/refunds">Pengembalian</a></li>
            <li><a href="/admin/users">Pengguna</a></li>
            <li><a href="/admin/operators">Operator</a></li>
            <li><a href="/admin/admins">Admin</a></li>
          </ul>
        </nav>
        <div className="user-menu">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="admin-content">
        {children}
      </main>
      <footer className="admin-footer">
        <p>&copy; 2025 Ferry Booking System</p>
      </footer>
    </div>
  );
};

export default AdminLayout;