import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBookings } from '../../../services/booking';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import Badge from '../../../components/ui/Badge';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
    total_pages: 0,
  });
  const [filters, setFilters] = useState({
    booking_code: '',
    user_name: '',
    route_id: '',
    status: '',
    booking_date_from: '',
    booking_date_to: '',
  });
  const [routes, setRoutes] = useState([]);
  const [noRoutesAssigned, setNoRoutesAssigned] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Initialize from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const initialFilters = {};
        for (const [key, value] of urlParams.entries()) {
          initialFilters[key] = value;
        }
        
        setFilters(prev => ({
          ...prev,
          ...initialFilters
        }));

        const response = await fetchBookings({
          ...initialFilters,
          page: urlParams.get('page') || 1
        });
        
        setBookings(response.data);
        setPagination({
          current_page: response.meta.current_page,
          total: response.meta.total,
          per_page: response.meta.per_page,
          total_pages: response.meta.last_page,
        });
        setRoutes(response.routes || []);
        setNoRoutesAssigned(response.routes.length === 0);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetchBookings({
        ...filters,
        page: 1
      });
      
      setBookings(response.data);
      setPagination({
        current_page: response.meta.current_page,
        total: response.meta.total,
        per_page: response.meta.per_page,
        total_pages: response.meta.last_page,
      });
      
      // Update URL without reloading page
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value) params.append(key, value);
      }
      window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    } catch (error) {
      console.error('Error filtering bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      booking_code: '',
      user_name: '',
      route_id: '',
      status: '',
      booking_date_from: '',
      booking_date_to: '',
    });
    window.history.pushState({}, '', window.location.pathname);
  };

  const handlePageChange = async (page) => {
    setLoading(true);
    
    try {
      const response = await fetchBookings({
        ...filters,
        page
      });
      
      setBookings(response.data);
      setPagination({
        current_page: response.meta.current_page,
        total: response.meta.total,
        per_page: response.meta.per_page,
        total_pages: response.meta.last_page,
      });
      
      // Update URL without reloading page
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value) params.append(key, value);
      }
      params.append('page', page);
      window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Daftar Booking"
      bodyClassName="p-0"
    >
      {noRoutesAssigned && (
        <div className="px-6 py-4">
          <Alert type="warning" title="Perhatian">
            <p>Anda belum memiliki rute yang ditugaskan. Silakan hubungi administrator untuk mengatur rute yang
              dapat Anda akses.</p>
          </Alert>
        </div>
      )}

      <div className="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              type="text" 
              name="booking_code" 
              value={filters.booking_code}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Kode Booking"
            />
            <input 
              type="text" 
              name="user_name" 
              value={filters.user_name}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nama Pengguna"
            />
            <select 
              name="route_id" 
              value={filters.route_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Semua Rute</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.origin} - {route.destination}
                </option>
              ))}
            </select>
            <select 
              name="status" 
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Menunggu</option>
              <option value="CONFIRMED">Dikonfirmasi</option>
              <option value="COMPLETED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="booking_date_from" className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
              <input 
                type="date" 
                name="booking_date_from" 
                id="booking_date_from" 
                value={filters.booking_date_from}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="booking_date_to" className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
              <input 
                type="date" 
                name="booking_date_to" 
                id="booking_date_to" 
                value={filters.booking_date_to}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="md:col-span-2 flex items-end space-x-2">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Memuat...' : 'Filter'}
              </Button>
              <Button type="button" variant="light" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
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
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center px-4 py-6 text-gray-500">
                  <div className="flex justify-center items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center px-4 py-6 text-gray-500">Tidak ada data booking</td>
              </tr>
            ) : (
              bookings.map(booking => (
                <tr key={booking.id}>
                  <td className="px-4 py-2 font-medium">{booking.booking_code}</td>
                  <td className="px-4 py-2">{booking.user?.name || 'Pengguna Tidak Ditemukan'}</td>
                  <td className="px-4 py-2">
                    {booking.schedule?.route ? (
                      `${booking.schedule.route.origin} - ${booking.schedule.route.destination}`
                    ) : 'Rute Tidak Ditemukan'}
                  </td>
                  <td className="px-4 py-2">{new Date(booking.booking_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}</td>
                  <td className="px-4 py-2">{booking.passenger_count}</td>
                  <td className="px-4 py-2">{booking.vehicles?.length || 0}</td>
                  <td className="px-4 py-2">Rp {Number(booking.total_amount).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2">
                    {booking.status === 'PENDING' && <Badge type="warning">Menunggu</Badge>}
                    {booking.status === 'CONFIRMED' && <Badge type="success">Dikonfirmasi</Badge>}
                    {booking.status === 'COMPLETED' && <Badge type="info">Selesai</Badge>}
                    {booking.status === 'CANCELLED' && <Badge type="error">Dibatalkan</Badge>}
                  </td>
                  <td className="px-4 py-2">
                    <Link 
                      to={`/operator/bookings/${booking.id}`}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                    >
                      <i className="fas fa-eye mr-1"></i> Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span> hingga <span className="font-medium">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> dari <span className="font-medium">{pagination.total}</span> hasil
            </div>
            <div className="flex space-x-2">
              <Button
                variant="light"
                size="sm"
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1 || loading}
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                .filter(page => (
                  page === 1 || 
                  page === pagination.total_pages || 
                  (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)
                ))
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="flex items-center px-3 py-2 text-gray-500">...</span>
                    )}
                    <Button
                      variant={pagination.current_page === page ? 'primary' : 'light'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))
              }
              <Button
                variant="light"
                size="sm"
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.total_pages || loading}
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default BookingList;