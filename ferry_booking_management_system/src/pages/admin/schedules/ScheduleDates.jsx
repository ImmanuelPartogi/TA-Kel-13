import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import adminScheduleService from '../../../services/adminSchedule.service';

const ScheduleDates = () => {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [scheduleDates, setScheduleDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateType, setDateType] = useState('single');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    date: '',
    end_date: '',
    status: 'ACTIVE',
    status_reason: '',
    status_expiry_date: ''
  });

  const dayNames = {
    1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis',
    5: 'Jumat', 6: 'Sabtu', 7: 'Minggu'
  };

  useEffect(() => {
    fetchScheduleData();

    // Auto-hide alert after 5 seconds
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [id, alert.show]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const [scheduleRes, datesRes] = await Promise.all([
        adminScheduleService.get(`/admin-panel/schedules/${id}`),
        adminScheduleService.get(`/admin-panel/schedules/${id}/dates`)
      ]);
      setSchedule(scheduleRes.data.data);
      setScheduleDates(datesRes.data.data.dates.data || []);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear errors for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleAddDate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      await adminScheduleService.post(`/admin-panel/schedules/${id}/dates`, {
        ...formData,
        date_type: dateType
      });

      setShowAddModal(false);
      fetchScheduleData();
      resetForm();

      setAlert({
        show: true,
        type: 'success',
        message: 'Tanggal jadwal berhasil ditambahkan'
      });
    } catch (error) {
      console.error('Error adding date:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: 'Gagal menambahkan tanggal jadwal'
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditDate = async (e) => {
    e.preventDefault();
    if (!selectedDate) return;

    setSaving(true);
    setErrors({});

    try {
      await adminScheduleService.put(`/admin-panel/schedules/${id}/dates/${selectedDate.id}`, {
        status: formData.status,
        status_reason: formData.status_reason,
        status_expiry_date: formData.status_expiry_date
      });

      setShowEditModal(false);
      fetchScheduleData();
      resetForm();

      setAlert({
        show: true,
        type: 'success',
        message: 'Status tanggal berhasil diperbarui'
      });
    } catch (error) {
      console.error('Error editing date:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: 'Gagal memperbarui status tanggal'
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDate = async () => {
    if (!selectedDate) return;

    try {
      await adminScheduleService.delete(`/admin-panel/schedules/${id}/dates/${selectedDate.id}`);

      setShowDeleteModal(false);
      fetchScheduleData();
      setSelectedDate(null);

      setAlert({
        show: true,
        type: 'success',
        message: 'Tanggal jadwal berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting date:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal menghapus tanggal jadwal'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      end_date: '',
      status: 'ACTIVE',
      status_reason: '',
      status_expiry_date: ''
    });
    setSelectedDate(null);
    setDateType('single');
    setErrors({});
  };

  const openEditModal = (date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      status: date.status,
      status_reason: date.status_reason || '',
      status_expiry_date: date.status_expiry_date || ''
    });
    setShowEditModal(true);
  };

  const confirmDelete = (date) => {
    setSelectedDate(date);
    setShowDeleteModal(true);
  };

  const getOperatingDaysText = () => {
    if (!schedule?.days) return 'Tidak ada';
    const days = schedule.days.split(',');
    return days.map(day => dayNames[day] || '').filter(Boolean).join(', ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge configuration - sama dengan komponen lain
  const getStatusConfig = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'AVAILABLE':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-800',
          icon: 'fa-check-circle',
          label: 'Tersedia',
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
          label: 'Tidak Tersedia',
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

  // Loading State - sama dengan komponen lain
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-md p-8 text-center">
        <div className="inline-block relative">
          <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="mt-4 text-gray-600">Memuat data tanggal jadwal...</p>
      </div>
    );
  }

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
      {/* Modern Header - sama dengan komponen lain */}
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
                <i className="fas fa-calendar-week text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Kelola Tanggal Jadwal</h1>
                <p className="mt-1 text-blue-100">Atur tanggal tersedia untuk jadwal #{id}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/admin/schedules"
                className="inline-flex items-center px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                <i className="fas fa-arrow-left mr-2"></i> Kembali
              </Link>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                <i className="fas fa-plus mr-2"></i> Tambah Tanggal
              </button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-8">
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
              <p className="text-blue-100 text-sm">Total Tanggal</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-calendar-alt mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">
                  {scheduleDates.length}
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

        {/* Schedule Information Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <i className="fas fa-info-circle text-blue-500 mr-2"></i>
              Informasi Jadwal
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-700 mb-3">Rute & Waktu</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rute:</span>
                    <span className="text-sm font-medium">{schedule.route.origin} - {schedule.route.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kapal:</span>
                    <span className="text-sm font-medium">{schedule.ferry.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Waktu:</span>
                    <span className="text-sm font-medium">
                      {formatTime(schedule.departure_time)} - {formatTime(schedule.arrival_time)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-purple-700 mb-3">Operasi & Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hari:</span>
                    <span className="text-sm font-medium">{getOperatingDaysText()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    {getStatusBadge(schedule.status)}
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-700 mb-3">Kapasitas</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded p-2 text-center">
                    <div className="font-bold text-green-800">{schedule.ferry.capacity_passenger}</div>
                    <div className="text-green-600">Penumpang</div>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <div className="font-bold text-green-800">{schedule.ferry.capacity_vehicle_motorcycle}</div>
                    <div className="text-green-600">Motor</div>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <div className="font-bold text-green-800">{schedule.ferry.capacity_vehicle_car}</div>
                    <div className="text-green-600">Mobil</div>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <div className="font-bold text-green-800">{schedule.ferry.capacity_vehicle_bus + schedule.ferry.capacity_vehicle_truck}</div>
                    <div className="text-green-600">Bus/Truk</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Dates Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <i className="fas fa-calendar-alt text-blue-500 mr-2"></i>
              Tanggal Jadwal ({scheduleDates.length})
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <i className="fas fa-plus mr-2"></i>
              Tambah Tanggal
            </button>
          </div>

          <div className="p-6">
            {scheduleDates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penumpang</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kendaraan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alasan</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scheduleDates.map((date, index) => (
                      <tr key={date.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                              <i className="fas fa-calendar-day"></i>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{formatDate(date.date)}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(date.date).toLocaleDateString('id-ID', { weekday: 'long' })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-2">
                              {date.passenger_count || 0} / {schedule.ferry.capacity_passenger}
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min(100, ((date.passenger_count || 0) / schedule.ferry.capacity_passenger) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 font-medium">Motor</span>
                              <span className="font-semibold text-gray-700">
                                {date.motorcycle_count || 0}/{schedule.ferry.capacity_vehicle_motorcycle}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 font-medium">Mobil</span>
                              <span className="font-semibold text-gray-700">
                                {date.car_count || 0}/{schedule.ferry.capacity_vehicle_car}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 font-medium">Bus</span>
                              <span className="font-semibold text-gray-700">
                                {date.bus_count || 0}/{schedule.ferry.capacity_vehicle_bus}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 font-medium">Truk</span>
                              <span className="font-semibold text-gray-700">
                                {date.truck_count || 0}/{schedule.ferry.capacity_vehicle_truck}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            {getStatusBadge(date.status)}
                            {date.modified_by_schedule && (
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-white">
                                  <i className="fas fa-robot mr-1"></i>
                                  Auto
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {date.status_reason || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(date)}
                              className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                              title="Edit">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => confirmDelete(date)}
                              className="btn-icon bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                              title="Hapus">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
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
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Tanggal Terjadwal</h3>
                <p className="text-gray-600 mb-6">Jadwal ini belum memiliki tanggal yang tersedia</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
                  <i className="fas fa-plus mr-2"></i> Tambah Tanggal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Date Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-modal-in">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-plus text-blue-500 mr-2"></i>
                Tambah Tanggal Jadwal
              </h3>
            </div>

            <form onSubmit={handleAddDate} className="p-6">
              <div className="mb-4">
                <label htmlFor="date_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Penambahan <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-list text-gray-400"></i>
                  </div>
                  <select
                    id="date_type"
                    value={dateType}
                    onChange={(e) => setDateType(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="single">Tanggal Tunggal</option>
                    <option value="range">Rentang Tanggal</option>
                  </select>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 flex items-center">
                  <i className="fas fa-info-circle mr-2"></i>
                  <span className="font-semibold">Hari Operasi:</span>
                  <span className="ml-1">{getOperatingDaysText()}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Jika menggunakan rentang tanggal, hanya tanggal yang sesuai dengan hari operasi yang akan dibuat.
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal {dateType === 'range' ? 'Mulai' : ''} <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-calendar text-gray-400"></i>
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>

              {dateType === 'range' && (
                <div className="mb-4">
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Akhir <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-calendar text-gray-400"></i>
                    </div>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required={dateType === 'range'}
                      min={formData.date || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-toggle-on text-gray-400"></i>
                  </div>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="ACTIVE">Tersedia</option>
                    <option value="INACTIVE">Tidak Tersedia</option>
                    <option value="CANCELLED">Dibatalkan</option>
                    <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                  </select>
                </div>
              </div>

              {formData.status !== 'ACTIVE' && (
                <div className="mb-4">
                  <label htmlFor="status_reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan Status
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-comment text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="status_reason"
                      name="status_reason"
                      value={formData.status_reason}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Masukkan alasan status"
                    />
                  </div>
                </div>
              )}

              {formData.status === 'WEATHER_ISSUE' && (
                <div className="mb-4">
                  <label htmlFor="status_expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Berakhir Status
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-clock text-gray-400"></i>
                    </div>
                    <input
                      type="datetime-local"
                      id="status_expiry_date"
                      name="status_expiry_date"
                      value={formData.status_expiry_date}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Isi jika status akan berakhir pada waktu tertentu.</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin -ml-1 mr-2 h-4 w-4 text-white">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      </div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Date Modal */}
      {showEditModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-modal-in">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-edit text-blue-500 mr-2"></i>
                Edit Status Jadwal
              </h3>
            </div>

            <form onSubmit={handleEditDate} className="p-6">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 flex items-center">
                  <i className="fas fa-calendar mr-2 text-gray-500"></i>
                  Tanggal: {formatDate(selectedDate.date)}
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="edit_status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-toggle-on text-gray-400"></i>
                  </div>
                  <select
                    id="edit_status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="ACTIVE">Tersedia</option>
                    <option value="INACTIVE">Tidak Tersedia</option>
                    <option value="FULL">Penuh</option>
                    <option value="CANCELLED">Dibatalkan</option>
                    <option value="DEPARTED">Sudah Berangkat</option>
                    <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                  </select>
                </div>
              </div>

              {formData.status !== 'ACTIVE' && (
                <div className="mb-4">
                  <label htmlFor="edit_status_reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan Status
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-comment text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="edit_status_reason"
                      name="status_reason"
                      value={formData.status_reason}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Masukkan alasan status"
                    />
                  </div>
                </div>
              )}

              {formData.status === 'WEATHER_ISSUE' && (
                <div className="mb-4">
                  <label htmlFor="edit_status_expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Berakhir Status
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-clock text-gray-400"></i>
                    </div>
                    <input
                      type="datetime-local"
                      id="edit_status_expiry_date"
                      name="status_expiry_date"
                      value={formData.status_expiry_date}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Isi jika status akan berakhir pada waktu tertentu.</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin -ml-1 mr-2 h-4 w-4 text-white">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      </div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-modal-in">
            <div className="p-6">
              <div className="text-center mb-5">
                <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus tanggal:</p>
                <div className="bg-gray-50 rounded-lg p-3 mt-3 border border-gray-200">
                  <p className="font-semibold text-lg text-gray-800">
                    {formatDate(selectedDate.date)}
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
                      Tanggal yang sudah memiliki pemesanan tidak dapat dihapus. Tindakan ini tidak dapat dibatalkan.
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
                  onClick={handleDeleteDate}
                  className="w-full py-3 px-4 bg-red-500 rounded-lg text-white font-medium hover:bg-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i> Hapus Tanggal
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

export default ScheduleDates;