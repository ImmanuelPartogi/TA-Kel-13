// src/pages/admin/bookings/BookingShow.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../../services/api';

const BookingShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setShowStatusUpdate] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/admin-panel/bookings/${id}`);
      setBooking(response.data.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);

    try {
      const response = await api.put(`/admin-panel/bookings/${id}/status`, {
        status: selectedStatus,
        cancellation_reason: cancellationReason,
        notes: statusNotes
      });

      if (response.data.success) {
        setSuccessMessage('Status berhasil diperbarui');
        fetchBooking();
        setShowStatusUpdate(false);
        setSelectedStatus('');
        setCancellationReason('');
        setStatusNotes('');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(Object.values(error.response.data.errors).flat());
      } else {
        setErrors(['Terjadi kesalahan saat update status']);
      }
    } finally {
      setSubmitting(false);
    }
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

  const getVehicleTypeBadge = (type) => {
    const badges = {
      'MOTORCYCLE': 'bg-blue-100 text-blue-800',
      'CAR': 'bg-green-100 text-green-800',
      'BUS': 'bg-yellow-100 text-yellow-800',
      'TRUCK': 'bg-red-100 text-red-800'
    };

    const icons = {
      'MOTORCYCLE': 'fa-motorcycle',
      'CAR': 'fa-car',
      'BUS': 'fa-bus',
      'TRUCK': 'fa-truck'
    };

    const labels = {
      'MOTORCYCLE': 'Motor',
      'CAR': 'Mobil',
      'BUS': 'Bus',
      'TRUCK': 'Truk'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[type]}`}>
        <i className={`fas ${icons[type]} mr-1`}></i> {labels[type]}
      </span>
    );
  };

  const getTicketStatusBadge = (status) => {
    const badges = {
      'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
      'USED': 'bg-blue-100 text-blue-800 border-blue-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200'
    };


    const labels = {
      'ACTIVE': 'Aktif',
      'USED': 'Digunakan',
      'CANCELLED': 'Dibatalkan'
    };

    const indicators = {
      'ACTIVE': 'bg-green-500',
      'USED': 'bg-blue-500',
      'CANCELLED': 'bg-red-500'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badges[status]} border`}>
        <span className={`w-1.5 h-1.5 ${indicators[status]} rounded-full mr-1.5`}></span>
        {labels[status]}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'SUCCESS': 'bg-green-100 text-green-800 border-green-200',
      'FAILED': 'bg-red-100 text-red-800 border-red-200',
      'REFUNDED': 'bg-gray-100 text-gray-800 border-gray-200'
    };


    const labels = {
      'PENDING': 'Pending',
      'SUCCESS': 'Berhasil',
      'FAILED': 'Gagal',
      'REFUNDED': 'Dikembalikan'
    };

    const indicators = {
      'PENDING': 'bg-yellow-500',
      'SUCCESS': 'bg-green-500',
      'FAILED': 'bg-red-500',
      'REFUNDED': 'bg-gray-500'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badges[status]} border`}>
        <span className={`w-1.5 h-1.5 ${indicators[status]} rounded-full mr-1.5 ${status === 'PENDING' ? 'animate-pulse' : ''}`}></span>
        {labels[status]}
      </span>
    );
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

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white rounded-xl border border-gray-100 shadow-md p-8 text-center">
          <div className="inline-block relative">
            <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="mt-4 text-gray-600">Memuat data booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-md p-8 text-center max-w-md w-full">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-red-400 text-4xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Booking Tidak Ditemukan</h3>
          <p className="text-gray-600 mb-6">Booking yang Anda cari tidak dapat ditemukan atau telah dihapus</p>
          <button
            onClick={() => navigate('/admin/bookings')}
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm"
          >
            <i className="fas fa-arrow-left mr-2"></i> Kembali ke Daftar Booking
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = booking ? getStatusConfig(booking.status) : getStatusConfig('');

  return (
    <div className="bg-gray-50 min-h-screen">
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
                <h1 className="text-3xl font-bold">Detail Booking</h1>
                <p className="mt-1 text-blue-100">Kode: <span className="font-medium">{booking.booking_code}</span></p>
              </div>
            </div>
            
            <div>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm"
              >
                <i className="fas fa-arrow-left mr-2"></i> Kembali
              </button>
            </div>
          </div>
          
          {/* Quick Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Status Booking</p>
              <div className="flex items-center mt-1">
                <i className={`fas ${statusConfig.icon} mr-2 text-blue-100`}></i>
                <span className="text-2xl font-bold">{statusConfig.label}</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Tanggal Booking</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-calendar-alt mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{formatDate(booking.created_at)}</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Total Penumpang</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-users mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{booking.passenger_count || 0}</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Total Pembayaran</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-money-bill-wave mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{formatCurrency(booking.total_amount || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Alert Messages with modern styling */}
        {successMessage && (
          <div className="mb-6 rounded-lg shadow-lg overflow-hidden animate-slideIn">
            <div className="bg-emerald-500 px-4 py-2 text-white flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-check-circle mr-2"></i>
                <span className="font-medium">Sukses</span>
              </div>
              <button onClick={() => setSuccessMessage('')} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="bg-emerald-50 border-emerald-100 text-emerald-700 px-4 py-3 border-t">
              {successMessage}
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="mb-6 rounded-lg shadow-lg overflow-hidden animate-slideIn">
            <div className="bg-red-500 px-4 py-2 text-white flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                <span className="font-medium">Error</span>
              </div>
              <button onClick={() => setErrors([])} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="bg-red-50 border-red-100 text-red-700 px-4 py-3 border-t">
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-lg text-gray-800 flex items-center">
                  <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                  Informasi Booking
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Kode Booking</p>
                    <p className="font-medium text-blue-600">{booking.booking_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                        <span className={`w-1.5 h-1.5 ${statusConfig.indicator} rounded-full mr-1.5 ${booking.status === 'PENDING' ? 'animate-pulse' : ''}`}></span>
                        {statusConfig.label}
                      </span>
                      {booking.status === 'CANCELLED' && booking.cancellation_reason && (
                        <p className="mt-1 text-xs text-gray-500">Alasan: {booking.cancellation_reason}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Dibuat Pada</p>
                    <p className="font-medium">{formatDate(booking.created_at, true)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Metode Booking</p>
                    <div className="flex items-center">
                      <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">
                        {booking.booked_by === 'USER' ? 
                          <><i className="fas fa-user mr-1"></i> Online oleh Pengguna</> : 
                          <><i className="fas fa-store mr-1"></i> Counter oleh Admin</>
                        }
                      </span>
                      <span className="ml-2 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">
                        {booking.booking_channel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500 mb-1">Catatan</p>
                  <p className="bg-gray-50 p-3 rounded-lg border border-gray-100">{booking.notes || 'Tidak ada catatan'}</p>
                </div>
              </div>
            </div>

            {/* Trip Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-lg text-gray-800 flex items-center">
                  <i className="fas fa-route text-blue-500 mr-2"></i>
                  Informasi Perjalanan
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Rute</p>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{booking.schedule?.route?.origin || 'N/A'}</span>
                      <i className="fas fa-long-arrow-alt-right mx-2 text-gray-400"></i>
                      <span className="font-medium text-gray-900">{booking.schedule?.route?.destination || 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Kapal</p>
                    <p className="font-medium flex items-center">
                      <i className="fas fa-ship mr-2 text-gray-400"></i>
                      <span>{booking.schedule?.ferry?.name || 'N/A'}</span>
                      {booking.schedule?.ferry?.registration_number && (
                        <span className="ml-2 text-xs text-gray-500">({booking.schedule.ferry.registration_number})</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tanggal Keberangkatan</p>
                    <p className="font-medium flex items-center">
                      <i className="fas fa-calendar-day mr-2 text-gray-400"></i>
                      <span>{formatDate(booking.booking_date)}</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Jam Keberangkatan</p>
                    <p className="font-medium flex items-center">
                      <i className="fas fa-clock mr-2 text-gray-400"></i>
                      <span>
                        {booking.schedule?.departure_time ? 
                          new Intl.DateTimeFormat('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          }).format(new Date(booking.schedule.departure_time)) : 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Jam Kedatangan</p>
                    <p className="font-medium flex items-center">
                      <i className="fas fa-clock mr-2 text-gray-400"></i>
                      <span>
                        {booking.schedule?.arrival_time ? 
                          new Intl.DateTimeFormat('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          }).format(new Date(booking.schedule.arrival_time)) : 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Durasi</p>
                    <p className="font-medium flex items-center">
                      <i className="fas fa-hourglass-half mr-2 text-gray-400"></i>
                      <span>{booking.schedule?.route?.duration || 'N/A'} menit</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Data Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-lg text-gray-800 flex items-center">
                  <i className="fas fa-users text-blue-500 mr-2"></i>
                  Data Penumpang
                </h2>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kode Tiket
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama Penumpang
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-in
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {booking.tickets?.map(ticket => (
                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            {ticket.ticket_code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {ticket.passenger?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getTicketStatusBadge(ticket.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {ticket.checked_in ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                Sudah Check-in
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5 animate-pulse"></span>
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
            </div>

            {/* Vehicle Data Card */}
            {booking.vehicle_count > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-semibold text-lg text-gray-800 flex items-center">
                    <i className="fas fa-car text-blue-500 mr-2"></i>
                    Data Kendaraan
                  </h2>
                </div>

                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jenis
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Plat Nomor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Merk
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Model
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {booking.vehicles?.map((vehicle, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getVehicleTypeBadge(vehicle.type)}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-lg text-gray-800 flex items-center">
                  <i className="fas fa-history text-blue-500 mr-2"></i>
                  Riwayat Booking
                </h2>
              </div>

              <div className="p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {booking.booking_logs?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((log, index) => (
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
                                  Status berubah dari <span className="font-semibold">{log.previous_status}</span>
                                  {' '}menjadi <span className="font-semibold">{log.new_status}</span>
                                </p>
                                <p className="mt-0.5 text-gray-500">
                                  {log.notes}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  Oleh: {log.changed_by_type}
                                  {log.changed_by_type === 'ADMIN' && log.changed_by_admin && (
                                    <> ({log.changed_by_admin.name})</>
                                  )}
                                  {log.changed_by_type === 'USER' && log.changed_by_user && (
                                    <> ({log.changed_by_user.name})</>
                                  )}
                                </p>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                <time dateTime={log.created_at}>
                                  {formatDate(log.created_at, true)}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-lg text-gray-800 flex items-center">
                  <i className="fas fa-user text-blue-500 mr-2"></i>
                  Informasi Pengguna
                </h2>
              </div>

              <div className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <i className="fas fa-user-circle text-4xl text-blue-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{booking.user?.name || 'N/A'}</h3>
                  <p className="text-sm text-gray-500">
                    Member sejak {booking.user ? formatDate(booking.user.created_at, false) : 'N/A'}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-right text-gray-900">{booking.user?.email || 'N/A'}</dd>
                    </div>
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Telepon</dt>
                      <dd className="text-sm text-right text-gray-900">{booking.user?.phone || 'N/A'}</dd>
                    </div>
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Total Booking</dt>
                      <dd className="text-sm text-right text-gray-900">{booking.user?.total_bookings || '1'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Payment Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-lg text-gray-800 flex items-center">
                  <i className="fas fa-money-bill-wave text-blue-500 mr-2"></i>
                  Informasi Pembayaran
                </h2>
              </div>

              <div className="p-6">
                {booking.payments && booking.payments.length > 0 ? (
                  <div className="space-y-4">
                    {booking.payments.map((payment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow duration-300">
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd>{getPaymentStatusBadge(payment.status)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Jumlah</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {formatCurrency(payment.amount || 0)}
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
                                {formatDate(payment.payment_date, true)}
                              </dd>
                            </div>
                          )}
                          {payment.expiry_date && (
                            <div className="flex justify-between">
                              <dt className="text-sm font-medium text-gray-500">Kadaluarsa</dt>
                              <dd className="text-sm text-gray-900">
                                {formatDate(payment.expiry_date, true)}
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
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Tidak ada informasi pembayaran</h3>
                    <p className="text-xs text-gray-500">Belum ada transaksi pembayaran untuk booking ini</p>
                  </div>
                )}
              </div>
            </div>

            {/* Update Status Form Card */}
            {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(booking.status) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-semibold text-lg text-gray-800 flex items-center">
                    <i className="fas fa-edit text-blue-500 mr-2"></i>
                    Update Status
                  </h2>
                </div>

                <div className="p-6">
                  <form onSubmit={handleStatusUpdate}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                          Status <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-toggle-on text-gray-400"></i>
                          </div>
                          <select
                            id="status"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                      </div>

                      {selectedStatus === 'CANCELLED' && (
                        <div>
                          <label htmlFor="cancellation_reason" className="block text-sm font-medium text-gray-700 mb-1">
                            Alasan Pembatalan <span className="text-red-500">*</span>
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-question-circle text-gray-400"></i>
                            </div>
                            <select
                              id="cancellation_reason"
                              value={cancellationReason}
                              onChange={(e) => setCancellationReason(e.target.value)}
                              className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                              required
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
                        </div>
                      )}

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                          Catatan
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                            <i className="fas fa-sticky-note text-gray-400"></i>
                          </div>
                          <textarea
                            id="notes"
                            rows="3"
                            value={statusNotes}
                            onChange={(e) => setStatusNotes(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors"
                        >
                          {submitting ? (
                            <><i className="fas fa-spinner fa-spin mr-2"></i> Memproses...</>
                          ) : (
                            <><i className="fas fa-save mr-2"></i> Update Status</>
                          )}
                        </button>

                        {/* Tombol Refund dan Reschedule */}
                        {['CONFIRMED', 'COMPLETED'].includes(booking.status) && (
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/refunds/create/${booking.id}`)}
                              className="inline-flex justify-center items-center px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                            >
                              <i className="fas fa-hand-holding-usd mr-2"></i> Refund
                            </button>

                            {booking.status === 'CONFIRMED' && (
                              <button
                                type="button"
                                onClick={() => navigate(`/admin/bookings/${booking.id}/reschedule`)}
                                className="inline-flex justify-center items-center px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors"
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

export default BookingShow;