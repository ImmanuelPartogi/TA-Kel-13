// src/pages/operator/bookings/BookingShow.jsx
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
          popup: 'animate-fade-in'
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
    return badgeClasses[status] || 'bg-gray-100 text-gray-800 border-gray-300';
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${config.class}`}>
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

    const vehicle = vehicleTypes[type] || { label: type, class: 'bg-gray-100 text-gray-800', icon: '🚙' };

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${vehicle.class}`}>
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

    const config = statusConfig[status] || { class: 'bg-gray-100 text-gray-800 border-gray-300', icon: '-' };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${config.class}`}>
        {status === 'ACTIVE' ? '✅ Aktif' : status === 'USED' ? '✔️ Digunakan' : '❌ Dibatalkan'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <div className="animate-ping absolute top-0 left-0 rounded-full h-16 w-16 border-2 border-blue-600 opacity-30"></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking tidak ditemukan</h2>
          <p className="text-gray-500 mb-4">Maaf, data booking yang Anda cari tidak tersedia.</p>
          <Link to="/operator/bookings" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Detail Booking</h1>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold border shadow-sm ${getStatusBadgeClass(booking.status)}`}>
              {getStatusText(booking.status)}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/operator/bookings"
              className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
            </Link>
            <button className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-sm text-sm font-medium hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 2l3 3-3 3M16 2l-3 3 3 3M13 20v-6M9 20v-6M5 9h14" />
              </svg>
              Cetak
            </button>
          </div>
        </div>

        {/* Booking Information Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 mb-8 transform hover:scale-[1.01] transition-transform duration-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Kode Booking: {booking.booking_code}</h2>
                <p className="mt-1 text-sm text-blue-100">
                  Dibuat pada {new Date(booking.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="mt-3 sm:mt-0">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border shadow-sm ${getStatusBadgeClass(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
            </div>
          </div>
          <div className="px-6 py-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Tanggal Booking</dt>
                <dd className="mt-2 text-base font-medium text-gray-900">
                  {new Date(booking.booking_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </dd>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Tanggal Keberangkatan</dt>
                <dd className="mt-2 text-base font-medium text-gray-900">
                  {new Date(booking.departure_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </dd>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Jadwal</dt>
                <dd className="mt-2 text-base font-medium text-gray-900">
                  {booking.schedule.departure_time} - {booking.schedule.arrival_time}
                </dd>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Rute</dt>
                <dd className="mt-2 text-base font-medium text-gray-900 flex items-center">
                  <span>{booking.schedule.route.origin}</span>
                  <svg className="mx-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <span>{booking.schedule.route.destination}</span>
                </dd>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Kapal</dt>
                <dd className="mt-2 text-base font-medium text-gray-900">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" />
                    </svg>
                    {booking.schedule.ferry.name}
                  </div>
                </dd>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200">
                <dt className="text-sm font-semibold text-blue-900 uppercase tracking-wider">Total Pembayaran</dt>
                <dd className="mt-2 text-2xl font-bold text-blue-900">
                  Rp {booking.total_amount.toLocaleString('id-ID')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* User & Payment Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User Information */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow duration-200">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
              <h3 className="text-lg font-bold text-white">Informasi Pengguna</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 flex items-center justify-center shadow-lg">
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
                <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200">
                  <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{booking.user.email}</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200">
                  <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Telepon</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{booking.user.phone || 'Tidak ada'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Payment Information */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow duration-200">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h3 className="text-lg font-bold text-white">Informasi Pembayaran</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 text-center hover:scale-105 transition-transform duration-200">
                  <dt className="text-xs font-semibold text-green-700 uppercase tracking-wider">Total Pembayaran</dt>
                  <dd className="mt-2 text-2xl font-bold text-green-900">
                    Rp {booking.total_amount.toLocaleString('id-ID')}
                  </dd>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 text-center hover:scale-105 transition-transform duration-200">
                  <dt className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Jumlah Penumpang</dt>
                  <dd className="mt-2 text-2xl font-bold text-blue-900">{booking.passenger_count} Orang</dd>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 text-center hover:scale-105 transition-transform duration-200">
                  <dt className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Jumlah Kendaraan</dt>
                  <dd className="mt-2 text-2xl font-bold text-purple-900">{booking.vehicles?.length || 0} Unit</dd>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ID Pembayaran
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Metode
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                          Tidak ada data pembayaran
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
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 mb-8 hover:shadow-2xl transition-shadow duration-200">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Detail Penumpang</h3>
            <span className="bg-white bg-opacity-20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
              Total: {booking.tickets?.length || 0}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    No.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Kode Tiket
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Nama
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    No. ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                        <div className="text-sm font-mono font-bold text-gray-900">{ticket.ticket_code}</div>
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
                          <div className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
                            <svg className="mr-1.5 h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{new Date(ticket.boarding_time).toLocaleString('id-ID', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ) : (
                          <Link
                            to={`/operator/bookings/check-in?ticket_code=${ticket.ticket_code}`}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 ${
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
                      Tidak ada data penumpang
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Details Section */}
        {booking.vehicles && booking.vehicles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 mb-8 hover:shadow-2xl transition-shadow duration-200">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Detail Kendaraan</h3>
              <span className="bg-white bg-opacity-20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                Total: {booking.vehicles.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      No.
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tipe
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Plat Nomor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-900">
                        {vehicle.license_plate}
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
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow duration-200">
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4">
              <h3 className="text-lg font-bold text-white">Riwayat Booking</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status Sebelumnya
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status Baru
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Diubah Oleh
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${getStatusBadgeClass(log.previous_status)}`}>
                          {getStatusText(log.previous_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${getStatusBadgeClass(log.new_status)}`}>
                          {getStatusText(log.new_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm">
                          {log.changed_by_type === 'USER' && (
                            <>
                              <svg className="mr-1.5 h-3 w-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Pengguna
                            </>
                          )}
                          {log.changed_by_type === 'ADMIN' && (
                            <>
                              <svg className="mr-1.5 h-3 w-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              Admin
                            </>
                          )}
                          {log.changed_by_type === 'OPERATOR' && (
                            <>
                              <svg className="mr-1.5 h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>
    </div>
  );
};

export default BookingShow;