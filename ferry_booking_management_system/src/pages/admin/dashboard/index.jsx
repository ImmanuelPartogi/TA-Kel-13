// src/pages/admin/dashboard/index.jsx
import React, { useEffect, useState } from 'react';
import { getAdminDashboardStats } from '../../../services/api/admin';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getAdminDashboardStats();
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError('Gagal memuat data dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Memuat data...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <h1>Dashboard Admin</h1>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Pemesanan</h3>
            <p className="stat-value">{stats.totalBookings}</p>
          </div>
          
          <div className="stat-card">
            <h3>Pendapatan</h3>
            <p className="stat-value">Rp {stats.totalRevenue.toLocaleString()}</p>
          </div>
          
          <div className="stat-card">
            <h3>Kapal Aktif</h3>
            <p className="stat-value">{stats.activeFerries}</p>
          </div>
          
          <div className="stat-card">
            <h3>Rute Aktif</h3>
            <p className="stat-value">{stats.activeRoutes}</p>
          </div>
        </div>
      )}
      
      {/* Chart dan visualisasi lainnya bisa ditambahkan di sini */}
    </div>
  );
};

export default AdminDashboard;