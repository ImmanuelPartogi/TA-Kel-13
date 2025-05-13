import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const BookingShow = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: '',
    cancellation_reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`/api/admin-panel/bookings/${id}`);
      setBooking(response.data.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusForm({ ...statusForm, [name]: value });
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin-panel/bookings/${id}/status`, statusForm);
      fetchBooking();
      setStatusForm({ status: '', cancellation_reason: '', notes: '' });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  if (loading) return <div>Loading...</div>;
  if (!booking) return <div>Booking not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Detail Booking</h1>
        <div>
          <Link to="/admin/bookings" className="inline-flex items-center px-4 py-2 bg-gray-600 rounded-md font-semibold text-xs text-white uppercase hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </Link>
        </div>
      </div>

      {/* Booking Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Information Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Informasi Booking</h2>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="text-white hover:bg-blue-800 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                {showDropdown && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">Cetak Tiket</a>
                      <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">Kirim Email</a>
                      <div className="border-t border-gray-100"></div>
                      <a href="#" className="text-red-600 block px-4 py-2 text-sm hover:bg-gray-100">Batalkan Booking</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div className="flex">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Kode Booking:</div>
                  <div className="w-2/3 text-sm text-gray-900 font-semibold">{booking.booking_code}</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Status:</div>
                  <div className="w-2/3">
                    {booking.status === 'PENDING' && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    )}
                    {booking.status === 'CANCELLED' && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Cancelled
                      </span>
                    )}
                    {booking.status === 'COMPLETED' && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Completed
                      </span>
                    )}
                    {booking.status === 'REFUNDED' && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Refunded
                      </span>
                    )}
                    {booking.cancellation_reason && (
                      <span className="block mt-1 text-xs text-gray-500">
                        Alasan: {booking.cancellation_reason}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Dibuat Pada:</div>
                  <div className="w-2/3 text-sm text-gray-900">{formatDate(booking.created_at)}</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Metode Booking:</div>
                  <div className="w-2/3 text-sm text-gray-900">
                    {booking.booked_by === 'USER' ? 'Online oleh Pengguna' : 'Counter oleh Admin'}
                    ({booking.booking_channel})
                  </div>
                </div>
                <div className="flex col-span-full">
                  <div className="w-1/6 text-sm font-medium text-gray-500">Catatan:</div>
                  <div className="w-5/6 text-sm text-gray-900">{booking.notes || 'Tidak ada catatan'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Information Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-white">Informasi Perjalanan</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div className="flex">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Rute:</div>
                  <div className="w-2/3 text-sm text-gray-900">{booking.schedule.route.origin} - {booking.schedule.route.destination}</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Kapal:</div>
                  <div className="w-2/3 text-sm text-gray-900">{booking.schedule.ferry.name} ({booking.schedule.ferry.registration_number})</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Tanggal Keberangkatan:</div>
                  <div className="w-2/3 text-sm text-gray-900">{formatDate(booking.booking_date)}</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Jam Keberangkatan:</div>
                  <div className="w-2/3 text-sm text-gray-900">{booking.schedule.departure_time}</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Jam Kedatangan:</div>
                  <div className="w-2/3 text-sm text-gray-900">{booking.schedule.arrival_time}</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-sm font-medium text-gray-500">Durasi:</div>
                  <div className="w-2/3 text-sm text-gray-900">{booking.schedule.route.duration} menit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger List Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-white">Data Penumpang</h2>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Tiket</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Penumpang</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {booking.tickets?.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ticket.ticket_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.passenger?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.status === 'ACTIVE' && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Aktif
                          </span>
                        )}
                        {ticket.status === 'USED' && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Digunakan
                          </span>
                        )}
                        {ticket.status === 'CANCELLED' && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Dibatalkan
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.checked_in ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Sudah Check-in
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Belum Check-in
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vehicle List Card */}
          {booking.vehicle_count > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-white">Data Kendaraan</h2>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plat Nomor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {booking.vehicles?.map(vehicle => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {vehicle.type === 'MOTORCYCLE' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Motor</span>
                          )}
                          {vehicle.type === 'CAR' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Mobil</span>
                          )}
                          {vehicle.type === 'BUS' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Bus</span>
                          )}
                          {vehicle.type === 'TRUCK' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Truk</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.license_plate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.brand || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.model || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Booking History Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-white">Riwayat Booking</h2>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {booking.booking_logs?.map((log, index) => (
                    <li key={log.id}>
                      <div className="relative pb-8">
                        {index !== booking.booking_logs.length - 1 && (
                          <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        )}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-900">
                                  Status berubah dari <span className="font-semibold">{log.previous_status}</span> menjadi <span className="font-semibold">{log.new_status}</span>
                                </span>
                              </div>
                              <p className="mt-0.5 text-sm text-gray-500">
                                {formatDate(log.created_at)}
                              </p>
                            </div>
                            <div className="mt-2 text-sm text-gray-700">
                              <p>{log.notes}</p>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              Oleh: {log.changed_by_type}
                              {log.changed_by_type === 'ADMIN' && log.changed_by_admin && (
                                <span> ({log.changed_by_admin.name})</span>
                              )}
                              {log.changed_by_type === 'USER' && log.changed_by_user && (
                                <span> ({log.changed_by_user.name})</span>
                              )}
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

        <div className="space-y-6">
          {/* User Information Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-400 to-blue-500 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-white">Informasi Pengguna</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h5 className="text-lg font-semibold text-gray-900">{booking.user.name}</h5>
                <p className="text-sm text-gray-500">Member sejak {new Date(booking.user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <dl>
                  <div className="flex justify-between py-2">
                    <dt className="text-sm font-medium text-gray-500">Email:</dt>
                    <dd className="text-sm text-gray-900">{booking.user.email}</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-sm font-medium text-gray-500">Telepon:</dt>
                    <dd className="text-sm text-gray-900">{booking.user.phone || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-sm font-medium text-gray-500">Total Booking:</dt>
                    <dd className="text-sm text-gray-900">{booking.user.total_bookings || '1'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Payment Information Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-400 to-green-500 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-white">Informasi Pembayaran</h2>
            </div>
            <div className="p-6">
              {booking.payments?.length > 0 ? (
                <div className="space-y-4">
                  {booking.payments.map((payment, index) => (
                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.payment_method ?
                            `${payment.payment_method} (${payment.payment_channel})` :
                            `Pembayaran #${index + 1}`}
                        </div>
                        <div>
                          {payment.status === 'PENDING' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                          {payment.status === 'SUCCESS' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Berhasil
                            </span>
                          )}
                          {payment.status === 'FAILED' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Gagal
                            </span>
                          )}
                          {payment.status === 'REFUNDED' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Dikembalikan
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div className="text-gray-500">Jumlah:</div>
                        <div className="text-gray-900 font-medium">Rp {formatPrice(payment.amount)}</div>

                        {payment.payment_date && (
                          <>
                            <div className="text-gray-500">Tanggal Bayar:</div>
                            <div className="text-gray-900">{formatDate(payment.payment_date)}</div>
                          </>
                        )}

                        {payment.expiry_date && (
                          <>
                            <div className="text-gray-500">Kadaluarsa:</div>
                            <div className="text-gray-900">
                              {formatDate(payment.expiry_date)}
                              {new Date() > new Date(payment.expiry_date) && payment.status === 'PENDING' && (
                                <span className="inline-flex ml-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 px-1.5 py-0.5">
                                  Kadaluarsa
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Tidak ada informasi pembayaran</p>
                </div>
              )}
            </div>
          </div>

          {/* Update Status Form */}
          {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(booking.status) && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-400 to-purple-500 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-white">Update Status</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleStatusUpdate}>
                  <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                      id="status"
                      name="status"
                      value={statusForm.status}
                      onChange={handleStatusChange}
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
                      {booking.status === 'COMPLETED' && (
                        <option value="REFUNDED">Refund</option>
                      )}
                      {booking.status === 'CANCELLED' && (
                        <option value="REFUNDED">Refund</option>
                      )}
                    </select>
                  </div>
                  {statusForm.status === 'CANCELLED' && (
                    <div className="mb-4">
                      <label htmlFor="cancellation_reason" className="block text-sm font-medium text-gray-700 mb-1">Alasan Pembatalan</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                        id="cancellation_reason"
                        name="cancellation_reason"
                        value={statusForm.cancellation_reason}
                        onChange={handleStatusChange}
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
                  <div className="mb-4">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                      id="notes"
                      name="notes"
                      value={statusForm.notes}
                      onChange={handleStatusChange}
                      rows="3"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Update Status
                  </button>
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