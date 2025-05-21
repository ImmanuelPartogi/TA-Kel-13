import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api'; // Import existing API service
import Chart from 'chart.js/auto';

const AdminDashboard = () => {
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
    
    // Cleanup function
    return () => {
      if (bookingChartRef.current) {
        bookingChartRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!loading && chartRef.current && dashboardData.weekly_booking_data.length > 0) {
      initializeChart();
    }
  }, [loading, chartView, dashboardData.weekly_booking_data, dashboardData.monthly_booking_data]);

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

    const chartData = {
      labels: chartView === 'weekly' ? dashboardData.weekly_booking_labels : dashboardData.monthly_booking_labels,
      datasets: [{
        label: 'Jumlah Booking',
        data: chartView === 'weekly' ? dashboardData.weekly_booking_data : dashboardData.monthly_booking_data,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: 'rgb(99, 102, 241)',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
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
          padding: 10,
          titleFont: {
            size: 13,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          bodyFont: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          displayColors: false,
          cornerRadius: 6
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            font: {
              size: 11,
              family: "'Inter', sans-serif"
            },
            color: 'rgba(107, 114, 128, 0.7)'
          },
          grid: {
            color: 'rgba(243, 244, 246, 0.7)',
            borderDash: [4, 4]
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11,
              family: "'Inter', sans-serif" 
            },
            color: 'rgba(107, 114, 128, 0.7)'
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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const date = new Date(dateString);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': 'bg-blue-50 text-blue-700',
      'CONFIRMED': 'bg-emerald-50 text-emerald-700',
      'CANCELLED': 'bg-rose-50 text-rose-700',
      'COMPLETED': 'bg-gray-50 text-gray-700'
    };
    return statusMap[status] || 'bg-gray-50 text-gray-700';
  };

  const handleRetry = () => {
    setLoading(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-slate-600 text-sm font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-rose-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-slate-700 mb-4 text-sm">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        {/* User Stats Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-indigo-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Total Pengguna</p>
                <div className="flex items-end mt-1">
                  <p className="text-xl font-semibold text-slate-800">{dashboardData.users_count}</p>
                  {dashboardData.userGrowth !== 0 && (
                    <p className={`ml-2 text-xs ${dashboardData.userGrowth > 0 ? 'text-emerald-500' : 'text-rose-500'} flex items-center`}>
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
          <div className="px-5 py-2 border-t border-slate-100">
            <Link to="/admin/users" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
              Lihat detail 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Ferry Stats Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Total Kapal</p>
                <div className="flex items-end mt-1">
                  <p className="text-xl font-semibold text-slate-800">{dashboardData.ferries_count}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 py-2 border-t border-slate-100">
            <Link to="/admin/ferries" className="text-xs font-medium text-emerald-600 hover:text-emerald-800 flex items-center">
              Lihat detail 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Routes Stats Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-violet-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Total Rute</p>
                <div className="flex items-end mt-1">
                  <p className="text-xl font-semibold text-slate-800">{dashboardData.routes_count}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 py-2 border-t border-slate-100">
            <Link to="/admin/routes" className="text-xs font-medium text-violet-600 hover:text-violet-800 flex items-center">
              Lihat detail 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Active Schedules Stats Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Jadwal Aktif</p>
                <div className="flex items-end mt-1">
                  <p className="text-xl font-semibold text-slate-800">{dashboardData.active_schedules}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 py-2 border-t border-slate-100">
            <Link to="/admin/schedules" className="text-xs font-medium text-amber-600 hover:text-amber-800 flex items-center">
              Lihat detail 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue and Booking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Monthly Bookings Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-medium text-slate-800 text-sm">Booking Bulan Ini</h2>
          </div>
          <div className="px-5 py-6 flex flex-col items-center justify-center">
            <div className="text-center mb-2">
              <span className="text-3xl font-semibold text-indigo-600">{dashboardData.monthly_bookings}</span>
            </div>
            <p className="text-slate-500 text-sm mb-6">Total pemesanan</p>

            <div className="w-full p-4 bg-slate-50 rounded-lg">
              <h3 className="text-xs font-medium text-slate-600 mb-2">Pendapatan Bulan Ini</h3>
              <div className="text-center">
                <span className="text-lg font-semibold text-emerald-600">
                  Rp {formatCurrency(dashboardData.monthly_income)}
                </span>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-500">Dibandingkan bulan lalu</span>
            {dashboardData.bookingGrowth !== undefined ? (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${dashboardData.bookingGrowth >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`inline-block h-3 w-3 mr-0.5 ${dashboardData.bookingGrowth >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {Math.abs(dashboardData.bookingGrowth)}%
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">-</span>
            )}
          </div>
        </div>

        {/* Weekly Booking Chart */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-medium text-slate-800 text-sm">Booking 7 Hari Terakhir</h2>
            <div className="flex space-x-1">
              <button
                onClick={() => setChartView('weekly')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  chartView === 'weekly' 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Minggu Ini
              </button>
              <button
                onClick={() => setChartView('monthly')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  chartView === 'monthly' 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Bulan Ini
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="h-64">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        </div>
      </div>

      {/* Status and Latest Bookings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Booking Status Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-medium text-slate-800 text-sm">Status Booking</h2>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {/* Waiting for Payment */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-3"></div>
                  <span className="text-sm text-slate-700">Menunggu Pembayaran</span>
                </div>
                <span className="font-medium text-slate-800">{dashboardData.pending_payment_count}</span>
              </div>

              {/* Not Checked In */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500 mr-3"></div>
                  <span className="text-sm text-slate-700">Belum Check-in</span>
                </div>
                <span className="font-medium text-slate-800">{dashboardData.not_checked_in_count}</span>
              </div>

              {/* Checked In */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 mr-3"></div>
                  <span className="text-sm text-slate-700">Sudah Check-in</span>
                </div>
                <span className="font-medium text-slate-800">{dashboardData.checked_in_count}</span>
              </div>

              {/* Cancelled */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500 mr-3"></div>
                  <span className="text-sm text-slate-700">Dibatalkan</span>
                </div>
                <span className="font-medium text-slate-800">{dashboardData.cancelled_count}</span>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-slate-100">
            <Link to="/admin/bookings" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
              Lihat semua booking
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Latest Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-medium text-slate-800 text-sm">Booking Terbaru</h2>
            <Link to="/admin/bookings" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
              Lihat Semua
            </Link>
          </div>
          <div className="p-3">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr className="">
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
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
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardData.latest_bookings.length > 0 ? (
                    dashboardData.latest_bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-indigo-600">
                          {booking.booking_code}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-700">
                          {booking.user?.name || 'Pengguna'}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500">
                          {formatDate(booking.created_at || booking.booking_date)}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">
                          Rp {formatCurrency(booking.total_amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusBadge(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm">Belum ada data booking terbaru</p>
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