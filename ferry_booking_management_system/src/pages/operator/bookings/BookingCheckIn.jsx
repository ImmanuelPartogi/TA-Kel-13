import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { operatorBookingsService } from '../../../services/operatorBookings.service';
import Swal from 'sweetalert2';

const BookingCheckIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [ticketCode, setTicketCode] = useState(searchParams.get('ticket_code') || '');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const response = await operatorBookingsService.checkIn.validate({ ticket_code: ticketCode });
      setTicket(response.data.ticket);
      
      // Simulate scanner check with visual feedback
      setScanning(true);
      setTimeout(() => {
        setScanning(false);
      }, 1500);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(Object.values(error.response.data.errors).flat());
      } else {
        setErrors([error.response?.data?.message || 'Terjadi kesalahan']);
      }
    }
    setLoading(false);
  };

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
        popup: 'animate-fade-in rounded-xl',
        confirmButton: 'px-4 py-2 rounded-lg font-medium',
        cancelButton: 'px-4 py-2 rounded-lg font-medium'
      }
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await operatorBookingsService.checkIn.process({ ticket_code: ticket.ticket_code });
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: response.data.message || 'Check-in berhasil dilakukan',
          customClass: {
            popup: 'animate-fade-in rounded-xl'
          }
        });

        // Refresh ticket data
        setTicket({ ...ticket, checked_in: true, boarding_time: new Date().toISOString() });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: error.response?.data?.message || 'Terjadi kesalahan saat check-in',
          customClass: {
            popup: 'animate-fade-in rounded-xl'
          }
        });
      }
      setLoading(false);
    }
  };

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

        {/* Error Alert */}
        {errors.length > 0 && (
          <div className="mb-6 bg-white rounded-xl border-l-4 border-red-500 shadow-xl overflow-hidden animate-fade-in">
            <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Error</span>
              </div>
              <button onClick={() => setErrors([])} className="text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-red-50 px-4 py-3 text-red-700">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5">
            <h2 className="text-xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Check-in Penumpang
            </h2>
          </div>

          {/* Search Form with Scanner Animation */}
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <form onSubmit={handleSearch} className="space-y-5">
              <div>
                <label htmlFor="ticket_code" className="block text-sm font-semibold text-gray-700 mb-2">
                  Kode Tiket / Kode Booking
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="ticket_code"
                    id="ticket_code"
                    className={`block w-full pl-12 pr-32 py-4 text-base border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${scanning ? 'bg-green-50 border-green-300' : ''}`}
                    placeholder="Masukkan kode tiket atau booking"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="submit"
                      disabled={loading || scanning}
                      className="inline-flex items-center px-6 py-4 border border-transparent text-sm font-medium rounded-r-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-full disabled:from-slate-400 disabled:to-slate-500 transition-all duration-200 hover:shadow-lg"
                    >
                      {scanning ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Scanning...
                        </>
                      ) : loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Mencari...
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <span>Format: TKT-XXXXX (tiket) atau FBS-XXXXX (booking)</span>
                  </span>
                </div>
              </div>
            </form>
          </div>

          {/* Ticket Details */}
          {ticket && (
            <div className="px-6 py-6">
              <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                Detail Tiket
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ticket Information */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      Informasi Tiket
                    </h4>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Kode Tiket</div>
                      <div className="col-span-2 text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono font-semibold mr-2">
                            {ticket.ticket_code}
                          </div>
                          {scanning && (
                            <span className="inline-flex items-center text-green-600 text-xs">
                              <svg className="h-4 w-4 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Terverifikasi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Kode Booking</div>
                      <div className="col-span-2 text-sm text-gray-900 font-mono font-semibold">{ticket.booking.booking_code}</div>
                    </div>
                    <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Status Tiket</div>
                      <div className="col-span-2">
                        {ticket.status === 'ACTIVE' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
                            <svg className="mr-1.5 h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <circle cx="10" cy="10" r="8"/>
                            </svg>
                            Aktif
                          </span>
                        )}
                        {ticket.status === 'USED' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm">
                            <svg className="mr-1.5 h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <circle cx="10" cy="10" r="8"/>
                            </svg>
                            Digunakan
                          </span>
                        )}
                        {ticket.status === 'CANCELLED' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-red-200 text-red-800 shadow-sm">
                            <svg className="mr-1.5 h-3 w-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <circle cx="10" cy="10" r="8"/>
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
                              Sudah Check-in ({new Date(ticket.boarding_time).toLocaleString('id-ID')})
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
                        {ticket.passenger_id_number} ({ticket.passenger_id_type})
                      </div>
                    </div>
                    <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Tanggal</div>
                      <div className="col-span-2 text-sm text-gray-900">
                        {formatDate(ticket.booking.departure_date)}
                      </div>
                    </div>
                    <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Rute</div>
                      <div className="col-span-2 text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                            <span className="font-medium">{ticket.booking.schedule.route.origin}</span>
                            <svg className="mx-2 h-4 w-4 text-blue-500 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <span className="font-medium">{ticket.booking.schedule.route.destination}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              {ticket.vehicle && (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-5 shadow-md">
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
                          </p>
                        </div>
                        <div className="bg-white rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-all duration-200">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Nomor Plat</span>
                          <p className="mt-1 text-sm font-mono font-bold text-gray-900">{ticket.vehicle.license_plate}</p>
                        </div>
                        <div className="bg-white rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-all duration-200">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pemilik</span>
                          <p className="mt-1 text-sm font-medium text-gray-900">{ticket.vehicle.owner_name}</p>
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
                  <div className="w-full max-w-md p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl shadow-lg">
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
                            onClick={() => setTicket(null)}
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

                {ticket.status === 'CANCELLED' && (
                  <div className="w-full max-w-md p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl shadow-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-10 w-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-red-900">Tiket telah dibatalkan</h3>
                        <div className="mt-2 text-sm text-red-800">
                          <p>Tiket ini tidak dapat digunakan karena sudah dibatalkan.</p>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() => setTicket(null)}
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

                {ticket.booking.status !== 'CONFIRMED' && (
                  <div className="w-full max-w-md p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl shadow-lg">
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
                            onClick={() => setTicket(null)}
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
          )}
          
          {/* Empty State */}
          {!ticket && !loading && !scanning && (
            <div className="px-6 py-16 text-center">
              <svg className="mx-auto h-20 w-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Masukkan kode tiket untuk melakukan check-in</h3>
              <p className="mt-1 text-sm text-gray-500">
                Masukkan kode tiket atau kode booking untuk memulai proses check-in penumpang.
              </p>
            </div>
          )}
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
          
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
          
          @keyframes scanning {
            0% {
              background-position: -100% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          
          .scanning-animation {
            background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
            background-size: 200% 100%;
            animation: scanning 2s infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default BookingCheckIn;