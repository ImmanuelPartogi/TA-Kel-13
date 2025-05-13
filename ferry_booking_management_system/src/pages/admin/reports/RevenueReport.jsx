import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../../services/api';
import Chart from 'chart.js/auto';
import $ from 'jquery';
import 'datatables.net';

const RevenueReport = () => {
  const [searchParams] = useSearchParams();
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
  const [filters, setFilters] = useState({
    start_date: searchParams.get('start_date') || new Date().toISOString().slice(0, 10),
    end_date: searchParams.get('end_date') || new Date().toISOString().slice(0, 10),
    route_id: searchParams.get('route_id') || '',
    group_by: searchParams.get('group_by') || 'monthly'
  });

  const revenueChartRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    fetchData();
    fetchRoutes();
  }, [searchParams]);

  useEffect(() => {
    if (data.revenues.length > 0 && tableRef.current) {
      $(tableRef.current).DataTable({
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
        }
      });
    }
  }, [data.revenues]);

  useEffect(() => {
    if (data.revenues.length > 0) {
      createRevenueChart();
    }
  }, [data.revenues]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin-panel/reports/revenue', {
        params: Object.fromEntries(searchParams)
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching revenue report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/admin-panel/routes', {
        params: { status: 'ACTIVE' }
      });
      setRoutes(response.data.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const createRevenueChart = () => {
    const ctx = revenueChartRef.current?.getContext('2d');
    if (!ctx) return;

    const periods = data.revenues.map(rev => rev.formatted_period);
    const amounts = data.revenues.map(rev => rev.total_amount);
    const transactions = data.revenues.map(rev => rev.transaction_count);

    new Chart(ctx, {
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
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilter = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(filters);
    window.location.href = `/admin/reports/revenue?${params.toString()}`;
  };

  const handleExport = () => {
    const params = new URLSearchParams(searchParams);
    params.append('export', 'csv');
    window.location.href = `/admin/reports/revenue/export?${params.toString()}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const diffInDays = Math.floor((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Pendapatan</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md"
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

      {/* Informasi Rentang Tanggal */}
      <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Periode: <span className="text-gray-700">
                {new Date(data.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(data.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span></span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <span className="font-medium">Pengelompokan:
                <span className="text-gray-700">
                  {data.groupBy === 'daily' && ' Harian'}
                  {data.groupBy === 'weekly' && ' Mingguan'}
                  {data.groupBy === 'monthly' && ' Bulanan'}
                </span>
              </span>
            </div>
            {filters.route_id && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="font-medium">Rute: <span className="text-gray-700">
                  {routes.find(r => r.id == filters.route_id)?.origin} - {routes.find(r => r.id == filters.route_id)?.destination}
                </span></span>
              </div>
            )}
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Data Terakhir: <span className="text-gray-700">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Pendapatan */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-green-500">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase">Total Pendapatan</p>
                <p className="mt-2 text-3xl font-bold text-gray-800">
                  Rp {new Intl.NumberFormat('id-ID').format(data.totalRevenue)}
                </p>
                {data.revenueGrowth !== undefined && (
                  <p className={`text-xs ${data.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {data.revenueGrowth >= 0 ? '+' : ''}{data.revenueGrowth.toFixed(2)}% dari periode sebelumnya
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
                <p className="mt-2 text-3xl font-bold text-gray-800">{data.totalTransactions}</p>
                {diffInDays > 0 && (
                  <p className="text-xs text-gray-500">{(data.totalTransactions / diffInDays).toFixed(1)} per hari</p>
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
                <p className="mt-2 text-3xl font-bold text-gray-800">
                  Rp {new Intl.NumberFormat('id-ID').format(data.averageTransaction)}
                </p>
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
                  Rp {new Intl.NumberFormat('id-ID').format(data.totalRevenue / diffInDays)}
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
            <form onSubmit={handleFilter}>
              <div className="mb-4">
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={filters.start_date}
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
                  value={filters.end_date}
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
                  value={filters.route_id}
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
                  value={filters.group_by}
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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h2 className="text-lg font-semibold text-green-600">Detail Pendapatan</h2>
        </div>
        <div className="overflow-x-auto">
          <table ref={tableRef} className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>
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
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {revenue.formatted_period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {revenue.transaction_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rp {new Intl.NumberFormat('id-ID').format(revenue.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rp {new Intl.NumberFormat('id-ID').format(revenue.average_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;