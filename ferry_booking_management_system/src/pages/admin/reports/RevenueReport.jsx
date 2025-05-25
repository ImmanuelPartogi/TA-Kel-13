import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import adminReportService from '../../../services/adminReport.service';
import Chart from 'chart.js/auto';
import $ from 'jquery';
import 'datatables.net';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RevenueReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
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
  const [filters, setFilters] = useState({
    start_date: searchParams.get('start_date') || new Date().toISOString().slice(0, 10),
    end_date: searchParams.get('end_date') || new Date().toISOString().slice(0, 10),
    route_id: searchParams.get('route_id') || '',
    group_by: searchParams.get('group_by') || 'monthly'
  });

  const revenueChartRef = useRef(null);
  const revenueChartInstance = useRef(null);
  const tableRef = useRef(null);
  const dataTableInstance = useRef(null);

  // Memoize date formatting
  const formattedDateRange = useMemo(() => {
    return {
      start: new Date(data.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      end: new Date(data.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  }, [data.startDate, data.endDate]);

  const diffInDays = useMemo(() => {
    return Math.floor((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24)) + 1;
  }, [data.startDate, data.endDate]);

  useEffect(() => {
    fetchData();
    fetchRoutes();

    return () => {
      // Cleanup charts
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
      // Cleanup datatable
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
      }
    };
  }, [searchParams]);

  useEffect(() => {
    if (data.revenues.length > 0 && tableRef.current) {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
      }

      dataTableInstance.current = $(tableRef.current).DataTable({
        responsive: true,
        pageLength: 25,
        order: [[0, 'asc']],
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
  }, [data.revenues]);

  useEffect(() => {
    // Selalu buat chart bahkan jika data kosong
    createRevenueChart();
  }, [data.revenues]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await adminReportService.getRevenueReport(Object.fromEntries(searchParams));
      setData(response.data);
    } catch (error) {
      console.error('Error fetching revenue report:', error);
      toast.error('Gagal memuat data laporan pendapatan');
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

  const createRevenueChart = () => {
    const ctx = revenueChartRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (revenueChartInstance.current) {
      revenueChartInstance.current.destroy();
    }

    // Periksa apakah data tersedia
    const hasSampleData = data.revenues && data.revenues.length > 0;

    // Data dummy atau data aktual
    const today = new Date();
    let samplePeriods = [];

    // Buat data dummy berdasarkan groupBy
    if (data.groupBy === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        samplePeriods.push(date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
      }
    } else if (data.groupBy === 'weekly') {
      for (let i = 3; i >= 0; i--) {
        samplePeriods.push(`Minggu ${i + 1}`);
      }
    } else { // monthly
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        samplePeriods.push(date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }));
      }
    }

    const periods = hasSampleData
      ? data.revenues.map(rev => rev.formatted_period)
      : samplePeriods;

    const amounts = hasSampleData
      ? data.revenues.map(rev => rev.total_amount)
      : [0, 0, 0, 0, 0, 0];

    const transactions = hasSampleData
      ? data.revenues.map(rev => rev.transaction_count)
      : [0, 0, 0, 0, 0, 0];

    revenueChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: periods,
        datasets: [
          {
            label: 'Pendapatan (Rp)',
            data: amounts,
            backgroundColor: 'rgba(37, 99, 235, 0.6)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 1,
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(37, 99, 235, 0.8)'
          },
          {
            label: 'Jumlah Transaksi',
            data: transactions,
            backgroundColor: 'rgba(16, 185, 129, 0.0)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2,
            type: 'line',
            yAxisID: 'y1',
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
              text: 'Pendapatan (Rp)',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(203, 213, 225, 0.3)',
            },
            ticks: {
              callback: function (value) {
                if (value >= 1000000) return 'Rp ' + (value / 1000000).toFixed(1) + ' jt';
                if (value >= 1000) return 'Rp ' + (value / 1000).toFixed(0) + ' rb';
                return 'Rp ' + value;
              }
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            title: {
              display: true,
              text: 'Jumlah Transaksi',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              drawOnChartArea: false
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
                let label = context.dataset.label || '';
                let value = context.raw || 0;

                if (label === 'Pendapatan (Rp)') {
                  return label + ': Rp ' + value.toLocaleString('id-ID');
                } else {
                  return label + ': ' + value;
                }
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
      ctx.fillText('Tidak ada data pendapatan untuk ditampilkan', width / 2, height / 2);
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
    adminReportService.getRevenueReport(Object.fromEntries(params))
      .then(response => {
        setData(response.data);
        toast.success("Data berhasil diperbarui");
      })
      .catch(error => {
        console.error('Error fetching revenue report:', error);
        toast.error('Gagal memuat data laporan pendapatan');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleExport = () => {
    const params = new URLSearchParams(searchParams);
    params.append('export', 'csv');
    window.location.href = `/admin/reports/revenue/export?${params.toString()}`;
    toast.success('Mengunduh laporan pendapatan...');
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
    <div className="animate-pulse h-80 bg-gray-200 rounded"></div>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Laporan Pendapatan</h1>
            <p className="text-sm text-gray-500">Analisis pendapatan dan transaksi keuangan</p>
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
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <span className="text-xs uppercase text-gray-500 font-medium">Pengelompokan</span>
                <p className="font-medium text-gray-700">
                  {data.groupBy === 'daily' && 'Harian'}
                  {data.groupBy === 'weekly' && 'Mingguan'}
                  {data.groupBy === 'monthly' && 'Bulanan'}
                </p>
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
        {/* Total Pendapatan */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100">
          <div className="p-5">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Pendapatan</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">
                    Rp {data.totalRevenue.toLocaleString('id-ID')}
                  </p>
                  {data.revenueGrowth !== undefined && (
                    <div className={`flex items-center text-xs mt-1 ${data.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {data.revenueGrowth >= 0 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                        </svg>
                      )}
                      <span>{data.revenueGrowth >= 0 ? '+' : ''}{data.revenueGrowth.toFixed(2)}% dari periode sebelumnya</span>
                    </div>
                  )}
                </div>
              )}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-2">
            <span className="text-xs text-blue-700 font-medium">Total pendapatan dalam periode</span>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100">
          <div className="p-5">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Transaksi</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">{data.totalTransactions.toLocaleString()}</p>
                  {diffInDays > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{(data.totalTransactions / diffInDays).toFixed(1)} per hari</p>
                  )}
                </div>
              )}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-2">
            <span className="text-xs text-blue-700 font-medium">Jumlah transaksi dalam periode</span>
          </div>
        </div>

        {/* Rata-rata per Transaksi */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100">
          <div className="p-5">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Rata-rata per Transaksi</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">
                    Rp {data.averageTransaction.toLocaleString('id-ID')}
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-2">
            <span className="text-xs text-blue-700 font-medium">Nilai rata-rata per transaksi</span>
          </div>
        </div>

        {/* Pendapatan per Hari */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100">
          <div className="p-5">
            <div className="flex items-center justify-between">
              {loading ? (
                <CardSkeleton />
              ) : (
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Pendapatan per Hari</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">
                    Rp {(data.totalRevenue / Math.max(1, diffInDays)).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-2">
            <span className="text-xs text-blue-700 font-medium">Rata-rata pendapatan harian</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Grafik Pendapatan */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Grafik Pendapatan
            </h2>
            {!loading && (
              <span className="text-xs bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">
                {data.groupBy === 'daily' ? 'Harian' : data.groupBy === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </span>
            )}
          </div>
          <div className="p-6">
            <div className="w-full h-80">
              {loading ? (
                <ChartSkeleton />
              ) : (
                <canvas ref={revenueChartRef}></canvas>
              )}
            </div>
          </div>
        </div>

        {/* Form Filter */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter Laporan
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleFilter} className="space-y-4">
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
                <label htmlFor="group_by" className="block text-sm font-medium text-gray-700 mb-1">Kelompokkan Berdasarkan</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <select
                    id="group_by"
                    name="group_by"
                    value={filters.group_by}
                    onChange={handleFilterChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                  >
                    <option value="daily">Harian</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 mt-4"
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
            </form>
          </div>
        </div>
      </div>

      {/* Tabel Detail Pendapatan */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Detail Pendapatan
          </h2>
          {!loading && <span className="text-xs bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">{data.revenues.length} entri</span>}
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {data.groupBy === 'daily' && 'Tanggal'}
                    {data.groupBy === 'weekly' && 'Minggu'}
                    {data.groupBy === 'monthly' && 'Bulan'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Transaksi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pendapatan</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rata-rata per Transaksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.revenues.map((revenue, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {revenue.formatted_period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {revenue.transaction_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rp {revenue.total_amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      Rp {revenue.average_amount.toLocaleString('id-ID')}
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

export default RevenueReport;