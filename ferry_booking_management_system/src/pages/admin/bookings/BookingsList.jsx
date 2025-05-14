// src/pages/admin/bookings/BookingsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';

const BookingsList = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        ...filters
      };
      
      const response = await api.get('/admin-panel/bookings', { params });
      console.log('Bookings response:', response.data);
      
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
        console.error('API returned success: false');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]); // Set empty array on error
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

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'COMPLETED': 'bg-blue-100 text-blue-800',
      'REFUNDED': 'bg-gray-100 text-gray-800',
      'RESCHEDULED': 'bg-purple-100 text-purple-800'
    };

    const labels = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'CANCELLED': 'Cancelled',
      'COMPLETED': 'Completed',
      'REFUNDED': 'Refunded',
      'RESCHEDULED': 'Rescheduled'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
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
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Booking</h1>
          <p className="mt-1 text-gray-600">Kelola semua booking tiket kapal ferry</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Filter Booking</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label htmlFor="booking_code" className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Booking
                </label>
                <input
                  type="text"
                  id="booking_code"
                  name="booking_code"
                  value={filters.booking_code}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>

              <div>
                <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pengguna
                </label>
                <input
                  type="text"
                  id="user_name"
                  name="user_name"
                  value={filters.user_name}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>

              <div>
                <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Rute
                </label>
                <select
                  id="route_id"
                  name="route_id"
                  value={filters.route_id}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label htmlFor="booking_date_from" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Booking Dari
                </label>
                <input
                  type="date"
                  id="booking_date_from"
                  name="booking_date_from"
                  value={filters.booking_date_from}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>

              <div>
                <label htmlFor="booking_date_to" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Booking Sampai
                </label>
                <input
                  type="date"
                  id="booking_date_to"
                  name="booking_date_to"
                  value={filters.booking_date_to}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>

              <div className="lg:col-span-2 flex items-end space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors"
                >
                  <i className="fas fa-search mr-2"></i> Cari
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md shadow-sm transition-colors"
                >
                  <i className="fas fa-sync-alt mr-2"></i> Reset
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Booking List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Daftar Booking</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rute
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Penumpang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kendaraan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dibuat Pada
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-10 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg">Tidak ada data booking</p>
                        <p className="text-sm text-gray-400 mt-1">Coba sesuaikan filter pencarian Anda</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {booking.booking_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {booking.user?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {booking.schedule?.route ? 
                          `${booking.schedule.route.origin} - ${booking.schedule.route.destination}` : 
                          'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {booking.departure_date ? formatDate(booking.departure_date) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {booking.passenger_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {booking.vehicle_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                        {formatCurrency(booking.total_amount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {booking.created_at ? formatDate(booking.created_at, true) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && pagination.last_page > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => fetchBookings(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {/* Smart pagination */}
                {pagination.last_page <= 7 ? (
                  // Show all pages if 7 or less
                  [...Array(pagination.last_page)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => fetchBookings(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                        pagination.current_page === index + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))
                ) : (
                  // Smart pagination for many pages
                  <>
                    {/* Always show first page */}
                    <button
                      onClick={() => fetchBookings(1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                        pagination.current_page === 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      1
                    </button>

                    {/* Show dots if needed */}
                    {pagination.current_page > 3 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )}

                    {/* Show pages around current page */}
                    {[...Array(5)].map((_, i) => {
                      const page = pagination.current_page - 2 + i;
                      if (page > 1 && page < pagination.last_page) {
                        return (
                          <button
                            key={page}
                            onClick={() => fetchBookings(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                              pagination.current_page === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                      return null;
                    })}

                    {/* Show dots if needed */}
                    {pagination.current_page < pagination.last_page - 2 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )}

                    {/* Always show last page */}
                    <button
                      onClick={() => fetchBookings(pagination.last_page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                        pagination.current_page === pagination.last_page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pagination.last_page}
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => fetchBookings(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsList;