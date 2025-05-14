// src/pages/operator/bookings/BookingList.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { operatorBookingsService } from '../../../services/operatorBookings.service';
import { useAuth } from '../../../contexts/AuthContext';

const BookingList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

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
    fetchBookings();
  }, [searchParams]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams);
      const response = await operatorBookingsService.getAll(params);
      
      console.log('API Response:', response); // Debug line
      
      // Ensure data is in correct format
      const bookingsData = response.data?.data || [];
      const paginationData = response.data?.meta || {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
      };
      
      setBookings(bookingsData);
      setPagination(paginationData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Set default values on error
      setBookings([]);
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
    
    Object.entries(filters).forEach(([key, value]) => {
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
    const queryParams = new URLSearchParams(searchParams);
    queryParams.set('page', page);
    setSearchParams(queryParams);
  };

  const getStatusBadgeClass = (status) => {
    const badgeClasses = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-green-100 text-green-800',
      'COMPLETED': 'bg-blue-100 text-blue-800',
      'CANCELLED': 'bg-red-100 text-red-800',
    };
    return badgeClasses[status] || 'bg-gray-100 text-gray-800';
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

  // Helper function untuk mendapatkan jumlah kendaraan dengan safe checking
  const getVehicleCount = (booking) => {
    if (!booking.vehicles) return 0;
    if (Array.isArray(booking.vehicles)) return booking.vehicles.length;
    if (typeof booking.vehicles === 'object') return Object.keys(booking.vehicles).length;
    return 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Daftar Booking</h3>
        </div>

        {!user?.assigned_routes || Object.keys(user.assigned_routes).length === 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p className="font-semibold">Perhatian</p>
            <p>Anda belum memiliki rute yang ditugaskan. Silakan hubungi administrator untuk mengatur rute yang dapat Anda akses.</p>
          </div>
        )}

        <div className="px-6 py-4">
          <form onSubmit={handleFilter} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                name="booking_code"
                value={filters.booking_code}
                onChange={handleFilterChange}
                className="input input-bordered w-full"
                placeholder="Kode Booking"
              />
              <input
                type="text"
                name="user_name"
                value={filters.user_name}
                onChange={handleFilterChange}
                className="input input-bordered w-full"
                placeholder="Nama Pengguna"
              />
              <select
                name="route_id"
                value={filters.route_id}
                onChange={handleFilterChange}
                className="input input-bordered w-full"
              >
                <option value="">Semua Rute</option>
                {user?.assigned_routes && Object.entries(user.assigned_routes).map(([routeId, routeName]) => (
                  <option key={routeId} value={routeId}>{routeName}</option>
                ))}
              </select>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="input input-bordered w-full"
              >
                <option value="">Semua Status</option>
                <option value="PENDING">Menunggu</option>
                <option value="CONFIRMED">Dikonfirmasi</option>
                <option value="COMPLETED">Selesai</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="date"
                name="booking_date_from"
                value={filters.booking_date_from}
                onChange={handleFilterChange}
                className="input input-bordered w-full"
              />
              <input
                type="date"
                name="booking_date_to"
                value={filters.booking_date_to}
                onChange={handleFilterChange}
                className="input input-bordered w-full"
              />
              <div className="md:col-span-2 flex items-center space-x-2">
                <button type="submit" className="btn btn-primary">Filter</button>
                <button type="button" onClick={handleReset} className="btn btn-outline">Reset</button>
              </div>
            </div>
          </form>
        </div>

        <div className="overflow-x-auto px-6 pb-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm font-semibold text-gray-700">
                    <th className="px-4 py-2">Kode Booking</th>
                    <th className="px-4 py-2">Pengguna</th>
                    <th className="px-4 py-2">Rute</th>
                    <th className="px-4 py-2">Tanggal</th>
                    <th className="px-4 py-2">Penumpang</th>
                    <th className="px-4 py-2">Kendaraan</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-sm">
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-4 py-2">{booking.booking_code}</td>
                        <td className="px-4 py-2">{booking.user?.name || 'Pengguna Tidak Ditemukan'}</td>
                        <td className="px-4 py-2">
                          {booking.schedule?.route ? (
                            <>
                              {booking.schedule.route.origin} - {booking.schedule.route.destination}
                            </>
                          ) : (
                            'Route Tidak Ditemukan'
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(booking.booking_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-2">{booking.passenger_count || 0}</td>
                        <td className="px-4 py-2">{getVehicleCount(booking)}</td>
                        <td className="px-4 py-2">
                          Rp {(booking.total_amount || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <Link
                            to={`/operator/bookings/${booking.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <td colSpan="9" className="text-center px-4 py-6 text-gray-500">
                        Tidak ada data booking
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Menampilkan {((pagination.current_page || 1) - 1) * (pagination.per_page || 10) + 1} hingga{' '}
                    {Math.min((pagination.current_page || 1) * (pagination.per_page || 10), pagination.total || 0)} dari{' '}
                    {pagination.total || 0} total booking
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange((pagination.current_page || 1) - 1)}
                      disabled={(pagination.current_page || 1) === 1}
                      className="px-3 py-1 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {pagination.last_page && [...Array(Math.max(pagination.last_page, 1))].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === pagination.last_page ||
                        (page >= (pagination.current_page || 1) - 2 && page <= (pagination.current_page || 1) + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 text-sm rounded-md ${
                              page === (pagination.current_page || 1)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === (pagination.current_page || 1) - 3 ||
                        page === (pagination.current_page || 1) + 3
                      ) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => handlePageChange((pagination.current_page || 1) + 1)}
                      disabled={(pagination.current_page || 1) === pagination.last_page}
                      className="px-3 py-1 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingList;