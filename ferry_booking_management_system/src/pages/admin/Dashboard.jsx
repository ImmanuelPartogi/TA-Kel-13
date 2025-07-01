import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import Chart from 'chart.js/auto';

const AdminDashboard = () => {
  // Custom palette - Soft professional colors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    users_count: 0,
    ferries_count: 0,
    routes_count: 0,
    active_schedules: 0,
    monthly_bookings: 0,
    monthly_income: 0,
    userGrowth: 0,
    bookingGrowth: 0,
    incomeGrowth: 0,
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
  const statusChartRef = useRef(null);
  const [chartView, setChartView] = useState('weekly');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();

    // Cleanup function
    return () => {
      if (bookingChartRef.current) {
        bookingChartRef.current.destroy();
      }
      if (statusChartRef.current) {
        statusChartRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!loading && chartRef.current && dashboardData.weekly_booking_data.length > 0) {
      initializeChart();
      initializeStatusChart();
    }
  }, [loading, chartView, dashboardData]);

  const fetchDashboardData = async () => {
    try {
      setError(null);

      // Fetch both endpoints with error handling
      let statsResponse, summaryResponse;

      try {
        statsResponse = await api.get('/admin-panel/dashboard/stats');
      } catch (statsError) {
        console.error('Stats fetch error:', statsError.response || statsError);
        throw new Error(`Stats endpoint error: ${statsError.response?.status || statsError.message}`);
      }

      try {
        summaryResponse = await api.get('/admin-panel/dashboard/summary');
      } catch (summaryError) {
        console.error('Summary fetch error:', summaryError.response || summaryError);
        // Don't fail completely if summary fails, use stats data only
        summaryResponse = { data: { success: true, data: {} } };
      }

      // Check response format
      if (!statsResponse.data) {
        throw new Error('Invalid stats response format');
      }

      // Handle different response formats (wrapped vs unwrapped)
      let statsData, summaryData;

      // Check if data is wrapped with success flag
      if (statsResponse.data.success !== undefined) {
        if (!statsResponse.data.success) {
          throw new Error('Stats API returned success: false');
        }
        statsData = statsResponse.data.data;
      } else {
        // Data might be directly in response.data
        statsData = statsResponse.data;
      }

      // Same for summary data
      if (summaryResponse.data.success !== undefined) {
        summaryData = summaryResponse.data.data || {};
      } else {
        summaryData = summaryResponse.data || {};
      }

      // Map the data based on actual structure
      const mappedData = {
        // Direct mapping if flat structure
        users_count: statsData.users_count || statsData.stats?.users_count || 0,
        ferries_count: statsData.ferries_count || statsData.stats?.ferries_count || 0,
        routes_count: statsData.routes_count || statsData.stats?.routes_count || 0,
        active_schedules: statsData.active_schedules || statsData.stats?.active_schedules || 0,
        monthly_bookings: statsData.monthly_bookings || statsData.stats?.monthly_bookings || 0,
        monthly_income: statsData.monthly_income || statsData.stats?.monthly_income || 0,
        bookingGrowth: statsData.bookingGrowth ?? statsData.booking_growth ?? statsData.stats?.booking_growth ?? 0,
        incomeGrowth: statsData.incomeGrowth ?? statsData.income_growth ?? statsData.stats?.income_growth ?? 0,

        // Booking status
        pending_payment_count: statsData.pending_payment_count || statsData.booking_status?.pending_payment || 0,
        not_checked_in_count: statsData.not_checked_in_count || statsData.booking_status?.not_checked_in || 0,
        checked_in_count: statsData.checked_in_count || statsData.booking_status?.checked_in || 0,
        cancelled_count: statsData.cancelled_count || statsData.booking_status?.cancelled || 0,

        // Charts
        weekly_booking_labels: statsData.weekly_booking_labels || statsData.charts?.weekly?.labels || ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        weekly_booking_data: statsData.weekly_booking_data || statsData.charts?.weekly?.data || [0, 0, 0, 0, 0, 0, 0],

        // From summary endpoint
        latest_bookings: summaryData.latest_bookings || [],
        monthly_booking_labels: summaryData.monthly_booking_labels || summaryData.charts?.monthly?.labels || [],
        monthly_booking_data: summaryData.monthly_booking_data || summaryData.charts?.monthly?.data || [],
        userGrowth: summaryData.userGrowth ?? summaryData.user_growth ?? 0
      };

      setDashboardData(mappedData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);

      // Set more specific error message based on error type
      let errorMessage = 'Gagal memuat data dashboard. ';

      if (error.response) {
        // HTTP error response
        errorMessage += `Error ${error.response.status}: ${error.response.statusText}`;
        if (error.response.status === 401) {
          errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
        } else if (error.response.status === 404) {
          errorMessage = 'API endpoint tidak ditemukan. Periksa konfigurasi server.';
        }
      } else if (error.request) {
        // Network error
        errorMessage += 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else {
        // Other errors
        errorMessage += error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const initializeChart = () => {
    const ctx = chartRef.current.getContext('2d');

    // Destroy existing chart if exists
    if (bookingChartRef.current) {
      bookingChartRef.current.destroy();
    }

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(14, 165, 233, 0.12)');  // sky-500 with low opacity
    gradient.addColorStop(1, 'rgba(14, 165, 233, 0.01)');  // sky-500 with very low opacity

    const chartData = {
      labels: chartView === 'weekly' ? dashboardData.weekly_booking_labels : dashboardData.monthly_booking_labels,
      datasets: [{
        label: 'Jumlah Booking',
        data: chartView === 'weekly' ? dashboardData.weekly_booking_data : dashboardData.monthly_booking_data,
        borderColor: 'rgb(14, 165, 233)',  // sky-500
        backgroundColor: gradient,
        tension: 0.4,
        fill: true,
        borderWidth: 2.5,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: 'rgb(14, 165, 233)',  // sky-500
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animations: {
        tension: {
          duration: 1000,
          easing: 'linear'
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          padding: 12,
          titleFont: {
            size: 14,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          bodyFont: {
            size: 13,
            family: "'Inter', sans-serif"
          },
          displayColors: false,
          cornerRadius: 8,
          caretSize: 6
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            font: {
              size: 12,
              family: "'Inter', sans-serif"
            },
            color: 'rgba(107, 114, 128, 0.8)'
          },
          grid: {
            color: 'rgba(243, 244, 246, 0.8)',
            borderDash: [5, 5]
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12,
              family: "'Inter', sans-serif"
            },
            color: 'rgba(107, 114, 128, 0.8)'
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

  const initializeStatusChart = () => {
    const statusCtx = document.getElementById('status-chart');
    if (!statusCtx) return;

    if (statusChartRef.current) {
      statusChartRef.current.destroy();
    }

    const total = dashboardData.pending_payment_count + dashboardData.not_checked_in_count +
      dashboardData.checked_in_count + dashboardData.cancelled_count;

    if (total === 0) return;

    statusChartRef.current = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['Menunggu Pembayaran', 'Belum Check-in', 'Sudah Check-in', 'Dibatalkan'],
        datasets: [{
          data: [
            dashboardData.pending_payment_count,
            dashboardData.not_checked_in_count,
            dashboardData.checked_in_count,
            dashboardData.cancelled_count
          ],
          backgroundColor: [
            'rgb(14, 165, 233)',  // sky-500
            'rgb(245, 158, 11)',  // amber-500
            'rgb(20, 184, 166)',  // teal-500
            'rgb(244, 63, 94)'    // rose-500
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
          borderRadius: 5,
          hoverOffset: 5
        }]
      },
      options: {
        cutout: '70%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            padding: 12,
            titleFont: {
              size: 14,
              family: "'Inter', sans-serif",
              weight: '600'
            },
            bodyFont: {
              size: 13,
              family: "'Inter', sans-serif"
            },
            displayColors: false,
            cornerRadius: 8
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const formatDate = (dateString) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const date = new Date(dateString);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': 'bg-sky-50 text-sky-700',
      'CONFIRMED': 'bg-teal-50 text-teal-700',
      'CANCELLED': 'bg-rose-50 text-rose-700',
      'COMPLETED': 'bg-slate-50 text-slate-700'
    };
    return statusMap[status] || 'bg-slate-50 text-slate-700';
  };

  const filteredBookings = dashboardData.latest_bookings.filter(booking =>
    booking.booking_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRetry = () => {
    setLoading(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-md">
          <div className="w-16 h-16 mx-auto relative">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-sky-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-sky-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-700 text-lg font-medium">Memuat dashboard...</p>
          <p className="mt-2 text-slate-500 text-sm">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-md">
          <div className="w-20 h-20 mx-auto flex items-center justify-center bg-rose-50 rounded-full mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Terjadi Kesalahan</h3>
          <p className="text-slate-600 mb-6 text-sm">{error}</p>
          <button
            onClick={handleRetry}
            className="px-5 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 shadow-md"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
              <p className="mt-1 text-slate-500">Ringkasan dan statistik sistem</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* User Stats Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-all transform hover:-translate-y-1 duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3.5 rounded-xl bg-sky-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h2 className="text-sm font-medium text-slate-400">Total Pengguna</h2>
                  <div className="flex items-baseline mt-2">
                    <p className="text-2xl font-bold text-slate-800">{dashboardData.users_count}</p>
                    {dashboardData.userGrowth !== 0 && (
                      <p className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${dashboardData.userGrowth > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} flex items-center`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-0.5 ${dashboardData.userGrowth > 0 ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        {Math.abs(dashboardData.userGrowth)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
              <Link to="/admin/users" className="text-sm font-medium text-sky-600 hover:text-sky-800 flex items-center">
                Lihat detail
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Ferry Stats Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-all transform hover:-translate-y-1 duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3.5 rounded-xl bg-teal-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h2 className="text-sm font-medium text-slate-400">Total Kapal</h2>
                  <div className="flex items-baseline mt-2">
                    <p className="text-2xl font-bold text-slate-800">{dashboardData.ferries_count}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
              <Link to="/admin/ferries" className="text-sm font-medium text-teal-600 hover:text-teal-800 flex items-center">
                Lihat detail
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Routes Stats Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-all transform hover:-translate-y-1 duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3.5 rounded-xl bg-purple-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h2 className="text-sm font-medium text-slate-400">Total Rute</h2>
                  <div className="flex items-baseline mt-2">
                    <p className="text-2xl font-bold text-slate-800">{dashboardData.routes_count}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
              <Link to="/admin/routes" className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center">
                Lihat detail
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Active Schedules Stats Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-all transform hover:-translate-y-1 duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3.5 rounded-xl bg-amber-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h2 className="text-sm font-medium text-slate-400">Jadwal Aktif</h2>
                  <div className="flex items-baseline mt-2">
                    <p className="text-2xl font-bold text-slate-800">{dashboardData.active_schedules}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
              <Link to="/admin/schedules" className="text-sm font-medium text-amber-600 hover:text-amber-800 flex items-center">
                Lihat detail
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Chart and Revenue Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Weekly Booking Chart */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 lg:col-span-2">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Analisis Booking</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setChartView('weekly')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${chartView === 'weekly'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Mingguan
                </button>
                <button
                  onClick={() => setChartView('monthly')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${chartView === 'monthly'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Bulanan
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="h-72">
                <canvas ref={chartRef}></canvas>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-6">
                  <div>
                    <span className="block text-sm text-slate-500">Total Booking</span>
                    <span className="block text-lg font-bold text-slate-800 mt-1">
                      {chartView === 'weekly'
                        ? dashboardData.weekly_booking_data.reduce((a, b) => a + b, 0)
                        : dashboardData.monthly_booking_data.reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                  <div className="hidden md:block h-10 border-l border-slate-200"></div>
                  <div>
                    <span className="block text-sm text-slate-500">Rata-rata per Hari</span>
                    <span className="block text-lg font-bold text-slate-800 mt-1">
                      {chartView === 'weekly'
                        ? Math.round(dashboardData.weekly_booking_data.reduce((a, b) => a + b, 0) / 7)
                        : Math.round(dashboardData.monthly_booking_data.reduce((a, b) => a + b, 0) / dashboardData.monthly_booking_data.length)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${dashboardData.bookingGrowth >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${dashboardData.bookingGrowth >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      {Math.abs(dashboardData.bookingGrowth)}% dari periode sebelumnya
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue and Booking Stats */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Pendapatan</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <span className="block text-sm text-slate-500">Pendapatan Bulan Ini</span>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold text-teal-600">Rp {formatCurrency(dashboardData.monthly_income)}</span>
                  {dashboardData.incomeGrowth !== undefined && (
                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${dashboardData.incomeGrowth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} flex items-center`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-0.5 ${dashboardData.incomeGrowth >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      {Math.abs(dashboardData.incomeGrowth)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <span className="block text-sm text-slate-500">Booking Bulan Ini</span>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold text-sky-600">{dashboardData.monthly_bookings}</span>
                  {dashboardData.bookingGrowth !== undefined && (
                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${dashboardData.bookingGrowth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} flex items-center`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-0.5 ${dashboardData.bookingGrowth >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      {Math.abs(dashboardData.bookingGrowth)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Nilai Booking Rata-rata</span>
                  <span className="text-sm font-medium text-teal-600">
                    Rp {dashboardData.monthly_bookings ? formatCurrency(Math.round(dashboardData.monthly_income / dashboardData.monthly_bookings)) : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Target Bulanan</span>
                  <span className="text-sm font-medium text-slate-800">
                    {Math.min(100, Math.round((dashboardData.monthly_income / 100000000) * 100))}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-slate-200 rounded-full h-2.5">
                  <div
                    className="bg-teal-500 h-2.5 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.round((dashboardData.monthly_income / 100000000) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
              {(() => {
                // Dapatkan tanggal 1 bulan ini
                const startDate = new Date();
                startDate.setDate(1);
                const formattedStartDate = startDate.toISOString().slice(0, 10);

                // Dapatkan tanggal terakhir bulan ini
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1);
                endDate.setDate(0);
                const formattedEndDate = endDate.toISOString().slice(0, 10);

                const reportUrl = `/admin/reports/revenue?start_date=${formattedStartDate}&end_date=${formattedEndDate}&group_by=monthly`;

                return (
                  <Link
                    to={reportUrl}
                    className="text-sm font-medium text-sky-600 hover:text-sky-800 flex items-center"
                  >
                    Lihat laporan keuangan
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Status Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Status Booking</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-center">
                  <div className="w-48 h-48 relative">
                    <canvas id="status-chart"></canvas>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-slate-800">
                          {dashboardData.pending_payment_count + dashboardData.not_checked_in_count + dashboardData.checked_in_count + dashboardData.cancelled_count}
                        </span>
                        <span className="block text-xs text-slate-500">Total</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Waiting for Payment */}
                <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-sky-200 hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-sky-500 mr-3"></div>
                    <span className="text-sm font-medium text-slate-700">Menunggu Pembayaran</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{dashboardData.pending_payment_count}</span>
                </div>

                {/* Not Checked In */}
                <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-200 hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-amber-500 mr-3"></div>
                    <span className="text-sm font-medium text-slate-700">Belum Check-in</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{dashboardData.not_checked_in_count}</span>
                </div>

                {/* Checked In */}
                <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-teal-200 hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-teal-500 mr-3"></div>
                    <span className="text-sm font-medium text-slate-700">Sudah Check-in</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{dashboardData.checked_in_count}</span>
                </div>

                {/* Cancelled */}
                <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-rose-200 hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-rose-500 mr-3"></div>
                    <span className="text-sm font-medium text-slate-700">Dibatalkan</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{dashboardData.cancelled_count}</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
              <Link to="/admin/bookings" className="text-sm font-medium text-sky-600 hover:text-sky-800 flex items-center">
                Lihat semua booking
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Latest Bookings Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 lg:col-span-2">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="font-semibold text-slate-800 mb-3 md:mb-0">Booking Terbaru</h2>
              <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
                <div className="relative text-slate-500 focus-within:text-sky-600">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Cari booking..."
                    className="py-2 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Link to="/admin/bookings" className="text-sm font-medium text-sky-600 hover:text-sky-800 flex justify-center md:justify-start">
                  Lihat Semua
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider rounded-tl-lg">
                        Kode
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Pengguna
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider rounded-tr-lg">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 text-sm font-medium text-sky-600">
                            <Link to={`/admin/bookings/${booking.id}`} className="hover:underline">
                              {booking.booking_code}
                            </Link>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="h-8 w-8 flex-shrink-0 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-medium text-sm">
                                {(booking.user?.name || 'User').charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-slate-700">{booking.user?.name || 'Pengguna'}</p>
                                <p className="text-xs text-slate-500">{booking.user?.email || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-500">
                            {formatDate(booking.created_at || booking.booking_date)}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-slate-700">
                            Rp {formatCurrency(booking.total_amount)}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${getStatusBadge(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-base font-medium text-slate-700">Tidak ada data</p>
                            <p className="text-sm text-slate-500 mt-1">Belum ada booking atau tidak ada hasil yang cocok dengan pencarian Anda</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">
                  Menampilkan {Math.min(5, filteredBookings.length)} dari {dashboardData.monthly_bookings} booking
                </p>
                <div>
                  <Link to="/admin/bookings" className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                    Lihat semua booking
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden border border-slate-100">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Aksi Cepat</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link to="/admin/ferries/create" className="p-4 flex items-center rounded-xl border border-slate-200 hover:border-teal-200 hover:bg-teal-50 transition-colors">
                <div className="flex-shrink-0 p-3 rounded-lg bg-teal-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m1.5-12A9 9 0 1023.25 12 9 9 0 0010.5 2.25z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-slate-700">Tambah Kapal</h3>
                  <p className="text-xs text-slate-500 mt-1">Daftarkan kapal baru</p>
                </div>
              </Link>

              <Link to="/admin/routes/create" className="p-4 flex items-center rounded-xl border border-slate-200 hover:border-purple-200 hover:bg-purple-50 transition-colors">
                <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-slate-700">Tambah Rute</h3>
                  <p className="text-xs text-slate-500 mt-1">Buat rute perjalanan baru</p>
                </div>
              </Link>

              <Link to="/admin/schedules/create" className="p-4 flex items-center rounded-xl border border-slate-200 hover:border-amber-200 hover:bg-amber-50 transition-colors">
                <div className="flex-shrink-0 p-3 rounded-lg bg-amber-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-slate-700">Tambah Jadwal</h3>
                  <p className="text-xs text-slate-500 mt-1">Buat jadwal pelayaran baru</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;