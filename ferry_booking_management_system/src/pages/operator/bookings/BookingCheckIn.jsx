import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { operatorBookingsService } from '../../../services/operatorBookings.service';
import Swal from 'sweetalert2';

const BookingCheckIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('ticket_code') || '');
  const [searchType, setSearchType] = useState('ticket_code');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch recent activity on component mount
  useEffect(() => {
    fetchRecentActivity();
    
    // If ticket_code is provided in URL, perform search automatically
    if (searchParams.get('ticket_code')) {
      handleSearch({ preventDefault: () => { } });
    }
  }, []);

  // Fetch recent check-ins from API
  const fetchRecentActivity = async () => {
    try {
      const response = await operatorBookingsService.checkIn.getRecentActivity();
      if (response.data?.status === 'success' && response.data?.data?.recent_check_ins) {
        setRecentActivity(response.data.data.recent_check_ins.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  // Handle search based on different parameters
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Input Kosong',
        text: 'Silakan masukkan kode tiket, nama penumpang, atau ID penumpang',
        customClass: {
          popup: 'animate__animated animate__fadeInUp rounded-xl'
        }
      });
      return;
    }

    setLoading(true);
    setError('');
    setTicket(null);

    try {
      const response = await operatorBookingsService.checkIn.validate({
        [searchType]: searchTerm
      });

      if (response.data?.status === 'success' && response.data?.data?.ticket) {
        setTicket(response.data.data.ticket);
      } else {
        setError('Data tiket tidak ditemukan atau tidak valid');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Terjadi kesalahan saat mencari tiket';
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'Pencarian Gagal',
        text: errorMessage,
        customClass: {
          popup: 'animate__animated animate__fadeInUp rounded-xl'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle check-in process
  const handleCheckIn = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi Check-in',
      text: 'Apakah Anda yakin ingin melakukan check-in untuk penumpang ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Check-in',
      cancelButtonText: 'Batal',
      focusConfirm: false,
      customClass: {
        popup: 'animate__animated animate__fadeInUp rounded-xl',
        confirmButton: 'px-4 py-2 rounded-lg font-medium',
        cancelButton: 'px-4 py-2 rounded-lg font-medium'
      }
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const checkInData = {
          ticket_code: ticket.ticket_code,
          location: 'Pelabuhan Utama'
        };

        const response = await operatorBookingsService.checkIn.process(checkInData);
        
        if (response.data?.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Check-in Berhasil!',
            text: response.data.message || 'Check-in berhasil dilakukan',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            customClass: {
              popup: 'animate__animated animate__fadeInUp rounded-xl'
            }
          });

          // Update ticket status in UI
          if (response.data?.data?.ticket) {
            setTicket(response.data.data.ticket);
          } else {
            // Fallback if API doesn't return updated ticket
            setTicket({
              ...ticket,
              checked_in: true,
              boarding_time: new Date().toISOString()
            });
          }

          // Refresh recent activity
          fetchRecentActivity();
        } else {
          throw new Error(response.data?.message || 'Terjadi kesalahan');
        }
      } catch (error) {
        console.error('Check-in error:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Check-in Gagal',
          text: error.response?.data?.message || 'Terjadi kesalahan saat check-in',
          customClass: {
            popup: 'animate__animated animate__fadeInUp rounded-xl'
          }
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Format time function
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const options = { hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleTimeString('id-ID', options);
    } catch (error) {
      console.error('Error formatting time:', error);
      return dateString;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Check-in Penumpang</h1>
                  <p className="mt-1 text-blue-100">Verifikasi kehadiran penumpang dan tiket keberangkatan</p>
                </div>
              </div>

              <div>
                <button
                  onClick={() => navigate('/operator/bookings')}
                  className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali ke Daftar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Search Panel */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Form */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-6 border-b border-gray-200">
              <form onSubmit={handleSearch} className="space-y-5">
                <div>
                  <label htmlFor="search_term" className="block text-sm font-semibold text-gray-700 mb-2">
                    Cari Penumpang
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="search_term"
                      id="search_term"
                      className="block w-full pl-12 pr-32 py-4 text-base border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Masukkan kode tiket, nama, atau ID penumpang"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      {/* Search Type Selection */}
                      <div className="mr-1">
                        <select
                          className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 rounded-r-md sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                          value={searchType}
                          onChange={(e) => setSearchType(e.target.value)}
                        >
                          <option value="ticket_code">Kode Tiket</option>
                          <option value="passenger_name">Nama</option>
                          <option value="passenger_id">ID Penumpang</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-10 mr-2 disabled:from-slate-400 disabled:to-slate-500 transition-all duration-200 hover:shadow-lg"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Mencari...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Cari
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex mt-3 space-x-2 text-sm text-gray-500">
                    <span className="inline-flex items-center">
                      <svg className="h-4 w-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Format: TKT-XXXXX (tiket), FBS-XXXXX (booking), atau nama penumpang</span>
                    </span>
                  </div>
                </div>
              </form>
            </div>

            {/* Ticket Details */}
            {ticket ? (
              <div className="px-6 py-6 animate__animated animate__fadeIn">
                <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Detail Tiket
                </h3>

                {/* Boarding Pass */}
                <div className="mb-6 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-lg relative">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-4 text-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xl font-bold">Boarding Pass</h4>
                        <p className="text-blue-100">Ferry Booking System</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                          {ticket.booking.schedule.route.origin} → {ticket.booking.schedule.route.destination}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-b border-dashed border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Penumpang</p>
                        <p className="text-lg font-semibold">{ticket.passenger_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Tanggal</p>
                        <p className="text-lg font-semibold">{formatDate(ticket.booking.departure_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Waktu</p>
                        <p className="text-lg font-semibold">{ticket.booking.schedule.departure_time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-lg mr-4">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Kode Tiket</p>
                        <p className="text-lg font-mono font-bold">{ticket.ticket_code}</p>
                      </div>
                    </div>

                    <div>
                      {ticket.checked_in ? (
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Sudah Check-in</span>
                        </div>
                      ) : (
                        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center">
                          <svg className="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>Belum Check-in</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Passenger Information */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 border-b border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Informasi Penumpang
                      </h4>
                    </div>
                    <div className="divide-y divide-gray-100">
                      <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                        <div className="col-span-1 text-sm font-medium text-gray-500">Nama Penumpang</div>
                        <div className="col-span-2 text-sm text-gray-900 font-semibold">{ticket.passenger_name}</div>
                      </div>
                      <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                        <div className="col-span-1 text-sm font-medium text-gray-500">No. ID</div>
                        <div className="col-span-2 text-sm text-gray-900">
                          {ticket.passenger_id_number || '-'} {ticket.passenger_id_type ? `(${ticket.passenger_id_type})` : ''}
                        </div>
                      </div>
                      <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                        <div className="col-span-1 text-sm font-medium text-gray-500">Tanggal</div>
                        <div className="col-span-2 text-sm text-gray-900">
                          {formatDate(ticket.booking.departure_date)}
                        </div>
                      </div>
                      <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                        <div className="col-span-1 text-sm font-medium text-gray-500">Waktu</div>
                        <div className="col-span-2 text-sm text-gray-900">
                          {ticket.booking.schedule.departure_time || '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Journey Information */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 border-b border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Informasi Perjalanan
                      </h4>
                    </div>
                    <div className="divide-y divide-gray-100">
                      <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                        <div className="col-span-1 text-sm font-medium text-gray-500">Rute</div>
                        <div className="col-span-2 text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                              <span className="font-medium">{ticket.booking.schedule.route.origin || '-'}</span>
                              <svg className="mx-2 h-4 w-4 text-blue-500 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                              <span className="font-medium">{ticket.booking.schedule.route.destination || '-'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                        <div className="col-span-1 text-sm font-medium text-gray-500">Kapal</div>
                        <div className="col-span-2 text-sm text-gray-900 font-medium">
                          {ticket.booking.schedule.ferry.name || '-'}
                        </div>
                      </div>
                      <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                        <div className="col-span-1 text-sm font-medium text-gray-500">Status Booking</div>
                        <div className="col-span-2">
                          {ticket.booking.status === 'CONFIRMED' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
                              <svg className="mr-1.5 h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="8" />
                              </svg>
                              Dikonfirmasi
                            </span>
                          )}
                          {ticket.booking.status === 'PENDING' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 shadow-sm">
                              <svg className="mr-1.5 h-3 w-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="8" />
                              </svg>
                              Menunggu
                            </span>
                          )}
                          {ticket.booking.status === 'COMPLETED' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm">
                              <svg className="mr-1.5 h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="8" />
                              </svg>
                              Selesai
                            </span>
                          )}
                          {ticket.booking.status === 'CANCELLED' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-red-200 text-red-800 shadow-sm">
                              <svg className="mr-1.5 h-3 w-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="8" />
                              </svg>
                              Dibatalkan
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                        <div className="col-span-1 text-sm font-medium text-gray-500">Check-in</div>
                        <div className="col-span-2">
                          {ticket.checked_in ? (
                            <span className="inline-flex items-center text-sm">
                              <svg className="h-5 w-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-900 font-medium">
                                Sudah Check-in ({formatTime(ticket.boarding_time)})
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-sm">
                              <svg className="h-5 w-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-500">Belum Check-in</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information (if any) */}
                {ticket.vehicle && (
                  <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-5 shadow-md animate__animated animate__fadeIn">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 001-1v-3.05a2.5 2.5 0 010-4.9V4a1 1 0 00-1-1H3z" />
                        </svg>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-semibold text-blue-900 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Informasi Kendaraan
                        </h3>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-all duration-200">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipe</span>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                              {ticket.vehicle.type === 'MOTORCYCLE' && '🏍️ Motor'}
                              {ticket.vehicle.type === 'CAR' && '🚗 Mobil'}
                              {ticket.vehicle.type === 'BUS' && '🚌 Bus'}
                              {ticket.vehicle.type === 'TRUCK' && '🚚 Truk'}
                              {!['MOTORCYCLE', 'CAR', 'BUS', 'TRUCK'].includes(ticket.vehicle.type) && ticket.vehicle.type}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-all duration-200">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Nomor Plat</span>
                            <p className="mt-1 text-sm font-mono font-bold text-gray-900">{ticket.vehicle.license_plate || '-'}</p>
                          </div>
                          <div className="bg-white rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-all duration-200">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pemilik</span>
                            <p className="mt-1 text-sm font-medium text-gray-900">{ticket.vehicle.owner_name || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 flex justify-center">
                  {!ticket.checked_in && ticket.status === 'ACTIVE' && ticket.booking.status === 'CONFIRMED' && (
                    <button
                      onClick={handleCheckIn}
                      disabled={loading}
                      className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:from-gray-400 disabled:to-gray-500 transform hover:scale-105 transition-all duration-200"
                    >
                      <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {loading ? 'Memproses...' : 'Proses Check-in'}
                    </button>
                  )}

                  {ticket.checked_in && (
                    <div className="w-full max-w-md p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl shadow-lg animate__animated animate__fadeIn">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-10 w-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-green-900">Penumpang ini sudah melakukan check-in</h3>
                          <div className="mt-2 text-sm text-green-800">
                            <p>Check-in pada: <span className="font-semibold">{new Date(ticket.boarding_time).toLocaleString('id-ID')}</span></p>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                setTicket(null);
                                setSearchTerm('');
                                setError('');
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Cari Tiket Lainnya
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {ticket.status !== 'ACTIVE' && (
                    <div className="w-full max-w-md p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl shadow-lg animate__animated animate__fadeIn">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-10 w-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-red-900">Tiket tidak aktif</h3>
                          <div className="mt-2 text-sm text-red-800">
                            <p>Status tiket saat ini: <strong>{ticket.status}</strong></p>
                            <p className="mt-1">Tiket ini tidak dapat digunakan untuk check-in.</p>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                setTicket(null);
                                setSearchTerm('');
                                setError('');
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Cari Tiket Lainnya
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {ticket.booking.status !== 'CONFIRMED' && ticket.status === 'ACTIVE' && (
                    <div className="w-full max-w-md p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl shadow-lg animate__animated animate__fadeIn">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-10 w-10 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-yellow-900">Booking belum dikonfirmasi</h3>
                          <div className="mt-2 text-sm text-yellow-800">
                            <p>Status booking saat ini: <span className="font-semibold">{ticket.booking.status}</span></p>
                            <p className="mt-1">Booking harus dikonfirmasi terlebih dahulu sebelum penumpang dapat melakukan check-in.</p>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                setTicket(null);
                                setSearchTerm('');
                                setError('');
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Cari Tiket Lainnya
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="px-6 py-16 text-center animate__animated animate__fadeIn">
                <svg className="mx-auto h-20 w-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Masukkan kode tiket untuk melakukan check-in</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Gunakan pencarian untuk memulai proses check-in penumpang.
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Recent Activity */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Aktivitas Check-in Terbaru
              </h2>
            </div>
            <div className="p-6">
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                          <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-gray-900">{activity.passenger_name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.boarding_time).toLocaleString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">{activity.ticket_code}</span> - {activity.route}
                          </p>
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {activity.ferry}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada aktivitas</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Aktivitas check-in terbaru akan muncul di sini
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

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
          
          .animate__animated {
            animation-duration: 0.5s;
            animation-fill-mode: both;
          }
          
          .animate__fadeIn {
            animation-name: fadeIn;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translate3d(0, 20px, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }
          
          .animate__fadeInUp {
            animation-name: fadeInUp;
          }
        `}</style>
      </div>
    </div>
  );
};

export default BookingCheckIn;