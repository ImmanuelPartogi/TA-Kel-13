// src/components/layout/OperatorLayout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const OperatorLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/operator/login');
  };

  return (
    <div className="operator-layout">
      <header className="operator-header">
        <div className="logo">Ferry Booking System</div>
        <nav className="operator-nav">
          <ul>
            <li><a href="/operator/dashboard">Dashboard</a></li>
            <li><a href="/operator/schedules">Jadwal</a></li>
            <li><a href="/operator/bookings">Pemesanan</a></li>
            <li><a href="/operator/check-in">Check-in</a></li>
            <li><a href="/operator/reports">Laporan</a></li>
          </ul>
        </nav>
        <div className="user-menu">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="operator-content">
        {children}
      </main>
      <footer className="operator-footer">
        <p>&copy; 2025 Ferry Booking System</p>
      </footer>
    </div>
  );
};

export default OperatorLayout;