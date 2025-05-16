// src/pages/operator/bookings/BookingCheckIn.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { operatorBookingsService } from '../../../services/operatorBookings.service';
import Swal from 'sweetalert2';

const BookingCheckIn = () => {
  const navigate = useNavigate();
  const [ticketCode, setTicketCode] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const response = await operatorBookingsService.checkIn.validate({ ticket_code: ticketCode });
      setTicket(response.data.ticket);
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
        popup: 'animate-fade-in',
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
            popup: 'animate-fade-in'
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
            popup: 'animate-fade-in'
          }
        });
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Alert */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-xl p-5 shadow-md animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-base font-semibold text-red-800">Ada beberapa masalah:</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
            <h2 className="text-xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Check-in Penumpang
            </h2>
          </div>

          {/* Search Form */}
          <div className="px-6 py-6 border-b border-gray-100">
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
                    className="block w-full pl-12 pr-32 py-4 text-base border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Masukkan kode tiket atau booking"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-6 py-4 border border-transparent text-sm font-medium rounded-r-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-full disabled:bg-gray-400 transition-all duration-200 hover:shadow-lg"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {loading ? 'Mencari...' : 'Cari'}
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
                <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                Detail Tiket
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ticket Information */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700">Informasi Tiket</h4>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Kode Tiket</div>
                      <div className="col-span-2 text-sm text-gray-900 font-mono font-semibold">{ticket.ticket_code}</div>
                    </div>
                    <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Kode Booking</div>
                      <div className="col-span-2 text-sm text-gray-900 font-mono font-semibold">{ticket.booking.booking_code}</div>
                    </div>
                    <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Status Tiket</div>
                      <div className="col-span-2">
                        {ticket.status === 'ACTIVE' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
                            <svg className="mr-1.5 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <circle cx="10" cy="10" r="8"/>
                            </svg>
                            Aktif
                          </span>
                        )}
                        {ticket.status === 'USED' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shadow-sm">
                            <svg className="mr-1.5 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <circle cx="10" cy="10" r="8"/>
                            </svg>
                            Digunakan
                          </span>
                        )}
                        {ticket.status === 'CANCELLED' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 shadow-sm">
                            <svg className="mr-1.5 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
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
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700">Informasi Penumpang</h4>
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
                        {new Date(ticket.booking.departure_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="px-4 py-4 grid grid-cols-3 hover:bg-gray-50 transition-colors duration-150">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Rute</div>
                      <div className="col-span-2 text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="font-medium">{ticket.booking.schedule.route.origin}</span>
                          <svg className="mx-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <span className="font-medium">{ticket.booking.schedule.route.destination}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              {ticket.vehicle && (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-5 shadow-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 001-1v-3.05a2.5 2.5 0 010-4.9V4a1 1 0 00-1-1H3z" />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-semibold text-blue-900">Informasi Kendaraan</h3>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipe</span>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {ticket.vehicle.type === 'MOTORCYCLE' && '🏍️ Motor'}
                            {ticket.vehicle.type === 'CAR' && '🚗 Mobil'}
                            {ticket.vehicle.type === 'BUS' && '🚌 Bus'}
                            {ticket.vehicle.type === 'TRUCK' && '🚚 Truk'}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Nomor Plat</span>
                          <p className="mt-1 text-sm font-mono font-bold text-gray-900">{ticket.vehicle.license_plate}</p>
                        </div>
                        <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
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
                        <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-green-900">Penumpang ini sudah melakukan check-in</h3>
                        <div className="mt-2 text-sm text-green-800">
                          <p>Check-in pada: <span className="font-semibold">{new Date(ticket.boarding_time).toLocaleString('id-ID')}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {ticket.status === 'CANCELLED' && (
                  <div className="w-full max-w-md p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl shadow-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-red-900">Tiket telah dibatalkan</h3>
                        <div className="mt-2 text-sm text-red-800">
                          <p>Tiket ini tidak dapat digunakan karena sudah dibatalkan.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {ticket.booking.status !== 'CONFIRMED' && (
                  <div className="w-full max-w-md p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl shadow-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-yellow-900">Booking belum dikonfirmasi</h3>
                        <div className="mt-2 text-sm text-yellow-800">
                          <p>Status booking saat ini: <span className="font-semibold">{ticket.booking.status}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCheckIn;