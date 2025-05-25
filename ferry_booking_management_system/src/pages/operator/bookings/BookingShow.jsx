import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { operatorBookingsService } from '../../../services/operatorBookings.service';
import Swal from 'sweetalert2';

const BookingShow = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const response = await operatorBookingsService.getById(id);
      setBooking(response.data.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat detail booking',
        customClass: {
          popup: 'animate-fade-in rounded-xl'
        }
      });
    }
    setLoading(false);
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

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': {
        class: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300',
        icon: '⏳',
        text: 'Menunggu'
      },
      'SUCCESS': {
        class: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
        icon: '✅',
        text: 'Sukses'
      },
      'FAILED': {
        class: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300',
        icon: '❌',
        text: 'Gagal'
      }
    };

    const config = statusConfig[status] || statusConfig['PENDING'];

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-md ${config.class}`}>
        <span className="mr-1.5">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const getVehicleTypeBadge = (type) => {
    const vehicleTypes = {
      'MOTORCYCLE': { label: 'Motor', class: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300', icon: '🏍️' },
      'CAR': { label: 'Mobil', class: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300', icon: '🚗' },
      'BUS': { label: 'Bus', class: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300', icon: '🚌' },
      'TRUCK': { label: 'Truk', class: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300', icon: '🚚' },
    };

    const vehicle = vehicleTypes[type] || { label: type, class: 'bg-slate-100 text-slate-800', icon: '🚙' };

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-md ${vehicle.class}`}>
        <span className="mr-1.5">{vehicle.icon}</span>
        {vehicle.label}
      </div>
    );
  };

  const getTicketStatusBadge = (status) => {
    const statusConfig = {
      'ACTIVE': { class: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300', icon: '✓' },
      'USED': { class: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300', icon: '✓' },
      'CANCELLED': { class: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300', icon: '✗' },
    };

    const config = statusConfig[status] || { class: 'bg-slate-100 text-slate-800 border-slate-300', icon: '-' };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-md ${config.class}`}>
        {status === 'ACTIVE' ? '✅ Aktif' : status === 'USED' ? '✔️ Digunakan' : '❌ Dibatalkan'}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            <div className="animate-ping absolute top-0 left-0 rounded-full h-16 w-16 border-2 border-blue-600 opacity-30"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Memuat detail booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="bg-red-100 rounded-full mx-auto h-20 w-20 flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking tidak ditemukan</h2>
          <p className="text-gray-600 mb-8">Maaf, data booking yang Anda cari tidak tersedia atau telah dihapus.</p>
          <Link 
            to="/operator/bookings" 
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Daftar Booking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header with Graphic Banner */}
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
                  <div className="flex items-center">
                    <h1 className="text-3xl font-bold">Detail Booking</h1>
                    <div className={`ml-3 px-4 py-2 rounded-full text-sm font-semibold border shadow-md ${getStatusBadgeClass(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </div>
                  </div>
                  <p className="mt-1 text-blue-100">Kode Booking: {booking.booking_code}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Link
                  to="/operator/bookings"
                  className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali
                </Link>
                <button className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Cetak
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Information Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8 transform hover:scale-[1.01] transition-transform duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Kode Booking: {booking.booking_code}</h2>
                <p className="mt-1 text-sm text-blue-100">
                  Dibuat pada {new Date(booking.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="mt-3 sm:mt-0">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border shadow-md ${getStatusBadgeClass(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
            </div>
          </div>
          <div className="px-6 py-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 hover:bg-slate-100 hover:shadow-md transition-all duration-200">
                <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Tanggal Booking</dt>
                <dd className="mt-2 text-base font-medium text-slate-900">
                  {new Date(booking.booking_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </dd>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 hover:bg-slate-100 hover:shadow-md transition-all duration-200">
                <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Tanggal Keberangkatan</dt>
                <dd className="mt-2 text-base font-medium text-slate-900">
                  {new Date(booking.departure_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </dd>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 hover:bg-slate-100 hover:shadow-md transition-all duration-200">
                <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Jadwal</dt>
                <dd className="mt-2 text-base font-medium text-slate-900">
                  {booking.schedule.departure_time} - {booking.schedule.arrival_time}
                </dd>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 hover:bg-slate-100 hover:shadow-md transition-all duration-200">
                <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Rute</dt>
                <dd className="mt-2 text-base font-medium text-slate-900 flex items-center">
                  <span>{booking.schedule.route.origin}</span>
                  <svg className="mx-3 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span>{booking.schedule.route.destination}</span>
                </dd>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 hover:bg-slate-100 hover:shadow-md transition-all duration-200">
                <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Kapal</dt>
                <dd className="mt-2 text-base font-medium text-slate-900">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {booking.schedule.ferry.name}
                  </div>
                </dd>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200 shadow-md">
                <dt className="text-sm font-semibold text-blue-900 uppercase tracking-wider">Total Pembayaran</dt>
                <dd className="mt-2 text-2xl font-bold text-blue-900">
                  {formatCurrency(booking.total_amount)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* User & Payment Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User Information */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informasi Pengguna
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-bold text-gray-900">{booking.user.name}</h4>
                  <p className="text-sm text-gray-500">ID: {booking.user.id}</p>
                </div>
              </div>

              <dl className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 hover:shadow-md transition-all duration-200">
                  <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{booking.user.email}</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 hover:shadow-md transition-all duration-200">
                  <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Telepon</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{booking.user.phone || 'Tidak ada'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Payment Information */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informasi Pembayaran
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 text-center hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <dt className="text-xs font-semibold text-green-800 uppercase tracking-wider">Total Pembayaran</dt>
                  <dd className="mt-2 text-2xl font-bold text-green-900">
                    {formatCurrency(booking.total_amount)}
                  </dd>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 text-center hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <dt className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Jumlah Penumpang</dt>
                  <dd className="mt-2 text-2xl font-bold text-blue-900">{booking.passenger_count} Orang</dd>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 text-center hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <dt className="text-xs font-semibold text-purple-800 uppercase tracking-wider">Jumlah Kendaraan</dt>
                  <dd className="mt-2 text-2xl font-bold text-purple-900">{booking.vehicles?.length || 0} Unit</dd>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        ID Pembayaran
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Metode
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tanggal Pembayaran
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {booking.payments && booking.payments.length > 0 ? (
                      booking.payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                            {payment.payment_code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                            {payment.payment_method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getPaymentStatusBadge(payment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {payment.payment_date 
                              ? new Date(payment.payment_date).toLocaleString('id-ID')
                              : '-'
                            }
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-gray-600">Tidak ada data pembayaran</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Details Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Detail Penumpang
            </h3>
            <span className="bg-white bg-opacity-20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-md">
              Total: {booking.tickets?.length || 0}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    No.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Kode Tiket
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    No. ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {booking.tickets && booking.tickets.length > 0 ? (
                  booking.tickets.map((ticket, index) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-mono font-bold text-indigo-600">{ticket.ticket_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{ticket.passenger_name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{ticket.passenger_id_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                        {ticket.passenger_id_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTicketStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.checked_in ? (
                          <div className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-md">
                            <svg className="mr-1.5 h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{new Date(ticket.boarding_time).toLocaleString('id-ID', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ) : (
                          <Link
                            to={`/operator/bookings/check-in?ticket_code=${ticket.ticket_code}`}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 ${
                              booking.status !== 'CONFIRMED' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                            }`}
                            disabled={booking.status !== 'CONFIRMED'}
                          >
                            <svg className="mr-1.5 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Check-in
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <p className="text-gray-600">Tidak ada data penumpang</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Details Section */}
        {booking.vehicles && booking.vehicles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8 hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Detail Kendaraan
              </h3>
              <span className="bg-white bg-opacity-20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-md">
                Total: {booking.vehicles.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      No.
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tipe
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Plat Nomor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Pemilik
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {booking.vehicles.map((vehicle, index) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getVehicleTypeBadge(vehicle.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-mono font-bold text-blue-600">{vehicle.license_plate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                        {vehicle.owner_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Booking History Section */}
        {booking.booking_logs && booking.booking_logs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Riwayat Booking
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status Sebelumnya
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status Baru
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Diubah Oleh
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Catatan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {booking.booking_logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-md ${getStatusBadgeClass(log.previous_status)}`}>
                          {getStatusText(log.previous_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-md ${getStatusBadgeClass(log.new_status)}`}>
                          {getStatusText(log.new_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border border-slate-300 shadow-md">
                          {log.changed_by_type === 'USER' && (
                            <>
                              <svg className="mr-1.5 h-3 w-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Pengguna
                            </>
                          )}
                          {log.changed_by_type === 'ADMIN' && (
                            <>
                              <svg className="mr-1.5 h-3 w-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              Admin
                            </>
                          )}
                          {log.changed_by_type === 'OPERATOR' && (
                            <>
                              <svg className="mr-1.5 h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Operator
                            </>
                          )}
                          {log.changed_by_type !== 'USER' && log.changed_by_type !== 'ADMIN' && log.changed_by_type !== 'OPERATOR' && (
                            <>
                              <svg className="mr-1.5 h-3 w-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Sistem
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CSS for animations */}
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
        `}</style>
      </div>
    </div>
  );
};

export default BookingShow;