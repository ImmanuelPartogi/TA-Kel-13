// src/pages/admin/bookings/BookingReschedule.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../../services/api';

const BookingReschedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [searchingSchedules, setSearchingSchedules] = useState(false);
  
  const [formData, setFormData] = useState({
    route_id: '',
    departure_date: new Date().toISOString().split('T')[0],
    schedule_id: '',
    notes: ''
  });

  const [scheduleResults, setScheduleResults] = useState([]);
  const [showScheduleResults, setShowScheduleResults] = useState(false);
  const [, setNoSchedulesFound] = useState(false);
  const [nearestSchedules, setNearestSchedules] = useState([]);
  const [nearestDate, setNearestDate] = useState('');
  const [showNearestResults, setShowNearestResults] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/admin-panel/bookings/${id}/reschedule`);
      if (response.data.success) {
        setBooking(response.data.data.booking);
        setRoutes(response.data.data.routes || []);
        setFormData(prev => ({
          ...prev,
          route_id: response.data.data.booking.schedule.route_id
        }));
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      // Jika endpoint reschedule tidak ada, coba endpoint show
      try {
        const bookingResponse = await api.get(`/admin-panel/bookings/${id}`);
        if (bookingResponse.data.success) {
          setBooking(bookingResponse.data.data);
          setFormData(prev => ({
            ...prev,
            route_id: bookingResponse.data.data.schedule.route_id
          }));
        }
        // Fetch routes separately
        const routesResponse = await api.get('/admin-panel/bookings/create');
        if (routesResponse.data.success && routesResponse.data.data.routes) {
          setRoutes(routesResponse.data.data.routes);
        }
      } catch (fallbackError) {
        console.error('Error with fallback:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkSchedules = async () => {
    if (!formData.route_id || !formData.departure_date) {
      alert('Silakan pilih rute dan tanggal terlebih dahulu');
      return;
    }

    setSearchingSchedules(true);
    setShowNearestResults(false);

    try {
      const response = await api.post('/admin-panel/bookings/get-available-schedules', {
        route_id: formData.route_id,
        date: formData.departure_date,
        passenger_count: booking.passenger_count,
        vehicle_counts: getVehicleCounts(),
        find_nearest: false
      });

      if (response.data.success) {
        const schedules = response.data.data || [];
        setScheduleResults(schedules);
        setShowScheduleResults(true);
        setNoSchedulesFound(schedules.length === 0 || schedules.every(s => !s.is_available));
      }
    } catch (error) {
      console.error('Error checking schedules:', error);
      alert('Terjadi kesalahan saat mencari jadwal');
    } finally {
      setSearchingSchedules(false);
    }
  };

  const findNearestSchedules = async () => {
    if (!formData.route_id || !formData.departure_date) {
      alert('Silakan pilih rute dan tanggal terlebih dahulu');
      return;
    }

    setSearchingSchedules(true);

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
          setNearestSchedules(response.data.nearest_schedules || []);
          setShowNearestResults(true);
        } else {
          alert('Tidak ditemukan jadwal terdekat dalam 7 hari ke depan');
        }
      }
    } catch (error) {
      console.error('Error finding nearest schedules:', error);
      alert('Terjadi kesalahan saat mencari jadwal terdekat');
    } finally {
      setSearchingSchedules(false);
    }
  };

  const getVehicleCounts = () => {
    if (!booking || !booking.vehicles) return {};
    
    const counts = {
      MOTORCYCLE: 0,
      CAR: 0,
      BUS: 0,
      TRUCK: 0
    };

    booking.vehicles.forEach(vehicle => {
      // Menggunakan 'in' operator yang lebih aman
      if (vehicle.type in counts) {
        counts[vehicle.type]++;
      }
    });

    return counts;
  };

  const selectSchedule = (schedule) => {
    setFormData({ ...formData, schedule_id: schedule.id });
    
    // Update visual selection
    const scheduleElements = document.querySelectorAll('[data-schedule-id]');
    scheduleElements.forEach(el => {
      el.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50', 'border-blue-500');
    });
    
    const selectedElement = document.querySelector(`[data-schedule-id="${schedule.id}"]`);
    if (selectedElement) {
      selectedElement.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50', 'border-blue-500');
    }
  };

  const selectNearestSchedule = (schedule) => {
    setFormData({
      ...formData,
      departure_date: schedule.date,
      schedule_id: schedule.schedule_id
    });
    setShowNearestResults(false);
    // Auto check schedules for the new date
    setTimeout(() => checkSchedules(), 100);
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
      const response = await api.post(`/admin-panel/bookings/${id}/process-reschedule`, {
        schedule_id: formData.schedule_id,
        departure_date: formData.departure_date,
        notes: formData.notes
      });
      
      if (response.data.success) {
        // Navigate to new booking detail
        const newBookingId = response.data.data.new_booking?.id || id;
        navigate(`/admin/bookings/${newBookingId}`, {
          state: { message: 'Booking berhasil dijadwalkan ulang' }
        });
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    // Handle if time is already in HH:mm format
    if (time.includes(':') && time.length === 5) return time;
    // Handle if time is a date string
    try {
      const date = new Date(time);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return time;
    }
  };

  const vehicleIcons = {
    'MOTORCYCLE': 'fa-motorcycle',
    'CAR': 'fa-car-side',
    'BUS': 'fa-bus',
    'TRUCK': 'fa-truck'
  };

  const vehicleLabels = {
    'MOTORCYCLE': 'Motor',
    'CAR': 'Mobil',
    'BUS': 'Bus',
    'TRUCK': 'Truk'
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
                <i className="fas fa-calendar-alt text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Jadwalkan Ulang Booking</h1>
                <p className="mt-1 text-blue-100">Kode: <span className="font-medium">{booking.booking_code}</span></p>
              </div>
            </div>
            
            <div>
              <button
                onClick={() => navigate(`/admin/bookings/${id}`)}
                className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm"
              >
                <i className="fas fa-arrow-left mr-2"></i> Kembali
              </button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Rute Saat Ini</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-route mr-2 text-blue-100"></i>
                <span className="text-lg font-bold">
                  {booking.schedule?.route?.origin || 'N/A'} - {booking.schedule?.route?.destination || 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Tanggal Keberangkatan</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-calendar-day mr-2 text-blue-100"></i>
                <span className="text-lg font-bold">
                  {booking.departure_date ? formatDate(booking.departure_date).split(',')[1].trim() : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Jumlah Penumpang</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-users mr-2 text-blue-100"></i>
                <span className="text-lg font-bold">
                  {booking.passenger_count || 0} orang
                </span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Jumlah Kendaraan</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-car mr-2 text-blue-100"></i>
                <span className="text-lg font-bold">
                  {booking.vehicle_count || 0} kendaraan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Error Messages */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <i className="fas fa-exchange-alt mr-2"></i>
                  Pilih Jadwal Baru
                </h2>
                <p className="text-blue-100 text-sm mt-1">Pilih rute dan tanggal untuk menjadwalkan ulang booking</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Route Selection */}
                <div>
                  <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Rute Perjalanan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-route text-gray-400"></i>
                    </div>
                    <select
                      id="route_id"
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={formData.route_id}
                      onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                      required
                    >
                      <option value="">Pilih Rute</option>
                      {Array.isArray(routes) && routes.map(route => (
                        <option key={route.id} value={route.id}>
                          {route.origin} → {route.destination}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label htmlFor="departure_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Keberangkatan Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-calendar-alt text-gray-400"></i>
                    </div>
                    <input
                      type="date"
                      id="departure_date"
                      value={formData.departure_date}
                      onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  {formData.departure_date && (
                    <p className="mt-2 text-sm text-gray-600">
                      {formatDate(formData.departure_date)}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={checkSchedules}
                    disabled={searchingSchedules}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {searchingSchedules ? (
                      <><i className="fas fa-spinner fa-spin mr-2"></i> Mencari...</>
                    ) : (
                      <><i className="fas fa-search mr-2"></i> Cari Jadwal</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={findNearestSchedules}
                    disabled={searchingSchedules}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-calendar-check mr-2"></i> Cari Jadwal Terdekat
                  </button>
                </div>

                {/* Nearest Schedule Results */}
                {showNearestResults && nearestSchedules.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 animate-slideIn">
                    <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                      <i className="fas fa-lightbulb mr-2"></i>
                      Jadwal Terdekat Tersedia
                    </h3>
                    <p className="text-sm text-green-700 mb-4">
                      Tanggal terdekat dengan ketersediaan: <span className="font-bold">{formatDate(nearestDate)}</span>
                    </p>
                    <div className="space-y-3">
                      {nearestSchedules.map((schedule, index) => (
                        <div
                          key={index}
                          className="bg-white border border-green-300 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1"
                          onClick={() => selectNearestSchedule(schedule)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">
                                <i className="fas fa-clock mr-2 text-green-600"></i>
                                {schedule.departure_time} - {schedule.arrival_time}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                <i className="fas fa-ship mr-2"></i>
                                {schedule.ferry_name}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                            >
                              Pilih
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Schedule Results */}
                {showScheduleResults && (
                  <div className="animate-slideIn">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <i className="fas fa-list-alt mr-2 text-blue-500"></i>
                      Jadwal Tersedia untuk {formatDate(formData.departure_date)}
                    </h3>
                    {scheduleResults.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {scheduleResults.map(schedule => (
                          <div
                            key={schedule.id}
                            data-schedule-id={schedule.id}
                            className={`border-2 rounded-xl p-5 transition-all ${
                              schedule.is_available 
                                ? 'bg-white hover:shadow-md cursor-pointer border-gray-200 hover:border-blue-300' 
                                : 'bg-gray-50 opacity-60 border-gray-200 cursor-not-allowed'
                            }`}
                            onClick={() => schedule.is_available && selectSchedule(schedule)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <p className={`text-lg font-semibold ${schedule.is_available ? 'text-gray-900' : 'text-gray-500'}`}>
                                    <i className="fas fa-clock mr-2"></i>
                                    {formatTime(schedule.departure_time)} - {formatTime(schedule.arrival_time)}
                                  </p>
                                  {schedule.is_available ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 inline-block"></span>
                                      Tersedia
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200">
                                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 inline-block"></span>
                                      Tidak Tersedia
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-600 flex items-center">
                                      <i className="fas fa-ship mr-2 text-gray-400"></i>
                                      {schedule.ferry?.name || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 flex items-center">
                                      <i className="fas fa-users mr-2 text-gray-400"></i>
                                      {schedule.available_passenger || 0} kursi tersedia
                                    </p>
                                  </div>
                                </div>
                                {!schedule.is_available && schedule.reason && (
                                  <p className="mt-3 text-sm text-red-600 font-medium flex items-center">
                                    <i className="fas fa-info-circle mr-1"></i>
                                    {schedule.reason}
                                  </p>
                                )}
                              </div>
                              {schedule.is_available && formData.schedule_id === schedule.id && (
                                <div className="ml-4">
                                  <i className="fas fa-check-circle text-2xl text-blue-600"></i>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                        <i className="fas fa-calendar-times text-4xl text-yellow-500 mb-3"></i>
                        <p className="text-yellow-800 font-medium">
                          Tidak ada jadwal tersedia untuk tanggal ini
                        </p>
                        <p className="text-sm text-yellow-700 mt-2">
                          Silakan pilih tanggal lain atau gunakan fitur "Cari Jadwal Terdekat"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan / Alasan Reschedule
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                      <i className="fas fa-sticky-note text-gray-400"></i>
                    </div>
                    <textarea
                      id="notes"
                      rows="4"
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="Tambahkan catatan atau alasan reschedule (opsional)"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!formData.schedule_id || submitting}
                    className="w-full flex items-center justify-center py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <><i className="fas fa-spinner fa-spin mr-2"></i> Memproses Reschedule...</>
                    ) : (
                      <><i className="fas fa-calendar-check mr-2"></i> Konfirmasi Jadwal Ulang</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - Current Booking Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <i className="fas fa-info-circle mr-2"></i>
                  Informasi Booking Saat Ini
                </h3>
              </div>

              <div className="p-6 space-y-4">
                {/* User Info */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Penumpang</p>
                  <p className="font-semibold text-gray-900">{booking.user?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{booking.user?.email || 'N/A'}</p>
                </div>

                {/* Current Route */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Rute Saat Ini</p>
                  <div className="flex items-center text-gray-900">
                    <span className="font-semibold">{booking.schedule?.route?.origin || 'N/A'}</span>
                    <i className="fas fa-arrow-right mx-3 text-gray-400"></i>
                    <span className="font-semibold">{booking.schedule?.route?.destination || 'N/A'}</span>
                  </div>
                </div>

                {/* Current Schedule */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Jadwal Saat Ini</p>
                  <p className="font-semibold text-gray-900">
                    {booking.departure_date ? formatDate(booking.departure_date) : 'N/A'}
                  </p>
                  <p className="text-gray-700 mt-1 flex items-center">
                    <i className="fas fa-clock mr-2 text-gray-400"></i>
                    {formatTime(booking.schedule?.departure_time)} - {formatTime(booking.schedule?.arrival_time)}
                  </p>
                  <p className="text-gray-700 mt-1 flex items-center">
                    <i className="fas fa-ship mr-2 text-gray-400"></i>
                    {booking.schedule?.ferry?.name || 'N/A'}
                  </p>
                </div>

                {/* Passengers & Vehicles */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Detail Booking</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 flex items-center">
                        <i className="fas fa-users mr-2 text-gray-400"></i>
                        Penumpang
                      </span>
                      <span className="font-semibold">{booking.passenger_count || 0} orang</span>
                    </div>
                    {booking.vehicle_count > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Kendaraan:</p>
                        <div className="space-y-1">
                          {booking.vehicles?.map((vehicle, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <i className={`fas ${vehicleIcons[vehicle.type]} mr-2 text-gray-400`}></i>
                              <span className="text-gray-700">{vehicleLabels[vehicle.type]}</span>
                              <span className="ml-auto text-gray-600">{vehicle.license_plate}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Amount */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Pembayaran</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(booking.total_amount || 0)}
                  </p>
                </div>
              </div>
            </div>
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

export default BookingReschedule;