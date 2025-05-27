import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { operatorBookingsService } from '../../../services/operatorBookings.service';
import { useAuth } from '../../../contexts/AuthContext';

const BookingList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState({});
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const [viewMode, setViewMode] = useState('table'); // table or grid

  // Filter states
  const [filters, setFilters] = useState({
    booking_code: searchParams.get('booking_code') || '',
    user_name: searchParams.get('user_name') || '',
    route_id: searchParams.get('route_id') || '',
    status: searchParams.get('status') || '',
    booking_date_from: searchParams.get('booking_date_from') || '',
    booking_date_to: searchParams.get('booking_date_to') || '',
    page: searchParams.get('page') || 1
  });

  useEffect(() => {
    console.log("Search params changed:", Object.fromEntries(searchParams));
    fetchBookings();
  }, [searchParams]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      console.log("Fetching with filters:", filters);
      const response = await operatorBookingsService.getAll(filters);

      console.log("API Response:", response);

      if (response.data && response.data.status === 'success') {
        const bookingsData = response.data.data.bookings.data || [];
        const routesData = response.data.data.routes || {};

        const paginationData = {
          current_page: response.data.data.bookings.current_page || 1,
          last_page: response.data.data.bookings.last_page || 1,
          per_page: response.data.data.bookings.per_page || 10,
          total: response.data.data.bookings.total || 0
        };

        console.log("Parsed bookings data:", bookingsData);
        console.log("Parsed routes data:", routesData);
        console.log("Parsed pagination data:", paginationData);

        setBookings(bookingsData);
        setRoutes(routesData);
        setPagination(paginationData);
      } else {
        console.error("Invalid API response format:", response);
        setBookings([]);
        setRoutes({});
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      console.error('Error details:', error.response?.data);
      // Set default values on error
      setBookings([]);
      setRoutes({});
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
      });
    }
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilter = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();

    // Set page to 1 when applying new filters
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    setSearchParams(queryParams);
  };

  const handleReset = () => {
    setFilters({
      booking_code: '',
      user_name: '',
      route_id: '',
      status: '',
      booking_date_from: '',
      booking_date_to: '',
      page: 1
    });
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));

    const queryParams = new URLSearchParams(searchParams);
    queryParams.set('page', page);
    setSearchParams(queryParams);
  };

  const getStatusBadgeClass = (status) => {
    const badgeClasses = {
      'PENDING': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300',
      'CONFIRMED': 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
      'COMPLETED': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
      'CANCELLED': 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300',
    };
    return badgeClasses[status] || 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300';
  };

  const getStatusText = (status) => {
    const statusText = {
      'PENDING': 'Menunggu',
      'CONFIRMED': 'Dikonfirmasi',
      'COMPLETED': 'Selesai',
      'CANCELLED': 'Dibatalkan',
    };
    return statusText[status] || status;
  };

  const getVehicleCount = (booking) => {
    if (!booking.vehicles) return 0;
    if (Array.isArray(booking.vehicles)) return booking.vehicles.length;
    if (typeof booking.vehicles === 'object') return Object.keys(booking.vehicles).length;
    return 0;
  };

  const getFirstItem = () => ((pagination.current_page - 1) * pagination.per_page) + 1;
  const getLastItem = () => Math.min(pagination.current_page * pagination.per_page, pagination.total);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header Section */}
        <div className="bg-gradient-to-br from-blue-800 via-blue-600 to-blue-500 rounded-2xl shadow-xl text-white p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" className="w-full h-full">
              <path d="M472.3 724.1c-142.9 52.5-285.8-46.9-404.6-124.4 104.1 31.6 255-30.3 307.6-130.9 52.5-100.6-17.3-178.1-96.4-193.9 207.6 26.6 285.8 337.7 193.4 449.2z"
                fill="#fff" opacity="0.2" />
              <path d="M472.3 724.1c-142.9 52.5-285.8-46.9-404.6-124.4 104.1 31.6 255-30.3 307.6-130.9 52.5-100.6-17.3-178.1-96.4-193.9 207.6 26.6 285.8 337.7 193.4 449.2z"
                fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeDasharray="10 20" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Daftar Booking</h1>
                  <p className="mt-1 text-blue-100">Kelola dan pantau status booking penumpang</p>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Total Booking: {pagination.total}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-100 text-sm">Menunggu</p>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 mr-2 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-2xl font-bold">
                    {bookings.filter(booking => booking.status === 'PENDING').length}
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-100 text-sm">Dikonfirmasi</p>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-2xl font-bold">
                    {bookings.filter(booking => booking.status === 'CONFIRMED').length}
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-100 text-sm">Selesai</p>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-2xl font-bold">
                    {bookings.filter(booking => booking.status === 'COMPLETED').length}
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-100 text-sm">Dibatalkan</p>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 mr-2 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-2xl font-bold">
                    {bookings.filter(booking => booking.status === 'CANCELLED').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Alert */}
        {(!user?.assigned_routes || Object.keys(user?.assigned_routes || {}).length === 0) && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-5 mb-6 rounded-xl shadow-lg animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-yellow-800">Perhatian</h3>
                <p className="mt-1 text-sm text-yellow-700">Anda belum memiliki rute yang ditugaskan. Silakan hubungi administrator untuk mengatur rute yang dapat Anda akses.</p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Filter Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter & Pencarian
            </h2>
          </div>

          <div className="p-6 bg-white">
            <form onSubmit={handleFilter} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="booking_code" className="block text-sm font-medium text-gray-700 mb-1">Kode Booking</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="booking_code"
                      id="booking_code"
                      value={filters.booking_code}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Masukkan kode booking"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-1">Nama Pengguna</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="user_name"
                      id="user_name"
                      value={filters.user_name}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Masukkan nama pengguna"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <select
                      name="route_id"
                      id="route_id"
                      value={filters.route_id}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Semua Rute</option>
                      {Object.entries(routes).map(([routeId, routeName]) => (
                        <option key={routeId} value={routeId}>{routeName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <select
                      name="status"
                      id="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Semua Status</option>
                      <option value="PENDING">Menunggu</option>
                      <option value="CONFIRMED">Dikonfirmasi</option>
                      <option value="COMPLETED">Selesai</option>
                      <option value="CANCELLED">Dibatalkan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="booking_date_from" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      name="booking_date_from"
                      id="booking_date_from"
                      value={filters.booking_date_from}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="booking_date_to" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      name="booking_date_to"
                      id="booking_date_to"
                      value={filters.booking_date_to}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* View Toggle & Result Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">
            {pagination.total > 0 ? (
              <>
                Menampilkan <span className="font-medium">{getFirstItem()}</span> -
                <span className="font-medium"> {getLastItem()}</span> dari
                <span className="font-medium"> {pagination.total}</span> booking
              </>
            ) : null}
          </p>

          <div className="flex items-center space-x-2">
            <div className="p-1 bg-gray-100 rounded-lg flex">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
                <div className="animate-ping absolute top-0 left-0 rounded-full h-16 w-16 border-2 border-blue-600 opacity-30"></div>
              </div>
              <p className="ml-4 text-lg text-gray-600 font-medium">Memuat data booking...</p>
            </div>
          ) : (
            <>
              {/* Table View */}
              {viewMode === 'table' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kode Booking
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pengguna
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rute
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Penumpang
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kendaraan
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings && bookings.length > 0 ? (
                        bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                  </svg>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-blue-600">{booking.booking_code}</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(booking.created_at).toLocaleDateString('id-ID')}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-9 w-9">
                                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {booking.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{booking.user?.name || 'Pengguna Tidak Ditemukan'}</p>
                                  <p className="text-xs text-gray-500">{booking.user?.email || ''}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {booking.schedule?.route ? (
                                  <div className="flex items-center">
                                    <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">
                                      <span className="font-medium">{booking.schedule.route.origin}</span>
                                      <svg className="mx-2 h-4 w-4 text-blue-500 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                      </svg>
                                      <span className="font-medium">{booking.schedule.route.destination}</span>
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md text-xs">Rute Tidak Ditemukan</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {booking?.schedule?.departure_time ? new Date(booking.schedule.departure_time).toLocaleString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                }) : ''}
                              </div>
                              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-center mt-1">
                                {booking?.schedule?.arrival_time ? new Date(booking.schedule.departure_time).toLocaleString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-md">
                                {booking.passenger_count || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 shadow-md">
                                {getVehicleCount(booking)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm font-bold text-gray-900">
                                {formatCurrency(booking.total_amount || 0)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-md ${getStatusBadgeClass(booking.status)}`}>
                                {getStatusText(booking.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <Link
                                to={`/operator/bookings/${booking.id}`}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                              >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Detail
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center px-6 py-16">
                            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium text-gray-900 mb-1">Tidak ada data booking</p>
                            <p className="text-sm text-gray-500">Coba sesuaikan filter pencarian Anda</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings && bookings.length > 0 ? (
                      bookings.map((booking) => {
                        const statusClass = getStatusBadgeClass(booking.status);
                        return (
                          <div key={booking.id} className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 relative">
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="text-white text-5xl opacity-25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                              <div className="absolute bottom-0 left-0 p-4 text-white">
                                <h3 className="text-xl font-bold">{booking.booking_code}</h3>
                                <p className="text-sm text-white/80">{booking.user?.name || 'N/A'}</p>
                              </div>
                              <div className="absolute top-3 right-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                                  {getStatusText(booking.status)}
                                </span>
                              </div>
                            </div>

                            <div className="p-4">
                              <div className="mb-4">
                                <div className="text-xs text-gray-500 mb-1">Rute</div>
                                <div className="text-sm font-medium text-gray-800">
                                  {booking.schedule?.route ?
                                    `${booking.schedule.route.origin} - ${booking.schedule.route.destination}` :
                                    'Rute Tidak Ditemukan'
                                  }
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-blue-50 p-2 rounded-lg text-center">
                                  <p className="text-xs text-blue-600 mb-1">Tanggal Keberangkatan</p>
                                  <div className="flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-blue-700">
                                      {booking?.schedule?.departure_time ? new Date(booking.schedule.departure_time).toLocaleString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      }) : ''}
                                    </span>
                                  </div>
                                </div>

                                <div className="bg-emerald-50 p-2 rounded-lg text-center">
                                  <p className="text-xs text-emerald-600 mb-1">Total</p>
                                  <div className="flex items-center justify-center">
                                    <svg className="w-4 h-4 text-emerald-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-emerald-700">
                                      {formatCurrency(booking.total_amount || 0)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-purple-50 p-3 rounded-lg mb-4 flex justify-between">
                                <div className="text-center flex-1">
                                  <p className="text-xs text-purple-600 mb-1">Penumpang</p>
                                  <div className="flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="text-lg font-semibold text-purple-700">{booking.passenger_count || 0}</span>
                                  </div>
                                </div>

                                <div className="text-center flex-1 border-l border-purple-100">
                                  <p className="text-xs text-purple-600 mb-1">Kendaraan</p>
                                  <div className="flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l-4-4m4 4l4-4" />
                                    </svg>
                                    <span className="text-lg font-semibold text-purple-700">{getVehicleCount(booking)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-center border-t border-gray-100 pt-4">
                                <Link
                                  to={`/operator/bookings/${booking.id}`}
                                  className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Detail Booking
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-3 flex flex-col items-center justify-center py-16">
                        <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-1">Tidak ada data booking</p>
                        <p className="text-sm text-gray-500">Coba sesuaikan filter pencarian Anda</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modern Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600 mb-4 md:mb-0">
                    Menampilkan <span className="font-medium">{getFirstItem()}</span> -
                    <span className="font-medium"> {getLastItem()}</span> dari
                    <span className="font-medium"> {pagination.total}</span> booking
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.current_page === 1}
                      className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                        let pageNum;
                        if (pagination.last_page <= 5) {
                          // Show all pages if 5 or fewer
                          pageNum = i + 1;
                        } else if (pagination.current_page <= 3) {
                          // Near the start
                          pageNum = i + 1;
                        } else if (pagination.current_page >= pagination.last_page - 2) {
                          // Near the end
                          pageNum = pagination.last_page - 4 + i;
                        } else {
                          // Middle cases
                          pageNum = pagination.current_page - 2 + i;
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors shadow-sm 
                              ${pagination.current_page === pageNum ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.last_page)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* CSS for animations and button styling */}
        <style>{`
          @keyframes fadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
          
          .btn-icon {
            width: 36px;
            height: 36px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all 0.2s ease;
          }
          
          .btn-icon:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    </div>
  );
};

export default BookingList;