import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import adminReportService from '../../../services/adminReport.service';
import Chart from 'chart.js/auto';
import $ from 'jquery';
import 'datatables.net';

const ScheduleReport = () => {
  const [searchParams] = useSearchParams();
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

  const passengerChartRef = useRef(null);
  const passengerChartInstance = useRef(null);
  const vehicleChartRef = useRef(null);
  const vehicleChartInstance = useRef(null);
  const occupancyChartRef = useRef(null);
  const occupancyChartInstance = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    fetchData();
    fetchRoutes();
  }, [searchParams]);

  useEffect(() => {
    if (data.scheduleStats.length > 0 && tableRef.current) {
      // Hancurkan instance DataTable yang ada
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      
      $(tableRef.current).DataTable({
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
        }
      });
    }
    
    // Cleanup saat unmount
    return () => {
      if (tableRef.current && $.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
    };
  }, [data.scheduleStats]);

  useEffect(() => {
    if (data.scheduleStats.length > 0) {
      createPassengerChart();
      createVehicleChart();
      createOccupancyChart();
    }
    
    // Cleanup saat unmount
    return () => {
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
  }, [data.scheduleStats]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await adminReportService.getScheduleReport(Object.fromEntries(searchParams));
      setData(response.data);
    } catch (error) {
      console.error('Error fetching schedule report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      // Use getDashboardData which returns routes
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

    // Hancurkan chart instance yang ada
    if (passengerChartInstance.current) {
      passengerChartInstance.current.destroy();
    }

    const scheduleLabels = data.scheduleStats.map(stat => `${stat.route} (${stat.time})`);
    const passengerCounts = data.scheduleStats.map(stat => stat.passenger_count);
    const capacityPassengers = data.scheduleStats.map(stat => stat.max_passenger_capacity);

    passengerChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: scheduleLabels,
        datasets: [
          {
            label: 'Jumlah Penumpang',
            data: passengerCounts,
            backgroundColor: 'rgba(99, 102, 241, 0.7)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1
          },
          {
            label: 'Kapasitas Maksimum',
            data: capacityPassengers,
            backgroundColor: 'rgba(209, 213, 219, 0.3)',
            borderColor: 'rgba(209, 213, 219, 1)',
            borderWidth: 1,
            type: 'line'
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
              text: 'Jumlah Penumpang'
            }
          },
          x: {
            ticks: {
              display: false
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: function (context) {
                return scheduleLabels[context[0].dataIndex];
              }
            }
          },
          legend: {
            position: 'top',
          }
        }
      }
    });
  };

  const createVehicleChart = () => {
    const ctx = vehicleChartRef.current?.getContext('2d');
    if (!ctx) return;

    // Hancurkan chart instance yang ada
    if (vehicleChartInstance.current) {
      vehicleChartInstance.current.destroy();
    }

    const vehicleLabels = ['Motor', 'Mobil', 'Bus', 'Truk'];
    const vehicleCounts = [
      data.scheduleStats.reduce((sum, stat) => sum + stat.motorcycle_count, 0),
      data.scheduleStats.reduce((sum, stat) => sum + stat.car_count, 0),
      data.scheduleStats.reduce((sum, stat) => sum + stat.bus_count, 0),
      data.scheduleStats.reduce((sum, stat) => sum + stat.truck_count, 0)
    ];

    const percentages = [
      data.vehicleDistribution?.motorcycle?.percentage || 0,
      data.vehicleDistribution?.car?.percentage || 0,
      data.vehicleDistribution?.bus?.percentage || 0,
      data.vehicleDistribution?.truck?.percentage || 0
    ];

    vehicleChartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: vehicleLabels,
        datasets: [{
          data: vehicleCounts,
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const percentage = percentages[context.dataIndex];
                return `${label}: ${value} (${percentage.toFixed(1)}%)`;
              }
            }
          }
        }
      }
    });
  };

  const createOccupancyChart = () => {
    const ctx = occupancyChartRef.current?.getContext('2d');
    if (!ctx) return;

    // Hancurkan chart instance yang ada
    if (occupancyChartInstance.current) {
      occupancyChartInstance.current.destroy();
    }

    const topSchedules = [...data.scheduleStats]
      .sort((a, b) => b.passenger_occupancy_rate - a.passenger_occupancy_rate)
      .slice(0, 5);

    if (topSchedules.length === 0 || !topSchedules[0].daily_occupancy) return;

    const colors = [
      'rgba(99, 102, 241, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(76, 29, 149, 1)'
    ];

    const backgroundColors = [
      'rgba(99, 102, 241, 0.2)',
      'rgba(16, 185, 129, 0.2)',
      'rgba(245, 158, 11, 0.2)',
      'rgba(239, 68, 68, 0.2)',
      'rgba(76, 29, 149, 0.2)'
    ];

    const datasets = topSchedules.map((schedule, index) => {
      const rates = schedule.daily_occupancy.map(day => day.occupancy_rate);

      return {
        label: `${schedule.route} (${schedule.time})`,
        data: rates,
        backgroundColor: backgroundColors[index],
        borderColor: colors[index],
        borderWidth: 2,
        fill: false,
        tension: 0.3
      };
    });

    const allDates = [...new Set(topSchedules.flatMap(schedule =>
      schedule.daily_occupancy.map(day => day.date)
    ))].sort();

    occupancyChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: allDates,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Tingkat Okupansi (%)'
            },
            max: 100
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || '';
                const value = context.raw || 0;
                return `${label}: ${value.toFixed(1)}%`;
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
    window.location.href = `/admin/reports/schedule?${params.toString()}`;
  };

  const handleExport = () => {
    const params = new URLSearchParams(searchParams);
    params.append('export', 'csv');
    window.location.href = `/admin/reports/schedule/export?${params.toString()}`;
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

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Jadwal</h1>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Periode: <span className="text-gray-700">
                {new Date(data.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(data.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span></span>
            </div>
            {filters.route_id && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="font-medium">Rute: <span className="text-gray-700">
                  {routes.find(r => r.id == filters.route_id)?.origin} - {routes.find(r => r.id == filters.route_id)?.destination}
                </span></span>
              </div>
            )}
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        {/* Total Penumpang */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-indigo-500">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase">Total Penumpang</p>
                <p className="mt-2 text-3xl font-bold text-gray-800">
                  {new Intl.NumberFormat('id-ID').format(data.totalPassengers)}
                </p>
              </div>
              <div className="rounded-full bg-indigo-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Total Kendaraan */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-yellow-500">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-yellow-600 uppercase">Total Kendaraan</p>
                <p className="mt-2 text-3xl font-bold text-gray-800">
                  {new Intl.NumberFormat('id-ID').format(data.totalVehicles)}
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Okupansi Rata-rata */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-blue-500">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase">Okupansi Rata-rata</p>
                <p className="mt-2 text-3xl font-bold text-gray-800">{data.overallOccupancyRate.toFixed(2)}%</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Jumlah Jadwal */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-green-500">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase">Jumlah Jadwal</p>
                <p className="mt-2 text-3xl font-bold text-gray-800">{data.scheduleStats.length}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Filter */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h2 className="text-lg font-semibold text-indigo-600">Filter Laporan</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleFilter}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleFilterChange}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                <select
                  id="route_id"
                  name="route_id"
                  value={filters.route_id}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Semua Rute</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.origin} - {route.destination}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Chart Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Distribusi Penumpang */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-indigo-600">Distribusi Penumpang per Jadwal</h2>
          </div>
          <div className="p-6">
            <div className="w-full h-64">
              <canvas ref={passengerChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Distribusi Kendaraan */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-indigo-600">Distribusi Jenis Kendaraan</h2>
          </div>
          <div className="p-6">
            <div className="w-full h-64">
              <canvas ref={vehicleChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>

      {/* Grafik Okupansi Harian */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h2 className="text-lg font-semibold text-indigo-600">Trend Okupansi Jadwal Teratas</h2>
        </div>
        <div className="p-6">
          <div className="w-full h-80">
            <canvas ref={occupancyChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Tabel Statistik Jadwal */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h2 className="text-lg font-semibold text-indigo-600">Detail Statistik Jadwal</h2>
        </div>
        <div className="overflow-x-auto">
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
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.schedule_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.route}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.ferry}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.days}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.dates_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.passenger_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.motorcycle_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.car_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.bus_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.truck_count}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${stat.passenger_occupancy_rate > 80 ? 'text-green-600' :
                      (stat.passenger_occupancy_rate > 50 ? 'text-blue-600' : 'text-yellow-600')
                    }`}>
                    {stat.passenger_occupancy_rate.toFixed(2)}%
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

export default ScheduleReport;