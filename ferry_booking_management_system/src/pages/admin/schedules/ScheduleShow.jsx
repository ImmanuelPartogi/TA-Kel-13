import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import adminScheduleService from '../../../services/adminSchedule.service';

const ScheduleShow = () => {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [scheduleDates, setScheduleDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter] = useState({
    month: '',
    year: new Date().getFullYear()
  });
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'dates'
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [searchParams] = useSearchParams();
  const editDateId = searchParams.get('edit');
  const dayNames = {
    1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis',
    5: 'Jumat', 6: 'Sabtu', 7: 'Minggu'
  };

  useEffect(() => {
    fetchSchedule();

    // Auto-hide alert after 5 seconds
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [id, alert.show]);

  useEffect(() => {
    if (schedule) {
      fetchScheduleDates();
    }
  }, [schedule, filter]);

  useEffect(() => {
    if (editDateId && scheduleDates.length > 0) {
      // if (dateToEdit) {
      //   openEditModal(dateToEdit);
      // }
    }
  }, [editDateId, scheduleDates]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await adminScheduleService.getScheduleDetail(id);
      setSchedule(response.data.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal memuat detail jadwal'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleDates = async () => {
    try {
      let params = {};

      if (filter.month) params.month = filter.month;
      if (filter.year) params.year = filter.year;

      const response = await adminScheduleService.getScheduleDates(id, params);

      console.log('Schedule dates response:', response);

      if (response && response.data && response.data.status === 'success') {
        console.log('Data structure:', response.data.data);

        if (response.data.data && response.data.data.dates) {
          console.log('Dates found:', response.data.data.dates);
          setScheduleDates(response.data.data.dates.data || response.data.data.dates || []);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log('Data is array:', response.data.data);
          setScheduleDates(response.data.data);
        } else {
          console.log('No recognizable date structure, using empty array');
          setScheduleDates([]);
        }
      } else {
        console.log('Invalid response structure:', response);
        setScheduleDates([]);
      }
    } catch (error) {
      console.error('Error fetching schedule dates:', error);
      setScheduleDates([]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeString) => {
    if (adminScheduleService.formatTime && timeString) {
      return adminScheduleService.formatTime(timeString);
    }
    if (!timeString) return '-';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysText = (daysString) => {
    if (!daysString) return 'Tidak ada';
    const days = daysString.toString().split(',');
    return days.map(day => dayNames[day] || '').filter(Boolean).join(', ');
  };

  // Status badge configuration - sama dengan SchedulesList dan ScheduleEdit
  const getStatusConfig = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'AVAILABLE':
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
      case 'DELAYED':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: 'fa-clock',
          label: 'Tertunda',
          border: 'border-yellow-200',
          indicator: 'bg-yellow-500'
        };
      case 'FULL':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: 'fa-users',
          label: 'Penuh',
          border: 'border-blue-200',
          indicator: 'bg-blue-500'
        };
      case 'DEPARTED':
        return {
          bg: 'bg-indigo-100',
          text: 'text-indigo-800',
          icon: 'fa-ship',
          label: 'Selesai',
          border: 'border-indigo-200',
          indicator: 'bg-indigo-500'
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

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        <span className={`w-1.5 h-1.5 ${config.indicator} rounded-full mr-1.5 ${status === 'ACTIVE' ? 'animate-pulse' : ''}`}></span>
        {config.label}
      </span>
    );
  };

  // Loading State - sama dengan SchedulesList dan ScheduleEdit
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-md p-8 text-center">
        <div className="inline-block relative">
          <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="mt-4 text-gray-600">Memuat detail jadwal...</p>
      </div>
    );
  }

  // Not Found State
  if (!schedule) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-md p-12 text-center">
        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-exclamation-circle text-gray-400 text-4xl"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Jadwal Tidak Ditemukan</h3>
        <p className="text-gray-600 mb-6">Jadwal yang Anda cari mungkin telah dihapus atau tidak tersedia</p>
        <Link to="/admin/schedules" className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
          <i className="fas fa-arrow-left mr-2"></i> Kembali ke Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Modern Header - sama dengan SchedulesList dan ScheduleEdit */}
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
                <i className="fas fa-eye text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Detail Jadwal</h1>
                <p className="mt-1 text-blue-100">Informasi lengkap jadwal pelayaran #{id}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/admin/schedules"
                className="inline-flex items-center px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                <i className="fas fa-arrow-left mr-2"></i> Kembali
              </Link>
              <Link to={`/admin/schedules/${id}/edit`}
                className="inline-flex items-center px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                <i className="fas fa-edit mr-2"></i> Edit
              </Link>
              <Link to={`/admin/schedules/${id}/dates`}
                className="inline-flex items-center px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                <i className="fas fa-calendar-week mr-2"></i> Kelola Tanggal
              </Link>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Rute</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-route mr-2 text-blue-100"></i>
                <span className="text-lg font-semibold truncate">
                  {schedule.route ? `${schedule.route.origin} - ${schedule.route.destination}` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Kapal</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-ship mr-2 text-blue-100"></i>
                <span className="text-lg font-semibold truncate">
                  {schedule.ferry ? schedule.ferry.name : 'N/A'}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Jam Keberangkatan</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-plane-departure mr-2 text-blue-100"></i>
                <span className="text-lg font-semibold">
                  {formatTime(schedule.departure_time)}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Status</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-toggle-on mr-2 text-blue-100"></i>
                <span className="text-lg font-semibold">
                  {getStatusConfig(schedule.status).label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Alert Messages */}
        {alert.show && (
          <div className={`mb-6 rounded-lg shadow-lg overflow-hidden animate-slideIn`}>
            <div className={`${alert.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} px-4 py-2 text-white flex items-center justify-between`}>
              <div className="flex items-center">
                <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                <span className="font-medium">{alert.type === 'success' ? 'Sukses' : 'Error'}</span>
              </div>
              <button onClick={() => setAlert({ ...alert, show: false })} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={`${alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'} px-4 py-3 border-t`}>
              {alert.message}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'info'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <div className="flex items-center justify-center">
                  <i className="fas fa-info-circle mr-2"></i>
                  Informasi
                </div>
              </button>
              <button
                onClick={() => setActiveTab('dates')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'dates'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <div className="flex items-center justify-center">
                  <i className="fas fa-calendar-alt mr-2"></i>
                  Tanggal ({Array.isArray(scheduleDates) ? scheduleDates.length : 0})
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Basic Information Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                    Informasi Dasar
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informasi Rute */}
                    <div className="bg-blue-50 rounded-lg p-5">
                      <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-4 flex items-center">
                        <i className="fas fa-route mr-2"></i>
                        Rute Perjalanan
                      </h3>
                      {schedule.route ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Asal</div>
                              <div className="font-semibold text-gray-800">{schedule.route.origin}</div>
                            </div>
                            <i className="fas fa-arrow-right text-blue-500"></i>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 mb-1">Tujuan</div>
                              <div className="font-semibold text-gray-800">{schedule.route.destination}</div>
                            </div>
                          </div>
                          {schedule.route.route_code && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="text-xs text-gray-500 mb-1">Kode Rute</div>
                              <div className="font-medium text-gray-800">{schedule.route.route_code}</div>
                            </div>
                          )}
                          {schedule.route.duration && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="text-xs text-gray-500 mb-1">Durasi</div>
                              <div className="font-medium text-gray-800">{schedule.route.duration} menit</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          <i className="fas fa-exclamation-circle text-gray-400 text-2xl mb-2"></i>
                          <p>Rute tidak tersedia</p>
                        </div>
                      )}
                    </div>

                    {/* Informasi Kapal */}
                    <div className="bg-indigo-50 rounded-lg p-5">
                      <h3 className="text-sm font-semibold text-indigo-700 uppercase tracking-wider mb-4 flex items-center">
                        <i className="fas fa-ship mr-2"></i>
                        Detail Kapal
                      </h3>
                      {schedule.ferry ? (
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Nama Kapal</div>
                            <div className="font-semibold text-gray-800">{schedule.ferry.name}</div>
                          </div>
                          {schedule.ferry.registration_number && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="text-xs text-gray-500 mb-1">Nomor Registrasi</div>
                              <div className="font-medium text-gray-800">{schedule.ferry.registration_number}</div>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-blue-600">{formatTime(schedule.departure_time)}</div>
                              <div className="text-xs text-gray-500">Keberangkatan</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-indigo-600">{formatTime(schedule.arrival_time)}</div>
                              <div className="text-xs text-gray-500">Kedatangan</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          <i className="fas fa-exclamation-circle text-gray-400 text-2xl mb-2"></i>
                          <p>Kapal tidak tersedia</p>
                        </div>
                      )}
                    </div>

                    {/* Hari Operasi */}
                    <div className="bg-purple-50 rounded-lg p-5">
                      <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-4 flex items-center">
                        <i className="fas fa-calendar-day mr-2"></i>
                        Hari Operasi
                      </h3>
                      <div className="bg-white rounded-lg p-3">
                        <div className="text-sm font-medium text-purple-700 text-center">
                          {getDaysText(schedule.days)}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="bg-gray-50 rounded-lg p-5">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center">
                        <i className="fas fa-toggle-on mr-2"></i>
                        Status & Info
                      </h3>
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-2">Status Jadwal</div>
                          <div>{getStatusBadge(schedule.status)}</div>
                        </div>
                        {schedule.status_reason && (
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Alasan</div>
                            <div className="text-sm text-gray-800">{schedule.status_reason}</div>
                          </div>
                        )}
                        <div className="grid grid-cols-1 gap-2 text-xs">
                          <div className="bg-white rounded-lg p-2">
                            <span className="text-gray-500">Dibuat:</span>
                            <span className="ml-1 font-medium">{formatDate(schedule.created_at)}</span>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <span className="text-gray-500">Diperbarui:</span>
                            <span className="ml-1 font-medium">{formatDate(schedule.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity Card */}
            <div>
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <i className="fas fa-users text-blue-500 mr-2"></i>
                    Kapasitas Kapal
                  </h2>
                </div>
                <div className="p-6">
                  {schedule.ferry ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-white text-center">
                        <div className="flex items-center justify-center mb-2">
                          <i className="fas fa-users text-2xl"></i>
                        </div>
                        <div className="text-2xl font-bold">{schedule.ferry.capacity_passenger}</div>
                        <div className="text-sm text-blue-100">Penumpang</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-100 rounded-lg p-3 text-center">
                          <i className="fas fa-motorcycle text-green-600 mb-2"></i>
                          <div className="font-bold text-green-800">{schedule.ferry.capacity_vehicle_motorcycle}</div>
                          <div className="text-xs text-green-600">Motor</div>
                        </div>
                        <div className="bg-amber-100 rounded-lg p-3 text-center">
                          <i className="fas fa-car text-amber-600 mb-2"></i>
                          <div className="font-bold text-amber-800">{schedule.ferry.capacity_vehicle_car}</div>
                          <div className="text-xs text-amber-600">Mobil</div>
                        </div>
                        <div className="bg-purple-100 rounded-lg p-3 text-center">
                          <i className="fas fa-bus text-purple-600 mb-2"></i>
                          <div className="font-bold text-purple-800">{schedule.ferry.capacity_vehicle_bus}</div>
                          <div className="text-xs text-purple-600">Bus</div>
                        </div>
                        <div className="bg-red-100 rounded-lg p-3 text-center">
                          <i className="fas fa-truck text-red-600 mb-2"></i>
                          <div className="font-bold text-red-800">{schedule.ferry.capacity_vehicle_truck}</div>
                          <div className="text-xs text-red-600">Truk</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <i className="fas fa-exclamation-circle text-gray-400 text-3xl mb-3"></i>
                      <h3 className="font-medium text-gray-700">Informasi tidak tersedia</h3>
                      <p className="text-sm text-gray-500 mt-1">Data kapal tidak ditemukan</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dates' && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <i className="fas fa-calendar-alt text-blue-500 mr-2"></i>
                Tanggal Tersedia
              </h2>
              <Link to={`/admin/schedules/${id}/dates`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <i className="fas fa-plus mr-2"></i>
                Tambah Tanggal
              </Link>
            </div>

            <div className="p-6">
              {/* Dates Table */}
              {Array.isArray(scheduleDates) && scheduleDates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapasitas Terisi</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {scheduleDates.map((date, index) => (
                        <tr key={date.id || index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                <i className="fas fa-calendar-day"></i>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {new Date(date.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(date.date).toLocaleDateString('id-ID', { weekday: 'long' })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {schedule.ferry ? (
                              <div className="text-sm space-y-1">
                                <div className="flex items-center">
                                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium flex items-center">
                                    <i className="fas fa-users mr-1"></i>
                                    {date.passenger_count || 0} / {schedule.ferry.capacity_passenger}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium flex items-center">
                                    <i className="fas fa-car mr-1"></i>
                                    {(date.motorcycle_count || 0) + (date.car_count || 0) + (date.bus_count || 0) + (date.truck_count || 0)} kendaraan
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Data tidak tersedia</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(date.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/admin/schedules/${id}/dates?edit=${date.id}`}
                              className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                              title="Edit">
                              <i className="fas fa-edit"></i>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-calendar-alt text-gray-400 text-4xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Tanggal Tersedia</h3>
                  <p className="text-gray-600 mb-6">Jadwal ini belum memiliki tanggal yang tersedia untuk pemesanan</p>
                  <Link to={`/admin/schedules/${id}/dates`}
                    className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
                    <i className="fas fa-plus mr-2"></i> Tambah Tanggal
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
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

export default ScheduleShow;