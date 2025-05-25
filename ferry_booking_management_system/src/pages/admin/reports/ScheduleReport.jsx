import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import adminReportService from '../../../services/adminReport.service';
import Chart from 'chart.js/auto';
import $ from 'jquery';
import 'datatables.net';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ScheduleReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
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

  const passengerChartRef = useRef(null);
  const passengerChartInstance = useRef(null);
  const vehicleChartRef = useRef(null);
  const vehicleChartInstance = useRef(null);
  const occupancyChartRef = useRef(null);
  const occupancyChartInstance = useRef(null);
  const tableRef = useRef(null);
  const dataTableInstance = useRef(null);

  // Memoize date formatting
  const formattedDateRange = useMemo(() => {
    return {
      start: new Date(data.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      end: new Date(data.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  }, [data.startDate, data.endDate]);

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
      // Cleanup datatable
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
      }
    };
  }, [searchParams]);

  useEffect(() => {
    if (data.scheduleStats.length > 0 && tableRef.current) {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
      }

      dataTableInstance.current = $(tableRef.current).DataTable({
        responsive: true,
        pageLength: 25,
        order: [[11, 'desc']],
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
  }, [data.scheduleStats]);

  useEffect(() => {
    // Selalu buat chart bahkan jika data kosong
    createPassengerChart();
    createVehicleChart();
    createOccupancyChart();
  }, [data.scheduleStats]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await adminReportService.getScheduleReport(Object.fromEntries(searchParams));
      setData(response.data);
    } catch (error) {
      console.error('Error fetching schedule report:', error);
      toast.error('Gagal memuat data laporan jadwal');
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
    const sampleLabels = ['Rute A (07:00)', 'Rute B (08:30)', 'Rute C (10:00)', 'Rute D (13:00)'];

    const scheduleLabels = hasSampleData
      ? data.scheduleStats.map(stat => `${stat.route} (${stat.time})`)
      : sampleLabels;

    const passengerCounts = hasSampleData
      ? data.scheduleStats.map(stat => stat.passenger_count)
      : [0, 0, 0, 0];

    const capacityPassengers = hasSampleData
      ? data.scheduleStats.map(stat => stat.max_passenger_capacity)
      : [100, 100, 100, 100];

    passengerChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: scheduleLabels,
        datasets: [
          {
            label: 'Jumlah Penumpang',
            data: passengerCounts,
            backgroundColor: 'rgba(37, 99, 235, 0.7)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 1,
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(37, 99, 235, 0.9)'
          },
          {
            label: 'Kapasitas Maksimum',
            data: capacityPassengers,
            backgroundColor: 'rgba(209, 213, 219, 0.3)',
            borderColor: 'rgba(209, 213, 219, 1)',
            borderWidth: 1,
            type: 'line',
            pointStyle: 'circle',
            pointRadius: 4,
            pointHoverRadius: 6
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
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(203, 213, 225, 0.3)',
            }
          },
          x: {
            ticks: {
              display: hasSampleData && scheduleLabels.length < 10,
            },
            grid: {
              display: false
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
              title: function (context) {
                return scheduleLabels[context[0].dataIndex];
              }
            }
          },
          legend: {
            position: 'top',
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
      : [25, 25, 25, 25]; // Data dummy persentase sama

    vehicleChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: vehicleLabels,
        datasets: [{
          data: vehicleCounts,
          backgroundColor: [
            'rgba(37, 99, 235, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(37, 99, 235, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 1,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12
              }
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
                const percentage = percentages[context.dataIndex];
                return `${label}: ${value.toLocaleString()} kendaraan (${percentage.toFixed(1)}%)`;
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

    const hasSampleData = topSchedules.length > 0 && topSchedules[0].daily_occupancy;

    // Data dummy atau data aktual
    const today = new Date();
    let allDates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      allDates.push(date.toISOString().slice(0, 10));
    }

    if (hasSampleData) {
      allDates = [...new Set(topSchedules.flatMap(schedule =>
        schedule.daily_occupancy.map(day => day.date)
      ))].sort();
    }

    const colors = [
      'rgba(37, 99, 235, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(124, 58, 237, 1)'
    ];

    const backgroundColors = [
      'rgba(37, 99, 235, 0.1)',
      'rgba(16, 185, 129, 0.1)',
      'rgba(245, 158, 11, 0.1)',
      'rgba(239, 68, 68, 0.1)',
      'rgba(124, 58, 237, 0.1)'
    ];

    // Jika tidak ada data, buat dataset dummy
    const datasets = hasSampleData
      ? topSchedules.map((schedule, index) => {
        const rates = schedule.daily_occupancy.map(day => day.occupancy_rate);
        return {
          label: `${schedule.route} (${schedule.time})`,
          data: rates,
          backgroundColor: backgroundColors[index % backgroundColors.length],
          borderColor: colors[index % colors.length],
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors[index % colors.length],
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        };
      })
      : [
        {
          label: 'Rute A (07:00)',
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: backgroundColors[0],
          borderColor: colors[0],
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors[0],
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Rute B (09:30)',
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: backgroundColors[1],
          borderColor: colors[1],
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors[1],
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ];

    occupancyChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: allDates,
        datasets: datasets
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
              text: 'Tingkat Okupansi (%)',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            max: 100,
            grid: {
              color: 'rgba(203, 213, 225, 0.3)',
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
                return `${label}: ${value.toFixed(1)}%`;
              }
            }
          },
          legend: {
            position: 'top',
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
        setData(response.data);
        toast.success("Data berhasil diperbarui");
      })
      .catch(error => {
        console.error('Error fetching schedule report:', error);
        toast.error('Gagal memuat data laporan jadwal');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleExport = () => {
    const params = new URLSearchParams(searchParams);
    params.append('export', 'csv');
    window.location.href = `/admin/reports/schedule/export?${params.toString()}`;
    toast.success('Mengunduh laporan jadwal...');
  };

  const handlePrint = () => {
    window.print();
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Laporan Jadwal</h1>
            <p className="text-sm text-gray-500">Analisis okupansi dan kinerja jadwal</p>
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
                    {routes.find(r => r.id == filters.route_id)?.origin} - {routes.find(r => r.id == filters.route_id)?.destination}
                  </p>
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
        {/* Total Penumpang */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100">
          <div className="p-5">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Penumpang</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">
                    {data.totalPassengers.toLocaleString('id-ID')}
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-2">
            <span className="text-xs text-blue-700 font-medium">Total penumpang dalam periode</span>
          </div>
        </div>

        {/* Total Kendaraan */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100">
          <div className="p-5">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Kendaraan</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">
                    {data.totalVehicles.toLocaleString('id-ID')}
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-2">
            <span className="text-xs text-blue-700 font-medium">Total kendaraan diangkut</span>
          </div>
        </div>

        {/* Okupansi Rata-rata */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100">
          <div className="p-5">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Okupansi Rata-rata</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">{data.overallOccupancyRate.toFixed(2)}%</p>
                </div>
              )}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-2">
            <span className="text-xs text-blue-700 font-medium">Rata-rata tingkat keterisian</span>
          </div>
        </div>

        {/* Jumlah Jadwal */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100">
          <div className="p-5">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Jumlah Jadwal</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">{data.scheduleStats.length}</p>
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
            <span className="text-xs text-blue-700 font-medium">Total jadwal yang dianalisis</span>
          </div>
        </div>
      </div>

      {/* Form Filter */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Chart Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Distribusi Penumpang */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Distribusi Penumpang per Jadwal
            </h2>
            {!loading && <span className="text-xs bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">{data.scheduleStats.length} jadwal</span>}
          </div>
          <div className="p-6">
            <div className="h-64">
              {loading ? (
                <ChartSkeleton />
              ) : (
                <canvas ref={passengerChartRef}></canvas>
              )}
            </div>
          </div>
        </div>

        {/* Distribusi Kendaraan */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Distribusi Jenis Kendaraan
            </h2>
            {!loading && <span className="text-xs bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">{data.totalVehicles} total</span>}
          </div>
          <div className="p-6">
            <div className="h-64">
              {loading ? (
                <ChartSkeleton />
              ) : (
                <canvas ref={vehicleChartRef}></canvas>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grafik Okupansi Harian */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Trend Okupansi Jadwal Teratas
          </h2>
          <span className="text-xs bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">5 jadwal teratas</span>
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

      {/* Tabel Statistik Jadwal */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Detail Statistik Jadwal
          </h2>
          {!loading && <span className="text-xs bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">{data.scheduleStats.length} jadwal</span>}
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Jadwal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jml Tanggal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penumpang</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobil</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truk</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Okupansi(%)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.scheduleStats.map((stat, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{stat.schedule_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stat.route}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stat.ferry}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stat.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stat.days}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stat.dates_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stat.passenger_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stat.motorcycle_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stat.car_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stat.bus_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stat.truck_count}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${stat.passenger_occupancy_rate > 80 ? 'text-green-600' :
                      (stat.passenger_occupancy_rate > 50 ? 'text-blue-600' : 'text-yellow-600')
                      }`}>
                      <div className="flex items-center">
                        <div className={`h-2 w-16 rounded-full overflow-hidden bg-gray-200 mr-2`}>
                          <div
                            className={`h-full rounded-full ${stat.passenger_occupancy_rate > 80 ? 'bg-green-500' :
                              (stat.passenger_occupancy_rate > 50 ? 'bg-blue-500' : 'bg-yellow-500')
                              }`}
                            style={{ width: `${Math.min(100, stat.passenger_occupancy_rate)}%` }}
                          ></div>
                        </div>
                        {stat.passenger_occupancy_rate.toFixed(2)}%
                      </div>
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

export default ScheduleReport;