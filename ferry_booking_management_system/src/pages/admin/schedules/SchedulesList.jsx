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
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // table or grid

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
    
    // Auto-hide alert after 5 seconds
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({...alert, show: false});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, alert.show]);

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

      // Handle schedules response
      if (schedulesRes.data.data) {
        // Cek berbagai kemungkinan struktur
        if (schedulesRes.data.data.schedules) {
          const schedulesData = schedulesRes.data.data.schedules;
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
          setSchedules(schedulesRes.data.data);
        } else if (schedulesRes.data.data.data) {
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
          setSchedules([]);
        }
      }

      // Handle routes response
      if (routesRes.data.data) {
        if (Array.isArray(routesRes.data.data)) {
          setRoutes(routesRes.data.data);
        } else if (routesRes.data.data.routes) {
          setRoutes(routesRes.data.data.routes);
        } else if (routesRes.data.data.data) {
          setRoutes(routesRes.data.data.data);
        } else {
          setRoutes([]);
        }
      }

      // Handle ferries response
      if (ferriesRes.data.data) {
        if (Array.isArray(ferriesRes.data.data)) {
          setFerries(ferriesRes.data.data);
        } else if (ferriesRes.data.data.ferries) {
          setFerries(ferriesRes.data.data.ferries);
        } else if (ferriesRes.data.data.data) {
          setFerries(ferriesRes.data.data.data);
        } else {
          setFerries([]);
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal memuat data jadwal'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    setSearchParams({
      route_id: formData.get('route_id') || '',
      ferry_id: formData.get('ferry_id') || '',
      status: formData.get('status') || '',
      page: '1' // Reset to first page on new search
    });
  };

  const handleReset = () => {
    setSearchParams({});
  };

  const confirmDelete = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedSchedule) return;

    try {
      await adminScheduleService.delete(`/admin-panel/schedules/${selectedSchedule.id}`);
      fetchData();
      setShowDeleteModal(false);
      setSelectedSchedule(null);
      setAlert({
        show: true,
        type: 'success',
        message: 'Jadwal berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal menghapus jadwal: ' + (error.response?.data?.message || error.message)
      });
    }
  };

  const getDaysText = (daysString) => {
    if (!daysString) return '';
    const days = daysString.toString().split(',');
    return days.map(day => dayNames[day] || '').filter(Boolean).join(', ');
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.last_page) return;
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
  };

  const getFirstItem = () => ((pagination.current_page - 1) * pagination.per_page) + 1;
  const getLastItem = () => Math.min(pagination.current_page * pagination.per_page, pagination.total);

  // Status badge configuration
  const getStatusConfig = (status) => {
    switch(status) {
      case 'ACTIVE':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-800',
          icon: 'fa-check-circle',
          label: 'Aktif',
          border: 'border-emerald-200',
          indicator: 'bg-emerald-500'
        };
      case 'WEATHER_ISSUE':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-800',
          icon: 'fa-cloud-rain',
          label: 'Masalah Cuaca',
          border: 'border-amber-200',
          indicator: 'bg-amber-500'
        };
      case 'CANCELLED':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: 'fa-ban',
          label: 'Dibatalkan',
          border: 'border-red-200',
          indicator: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: 'fa-ban',
          label: 'Tidak Aktif',
          border: 'border-gray-200',
          indicator: 'bg-gray-500'
        };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                <h1 className="text-3xl font-bold">Manajemen Jadwal</h1>
                <p className="mt-1 text-blue-100">Kelola seluruh jadwal pelayaran dalam sistem</p>
              </div>
            </div>
            
            <div>
              <Link to="/admin/schedules/create"
                className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                <i className="fas fa-plus mr-2"></i> Tambah Jadwal Baru
              </Link>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Total Jadwal</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-calendar-alt mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{pagination.total}</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Jadwal Aktif</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-check-circle mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">
                  {schedules.filter(schedule => schedule.status === 'ACTIVE').length}
                </span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Rute Tersedia</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-route mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">
                  {routes.length}
                </span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Kapal Tersedia</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-ship mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">
                  {ferries.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Alert Messages with modern styling */}
        {alert.show && (
          <div className={`mb-6 rounded-lg shadow-lg overflow-hidden animate-slideIn`}>
            <div className={`${alert.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} px-4 py-2 text-white flex items-center justify-between`}>
              <div className="flex items-center">
                <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                <span className="font-medium">{alert.type === 'success' ? 'Sukses' : 'Error'}</span>
              </div>
              <button onClick={() => setAlert({...alert, show: false})} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={`${alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'} px-4 py-3 border-t`}>
              {alert.message}
            </div>
          </div>
        )}

        {/* Modern Filter Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-8 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <i className="fas fa-filter text-blue-500 mr-2"></i>
              Filter & Pencarian
            </h2>
          </div>
          
          <div className="p-6 bg-white">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-route text-gray-400"></i>
                    </div>
                    <select
                      id="route_id"
                      name="route_id"
                      defaultValue={route_id}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Semua Rute</option>
                      {routes.map(route => (
                        <option key={route.id} value={route.id}>
                          {route.origin} - {route.destination} {route.route_code ? `(${route.route_code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="ferry_id" className="block text-sm font-medium text-gray-700 mb-1">Kapal</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-ship text-gray-400"></i>
                    </div>
                    <select
                      id="ferry_id"
                      name="ferry_id"
                      defaultValue={ferry_id}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Semua Kapal</option>
                      {ferries.map(ferry => (
                        <option key={ferry.id} value={ferry.id}>
                          {ferry.name} {ferry.registration_number ? `(${ferry.registration_number})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-toggle-on text-gray-400"></i>
                    </div>
                    <select
                      id="status"
                      name="status"
                      defaultValue={status}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Semua Status</option>
                      <option value="ACTIVE">Aktif</option>
                      <option value="INACTIVE">Tidak Aktif</option>
                      <option value="CANCELLED">Dibatalkan</option>
                      <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {(route_id || ferry_id || status) && (
                  <button
                    onClick={handleReset}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    <i className="fas fa-times mr-2"></i> Reset
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <i className="fas fa-search mr-2"></i> Cari
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* View Toggle & Result Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">
            Menampilkan <span className="font-medium">{getFirstItem()}</span> - 
            <span className="font-medium"> {getLastItem()}</span> dari 
            <span className="font-medium"> {pagination.total}</span> jadwal
          </p>
          
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-gray-100 rounded-lg flex">
              <button 
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <i className="fas fa-list"></i>
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <i className="fas fa-th-large"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-8 text-center">
            <div className="inline-block relative">
              <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="mt-4 text-gray-600">Memuat data jadwal...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && schedules.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-calendar-alt text-gray-400 text-4xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Data Jadwal</h3>
            <p className="text-gray-600 mb-6">Belum ada jadwal yang ditambahkan atau sesuai dengan filter yang Anda pilih</p>
            <Link to="/admin/schedules/create" className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
              <i className="fas fa-plus mr-2"></i> Tambah Jadwal Baru
            </Link>
          </div>
        )}

        {/* Table View */}
        {!loading && schedules.length > 0 && viewMode === 'table' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jadwal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules.map((schedule, index) => {
                    const statusConfig = getStatusConfig(schedule.status);
                    return (
                      <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getFirstItem() + index}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                              <i className="fas fa-route"></i>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {schedule.route?.origin || 'N/A'} - {schedule.route?.destination || 'N/A'}
                              </div>
                              {schedule.route?.route_code && (
                                <div className="text-xs text-gray-500">{schedule.route.route_code}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                              <i className="fas fa-ship"></i>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{schedule.ferry?.name || 'N/A'}</div>
                              {schedule.ferry?.registration_number && (
                                <div className="text-xs text-gray-500">{schedule.ferry.registration_number}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium flex items-center">
                              <i className="fas fa-ship mr-1 text-blue-500"></i>
                              {schedule.departure_time ? new Intl.DateTimeFormat('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour24: true,
                              }).format(new Date(schedule.departure_time)) : 'N/A'}
                            </span>
                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-medium flex items-center">
                              <i className="fas fa-ship mr-1 text-emerald-500"></i>
                              {schedule.arrival_time ? new Intl.DateTimeFormat('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour24: true,
                              }).format(new Date(schedule.arrival_time)) : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-xs font-medium">
                              <i className="fas fa-calendar-day mr-1"></i> {getDaysText(schedule.days)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                            <span className={`w-1.5 h-1.5 ${statusConfig.indicator} rounded-full mr-1.5 ${schedule.status === 'ACTIVE' ? 'animate-pulse' : ''}`}></span>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link to={`/admin/schedules/${schedule.id}/dates`}
                              className="btn-icon bg-purple-50 hover:bg-purple-100 text-purple-600 p-2 rounded-lg transition-colors"
                              title="Kelola Tanggal">
                              <i className="fas fa-calendar-week"></i>
                            </Link>
                            <Link to={`/admin/schedules/${schedule.id}`}
                              className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                              title="Detail">
                              <i className="fas fa-eye"></i>
                            </Link>
                            <Link to={`/admin/schedules/${schedule.id}/edit`}
                              className="btn-icon bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded-lg transition-colors"
                              title="Edit">
                              <i className="fas fa-edit"></i>
                            </Link>
                            <button
                              onClick={() => confirmDelete(schedule)}
                              className="btn-icon bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grid View */}
        {!loading && schedules.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {schedules.map(schedule => {
              const statusConfig = getStatusConfig(schedule.status);
              return (
                <div key={schedule.id} className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 relative">
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fas fa-calendar-alt text-white text-5xl opacity-25"></i>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h3 className="text-xl font-bold">
                        {schedule.route?.origin || 'N/A'} - {schedule.route?.destination || 'N/A'}
                      </h3>
                      <p className="text-sm text-white/80">{schedule.ferry?.name || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                        <span className={`w-1.5 h-1.5 ${statusConfig.indicator} rounded-full mr-1.5 ${schedule.status === 'ACTIVE' ? 'animate-pulse' : ''}`}></span>
                        {statusConfig.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-blue-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-blue-600 mb-1">Keberangkatan</p>
                        <div className="flex items-center justify-center">
                          <i className="fas fa-plane-departure text-blue-400 mr-1"></i>
                          <span className="text-lg font-semibold text-blue-700">
                            {schedule.departure_time ? new Intl.DateTimeFormat('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour24: true,
                            }).format(new Date(schedule.departure_time)) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-emerald-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-emerald-600 mb-1">Kedatangan</p>
                        <div className="flex items-center justify-center">
                          <i className="fas fa-plane-arrival text-emerald-400 mr-1"></i>
                          <span className="text-lg font-semibold text-emerald-700">
                            {schedule.arrival_time ? new Intl.DateTimeFormat('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour24: true,
                            }).format(new Date(schedule.arrival_time)) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-3 rounded-lg mb-4">
                      <p className="text-xs text-purple-600 mb-1 text-center">Hari Operasi</p>
                      <p className="text-center text-sm font-medium text-purple-700">
                        {getDaysText(schedule.days) || 'Tidak Ada'}
                      </p>
                    </div>
                    
                    <div className="flex justify-between border-t border-gray-100 pt-4">
                      <Link to={`/admin/schedules/${schedule.id}/dates`} className="btn-icon bg-purple-50 hover:bg-purple-100 text-purple-600 p-2 rounded-lg transition-colors">
                        <i className="fas fa-calendar-week"></i>
                      </Link>
                      <Link to={`/admin/schedules/${schedule.id}`} className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors">
                        <i className="fas fa-eye"></i>
                      </Link>
                      <Link to={`/admin/schedules/${schedule.id}/edit`} className="btn-icon bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded-lg transition-colors">
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        onClick={() => confirmDelete(schedule)}
                        className="btn-icon bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modern Pagination */}
        {!loading && pagination.total > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              Menampilkan <span className="font-medium">{getFirstItem()}</span> - 
              <span className="font-medium"> {getLastItem()}</span> dari 
              <span className="font-medium"> {pagination.total}</span> hasil
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={() => handlePageChange(1)}
                disabled={pagination.current_page === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button 
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-left"></i>
              </button>
              
              {/* Page numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                  let pageNum;
                  if (pagination.last_page <= 5) {
                    // Show all pages if 5 or fewer
                    pageNum = i + 1;
                  } else if (pagination.current_page <= 3) {
                    // Near the start
                    pageNum = i + 1;
                  } else if (pagination.current_page >= pagination.last_page - 2) {
                    // Near the end
                    pageNum = pagination.last_page - 4 + i;
                  } else {
                    // Middle cases
                    pageNum = pagination.current_page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors shadow-sm 
                        ${pagination.current_page === pageNum ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-right"></i>
              </button>
              <button 
                onClick={() => handlePageChange(pagination.last_page)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-modal-in">
            <div className="p-6">
              <div className="text-center mb-5">
                <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus jadwal:</p>
                <div className="bg-gray-50 rounded-lg p-3 mt-3 border border-gray-200">
                  <p className="font-semibold text-lg text-gray-800">
                    {selectedSchedule?.route?.origin || 'N/A'} - {selectedSchedule?.route?.destination || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    {selectedSchedule?.departure_time 
                      ? new Intl.DateTimeFormat('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour24: true,
                        }).format(new Date(selectedSchedule.departure_time)) 
                      : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">
                      Jadwal yang sudah memiliki pemesanan tidak dapat dihapus. Pastikan tidak ada pemesanan terkait untuk melanjutkan.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDelete}
                  className="w-full py-3 px-4 bg-red-500 rounded-lg text-white font-medium hover:bg-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i> Hapus Jadwal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        
        @keyframes modal-in {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-modal-in {
          animation: modal-in 0.3s ease-out forwards;
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

export default SchedulesList;