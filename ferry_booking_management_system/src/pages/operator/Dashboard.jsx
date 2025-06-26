import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
import {
  Calendar, Clock, Layers, Navigation, Users, CreditCard,
  BarChart2, Activity, CheckCircle, List, Ship, FileText
} from 'lucide-react';
import operatorDashboardService from '../../services/operatorDashboard.service';
import { formatCurrency } from '../../utils/formatters';

const OperatorDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalSchedules: 0,
      totalBookings: 0,
      bookingsThisMonth: 0,
      revenueThisMonth: 0,
      noRoutesAssigned: false
    },
    summary: {
      noRoutesAssigned: false,
      routes: [],
      bookingChartData: [],
      todaySchedules: [],
      recentActivities: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Selalu render chart meskipun tidak ada data
    renderChart();
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [dashboardData.summary.bookingChartData]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, summaryResponse] = await Promise.all([
        operatorDashboardService.getStats(),
        operatorDashboardService.getSummary()
      ]);

      // Handle response structure dengan benar
      const statsData = statsResponse.data?.data || {};
      const summaryData = summaryResponse.data?.data || {};

      setDashboardData({
        stats: {
          totalSchedules: statsData.totalSchedules || 0,
          totalBookings: statsData.totalBookings || 0,
          bookingsThisMonth: statsData.bookingsThisMonth || 0,
          revenueThisMonth: statsData.revenueThisMonth || 0,
          noRoutesAssigned: statsData.noRoutesAssigned || false
        },
        summary: {
          noRoutesAssigned: summaryData.noRoutesAssigned || false,
          routes: summaryData.routes || [],
          bookingChartData: summaryData.bookingChartData || [],
          todaySchedules: summaryData.todaySchedules || [],
          recentActivities: summaryData.recentActivities || []
        }
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      console.error('Error details:', error.response?.data);

      // Set default values on error
      setDashboardData({
        stats: {
          totalSchedules: 0,
          totalBookings: 0,
          bookingsThisMonth: 0,
          revenueThisMonth: 0,
          noRoutesAssigned: true
        },
        summary: {
          noRoutesAssigned: true,
          routes: [],
          bookingChartData: [],
          todaySchedules: [],
          recentActivities: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    const ctx = document.getElementById('bookingChart');
    if (!ctx) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    // Periksa apakah ada data booking
    const hasData = dashboardData.summary.bookingChartData && dashboardData.summary.bookingChartData.length > 0;

    // Siapkan data default jika tidak ada data
    const labels = hasData
      ? dashboardData.summary.bookingChartData.map(item => item.date)
      : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    const data = hasData
      ? dashboardData.summary.bookingChartData.map(item => item.total)
      : [0, 0, 0, 0, 0, 0, 0];

    const maxValue = Math.max(...(hasData ? data : [5]));
    const yMax = Math.max(5, Math.ceil(maxValue * 1.2));

    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Jumlah Booking',
          data: data,
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          borderColor: 'rgba(56, 189, 248, 1)',
          borderWidth: 2.5,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: 'rgba(56, 189, 248, 1)',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            titleFont: {
              size: 14,
              weight: 'bold',
              family: "'Inter', 'Segoe UI', 'Helvetica', sans-serif"
            },
            bodyFont: {
              size: 13,
              family: "'Inter', 'Segoe UI', 'Helvetica', sans-serif"
            },
            padding: 12,
            borderColor: 'rgba(56, 189, 248, 0.3)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: function (tooltipItems) {
                return tooltipItems[0].label;
              },
              label: function (context) {
                return 'Booking: ' + context.parsed.y;
              }
            }
          },
          // Tampilkan watermark pesan jika tidak ada data
          ...(hasData ? {} : {
            title: {
              display: true,
              text: 'Belum ada data booking',
              font: {
                size: 16,
                family: "'Inter', 'Segoe UI', 'Helvetica', sans-serif",
                weight: 'normal'
              },
              color: '#94a3b8',
              padding: {
                top: 30
              }
            }
          })
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11,
                family: "'Inter', 'Segoe UI', 'Helvetica', sans-serif"
              },
              color: '#64748b'
            }
          },
          y: {
            min: 0,
            max: yMax,
            ticks: {
              stepSize: 1,
              precision: 0,
              font: {
                size: 11,
                family: "'Inter', 'Segoe UI', 'Helvetica', sans-serif"
              },
              color: '#64748b'
            },
            grid: {
              color: 'rgba(203, 213, 225, 0.5)'
            }
          }
        }
      }
    });

    setChartInstance(newChart);
  };

  const getActivityBadgeClass = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'CONFIRMED':
        return 'bg-emerald-500';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-500';
      case 'WARNING':
      case 'CHANGED':
        return 'bg-amber-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getActivityIcon = (activityType) => {
    // Map activity types to icons
    if (activityType.includes('Booking')) return <CreditCard className="h-5 w-5 text-sky-500" />;
    if (activityType.includes('Jadwal')) return <Calendar className="h-5 w-5 text-emerald-500" />;
    if (activityType.includes('Check-in')) return <CheckCircle className="h-5 w-5 text-indigo-500" />;
    if (activityType.includes('Perubahan')) return <Activity className="h-5 w-5 text-amber-500" />;
    return <Activity className="h-5 w-5 text-slate-500" />;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now - activityDate) / 60000);

    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} jam yang lalu`;
    return `${Math.floor(diffInMinutes / 1440)} hari yang lalu`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-t-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-700 font-medium">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  const { stats, summary } = dashboardData;

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Alert - hanya muncul jika pengguna tidak memiliki rute yang ditugaskan */}
        {(stats.noRoutesAssigned || summary.noRoutesAssigned) && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-5 mb-6 rounded-xl shadow-lg animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-yellow-800">Perhatian</h3>
                <p className="mt-1 text-sm text-yellow-700">Anda belum memiliki rute yang ditugaskan. Silakan hubungi administrator untuk mengatur rute yang dapat Anda akses.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header & Greeting */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Dashboard Operator</h1>
            <p className="mt-1.5 text-slate-600">
              <span className="font-medium">Selamat datang!</span> Pantau dan kelola operasional kapal ferry dengan mudah
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Jadwal */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="p-5 flex items-start relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl p-3.5 shadow-sm relative z-10">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 relative z-10">
                <p className="text-sm font-medium text-slate-500">Total Jadwal</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.totalSchedules}</h3>
                <div className="mt-2">
                  <Link to="/operator/schedules"
                    className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 group-hover:underline">
                    Lihat Detail
                    <svg className="ml-1 h-3 w-3 transform group-hover:translate-x-0.5 transition-transform duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Total Booking */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="p-5 flex items-start relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex-shrink-0 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl p-3.5 shadow-sm relative z-10">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 relative z-10">
                <p className="text-sm font-medium text-slate-500">Total Booking</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.totalBookings}</h3>
                <div className="mt-2">
                  <Link to="/operator/bookings"
                    className="inline-flex items-center text-xs font-medium text-emerald-600 hover:text-emerald-800 group-hover:underline">
                    Lihat Detail
                    <svg className="ml-1 h-3 w-3 transform group-hover:translate-x-0.5 transition-transform duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Bulan Ini */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="p-5 flex items-start relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex-shrink-0 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl p-3.5 shadow-sm relative z-10">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 relative z-10">
                <p className="text-sm font-medium text-slate-500">Booking Bulan Ini</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.bookingsThisMonth}</h3>
                <div className="mt-2">
                  <Link to="/operator/bookings"
                    className="inline-flex items-center text-xs font-medium text-amber-600 hover:text-amber-800 group-hover:underline">
                    Lihat Detail
                    <svg className="ml-1 h-3 w-3 transform group-hover:translate-x-0.5 transition-transform duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Pendapatan Bulan Ini */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="p-5 flex items-start relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-3.5 shadow-sm relative z-10">
                <BarChart2 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 relative z-10">
                <p className="text-sm font-medium text-slate-500">Pendapatan Bulan Ini</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">Rp {formatCurrency(stats.revenueThisMonth)}</h3>
                <div className="mt-2">
                  <Link
                    to={`/operator/reports/monthly?month=${new Date().toISOString().slice(0, 7)}`}
                    className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 group-hover:underline"
                  >
                    Lihat Detail
                    <svg className="ml-1 h-3 w-3 transform group-hover:translate-x-0.5 transition-transform duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Chart & Today's Schedule */}
          <div className="lg:col-span-2 space-y-8">
            {/* Chart */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-sky-600" />
                    Grafik Booking 7 Hari Terakhir
                  </h3>
                  <div className="flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                    <div className="w-2.5 h-2.5 bg-sky-500 rounded-full mr-1.5"></div>
                    Jumlah Booking
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="relative h-80">
                  <canvas id="bookingChart" className="w-full h-full"></canvas>
                  {(!dashboardData.summary.bookingChartData || dashboardData.summary.bookingChartData.length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center pointer-events-none">
                        <BarChart2 className="h-16 w-16 mx-auto text-slate-200 mb-2" />
                        <p className="text-slate-400 text-sm">Data booking 7 hari terakhir akan ditampilkan di sini</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-sky-600" />
                    Jadwal Hari Ini
                  </h3>
                  <span className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full font-medium">
                    {currentDate}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {summary.todaySchedules.length > 0 ? (
                  <div className="space-y-4">
                    {summary.todaySchedules.map((schedule) => (
                      <div key={schedule.id} className="bg-slate-50 rounded-xl border border-slate-200 hover:border-sky-300 transition-all duration-200 hover:shadow-md group">
                        <div className="p-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="bg-gradient-to-br from-sky-100 to-blue-50 rounded-lg p-3 flex items-center justify-center shadow-sm group-hover:shadow transition-all duration-200">
                                <Ship className="h-5 w-5 text-sky-700" />
                              </div>
                            </div>

                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between mb-1.5">
                                <h4 className="text-sm font-bold text-slate-900">
                                  {schedule.ferry.name}
                                </h4>
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
                                  Kapal Ferry
                                </span>
                              </div>

                              <div className="flex items-center text-xs text-slate-600 mb-3.5">
                                <span className="font-medium">{schedule.route.origin}</span>
                                <svg className="h-3.5 w-3.5 mx-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="font-medium">{schedule.route.destination}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-center">
                                  <div className="bg-emerald-100 p-2 rounded-lg shadow-sm">
                                    <Navigation className="h-4 w-4 text-emerald-700" />
                                  </div>
                                  <div className="ml-2.5">
                                    <span className="text-xs text-slate-500 block">Berangkat</span>
                                    <span className="text-sm font-semibold text-slate-800">
                                      {new Date(schedule.departure_time).toLocaleTimeString('id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                      })}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center">
                                  <div className="bg-sky-100 p-2 rounded-lg shadow-sm">
                                    <Layers className="h-4 w-4 text-sky-700" />
                                  </div>
                                  <div className="ml-2.5">
                                    <span className="text-xs text-slate-500 block">Tiba</span>
                                    <span className="text-sm font-semibold text-slate-800">
                                      {new Date(schedule.arrival_time).toLocaleTimeString('id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 text-center">
                    <Calendar className="mx-auto h-14 w-14 text-slate-300 mb-4" />
                    <p className="text-slate-700 text-sm font-medium">Tidak ada jadwal untuk hari ini</p>
                    <p className="text-slate-500 text-xs mt-2">Silakan periksa jadwal untuk hari lain</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Recent Activities */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-5 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Menu Pintasan</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <Link
                    to="/operator/bookings/check-in"
                    className="flex items-center p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:border-sky-300 hover:bg-gradient-to-br hover:from-sky-50 hover:to-blue-50 transition-all duration-200 shadow-sm hover:shadow group"
                  >
                    <div className="bg-gradient-to-br from-sky-100 to-blue-50 p-2.5 rounded-lg shadow-sm group-hover:shadow group-hover:from-sky-500 group-hover:to-blue-600 transition-all duration-200">
                      <CheckCircle className="h-5 w-5 text-sky-700 group-hover:text-white transition-colors duration-200" />
                    </div>
                    <div className="ml-3.5">
                      <p className="text-sm font-semibold text-slate-900">Check-in Penumpang</p>
                      <p className="text-xs text-slate-500 mt-0.5">Verifikasi kehadiran penumpang</p>
                    </div>
                  </Link>

                  <Link
                    to="/operator/bookings"
                    className="flex items-center p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:border-indigo-300 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 shadow-sm hover:shadow group"
                  >
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-50 p-2.5 rounded-lg shadow-sm group-hover:shadow group-hover:from-indigo-500 group-hover:to-purple-600 transition-all duration-200">
                      <List className="h-5 w-5 text-indigo-700 group-hover:text-white transition-colors duration-200" />
                    </div>
                    <div className="ml-3.5">
                      <p className="text-sm font-semibold text-slate-900">Daftar Booking</p>
                      <p className="text-xs text-slate-500 mt-0.5">Kelola reservasi penumpang</p>
                    </div>
                  </Link>

                  <Link
                    to="/operator/schedules"
                    className="flex items-center p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:border-emerald-300 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 transition-all duration-200 shadow-sm hover:shadow group"
                  >
                    <div className="bg-gradient-to-br from-emerald-100 to-green-50 p-2.5 rounded-lg shadow-sm group-hover:shadow group-hover:from-emerald-500 group-hover:to-green-600 transition-all duration-200">
                      <Calendar className="h-5 w-5 text-emerald-700 group-hover:text-white transition-colors duration-200" />
                    </div>
                    <div className="ml-3.5">
                      <p className="text-sm font-semibold text-slate-900">Kelola Jadwal</p>
                      <p className="text-xs text-slate-500 mt-0.5">Atur jadwal keberangkatan kapal</p>
                    </div>
                  </Link>

                  <Link
                    to="/operator/reports"
                    className="flex items-center p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:border-amber-300 hover:bg-gradient-to-br hover:from-amber-50 hover:to-yellow-50 transition-all duration-200 shadow-sm hover:shadow group"
                  >
                    <div className="bg-gradient-to-br from-amber-100 to-yellow-50 p-2.5 rounded-lg shadow-sm group-hover:shadow group-hover:from-amber-500 group-hover:to-yellow-600 transition-all duration-200">
                      <FileText className="h-5 w-5 text-amber-700 group-hover:text-white transition-colors duration-200" />
                    </div>
                    <div className="ml-3.5">
                      <p className="text-sm font-semibold text-slate-900">Laporan Operasional</p>
                      <p className="text-xs text-slate-500 mt-0.5">Lihat data operasional kapal</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-5 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-sky-600" />
                  Aktivitas Terkini
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {summary.recentActivities.length > 0 ? (
                    summary.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start py-3 px-2 border-b border-slate-100 last:border-0 last:pb-0 hover:bg-slate-50 rounded-lg transition-colors duration-150">
                        <div className="flex-shrink-0 mr-3.5 p-1.5 bg-slate-100 rounded-lg">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-slate-900 truncate">{activity.activity_type}</p>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityBadgeClass(activity.status)} text-white shadow-sm`}>
                              {activity.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mb-1">{activity.description}</p>
                          <p className="text-xs text-slate-400">{formatTimeAgo(activity.created_at)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
                      <Activity className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-sm text-slate-600 font-medium">Belum ada aktivitas terbaru</p>
                      <p className="text-xs text-slate-500 mt-1">Aktivitas akan muncul di sini</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;