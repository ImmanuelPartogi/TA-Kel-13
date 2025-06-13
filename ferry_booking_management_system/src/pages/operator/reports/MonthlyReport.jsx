// src/pages/operator/reports/MonthlyReport.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { operatorReportsService } from '../../../services/operatorReports.service';
import { useAuth } from '../../../contexts/AuthContext';
import Swal from 'sweetalert2';

const MonthlyReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [month, setMonth] = useState(searchParams.get('month') || new Date().toISOString().slice(0, 7));
  const [routeData, setRouteData] = useState([]);
  const [filteredRouteData, setFilteredRouteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [activeTab, setActiveTab] = useState('summary');
  const [filter, setFilter] = useState({
    search: searchParams.get('search') || '',
    routeId: searchParams.get('routeId') || 'all'
  });
  const [summary, setSummary] = useState({
    totalPassengers: 0,
    totalVehicles: 0,
    activeRoutes: 0,
    totalRevenue: 0,
    averageDailyPassengers: 0,
    topRoutesByRevenue: [],
    busyDays: []
  });

  // Check if operator has routes
  const hasRoutes = useMemo(() => {
    return user?.assigned_routes && Object.keys(user.assigned_routes).length > 0;
  }, [user?.assigned_routes]);

  // Get all available routes
  const availableRoutes = useMemo(() => {
    if (!routeData.length) return [];
    return routeData.map(route => ({
      id: route.route_id,
      name: `${route.route?.origin || 'Unknown'} - ${route.route?.destination || 'Unknown'}`
    }));
  }, [routeData]);

  // Format month for display
  const formatMonth = useCallback((monthString) => {
    const date = new Date(monthString + '-01');
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  }, []);

  // Format time for display
  const formatTime = useCallback((time) => {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(time);
  }, []);

  // Calculate summary data
  const calculateSummary = useCallback((data) => {
    if (!data.length) return {
      totalPassengers: 0,
      totalVehicles: 0,
      activeRoutes: 0,
      totalRevenue: 0,
      averageDailyPassengers: 0,
      topRoutesByRevenue: [],
      busyDays: []
    };

    const summary = {
      totalPassengers: 0,
      totalVehicles: 0,
      activeRoutes: data.length,
      totalRevenue: 0,
      averageDailyPassengers: 0,
      topRoutesByRevenue: [],
      busyDays: {}
    };

    // Number of days in the month
    const year = parseInt(month.split('-')[0]);
    const monthNum = parseInt(month.split('-')[1]) - 1; // 0-based month
    const daysInMonth = new Date(year, monthNum + 1, 0).getDate();

    // Calculate total metrics
    data.forEach(route => {
      summary.totalPassengers += route.total_passengers || 0;
      summary.totalVehicles += route.total_vehicles || 0;
      summary.totalRevenue += route.total_amount || 0;

      // Calculate busy days
      if (route.dates) {
        Object.entries(route.dates).forEach(([date, dateData]) => {
          if (!summary.busyDays[date]) {
            summary.busyDays[date] = {
              passengers: 0,
              vehicles: 0,
              amount: 0
            };
          }
          
          summary.busyDays[date].passengers += dateData.passengers || 0;
          summary.busyDays[date].vehicles += dateData.vehicles || 0;
          summary.busyDays[date].amount += dateData.amount || 0;
        });
      }
    });

    // Calculate average daily passengers
    summary.averageDailyPassengers = Math.round(summary.totalPassengers / daysInMonth);

    // Sort routes by revenue
    summary.topRoutesByRevenue = [...data]
      .sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0))
      .slice(0, 3)
      .map(route => ({
        name: `${route.route?.origin || 'Unknown'} - ${route.route?.destination || 'Unknown'}`,
        revenue: route.total_amount || 0,
        passengers: route.total_passengers || 0
      }));

    // Convert busy days to array and sort by passengers
    summary.busyDays = Object.entries(summary.busyDays)
      .map(([date, data]) => ({
        date,
        ...data
      }))
      .sort((a, b) => b.passengers - a.passengers)
      .slice(0, 5); // Top 5 busy days

    return summary;
  }, [month]);

  // Filter data based on search and routeId
  useEffect(() => {
    if (!routeData.length) {
      setFilteredRouteData([]);
      return;
    }

    let filtered = [...routeData];

    // Filter by route ID
    if (filter.routeId !== 'all') {
      filtered = filtered.filter(route => route.route_id === filter.routeId);
    }

    // Filter by search term
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(route => {
        const routeName = `${route.route?.origin || ''} - ${route.route?.destination || ''}`.toLowerCase();
        return routeName.includes(searchLower);
      });
    }

    setFilteredRouteData(filtered);
  }, [routeData, filter.routeId, filter.search]);

  // Apply search and routeId filters to URL
  useEffect(() => {
    const queryParams = new URLSearchParams();
    queryParams.set('month', month);
    if (filter.search) queryParams.set('search', filter.search);
    if (filter.routeId !== 'all') queryParams.set('routeId', filter.routeId);
    
    // Update URL without full page reload
    navigate(`/operator/reports/monthly?${queryParams.toString()}`, { replace: true });
  }, [month, filter, navigate]);

  useEffect(() => {
    if (hasRoutes) {
      fetchMonthlyReport();
    } else {
      setLoading(false);
    }
  }, [month]);

  const fetchMonthlyReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await operatorReportsService.getMonthly({ month });
      console.log('Monthly report response:', response);

      // Handle response data
      let data = [];
      if (response.data?.data) {
        if (Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (response.data.data.routeData) {
          // Convert object to array
          data = Object.entries(response.data.data.routeData).map(([routeId, routeData]) => ({
            route_id: routeId,
            ...routeData
          }));
        }
      }

      setRouteData(data);
      setFilteredRouteData(data); // Initial filtered data is all data
      
      // Calculate summary
      const summaryData = calculateSummary(data);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      setRouteData([]);
      setFilteredRouteData([]);
      setSummary({
        totalPassengers: 0,
        totalVehicles: 0,
        activeRoutes: 0,
        totalRevenue: 0,
        averageDailyPassengers: 0,
        topRoutesByRevenue: [],
        busyDays: []
      });
      setError('Gagal memuat laporan bulanan');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat laporan bulanan',
      });
    }
    setLoading(false);
  };

  // Handle refreshing the report data
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchMonthlyReport();
      setLastRefreshed(new Date());
      Swal.fire({
        icon: 'success',
        title: 'Data Diperbarui',
        text: 'Laporan telah diperbarui dengan data terbaru',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch {
      setError('Gagal memperbarui data laporan');
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memperbarui',
        text: 'Terjadi kesalahan saat memperbarui data',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    setExportLoading(true);
    try {
      const response = await operatorReportsService.exportMonthly({ 
        month, 
        export: format,
        routeId: filter.routeId !== 'all' ? filter.routeId : undefined
      });
      
      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/pdf' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-bulanan-${month}${filter.routeId !== 'all' ? `-rute-${filter.routeId}` : ''}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      Swal.fire({
        icon: 'success',
        title: 'Ekspor Berhasil',
        text: `Laporan berhasil diekspor dalam format ${format.toUpperCase()}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengunduh laporan',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target.elements.search.value;
    setFilter(prev => ({ ...prev, search: searchValue }));
  };

  const clearSearch = () => {
    setFilter(prev => ({ ...prev, search: '' }));
  };

  const handleRouteChange = (e) => {
    setFilter(prev => ({ ...prev, routeId: e.target.value }));
  };

  // Calculate occupancy rate for visualization
  const calculateOccupancyRate = (passengers, capacity) => {
    if (!capacity) return 0;
    const rate = (passengers / capacity) * 100;
    return Math.min(rate, 100); // Cap at 100%
  };

  // Jika operator tidak memiliki rute
  if (!hasRoutes) {
    return (
      <div className="max-w-full px-6 py-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
          <div className="px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Laporan Bulanan
            </h3>
          </div>
          <div className="p-8">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-5 rounded-lg" role="alert">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <p className="font-bold text-lg">Perhatian</p>
              </div>
              <p className="mt-2">Anda belum ditugaskan ke rute manapun. Silakan hubungi administrator untuk mendapatkan akses ke rute.</p>
              <div className="mt-4">
                <Link to="/operator/reports" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Kembali ke Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full px-6 py-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
        <div className="px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Laporan Bulanan: {formatMonth(month)}
              </h3>
              <p className="text-green-100 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Terakhir diperbarui: {formatTime(lastRefreshed)}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Link
                to="/operator/reports"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-800 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali
              </Link>
              <button
                onClick={refreshData}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {/* Filter dan bulan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bulan Laporan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  max={new Date().toISOString().slice(0, 7)}
                />
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Rute</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                  </svg>
                </div>
                <select
                  value={filter.routeId}
                  onChange={handleRouteChange}
                  className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                >
                  <option value="all">Semua Rute</option>
                  {availableRoutes.map(route => (
                    <option key={route.id} value={route.id}>{route.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari</label>
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  placeholder="Cari rute"
                  className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  defaultValue={filter.search}
                />
                {filter.search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </form>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Memuat data laporan...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-5 rounded-lg" role="alert">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="font-bold text-lg">Error</p>
              </div>
              <p className="mt-2">{error}</p>
              <div className="mt-4">
                <button
                  onClick={refreshData}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Coba Lagi
                </button>
              </div>
            </div>
          ) : routeData.length === 0 ? (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-5 rounded-lg" role="alert">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="font-bold text-lg">Informasi</p>
              </div>
              <p className="mt-2">Tidak ada data yang tersedia untuk bulan ini.</p>
            </div>
          ) : filteredRouteData.length === 0 && (filter.search || filter.routeId !== 'all') ? (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-5 rounded-lg" role="alert">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="font-bold text-lg">Filter Aktif</p>
              </div>
              <p className="mt-2">Tidak ada data yang sesuai dengan filter yang diterapkan.</p>
              <div className="mt-4">
                <button
                  onClick={() => setFilter({ routeId: 'all', search: '' })}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Reset Filter
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'summary'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Ringkasan
                  </button>
                  <button
                    onClick={() => setActiveTab('routes')}
                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'routes'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Detail Rute
                  </button>
                  <button
                    onClick={() => setActiveTab('trends')}
                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'trends'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Tren & Analisis
                  </button>
                </nav>
              </div>

              {/* Export buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-full">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className="text-sm font-medium text-gray-700 self-center mr-2">Ekspor Data:</span>
                    <button
                      onClick={() => handleExport('csv')}
                      disabled={exportLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {exportLoading ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md overflow-hidden">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-600 rounded-md p-3">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-blue-100 truncate">Total Penumpang</dt>
                              <dd className="text-2xl font-bold text-white">{summary.totalPassengers.toLocaleString('id-ID')}</dd>
                              <dd className="text-xs text-blue-100 mt-1">
                                Rata-rata {summary.averageDailyPassengers.toLocaleString('id-ID')} per hari
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md overflow-hidden">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-green-600 rounded-md p-3">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-green-100 truncate">Total Kendaraan</dt>
                              <dd className="text-2xl font-bold text-white">{summary.totalVehicles.toLocaleString('id-ID')}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md overflow-hidden">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-yellow-600 rounded-md p-3">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-yellow-100 truncate">Rute Aktif</dt>
                              <dd className="text-2xl font-bold text-white">{summary.activeRoutes}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md overflow-hidden">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-red-600 rounded-md p-3">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-red-100 truncate">Total Pendapatan</dt>
                              <dd className="text-2xl font-bold text-white">{formatCurrency(summary.totalRevenue)}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Routes */}
                  {summary.topRoutesByRevenue.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-indigo-600">
                        <h3 className="text-lg font-bold text-white">Rute Terbaik Bulan Ini</h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {summary.topRoutesByRevenue.map((route, index) => (
                            <div key={index} className="bg-gradient-to-r from-indigo-50 to-white border border-gray-200 rounded-lg p-4 shadow-sm">
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                                }`}>
                                  {index + 1}
                                </div>
                                <div className="ml-3">
                                  <h4 className="text-sm font-medium text-gray-900">{route.name}</h4>
                                  <div className="flex flex-col mt-1">
                                    <span className="text-xs text-gray-500">{route.passengers.toLocaleString('id-ID')} penumpang</span>
                                    <span className="text-sm font-medium text-green-600">{formatCurrency(route.revenue)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Busy Days */}
                  {summary.busyDays.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-purple-600">
                        <h3 className="text-lg font-bold text-white">Hari Tersibuk Bulan Ini</h3>
                      </div>
                      <div className="p-6">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Tanggal
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Penumpang
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Kendaraan
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Pendapatan
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {summary.busyDays.map((day, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {formatDate(day.date)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {day.passengers.toLocaleString('id-ID')}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {day.vehicles.toLocaleString('id-ID')}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                    {formatCurrency(day.amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'routes' && (
                <div className="space-y-6">
                  {filteredRouteData.map((data) => (
                    <div key={data.route_id} className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5">
                        <h3 className="text-lg font-bold text-white flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          Rute: {data.route?.origin || 'Unknown'} - {data.route?.destination || 'Unknown'}
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200">
                            <div className="flex items-center p-4">
                              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500">Total Penumpang</div>
                                <div className="text-lg font-semibold text-gray-900">{(data.total_passengers || 0).toLocaleString('id-ID')}</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-green-50 to-white rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200">
                            <div className="flex items-center p-4">
                              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500">Total Kendaraan</div>
                                <div className="text-lg font-semibold text-gray-900">{(data.total_vehicles || 0).toLocaleString('id-ID')}</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-red-50 to-white rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-red-200">
                            <div className="flex items-center p-4">
                              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500">Total Pendapatan</div>
                                <div className="text-lg font-semibold text-gray-900">{formatCurrency(data.total_amount || 0)}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {data.dates && Object.keys(data.dates).length > 0 && (
                          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Tanggal
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Total Penumpang
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Total Kendaraan
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Total Pendapatan
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Okupansi
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {data.dates && Object.entries(data.dates).sort().map(([date, dateData], index) => (
                                    <tr key={date} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(date)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {(dateData.passengers || 0).toLocaleString('id-ID')}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {(dateData.vehicles || 0).toLocaleString('id-ID')}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(dateData.amount || 0)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                          <div 
                                            className={`h-2.5 rounded-full ${
                                              calculateOccupancyRate(dateData.passengers || 0, 100) > 90 
                                                ? 'bg-red-600' 
                                                : calculateOccupancyRate(dateData.passengers || 0, 100) > 70 
                                                ? 'bg-yellow-500' 
                                                : 'bg-green-600'
                                            }`}
                                            style={{ width: `${calculateOccupancyRate(dateData.passengers || 0, 100)}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {Math.round(calculateOccupancyRate(dateData.passengers || 0, 100))}%
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                  <tr className="bg-gray-100 font-medium">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      Total
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {(data.total_passengers || 0).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {(data.total_vehicles || 0).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {formatCurrency(data.total_amount || 0)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      -
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'trends' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-purple-600">
                      <h3 className="text-lg font-bold text-white">Analisis Tren Bulanan</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Passenger Trend Analysis */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Tren Penumpang</h4>
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                </svg>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm text-gray-500">Rata-rata Harian</p>
                                <p className="text-lg font-semibold text-gray-900">{summary.averageDailyPassengers.toLocaleString('id-ID')} penumpang</p>
                              </div>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Insight:</h5>
                              <p className="text-sm text-gray-600">
                                {summary.busyDays.length > 0 
                                  ? `Tanggal ${formatDate(summary.busyDays[0].date)} adalah hari tersibuk dengan ${summary.busyDays[0].passengers.toLocaleString('id-ID')} penumpang.`
                                  : 'Tidak ada data tren penumpang yang tersedia.'}
                              </p>
                              <p className="text-sm text-gray-600 mt-2">
                                {summary.topRoutesByRevenue.length > 0
                                  ? `Rute ${summary.topRoutesByRevenue[0].name} adalah yang paling banyak digunakan dengan ${summary.topRoutesByRevenue[0].passengers.toLocaleString('id-ID')} penumpang.`
                                  : ''}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Revenue Trend Analysis */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Tren Pendapatan</h4>
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm text-gray-500">Total Pendapatan</p>
                                <p className="text-lg font-semibold text-gray-900">{formatCurrency(summary.totalRevenue)}</p>
                              </div>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Insight:</h5>
                              <p className="text-sm text-gray-600">
                                {summary.busyDays.length > 0 
                                  ? `Tanggal ${formatDate(summary.busyDays[0].date)} menghasilkan pendapatan tertinggi sebesar ${formatCurrency(summary.busyDays[0].amount)}.`
                                  : 'Tidak ada data tren pendapatan yang tersedia.'}
                              </p>
                              <p className="text-sm text-gray-600 mt-2">
                                {summary.topRoutesByRevenue.length > 0
                                  ? `Rute ${summary.topRoutesByRevenue[0].name} adalah yang paling menguntungkan dengan pendapatan ${formatCurrency(summary.topRoutesByRevenue[0].revenue)}.`
                                  : ''}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Route Performance */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm md:col-span-2">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Performa Rute</h4>
                          <div className="space-y-4">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Rute
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Penumpang
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Kendaraan
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Pendapatan
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      % dari Total
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {routeData.map((data, index) => (
                                    <tr key={data.route_id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {data.route?.origin || 'Unknown'} - {data.route?.destination || 'Unknown'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {(data.total_passengers || 0).toLocaleString('id-ID')}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {(data.total_vehicles || 0).toLocaleString('id-ID')}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {formatCurrency(data.total_amount || 0)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                            <div 
                                              className="h-2.5 rounded-full bg-blue-600"
                                              style={{ width: `${(data.total_amount / summary.totalRevenue) * 100}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-sm text-gray-700">
                                            {Math.round((data.total_amount / summary.totalRevenue) * 100)}%
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Footer with additional info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Data laporan diperbarui setiap hari pukul 00:00 WIB. Untuk pertanyaan lebih lanjut hubungi tim IT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;