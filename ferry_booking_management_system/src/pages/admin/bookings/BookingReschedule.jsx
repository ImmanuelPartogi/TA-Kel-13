import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { bookingService } from '../../../services/api';

// Components
import LoadingSpinner from '../../../components/LoadingSpinner';
import Alert from '../../../components/Alert';

const BookingReschedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [booking, setBooking] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [routeId, setRouteId] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [scheduleId, setScheduleId] = useState('');
  const [notes, setNotes] = useState('');
  
  // Results state
  const [schedules, setSchedules] = useState([]);
  const [nearestSchedules, setNearestSchedules] = useState([]);
  const [nearestDate, setNearestDate] = useState(null);
  const [checkingSchedules, setCheckingSchedules] = useState(false);
  const [findingNearest, setFindingNearest] = useState(false);
  const [noSchedulesFound, setNoSchedulesFound] = useState(false);
  const [scheduleResults, setScheduleResults] = useState(false);
  
  // Submit state
  const [submitting, setSubmitting] = useState(false);
  
  // Vehicle counts
  const [vehicleCounts, setVehicleCounts] = useState({
    MOTORCYCLE: 0,
    CAR: 0,
    BUS: 0,
    TRUCK: 0
  });

  // Load booking data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch booking details
        const bookingResponse = await bookingService.getBooking(id);
        setBooking(bookingResponse.data);
        
        // Set route ID
        setRouteId(bookingResponse.data.schedule.route.id);
        
        // Set today's date as minimum
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('departure_date');
        if (dateInput) {
          dateInput.min = today;
        }
        
        // Calculate vehicle counts
        const vehicles = bookingResponse.data.vehicles || [];
        const counts = {
          MOTORCYCLE: 0,
          CAR: 0,
          BUS: 0,
          TRUCK: 0
        };
        
        vehicles.forEach(vehicle => {
          counts[vehicle.type] = counts[vehicle.type] + 1;
        });
        
        setVehicleCounts(counts);
        
        // Fetch routes
        const routesResponse = await bookingService.getRoutes();
        setRoutes(routesResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Terjadi kesalahan saat memuat data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Check available schedules
  const checkSchedules = async (findNearest = false) => {
    if (!routeId) {
      setError('Silakan pilih rute terlebih dahulu');
      return;
    }

    if (!departureDate) {
      setError('Silakan pilih tanggal keberangkatan terlebih dahulu');
      return;
    }

    try {
      if (findNearest) {
        setFindingNearest(true);
      } else {
        setCheckingSchedules(true);
      }
      
      setNoSchedulesFound(false);
      setScheduleResults(false);
      
      const response = await bookingService.getAvailableSchedules({
        route_id: routeId,
        date: departureDate,
        passenger_count: booking.passenger_count,
        vehicle_counts: vehicleCounts,
        find_nearest: findNearest
      });
      
      if (response.data.success) {
        setSchedules(response.data.data || []);
        
        // If there are no available schedules
        if (response.data.data.length === 0) {
          setNoSchedulesFound(true);
        } else {
          setScheduleResults(true);
        }
        
        // If nearest date and schedules are returned
        if (findNearest && response.data.nearest_date && response.data.nearest_schedules) {
          setNearestDate(response.data.nearest_date);
          setNearestSchedules(response.data.nearest_schedules);
        } else if (findNearest) {
          setNearestDate(null);
          setNearestSchedules([]);
          alert('Tidak ditemukan jadwal terdekat dalam 7 hari ke depan');
        }
      } else {
        setError('Terjadi kesalahan saat mengambil jadwal');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Terjadi kesalahan saat mencari jadwal');
    } finally {
      setCheckingSchedules(false);
      setFindingNearest(false);
    }
  };

  // Handle select schedule
  const selectSchedule = (selectedSchedule) => {
    // Remove selected class from all schedules
    const scheduleItems = document.querySelectorAll('.schedule-item');
    scheduleItems.forEach(item => {
      item.classList.remove('border-blue-500', 'bg-blue-50');
      item.classList.add('border-gray-200');
    });
    
    // Add selected class to the clicked schedule
    const selectedItem = document.getElementById(`schedule-${selectedSchedule.id}`);
    if (selectedItem) {
      selectedItem.classList.remove('border-gray-200');
      selectedItem.classList.add('border-blue-500', 'bg-blue-50');
    }
    
    // Set the schedule ID
    setScheduleId(selectedSchedule.id);
  };

  // Handle select nearest schedule
  const selectNearestSchedule = (schedule) => {
    // Set the date to the nearest schedule date
    setDepartureDate(schedule.date);
    
    // Set the schedule ID
    setScheduleId(schedule.schedule_id);
    
    // Remove selected class from all nearest schedules
    const scheduleItems = document.querySelectorAll('.nearest-schedule-item');
    scheduleItems.forEach(item => {
      item.classList.remove('border-blue-500', 'bg-blue-100');
      item.classList.add('border-green-200', 'bg-green-50');
    });
    
    // Add selected class to the clicked schedule
    const selectedItem = document.getElementById(`nearest-${schedule.schedule_id}`);
    if (selectedItem) {
      selectedItem.classList.remove('border-green-200', 'bg-green-50');
      selectedItem.classList.add('border-blue-500', 'bg-blue-100');
    }
    
    // Scroll to submit button
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
      submitButton.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!scheduleId) {
      setError('Silakan pilih jadwal terlebih dahulu');
      return;
    }
    
    try {
      setSubmitting(true);
      
      await bookingService.processReschedule(id, {
        schedule_id: scheduleId,
        notes: notes
      });
      
      // Redirect to booking detail page
      navigate(`/admin/bookings/${id}`, { 
        state: { success: 'Booking berhasil dijadwalkan ulang' } 
      });
    } catch (error) {
      console.error('Error:', error);
      setError('Terjadi kesalahan saat memproses reschedule');
      setSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-800">Jadwalkan Ulang Booking</h1>
          <p className="mt-1 text-gray-600">Kode: <span className="font-medium">{booking.booking_code}</span></p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to={`/admin/bookings/${id}`}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors shadow-sm"
          >
            <i className="fas fa-arrow-left mr-2 text-sm"></i> Kembali
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Reschedule Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Pilih Jadwal Baru</h2>
            </div>

            <div className="p-6">
              <form id="rescheduleForm" onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Rute <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="route_id"
                      value={routeId}
                      onChange={(e) => {
                        setRouteId(e.target.value);
                        setSchedules([]);
                        setNearestSchedules([]);
                        setScheduleId('');
                        setNoSchedulesFound(false);
                        setScheduleResults(false);
                      }}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      required
                    >
                      <option value="">Pilih Rute</option>
                      {routes.map(route => (
                        <option
                          key={route.id}
                          value={route.id}
                          selected={booking.schedule.route_id === route.id}
                        >
                          {route.origin} - {route.destination}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="departure_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Baru <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="departure_date"
                      name="departure_date"
                      value={departureDate}
                      onChange={(e) => {
                        setDepartureDate(e.target.value);
                        setSchedules([]);
                        setNearestSchedules([]);
                        setScheduleId('');
                        setNoSchedulesFound(false);
                        setScheduleResults(false);
                      }}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      required
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => checkSchedules(false)}
                      disabled={checkingSchedules || findingNearest}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
                    >
                      {checkingSchedules ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i> Mencari...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-search mr-2"></i> Cari Jadwal
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => checkSchedules(true)}
                      disabled={checkingSchedules || findingNearest}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm"
                    >
                      {findingNearest ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i> Mencari...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-calendar-alt mr-2"></i> Cari Jadwal Terdekat
                        </>
                      )}
                    </button>
                  </div>

                  {nearestDate && nearestSchedules.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-md font-medium text-green-800 mb-2">Jadwal Terdekat Tersedia pada:</h3>
                      <p className="text-sm font-bold text-green-700 mb-3">
                        {format(new Date(nearestDate), 'EEEE, dd MMMM yyyy', { locale: id })}
                      </p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {nearestSchedules.map(schedule => (
                          <div
                            key={schedule.schedule_id}
                            id={`nearest-${schedule.schedule_id}`}
                            onClick={() => selectNearestSchedule(schedule)}
                            className="nearest-schedule-item border border-green-200 rounded-md p-3 mb-2 bg-green-50 hover:bg-green-100 cursor-pointer"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-medium text-gray-900">
                                {schedule.departure_time} - {schedule.arrival_time}
                              </div>
                              <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                                  Jadwal Terdekat
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-700">
                              <p>Kapal: <span className="font-medium">{schedule.ferry_name}</span></p>
                              <p className="text-sm text-blue-600 mt-1">Klik untuk pilih jadwal ini</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {noSchedulesFound && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <i className="fas fa-exclamation-triangle text-yellow-400"></i>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            Tidak ada jadwal yang tersedia untuk tanggal dan rute yang dipilih. 
                            Silakan pilih tanggal lain atau gunakan fitur "Cari Jadwal Terdekat".
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {scheduleResults && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jadwal Tersedia</label>
                      <div className="space-y-3 max-h-72 overflow-y-auto border border-gray-200 rounded-md p-3">
                        {schedules.map(schedule => (
                          <div
                            key={schedule.id}
                            id={`schedule-${schedule.id}`}
                            className={`schedule-item border rounded-md p-3 mb-3 ${
                              schedule.is_available 
                                ? 'bg-white hover:bg-blue-50 cursor-pointer' 
                                : 'bg-gray-50 opacity-75'
                            }`}
                            onClick={() => schedule.is_available && selectSchedule(schedule)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className={`font-medium ${schedule.is_available ? 'text-gray-900' : 'text-gray-500'}`}>
                                {schedule.departure_time} - {schedule.arrival_time}
                              </div>
                              <div>
                                {schedule.is_available ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Tersedia
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Tidak Tersedia
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Kapal: <span className="font-medium">{schedule.ferry.name}</span></div>
                              <div>Kapasitas: {schedule.available_passenger} penumpang tersedia dari {schedule.ferry.capacity_passenger}</div>
                              
                              {vehicleCounts.MOTORCYCLE > 0 && (
                                <div>
                                  Motor: {schedule.available_motorcycle} tersedia (Butuh: {vehicleCounts.MOTORCYCLE})
                                  {!schedule.is_available && schedule.available_motorcycle < vehicleCounts.MOTORCYCLE && (
                                    <span className="text-red-500 ml-1">⚠️ Tidak cukup</span>
                                  )}
                                </div>
                              )}
                              
                              {vehicleCounts.CAR > 0 && (
                                <div>
                                  Mobil: {schedule.available_car} tersedia (Butuh: {vehicleCounts.CAR})
                                  {!schedule.is_available && schedule.available_car < vehicleCounts.CAR && (
                                    <span className="text-red-500 ml-1">⚠️ Tidak cukup</span>
                                  )}
                                </div>
                              )}
                              
                              {vehicleCounts.BUS > 0 && (
                                <div>
                                  Bus: {schedule.available_bus} tersedia (Butuh: {vehicleCounts.BUS})
                                  {!schedule.is_available && schedule.available_bus < vehicleCounts.BUS && (
                                    <span className="text-red-500 ml-1">⚠️ Tidak cukup</span>
                                  )}
                                </div>
                              )}
                              
                              {vehicleCounts.TRUCK > 0 && (
                                <div>
                                  Truk: {schedule.available_truck} tersedia (Butuh: {vehicleCounts.TRUCK})
                                  {!schedule.is_available && schedule.available_truck < vehicleCounts.TRUCK && (
                                    <span className="text-red-500 ml-1">⚠️ Tidak cukup</span>
                                  )}
                                </div>
                              )}
                              
                              {!schedule.is_available && schedule.reason && (
                                <div className="text-red-500 font-medium mt-2">{schedule.reason}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
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
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      placeholder="Alasan reschedule (opsional)"
                    ></textarea>
                  </div>

                  <input type="hidden" id="schedule_id" name="schedule_id" value={scheduleId} />

                  <div className="pt-4">
                    <button
                      type="submit"
                      id="submitButton"
                      disabled={!scheduleId || submitting}
                      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i> Memproses...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-calendar-check mr-2"></i> Jadwalkan Ulang
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - Booking Summary */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-800">Booking Saat Ini</h2>
            </div>

            <div className="p-6">
              <dl className="divide-y divide-gray-200">
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Kode Booking</dt>
                  <dd className="text-sm font-medium text-blue-600">{booking.booking_code}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Confirmed
                    </span>
                  </dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Pengguna</dt>
                  <dd className="text-sm text-gray-900">{booking.user.name}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Rute</dt>
                  <dd className="text-sm text-gray-900">
                    {booking.schedule.route.origin} - {booking.schedule.route.destination}
                  </dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Tanggal</dt>
                  <dd className="text-sm text-gray-900">
                    {format(new Date(booking.booking_date), 'd MMM yyyy', { locale: id })}
                  </dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Jadwal</dt>
                  <dd className="text-sm text-gray-900">
                    {booking.schedule.departure_time} - {booking.schedule.arrival_time}
                  </dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Kapal</dt>
                  <dd className="text-sm text-gray-900">{booking.schedule.ferry.name}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Penumpang</dt>
                  <dd className="text-sm text-gray-900">{booking.passenger_count} orang</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Kendaraan</dt>
                  <dd className="text-sm text-gray-900">
                    {booking.vehicle_count > 0 ? (
                      (() => {
                        const vehicleTexts = [];
                        
                        if (vehicleCounts.MOTORCYCLE > 0) {
                          vehicleTexts.push(`${vehicleCounts.MOTORCYCLE} Motor`);
                        }
                        
                        if (vehicleCounts.CAR > 0) {
                          vehicleTexts.push(`${vehicleCounts.CAR} Mobil`);
                        }
                        
                        if (vehicleCounts.BUS > 0) {
                          vehicleTexts.push(`${vehicleCounts.BUS} Bus`);
                        }
                        
                        if (vehicleCounts.TRUCK > 0) {
                          vehicleTexts.push(`${vehicleCounts.TRUCK} Truk`);
                        }
                        
                        return vehicleTexts.join(', ');
                      })()
                    ) : (
                      'Tidak ada'
                    )}
                  </dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Total</dt>
                  <dd className="text-sm font-bold text-blue-600">
                    Rp {new Intl.NumberFormat('id-ID').format(booking.total_amount)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReschedule;