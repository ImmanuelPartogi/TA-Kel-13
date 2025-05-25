import React, { useState, useEffect, useRef } from 'react';
import adminReportService from '../../../services/adminReport.service';
import Chart from 'chart.js/auto';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';

const ReportIndex = () => {
  // State yang sudah ada
  const [routes, setRoutes] = useState([]);
  const [stats, setStats] = useState({
    bookings_this_month: 0,
    revenue_this_month: 0,
    bookings_this_week: 0,
    bookings_today: 0
  });
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [formData, setFormData] = useState({
    booking: {
      start_date: new Date().toISOString().slice(0, 8) + '01',
      end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
      route_id: '',
      status: ''
    },
    revenue: {
      start_date: new Date().toISOString().slice(0, 8) + '01',
      end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
      route_id: '',
      group_by: 'monthly'
    },
    schedule: {
      start_date: new Date().toISOString().slice(0, 8) + '01',
      end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
      route_id: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [activeTab, setActiveTab] = useState('booking');

  // State baru untuk data preview
  const [previewData, setPreviewData] = useState({
    loading: true,
    bookingTrends: [],
    revenueTrends: [],
    scheduleTrends: [],
    statusDistribution: [],
  });

  // Refs untuk chart
  const bookingTrendChartRef = useRef(null);
  const bookingTrendChartInstance = useRef(null);
  const revenueTrendChartRef = useRef(null);
  const revenueTrendChartInstance = useRef(null);
  const bookingStatusChartRef = useRef(null);
  const bookingStatusChartInstance = useRef(null);
  const scheduleOccupancyChartRef = useRef(null);
  const scheduleOccupancyChartInstance = useRef(null);

  useEffect(() => {
    fetchData();
    fetchPreviewData();

    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }

    // Cleanup function untuk charts
    return () => {
      if (bookingTrendChartInstance.current) {
        bookingTrendChartInstance.current.destroy();
      }
      if (revenueTrendChartInstance.current) {
        revenueTrendChartInstance.current.destroy();
      }
      if (bookingStatusChartInstance.current) {
        bookingStatusChartInstance.current.destroy();
      }
      if (scheduleOccupancyChartInstance.current) {
        scheduleOccupancyChartInstance.current.destroy();
      }
    };
  }, [alert.show]);

  // Effect untuk membuat chart setelah data tersedia
  useEffect(() => {
    if (!previewData.loading) {
      createBookingTrendChart();
      createRevenueTrendChart();
      createBookingStatusChart();
      createScheduleOccupancyChart();
    }
  }, [previewData]);

  const fetchData = async () => {
    // Kode fetchData yang sudah ada
    try {
      setLoading(true);
      const dashboardData = await adminReportService.getDashboardData();

      if (dashboardData && dashboardData.data) {
        const data = dashboardData.data;
        setRoutes(data.routes || []);
        setStats(data.stats || {
          bookings_this_month: 0,
          revenue_this_month: 0,
          bookings_this_week: 0,
          bookings_today: 0
        });
        setPopularRoutes(data.popularRoutes || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setStats({
        bookings_this_month: 0,
        revenue_this_month: 0,
        bookings_this_week: 0,
        bookings_today: 0
      });
      setPopularRoutes([]);
      setRoutes([]);
      setAlert({
        show: true,
        type: 'error',
        message: 'Terjadi kesalahan saat memuat data laporan'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fungsi baru untuk mengambil data preview
  const fetchPreviewData = async () => {
    try {
      setPreviewData(prev => ({ ...prev, loading: true }));

      // Mendapatkan tanggal 6 bulan terakhir
      const endDate = new Date();
      const startDate = subMonths(endDate, 5);
      const formattedStartDate = format(startOfMonth(startDate), 'yyyy-MM-dd');
      const formattedEndDate = format(endOfMonth(endDate), 'yyyy-MM-dd');

      // Mengambil data booking untuk 6 bulan terakhir (dikelompokkan per bulan)
      const bookingReportParams = {
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        group_by: 'monthly'
      };

      // Mengambil data pendapatan untuk 6 bulan terakhir (dikelompokkan per bulan)
      const revenueReportParams = {
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        group_by: 'monthly'
      };

      // Mengambil data jadwal untuk bulan ini
      const scheduleReportParams = {
        start_date: format(startOfMonth(endDate), 'yyyy-MM-dd'),
        end_date: format(endOfMonth(endDate), 'yyyy-MM-dd')
      };

      // Panggil API secara paralel
      const [bookingReport, revenueReport, scheduleReport] = await Promise.all([
        adminReportService.getBookingReport(bookingReportParams),
        adminReportService.getRevenueReport(revenueReportParams),
        adminReportService.getScheduleReport(scheduleReportParams)
      ]);

      // Menyimpan data ke state
      setPreviewData({
        loading: false,
        bookingTrends: bookingReport?.data?.bookingTrend || [],
        revenueTrends: revenueReport?.data?.revenues || [],
        scheduleTrends: scheduleReport?.data?.scheduleStats || [],
        statusDistribution: bookingReport?.data?.statusCount || [],
        vehicleDistribution: scheduleReport?.data?.vehicleDistribution || {}
      });

    } catch (error) {
      console.error('Error fetching preview data:', error);
      setPreviewData(prev => ({
        ...prev,
        loading: false,
        bookingTrends: [],
        revenueTrends: [],
        scheduleTrends: [],
        statusDistribution: []
      }));
      setAlert({
        show: true,
        type: 'error',
        message: 'Terjadi kesalahan saat memuat data ringkasan'
      });
    }
  };

  // Fungsi untuk membuat chart tren booking
  const createBookingTrendChart = () => {
    const ctx = bookingTrendChartRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (bookingTrendChartInstance.current) {
      bookingTrendChartInstance.current.destroy();
    }

    // Prepare data
    const data = previewData.bookingTrends;
    const months = data.map(item => {
      const date = new Date(item.date);
      return format(date, 'MMM yyyy', { locale: id });
    });
    const counts = data.map(item => item.count);

    bookingTrendChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Jumlah Booking',
          data: counts,
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgba(37, 99, 235, 1)',
          pointRadius: 4,
          pointHoverRadius: 6
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
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold',
              family: "'Inter', sans-serif"
            },
            bodyFont: {
              size: 13,
              family: "'Inter', sans-serif"
            },
            cornerRadius: 6,
            displayColors: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(243, 244, 246, 0.8)',
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif",
                size: 11
              },
              color: 'rgba(55, 65, 81, 0.8)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif",
                size: 11
              },
              color: 'rgba(55, 65, 81, 0.8)'
            }
          }
        }
      }
    });
  };

  // Fungsi untuk membuat chart tren pendapatan
  const createRevenueTrendChart = () => {
    const ctx = revenueTrendChartRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (revenueTrendChartInstance.current) {
      revenueTrendChartInstance.current.destroy();
    }

    // Prepare data
    const data = previewData.revenueTrends;
    const periods = data.map(item => item.formatted_period);
    const amounts = data.map(item => item.total_amount);

    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(5, 150, 105, 0.8)');
    gradient.addColorStop(1, 'rgba(5, 150, 105, 0.2)');

    revenueTrendChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: periods,
        datasets: [{
          label: 'Pendapatan',
          data: amounts,
          backgroundColor: gradient,
          borderColor: 'rgba(5, 150, 105, 1)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(5, 150, 105, 0.9)'
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
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold',
              family: "'Inter', sans-serif"
            },
            bodyFont: {
              size: 13,
              family: "'Inter', sans-serif"
            },
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              label: function (context) {
                const value = context.raw;
                return 'Pendapatan: Rp ' + value.toLocaleString('id-ID');
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(243, 244, 246, 0.8)',
            },
            ticks: {
              callback: function (value) {
                if (value >= 1000000) return 'Rp ' + (value / 1000000).toFixed(1) + ' jt';
                if (value >= 1000) return 'Rp ' + (value / 1000).toFixed(0) + ' rb';
                return 'Rp ' + value;
              },
              font: {
                family: "'Inter', sans-serif",
                size: 11
              },
              color: 'rgba(55, 65, 81, 0.8)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif",
                size: 11
              },
              color: 'rgba(55, 65, 81, 0.8)'
            }
          }
        }
      }
    });
  };

  // Fungsi untuk membuat chart status booking
  const createBookingStatusChart = () => {
    const ctx = bookingStatusChartRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (bookingStatusChartInstance.current) {
      bookingStatusChartInstance.current.destroy();
    }

    // Prepare data
    const data = previewData.statusDistribution;
    const labels = data.map(item => item.status);
    const counts = data.map(item => item.count);

    // Modern color palette
    const statusColors = {
      'PENDING': 'rgba(234, 179, 8, 0.85)',
      'CONFIRMED': 'rgba(5, 150, 105, 0.85)',
      'CANCELLED': 'rgba(220, 38, 38, 0.85)',
      'COMPLETED': 'rgba(37, 99, 235, 0.85)',
      'REFUNDED': 'rgba(75, 85, 99, 0.85)',
      'RESCHEDULED': 'rgba(124, 58, 237, 0.85)'
    };

    const backgroundColors = labels.map(status => statusColors[status] || 'rgba(156, 163, 175, 0.85)');

    bookingStatusChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.85', '1')),
          borderWidth: 1,
          hoverOffset: 12,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 11,
                family: "'Inter', sans-serif"
              },
              color: 'rgba(55, 65, 81, 0.9)'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold',
              family: "'Inter', sans-serif"
            },
            bodyFont: {
              size: 13,
              family: "'Inter', sans-serif"
            },
            cornerRadius: 6,
            displayColors: true,
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  };

  // Fungsi untuk membuat chart okupansi jadwal
  const createScheduleOccupancyChart = () => {
    const ctx = scheduleOccupancyChartRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (scheduleOccupancyChartInstance.current) {
      scheduleOccupancyChartInstance.current.destroy();
    }

    // Prepare data - ambil top 5 jadwal dengan okupansi tertinggi
    const data = [...previewData.scheduleTrends]
      .sort((a, b) => b.passenger_occupancy_rate - a.passenger_occupancy_rate)
      .slice(0, 5);

    const labels = data.map(item => `${item.route} (${item.time})`);
    const occupancyRates = data.map(item => item.passenger_occupancy_rate);

    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 300, 0);
    gradient.addColorStop(0, 'rgba(109, 40, 217, 0.9)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0.7)');

    scheduleOccupancyChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Tingkat Okupansi (%)',
          data: occupancyRates,
          backgroundColor: gradient,
          borderColor: 'rgba(109, 40, 217, 1)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(109, 40, 217, 0.95)'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold',
              family: "'Inter', sans-serif"
            },
            bodyFont: {
              size: 13,
              family: "'Inter', sans-serif"
            },
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              label: function (context) {
                const value = context.raw || 0;
                return `Okupansi: ${value.toFixed(1)}%`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(243, 244, 246, 0.8)',
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif",
                size: 11
              },
              color: 'rgba(55, 65, 81, 0.8)'
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif",
                size: 10
              },
              color: 'rgba(55, 65, 81, 0.9)'
            }
          }
        }
      }
    });
  };

  // Kode fungsi-fungsi lain yang sudah ada
  const handleFormChange = (reportType, field, value) => {
    setFormData(prev => ({
      ...prev,
      [reportType]: {
        ...prev[reportType],
        [field]: value
      }
    }));
  };

  const handleSubmit = (reportType, exportType = null) => {
    const params = new URLSearchParams(formData[reportType]);
    if (exportType === 'csv') {
      params.append('export', 'csv');
    }
    window.location.href = `/admin/reports/${reportType}?${params.toString()}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const TabButton = ({ active, onClick, icon, title, color }) => (
    <button
      onClick={onClick}
      className={`relative px-6 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2.5 ${active
          ? `${color} bg-white shadow-md border border-gray-100`
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
        }`}
    >
      <i className={`${icon} text-lg`}></i>
      <span>{title}</span>
      {active && <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 ${color.replace('text-', 'bg-')} rounded-full`}></div>}
    </button>
  );

  const FormField = ({ label, icon, children, required = false }) => (
    <div className="space-y-2.5">
      <label className="block text-sm font-semibold text-gray-700 tracking-tight">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <i className={`${icon} text-gray-500 text-sm`}></i>
        </div>
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 shadow-xl border border-gray-100 text-center max-w-md w-full mx-4">
          <div className="relative inline-block mb-6">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Memuat Data Laporan</h3>
          <p className="text-gray-600">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Improved Gradient */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-15">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" className="w-full h-full">
            <path d="M472.3 724.1c-142.9 52.5-285.8-46.9-404.6-124.4 104.1 31.6 255-30.3 307.6-130.9 52.5-100.6-17.3-178.1-96.4-193.9 207.6 26.6 285.8 337.7 193.4 449.2z"
              fill="#fff" opacity="0.2" />
            <path d="M472.3 724.1c-142.9 52.5-285.8-46.9-404.6-124.4 104.1 31.6 255-30.3 307.6-130.9 52.5-100.6-17.3-178.1-96.4-193.9 207.6 26.6 285.8 337.7 193.4 449.2z"
              fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeDasharray="10 20" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="bg-white/15 backdrop-blur-sm p-3.5 rounded-2xl shadow-lg">
                <i className="fas fa-chart-line text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Laporan & Statistik</h1>
                <p className="text-blue-100 mt-1.5 text-lg">Kelola dan analisis seluruh data pelayaran dalam sistem</p>
              </div>
            </div>
          </div>

          {/* Quick Stats dengan Desain Modern */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/15 hover:bg-white/15 transition-all duration-300 shadow-lg">
              <div className="flex justify-between mb-2">
                <p className="text-blue-100 text-sm font-medium">Booking Bulan Ini</p>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/20">
                  <i className="fas fa-calendar-alt text-blue-100 text-sm"></i>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold">{stats.bookings_this_month}</span>
                <span className="text-blue-200 text-xs ml-2">transaksi</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/15 hover:bg-white/15 transition-all duration-300 shadow-lg">
              <div className="flex justify-between mb-2">
                <p className="text-blue-100 text-sm font-medium">Pendapatan Bulan Ini</p>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/20">
                  <i className="fas fa-money-bill-wave text-blue-100 text-sm"></i>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{formatCurrency(stats.revenue_this_month).replace('Rp', '').trim()}</span>
                <span className="text-blue-200 text-xs ml-2">rupiah</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/15 hover:bg-white/15 transition-all duration-300 shadow-lg">
              <div className="flex justify-between mb-2">
                <p className="text-blue-100 text-sm font-medium">Booking Minggu Ini</p>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500/20">
                  <i className="fas fa-calendar-week text-blue-100 text-sm"></i>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold">{stats.bookings_this_week}</span>
                <span className="text-blue-200 text-xs ml-2">transaksi</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/15 hover:bg-white/15 transition-all duration-300 shadow-lg">
              <div className="flex justify-between mb-2">
                <p className="text-blue-100 text-sm font-medium">Booking Hari Ini</p>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-500/20">
                  <i className="fas fa-calendar-day text-blue-100 text-sm"></i>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold">{stats.bookings_today}</span>
                <span className="text-blue-200 text-xs ml-2">transaksi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 pb-12">
        <div className="max-w-7xl mx-auto px-6 -mt-8">
          {/* Alert Messages dengan Desain Modern */}
          {alert.show && (
            <div className={`mb-8 rounded-2xl shadow-xl overflow-hidden animate-slideIn ${alert.type === 'success' ? 'bg-white border-l-4 border-emerald-500' : 'bg-white border-l-4 border-red-500'
              }`}>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${alert.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                    <i className={`fas ${alert.type === 'success' ? 'fa-check text-emerald-600' : 'fa-exclamation-triangle text-red-600'} text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-base ${alert.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
                      {alert.type === 'success' ? 'Informasi' : 'Terjadi Kesalahan'}
                    </p>
                    <p className={`mt-1 ${alert.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                      {alert.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setAlert({ ...alert, show: false })}
                    className={`flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${alert.type === 'success' ? 'text-emerald-500 hover:text-emerald-700' : 'text-red-500 hover:text-red-700'
                      }`}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Report Tabs */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-wrap gap-3">
                <TabButton
                  active={activeTab === 'booking'}
                  onClick={() => setActiveTab('booking')}
                  icon="fas fa-ticket-alt"
                  title="Laporan Booking"
                  color="text-blue-600"
                />
                <TabButton
                  active={activeTab === 'revenue'}
                  onClick={() => setActiveTab('revenue')}
                  icon="fas fa-chart-bar"
                  title="Laporan Pendapatan"
                  color="text-emerald-600"
                />
                <TabButton
                  active={activeTab === 'schedule'}
                  onClick={() => setActiveTab('schedule')}
                  icon="fas fa-calendar-alt"
                  title="Laporan Jadwal"
                  color="text-purple-600"
                />
              </div>
            </div>

            <div className="p-8">
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Report Form */}
                <div className="xl:col-span-2">
                  <div className="bg-slate-50 rounded-2xl p-8 shadow-inner">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                      <i className={`fas ${activeTab === 'booking' ? 'fa-filter text-blue-600' :
                          activeTab === 'revenue' ? 'fa-filter text-emerald-600' : 'fa-filter text-purple-600'
                        }`}></i>
                      <span>Filter & Generate Laporan</span>
                    </h3>

                    {/* Booking Report Form */}
                    {activeTab === 'booking' && (
                      <form onSubmit={(e) => { e.preventDefault(); handleSubmit('booking'); }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField label="Tanggal Mulai" icon="fas fa-calendar" required>
                            <input
                              type="date"
                              value={formData.booking.start_date}
                              onChange={(e) => handleFormChange('booking', 'start_date', e.target.value)}
                              required
                              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                            />
                          </FormField>

                          <FormField label="Tanggal Akhir" icon="fas fa-calendar" required>
                            <input
                              type="date"
                              value={formData.booking.end_date}
                              onChange={(e) => handleFormChange('booking', 'end_date', e.target.value)}
                              required
                              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                            />
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField label="Pilih Rute" icon="fas fa-route">
                            <select
                              value={formData.booking.route_id}
                              onChange={(e) => handleFormChange('booking', 'route_id', e.target.value)}
                              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none shadow-sm"
                              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                            >
                              <option value="">Semua Rute</option>
                              {routes.map(route => (
                                <option key={route.id} value={route.id}>
                                  {route.origin} - {route.destination}
                                </option>
                              ))}
                            </select>
                          </FormField>

                          <FormField label="Status Booking" icon="fas fa-tag">
                            <select
                              value={formData.booking.status}
                              onChange={(e) => handleFormChange('booking', 'status', e.target.value)}
                              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none shadow-sm"
                              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                            >
                              <option value="">Semua Status</option>
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="CANCELLED">Cancelled</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="REFUNDED">Refunded</option>
                            </select>
                          </FormField>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                          <button
                            type="submit"
                            className="flex-1 inline-flex justify-center items-center px-6 py-3.5 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 gap-2.5"
                          >
                            <i className="fas fa-eye"></i>
                            <span>Lihat Laporan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmit('booking', 'csv')}
                            className="flex-1 inline-flex justify-center items-center px-6 py-3.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 gap-2.5"
                          >
                            <i className="fas fa-file-csv"></i>
                            <span>Export CSV</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Revenue Report Form */}
                    {activeTab === 'revenue' && (
                      <form onSubmit={(e) => { e.preventDefault(); handleSubmit('revenue'); }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField label="Tanggal Mulai" icon="fas fa-calendar" required>
                            <input
                              type="date"
                              value={formData.revenue.start_date}
                              onChange={(e) => handleFormChange('revenue', 'start_date', e.target.value)}
                              required
                              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                            />
                          </FormField>

                          <FormField label="Tanggal Akhir" icon="fas fa-calendar" required>
                            <input
                              type="date"
                              value={formData.revenue.end_date}
                              onChange={(e) => handleFormChange('revenue', 'end_date', e.target.value)}
                              required
                              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                            />
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField label="Pilih Rute" icon="fas fa-route">
                            <select
                              value={formData.revenue.route_id}
                              onChange={(e) => handleFormChange('revenue', 'route_id', e.target.value)}
                              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none shadow-sm"
                              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                            >
                              <option value="">Semua Rute</option>
                              {routes.map(route => (
                                <option key={route.id} value={route.id}>
                                  {route.origin} - {route.destination}
                                </option>
                              ))}
                            </select>
                          </FormField>

                          <FormField label="Kelompokkan Data" icon="fas fa-layer-group" required>
                            <select
                              value={formData.revenue.group_by}
                              onChange={(e) => handleFormChange('revenue', 'group_by', e.target.value)}
                              required
                              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none shadow-sm"
                              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                            >
                              <option value="daily">Harian</option>
                              <option value="weekly">Mingguan</option>
                              <option value="monthly">Bulanan</option>
                            </select>
                          </FormField>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                          <button
                            type="submit"
                            className="flex-1 inline-flex justify-center items-center px-6 py-3.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 gap-2.5"
                          >
                            <i className="fas fa-eye"></i>
                            <span>Lihat Laporan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmit('revenue', 'csv')}
                            className="flex-1 inline-flex justify-center items-center px-6 py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 gap-2.5"
                          >
                            <i className="fas fa-file-csv"></i>
                            <span>Export CSV</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Schedule Report Form */}
                    {activeTab === 'schedule' && (
                      <form onSubmit={(e) => { e.preventDefault(); handleSubmit('schedule'); }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField label="Tanggal Mulai" icon="fas fa-calendar" required>
                            <input
                              type="date"
                              value={formData.schedule.start_date}
                              onChange={(e) => handleFormChange('schedule', 'start_date', e.target.value)}
                              required
                              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                            />
                          </FormField>

                          <FormField label="Tanggal Akhir" icon="fas fa-calendar" required>
                            <input
                              type="date"
                              value={formData.schedule.end_date}
                              onChange={(e) => handleFormChange('schedule', 'end_date', e.target.value)}
                              required
                              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                            />
                          </FormField>
                        </div>

                        <FormField label="Pilih Rute" icon="fas fa-route">
                          <select
                            value={formData.schedule.route_id}
                            onChange={(e) => handleFormChange('schedule', 'route_id', e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none shadow-sm"
                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                          >
                            <option value="">Semua Rute</option>
                            {routes.map(route => (
                              <option key={route.id} value={route.id}>
                                {route.origin} - {route.destination}
                              </option>
                            ))}
                          </select>
                        </FormField>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                          <button
                            type="submit"
                            className="flex-1 inline-flex justify-center items-center px-6 py-3.5 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 gap-2.5"
                          >
                            <i className="fas fa-eye"></i>
                            <span>Lihat Laporan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmit('schedule', 'csv')}
                            className="flex-1 inline-flex justify-center items-center px-6 py-3.5 bg-gradient-to-r from-purple-800 to-purple-700 hover:from-purple-900 hover:to-purple-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 gap-2.5"
                          >
                            <i className="fas fa-file-csv"></i>
                            <span>Export CSV</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* Popular Routes Sidebar */}
                <div className="xl:col-span-1">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2.5">
                        <i className="fas fa-star text-yellow-500"></i>
                        <span>Rute Terpopuler</span>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1.5">Ranking berdasarkan jumlah booking</p>
                    </div>

                    <div className="max-h-[32rem] overflow-y-auto">
                      {popularRoutes.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                          {popularRoutes.map((route, index) => (
                            <div key={index} className="p-6 hover:bg-slate-50 transition-colors duration-300">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {route.origin} - {route.destination}
                                  </p>
                                  {route.route_code && (
                                    <p className="text-xs text-gray-500 mt-1">{route.route_code}</p>
                                  )}
                                </div>
                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="bg-blue-50 rounded-xl p-3 text-center shadow-sm">
                                  <p className="text-xs font-medium text-blue-600 mb-1">Booking</p>
                                  <p className="text-lg font-bold text-blue-700">{route.booking_count || 0}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-3 text-center shadow-sm">
                                  <p className="text-xs font-medium text-emerald-600 mb-1">Revenue</p>
                                  <p className="text-sm font-bold text-emerald-700">
                                    {formatCurrency(route.total_revenue || 0).replace('Rp', '').trim()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <i className="fas fa-route text-slate-400 text-xl"></i>
                          </div>
                          <p className="text-gray-700 font-medium">Belum Ada Data</p>
                          <p className="text-gray-500 text-sm mt-1.5">Data rute populer akan muncul di sini</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* UPDATED: Chart Preview */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2.5">
                <i className="fas fa-chart-area text-blue-600"></i>
                <span>Ringkasan Grafik Analitik</span>
              </h3>
              <p className="text-sm text-gray-600 mt-1.5">Visualisasi data terbaru dari semua laporan</p>
            </div>

            {previewData.loading ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Memuat Data Visualisasi</h4>
                <p className="text-gray-500">Mohon tunggu sebentar...</p>
              </div>
            ) : (
              <div className="p-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                  <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-xl p-6 text-white shadow-xl relative overflow-hidden group hover:translate-y-[-2px] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full transform translate-x-8 -translate-y-8"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-tr-full transform -translate-x-4 translate-y-4"></div>
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <p className="text-blue-100 text-sm font-medium mb-1.5">Total Booking</p>
                        <p className="text-3xl font-bold">
                          {previewData.bookingTrends?.reduce((sum, item) => sum + (item.count || 0), 0) || 0}
                        </p>
                        <p className="text-blue-100 text-xs mt-1.5">dalam 6 bulan terakhir</p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <i className="fas fa-ticket-alt text-white text-xl"></i>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-xl p-6 text-white shadow-xl relative overflow-hidden group hover:translate-y-[-2px] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full transform translate-x-8 -translate-y-8"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-tr-full transform -translate-x-4 translate-y-4"></div>
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <p className="text-emerald-100 text-sm font-medium mb-1.5">Total Pendapatan</p>
                        <p className="text-3xl font-bold">
                          Rp {new Intl.NumberFormat('id-ID').format(previewData.revenueTrends?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0)}
                        </p>
                        <p className="text-emerald-100 text-xs mt-1.5">dalam 6 bulan terakhir</p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <i className="fas fa-money-bill-wave text-white text-xl"></i>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-700 to-purple-600 rounded-xl p-6 text-white shadow-xl relative overflow-hidden group hover:translate-y-[-2px] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full transform translate-x-8 -translate-y-8"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-tr-full transform -translate-x-4 translate-y-4"></div>
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <p className="text-purple-100 text-sm font-medium mb-1.5">Okupansi Rata-rata</p>
                        <p className="text-3xl font-bold">
                          {previewData.scheduleTrends?.length > 0
                            ? (previewData.scheduleTrends.reduce((sum, item) => sum + item.passenger_occupancy_rate, 0) / previewData.scheduleTrends.length).toFixed(1)
                            : 0}%
                        </p>
                        <p className="text-purple-100 text-xs mt-1.5">bulan ini</p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <i className="fas fa-ship text-white text-xl"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
                  {/* Booking Trends Chart */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-center mb-5">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-chart-line text-blue-500 text-sm"></i>
                        <span>Tren Booking</span>
                      </h4>
                      <span className="text-xs bg-blue-50 text-blue-700 py-1.5 px-3 rounded-full font-medium">6 Bulan Terakhir</span>
                    </div>
                    <div className="h-64 border-t border-gray-50 pt-4">
                      {previewData.bookingTrends?.length > 0 ? (
                        <canvas ref={bookingTrendChartRef}></canvas>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-gray-600 font-medium">Tidak ada data tren booking</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Revenue Chart */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-center mb-5">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-chart-bar text-emerald-500 text-sm"></i>
                        <span>Tren Pendapatan</span>
                      </h4>
                      <span className="text-xs bg-emerald-50 text-emerald-700 py-1.5 px-3 rounded-full font-medium">6 Bulan Terakhir</span>
                    </div>
                    <div className="h-64 border-t border-gray-50 pt-4">
                      {previewData.revenueTrends?.length > 0 ? (
                        <canvas ref={revenueTrendChartRef}></canvas>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-600 font-medium">Tidak ada data tren pendapatan</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Status Distribution */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-center mb-5">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-chart-pie text-blue-500 text-sm"></i>
                        <span>Status Booking</span>
                      </h4>
                      <span className="text-xs bg-blue-50 text-blue-700 py-1.5 px-3 rounded-full font-medium">Bulan Ini</span>
                    </div>
                    <div className="h-64 border-t border-gray-50 pt-4">
                      {previewData.statusDistribution?.length > 0 ? (
                        <canvas ref={bookingStatusChartRef}></canvas>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                          </svg>
                          <p className="text-gray-600 font-medium">Tidak ada data status booking</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Schedule Occupancy */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-center mb-5">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-ship text-purple-500 text-sm"></i>
                        <span>Okupansi Tertinggi</span>
                      </h4>
                      <span className="text-xs bg-purple-50 text-purple-700 py-1.5 px-3 rounded-full font-medium">Bulan Ini</span>
                    </div>
                    <div className="h-64 border-t border-gray-50 pt-4">
                      {previewData.scheduleTrends?.length > 0 ? (
                        <canvas ref={scheduleOccupancyChartRef}></canvas>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-600 font-medium">Tidak ada data okupansi jadwal</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced CSS Animations */}
      <style>{`        
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
        }

        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        /* Import Google Font - Inter */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        /* Apply Inter font to the entire application */
        body {
          font-family: 'Inter', sans-serif;
        }

        /* Custom scrollbar for popular routes */
        .max-h-[32rem]::-webkit-scrollbar {
          width: 4px;
        }
        
        .max-h-[32rem]::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        
        .max-h-[32rem]::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        
        .max-h-[32rem]::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Hover effects for cards */
        .bg-white.rounded-xl {
          transition: all 0.3s ease;
        }

        .bg-white.rounded-xl:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </div>
  );
};

export default ReportIndex;