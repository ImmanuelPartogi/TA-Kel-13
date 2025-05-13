// src/pages/admin/bookings/BookingReschedule.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';

const BookingReschedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  
  const [formData, setFormData] = useState({
    route_id: '',
    departure_date: new Date().toISOString().split('T')[0],
    schedule_id: '',
    notes: ''
  });

  const [scheduleResults, setScheduleResults] = useState([]);
  const [showScheduleResults, setShowScheduleResults] = useState(false);
  const [noSchedulesFound, setNoSchedulesFound] = useState(false);
  const [nearestSchedules, setNearestSchedules] = useState([]);
  const [nearestDate, setNearestDate] = useState('');
  const [showNearestResults, setShowNearestResults] = useState(false);

  useEffect(() => {
    fetchBooking();
    fetchRoutes();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/admin-panel/bookings/${id}`);
      setBooking(response.data.data);
      setFormData({
        ...formData,
        route_id: response.data.data.schedule.route_id
      });
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/admin-panel/routes');
      setRoutes(response.data.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const checkSchedules = async () => {
    if (!formData.route_id || !formData.departure_date) {
      alert('Silakan pilih rute dan tanggal terlebih dahulu');
      return;
    }

    try {
      const response = await api.post('/admin-panel/bookings/get-available-schedules', {
        route_id: formData.route_id,
        date: formData.departure_date,
        passenger_count: booking.passenger_count,
        vehicle_counts: getVehicleCounts(),
        find_nearest: false
      });

      if (response.data.success) {
        setScheduleResults(response.data.data);
        setShowScheduleResults(true);
        setNoSchedulesFound(response.data.data.length === 0);
      }
    } catch (error) {
      console.error('Error checking schedules:', error);
      alert('Terjadi kesalahan saat mencari jadwal');
    }
  };

  const findNearestSchedules = async () => {
    if (!formData.route_id || !formData.departure_date) {
      alert('Silakan pilih rute dan tanggal terlebih dahulu');
      return;
    }

    try {
      const response = await api.post('/admin-panel/bookings/get-available-schedules', {
        route_id: formData.route_id,
        date: formData.departure_date,
        passenger_count: booking.passenger_count,
        vehicle_counts: getVehicleCounts(),
        find_nearest: true
      });

      if (response.data.success) {
        if (response.data.nearest_date && response.data.nearest_schedules) {
          setNearestDate(response.data.nearest_date);
          setNearestSchedules(response.data.nearest_schedules);
          setShowNearestResults(true);
        } else {
          alert('Tidak ditemukan jadwal terdekat dalam 7 hari ke depan');
        }
      }
    } catch (error) {
      console.error('Error finding nearest schedules:', error);
      alert('Terjadi kesalahan saat mencari jadwal terdekat');
    }
  };

  const getVehicleCounts = () => {
    if (!booking) return {};
    
    const counts = {
      MOTORCYCLE: 0,
      CAR: 0,
      BUS: 0,
      TRUCK: 0
    };

    booking.vehicles.forEach(vehicle => {
      counts[vehicle.type]++;
    });

    return counts;
  };

  const selectSchedule = (schedule) => {
    setFormData({ ...formData, schedule_id: schedule.id });
    
    // Highlight selected schedule
    const scheduleElements = document.querySelectorAll('[data-schedule-id]');
    scheduleElements.forEach(el => {
      el.classList.remove('border-blue-500', 'bg-blue-50');
      el.classList.add('border-gray-200');
    });
    
    const selectedElement = document.querySelector(`[data-schedule-id="${schedule.id}"]`);
    if (selectedElement) {
      selectedElement.classList.remove('border-gray-200');
      selectedElement.classList.add('border-blue-500', 'bg-blue-50');
    }
  };

  const selectNearestSchedule = (schedule) => {
    setFormData({
      ...formData,
      departure_date: schedule.date,
      schedule_id: schedule.schedule_id
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.schedule_id) {
      alert('Silakan pilih jadwal terlebih dahulu');
      return;
    }

    setSubmitting(true);
    setErrors([]);

    try {
      const response = await api.post(`/admin-panel/bookings/${id}/process-reschedule`, formData);
      
      if (response.data.success) {
        navigate(`/admin/bookings/${id}`);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(Object.values(error.response.data.errors).flat());
      } else {
        setErrors(['Terjadi kesalahan saat reschedule booking']);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <i className="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-gray-500">Booking tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Jadwalkan Ulang Booking</h1>
          <p className="mt-1 text-gray-600">Kode: <span className="font-medium">{booking.booking_code}</span></p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => navigate(`/admin/bookings/${id}`)}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors shadow-sm"
          >
            <i className="fas fa-arrow-left mr-2 text-sm"></i> Kembali
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-500"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ada beberapa kesalahan:</h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Reschedule Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Pilih Jadwal Baru</h2>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Rute <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="route_id"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      value={formData.route_id}
                      onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                      required
                    >
                      <option value="">Pilih Rute</option>
                      {routes.map(route => (
                        <option key={route.id} value={route.id}>
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
                      value={formData.departure_date}
                      onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={checkSchedules}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
                    >
                      <i className="fas fa-search mr-2"></i> Cari Jadwal
                    </button>
                    <button
                      type="button"
                      onClick={findNearestSchedules}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm"
                    >
                      <i className="fas fa-calendar-alt mr-2"></i> Cari Jadwal Terdekat
                    </button>
                  </div>

                  {showNearestResults && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-md font-medium text-green-800 mb-2">Jadwal Terdekat Tersedia pada:</h3>
                      <p className="text-sm font-bold text-green-700 mb-3">{formatDate(nearestDate)}</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {nearestSchedules.map(schedule => (
                          <div
                            key={schedule.schedule_id}
                            className="border border-green-200 rounded-md p-3 bg-green-50 hover:bg-green-100 cursor-pointer"
                            onClick={() => selectNearestSchedule(schedule)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-medium text-gray-900">
                                {schedule.departure_time} - {schedule.arrival_time}
                              </div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                                Jadwal Terdekat
                              </span>
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

                  {showScheduleResults && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jadwal Tersedia</label>
                      <div className="space-y-3 max-h-72 overflow-y-auto border border-gray-200 rounded-md p-3">
                        {scheduleResults.map(schedule => (
                          <div
                            key={schedule.id}
                            data-schedule-id={schedule.id}
                            className={`border rounded-md p-3 ${
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
                              <div>Kapasitas: {schedule.available_passenger} penumpang tersedia</div>
                              {!schedule.is_available && schedule.reason && (
                                <div className="text-red-500 font-medium mt-2">{schedule.reason}</div>
                              )}
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

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan
                    </label>
                    <textarea
                      id="notes"
                      rows="3"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      placeholder="Alasan reschedule (opsional)"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={!formData.schedule_id || submitting}
                      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                    >
                      {submitting ? (
                        <><i className="fas fa-spinner fa-spin mr-2"></i> Memproses...</>
                      ) : (
                        <><i className="fas fa-calendar-check mr-2"></i> Jadwalkan Ulang</>
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
                    {new Date(booking.departure_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
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
                      <div>
                        {booking.vehicles.map(vehicle => {
                          const types = {
                            'MOTORCYCLE': 'Motor',
                            'CAR': 'Mobil',
                            'BUS': 'Bus',
                            'TRUCK': 'Truk'
                          };
                          return types[vehicle.type];
                        }).join(', ')}
                      </div>
                    ) : (
                      'Tidak ada'
                    )}
                  </dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Total</dt>
                  <dd className="text-sm font-bold text-blue-600">
                    Rp {booking.total_amount.toLocaleString('id-ID')}
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