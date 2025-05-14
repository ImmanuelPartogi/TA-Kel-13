import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import adminScheduleService from '../../../services/adminSchedule.service';

const SchedulesList = () => {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [ferries, setFerries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
    per_page: 10
  });

  // Get filters from URL
  const route_id = searchParams.get('route_id') || '';
  const ferry_id = searchParams.get('ferry_id') || '';
  const status = searchParams.get('status') || '';
  const page = searchParams.get('page') || 1;

  const dayNames = {
    1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis',
    5: 'Jumat', 6: 'Sabtu', 7: 'Minggu'
  };

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  // Debug state changes
  useEffect(() => {
    console.log('Current schedules state:', schedules);
    console.log('Current routes state:', routes);
    console.log('Current ferries state:', ferries);
    console.log('Current pagination state:', pagination);
  }, [schedules, routes, ferries, pagination]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, routesRes, ferriesRes] = await Promise.all([
        adminScheduleService.get('/admin-panel/schedules', {
          params: { route_id, ferry_id, status, page }
        }),
        adminScheduleService.get('/admin-panel/routes'),
        adminScheduleService.get('/admin-panel/ferries')
      ]);
      
      // Debug response dengan lebih detail
      console.log('Schedules Response:', schedulesRes.data);
      console.log('Schedules data.data:', schedulesRes.data.data);
      console.log('Routes Response:', routesRes.data);
      console.log('Routes data.data:', routesRes.data.data);
      console.log('Ferries Response:', ferriesRes.data);
      console.log('Ferries data.data:', ferriesRes.data.data);
      
      // Handle schedules response
      if (schedulesRes.data.data) {
        // Cek berbagai kemungkinan struktur
        if (schedulesRes.data.data.schedules) {
          const schedulesData = schedulesRes.data.data.schedules;
          console.log('Schedules pagination data:', schedulesData);
          setSchedules(schedulesData.data || []);
          
          if (schedulesData.current_page) {
            setPagination({
              current_page: schedulesData.current_page,
              total: schedulesData.total,
              last_page: schedulesData.last_page,
              per_page: schedulesData.per_page
            });
          }
        } else if (Array.isArray(schedulesRes.data.data)) {
          console.log('Schedules is array:', schedulesRes.data.data);
          setSchedules(schedulesRes.data.data);
        } else if (schedulesRes.data.data.data) {
          console.log('Schedules has data.data.data:', schedulesRes.data.data.data);
          setSchedules(schedulesRes.data.data.data);
          
          if (schedulesRes.data.data.current_page) {
            setPagination({
              current_page: schedulesRes.data.data.current_page,
              total: schedulesRes.data.data.total,
              last_page: schedulesRes.data.data.last_page,
              per_page: schedulesRes.data.data.per_page
            });
          }
        } else {
          console.log('Unknown schedules structure, setting as is');
          setSchedules([]);
        }
      }
      
      // Handle routes response
      if (routesRes.data.data) {
        if (Array.isArray(routesRes.data.data)) {
          console.log('Routes is array:', routesRes.data.data);
          setRoutes(routesRes.data.data);
        } else if (routesRes.data.data.routes) {
          console.log('Routes has data.routes:', routesRes.data.data.routes);
          setRoutes(routesRes.data.data.routes);
        } else if (routesRes.data.data.data) {
          console.log('Routes has data.data:', routesRes.data.data.data);
          setRoutes(routesRes.data.data.data);
        } else {
          console.log('Unknown routes structure');
          setRoutes([]);
        }
      }
      
      // Handle ferries response
      if (ferriesRes.data.data) {
        if (Array.isArray(ferriesRes.data.data)) {
          console.log('Ferries is array:', ferriesRes.data.data);
          setFerries(ferriesRes.data.data);
        } else if (ferriesRes.data.data.ferries) {
          console.log('Ferries has data.ferries:', ferriesRes.data.data.ferries);
          setFerries(ferriesRes.data.data.ferries);
        } else if (ferriesRes.data.data.data) {
          console.log('Ferries has data.data:', ferriesRes.data.data.data);
          setFerries(ferriesRes.data.data.data);
        } else {
          console.log('Unknown ferries structure');
          setFerries([]);
        }
      }
      
      // Debug final state
      console.log('Final schedules state will be:', schedules);
      console.log('Final routes state will be:', routes);
      console.log('Final ferries state will be:', ferries);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const params = {};
    
    ['route_id', 'ferry_id', 'status'].forEach(key => {
      const value = formData.get(key);
      if (value) params[key] = value;
    });
    
    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearchParams({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;
    
    try {
      await adminScheduleService.delete(`/admin-panel/schedules/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Gagal menghapus jadwal: ' + (error.response?.data?.message || error.message));
    }
  };

  const getDaysText = (daysString) => {
    if (!daysString) return '';
    const days = daysString.toString().split(',');
    return days.map(day => dayNames[day] || '').filter(Boolean).join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Manajemen Jadwal</h1>
        <Link to="/admin/schedules/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 rounded-md font-semibold text-xs text-white uppercase hover:bg-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Jadwal
        </Link>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Filter Jadwal</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  id="route_id" 
                  name="route_id"
                  defaultValue={route_id}
                >
                  <option value="">Semua Rute</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.origin} - {route.destination} ({route.route_code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ferry_id" className="block text-sm font-medium text-gray-700 mb-1">Kapal</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  id="ferry_id" 
                  name="ferry_id"
                  defaultValue={ferry_id}
                >
                  <option value="">Semua Kapal</option>
                  {ferries.map(ferry => (
                    <option key={ferry.id} value={ferry.id}>
                      {ferry.name} ({ferry.registration_number})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  id="status" 
                  name="status"
                  defaultValue={status}
                >
                  <option value="">Semua Status</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Tidak Aktif</option>
                  <option value="CANCELLED">Dibatalkan</option>
                  <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <button 
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-blue-600 rounded-md font-medium text-sm text-white hover:bg-blue-700 mr-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Cari
              </button>
              {(route_id || ferry_id || status) && (
                <button 
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center px-4 py-2 bg-gray-200 rounded-md font-medium text-sm text-gray-700 hover:bg-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Debug Info */}
      {schedules.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Tidak ada jadwal yang ditampilkan. Silakan periksa console untuk debug info.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Daftar Jadwal</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keberangkatan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kedatangan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari Operasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.length > 0 ? schedules.map(schedule => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.route?.origin || 'N/A'} - {schedule.route?.destination || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.ferry?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.departure_time || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.arrival_time || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDaysText(schedule.days)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {schedule.status === 'ACTIVE' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Aktif
                        </span>
                      ) : schedule.status === 'INACTIVE' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Tidak Aktif
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {schedule.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/admin/schedules/${schedule.id}/dates`}
                          className="text-white bg-indigo-600 hover:bg-indigo-700 rounded-md p-1.5 inline-flex items-center justify-center"
                          title="Kelola Tanggal">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </Link>
                        <Link to={`/admin/schedules/${schedule.id}/edit`}
                          className="text-white bg-blue-600 hover:bg-blue-700 rounded-md p-1.5 inline-flex items-center justify-center"
                          title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button 
                          onClick={() => handleDelete(schedule.id)}
                          className="text-white bg-red-600 hover:bg-red-700 rounded-md p-1.5 inline-flex items-center justify-center"
                          title="Hapus">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Tidak ada data jadwal</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan{' '}
                    <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span>
                    {' '}sampai{' '}
                    <span className="font-medium">
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                    </span>
                    {' '}dari{' '}
                    <span className="font-medium">{pagination.total}</span>
                    {' '}hasil
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setSearchParams(prev => ({ ...prev, page: Math.max(1, pagination.current_page - 1) }))}
                      disabled={pagination.current_page <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {[...Array(pagination.last_page)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setSearchParams(prev => ({ ...prev, page: pageNumber }))}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNumber === pagination.current_page
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setSearchParams(prev => ({ ...prev, page: Math.min(pagination.last_page, pagination.current_page + 1) }))}
                      disabled={pagination.current_page >= pagination.last_page}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulesList;