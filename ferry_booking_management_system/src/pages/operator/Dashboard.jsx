import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
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
    if (dashboardData.summary.bookingChartData && dashboardData.summary.bookingChartData.length > 0) {
      renderChart();
    }
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

      // Debug logging
      console.log('Stats Response:', statsResponse);
      console.log('Summary Response:', summaryResponse);

      // Handle response structure dengan benar
      const statsData = statsResponse.data?.data || {};
      const summaryData = summaryResponse.data?.data || {};

      console.log('Stats Data:', statsData);
      console.log('Summary Data:', summaryData);

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

    const labels = dashboardData.summary.bookingChartData.map(item => item.date);
    const data = dashboardData.summary.bookingChartData.map(item => item.total);
    const maxValue = Math.max(...data);
    const yMax = Math.max(5, Math.ceil(maxValue * 1.2));

    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Jumlah Booking',
          data: data,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 3,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: 'rgba(99, 102, 241, 1)',
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
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
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            titleFont: {
              size: 16,
              weight: 'bold'
            },
            bodyFont: {
              size: 14
            },
            padding: 12,
            borderColor: 'rgba(99, 102, 241, 0.3)',
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
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12,
                family: "'Inter', sans-serif"
              },
              color: '#6B7280'
            }
          },
          y: {
            min: 0,
            max: yMax,
            ticks: {
              stepSize: 1,
              precision: 0,
              font: {
                size: 12,
                family: "'Inter', sans-serif"
              },
              color: '#6B7280'
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.2)'
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
        return 'bg-indigo-500';
    }
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  const { stats, summary } = dashboardData;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Operator</h1>
          <p className="mt-1 text-sm text-gray-600">Selamat datang kembali! Berikut adalah ringkasan operasional Anda.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative z-10">
              <p className="text-sm font-medium text-blue-100">Total Jadwal</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalSchedules}</p>
              <Link to="/operator/schedules" className="inline-flex items-center mt-3 text-sm text-blue-100 hover:text-white transition-colors">
                Lihat Detail
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10"></div>
            <div className="absolute right-4 top-4 text-white/20">
              <i className="fas fa-calendar-alt text-5xl"></i>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 px-6 py-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative z-10">
              <p className="text-sm font-medium text-emerald-100">Total Booking</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalBookings}</p>
              <Link to="/operator/bookings" className="inline-flex items-center mt-3 text-sm text-emerald-100 hover:text-white transition-colors">
                Lihat Detail
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10"></div>
            <div className="absolute right-4 top-4 text-white/20">
              <i className="fas fa-ticket-alt text-5xl"></i>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 px-6 py-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative z-10">
              <p className="text-sm font-medium text-amber-100">Booking Bulan Ini</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.bookingsThisMonth}</p>
              <Link to="/operator/bookings" className="inline-flex items-center mt-3 text-sm text-amber-100 hover:text-white transition-colors">
                Lihat Detail
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10"></div>
            <div className="absolute right-4 top-4 text-white/20">
              <i className="fas fa-calendar-check text-5xl"></i>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 px-6 py-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative z-10">
              <p className="text-sm font-medium text-purple-100">Pendapatan Bulan Ini</p>
              <p className="text-3xl font-bold text-white mt-2">Rp {formatCurrency(stats.revenueThisMonth)}</p>
              <Link to={`/operator/reports/monthly?month=${new Date().toISOString().slice(0, 7)}`}
                className="inline-flex items-center mt-3 text-sm text-purple-100 hover:text-white transition-colors">
                Lihat Detail
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10"></div>
            <div className="absolute right-4 top-4 text-white/20">
              <i className="fas fa-money-bill text-5xl"></i>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Grafik Booking 7 Hari Terakhir</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
                  Jumlah Booking
                </div>
              </div>
              <div className="relative h-80">
                <canvas id="bookingChart" className="w-full h-full"></canvas>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-indigo-100">
              <div className="px-6 py-5 border-b border-indigo-100 bg-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <svg className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Jadwal Hari Ini
                  </h3>
                  <span className="text-sm text-gray-500 font-medium">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {summary.todaySchedules.length > 0 ? (
                  <div className="space-y-3">
                    {summary.todaySchedules.map((schedule) => (
                      <div key={schedule.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-indigo-300">
                        <div className="p-4">
                          <table className="w-full">
                            <tbody>
                              <tr>
                                {/* Ferry Icon Column */}
                                <td className="w-14 align-top">
                                  <div className="bg-indigo-100 rounded-lg p-2 w-11 h-11 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.553-.894L9 7m0 13l6-3m-6 3V7m6 10l3.447 1.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.553-.894L15 7m0 10V7" />
                                    </svg>
                                  </div>
                                </td>

                                {/* Ferry Name and Route Column */}
                                <td className="px-3 align-top w-2/5">
                                  <h4 className="text-base font-semibold text-gray-900">
                                    {schedule.ferry.name}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                                    <span>{schedule.route.origin}</span>
                                    <svg className="h-3 w-3 mx-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <span>{schedule.route.destination}</span>
                                  </p>
                                </td>

                                {/* Departure Time Column */}
                                <td className="px-3 align-top w-1/4">
                                  <div className="flex items-start gap-2">
                                    <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                      <span className="text-xs text-gray-500 block">Berangkat</span>
                                      <span className="text-sm font-semibold text-gray-900">
                                        {new Date(schedule.departure_time).toLocaleTimeString('id-ID', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: false
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Arrival Time Column */}
                                <td className="px-3 align-top w-1/4">
                                  <div className="flex items-start gap-2">
                                    <svg className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    <div>
                                      <span className="text-xs text-gray-500 block">Tiba</span>
                                      <span className="text-sm font-semibold text-gray-900">
                                        {new Date(schedule.arrival_time).toLocaleTimeString('id-ID', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: false
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-8 text-center">
                    <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium">Tidak ada jadwal untuk hari ini</p>
                    <p className="text-gray-400 text-sm mt-1">Silakan periksa jadwal untuk hari lain</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Quick Menu */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu Pintasan</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/operator/bookings/check-in"
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-center text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <i className="fas fa-check-circle text-3xl mb-2"></i>
                  <p className="text-sm font-medium">Check-in Penumpang</p>
                  <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </Link>

                <Link
                  to="/operator/bookings"
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 text-center text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <i className="fas fa-list text-3xl mb-2"></i>
                  <p className="text-sm font-medium">Daftar Booking</p>
                  <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </Link>

                <Link
                  to="/operator/schedules"
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-4 text-center text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <i className="fas fa-calendar-alt text-3xl mb-2"></i>
                  <p className="text-sm font-medium">Kelola Jadwal</p>
                  <div className="absolute inset-0 bg-green-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </Link>

                <Link
                  to="/operator/reports"
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-center text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <i className="fas fa-chart-bar text-3xl mb-2"></i>
                  <p className="text-sm font-medium">Laporan Operasional</p>
                  <div className="absolute inset-0 bg-orange-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </Link>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terkini</h3>
              <div className="space-y-4">
                {summary.recentActivities.length > 0 ? (
                  summary.recentActivities.map((activity, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.activity_type}</p>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.created_at)}</p>
                        </div>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityBadgeClass(activity.status)} text-white`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Belum ada aktivitas terbaru</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;