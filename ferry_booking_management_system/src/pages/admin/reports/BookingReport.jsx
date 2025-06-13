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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(5);
  // const [sortOrder, setSortOrder] = useState({field: 'created_at', direction: 'desc'});

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

  // Pagination logic & filtered bookings
  const filteredBookings = useMemo(() => {
    if (!searchTerm) return data.bookings;

    return data.bookings.filter(booking =>
      booking.booking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.schedule.route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.schedule.route.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data.bookings, searchTerm]);

  const totalPages = useMemo(() => Math.ceil(filteredBookings.length / itemsPerPage), [filteredBookings, itemsPerPage]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

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
        pageLength: 10,
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
          $('.dataTables_filter input').addClass('border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors');
          $('.dataTables_length select').addClass('border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors');
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
      'PENDING': 'rgba(251, 191, 36, 0.9)',
      'CONFIRMED': 'rgba(16, 185, 129, 0.9)',
      'CANCELLED': 'rgba(239, 68, 68, 0.9)',
      'COMPLETED': 'rgba(59, 130, 246, 0.9)',
      'REFUNDED': 'rgba(107, 114, 128, 0.9)',
      'RESCHEDULED': 'rgba(139, 92, 246, 0.9)'
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

    const backgroundColors = labels.map(status => statusColors[status] || 'rgba(156, 163, 175, 0.9)');

    statusChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.9', '1')),
          borderWidth: 2,
          hoverOffset: 18,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'rectRounded',
              font: {
                family: "'Inter', sans-serif",
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            padding: 16,
            titleFont: {
              family: "'Inter', sans-serif",
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              family: "'Inter', sans-serif",
              size: 13
            },
            cornerRadius: 8,
            boxPadding: 6,
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
          duration: 1200,
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
      ctx.font = '14px "Inter", sans-serif';
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
            backgroundColor: 'rgba(79, 70, 229, 0.75)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 2,
            yAxisID: 'y',
            borderRadius: 6,
            hoverBackgroundColor: 'rgba(79, 70, 229, 0.9)',
            barPercentage: 0.6,
            categoryPercentage: 0.8
          },
          {
            label: 'Total Nominal (Rp)',
            data: amounts,
            type: 'line',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 3,
            yAxisID: 'y1',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(16, 185, 129, 1)',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: 'white',
            pointHoverBorderColor: 'rgba(16, 185, 129, 1)',
            pointHoverBorderWidth: 3
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
                family: "'Inter', sans-serif",
                size: 12,
                weight: 'bold'
              },
              padding: { top: 0, bottom: 10 }
            },
            grid: {
              color: 'rgba(203, 213, 225, 0.3)',
              drawBorder: false
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif"
              },
              padding: 10
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            title: {
              display: true,
              text: 'Total Nominal (Rp)',
              font: {
                family: "'Inter', sans-serif",
                size: 12,
                weight: 'bold'
              },
              padding: { top: 0, bottom: 10 }
            },
            grid: {
              drawOnChartArea: false,
              drawBorder: false
            },
            ticks: {
              callback: function (value) {
                if (value >= 1000000) return (value / 1000000).toFixed(1) + ' jt';
                if (value >= 1000) return (value / 1000).toFixed(0) + ' rb';
                return value;
              },
              font: {
                family: "'Inter', sans-serif"
              },
              padding: 10
            }
          },
          x: {
            grid: {
              color: 'rgba(203, 213, 225, 0.3)',
              drawBorder: false
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif"
              },
              maxRotation: 45,
              minRotation: 45
            }
          }
        },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            padding: 16,
            titleFont: {
              family: "'Inter', sans-serif",
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              family: "'Inter', sans-serif",
              size: 13
            },
            cornerRadius: 8,
            boxPadding: 6,
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
              padding: 20,
              font: {
                family: "'Inter', sans-serif",
                size: 12
              }
            }
          }
        },
        animation: {
          duration: 1200,
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
      ctx.font = '14px "Inter", sans-serif';
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

  // Fungsi handleExport yang diperbaiki untuk BookingReport.jsx
  const handleExport = async () => {
    try {
      setLoading(true);
      // Gunakan data yang sudah ada dari state, tidak perlu panggil API lagi
      const bookingsData = data.bookings || [];

      if (bookingsData.length === 0) {
        toast.error('Tidak ada data untuk diekspor');
        return;
      }

      // Buat file CSV dari data yang sudah ada
      let csvContent = "data:text/csv;charset=utf-8,";

      // Tambahkan informasi laporan di bagian atas
      csvContent += "Laporan Booking\r\n";
      csvContent += `Periode: ${formattedDateRange.start} - ${formattedDateRange.end}\r\n`;
      csvContent += `Total Booking: ${data.totalBookings}\r\n`;
      csvContent += `Total Penumpang: ${data.totalPassengers}\r\n`;
      csvContent += `Total Kendaraan: ${data.totalVehicles}\r\n`;
      csvContent += `Total Pendapatan: Rp ${data.totalRevenue.toLocaleString('id-ID')}\r\n\r\n`;

      // Tambahkan header kolom
      const headers = [
        "Booking Code",
        "Tanggal Booking",
        "Pengguna",
        "Rute",
        "Jadwal",
        "Tanggal Keberangkatan",
        "Jumlah Penumpang",
        "Jumlah Kendaraan",
        "Total Harga",
        "Status",
        "Metode Pembayaran"
      ];
      csvContent += headers.join(',') + "\r\n";

      // Tambahkan data baris
      bookingsData.forEach(booking => {
        const paymentMethod = booking.payments && booking.payments.length > 0 ?
          booking.payments[0].payment_method : 'N/A';

        const row = [
          booking.booking_code,
          new Date(booking.created_at).toLocaleString('id-ID'),
          booking.user?.name || 'N/A',
          `${booking.schedule?.route?.origin || 'N/A'} - ${booking.schedule?.route?.destination || 'N/A'}`,
          `${booking.schedule?.departure_time || 'N/A'} - ${booking.schedule?.arrival_time || 'N/A'}`,
          booking.departure_date || booking.booking_date || 'N/A',
          booking.passenger_count,
          booking.vehicle_count,
          booking.total_amount,
          booking.status,
          paymentMethod
        ];

        // Escape nilai yang mungkin berisi koma
        const formattedRow = row.map(value => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });

        csvContent += formattedRow.join(',') + "\r\n";
      });

      // Buat element anchor untuk mengunduh file
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `booking_report_${filters.start_date}_to_${filters.end_date}.csv`);
      document.body.appendChild(link);

      // Trigger unduhan
      link.click();
      document.body.removeChild(link);

      toast.success('Laporan booking berhasil diunduh');
    } catch (error) {
      console.error('Error exporting booking report:', error);
      toast.error('Gagal mengunduh laporan: ' + (error.message || 'Terjadi kesalahan'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
      REFUNDED: 'bg-gray-100 text-gray-800 border-gray-200',
      RESCHEDULED: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Komponen Skeleton untuk bagian tertentu
  const CardSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  );

  // Hitung rata-rata booking per hari
  const getDaysDiff = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    // +1 agar inklusif (misal 1-3 = 3 hari: 1,2,3)
    return Math.max(1, Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
  };
  const dailyAverage = useMemo(() => {
    const days = getDaysDiff(data.startDate, data.endDate);
    return days > 0 ? (data.totalBookings / days).toFixed(1) : data.totalBookings;
  }, [data.totalBookings, data.startDate, data.endDate]);

  const ChartSkeleton = () => (
    <div className="animate-pulse h-80 bg-gray-100 rounded-xl"></div>
  );

  const TableSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded-lg w-full mb-4"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-lg w-full mb-2"></div>
      ))}
    </div>
  );

  return (
    <div className="max-w-[1600px] px-6 py-8 mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-2xl shadow-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Laporan Booking</h1>
            <p className="text-gray-500 mt-1">Analisis data booking dan transaksi secara komprehensif</p>
          </div>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleExport}
            disabled={loading || !data.bookings || data.bookings.length === 0}
            className={`flex items-center px-4 py-2.5 ${loading || !data.bookings || data.bookings.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
              } text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengunduh...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </>
            )}
          </button>
        </div>

      </div>

      {/* Indikator Loading Global */}
      {loading && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Memuat data...</span>
          </div>
        </div>
      )}

      {/* Informasi Rentang Tanggal */}
      <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden border border-gray-100">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="bg-indigo-100 p-3 rounded-xl mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Periode</span>
                <p className="font-medium text-gray-800 mt-1">{formattedDateRange.start} - {formattedDateRange.end}</p>
              </div>
            </div>
            {filters.route_id && (
              <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="bg-indigo-100 p-3 rounded-xl mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Rute</span>
                  <p className="font-medium text-gray-800 mt-1">
                    {data.bookings[0]?.schedule?.route?.origin} - {data.bookings[0]?.schedule?.route?.destination}
                  </p>
                </div>
              </div>
            )}
            {filters.status && (
              <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="bg-indigo-100 p-3 rounded-xl mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Status</span>
                  <p className="font-medium text-gray-800 mt-1">{filters.status}</p>
                </div>
              </div>
            )}
            <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="bg-indigo-100 p-3 rounded-xl mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Update Terakhir</span>
                <p className="font-medium text-gray-800 mt-1">
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Booking */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-indigo-100 group">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Total Booking</p>
                  <p className="mt-2 text-3xl font-extrabold text-gray-800 group-hover:text-indigo-600 transition-colors">{data.totalBookings.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {dailyAverage} booking per hari
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-4 rounded-xl shadow-md text-white transform group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-3">
            <span className="text-xs text-indigo-700 font-medium">Total pemesanan dalam periode</span>
          </div>
        </div>

        {/* Total Pendapatan */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-emerald-100 group">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Pendapatan</p>
                  <p className="mt-2 text-3xl font-extrabold text-gray-800 group-hover:text-emerald-600 transition-colors">
                    Rp {data.totalRevenue.toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Aktual: Rp {data.actualRevenue.toLocaleString('id-ID')}
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 rounded-xl shadow-md text-white transform group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-3">
            <span className="text-xs text-emerald-700 font-medium">Semua transaksi dalam periode</span>
          </div>
        </div>

        {/* Total Penumpang */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-violet-100 group">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-bold text-violet-600 uppercase tracking-wider">Total Penumpang</p>
                  <p className="mt-2 text-3xl font-extrabold text-gray-800 group-hover:text-violet-600 transition-colors">{data.totalPassengers.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {(data.totalPassengers / Math.max(1, data.totalBookings)).toFixed(1)} per booking
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-violet-500 to-violet-700 p-4 rounded-xl shadow-md text-white transform group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-violet-50 to-violet-100 px-6 py-3">
            <span className="text-xs text-violet-700 font-medium">Jumlah orang dalam periode</span>
          </div>
        </div>

        {/* Total Kendaraan */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-amber-100 group">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Total Kendaraan</p>
                  <p className="mt-2 text-3xl font-extrabold text-gray-800 group-hover:text-amber-600 transition-colors">{data.totalVehicles.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {(data.totalVehicles / Math.max(1, data.totalBookings)).toFixed(1)} per booking
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-4 rounded-xl shadow-md text-white transform group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-3">
            <span className="text-xs text-amber-700 font-medium">Kendaraan yang diangkut</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Grafik Trend Booking */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Tren Booking Harian
            </h2>
            {!loading && <span className="text-xs bg-indigo-100 text-indigo-800 py-1.5 px-4 rounded-full font-medium shadow-sm border border-indigo-200">{data.bookingTrend.length} hari</span>}
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
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Breakdown Status
            </h2>
            {!loading && <span className="text-xs bg-indigo-100 text-indigo-800 py-1.5 px-4 rounded-full font-medium shadow-sm border border-indigo-200">{data.statusCount.length} status</span>}
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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
          <h2 className="text-lg= font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Laporan
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleFilter} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
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
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
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
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-2">Rute</label>
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
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none bg-white"
                  >
                    <option value="">Semua Rute</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.id}>
                        {route.origin} - {route.destination}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none bg-white"
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                )}
                Terapkan Filter
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Daftar Booking - Tampilan yang Diperbarui */}
      <div className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl p-4">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="bg-indigo-600 rounded-lg p-1.5 mr-3 shadow inline-flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            Daftar Booking
            {!loading && (
              <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full font-medium border border-indigo-200">
                {data.bookings.length}
              </span>
            )}
          </h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-grow max-w-xs">
              <input
                type="text"
                placeholder="Cari booking..."
                className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full text-sm"
                value={searchTerm}
                onChange={handleSearch}
              />
              <div className="absolute left-2.5 top-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <select
              className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-600"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={5}>5 data</option>
              <option value={10}>10 data</option>
              <option value={25}>25 data</option>
              <option value={50}>50 data</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Booking</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Penumpang</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedBookings.length > 0 ? (
                    paginatedBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-indigo-600">{booking.booking_code}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(booking.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium mr-2 text-sm">
                              {booking.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{booking.user.name}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[120px]">{booking.user.email || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">{booking.schedule.route.origin}</div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            {booking.schedule.route.destination}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-800">
                            {new Date(booking.booking_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.schedule.departure_time}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <div className="flex items-center text-xs px-2 py-1 bg-violet-50 text-violet-700 rounded-md">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {booking.passenger_count}
                            </div>
                            {booking.vehicle_count > 0 && (
                              <div className="flex items-center text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                </svg>
                                {booking.vehicle_count}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-emerald-700">
                            Rp {booking.total_amount.toLocaleString('id-ID')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md ${getStatusBadge(booking.status)}`}>
                            {booking.status === 'CONFIRMED' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {booking.status === 'PENDING' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {booking.status === 'CANCELLED' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/admin/bookings/${booking.id}`}
                            className="inline-flex items-center px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs rounded-md transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p>Tidak ada data booking ditemukan</p>
                        {searchTerm && (
                          <p className="mt-1 text-sm">Coba ubah kata kunci pencarian</p>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination yang Lebih Sederhana */}
        {!loading && filteredBookings.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-600">
              Menampilkan {Math.min(paginatedBookings.length, itemsPerPage)} dari {filteredBookings.length} booking
            </div>

            <div className="flex items-center gap-2">
              <button
                className={`p-2 rounded-md border border-gray-300 text-gray-500 transition-colors flex items-center justify-center ${currentPage > 1 ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="text-sm">
                Halaman <span className="font-medium">{currentPage}</span> dari <span className="font-medium">{totalPages || 1}</span>
              </div>

              <button
                className={`p-2 rounded-md border border-gray-300 text-gray-500 transition-colors flex items-center justify-center ${currentPage < totalPages ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingReport;