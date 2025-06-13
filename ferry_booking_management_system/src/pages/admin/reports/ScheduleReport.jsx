import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import adminReportService from '../../../services/adminReport.service';
import Chart from 'chart.js/auto';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ScheduleReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [data, setData] = useState({
    totalPassengers: 0,
    totalVehicles: 0,
    overallOccupancyRate: 0,
    scheduleStats: [],
    vehicleDistribution: {
      motorcycle: { count: 0, percentage: 0 },
      car: { count: 0, percentage: 0 },
      bus: { count: 0, percentage: 0 },
      truck: { count: 0, percentage: 0 }
    },
    startDate: searchParams.get('start_date') || new Date().toISOString().slice(0, 10),
    endDate: searchParams.get('end_date') || new Date().toISOString().slice(0, 10)
  });

  const [filters, setFilters] = useState({
    start_date: searchParams.get('start_date') || new Date().toISOString().slice(0, 10),
    end_date: searchParams.get('end_date') || new Date().toISOString().slice(0, 10),
    route_id: searchParams.get('route_id') || ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  const passengerChartRef = useRef(null);
  const passengerChartInstance = useRef(null);
  const vehicleChartRef = useRef(null);
  const vehicleChartInstance = useRef(null);
  const occupancyChartRef = useRef(null);
  const occupancyChartInstance = useRef(null);

  useEffect(() => {
    fetchData();
    fetchRoutes();

    return () => {
      // Cleanup charts
      if (passengerChartInstance.current) {
        passengerChartInstance.current.destroy();
      }
      if (vehicleChartInstance.current) {
        vehicleChartInstance.current.destroy();
      }
      if (occupancyChartInstance.current) {
        occupancyChartInstance.current.destroy();
      }
    };
  }, [searchParams]);

  useEffect(() => {
    // Selalu buat chart bahkan jika data kosong
    if (!loading) {
      createPassengerChart();
      createVehicleChart();
      createOccupancyChart();
    }
  }, [data, loading]);

  // Memetakan struktur data dari API
  useEffect(() => {
    if (!loading && data && data.scheduleStats) {
      // Log untuk memeriksa struktur data yang diterima
      console.log("Schedule data received:", data.scheduleStats[0]);
    }
  }, [data, loading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await adminReportService.getScheduleReport(Object.fromEntries(searchParams));

      if (response.success) {
        setData(response.data);
      } else {
        toast.error('Gagal memuat data laporan jadwal');
      }
    } catch (error) {
      console.error('Error fetching schedule report:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await adminReportService.getDashboardData();
      if (response.success && response.data && response.data.routes) {
        setRoutes(response.data.routes);
      } else {
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes([]);
    }
  };

  // Pagination logic & filtered schedules
  const filteredSchedules = useMemo(() => {
    if (!searchTerm) return data.scheduleStats;

    return data.scheduleStats.filter(schedule =>
      schedule.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.ferry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.time.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.days.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data.scheduleStats, searchTerm]);

  const totalPages = useMemo(() => Math.ceil(filteredSchedules.length / itemsPerPage), [filteredSchedules, itemsPerPage]);

  const paginatedSchedules = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSchedules.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSchedules, currentPage, itemsPerPage]);

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

  const createPassengerChart = () => {
    const ctx = passengerChartRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (passengerChartInstance.current) {
      passengerChartInstance.current.destroy();
    }

    // Periksa apakah data tersedia
    const hasSampleData = data.scheduleStats && data.scheduleStats.length > 0;

    // Data dummy atau data aktual
    const scheduleLabels = hasSampleData
      ? data.scheduleStats.map(stat => `${stat.route} (${stat.time.split(' ')[1]})`)
      : ['Tidak ada data'];

    const passengerCounts = hasSampleData
      ? data.scheduleStats.map(stat => stat.passenger_count)
      : [0];

    const capacityPassengers = hasSampleData
      ? data.scheduleStats.map(stat => stat.capacity_passenger || 0)
      : [100];

    passengerChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: scheduleLabels,
        datasets: [
          {
            label: 'Jumlah Penumpang',
            data: passengerCounts,
            backgroundColor: 'rgba(79, 70, 229, 0.75)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 2,
            borderRadius: 6,
            hoverBackgroundColor: 'rgba(79, 70, 229, 0.9)',
            barPercentage: 0.6,
            categoryPercentage: 0.8
          },
          {
            label: 'Kapasitas Maksimum',
            data: capacityPassengers,
            backgroundColor: 'rgba(209, 213, 219, 0.3)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 3,
            type: 'line',
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
              text: 'Jumlah Penumpang',
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
          x: {
            grid: {
              color: 'rgba(203, 213, 225, 0.3)',
              drawBorder: false
            },
            ticks: {
              display: hasSampleData && scheduleLabels.length < 10,
              callback: function (value) {
                // Truncate long labels
                const label = this.getLabelForValue(value);
                if (label && label.length > 15) {
                  return label.substring(0, 15) + '...';
                }
                return label;
              },
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
            boxPadding: 6
          },
          legend: {
            position: 'top',
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
      ctx.fillText('Tidak ada data penumpang untuk ditampilkan', width / 2, height / 2);
      ctx.restore();
    }
  };

  const createVehicleChart = () => {
    const ctx = vehicleChartRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (vehicleChartInstance.current) {
      vehicleChartInstance.current.destroy();
    }

    // Periksa apakah data tersedia
    const hasSampleData = data.vehicleDistribution &&
      (data.vehicleDistribution.motorcycle?.count ||
        data.vehicleDistribution.car?.count ||
        data.vehicleDistribution.bus?.count ||
        data.vehicleDistribution.truck?.count);

    const vehicleLabels = ['Motor', 'Mobil', 'Bus', 'Truk'];

    const vehicleCounts = hasSampleData
      ? [
        data.vehicleDistribution?.motorcycle?.count || 0,
        data.vehicleDistribution?.car?.count || 0,
        data.vehicleDistribution?.bus?.count || 0,
        data.vehicleDistribution?.truck?.count || 0
      ]
      : [0, 0, 0, 0];

    const percentages = hasSampleData
      ? [
        data.vehicleDistribution?.motorcycle?.percentage || 0,
        data.vehicleDistribution?.car?.percentage || 0,
        data.vehicleDistribution?.bus?.percentage || 0,
        data.vehicleDistribution?.truck?.percentage || 0
      ]
      : [25, 25, 25, 25];

    vehicleChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: vehicleLabels,
        datasets: [{
          data: vehicleCounts,
          backgroundColor: [
            'rgba(79, 70, 229, 0.9)',
            'rgba(16, 185, 129, 0.9)',
            'rgba(245, 158, 11, 0.9)',
            'rgba(239, 68, 68, 0.9)',
          ],
          borderColor: [
            'rgba(79, 70, 229, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
          ],
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
                const percentage = percentages[context.dataIndex];
                return `${label}: ${value.toLocaleString()} kendaraan (${percentage.toFixed(1)}%)`;
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
      ctx.fillText('Tidak ada data kendaraan untuk ditampilkan', width / 2, height / 2);
      ctx.restore();
    }
  };

  const createOccupancyChart = () => {
    const ctx = occupancyChartRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (occupancyChartInstance.current) {
      occupancyChartInstance.current.destroy();
    }

    // Periksa apakah data tersedia
    const topSchedules = [...(data.scheduleStats || [])]
      .sort((a, b) => b.passenger_occupancy_rate - a.passenger_occupancy_rate)
      .slice(0, 5);

    const hasSampleData = topSchedules.length > 0;

    const colors = [
      'rgba(79, 70, 229, 0.75)',
      'rgba(16, 185, 129, 0.75)',
      'rgba(245, 158, 11, 0.75)',
      'rgba(239, 68, 68, 0.75)',
      'rgba(124, 58, 237, 0.75)'
    ];

    const borderColors = [
      'rgba(79, 70, 229, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(124, 58, 237, 1)'
    ];

    occupancyChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: hasSampleData ? topSchedules.map(schedule => `${schedule.route} (${schedule.time})`) : ['Tidak ada data'],
        datasets: [{
          label: 'Tingkat Okupansi (%)',
          data: hasSampleData ? topSchedules.map(schedule => schedule.passenger_occupancy_rate) : [0],
          backgroundColor: hasSampleData ? topSchedules.map((_, i) => colors[i % colors.length]) : colors[0],
          borderColor: hasSampleData ? topSchedules.map((_, i) => borderColors[i % borderColors.length]) : borderColors[0],
          borderWidth: 2,
          borderRadius: 6,
          hoverBackgroundColor: hasSampleData ? topSchedules.map((_, i) => borderColors[i % borderColors.length]) : borderColors[0],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Tingkat Okupansi (%)',
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
          y: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif"
              },
              padding: 10
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
                const value = context.raw || 0;
                return `Okupansi: ${value.toFixed(1)}%`;
              }
            }
          },
          legend: {
            display: false
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
      ctx.fillText('Tidak ada data okupansi untuk ditampilkan', width / 2, height / 2);
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
    adminReportService.getScheduleReport(Object.fromEntries(params))
      .then(response => {
        if (response.success) {
          setData(response.data);
          toast.success("Data berhasil diperbarui");
        } else {
          toast.error('Gagal memuat data laporan jadwal');
        }
      })
      .catch(error => {
        console.error('Error fetching schedule report:', error);
        toast.error('Terjadi kesalahan saat memuat data');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fungsi handleExport yang diperbaiki untuk ScheduleReport.jsx
  const handleExport = async () => {
    try {
      setLoading(true);
      // Gunakan data yang sudah ada dari state, tidak perlu panggil API lagi
      const scheduleStatsData = data.scheduleStats || [];

      if (scheduleStatsData.length === 0) {
        toast.error('Tidak ada data untuk diekspor');
        return;
      }

      // Buat file CSV dari data yang sudah ada
      let csvContent = "data:text/csv;charset=utf-8,";

      // Tambahkan informasi laporan di bagian atas
      csvContent += "Laporan Jadwal\r\n";
      csvContent += `Periode: ${formatDate(data.startDate)} - ${formatDate(data.endDate)}\r\n`;
      csvContent += `Tingkat Okupansi Keseluruhan: ${data.overallOccupancyRate?.toFixed(2) || '0.00'}%\r\n`;
      csvContent += `Total Penumpang: ${data.totalPassengers}\r\n`;
      csvContent += `Total Kendaraan: ${data.totalVehicles}\r\n\r\n`;

      // Tambahkan header kolom
      const headers = [
        "ID Jadwal",
        "Rute",
        "Kapal",
        "Waktu",
        "Hari",
        "Jumlah Penumpang",
        "Jumlah Kendaraan",
        "Motor",
        "Mobil",
        "Bus",
        "Truk",
        "Okupansi Penumpang (%)"
      ];
      csvContent += headers.join(',') + "\r\n";

      // Tambahkan data baris
      scheduleStatsData.forEach(stat => {
        const row = [
          stat.schedule_id,
          stat.route,
          stat.ferry,
          stat.time,
          stat.days,
          stat.passenger_count,
          stat.vehicle_count,
          stat.motorcycle_count,
          stat.car_count,
          stat.bus_count,
          stat.truck_count,
          stat.passenger_occupancy_rate?.toFixed(2) || '0.00'
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
      link.setAttribute("download", `schedule_report_${filters.start_date}_to_${filters.end_date}.csv`);
      document.body.appendChild(link);

      // Trigger unduhan
      link.click();
      document.body.removeChild(link);

      toast.success('Laporan jadwal berhasil diunduh');
    } catch (error) {
      console.error('Error exporting schedule report:', error);
      toast.error('Gagal mengunduh laporan: ' + (error.message || 'Terjadi kesalahan'));
    } finally {
      setLoading(false);
    }
  };

  // Format tanggal untuk display
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Laporan Jadwal</h1>
            <p className="text-gray-500 mt-1">Analisis data jadwal dan statistik okupansi secara komprehensif</p>
          </div>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleExport}
            disabled={loading || !data.scheduleStats || data.scheduleStats.length === 0}
            className={`flex items-center px-4 py-2.5 ${loading || !data.scheduleStats || data.scheduleStats.length === 0
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
                <p className="font-medium text-gray-800 mt-1">{formatDate(data.startDate)} - {formatDate(data.endDate)}</p>
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
                    {routes.find(r => r.id == filters.route_id)?.origin} - {routes.find(r => r.id == filters.route_id)?.destination}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="bg-indigo-100 p-3 rounded-xl mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Okupansi Rata-rata</span>
                <p className="font-medium text-gray-800 mt-1">{data.overallOccupancyRate?.toFixed(2) || 0}%</p>
              </div>
            </div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Penumpang */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-indigo-100 group">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Total Penumpang</p>
                  <p className="mt-2 text-3xl font-extrabold text-gray-800 group-hover:text-indigo-600 transition-colors">{data.totalPassengers.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {data.scheduleStats?.length > 0 ? (data.totalPassengers / data.scheduleStats.length).toFixed(1) : 0} per jadwal
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-4 rounded-xl shadow-md text-white transform group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-3">
            <span className="text-xs text-indigo-700 font-medium">Jumlah total penumpang dalam periode</span>
          </div>
        </div>

        {/* Total Kendaraan */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-emerald-100 group">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Kendaraan</p>
                  <p className="mt-2 text-3xl font-extrabold text-gray-800 group-hover:text-emerald-600 transition-colors">
                    {data.totalVehicles.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {data.scheduleStats?.length > 0 ? (data.totalVehicles / data.scheduleStats.length).toFixed(1) : 0} per jadwal
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 rounded-xl shadow-md text-white transform group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-3">
            <span className="text-xs text-emerald-700 font-medium">Jumlah total kendaraan dalam periode</span>
          </div>
        </div>

        {/* Jumlah Jadwal */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-amber-100 group">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Jumlah Jadwal</p>
                  <p className="mt-2 text-3xl font-extrabold text-gray-800 group-hover:text-amber-600 transition-colors">{data.scheduleStats?.length || 0}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Jadwal yang dianalisis
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-4 rounded-xl shadow-md text-white transform group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-3">
            <span className="text-xs text-amber-700 font-medium">Total jadwal dianalisis</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Grafik Distribusi Penumpang */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Distribusi Penumpang per Jadwal
            </h2>
            {!loading && <span className="text-xs bg-indigo-100 text-indigo-800 py-1.5 px-4 rounded-full font-medium shadow-sm border border-indigo-200">{data.scheduleStats?.length || 0} jadwal</span>}
          </div>
          <div className="p-6">
            <div className="h-80">
              {loading ? (
                <ChartSkeleton />
              ) : (
                <canvas ref={passengerChartRef}></canvas>
              )}
            </div>
          </div>
        </div>

        {/* Grafik Distribusi Kendaraan */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Distribusi Jenis Kendaraan
            </h2>
            {!loading && (
              <span className="text-xs bg-indigo-100 text-indigo-800 py-1.5 px-4 rounded-full font-medium shadow-sm border border-indigo-200">
                {data.totalVehicles} kendaraan
              </span>
            )}
          </div>
          <div className="p-6">
            <div className="h-80">
              {loading ? (
                <ChartSkeleton />
              ) : (
                <canvas ref={vehicleChartRef}></canvas>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grafik Okupansi */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl mb-8">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Top 5 Jadwal dengan Okupansi Tertinggi
          </h2>
          {!loading && <span className="text-xs bg-indigo-100 text-indigo-800 py-1.5 px-4 rounded-full font-medium shadow-sm border border-indigo-200">Rata-rata: {data.overallOccupancyRate?.toFixed(2) || 0}%</span>}
        </div>
        <div className="p-6">
          <div className="h-80">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <canvas ref={occupancyChartRef}></canvas>
            )}
          </div>
        </div>
      </div>

      {/* Filter Form */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Laporan
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleFilter} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Daftar Jadwal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl mb-8">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Detail Jadwal
          </h2>
          {!loading && <span className="text-xs bg-indigo-100 text-indigo-800 py-1.5 px-4 rounded-full font-medium shadow-sm border border-indigo-200">{data.scheduleStats?.length || 0} jadwal</span>}
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 pt-4">
          <div className="relative flex-grow max-w-xs">
            <input
              type="text"
              placeholder="Cari jadwal..."
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

        {loading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-gray-50 border-b border-gray-200">
                  <th className="text-center py-3 px-4 text-xs font-semibold text-indigo-600 uppercase tracking-wider">ID Jadwal</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-indigo-600 uppercase tracking-wider">Rute</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-indigo-600 uppercase tracking-wider">Kapal</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-indigo-600 uppercase tracking-wider">Waktu</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-indigo-600 uppercase tracking-wider">Hari</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-indigo-600 uppercase tracking-wider">Penumpang</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-indigo-600 uppercase tracking-wider">Kendaraan</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-indigo-600 uppercase tracking-wider">Okupansi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedSchedules.length > 0 ? (
                  paginatedSchedules.map((stat, index) => (
                    <tr key={index} className="hover:bg-indigo-50/10 transition-colors">
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="text-sm font-medium text-white bg-indigo-600 px-3 py-1.5 rounded-lg inline-block shadow-sm">
                          {stat.schedule_id}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-9 w-9 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mr-3 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{stat.route}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-semibold bg-blue-50 text-blue-700 px-4 py-1.5 rounded-lg inline-flex items-center shadow-sm border border-blue-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                          {stat.ferry}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg inline-flex items-center shadow-sm border border-indigo-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {stat.time.includes('-') ? (
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {stat.time.split(' - ')[0].split(' ')[1]}
                              </span>
                              <span className="text-xs text-indigo-500 mt-1">
                                {stat.time.split(' - ')[1].split(' ')[1]}
                              </span>
                            </div>
                          ) : (
                            stat.time
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {stat.days.split(',').map((day, i) => {
                            // Convert numeric day to name
                            const dayName = (() => {
                              const num = parseInt(day.trim());
                              switch (num) {
                                case 1: return "Sen";
                                case 2: return "Sel";
                                case 3: return "Rab";
                                case 4: return "Kam";
                                case 5: return "Jum";
                                case 6: return "Sab";
                                case 7: return "Min";
                                default: return day.trim();
                              }
                            })();

                            return (
                              <span key={i} className="inline-flex items-center justify-center w-8 h-8 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
                                {dayName}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium bg-green-50 text-green-700 px-4 py-2 rounded-lg inline-flex items-center shadow-sm border border-green-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="font-bold text-base">{stat.passenger_count}</span>
                            <span className="mx-1 text-gray-400">/</span>
                            <span className="text-xs text-green-600">
                              {stat.capacity_passenger ||
                                (stat.ferry && Array.isArray(data.scheduleStats) &&
                                  data.scheduleStats.find(s => s.ferry === stat.ferry)?.capacity_passenger) ||
                                "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg shadow-sm">
                            <span className="text-xs font-medium uppercase">Motor</span>
                            <span className="text-base font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-indigo-100">{stat.motorcycle_count}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg shadow-sm">
                            <span className="text-xs font-medium uppercase">Mobil</span>
                            <span className="text-base font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-emerald-100">{stat.car_count}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-2 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg shadow-sm">
                            <span className="text-xs font-medium uppercase">Bus</span>
                            <span className="text-base font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-amber-100">{stat.bus_count}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-2 bg-red-50 border border-red-100 text-red-700 rounded-lg shadow-sm">
                            <span className="text-xs font-medium uppercase">Truk</span>
                            <span className="text-base font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-red-100">{stat.truck_count}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="flex-grow bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                            <div
                              className={`h-2.5 rounded-full shadow-sm ${stat.passenger_count && stat.capacity_passenger
                                ? (stat.passenger_count / stat.capacity_passenger) * 100 > 80
                                  ? 'bg-gradient-to-r from-green-400 to-green-600'
                                  : (stat.passenger_count / stat.capacity_passenger) * 100 > 50
                                    ? 'bg-gradient-to-r from-indigo-400 to-indigo-600'
                                    : 'bg-gradient-to-r from-amber-400 to-amber-600'
                                : stat.passenger_occupancy_rate > 80
                                  ? 'bg-gradient-to-r from-green-400 to-green-600'
                                  : stat.passenger_occupancy_rate > 50
                                    ? 'bg-gradient-to-r from-indigo-400 to-indigo-600'
                                    : 'bg-gradient-to-r from-amber-400 to-amber-600'
                                }`}
                              style={{
                                width: `${Math.min(100, stat.passenger_count && stat.capacity_passenger
                                  ? (stat.passenger_count / stat.capacity_passenger) * 100
                                  : stat.passenger_occupancy_rate || 0)}%`
                              }}
                            ></div>
                          </div>
                          <span className={`text-sm font-bold px-3 py-1.5 rounded-md shadow-sm ${stat.passenger_occupancy_rate > 80
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : stat.passenger_occupancy_rate > 50
                              ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                            {stat.passenger_count && stat.capacity_passenger
                              ? ((stat.passenger_count / stat.capacity_passenger) * 100).toFixed(1)
                              : stat.passenger_occupancy_rate?.toFixed(1) || '0.0'}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                      </svg>
                      <p>Tidak ada data jadwal ditemukan</p>
                      {searchTerm && (
                        <p className="mt-1 text-sm">Coba ubah kata kunci pencarian</p>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && data.scheduleStats.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-700 mb-4 md:mb-0">
                Menampilkan {paginatedSchedules.length} dari {filteredSchedules.length} jadwal
              </div>

              {filteredSchedules.length > itemsPerPage && (
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
              )}

              <div className="flex space-x-4 mt-4 md:mt-0">
                <div className="bg-indigo-100 px-4 py-2 rounded-lg flex items-center text-indigo-700 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Total Penumpang: <span className="ml-1">{data.totalPassengers.toLocaleString('id-ID')}</span>
                </div>
                <div className="bg-emerald-100 px-4 py-2 rounded-lg flex items-center text-emerald-700 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  Total Kendaraan: <span className="ml-1">{data.totalVehicles.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleReport;