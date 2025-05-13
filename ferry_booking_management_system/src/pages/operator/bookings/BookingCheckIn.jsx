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
      confirmButtonColor: '#059669',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Check-in',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await operatorBookingsService.checkIn.process({ ticket_code: ticket.ticket_code });
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: response.data.message || 'Check-in berhasil dilakukan',
        });

        // Refresh ticket data
        setTicket({ ...ticket, checked_in: true, boarding_time: new Date().toISOString() });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: error.response?.data?.message || 'Terjadi kesalahan saat check-in',
        });
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Check-in Penumpang</h1>
          <p className="text-blue-100">Silakan masukkan kode tiket atau kode booking untuk melakukan check-in</p>
        </div>

        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Ada beberapa masalah:</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Check-in Penumpang
            </h2>
          </div>

          <div className="px-6 py-6 border-b border-gray-200">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="ticket_code" className="block text-sm font-medium text-gray-700">
                  Kode Tiket / Kode Booking
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="ticket_code"
                    id="ticket_code"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-32 sm:text-sm border-gray-300 rounded-md py-3"
                    placeholder="Masukkan kode tiket atau booking"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-full disabled:bg-gray-400"
                    >
                      <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {loading ? 'Mencari...' : 'Cari'}
                    </button>
                  </div>
                </div>
                <div className="flex mt-2 space-x-2 text-sm text-gray-500">
                  <span className="inline-flex items-center">
                    <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Format: TKT-XXXXX (tiket) atau FBS-XXXXX (booking)</span>
                  </span>
                </div>
              </div>
            </form>
          </div>

          {ticket && (
            <div className="px-6 py-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                Detail Tiket
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Ticket Info */}
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700">Informasi Tiket</h4>
                  </div>
                  <div className="divide-y divide-gray-200">
                    <div className="px-4 py-3 grid grid-cols-3">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Kode Tiket</div>
                      <div className="col-span-2 text-sm text-gray-900 font-mono">{ticket.ticket_code}</div>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-3">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Kode Booking</div>
                      <div className="col-span-2 text-sm text-gray-900 font-mono">{ticket.booking.booking_code}</div>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-3">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Status Tiket</div>
                      <div className="col-span-2">
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
                      </div>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-3">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Check-in</div>
                      <div className="col-span-2">
                        {ticket.checked_in ? (
                          <span className="inline-flex items-center text-sm">
                            <svg className="h-4 w-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-900">
                              Sudah Check-in ({new Date(ticket.boarding_time).toLocaleString('id-ID')})
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-sm">
                            <svg className="h-4 w-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-500">Belum Check-in</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Passenger Info */}
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700">Informasi Penumpang</h4>
                  </div>
                  <div className="divide-y divide-gray-200">
                    <div className="px-4 py-3 grid grid-cols-3">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Nama Penumpang</div>
                      <div className="col-span-2 text-sm text-gray-900">{ticket.passenger_name}</div>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-3">
                      <div className="col-span-1 text-sm font-medium text-gray-500">No. ID</div>
                      <div className="col-span-2 text-sm text-gray-900">
                        {ticket.passenger_id_number} ({ticket.passenger_id_type})
                      </div>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-3">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Tanggal</div>
                      <div className="col-span-2 text-sm text-gray-900">
                        {new Date(ticket.booking.departure_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-3">
                      <div className="col-span-1 text-sm font-medium text-gray-500">Rute</div>
                      <div className="col-span-2 text-sm text-gray-900">
                        <div className="flex items-center">
                          <span>{ticket.booking.schedule.route.origin}</span>
                          <svg className="mx-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <span>{ticket.booking.schedule.route.destination}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              {ticket.vehicle && (
                <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 001-1v-3.05a2.5 2.5 0 010-4.9V4a1 1 0 00-1-1H3z" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-blue-800">Informasi Kendaraan</h3>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="flex items-center">
                          <span className="text-xs font-medium text-blue-700 mr-2">Tipe:</span>
                          <span className="text-xs text-blue-800">
                            {ticket.vehicle.type === 'MOTORCYCLE' && 'Motor'}
                            {ticket.vehicle.type === 'CAR' && 'Mobil'}
                            {ticket.vehicle.type === 'BUS' && 'Bus'}
                            {ticket.vehicle.type === 'TRUCK' && 'Truk'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs font-medium text-blue-700 mr-2">Nomor Plat:</span>
                          <span className="text-xs text-blue-800 font-mono">{ticket.vehicle.license_plate}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs font-medium text-blue-700 mr-2">Pemilik:</span>
                          <span className="text-xs text-blue-800">{ticket.vehicle.owner_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex justify-center">
                {!ticket.checked_in && ticket.status === 'ACTIVE' && ticket.booking.status === 'CONFIRMED' && (
                  <button
                    onClick={handleCheckIn}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                  >
                    <svg className="mr-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {loading ? 'Memproses...' : 'Proses Check-in'}
                  </button>
                )}

                {ticket.checked_in && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Penumpang ini sudah melakukan check-in</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Check-in pada: {new Date(ticket.boarding_time).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {ticket.status === 'CANCELLED' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Tiket telah dibatalkan</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>Tiket ini tidak dapat digunakan karena sudah dibatalkan.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {ticket.booking.status !== 'CONFIRMED' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Booking belum dikonfirmasi</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Status booking saat ini: {ticket.booking.status}</p>
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