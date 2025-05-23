import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });
  
  const [filters, setFilters] = useState({
    booking_code: '',
    user_name: '',
    route_id: '',
    status: '',
    booking_date_from: '',
    booking_date_to: ''
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [viewMode, setViewMode] = useState('table'); // table or grid

  useEffect(() => {
    fetchBookings();
    
    // Auto-hide alert after 5 seconds
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({...alert, show: false});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        ...filters
      };
      
      const response = await api.get('/admin-panel/bookings', { params });
      
      // Handle response structure from Laravel
      if (response.data.success) {
        const data = response.data.data;
        
        // Set bookings array from paginated data
        setBookings(data.bookings.data || []);
        
        // Set pagination info
        setPagination({
          current_page: data.bookings.current_page || 1,
          last_page: data.bookings.last_page || 1,
          total: data.bookings.total || 0
        });
        
        // Set routes
        setRoutes(data.routes || []);
      } else {
        // Handle error case
        setBookings([]);
        setAlert({
          show: true,
          type: 'error',
          message: 'Gagal memuat data booking'
        });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]); // Set empty array on error
      setAlert({
        show: true,
        type: 'error',
        message: 'Terjadi kesalahan saat memuat data booking'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings(1);
  };

  const handleReset = () => {
    setFilters({
      booking_code: '',
      user_name: '',
      route_id: '',
      status: '',
      booking_date_from: '',
      booking_date_to: ''
    });
    // Fetch bookings with reset filters
    setTimeout(() => fetchBookings(1), 0);
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'PENDING':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: 'fa-clock',
          label: 'Pending',
          border: 'border-yellow-200',
          indicator: 'bg-yellow-500'
        };
      case 'CONFIRMED':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-800',
          icon: 'fa-check-circle',
          label: 'Confirmed',
          border: 'border-emerald-200',
          indicator: 'bg-emerald-500'
        };
      case 'COMPLETED':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: 'fa-flag-checkered',
          label: 'Completed',
          border: 'border-blue-200',
          indicator: 'bg-blue-500'
        };
      case 'CANCELLED':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: 'fa-times-circle',
          label: 'Cancelled',
          border: 'border-red-200',
          indicator: 'bg-red-500'
        };
      case 'REFUNDED':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: 'fa-hand-holding-usd',
          label: 'Refunded',
          border: 'border-gray-200',
          indicator: 'bg-gray-500'
        };
      case 'RESCHEDULED':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          icon: 'fa-calendar-alt',
          label: 'Rescheduled',
          border: 'border-purple-200',
          indicator: 'bg-purple-500'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: 'fa-question-circle',
          label: status || 'Unknown',
          border: 'border-gray-200',
          indicator: 'bg-gray-500'
        };
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Helper function to format date
  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    
    try {
      const options = {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      };
      
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Pagination handling
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.last_page) return;
    fetchBookings(newPage);
  };

  const getFirstItem = () => ((pagination.current_page - 1) * 10) + 1;
  const getLastItem = () => Math.min(pagination.current_page * 10, pagination.total);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Modern Header */}
      <div className="bg-gradient-to-br from-blue-800 via-blue-600 to-blue-500 p-8 text-white relative">
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
                <i className="fas fa-ticket-alt text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Manajemen Booking</h1>
                <p className="mt-1 text-blue-100">Kelola seluruh booking tiket kapal ferry dalam sistem</p>
              </div>
            </div>
            
            <div>
              <Link
                to="/admin/bookings/create"
                className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm"
              >
                <i className="fas fa-plus mr-2"></i> Buat Booking Baru
              </Link>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Total Booking</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-ticket-alt mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{pagination.total}</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Booking Pending</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-clock mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">
                  {bookings.filter(booking => booking.status === 'PENDING').length}
                </span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Booking Confirmed</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-check-circle mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">
                  {bookings.filter(booking => booking.status === 'CONFIRMED').length}
                </span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Booking Cancelled</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-times-circle mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">
                  {bookings.filter(booking => booking.status === 'CANCELLED').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Alert Messages with modern styling */}
        {alert.show && (
          <div className={`mb-6 rounded-lg shadow-lg overflow-hidden animate-slideIn`}>
            <div className={`${alert.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} px-4 py-2 text-white flex items-center justify-between`}>
              <div className="flex items-center">
                <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                <span className="font-medium">{alert.type === 'success' ? 'Sukses' : 'Error'}</span>
              </div>
              <button onClick={() => setAlert({...alert, show: false})} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={`${alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'} px-4 py-3 border-t`}>
              {alert.message}
            </div>
          </div>
        )}

        {/* Modern Filter Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-8 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <i className="fas fa-filter text-blue-500 mr-2"></i>
              Filter & Pencarian
            </h2>
          </div>
          
          <div className="p-6 bg-white">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="booking_code" className="block text-sm font-medium text-gray-700 mb-1">Kode Booking</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-hashtag text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="booking_code"
                      name="booking_code"
                      value={filters.booking_code}
                      onChange={handleFilterChange}
                      placeholder="Masukkan kode booking..."
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-1">Nama Pengguna</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-user text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="user_name"
                      name="user_name"
                      value={filters.user_name}
                      onChange={handleFilterChange}
                      placeholder="Cari nama pengguna..."
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-route text-gray-400"></i>
                    </div>
                    <select
                      id="route_id"
                      name="route_id"
                      value={filters.route_id}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-toggle-on text-gray-400"></i>
                    </div>
                    <select
                      id="status"
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  <label htmlFor="booking_date_from" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Booking Dari</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-calendar-alt text-gray-400"></i>
                    </div>
                    <input
                      type="date"
                      id="booking_date_from"
                      name="booking_date_from"
                      value={filters.booking_date_from}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="booking_date_to" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Booking Sampai</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-calendar-alt text-gray-400"></i>
                    </div>
                    <input
                      type="date"
                      id="booking_date_to"
                      name="booking_date_to"
                      value={filters.booking_date_to}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {(filters.booking_code || 
                  filters.user_name || 
                  filters.route_id || 
                  filters.status || 
                  filters.booking_date_from || 
                  filters.booking_date_to) && (
                  <button
                    onClick={handleReset}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    <i className="fas fa-times mr-2"></i> Reset
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <i className="fas fa-search mr-2"></i> Cari
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
            ) : (
              <span>Tidak ada hasil yang ditemukan</span>
            )}
          </p>
          
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-gray-100 rounded-lg flex">
              <button 
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <i className="fas fa-list"></i>
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <i className="fas fa-th-large"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-8 text-center">
            <div className="inline-block relative">
              <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="mt-4 text-gray-600">Memuat data booking...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-ticket-alt text-gray-400 text-4xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Data Booking</h3>
            <p className="text-gray-600 mb-6">Belum ada booking yang ditemukan atau sesuai dengan filter yang Anda pilih</p>
            <div className="flex justify-center space-x-3">
              <button 
                onClick={handleReset}
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <i className="fas fa-sync-alt mr-2"></i> Reset Filter
              </button>
              <Link
                to="/admin/bookings/create"
                className="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <i className="fas fa-plus mr-2"></i> Buat Booking Baru
              </Link>
            </div>
          </div>
        )}

        {/* Table View */}
        {!loading && bookings.length > 0 && viewMode === 'table' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penumpang</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => {
                    const statusConfig = getStatusConfig(booking.status);
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                              <i className="fas fa-ticket-alt"></i>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-blue-600">{booking.booking_code}</div>
                              <div className="text-xs text-gray-500">
                                {formatDate(booking.created_at, true)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                              <i className="fas fa-user"></i>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{booking.user?.name || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            {booking.schedule?.route ? (
                              <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">
                                <i className="fas fa-route mr-1"></i> {booking.schedule.route.origin} - {booking.schedule.route.destination}
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-medium">
                              <i className="fas fa-calendar-day mr-1"></i> {formatDate(booking.departure_date)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-xs font-medium">
                              <i className="fas fa-users mr-1"></i> {booking.passenger_count || 0}
                            </span>
                            {booking.vehicle_count > 0 && (
                              <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-medium">
                                <i className="fas fa-car mr-1"></i> {booking.vehicle_count}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(booking.total_amount || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                            <span className={`w-1.5 h-1.5 ${statusConfig.indicator} rounded-full mr-1.5 ${booking.status === 'PENDING' ? 'animate-pulse' : ''}`}></span>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              to={`/admin/bookings/${booking.id}`}
                              className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                              title="Detail">
                              <i className="fas fa-eye"></i>
                            </Link>
                            {booking.status === 'CONFIRMED' && (
                              <Link 
                                to={`/admin/bookings/${booking.id}/reschedule`}
                                className="btn-icon bg-purple-50 hover:bg-purple-100 text-purple-600 p-2 rounded-lg transition-colors"
                                title="Reschedule">
                                <i className="fas fa-calendar-alt"></i>
                              </Link>
                            )}
                            {['CONFIRMED', 'COMPLETED'].includes(booking.status) && (
                              <Link
                                to={`/admin/refunds/create/${booking.id}`}
                                className="btn-icon bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded-lg transition-colors"
                                title="Refund">
                                <i className="fas fa-hand-holding-usd"></i>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grid View */}
        {!loading && bookings.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {bookings.map(booking => {
              const statusConfig = getStatusConfig(booking.status);
              return (
                <div key={booking.id} className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 relative">
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fas fa-ticket-alt text-white text-5xl opacity-25"></i>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h3 className="text-xl font-bold">{booking.booking_code}</h3>
                      <p className="text-sm text-white/80">{booking.user?.name || 'N/A'}</p>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                        <span className={`w-1.5 h-1.5 ${statusConfig.indicator} rounded-full mr-1.5 ${booking.status === 'PENDING' ? 'animate-pulse' : ''}`}></span>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Rute</div>
                      <div className="text-sm font-medium text-gray-800">
                        {booking.schedule?.route ? 
                          `${booking.schedule.route.origin} - ${booking.schedule.route.destination}` : 
                          'N/A'
                        }
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-blue-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-blue-600 mb-1">Tanggal Keberangkatan</p>
                        <div className="flex items-center justify-center">
                          <i className="fas fa-calendar-day text-blue-400 mr-1"></i>
                          <span className="text-sm font-semibold text-blue-700">
                            {formatDate(booking.departure_date)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-emerald-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-emerald-600 mb-1">Total</p>
                        <div className="flex items-center justify-center">
                          <i className="fas fa-money-bill-wave text-emerald-400 mr-1"></i>
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
                          <i className="fas fa-users text-purple-400 mr-1"></i>
                          <span className="text-lg font-semibold text-purple-700">{booking.passenger_count || 0}</span>
                        </div>
                      </div>
                      
                      {booking.vehicle_count > 0 && (
                        <div className="text-center flex-1 border-l border-purple-100">
                          <p className="text-xs text-purple-600 mb-1">Kendaraan</p>
                          <div className="flex items-center justify-center">
                            <i className="fas fa-car text-purple-400 mr-1"></i>
                            <span className="text-lg font-semibold text-purple-700">{booking.vehicle_count}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between border-t border-gray-100 pt-4">
                      <Link
                        to={`/admin/bookings/${booking.id}`}
                        className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                        title="Detail"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      {booking.status === 'CONFIRMED' && (
                        <Link 
                          to={`/admin/bookings/${booking.id}/reschedule`}
                          className="btn-icon bg-purple-50 hover:bg-purple-100 text-purple-600 p-2 rounded-lg transition-colors"
                          title="Reschedule"
                        >
                          <i className="fas fa-calendar-alt"></i>
                        </Link>
                      )}
                      {['CONFIRMED', 'COMPLETED'].includes(booking.status) && (
                        <Link
                          to={`/admin/refunds/create/${booking.id}`}
                          className="btn-icon bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded-lg transition-colors"
                          title="Refund"
                        >
                          <i className="fas fa-hand-holding-usd"></i>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modern Pagination */}
        {!loading && pagination.total > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              Menampilkan <span className="font-medium">{getFirstItem()}</span> - 
              <span className="font-medium"> {getLastItem()}</span> dari 
              <span className="font-medium"> {pagination.total}</span> hasil
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={() => handlePageChange(1)}
                disabled={pagination.current_page === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button 
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-left"></i>
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
                <i className="fas fa-angle-right"></i>
              </button>
              <button 
                onClick={() => handlePageChange(pagination.last_page)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS for animations and button styling */}
      <style>{`
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
        
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BookingsList;