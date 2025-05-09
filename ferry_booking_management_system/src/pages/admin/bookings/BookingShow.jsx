import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { bookingService } from '../../../services/api';

// Components
import StatusBadge from '../../../components/StatusBadge';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Alert from '../../../components/Alert';

const BookingShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statusData, setStatusData] = useState({
    status: '',
    cancellation_reason: '',
    notes: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  // Load booking data
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await bookingService.getBooking(id);
        setBooking(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError('Terjadi kesalahan saat memuat data booking');
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  // Handle status change
  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!statusData.status) {
      setError('Silakan pilih status terlebih dahulu');
      return;
    }
    
    try {
      setUpdateLoading(true);
      await bookingService.updateBookingStatus(id, statusData);
      
      // Refresh booking data
      const response = await bookingService.getBooking(id);
      setBooking(response.data);
      
      setSuccess('Status booking berhasil diperbarui');
      setStatusData({
        status: '',
        cancellation_reason: '',
        notes: ''
      });
      setUpdateLoading(false);
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Terjadi kesalahan saat memperbarui status booking');
      setUpdateLoading(false);
    }
  };

  // Go to refund page
  const handleRefund = () => {
    navigate(`/admin/refunds/create/${id}`);
  };

  // Go to reschedule page
  const handleReschedule = () => {
    navigate(`/admin/bookings/${id}/reschedule`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!booking) {
    return <Alert type="error" message="Data booking tidak ditemukan" />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detail Booking</h1>
          <p className="mt-1 text-gray-600">Kode: <span className="font-medium">{booking.booking_code}</span></p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/admin/bookings"
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors shadow-sm"
          >
            <i className="fas fa-arrow-left mr-2 text-sm"></i> Kembali
          </Link>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-check-circle text-green-500"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setSuccess(null)}
                  className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100"
                >
                  <span className="sr-only">Dismiss</span>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-500"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                >
                  <span className="sr-only">Dismiss</span>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Booking Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Informasi Booking</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Kode Booking</p>
                  <p className="font-medium">{booking.booking_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div>
                    <StatusBadge status={booking.status} />
                    {booking.cancellation_reason && (
                      <p className="mt-1 text-xs text-gray-500">Alasan: {booking.cancellation_reason}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Dibuat Pada</p>
                  <p>{format(new Date(booking.created_at), 'd MMM yyyy HH:mm', { locale: id })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Metode Booking</p>
                  <p>
                    {booking.booked_by === 'USER' ? 'Online oleh Pengguna' : 'Counter oleh Admin'} 
                    ({booking.booking_channel})
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500 mb-1">Catatan</p>
                <p>{booking.notes || 'Tidak ada catatan'}</p>
              </div>
            </div>
          </div>

          {/* Trip Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Informasi Perjalanan</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rute</p>
                  <p className="font-medium">
                    {booking.schedule.route.origin} - {booking.schedule.route.destination}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Kapal</p>
                  <p>
                    {booking.schedule.ferry.name} ({booking.schedule.ferry.registration_number})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tanggal Keberangkatan</p>
                  <p>{format(new Date(booking.booking_date), 'd MMM yyyy', { locale: id })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Jam Keberangkatan</p>
                  <p>{booking.schedule.departure_time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Jam Kedatangan</p>
                  <p>{booking.schedule.arrival_time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Durasi</p>
                  <p>{booking.schedule.route.duration} menit</p>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Data Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Data Penumpang</h2>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kode Tiket
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Penumpang
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {booking.tickets.map(ticket => (
                      <tr key={ticket.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {ticket.ticket_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {ticket.passenger?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {ticket.status === 'ACTIVE' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Aktif
                            </span>
                          )}
                          {ticket.status === 'USED' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Digunakan
                            </span>
                          )}
                          {ticket.status === 'CANCELLED' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Dibatalkan
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {ticket.checked_in ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <i className="fas fa-check-circle mr-1"></i> Sudah Check-in
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <i className="fas fa-clock mr-1"></i> Belum Check-in
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Vehicle Data Card */}
          {booking.vehicle_count > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-lg text-gray-800">Data Kendaraan</h2>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jenis
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plat Nomor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Merk
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Model
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {booking.vehicles.map(vehicle => (
                        <tr key={vehicle.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {vehicle.type === 'MOTORCYCLE' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <i className="fas fa-motorcycle mr-1"></i> Motor
                              </span>
                            )}
                            {vehicle.type === 'CAR' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <i className="fas fa-car mr-1"></i> Mobil
                              </span>
                            )}
                            {vehicle.type === 'BUS' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <i className="fas fa-bus mr-1"></i> Bus
                              </span>
                            )}
                            {vehicle.type === 'TRUCK' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <i className="fas fa-truck mr-1"></i> Truk
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {vehicle.license_plate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {vehicle.brand || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {vehicle.model || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Booking History Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Riwayat Booking</h2>
            </div>

            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {booking.booking_logs.map((log, index) => (
                    <li key={log.id}>
                      <div className="relative pb-8">
                        {index !== booking.booking_logs.length - 1 && (
                          <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        )}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <i className="fas fa-history text-white"></i>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">
                                Status berubah dari <span className="font-semibold">{log.previous_status}</span> menjadi{' '}
                                <span className="font-semibold">{log.new_status}</span>
                              </p>
                              <p className="mt-0.5 text-gray-500">{log.notes}</p>
                              <p className="mt-1 text-xs text-gray-500">
                                Oleh: {log.changed_by_type}
                                {log.changed_by_type === 'ADMIN' && log.changed_by_admin && (
                                  <span> ({log.changed_by_admin.name})</span>
                                )}
                                {log.changed_by_type === 'USER' && log.changed_by_user && (
                                  <span> ({log.changed_by_user.name})</span>
                                )}
                              </p>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              <time dateTime={log.created_at}>
                                {format(new Date(log.created_at), 'd MMM yyyy HH:mm:ss', { locale: id })}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Information */}
        <div className="space-y-6">
          {/* User Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Informasi Pengguna</h2>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <i className="fas fa-user-circle text-4xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{booking.user.name}</h3>
                <p className="text-sm text-gray-500">
                  Member sejak{' '}
                  {format(new Date(booking.user.created_at), 'MMM yyyy', { locale: id })}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-right text-gray-900">{booking.user.email}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Telepon</dt>
                    <dd className="text-sm text-right text-gray-900">{booking.user.phone || 'N/A'}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Booking</dt>
                    <dd className="text-sm text-right text-gray-900">
                      {booking.user.total_bookings || '1'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Payment Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Informasi Pembayaran</h2>
            </div>

            <div className="p-6">
              {booking.payments && booking.payments.length > 0 ? (
                <div className="space-y-4">
                  {booking.payments.map(payment => (
                    <div key={payment.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd>
                            {payment.status === 'PENDING' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <i className="fas fa-clock mr-1"></i> Pending
                              </span>
                            )}
                            {payment.status === 'SUCCESS' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <i className="fas fa-check-circle mr-1"></i> Berhasil
                              </span>
                            )}
                            {payment.status === 'FAILED' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <i className="fas fa-times-circle mr-1"></i> Gagal
                              </span>
                            )}
                            {payment.status === 'REFUNDED' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <i className="fas fa-undo mr-1"></i> Dikembalikan
                              </span>
                            )}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Jumlah</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            Rp {new Intl.NumberFormat('id-ID').format(payment.amount)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Metode</dt>
                          <dd className="text-sm text-gray-900">
                            {payment.payment_method} ({payment.payment_channel})
                          </dd>
                        </div>
                        {payment.payment_date && (
                          <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Tanggal Bayar</dt>
                            <dd className="text-sm text-gray-900">
                              {format(new Date(payment.payment_date), 'd MMM yyyy HH:mm', { locale: id })}
                            </dd>
                          </div>
                        )}
                        {payment.expiry_date && (
                          <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Kadaluarsa</dt>
                            <dd className="text-sm text-gray-900">
                              {format(new Date(payment.expiry_date), 'd MMM yyyy HH:mm', { locale: id })}
                              {new Date() > new Date(payment.expiry_date) && payment.status === 'PENDING' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 ml-1">
                                  <i className="fas fa-exclamation-circle mr-1"></i> Kadaluarsa
                                </span>
                              )}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <i className="fas fa-money-bill-wave text-gray-400"></i>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Tidak ada informasi pembayaran
                  </h3>
                  <p className="text-xs text-gray-500">
                    Belum ada transaksi pembayaran untuk booking ini
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Update Status Form Card */}
          {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(booking.status) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-lg text-gray-800">Update Status</h2>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={statusData.status}
                        onChange={handleStatusChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                      >
                        <option value="">Pilih Status</option>
                        {booking.status === 'PENDING' && (
                          <>
                            <option value="CONFIRMED">Konfirmasi</option>
                            <option value="CANCELLED">Batalkan</option>
                          </>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <>
                            <option value="COMPLETED">Selesai</option>
                            <option value="CANCELLED">Batalkan</option>
                          </>
                        )}
                        {booking.status === 'COMPLETED' && <option value="REFUNDED">Refund</option>}
                        {booking.status === 'CANCELLED' && <option value="REFUNDED">Refund</option>}
                      </select>
                    </div>

                    {statusData.status === 'CANCELLED' && (
                      <div>
                        <label htmlFor="cancellation_reason" className="block text-sm font-medium text-gray-700 mb-1">
                          Alasan Pembatalan
                        </label>
                        <select
                          id="cancellation_reason"
                          name="cancellation_reason"
                          value={statusData.cancellation_reason}
                          onChange={handleStatusChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        >
                          <option value="">Pilih Alasan</option>
                          <option value="CUSTOMER_REQUEST">Permintaan Pelanggan</option>
                          <option value="SYSTEM_ISSUE">Masalah Sistem</option>
                          <option value="FERRY_ISSUE">Masalah Kapal</option>
                          <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                          <option value="PAYMENT_TIMEOUT">Timeout Pembayaran</option>
                          <option value="OTHER">Lainnya</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows="3"
                        value={statusData.notes}
                        onChange={handleStatusChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      ></textarea>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {updateLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i> Memproses...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save mr-2"></i> Update Status
                          </>
                        )}
                      </button>

                      {/* Tombol Refund dan Reschedule */}
                      {['CONFIRMED', 'COMPLETED'].includes(booking.status) && (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={handleRefund}
                            className="inline-flex justify-center items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-md shadow-sm"
                          >
                            <i className="fas fa-hand-holding-usd mr-2"></i> Refund
                          </button>

                          {booking.status === 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={handleReschedule}
                              className="inline-flex justify-center items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md shadow-sm"
                            >
                              <i className="fas fa-calendar-alt mr-2"></i> Reschedule
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingShow;