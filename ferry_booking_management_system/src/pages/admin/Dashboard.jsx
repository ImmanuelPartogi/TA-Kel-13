import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Chart from 'chart.js/auto';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    users_count: 0,
    ferries_count: 0,
    routes_count: 0,
    active_schedules: 0,
    monthly_bookings: 0,
    monthly_income: 0,
    userGrowth: 0,
    bookingGrowth: 0,
    pending_payment_count: 0,
    not_checked_in_count: 0,
    checked_in_count: 0,
    cancelled_count: 0,
    latest_bookings: [],
    weekly_booking_labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    weekly_booking_data: [0, 0, 0, 0, 0, 0, 0],
    monthly_booking_labels: [],
    monthly_booking_data: []
  });

  const chartRef = useRef(null);
  const bookingChartRef = useRef(null);
  const [chartView, setChartView] = useState('weekly');

  useEffect(() => {
    fetchDashboardData();
    return () => {
      if (bookingChartRef.current) {
        bookingChartRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!loading && chartRef.current) {
      initializeChart();
    }
  }, [loading, chartView]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin-panel/dashboard/stats');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeChart = () => {
    const ctx = chartRef.current.getContext('2d');

    if (bookingChartRef.current) {
      bookingChartRef.current.destroy();
    }

    const chartData = {
      labels: chartView === 'weekly' ? dashboardData.weekly_booking_labels : dashboardData.monthly_booking_labels,
      datasets: [{
        label: 'Jumlah Booking',
        data: chartView === 'weekly' ? dashboardData.weekly_booking_data : dashboardData.monthly_booking_data,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: 'rgb(79, 70, 229)',
        pointBorderWidth: 2,
        pointRadius: 4
      }]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          padding: 12,
          titleFont: {
            size: 14
          },
          bodyFont: {
            size: 13
          },
          displayColors: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            font: {
              size: 11
            }
          },
          grid: {
            color: 'rgba(243, 244, 246, 1)',
            borderDash: [5, 5]
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            }
          }
        }
      }
    };

    bookingChartRef.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: chartOptions
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCurrentDayDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    return `${dayName}, ${day} ${month} ${year}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': 'bg-blue-100 text-blue-800',
      'CONFIRMED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'COMPLETED': 'bg-gray-100 text-gray-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
        <p className="mt-2 text-gray-600">
          Selamat datang, <span className="font-medium">Admin</span>!
          <span className="text-sm ml-2 text-gray-500">{getCurrentDayDate()}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* User Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-blue-500 bg-opacity-10">
                <i className="fas fa-users text-xl text-blue-600"></i>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Pengguna</p>
                <div className="flex items-end">
                  <p className="text-2xl font-bold text-gray-800">{dashboardData.users_count}</p>
                  {dashboardData.userGrowth !== 0 && (
                    <p className={`ml-2 text-xs ${dashboardData.userGrowth > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                      <i className={`fas fa-arrow-${dashboardData.userGrowth > 0 ? 'up' : 'down'} mr-1`}></i>
                      {Math.abs(dashboardData.userGrowth)}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-2">
            <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              Lihat detail <i className="fas fa-arrow-right ml-1 text-xs"></i>
            </Link>
          </div>
        </div>

        {/* Ferry Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-green-500 bg-opacity-10">
                <i className="fas fa-ship text-xl text-green-600"></i>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Kapal</p>
                <div className="flex items-end">
                  <p className="text-2xl font-bold text-gray-800">{dashboardData.ferries_count}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-2">
            <Link to="/admin/ferries" className="text-sm text-green-600 hover:text-green-800 flex items-center">
              Lihat detail <i className="fas fa-arrow-right ml-1 text-xs"></i>
            </Link>
          </div>
        </div>

        {/* Routes Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-purple-500 bg-opacity-10">
                <i className="fas fa-route text-xl text-purple-600"></i>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Rute</p>
                <div className="flex items-end">
                  <p className="text-2xl font-bold text-gray-800">{dashboardData.routes_count}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-2">
            <Link to="/admin/routes" className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
              Lihat detail <i className="fas fa-arrow-right ml-1 text-xs"></i>
            </Link>
          </div>
        </div>

        {/* Active Schedules Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-amber-500 bg-opacity-10">
                <i className="fas fa-calendar-alt text-xl text-amber-600"></i>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Jadwal Aktif</p>
                <div className="flex items-end">
                  <p className="text-2xl font-bold text-gray-800">{dashboardData.active_schedules}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-2">
            <Link to="/admin/schedules" className="text-sm text-amber-600 hover:text-amber-800 flex items-center">
              Lihat detail <i className="fas fa-arrow-right ml-1 text-xs"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue and Booking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Bookings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Booking Bulan Ini</h2>
          </div>
          <div className="px-6 py-8 flex flex-col items-center justify-center">
            <div className="text-center mb-2">
              <span className="text-4xl font-bold text-indigo-700">{dashboardData.monthly_bookings}</span>
            </div>
            <p className="text-gray-500 mb-6">Total pemesanan</p>

            <div className="w-full p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Pendapatan Bulan Ini</h3>
              <div className="text-center">
                <span className="text-2xl font-bold text-green-600">
                  Rp {formatCurrency(dashboardData.monthly_income)}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs text-gray-500">Dibandingkan bulan lalu</span>
            {dashboardData.bookingGrowth !== undefined ? (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${dashboardData.bookingGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <i className={`fas fa-arrow-${dashboardData.bookingGrowth >= 0 ? 'up' : 'down'} text-xs mr-1`}></i>
                {Math.abs(dashboardData.bookingGrowth)}%
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">-</span>
            )}
          </div>
        </div>

        {/* Weekly Booking Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden lg:col-span-2">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Booking 7 Hari Terakhir</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartView('weekly')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${chartView === 'weekly' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Minggu Ini
              </button>
              <button
                onClick={() => setChartView('monthly')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${chartView === 'monthly' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Bulan Ini
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="h-72">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        </div>
      </div>

      {/* Status and Latest Bookings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Status Booking</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Waiting for Payment */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500 mr-3"></div>
                  <span className="text-sm text-gray-700">Menunggu Pembayaran</span>
                </div>
                <span className="font-semibold text-gray-800">{dashboardData.pending_payment_count}</span>
              </div>

              {/* Not Checked In */}
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-yellow-500 mr-3"></div>
                  <span className="text-sm text-gray-700">Belum Check-in</span>
                </div>
                <span className="font-semibold text-gray-800">{dashboardData.not_checked_in_count}</span>
              </div>

              {/* Checked In */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                  <span className="text-sm text-gray-700">Sudah Check-in</span>
                </div>
                <span className="font-semibold text-gray-800">{dashboardData.checked_in_count}</span>
              </div>

              {/* Cancelled */}
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-red-500 mr-3"></div>
                  <span className="text-sm text-gray-700">Dibatalkan</span>
                </div>
                <span className="font-semibold text-gray-800">{dashboardData.cancelled_count}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
            <Link to="/admin/bookings" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
              Lihat semua booking <i className="fas fa-arrow-right ml-1 text-xs"></i>
            </Link>
          </div>
        </div>

        {/* Latest Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden lg:col-span-2">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Booking Terbaru</h2>
            <Link to="/admin/bookings" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
              Lihat Semua
            </Link>
          </div>
          <div className="p-3">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengguna
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dashboardData.latest_bookings.length > 0 ? (
                    dashboardData.latest_bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-indigo-600">
                          {booking.booking_code}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {booking.user?.name || 'Pengguna'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatDate(booking.booking_date)}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-700">
                          Rp {formatCurrency(booking.total_amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <i className="fas fa-ticket-alt text-2xl text-gray-300 mb-2"></i>
                          <p>Belum ada data booking terbaru</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;