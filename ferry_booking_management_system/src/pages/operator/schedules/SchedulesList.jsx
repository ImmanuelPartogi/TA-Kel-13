// src/pages/operator/schedules/SchedulesList.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { operatorSchedulesService } from '../../../services/operatorSchedules.service';
import { operatorRoutesService } from '../../../services/operatorRoutes.service';

const SchedulesList = () => {
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
      '0': 'Minggu',
      '1': 'Senin',
      '2': 'Selasa',
      '3': 'Rabu',
      '4': 'Kamis',
      '5': 'Jumat',
      '6': 'Sabtu',
    };

    return daysString.split(',').map(day => dayNames[day] || day);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}j${mins > 0 ? ` ${mins}m` : ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Jadwal Kapal</h1>
              <p className="text-gray-600">Kelola dan pantau jadwal keberangkatan kapal</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Update terakhir: {new Date().toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
          </div> */}

          {/* Modern Filter Section */}
          <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="route_id" className="block text-sm font-medium text-gray-700">
                Rute Perjalanan
              </label>
              <select
                id="route_id"
                name="route_id"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                value={filters.route_id}
                onChange={handleFilterChange}
              >
                <option value="">Semua Rute</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.origin} → {route.destination}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Tanggal Keberangkatan
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
              />
            </div>

            <div className="flex items-end space-x-3">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Filter
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Modern Schedules Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-ping rounded-full h-8 w-8 bg-blue-600 opacity-20"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Modern Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold">
                          {schedule.route?.origin || 'Unknown'} → {schedule.route?.destination || 'Unknown'}
                        </h3>
                        <span className="bg-white text-blue-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                          {schedule.route?.route_code || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center mt-3">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        <span className="text-sm opacity-90">{schedule.ferry?.name || 'Ferry Tidak Diketahui'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Modern Card Body */}
                  <div className="p-6">
                    {/* Time Display */}
                    <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-xl p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Berangkat</p>
                        <p className="text-sm font-bold text-gray-900">
                          {schedule.departure_time
                            ? new Date(schedule.departure_time).toLocaleString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                            : 'N/A'}
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
                                {formatDuration(schedule.route?.duration || 0)}
                              </span>
                            </div>
                            <div className="h-4 w-4 rounded-full bg-blue-600 border-3 border-white shadow-sm"></div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Tiba</p>
                        <p className="text-sm font-bold text-gray-900">
                          {schedule.arrival_time
                            ? new Date(schedule.arrival_time).toLocaleString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Modern Details */}
                    <div className="flex items-start justify-between gap-4 text-gray-600">
                      {/* Kapasitas */}
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-2">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Kapasitas</p>
                          <p className="text-sm font-medium">{schedule.ferry?.capacity_passenger || 0} Penumpang</p>
                        </div>
                      </div>

                      {/* Jadwal Operasi */}
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center mr-2">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 011-1 1 1 0 110 2H6a1 1 0 010-2zm0 4a1 1 0 011-1 1 1 0 110 2H6a1 1 0 010-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Jadwal Operasi</p>
                          <p className="text-sm font-medium">{getDayNames(schedule.days).join(', ')}</p>
                        </div>
                      </div>
                    </div>


                    {/* Modern Action Buttons */}
                    <div className="flex space-x-3 mt-6">
                      <Link
                        to={`/operator/schedules/${schedule.id}`}
                        className="flex-1 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl font-medium hover:bg-blue-100 transition-all duration-200 text-center group"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          Detail
                        </span>
                      </Link>
                      <Link
                        to={`/operator/schedules/${schedule.id}/dates`}
                        className="flex-1 bg-green-50 text-green-700 px-4 py-3 rounded-xl font-medium hover:bg-green-100 transition-all duration-200 text-center group"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                          Tanggal
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada jadwal tersedia</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Tidak ada jadwal yang sesuai dengan filter Anda. Coba ubah kriteria pencarian atau reset filter.
                  </p>
                  <button
                    onClick={handleReset}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulesList;