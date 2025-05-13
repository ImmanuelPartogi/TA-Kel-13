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

      setDashboardData({
        stats: statsResponse.data,
        noRoutesAssigned: summaryResponse.data.noRoutesAssigned,
        routes: summaryResponse.data.routes || [],
        bookingChartData: summaryResponse.data.bookingChartData || [],
        todaySchedules: summaryResponse.data.todaySchedules || [],
        recentActivities: summaryResponse.data.recentActivities || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              font: {
                size: 14
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            titleColor: '#333',
            bodyColor: '#333',
            titleFont: {
              size: 16,
              weight: 'bold'
            },
            bodyFont: {
              size: 14
            },
            padding: 10,
            borderColor: 'rgba(54, 162, 235, 0.8)',
            borderWidth: 1,
            usePointStyle: true,
            displayColors: false,
            callbacks: {
              title: function(tooltipItems) {
                return tooltipItems[0].label;
              },
              label: function(context) {
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
                size: 12
              }
            }
          },
          y: {
            min: 0,
            max: yMax,
            ticks: {
              stepSize: 1,
              precision: 0,
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
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
        return 'bg-green-500';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-500';
      case 'WARNING':
      case 'CHANGED':
        return 'bg-yellow-400';
      default:
        return 'bg-blue-400';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full px-4 py-6 mx-auto">
      {dashboardData.noRoutesAssigned && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-semibold">Perhatian</p>
          <p>Anda belum memiliki rute yang ditugaskan. Semua data yang ditampilkan di dashboard akan kosong.
            Silakan hubungi administrator untuk mengatur rute yang dapat Anda akses.</p>
        </div>
      )}

      {!dashboardData.noRoutesAssigned && dashboardData.routes.length > 0 && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
          <p className="font-semibold">Rute Yang Ditugaskan</p>
          <ul className="list-disc ml-5 mt-2">
            {dashboardData.routes.map((route) => (
              <li key={route.id}>{route.origin} - {route.destination}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">{dashboardData.stats.totalSchedules}</h3>
              <p className="text-sm">Total Jadwal</p>
            </div>
            <i className="fas fa-calendar-alt text-4xl"></i>
          </div>
          <Link to="/operator/schedules" className="block mt-4 text-sm underline">Lihat Detail</Link>
        </div>

        <div className="bg-green-500 text-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">{dashboardData.stats.totalBookings}</h3>
              <p className="text-sm">Total Booking</p>
            </div>
            <i className="fas fa-ticket-alt text-4xl"></i>
          </div>
          <Link to="/operator/bookings" className="block mt-4 text-sm underline">Lihat Detail</Link>
        </div>

        <div className="bg-yellow-400 text-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">{dashboardData.stats.bookingsThisMonth}</h3>
              <p className="text-sm">Booking Bulan Ini</p>
            </div>
            <i className="fas fa-calendar-check text-4xl"></i>
          </div>
          <Link to="/operator/bookings" className="block mt-4 text-sm underline">Lihat Detail</Link>
        </div>

        <div className="bg-red-500 text-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">Rp {formatCurrency(dashboardData.stats.revenueThisMonth)}</h3>
              <p className="text-sm">Pendapatan Bulan Ini</p>
            </div>
            <i className="fas fa-money-bill text-4xl"></i>
          </div>
          <Link to={`/operator/reports/monthly?month=${new Date().toISOString().slice(0, 7)}`} 
                className="block mt-4 text-sm underline">Lihat Detail</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        <div className="lg:col-span-2">
          {/* Chart */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Grafik Booking Seminggu Terakhir</h3>
            <div className="relative">
              <canvas id="bookingChart" className="w-full h-64"></canvas>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Jadwal Hari Ini</h3>
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
                  {dashboardData.todaySchedules.length > 0 ? (
                    dashboardData.todaySchedules.map((schedule) => (
                      <tr key={schedule.id} className="border-t">
                        <td className="px-4 py-2">{schedule.route.origin} - {schedule.route.destination}</td>
                        <td className="px-4 py-2">{schedule.ferry.name}</td>
                        <td className="px-4 py-2">{schedule.departure_time}</td>
                        <td className="px-4 py-2">{schedule.arrival_time}</td>
                        <td className="px-4 py-2">
                          <Link 
                            to={`/operator/reports/daily?date=${new Date().toISOString().slice(0, 10)}`}
                            className="inline-block px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          >
                            <i className="fas fa-eye"></i> Lihat
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center px-4 py-4 text-gray-500">
                        Tidak ada jadwal untuk hari ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Menu */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Menu Pintasan</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/operator/bookings/check-in"
                className="flex flex-col items-center justify-center bg-blue-500 text-white p-4 rounded-lg shadow hover:bg-blue-600 text-center"
              >
                <i className="fas fa-check-circle text-2xl mb-2"></i>
                Check-in<br />Penumpang
              </Link>
              <Link 
                to="/operator/bookings"
                className="flex flex-col items-center justify-center bg-indigo-500 text-white p-4 rounded-lg shadow hover:bg-indigo-600 text-center"
              >
                <i className="fas fa-list text-2xl mb-2"></i>
                Daftar<br />Booking
              </Link>
              <Link 
                to="/operator/schedules"
                className="flex flex-col items-center justify-center bg-green-500 text-white p-4 rounded-lg shadow hover:bg-green-600 text-center"
              >
                <i className="fas fa-calendar-alt text-2xl mb-2"></i>
                Kelola<br />Jadwal
              </Link>
              <Link 
                to="/operator/reports"
                className="flex flex-col items-center justify-center bg-yellow-500 text-white p-4 rounded-lg shadow hover:bg-yellow-600 text-center"
              >
                <i className="fas fa-chart-bar text-2xl mb-2"></i>
                Laporan<br />Operasional
              </Link>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Aktivitas Terkini</h3>
            <ul className="space-y-4">
              {dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.map((activity, index) => (
                  <li key={index} className="border-b pb-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{activity.activity_type}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getActivityBadgeClass(activity.status)} text-white`}>
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <small className="text-gray-400">{formatTimeAgo(activity.created_at)}</small>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-500">Belum ada aktivitas terbaru</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;