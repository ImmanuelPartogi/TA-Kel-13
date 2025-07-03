import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { operatorSchedulesService } from '../../../services/operatorSchedules.service';
import { operatorRoutesService } from '../../../services/operatorRoutes.service';
import { useAuth } from '../../../contexts/AuthContext';

const SchedulesList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    route_id: searchParams.get('route_id') || '',
    date: searchParams.get('date') || ''
  });

  useEffect(() => {
    fetchRoutes();
    fetchSchedules();
  }, [searchParams]);

  const fetchRoutes = async () => {
    try {
      const response = await operatorRoutesService.getRoutes({ status: 'active' });
      let routesData = [];

      if (response.data) {
        if (Array.isArray(response.data)) {
          routesData = response.data;
        } else if (response.data.data) {
          if (Array.isArray(response.data.data)) {
            routesData = response.data.data;
          } else if (response.data.data.routes) {
            routesData = response.data.data.routes;
          }
        } else if (response.data.routes) {
          routesData = response.data.routes;
        }
      }

      setRoutes(routesData);
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes([]);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams);
      const response = await operatorSchedulesService.getSchedules(params);

      // Tambahkan debugging
      // console.log('API Response:', response.data);
      // if (response.data?.data?.length > 0) {
      //   console.log('Sample Schedule:', response.data.data[0]);
      //   console.log('Sample Route:', response.data.data[0].route);
      //   console.log('Duration Value:', response.data.data[0].route?.duration);
      // }

      // Lanjutkan kode seperti biasa
      if (response.data && response.data.data) {
        if (response.data.data.schedules) {
          setSchedules(response.data.data.schedules);
        } else {
          setSchedules(response.data.data);
        }
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilter = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    setSearchParams(queryParams);
  };

  const handleReset = () => {
    setFilters({
      route_id: '',
      date: ''
    });
    setSearchParams(new URLSearchParams());
  };

  const getDayNames = (daysString) => {
    if (!daysString) return [];

    const dayNames = {
      '1': 'Senin',
      '2': 'Selasa',
      '3': 'Rabu',
      '4': 'Kamis',
      '5': 'Jumat',
      '6': 'Sabtu',
      '7': 'Minggu'
    };

    return daysString.split(',').map(day => dayNames[day] || day);
  };

  const formatDuration = (minutes) => {
    // Pastikan minutes adalah angka
    if (!minutes && minutes !== 0) return 'N/A';

    const numMinutes = Number(minutes);

    // Jika bukan angka yang valid
    if (isNaN(numMinutes)) return 'N/A';

    const hours = Math.floor(numMinutes / 60);
    const mins = numMinutes % 60;

    return `${hours}j${mins > 0 ? ` ${mins}m` : ''}`;
  };

  const formatTime = (isoTimeString) => {
    if (!isoTimeString) return 'N/A';

    try {
      // Membuat objek Date dari string waktu ISO
      const date = new Date(isoTimeString);

      // Mengecek apakah date valid
      if (isNaN(date.getTime())) return 'Format Waktu Invalid';

      // Memformat ke jam:menit
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error memformat waktu:", error);
      return 'Error Format';
    }
  };

  const calculateDuration = (schedule) => {
    if (schedule.arrival_time && schedule.departure_time) {
      try {
        const arrival = new Date(schedule.arrival_time);
        const departure = new Date(schedule.departure_time);
        const diffMinutes = Math.round((arrival - departure) / (1000 * 60));
        return diffMinutes > 0 ? diffMinutes : 0;
      } catch (error) {
        console.error("Error menghitung durasi:", error);
        return 0;
      }
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Jadwal Kapal</h1>
                  <p className="mt-1 text-blue-100">Kelola dan pantau jadwal keberangkatan kapal</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-100 text-sm">Total Jadwal</p>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-2xl font-bold">
                    {schedules.length}
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-100 text-sm">Rute Aktif</p>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-2xl font-bold">
                    {routes.length}
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-100 text-sm">Jadwal Hari Ini</p>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 mr-2 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-2xl font-bold">
                    {schedules.filter(schedule => {
                      const today = new Date().getDay().toString();
                      return schedule.days && schedule.days.split(',').includes(today);
                    }).length}
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-100 text-sm">Keberangkatan Terjadwal</p>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 mr-2 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-2xl font-bold">
                    {schedules.reduce((acc, schedule) => {
                      const daysCount = schedule.days ? schedule.days.split(',').length : 0;
                      return acc + daysCount;
                    }, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Alert */}
        {(!user?.assigned_routes ||
          typeof user?.assigned_routes !== 'object' ||
          Object.keys(user?.assigned_routes).length === 0) && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-5 mb-6 rounded-xl shadow-lg animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-yellow-800">Perhatian</h3>
                  <p className="mt-1 text-sm text-yellow-700">Anda belum memiliki rute yang ditugaskan. Silakan hubungi administrator untuk mengatur rute yang dapat Anda akses.</p>
                </div>
              </div>
            </div>
          )}

        {/* Modern Filter Card
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter & Pencarian
            </h2>
          </div>

          <div className="p-6 bg-white">
            <form onSubmit={handleFilter} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">Rute Perjalanan</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <select
                      id="route_id"
                      name="route_id"
                      value={filters.route_id}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Semua Rute</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.origin} → {route.destination}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Keberangkatan</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={filters.date}
                      onChange={handleFilterChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-end space-x-3">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filter
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div> */}

        {/* Schedules Display */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
              <div className="animate-ping absolute top-0 left-0 rounded-full h-16 w-16 border-2 border-blue-600 opacity-30"></div>
            </div>
            <p className="ml-4 text-lg text-gray-600 font-medium">Memuat jadwal...</p>
          </div>
        ) : (
          <>
            {schedules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5 text-white relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M0,0 L100,0 L100,100 Z" fill="#fff" />
                        </svg>
                      </div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold">
                            {schedule.route?.origin || 'Unknown'} → {schedule.route?.destination || 'Unknown'}
                          </h3>
                          <span className="bg-white text-blue-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                            {schedule.route?.route_code || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center mt-3">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-sm opacity-90">{schedule.ferry?.name || 'Ferry Tidak Diketahui'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      {/* Time Display */}
                      <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Berangkat</p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatTime(schedule.departure_time)}
                          </p>
                        </div>

                        <div className="flex-1 mx-4">
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="h-1 w-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 rounded-full"></div>
                            </div>
                            <div className="relative flex justify-between">
                              <div className="h-4 w-4 rounded-full bg-blue-600 border-3 border-white shadow-sm"></div>
                              <div className="absolute left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-sm">
                                <span className="text-xs font-medium text-gray-700">
                                  {formatDuration(calculateDuration(schedule))}
                                </span>
                              </div>
                              <div className="h-4 w-4 rounded-full bg-blue-600 border-3 border-white shadow-sm"></div>
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Tiba</p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatTime(schedule.arrival_time)}
                          </p>
                        </div>
                      </div>

                      {/* Schedule Details */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200 shadow-sm">
                          <p className="text-xs text-blue-700 font-semibold mb-1">Hari Operasi</p>
                          <p className="text-sm font-medium text-blue-900">
                            {getDayNames(schedule.days).join(', ') || 'Tidak Ada'}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200 shadow-sm">
                          <p className="text-xs text-purple-700 font-semibold mb-1">Kapasitas</p>
                          <p className="text-sm font-medium text-purple-900">
                            {schedule.ferry?.capacity_passenger || 0} Penumpang
                          </p>
                        </div>
                      </div>

                      {/* Modern Action Buttons */}
                      <div className="flex space-x-3 mt-6">
                        <Link
                          to={`/operator/schedules/${schedule.id}`}
                          className="flex-1 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg font-medium hover:bg-blue-100 transition-all duration-200 text-center shadow-sm hover:shadow-md flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Detail
                        </Link>
                        <Link
                          to={`/operator/schedules/${schedule.id}/dates`}
                          className="flex-1 bg-green-50 text-green-700 px-4 py-2.5 rounded-lg font-medium hover:bg-green-100 transition-all duration-200 text-center shadow-sm hover:shadow-md flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Tanggal
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada jadwal tersedia</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Tidak ada jadwal yang sesuai dengan filter Anda. Coba ubah kriteria pencarian atau reset filter.
                </p>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filter
                </button>
              </div>
            )}
          </>
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

export default SchedulesList;