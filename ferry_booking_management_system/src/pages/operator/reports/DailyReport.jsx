// src/pages/operator/reports/DailyReport.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { operatorReportsService } from '../../../services/operatorReports.service';
import Swal from 'sweetalert2';

const DailyReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalPassengers: 0,
    totalVehicles: 0,
    totalBookings: 0,
    totalRevenue: 0,
    completedBookings: 0,
    cancelledBookings: 0
  });
  const [filter, setFilter] = useState({
    date: searchParams.get('date') || new Date().toISOString().split('T')[0],
    status: searchParams.get('status') || 'all',
    search: searchParams.get('search') || ''
  });
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [apiResponseLog, setApiResponseLog] = useState(null); // Untuk debugging

  // Check if operator has routes
  const hasRoutes = useMemo(() => {
    return user?.assigned_routes && Object.keys(user.assigned_routes).length > 0;
  }, [user?.assigned_routes]);

  // Format currency
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  // Filter data based on search and status
  const filteredData = useMemo(() => {
    if (!reportData.length) return [];

    return reportData.filter(booking => {
      // Status filter
      if (filter.status !== 'all' && booking.status !== filter.status) return false;

      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return (
          (booking.booking_code && booking.booking_code.toLowerCase().includes(searchLower)) ||
          (booking.user?.name && booking.user.name.toLowerCase().includes(searchLower)) ||
          (booking.user_name && booking.user_name.toLowerCase().includes(searchLower)) ||
          (booking.route && booking.route.toLowerCase().includes(searchLower)) ||
          (booking.route_name && booking.route_name.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, [reportData, filter.status, filter.search]);

  // Calculate summary data
  const calculateSummary = useCallback((data) => {
    if (!data || !data.length) return {
      totalPassengers: 0,
      totalVehicles: 0,
      totalBookings: 0,
      totalRevenue: 0,
      completedBookings: 0,
      cancelledBookings: 0
    };

    const summary = {
      totalPassengers: 0,
      totalVehicles: 0,
      totalBookings: data.length,
      totalRevenue: 0,
      completedBookings: 0,
      cancelledBookings: 0
    };

    data.forEach(booking => {
      // Add passenger count
      summary.totalPassengers += booking.passenger_count || 0;

      // Add vehicle count
      summary.totalVehicles += booking.vehicle_count || 0;

      // Add revenue (only for completed or confirmed bookings)
      if (booking.status === 'COMPLETED' || booking.status === 'CONFIRMED') {
        summary.totalRevenue += booking.total_amount || 0;
      }

      // Count status
      if (booking.status === 'COMPLETED') summary.completedBookings++;
      if (booking.status === 'CANCELLED') summary.cancelledBookings++;
    });

    return summary;
  }, []);

  // Handle refreshing the report data
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchReport();
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
  }, []);

  useEffect(() => {
    if (hasRoutes) {
      fetchReport();
    } else {
      setLoading(false);
    }
  }, [filter.date]);

  // Apply search and status filters to URL
  useEffect(() => {
    const queryParams = new URLSearchParams();
    queryParams.set('date', filter.date);
    if (filter.status !== 'all') queryParams.set('status', filter.status);
    if (filter.search) queryParams.set('search', filter.search);

    // Update URL without full page reload
    navigate(`/operator/reports/daily?${queryParams.toString()}`, { replace: true });
  }, [filter, navigate]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await operatorReportsService.getDaily({ date: filter.date });
      console.log('Daily report response:', response);
      
      // Simpan response untuk debugging
      setApiResponseLog(response.data);

      if (response.data && response.data.status === 'success') {
        let bookingsData = [];

        // Data dari API berbentuk schedule dengan bookings di dalamnya
        if (response.data.data && Array.isArray(response.data.data.report)) {
          // Ekstrak semua booking dari setiap schedule
          response.data.data.report.forEach(scheduleData => {
            if (Array.isArray(scheduleData.bookings)) {
              // Tambahkan info rute ke setiap booking
              const bookings = scheduleData.bookings.map(booking => ({
                ...booking,
                route: scheduleData.schedule ? 
                  `${scheduleData.schedule.route?.origin} - ${scheduleData.schedule.route?.destination}` : 
                  'Tidak ada jadwal tetap',
                route_name: scheduleData.schedule?.route?.name || ''
              }));
              bookingsData = [...bookingsData, ...bookings];
            }
          });
        }

        console.log('Extracted bookings:', bookingsData);
        
        // Jika tidak ada data, tampilkan log
        if (bookingsData.length === 0) {
          console.warn('No bookings found for date:', filter.date);
          console.log('API response structure:', response.data);
        }
        
        setReportData(bookingsData);

        // Calculate summary
        const summary = calculateSummary(bookingsData);
        setSummaryData(summary);
      } else {
        setReportData([]);
        setSummaryData({
          totalPassengers: 0,
          totalVehicles: 0,
          totalBookings: 0,
          totalRevenue: 0,
          completedBookings: 0,
          cancelledBookings: 0
        });
      }
    } catch (err) {
      console.error('Error fetching daily report:', err);
      setError('Gagal memuat laporan harian');
      setReportData([]);
      setSummaryData({
        totalPassengers: 0,
        totalVehicles: 0,
        totalBookings: 0,
        totalRevenue: 0,
        completedBookings: 0,
        cancelledBookings: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    setExportLoading(true);
    try {
      const response = await operatorReportsService.exportDaily({
        date: filter.date,
        export: format
      });

      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-harian-${filter.date}.${format}`;
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

  const handleStatusChange = (e) => {
    setFilter(prev => ({ ...prev, status: e.target.value }));
  };

  const formatTime = (time) => {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(time);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Jika operator tidak memiliki rute
  if (!hasRoutes) {
    return (
      <div className="max-w-full px-6 py-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
          <div className="px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Laporan Harian
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
        <div className="px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Laporan Harian: {formatDate(filter.date)}
              </h3>
              <p className="text-blue-100 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Terakhir diperbarui: {formatTime(lastRefreshed)}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Link
                to="/operator/reports"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
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
          {/* Filter dan tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Laporan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <input
                  type="date"
                  value={filter.date}
                  onChange={(e) => setFilter(prev => ({ ...prev, date: e.target.value }))}
                  className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Status</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                  </svg>
                </div>
                <select
                  value={filter.status}
                  onChange={handleStatusChange}
                  className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">Semua Status</option>
                  <option value="CONFIRMED">Dikonfirmasi</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="CANCELLED">Dibatalkan</option>
                  <option value="PENDING">Pending</option>
                  <option value="EXPIRED">Kedaluwarsa</option>
                  <option value="REFUNDED">Dikembalikan</option>
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
                  placeholder="Cari kode booking, nama, atau rute"
                  className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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

          {/* Summary Cards */}
          {!loading && filteredData.length > 0 && (
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
                        <dd className="text-2xl font-bold text-white">{summaryData.totalPassengers.toLocaleString('id-ID')}</dd>
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
                        <dd className="text-2xl font-bold text-white">{summaryData.totalVehicles.toLocaleString('id-ID')}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-600 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-purple-100 truncate">Total Booking</dt>
                        <dd className="text-2xl font-bold text-white">{summaryData.totalBookings.toLocaleString('id-ID')}</dd>
                        <dd className="text-xs text-purple-100 mt-1">
                          <span className="text-green-300">{summaryData.completedBookings} selesai</span> •
                          <span className="text-red-300 ml-1">{summaryData.cancelledBookings} batal</span>
                        </dd>
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
                        <dd className="text-2xl font-bold text-white">{formatCurrency(summaryData.totalRevenue)}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export buttons */}
          {filteredData.length > 0 && (
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
                  {/* <button
                    onClick={() => handleExport('pdf')}
                    disabled={exportLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {exportLoading ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                    PDF
                  </button> */}
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
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
          ) : filteredData.length === 0 ? (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-5 rounded-lg" role="alert">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="font-bold text-lg">Informasi</p>
              </div>
              <p className="mt-2">
                {filter.search || filter.status !== 'all' ? 'Tidak ada data yang sesuai dengan filter yang diterapkan.' : 'Tidak ada data untuk tanggal ini.'}
              </p>
              {(filter.search || filter.status !== 'all') && (
                <div className="mt-4">
                  <button
                    onClick={() => setFilter({ ...filter, search: '', status: 'all' })}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Reset Filter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kode Booking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Penumpang
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rute
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((booking, index) => (
                      <tr key={booking.id || booking.booking_code || `booking-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {booking.booking_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                              {(booking.user?.name?.[0] || booking.user_name?.[0] || '?').toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.user?.name || booking.user_name || '-'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {booking.user?.phone || booking.user_phone || '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {booking.route || booking.route_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            booking.status === 'EXPIRED' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'REFUNDED' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status === 'COMPLETED' && 'Selesai'}
                            {booking.status === 'CONFIRMED' && 'Dikonfirmasi'}
                            {booking.status === 'CANCELLED' && 'Dibatalkan'}
                            {booking.status === 'EXPIRED' && 'Kedaluwarsa'}
                            {booking.status === 'REFUNDED' && 'Dikembalikan'}
                            {!['COMPLETED', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(booking.status) && booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex flex-col">
                            <span>{(booking.passenger_count || 0)} penumpang</span>
                            {booking.vehicle_count > 0 && (
                              <span className="text-xs text-gray-500">{booking.vehicle_count} kendaraan</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(booking.total_amount || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination placeholder - would need actual implementation based on API */}
              <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-700">
                    Menampilkan <span className="font-medium">{filteredData.length}</span> dari{' '}
                    <span className="font-medium">{reportData.length}</span> data
                  </p>
                </div>
              </nav>
            </div>
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

export default DailyReport;