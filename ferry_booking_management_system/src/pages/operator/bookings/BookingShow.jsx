import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faCheck, faCircle, faClock, 
  faUser, faMotorcycle, faCar, 
  faBus, faTruck 
} from '@fortawesome/free-solid-svg-icons';
import { bookingService } from '../../../services/api';

const BookingShow = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    // Fetch booking details
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await bookingService.getBooking(id);
        setBooking(response.data.booking);
        setLoading(false);
      } catch (error) {
        setError('Terjadi kesalahan saat memuat data booking.');
        setLoading(false);
        console.error('Error fetching booking details:', error);
      }
    };
    
    fetchBookingDetails();
  }, [id]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString;
  };
  
  // Format currency
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Get status class and text
  const getStatusInfo = (status) => {
    const statusMap = {
      'PENDING': { class: 'bg-yellow-100 text-yellow-800', text: 'Menunggu' },
      'CONFIRMED': { class: 'bg-green-100 text-green-800', text: 'Dikonfirmasi' },
      'COMPLETED': { class: 'bg-blue-100 text-blue-800', text: 'Selesai' },
      'CANCELLED': { class: 'bg-red-100 text-red-800', text: 'Dibatalkan' }
    };
    
    return statusMap[status] || { class: 'bg-gray-100 text-gray-800', text: status };
  };
  
  // Get vehicle type info
  const getVehicleTypeInfo = (type) => {
    const typeMap = {
      'MOTORCYCLE': { icon: faMotorcycle, class: 'bg-purple-100 text-purple-800', text: 'Motor' },
      'CAR': { icon: faCar, class: 'bg-blue-100 text-blue-800', text: 'Mobil' },
      'BUS': { icon: faBus, class: 'bg-green-100 text-green-800', text: 'Bus' },
      'TRUCK': { icon: faTruck, class: 'bg-orange-100 text-orange-800', text: 'Truk' }
    };
    
    return typeMap[type] || { icon: faCar, class: 'bg-gray-100 text-gray-800', text: type };
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded" role="alert">
        <div className="flex">
          <div className="flex-shrink-0">
            <FontAwesomeIcon icon={faCircle} className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!booking) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded" role="alert">
        <div className="flex">
          <div className="flex-shrink-0">
            <FontAwesomeIcon icon={faCircle} className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Data booking tidak ditemukan.</p>
          </div>
        </div>
      </div>
    );
  }
  
  const statusInfo = getStatusInfo(booking.status);
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Detail Booking</h1>
            <div className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.class}`}>
              {statusInfo.text}
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link 
              to="/operator/bookings" 
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
              Kembali
            </Link>
          </div>
        </div>

        {/* Flash Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-md shadow-sm" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faCheck} className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <button 
                  type="button" 
                  className="inline-flex text-green-500 focus:outline-none focus:text-green-700" 
                  onClick={() => setSuccessMessage('')}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Information Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="px-6 py-5 sm:flex sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Kode Booking: {booking.booking_code}</h2>
                <p className="mt-1 text-sm text-gray-500">Dibuat pada {formatDate(booking.created_at)}</p>
              </div>
              <div className="mt-3 sm:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.class}`}>
                  {statusInfo.text}
                </span>
              </div>
            </div>
          </div>
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
              <div>
                <dt className="text-sm font-medium text-gray-500">Tanggal Booking</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(booking.booking_date)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Tanggal Keberangkatan</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(booking.departure_date)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Jadwal</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatTime(booking.schedule?.departure_time)} - {formatTime(booking.schedule?.arrival_time)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Rute</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center">
                  <span>{booking.schedule?.route?.origin}</span>
                  <svg className="mx-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  <span>{booking.schedule?.route?.destination}</span>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Kapal</dt>
                <dd className="mt-1 text-sm text-gray-900">{booking.schedule?.ferry?.name}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Total Pembayaran</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">{formatRupiah(booking.total_amount)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* User & Payment Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* User Information */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Informasi Pengguna</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">{booking.user?.name}</h4>
                  <p className="text-sm text-gray-500">ID: {booking.user?.id}</p>
                </div>
              </div>

              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{booking.user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Telepon</dt>
                  <dd className="mt-1 text-sm text-gray-900">{booking.user?.phone || 'Tidak ada'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Payment Information */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Informasi Pembayaran</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Total Pembayaran</dt>
                  <dd className="mt-1 text-xl font-bold text-gray-900">{formatRupiah(booking.total_amount)}</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Jumlah Penumpang</dt>
                  <dd className="mt-1 text-xl font-bold text-gray-900">{booking.passenger_count || booking.tickets?.length || 0} Orang</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Jumlah Kendaraan</dt>
                  <dd className="mt-1 text-xl font-bold text-gray-900">{booking.vehicles?.length || 0} Unit</dd>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pembayaran</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {booking.payments && booking.payments.length > 0 ? (
                      booking.payments.map((payment, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.payment_code}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.payment_method}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(() => {
                              if (payment.status === 'PENDING') {
                                return (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <FontAwesomeIcon icon={faClock} className="mr-1.5 h-2 w-2 text-yellow-400" />
                                    Menunggu
                                  </span>
                                );
                              } else if (payment.status === 'SUCCESS') {
                                return (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <FontAwesomeIcon icon={faCheck} className="mr-1.5 h-2 w-2 text-green-400" />
                                    Sukses
                                  </span>
                                );
                              } else if (payment.status === 'FAILED') {
                                return (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <FontAwesomeIcon icon={faCircle} className="mr-1.5 h-2 w-2 text-red-400" />
                                    Gagal
                                  </span>
                                );
                              }
                              return (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {payment.status}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.payment_date ? formatDate(payment.payment_date) : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data pembayaran</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Details Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Detail Penumpang</h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
              Total: {booking.tickets?.length || 0}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Tiket</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {booking.tickets && booking.tickets.length > 0 ? (
                  booking.tickets.map((ticket, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-gray-900">{ticket.ticket_code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.passenger_name || ticket.passenger?.name}
                        </div>
                        <div className="text-xs text-gray-500">{ticket.passenger_id_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.passenger_id_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          if (ticket.status === 'ACTIVE') {
                            return (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FontAwesomeIcon icon={faCircle} className="mr-1.5 h-2 w-2 text-green-400" />
                                Aktif
                              </span>
                            );
                          } else if (ticket.status === 'USED') {
                            return (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <FontAwesomeIcon icon={faCircle} className="mr-1.5 h-2 w-2 text-blue-400" />
                                Digunakan
                              </span>
                            );
                          } else if (ticket.status === 'CANCELLED') {
                            return (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <FontAwesomeIcon icon={faCircle} className="mr-1.5 h-2 w-2 text-red-400" />
                                Dibatalkan
                              </span>
                            );
                          }
                          return (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {ticket.status}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.checked_in ? (
                          <div className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            <FontAwesomeIcon icon={faCheck} className="mr-1 h-3 w-3 text-green-500" />
                            <span>{ticket.boarding_time ? formatDate(ticket.boarding_time) : 'Checked-in'}</span>
                          </div>
                        ) : (
                          <Link
                            to={`/operator/bookings/check-in?ticket_code=${ticket.ticket_code}`}
                            className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ${booking.status !== 'CONFIRMED' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={(e) => {
                              if (booking.status !== 'CONFIRMED') {
                                e.preventDefault();
                              }
                            }}
                          >
                            <FontAwesomeIcon icon={faCheck} className="mr-1 h-3 w-3" />
                            Check-in
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data penumpang</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Details Section */}
        {booking.vehicles && booking.vehicles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Detail Kendaraan</h3>
              <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">
                Total: {booking.vehicles.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plat Nomor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemilik</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {booking.vehicles.map((vehicle, index) => {
                    const vehicleTypeInfo = getVehicleTypeInfo(vehicle.type);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vehicleTypeInfo.class}`}>
                            <FontAwesomeIcon icon={vehicleTypeInfo.icon} className="mr-1 h-3 w-3" />
                            {vehicleTypeInfo.text}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {vehicle.license_plate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vehicle.owner_name}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Booking History Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Riwayat Booking</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Sebelumnya</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Baru</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diubah Oleh</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {booking.bookingLogs && booking.bookingLogs.length > 0 ? (
                  booking.bookingLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const prevStatusInfo = getStatusInfo(log.previous_status);
                          return (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prevStatusInfo.class}`}>
                              {prevStatusInfo.text}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const newStatusInfo = getStatusInfo(log.new_status);
                          return (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${newStatusInfo.class}`}>
                              {newStatusInfo.text}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          if (log.changed_by_type === 'USER') {
                            return (
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <FontAwesomeIcon icon={faUser} className="mr-1 h-3 w-3 text-blue-500" />
                                Pengguna
                              </div>
                            );
                          } else if (log.changed_by_type === 'ADMIN') {
                            return (
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <FontAwesomeIcon icon={faUser} className="mr-1 h-3 w-3 text-red-500" />
                                Admin
                              </div>
                            );
                          } else if (log.changed_by_type === 'OPERATOR') {
                            return (
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <FontAwesomeIcon icon={faUser} className="mr-1 h-3 w-3 text-green-500" />
                                Operator
                              </div>
                            );
                          } else {
                            return (
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <FontAwesomeIcon icon={faCircle} className="mr-1 h-3 w-3 text-gray-500" />
                                Sistem
                              </div>
                            );
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada riwayat booking</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingShow;