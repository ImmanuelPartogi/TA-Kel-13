import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { reportService } from '../../services/api';
import { Chart } from 'chart.js/auto';
import Loading from '../../components/Loading';
import PrintButton from '../../components/PrintButton';
import ExportButton from '../../components/ExportButton';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const BookingReport = () => {
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
    status: queryParams.get('status') || ''
  });
  
  // Chart references
  const bookingTrendChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const bookingTrendChartInstance = useRef(null);
  const statusChartInstance = useRef(null);
  
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
        status: queryParams.get('status') || filter.status
      };
      
      const response = await reportService.getBookingReport(params);
      setReportData(response.data);
      setRoutes(response.data.routes || []);
      
      // Update filter state with current query params
      setFilter({
        start_date: params.start_date,
        end_date: params.end_date,
        route_id: params.route_id,
        status: params.status
      });
      
    } catch (error) {
      console.error('Error fetching booking report:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (reportData) {
      // Initialize charts after data is loaded
      initializeCharts();
    }
    
    // Cleanup charts on component unmount
    return () => {
      if (bookingTrendChartInstance.current) {
        bookingTrendChartInstance.current.destroy();
      }
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
      }
    };
  }, [reportData]);
  
  const initializeCharts = () => {
    if (reportData.bookingTrend && bookingTrendChartRef.current) {
      if (bookingTrendChartInstance.current) {
        bookingTrendChartInstance.current.destroy();
      }
      
      const trendDates = reportData.bookingTrend.map(item => item.date);
      const trendCounts = reportData.bookingTrend.map(item => item.count);
      const trendAmounts = reportData.bookingTrend.map(item => item.amount);
      
      bookingTrendChartInstance.current = new Chart(bookingTrendChartRef.current, {
        type: 'bar',
        data: {
          labels: trendDates,
          datasets: [
            {
              label: 'Jumlah Booking',
              data: trendCounts,
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              label: 'Total Nominal (Rp)',
              data: trendAmounts,
              type: 'line',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 2,
              yAxisID: 'y1',
              fill: true
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
                text: 'Jumlah Booking'
              }
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              title: {
                display: true,
                text: 'Total Nominal (Rp)'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      });
    }
    
    if (reportData.statusCount && statusChartRef.current) {
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
      }
      
      const statusLabels = reportData.statusCount.map(item => item.status);
      const statusData = reportData.statusCount.map(item => item.count);
      const statusAmounts = reportData.statusCount.map(item => item.amount);
      
      // Status colors
      const statusColors = {
        'PENDING': 'rgba(245, 158, 11, 0.7)',
        'CONFIRMED': 'rgba(16, 185, 129, 0.7)',
        'CANCELLED': 'rgba(239, 68, 68, 0.7)',
        'COMPLETED': 'rgba(59, 130, 246, 0.7)',
        'REFUNDED': 'rgba(107, 114, 128, 0.7)',
        'RESCHEDULED': 'rgba(139, 92, 246, 0.7)'
      };
      
      const statusBackgroundColors = statusLabels.map(status => 
        statusColors[status] || 'rgba(156, 163, 175, 0.7)'
      );
      
      statusChartInstance.current = new Chart(statusChartRef.current, {
        type: 'pie',
        data: {
          labels: statusLabels,
          datasets: [{
            data: statusData,
            backgroundColor: statusBackgroundColors,
            borderColor: statusBackgroundColors.map(color => color.replace('0.7', '1')),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const amount = statusAmounts[context.dataIndex] || 0;
                  const percentage = ((value / statusData.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%) - Rp ${formatCurrency(amount)}`;
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
    navigate(`/admin/reports/booking?${queryString}`);
  };
  
  const handleExportCSV = () => {
    // Implement export functionality
    reportService.exportBookingReport(filter)
      .then(response => {
        // Create a download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `booking_report_${filter.start_date}_${filter.end_date}.csv`);
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
        <h1 className="text-2xl font-bold text-gray-800">Laporan Booking</h1>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Periode: <span className="text-gray-700">{formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}</span></span>
              </div>
              {filter.route_id && reportData.bookings && reportData.bookings.length > 0 && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="font-medium">Rute: <span className="text-gray-700">
                    {reportData.bookings[0]?.schedule?.route?.origin} - {reportData.bookings[0]?.schedule?.route?.destination}
                  </span></span>
                </div>
              )}
              {filter.status && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Status: <span className="text-gray-700">{filter.status}</span></span>
                </div>
              )}
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          {/* Total Booking */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-blue-500">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase">Total Booking</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">{reportData.totalBookings}</p>
                  {reportData.startDate !== reportData.endDate && (
                    <p className="text-xs text-gray-500">
                      {(reportData.totalBookings / Math.max(1, Math.floor((new Date(reportData.endDate) - new Date(reportData.startDate)) / (1000 * 60 * 60 * 24)) + 1)).toFixed(1)} per hari
                    </p>
                  )}
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Total Pendapatan */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-green-500">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase">Total Pendapatan</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">Rp {formatCurrency(reportData.totalRevenue)}</p>
                  <p className="text-xs text-gray-500">Aktual: Rp {formatCurrency(reportData.actualRevenue)}</p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Total Penumpang */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-indigo-500">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase">Total Penumpang</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800">{reportData.totalPassengers}</p>
                  <p className="text-xs text-gray-500">{(reportData.totalPassengers / Math.max(1, reportData.totalBookings)).toFixed(1)} per booking</p>
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
                  <p className="mt-2 text-3xl font-bold text-gray-800">{reportData.totalVehicles}</p>
                  <p className="text-xs text-gray-500">{(reportData.totalVehicles / Math.max(1, reportData.totalBookings)).toFixed(1)} per booking</p>
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
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Grafik Trend Booking */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-blue-600">Tren Booking Harian</h2>
          </div>
          <div className="p-6">
            <canvas ref={bookingTrendChartRef} height="300"></canvas>
          </div>
        </div>

        {/* Breakdown Status */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-blue-600">Breakdown Status</h2>
          </div>
          <div className="p-6">
            <canvas ref={statusChartRef} height="300"></canvas>
          </div>
        </div>
      </div>

      {/* Filter Form */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h2 className="text-lg font-semibold text-blue-600">Filter Laporan</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmitFilter}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input 
                  type="date" 
                  id="start_date" 
                  name="start_date" 
                  value={filter.start_date}
                  onChange={handleFilterChange}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                <input 
                  type="date" 
                  id="end_date" 
                  name="end_date" 
                  value={filter.end_date}
                  onChange={handleFilterChange}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                <select
                  id="route_id" 
                  name="route_id"
                  value={filter.route_id}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Rute</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.origin} - {route.destination}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status" 
                  name="status"
                  value={filter.status}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REFUNDED">Refunded</option>
                  <option value="RESCHEDULED">Rescheduled</option>
                </select>
              </div>
            </div>
            <div>
              <button 
                type="submit" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors"
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

      {/* Tabel Booking */}
      {reportData && reportData.bookings && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-blue-600">Daftar Booking</h2>
          </div>
          <div className="overflow-x-auto">
            <DataTable id="dataTable">
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
                {reportData.bookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.booking_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.schedule.route.origin} - {booking.schedule.route.destination}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.schedule.departure_time} - {booking.schedule.arrival_time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(booking.booking_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.passenger_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.vehicle_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {formatCurrency(booking.total_amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a 
                        href={`/admin/bookings/${booking.id}`} 
                        className="inline-flex items-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded shadow-sm transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Detail
                      </a>
                    </td>
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

export default BookingReport;