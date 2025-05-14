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
      revenueThisMonth: 0
    },
    noRoutesAssigned: false,
    routes: [],
    bookingChartData: [],
    todaySchedules: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (dashboardData.bookingChartData.length > 0) {
      renderChart();
    }
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [dashboardData.bookingChartData]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, summaryResponse] = await Promise.all([
        operatorDashboardService.getStats(),
        operatorDashboardService.getSummary()
      ]);

      // // Tambahkan logging untuk debug
      // console.log('Stats Response:', statsResponse);
      // console.log('Summary Response:', summaryResponse);

      // Cek struktur response - apakah ada property 'data' atau tidak
      const statsData = statsResponse.data || statsResponse;
      const summaryData = summaryResponse.data || summaryResponse;

      // console.log('Stats Data:', statsData);
      // console.log('Summary Data:', summaryData);

      // Cek apakah data undefined sebelum mengakses propertinya
      if (!statsData || !summaryData) {
        throw new Error('Invalid response structure');
      }

      setDashboardData({
        stats: statsData,
        noRoutesAssigned: summaryData.noRoutesAssigned || false,
        routes: summaryData.routes || [],
        bookingChartData: summaryData.bookingChartData || [],
        todaySchedules: summaryData.todaySchedules || [],
        recentActivities: summaryData.recentActivities || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      console.error('Error details:', error.response);

      // Set default values
      setDashboardData({
        stats: {
          totalSchedules: 0,
          totalBookings: 0,
          bookingsThisMonth: 0,
          revenueThisMonth: 0
        },
        noRoutesAssigned: true,
        routes: [],
        bookingChartData: [],
        todaySchedules: [],
        recentActivities: []
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

    const labels = dashboardData.bookingChartData.map(item => item.date);
    const data = dashboardData.bookingChartData.map(item => item.total);
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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Operator</h1>
          <p className="mt-1 text-sm text-gray-600">Selamat datang kembali! Berikut adalah ringkasan operasional Anda.</p>
        </div>

        {/* Alert Messages */}
        {dashboardData.noRoutesAssigned && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Perhatian</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>Anda belum memiliki rute yang ditugaskan. Semua data yang ditampilkan di dashboard akan kosong.
                    Silakan hubungi administrator untuk mengatur rute yang dapat Anda akses.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!dashboardData.noRoutesAssigned && dashboardData.routes.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Rute Yang Ditugaskan</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {dashboardData.routes.map((route) => (
                      <li key={route.id}>{route.origin} - {route.destination}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative z-10">
              <p className="text-sm font-medium text-blue-100">Total Jadwal</p>
              <p className="text-3xl font-bold text-white mt-2">{dashboardData.stats.totalSchedules}</p>
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
              <p className="text-3xl font-bold text-white mt-2">{dashboardData.stats.totalBookings}</p>
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
              <p className="text-3xl font-bold text-white mt-2">{dashboardData.stats.bookingsThisMonth}</p>
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
              <p className="text-3xl font-bold text-white mt-2">Rp {formatCurrency(dashboardData.stats.revenueThisMonth)}</p>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Jadwal Hari Ini</h3>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rute
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kapal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Keberangkatan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kedatangan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.todaySchedules.length > 0 ? (
                      dashboardData.todaySchedules.map((schedule) => (
                        <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {schedule.route.origin} - {schedule.route.destination}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {schedule.ferry.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {schedule.departure_time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {schedule.arrival_time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              to={`/operator/reports/daily?date=${new Date().toISOString().slice(0, 10)}`}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                              <i className="fas fa-eye mr-1"></i> Detail
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                          <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="mt-2">Tidak ada jadwal untuk hari ini</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
                {dashboardData.recentActivities.length > 0 ? (
                  dashboardData.recentActivities.map((activity, index) => (
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