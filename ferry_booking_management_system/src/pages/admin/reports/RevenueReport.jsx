import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { operatorReportService as reportService } from '../../../services/api';
import { Chart } from 'chart.js/auto';
import Loading from '../../../components/ui/LoadingSpinner';
import PrintButton from '../../../components/ui/PrintButton';
import ExportButton from '../../../components/ui/ExportButton';
import DataTable from '../../../components/ui/DataTable';

const RevenueReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [routes, setRoutes] = useState([]);

  const [filter, setFilter] = useState({
    start_date: queryParams.get('start_date') || new Date().toISOString().slice(0, 8) + '01',
    end_date: queryParams.get('end_date') || new Date().toISOString().slice(0, 10),
    route_id: queryParams.get('route_id') || '',
    group_by: queryParams.get('group_by') || 'monthly'
  });

  // Chart references
  const revenueChartRef = useRef(null);
  const revenueChartInstance = useRef(null);

  useEffect(() => {
    fetchReportData();
  }, [location.search]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: queryParams.get('start_date') || filter.start_date,
        end_date: queryParams.get('end_date') || filter.end_date,
        route_id: queryParams.get('route_id') || filter.route_id,
        group_by: queryParams.get('group_by') || filter.group_by
      };

      const response = await reportService.getRevenueReport(params);
      setReportData(response.data);
      setRoutes(response.data.routes || []);

      // Update filter state with current query params
      setFilter({
        start_date: params.start_date,
        end_date: params.end_date,
        route_id: params.route_id,
        group_by: params.group_by
      });

    } catch (error) {
      console.error('Error fetching revenue report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportData && reportData.revenues) {
      // Initialize charts after data is loaded
      initializeChart();
    }

    // Cleanup chart on component unmount
    return () => {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
    };
  }, [reportData]);

  const initializeChart = () => {
    if (reportData.revenues && revenueChartRef.current) {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }

      const periods = reportData.revenues.map(item => item.formatted_period);
      const amounts = reportData.revenues.map(item => item.total_amount);
      const transactions = reportData.revenues.map(item => item.transaction_count);

      revenueChartInstance.current = new Chart(revenueChartRef.current, {
        type: 'bar',
        data: {
          labels: periods,
          datasets: [
            {
              label: 'Pendapatan (Rp)',
              data: amounts,
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 1
            },
            {
              label: 'Jumlah Transaksi',
              data: transactions,
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
              type: 'line',
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Pendapatan (Rp)'
              },
              ticks: {
                callback: function (value) {
                  return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
                }
              }
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              title: {
                display: true,
                text: 'Jumlah Transaksi'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  let value = context.raw || 0;

                  if (label === 'Pendapatan (Rp)') {
                    return label + ': Rp ' + new Intl.NumberFormat('id-ID').format(value);
                  } else {
                    return label + ': ' + value;
                  }
                }
              }
            }
          }
        }
      });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitFilter = (e) => {
    e.preventDefault();
    const queryString = new URLSearchParams(filter).toString();
    navigate(`/admin/reports/revenue?${queryString}`);
  };

  const handleExportCSV = () => {
    reportService.exportRevenueReport(filter)
      .then(response => {
        // Create a download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `revenue_report_${filter.start_date}_${filter.end_date}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch(error => {
        console.error('Error exporting report:', error);
      });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  if (loading && !reportData) {
    return <Loading />;
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Pendapatan</h1>
        <div className="flex space-x-2">
          <ExportButton onClick={handleExportCSV} />
          <PrintButton />
        </div>
      </div>

      {/* Informasi Rentang Tanggal */}
      {reportData && (
        <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Periode: <span className="text-gray-700">{formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}</span></span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <span className="font-medium">Pengelompokan:
                  <span className="text-gray-700">
                    {filter.group_by === 'daily' && ' Harian'}
                    {filter.group_by === 'weekly' && ' Mingguan'}
                    {filter.group_by === 'monthly' && ' Bulanan'}
                  </span>
                </span>
              </div>
              {filter.route_id && reportData.route && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="font-medium">Rute: <span className="text-gray-700">{reportData.route.origin} - {reportData.route.destination}</span></span>
                </div>
              )}
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Data Terakhir: <span className="text-gray-700">{new Date().toLocaleString('id-ID')}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kartu Ringkasan */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Pendapatan */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-green-500">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase">Total Pendapatan</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">Rp {formatCurrency(reportData.totalRevenue)}</p>
                  {reportData.revenueGrowth !== undefined && (
                    <p className={`text-xs ${reportData.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {reportData.revenueGrowth >= 0 ? '+' : ''}{reportData.revenueGrowth.toFixed(2)}% dari periode sebelumnya
                    </p>
                  )}
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Total Transaksi */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-blue-500">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase">Total Transaksi</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">{reportData.totalTransactions}</p>
                  {reportData.startDate !== reportData.endDate && (
                    <p className="text-xs text-gray-500">
                      {(reportData.totalTransactions / Math.max(1, Math.floor((new Date(reportData.endDate) - new Date(reportData.startDate)) / (1000 * 60 * 60 * 24)) + 1)).toFixed(1)} per hari
                    </p>
                  )}
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Rata-rata per Transaksi */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-purple-500">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-purple-600 uppercase">Rata-rata per Transaksi</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">Rp {formatCurrency(reportData.averageTransaction)}</p>
                </div>
                <div className="rounded-full bg-purple-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Pendapatan per Hari */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-indigo-500">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase">Pendapatan per Hari</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">
                    Rp {formatCurrency(reportData.totalRevenue / Math.max(1, Math.floor((new Date(reportData.endDate) - new Date(reportData.startDate)) / (1000 * 60 * 60 * 24)) + 1))}
                  </p>
                </div>
                <div className="rounded-full bg-indigo-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Grafik Pendapatan */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-green-600">Grafik Pendapatan</h2>
          </div>
          <div className="p-6">
            <div className="w-full h-80">
              <canvas ref={revenueChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Form Filter */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-green-600">Filter Laporan</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmitFilter}>
              <div className="mb-4">
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={filter.start_date}
                  onChange={handleFilterChange}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={filter.end_date}
                  onChange={handleFilterChange}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                <select
                  id="route_id"
                  name="route_id"
                  value={filter.route_id}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Semua Rute</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.origin} - {route.destination}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="group_by" className="block text-sm font-medium text-gray-700 mb-1">Kelompokkan Berdasarkan</label>
                <select
                  id="group_by"
                  name="group_by"
                  value={filter.group_by}
                  onChange={handleFilterChange}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition-colors w-full justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Tabel Detail Pendapatan */}
      {reportData && reportData.revenues && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-green-600">Detail Pendapatan</h2>
          </div>
          <div className="overflow-x-auto">
            <DataTable id="dataTable">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {filter.group_by === 'daily' ? 'Tanggal' :
                      filter.group_by === 'weekly' ? 'Minggu' : 'Bulan'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Transaksi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pendapatan</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rata-rata per Transaksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.revenues.map((revenue, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{revenue.formatted_period}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{revenue.transaction_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {formatCurrency(revenue.total_amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {formatCurrency(revenue.average_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueReport;