// src/pages/operator/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    bookingsToday: 0,
    scheduleToday: 0,
    pendingBookings: 0,
    totalPassengers: 0
  });
  const [bookingChartData, setBookingChartData] = useState({
    labels: [],
    datasets: []
  });
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [noRoutesAssigned, setNoRoutesAssigned] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get dashboard stats
        const statsResponse = await api.get('/operator-panel/dashboard/stats');
        setStats(statsResponse.data);
        
        // Get routes assigned to operator
        const routesResponse = await api.get('/operator-panel/dashboard/summary');
        setRoutes(routesResponse.data.routes || []);
        setNoRoutesAssigned(routesResponse.data.routes.length === 0);
        
        // Get today's schedules
        setTodaySchedules(routesResponse.data.todaySchedules || []);
        
        // Get recent activities
        setRecentActivities(routesResponse.data.recentActivities || []);
        
        // Get booking chart data
        setBookingChartData({
          labels: routesResponse.data.bookingChartData.map(item => item.date),
          datasets: [{
            label: 'Jumlah Booking',
            data: routesResponse.data.bookingChartData.map(item => item.total),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 3,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: 'rgba(54, 162, 235, 1)',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.3,
            fill: true
          }]
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-full">
      {noRoutesAssigned && (
        <Alert type="warning" title="Perhatian">
          <p>Anda belum memiliki rute yang ditugaskan. Semua data yang ditampilkan di dashboard akan kosong.
            Silakan hubungi administrator untuk mengatur rute yang dapat Anda akses.</p>
        </Alert>
      )}

      {!noRoutesAssigned && routes.length > 0 && (
        <Alert type="info" title="Rute Yang Ditugaskan">
          <ul className="list-disc ml-5 mt-2">
            {routes.map((route, index) => (
              <li key={index}>{route.origin} - {route.destination}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">{loading ? '...' : stats.totalSchedules}</h3>
              <p className="text-sm">Total Jadwal</p>
            </div>
            <i className="fas fa-calendar-alt text-4xl"></i>
          </div>
          <Link to="/operator/schedules" className="block mt-4 text-sm underline">Lihat Detail</Link>
        </div>

        <div className="bg-green-500 text-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">{loading ? '...' : stats.totalBookings}</h3>
              <p className="text-sm">Total Booking</p>
            </div>
            <i className="fas fa-ticket-alt text-4xl"></i>
          </div>
          <Link to="/operator/bookings" className="block mt-4 text-sm underline">Lihat Detail</Link>
        </div>

        <div className="bg-yellow-400 text-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">{loading ? '...' : stats.bookingsThisMonth}</h3>
              <p className="text-sm">Booking Bulan Ini</p>
            </div>
            <i className="fas fa-calendar-check text-4xl"></i>
          </div>
          <Link to="/operator/bookings" className="block mt-4 text-sm underline">Lihat Detail</Link>
        </div>

        <div className="bg-red-500 text-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">
                {loading ? '...' : `Rp ${Number(stats.revenueThisMonth || 0).toLocaleString('id-ID')}`}
              </h3>
              <p className="text-sm">Pendapatan Bulan Ini</p>
            </div>
            <i className="fas fa-money-bill text-4xl"></i>
          </div>
          <Link to="/operator/reports" className="block mt-4 text-sm underline">Lihat Detail</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        <div className="lg:col-span-2">
          <Card 
            title="Grafik Booking Seminggu Terakhir" 
            className="mb-6"
          >
            <div className="relative h-64">
              {bookingChartData.labels.length > 0 && (
                <Line 
                  data={bookingChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          usePointStyle: true,
                          font: { size: 14 }
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        titleColor: '#333',
                        bodyColor: '#333',
                        titleFont: { size: 16, weight: 'bold' },
                        bodyFont: { size: 14 },
                        padding: 10,
                        borderColor: 'rgba(54, 162, 235, 0.8)',
                        borderWidth: 1,
                        usePointStyle: true,
                        displayColors: false
                      }
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { font: { size: 12 } }
                      },
                      y: {
                        min: 0,
                        max: Math.max(5, Math.ceil(Math.max(...bookingChartData.datasets[0].data) * 1.2)),
                        ticks: {
                          stepSize: 1,
                          precision: 0,
                          font: { size: 12 }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                      }
                    }
                  }}
                />
              )}
              {bookingChartData.labels.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Tidak ada data untuk ditampilkan</p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Jadwal Hari Ini">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Rute</th>
                    <th className="px-4 py-2 border">Kapal</th>
                    <th className="px-4 py-2 border">Keberangkatan</th>
                    <th className="px-4 py-2 border">Kedatangan</th>
                    <th className="px-4 py-2 border">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {todaySchedules.map(schedule => (
                    <tr key={schedule.id} className="border-t">
                      <td className="px-4 py-2">{schedule.route.origin} - {schedule.route.destination}</td>
                      <td className="px-4 py-2">{schedule.ferry.name}</td>
                      <td className="px-4 py-2">{schedule.departure_time}</td>
                      <td className="px-4 py-2">{schedule.arrival_time}</td>
                      <td className="px-4 py-2">
                        <Link
                          to="/operator/reports"
                          className="inline-block px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                          <i className="fas fa-eye"></i> Lihat
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {todaySchedules.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center px-4 py-4 text-gray-500">Tidak ada jadwal untuk hari ini</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Menu Pintasan">
            <div className="grid grid-cols-2 gap-4">
              <Link to="/operator/bookings/check-in"
                className="flex flex-col items-center justify-center bg-blue-500 text-white p-4 rounded-lg shadow hover:bg-blue-600 text-center">
                <i className="fas fa-check-circle text-2xl mb-2"></i>
                Check-in<br/>Penumpang
              </Link>
              <Link to="/operator/bookings"
                className="flex flex-col items-center justify-center bg-indigo-500 text-white p-4 rounded-lg shadow hover:bg-indigo-600 text-center">
                <i className="fas fa-list text-2xl mb-2"></i>
                Daftar<br/>Booking
              </Link>
              <Link to="/operator/schedules"
                className="flex flex-col items-center justify-center bg-green-500 text-white p-4 rounded-lg shadow hover:bg-green-600 text-center">
                <i className="fas fa-calendar-alt text-2xl mb-2"></i>
                Kelola<br/>Jadwal
              </Link>
              <Link to="/operator/reports"
                className="flex flex-col items-center justify-center bg-yellow-500 text-white p-4 rounded-lg shadow hover:bg-yellow-600 text-center">
                <i className="fas fa-chart-bar text-2xl mb-2"></i>
                Laporan<br/>Operasional
              </Link>
            </div>
          </Card>

          <Card title="Aktivitas Terkini">
            <ul className="space-y-4">
              {recentActivities.map((activity, index) => (
                <li key={index} className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{activity.activity_type}</span>
                    <span className={`text-xs px-2 py-1 rounded text-white ${
                      activity.status === 'SUCCESS' || activity.status === 'CONFIRMED' ? 'bg-green-500' :
                      activity.status === 'FAILED' || activity.status === 'CANCELLED' ? 'bg-red-500' : 
                      activity.status === 'WARNING' || activity.status === 'CHANGED' ? 'bg-yellow-400' : 
                      'bg-blue-400'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <small className="text-gray-400">{new Date(activity.created_at).toLocaleString()}</small>
                </li>
              ))}
              {recentActivities.length === 0 && (
                <li className="text-center text-gray-500">Belum ada aktivitas terbaru</li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;