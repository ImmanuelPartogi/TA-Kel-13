import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import adminReportService from '../../../services/adminReport.service';
import Chart from 'chart.js/auto';
import $ from 'jquery';
import 'datatables.net';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookingReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    bookings: [],
    totalBookings: 0,
    totalRevenue: 0,
    actualRevenue: 0,
    totalPassengers: 0,
    totalVehicles: 0,
    statusCount: [],
    bookingTrend: [],
    startDate: searchParams.get('start_date') || new Date().toISOString().slice(0, 10),
    endDate: searchParams.get('end_date') || new Date().toISOString().slice(0, 10)
  });
  const [routes, setRoutes] = useState([]);
  const [filters, setFilters] = useState({
    start_date: searchParams.get('start_date') || new Date().toISOString().slice(0, 10),
    end_date: searchParams.get('end_date') || new Date().toISOString().slice(0, 10),
    route_id: searchParams.get('route_id') || '',
    status: searchParams.get('status') || ''
  });

  const statusChartRef = useRef(null);
  const statusChartInstance = useRef(null);
  const trendChartRef = useRef(null);
  const trendChartInstance = useRef(null);
  const tableRef = useRef(null);
  const dataTableInstance = useRef(null);

  // Memoize date formatting
  const formattedDateRange = useMemo(() => {
    return {
      start: new Date(data.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      end: new Date(data.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  }, [data.startDate, data.endDate]);

  const dailyAverage = useMemo(() => {
    const diffInDays = Math.floor((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    return (data.totalBookings / Math.max(1, diffInDays)).toFixed(1);
  }, [data.totalBookings, data.startDate, data.endDate]);

  useEffect(() => {
    fetchData();
    fetchRoutes();

    return () => {
      // Cleanup charts
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
      }
      if (trendChartInstance.current) {
        trendChartInstance.current.destroy();
      }
      // Cleanup datatable
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
      }
    };
  }, [searchParams]);

  useEffect(() => {
    if (data.bookings.length > 0 && tableRef.current) {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
      }

      dataTableInstance.current = $(tableRef.current).DataTable({
        responsive: true,
        pageLength: 25,
        order: [[9, 'desc']],
        language: {
          search: "Cari:",
          lengthMenu: "Tampilkan _MENU_ entri",
          info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ entri",
          infoEmpty: "Menampilkan 0 sampai 0 dari 0 entri",
          infoFiltered: "(disaring dari _MAX_ total entri)",
          paginate: {
            first: "Pertama",
            last: "Terakhir",
            next: "Selanjutnya",
            previous: "Sebelumnya"
          }
        },
        initComplete: function () {
          $('.dataTables_wrapper').addClass('my-4');
        }
      });
    }
  }, [data.bookings]);

  useEffect(() => {
    // Selalu buat chart bahkan jika data kosong
    createStatusChart();
    createTrendChart();
  }, [data.statusCount, data.bookingTrend]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await adminReportService.getBookingReport(Object.fromEntries(searchParams));
      setData(response.data);
    } catch (error) {
      console.error('Error fetching booking report:', error);
      toast.error('Gagal memuat data laporan booking');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await adminReportService.getDashboardData();
      if (response && response.data && response.data.routes) {
        setRoutes(response.data.routes);
      } else {
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes([]);
    }
  };

  const createStatusChart = () => {
    const ctx = statusChartRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (statusChartInstance.current) {
      statusChartInstance.current.destroy();
    }

    // Data dummy atau data aktual
    const statusColors = {
      'PENDING': 'rgba(245, 158, 11, 0.85)',
      'CONFIRMED': 'rgba(16, 185, 129, 0.85)',
      'CANCELLED': 'rgba(239, 68, 68, 0.85)',
      'COMPLETED': 'rgba(59, 130, 246, 0.85)',
      'REFUNDED': 'rgba(107, 114, 128, 0.85)',
      'RESCHEDULED': 'rgba(139, 92, 246, 0.85)'
    };

    // Gunakan data dummy jika tidak ada data asli
    const hasSampleData = data.statusCount && data.statusCount.length > 0;

    const labels = hasSampleData
      ? data.statusCount.map(item => item.status)
      : ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

    const counts = hasSampleData
      ? data.statusCount.map(item => item.count)
      : [0, 0, 0, 0];

    const amounts = hasSampleData
      ? data.statusCount.map(item => item.amount)
      : [0, 0, 0, 0];

    const backgroundColors = labels.map(status => statusColors[status] || 'rgba(156, 163, 175, 0.85)');

    statusChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.85', '1')),
          borderWidth: 1,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const amount = amounts[context.dataIndex] || 0;
                const percentage = hasSampleData
                  ? ((value / counts.reduce((a, b) => a + b, 0)) * 100).toFixed(1)
                  : "0.0";
                return [
                  `${label}: ${value} pemesanan (${percentage}%)`,
                  `Pendapatan: Rp ${amount.toLocaleString('id-ID')}`
                ];
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1000
        }
      }
    });

    // Tambahkan pesan jika tidak ada data
    if (!hasSampleData) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('Tidak ada data untuk ditampilkan', width / 2, height / 2);
      ctx.restore();
    }
  };

  const createTrendChart = () => {
    const ctx = trendChartRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (trendChartInstance.current) {
      trendChartInstance.current.destroy();
    }

    // Periksa apakah data tersedia
    const hasSampleData = data.bookingTrend && data.bookingTrend.length > 0;

    // Gunakan data dummy jika tidak ada data asli
    const today = new Date();
    const sampleDates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      sampleDates.push(date.toISOString().slice(0, 10));
    }

    const dates = hasSampleData
      ? data.bookingTrend.map(item => item.date)
      : sampleDates;

    const counts = hasSampleData
      ? data.bookingTrend.map(item => item.count)
      : [0, 0, 0, 0, 0, 0, 0];

    const amounts = hasSampleData
      ? data.bookingTrend.map(item => item.amount)
      : [0, 0, 0, 0, 0, 0, 0];

    trendChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Jumlah Booking',
            data: counts,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            yAxisID: 'y',
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)'
          },
          {
            label: 'Total Nominal (Rp)',
            data: amounts,
            type: 'line',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2,
            yAxisID: 'y1',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: 'rgba(16, 185, 129, 1)',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Jumlah Booking',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(203, 213, 225, 0.3)',
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            title: {
              display: true,
              text: 'Total Nominal (Rp)',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              callback: function (value) {
                if (value >= 1000000) return (value / 1000000).toFixed(1) + ' jt';
                if (value >= 1000) return (value / 1000).toFixed(0) + ' rb';
                return value;
              }
            }
          },
          x: {
            grid: {
              color: 'rgba(203, 213, 225, 0.3)',
            }
          }
        },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || '';
                const value = context.raw || 0;
                if (label.includes('Nominal')) {
                  return `${label}: Rp ${value.toLocaleString('id-ID')}`;
                }
                return `${label}: ${value}`;
              }
            }
          },
          legend: {
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12
              }
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });

    // Tambahkan pesan jika tidak ada data
    if (!hasSampleData) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('Tidak ada data tren booking untuk ditampilkan', width / 2, height / 2);
      ctx.restore();
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilter = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Update URL tanpa refresh halaman
    const params = new URLSearchParams(filters);
    setSearchParams(params);
    
    // Fetch data dengan parameter baru
    adminReportService.getBookingReport(Object.fromEntries(params))
      .then(response => {
        setData(response.data);
        toast.success("Data berhasil diperbarui");
      })
      .catch(error => {
        console.error('Error fetching booking report:', error);
        toast.error('Gagal memuat data laporan booking');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleExport = () => {
    const params = new URLSearchParams(searchParams);
    params.append('export', 'csv');
    window.location.href = `/admin/reports/booking/export?${params.toString()}`;
    toast.success('Mengunduh laporan booking...');
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    const badges = {
      CONFIRMED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
      RESCHEDULED: 'bg-indigo-100 text-indigo-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  // Komponen Skeleton untuk bagian tertentu
  const CardSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  );

  const ChartSkeleton = () => (
    <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
  );

  const TableSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded-lg w-full mb-4"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded-lg w-full mb-2"></div>
      ))}
    </div>
  );

  return (
    <div className="container px-4 py-6 mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-3 rounded-xl shadow-md text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Laporan Booking</h1>
            <p className="text-sm text-gray-500">Analisis data booking dan transaksi</p>
          </div>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Indikator Loading Global */}
      {loading && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Memuat data...</span>
          </div>
        </div>
      )}

      {/* Informasi Rentang Tanggal */}
      <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden border border-gray-100">
        <div className="p-5 bg-gradient-to-r from-blue-50 to-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-xs uppercase text-gray-500 font-medium">Periode</span>
                <p className="font-medium text-gray-700">{formattedDateRange.start} - {formattedDateRange.end}</p>
              </div>
            </div>
            {filters.route_id && (
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs uppercase text-gray-500 font-medium">Rute</span>
                  <p className="font-medium text-gray-700">
                    {data.bookings[0]?.schedule?.route?.origin} - {data.bookings[0]?.schedule?.route?.destination}
                  </p>
                </div>
              </div>
            )}
            {filters.status && (
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs uppercase text-gray-500 font-medium">Status</span>
                  <p className="font-medium text-gray-700">{filters.status}</p>
                </div>
              </div>
            )}
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="text-xs uppercase text-gray-500 font-medium">Update Terakhir</span>
                <p className="font-medium text-gray-700">
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Booking */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100">
          <div className="p-5">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Booking</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">{data.totalBookings.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {dailyAverage} booking per hari
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-2">
            <span className="text-xs text-blue-700 font-medium">Total pemesanan dalam periode</span>
          </div>
        </div>

        {/* Total Pendapatan */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-green-100">
          <div className="p-5">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Total Pendapatan</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">
                    Rp {data.totalRevenue.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Aktual: Rp {data.actualRevenue.toLocaleString('id-ID')}
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg shadow text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-green-50 px-5 py-2">
            <span className="text-xs text-green-700 font-medium">Semua transaksi dalam periode</span>
          </div>
        </div>

        {/* Total Penumpang */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-indigo-100">
          <div className="p-5">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Penumpang</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">{data.totalPassengers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(data.totalPassengers / Math.max(1, data.totalBookings)).toFixed(1)} per booking
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-lg shadow text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-indigo-50 px-5 py-2">
            <span className="text-xs text-indigo-700 font-medium">Jumlah orang dalam periode</span>
          </div>
        </div>

        {/* Total Kendaraan */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-yellow-100">
          <div className="p-5">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">Total Kendaraan</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">{data.totalVehicles.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(data.totalVehicles / Math.max(1, data.totalBookings)).toFixed(1)} per booking
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 rounded-lg shadow text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 px-5 py-2">
            <span className="text-xs text-yellow-700 font-medium">Kendaraan yang diangkut</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Grafik Trend Booking */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Tren Booking Harian
            </h2>
            {!loading && <span className="text-xs bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">{data.bookingTrend.length} hari</span>}
          </div>
          <div className="p-6">
            <div className="h-80">
              {loading ? (
                <ChartSkeleton />
              ) : (
                <canvas ref={trendChartRef}></canvas>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown Status */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Breakdown Status
            </h2>
            {!loading && <span className="text-xs bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">{data.statusCount.length} status</span>}
          </div>
          <div className="p-6">
            <div className="h-80">
              {loading ? (
                <ChartSkeleton />
              ) : (
                <canvas ref={statusChartRef}></canvas>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Form */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Laporan
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleFilter} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <select
                    id="route_id"
                    name="route_id"
                    value={filters.route_id}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                  >
                    <option value="">Semua Rute</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.id}>
                        {route.origin} - {route.destination}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                  >
                    <option value="">Semua Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REFUNDED">Refunded</option>
                    <option value="RESCHEDULED">Rescheduled</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                )}
                Filter
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabel Booking */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Daftar Booking
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : (
            <table ref={tableRef} className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Booking</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jadwal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penumpang</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kendaraan</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Pesan</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {booking.booking_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {booking.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {booking.schedule.route.origin} - {booking.schedule.route.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {booking.schedule.departure_time} - {booking.schedule.arrival_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(booking.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {booking.passenger_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {booking.vehicle_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rp {booking.total_amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(booking.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/bookings/${booking.id}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg shadow-sm transition-all hover:shadow"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingReport;