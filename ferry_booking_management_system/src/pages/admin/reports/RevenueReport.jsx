import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import adminReportService from '../../../services/adminReport.service';
import Chart from 'chart.js/auto';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RevenueReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [data, setData] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    revenues: [],
    startDate: searchParams.get('start_date') || new Date().toISOString().slice(0, 10),
    endDate: searchParams.get('end_date') || new Date().toISOString().slice(0, 10),
    groupBy: searchParams.get('group_by') || 'monthly',
    revenueGrowth: 0
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const [filters, setFilters] = useState({
    start_date: searchParams.get('start_date') || new Date().toISOString().slice(0, 10),
    end_date: searchParams.get('end_date') || new Date().toISOString().slice(0, 10),
    route_id: searchParams.get('route_id') || '',
    group_by: searchParams.get('group_by') || 'monthly'
  });

  const revenueChartRef = useRef(null);
  const revenueChartInstance = useRef(null);
  const distributionChartRef = useRef(null);
  const distributionChartInstance = useRef(null);

  useEffect(() => {
    fetchData();
    fetchRoutes();

    return () => {
      // Cleanup charts
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
      if (distributionChartInstance.current) {
        distributionChartInstance.current.destroy();
      }
    };
  }, [searchParams]);

  useEffect(() => {
    // Create charts when data is available
    if (!loading && data.revenues.length > 0) {
      createRevenueChart();
      createDistributionChart();
    }
  }, [data.revenues, loading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await adminReportService.getRevenueReport(Object.fromEntries(searchParams));
      
      if (response.success) {
        setData(response.data);
      } else {
        toast.error('Gagal memuat data laporan pendapatan');
      }
    } catch (error) {
      console.error('Error fetching revenue report:', error);
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
    adminReportService.getRevenueReport(Object.fromEntries(params))
      .then(response => {
        if (response.success) {
          setData(response.data);
          toast.success("Data berhasil diperbarui");
        } else {
          toast.error('Gagal memuat data laporan pendapatan');
        }
      })
      .catch(error => {
        console.error('Error fetching revenue report:', error);
        toast.error('Terjadi kesalahan saat memuat data');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleExport = () => {
    try {
      const params = new URLSearchParams(searchParams);
      params.append('export', 'csv');
      window.location.href = `/admin/reports/revenue/export?${params.toString()}`;
      toast.success('Mengunduh laporan pendapatan...');
    } catch (error) {
      console.error('Error exporting revenue:', error);
      toast.error('Gagal mengunduh laporan');
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

  // Pagination logic
  const totalPages = Math.ceil(data.revenues.length / itemsPerPage);

  const paginatedRevenues = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.revenues.slice(startIndex, startIndex + itemsPerPage);
  }, [data.revenues, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Periode dalam bahasa Indonesia
  const getPeriodLabel = (groupBy) => {
    switch (groupBy) {
      case 'daily': return 'Harian';
      case 'weekly': return 'Mingguan';
      case 'monthly': return 'Bulanan';
      default: return 'Bulanan';
    }
  };

  // Create Revenue Chart (Bar + Line)
  const createRevenueChart = () => {
    const ctx = revenueChartRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (revenueChartInstance.current) {
      revenueChartInstance.current.destroy();
    }

    const labels = data.revenues.map(item => item.formatted_period);
    const amounts = data.revenues.map(item => item.total_amount);
    const transactions = data.revenues.map(item => item.transaction_count);

    revenueChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total Pendapatan',
            data: amounts,
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
            label: 'Jumlah Transaksi',
            data: transactions,
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
              text: 'Total Pendapatan (Rp)',
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
          y1: {
            beginAtZero: true,
            position: 'right',
            title: {
              display: true,
              text: 'Jumlah Transaksi',
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
                if (label.includes('Pendapatan')) {
                  return `${label}: ${formatCurrency(value)}`;
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
    if (data.revenues.length === 0) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '14px "Inter", sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('Tidak ada data tren pendapatan untuk ditampilkan', width / 2, height / 2);
      ctx.restore();
    }
  };

  // Create Distribution Chart (Doughnut)
  const createDistributionChart = () => {
    const ctx = distributionChartRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (distributionChartInstance.current) {
      distributionChartInstance.current.destroy();
    }

    // Group data by period type (daily, weekly, monthly)
    const periods = data.revenues.map(item => item.formatted_period);
    const amounts = data.revenues.map(item => item.total_amount);
    const transactions = data.revenues.map(item => item.transaction_count);

    const backgroundColors = [
      'rgba(79, 70, 229, 0.9)',
      'rgba(16, 185, 129, 0.9)',
      'rgba(245, 158, 11, 0.9)',
      'rgba(239, 68, 68, 0.9)',
      'rgba(59, 130, 246, 0.9)',
      'rgba(107, 114, 128, 0.9)',
      'rgba(139, 92, 246, 0.9)',
      'rgba(236, 72, 153, 0.9)'
    ];

    distributionChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: periods,
        datasets: [{
          data: amounts,
          backgroundColor: periods.map((_, idx) => backgroundColors[idx % backgroundColors.length]),
          borderColor: periods.map((_, idx) => backgroundColors[idx % backgroundColors.length].replace('0.9', '1')),
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
                const index = context.dataIndex;
                const transactionCount = transactions[index] || 0;
                const percentage = ((value / amounts.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                return [
                  `${label}: ${formatCurrency(value)} (${percentage}%)`,
                  `Transaksi: ${transactionCount}`
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
    if (data.revenues.length === 0) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '14px "Inter", sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('Tidak ada data distribusi pendapatan untuk ditampilkan', width / 2, height / 2);
      ctx.restore();
    }
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
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-2xl shadow-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Laporan Pendapatan</h1>
            <p className="text-gray-500 mt-1">Analisis pendapatan dan transaksi secara komprehensif</p>
          </div>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Indikator Loading Global */}
      {loading && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-blue-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center">
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
              <div className="bg-blue-100 p-3 rounded-xl mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Periode</span>
                <p className="font-medium text-gray-800 mt-1">{formatDate(data.startDate)} - {formatDate(data.endDate)}</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="bg-blue-100 p-3 rounded-xl mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Pengelompokan</span>
                <p className="font-medium text-gray-800 mt-1">{getPeriodLabel(data.groupBy)}</p>
              </div>
            </div>
            {filters.route_id && (
              <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="bg-blue-100 p-3 rounded-xl mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <div className="bg-blue-100 p-3 rounded-xl mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        {/* Total Pendapatan */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100 group">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Pendapatan</p>
                  <p className="mt-2 text-3xl font-extrabold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {formatCurrency(data.totalRevenue)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    {data.revenueGrowth >= 0 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                    <span className={data.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {data.revenueGrowth >= 0 ? '+' : ''}{data.revenueGrowth.toFixed(2)}%
                    </span> dari periode sebelumnya
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-xl shadow-md text-white transform group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-3">
            <span className="text-xs text-blue-700 font-medium">Total pendapatan dalam periode</span>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-green-100 group">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Total Transaksi</p>
                  <p className="mt-2 text-3xl font-extrabold text-gray-800 group-hover:text-green-600 transition-colors">
                    {data.totalTransactions.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {Math.floor((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24)) + 1} hari periode
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-green-500 to-green-700 p-4 rounded-xl shadow-md text-white transform group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-3">
            <span className="text-xs text-green-700 font-medium">Jumlah transaksi dalam periode</span>
          </div>
        </div>

        {/* Rata-rata Transaksi */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-amber-100 group">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Rata-rata Transaksi</p>
                  <p className="mt-2 text-3xl font-extrabold text-gray-800 group-hover:text-amber-600 transition-colors">
                    {formatCurrency(data.averageTransaction)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    Nilai rata-rata per transaksi
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-4 rounded-xl shadow-md text-white transform group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-3">
            <span className="text-xs text-amber-700 font-medium">Nilai rata-rata per transaksi</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Grafik Trend Pendapatan */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Tren Pendapatan {getPeriodLabel(data.groupBy)}
            </h2>
            {!loading && <span className="text-xs bg-blue-100 text-blue-800 py-1.5 px-4 rounded-full font-medium shadow-sm border border-blue-200">{data.revenues.length} periode</span>}
          </div>
          <div className="p-6">
            <div className="h-80">
              {loading ? (
                <ChartSkeleton />
              ) : (
                <canvas ref={revenueChartRef}></canvas>
              )}
            </div>
          </div>
        </div>

        {/* Distribusi Pendapatan */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Distribusi Pendapatan
            </h2>
            {!loading && <span className="text-xs bg-blue-100 text-blue-800 py-1.5 px-4 rounded-full font-medium shadow-sm border border-blue-200">{data.revenues.length} periode</span>}
          </div>
          <div className="p-6">
            <div className="h-80">
              {loading ? (
                <ChartSkeleton />
              ) : (
                <canvas ref={distributionChartRef}></canvas>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Form */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
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
                <label htmlFor="group_by" className="block text-sm font-medium text-gray-700 mb-2">Kelompokkan Berdasarkan</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <select
                    id="group_by"
                    name="group_by"
                    value={filters.group_by}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                  >
                    <option value="daily">Harian</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
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
                className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-medium"
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

      {/* Tabel Data */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Detail Pendapatan per {getPeriodLabel(data.groupBy)}
          </h2>
          {!loading && <span className="text-xs bg-blue-100 text-blue-800 py-1.5 px-4 rounded-full font-medium shadow-sm border border-blue-200">{data.revenues.length} entri</span>}
        </div>

        {loading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {data.groupBy === 'daily' ? 'Tanggal' : data.groupBy === 'weekly' ? 'Minggu' : 'Bulan'}
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Transaksi</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pendapatan</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Rata-rata Transaksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.revenues.length > 0 ? (
                  paginatedRevenues.map((revenue, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-3 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {data.groupBy === 'daily' && (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              )}
                              {data.groupBy === 'weekly' && (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                              )}
                              {data.groupBy === 'monthly' && (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              )}
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-blue-600">{revenue.formatted_period}</div>
                            {data.groupBy === 'daily' && revenue.period && (
                              <div className="text-xs text-gray-500">
                                {new Date(revenue.period).toLocaleDateString('id-ID', { weekday: 'long' })}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-sm font-medium">
                            {revenue.transaction_count.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                              {formatCurrency(revenue.total_amount)}
                            </div>
                            {index > 0 && (
                              <div className={`text-xs mt-1 flex items-center ${revenue.total_amount > data.revenues[(currentPage - 1) * itemsPerPage + index - 1].total_amount ? 'text-green-600' : 'text-red-600'}`}>
                                {revenue.total_amount > data.revenues[(currentPage - 1) * itemsPerPage + index - 1].total_amount ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                                  </svg>
                                )}
                                {Math.abs(((revenue.total_amount - data.revenues[(currentPage - 1) * itemsPerPage + index - 1].total_amount) / Math.max(0.01, data.revenues[(currentPage - 1) * itemsPerPage + index - 1].total_amount)) * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="bg-amber-100 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-sm font-medium">
                            {formatCurrency(revenue.average_amount)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>Tidak ada data pendapatan ditemukan</p>
                      <p className="mt-1 text-sm">Coba ubah filter atau pilih rentang tanggal yang berbeda</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="text-sm text-gray-700">
                Menampilkan {paginatedRevenues.length} dari {data.revenues.length} periode
              </div>
              <select
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={5}>5 data</option>
                <option value={10}>10 data</option>
                <option value={25}>25 data</option>
                <option value={50}>50 data</option>
              </select>
            </div>
            
            {data.revenues.length > itemsPerPage && (
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
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="text-xs bg-gray-100 text-gray-700 py-1.5 px-3 rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {getPeriodLabel(data.groupBy)}
              </div>
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs py-1.5 px-4 rounded-lg shadow-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Total: {formatCurrency(data.totalRevenue)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;