// src/pages/operator/schedules/ScheduleCreateDate.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { operatorSchedulesService } from '../../../services/operatorSchedules.service';
import Swal from 'sweetalert2';

const ScheduleCreateDate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: '',
    status: 'active',
    status_reason: '',
    status_expiry_date: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, [id]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await operatorSchedulesService.getById(id);
      console.log('Schedule response:', response); // Debug log
      
      if (response.data && response.data.data) {
        const scheduleData = response.data.data.schedule || response.data.data;
        setSchedule(scheduleData);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat data jadwal',
      });
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      await operatorSchedulesService.storeDate(id, formData);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Tanggal jadwal berhasil ditambahkan',
      });

      navigate(`/operator/schedules/${id}/dates`);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data',
        });
      }
    }
    setSubmitting(false);
  };

  const getDayNames = () => {
    if (!schedule || !schedule.days) return [];
    
    const dayNames = {
      '0': 'Minggu',
      '1': 'Senin',
      '2': 'Selasa',
      '3': 'Rabu',
      '4': 'Kamis',
      '5': 'Jumat',
      '6': 'Sabtu',
      '7': 'Minggu',
    };

    return schedule.days.split(',').map(day => dayNames[day] || day);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <div className="animate-ping absolute top-0 left-0 rounded-full h-16 w-16 border-2 border-blue-600 opacity-30"></div>
        </div>
        <p className="ml-4 text-lg text-gray-600 font-medium">Memuat jadwal...</p>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Jadwal tidak ditemukan</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Tidak dapat menemukan jadwal yang diminta. Silakan kembali ke daftar jadwal.
            </p>
            <Link
              to="/operator/schedules"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Daftar Jadwal
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Tambah Tanggal Jadwal</h1>
                  <p className="mt-1 text-blue-100">
                    {schedule?.route?.origin || 'Unknown'} → {schedule?.route?.destination || 'Unknown'}
                  </p>
                </div>
              </div>
              
              <div>
                <Link
                  to={`/operator/schedules/${id}/dates`}
                  className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Kembali ke Daftar Tanggal
                </Link>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-100 text-sm">Kode Rute</p>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-2xl font-bold">
                    {schedule?.route?.route_code || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-100 text-sm">Waktu Keberangkatan</p>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-2xl font-bold">
                    {schedule?.departure_time || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-100 text-sm">Waktu Kedatangan</p>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 mr-2 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-2xl font-bold">
                    {schedule?.arrival_time || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-100 text-sm">Kapal</p>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 mr-2 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-2xl font-bold">
                    {schedule?.ferry?.name || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Jadwal Info Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informasi Jadwal
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Rute:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {schedule?.route?.origin || 'Unknown'} → {schedule?.route?.destination || 'Unknown'}
                  </span>
                </div>
                
                {/* Time Display */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm mb-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Berangkat</p>
                      <p className="text-sm font-bold text-gray-900">
                        {schedule?.departure_time || 'N/A'}
                      </p>
                    </div>

                    <div className="flex-1 mx-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="h-1 w-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 rounded-full"></div>
                        </div>
                        <div className="relative flex justify-between">
                          <div className="h-4 w-4 rounded-full bg-blue-600 border-3 border-white shadow-sm"></div>
                          <div className="h-4 w-4 rounded-full bg-blue-600 border-3 border-white shadow-sm"></div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Tiba</p>
                      <p className="text-sm font-bold text-gray-900">
                        {schedule?.arrival_time || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Hari Operasi:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getDayNames().map((day, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-500">Kapal:</span>
                  <span className="text-sm font-medium text-gray-900">{schedule?.ferry?.name || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ID Jadwal:</span>
                  <span className="text-sm font-medium text-gray-900">{schedule?.id || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">Tambah Tanggal Baru</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal <span className="text-red-600">*</span>
                    </label>
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
                        className={`pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 ${errors.date ? 'border-red-500' : ''}`}
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Pilih tanggal sesuai hari operasi kapal</p>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-600">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <select
                        id="status"
                        name="status"
                        className={`pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 ${errors.status ? 'border-red-500' : ''}`}
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="active">Tersedia</option>
                        <option value="inactive">Tidak Tersedia</option>
                        <option value="suspended">Dibatalkan</option>
                        <option value="full">Penuh</option>
                        <option value="weather_issue">Masalah Cuaca</option>
                      </select>
                    </div>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="status_reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan Status (Opsional)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <textarea
                      id="status_reason"
                      name="status_reason"
                      rows="3"
                      className={`pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 ${errors.status_reason ? 'border-red-500' : ''}`}
                      value={formData.status_reason}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.status_reason && (
                    <p className="mt-1 text-sm text-red-600">{errors.status_reason}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Tambahkan alasan jika status bukan 'Tersedia'</p>
                </div>

                {formData.status === 'weather_issue' && (
                  <div className="weather-expiry-group">
                    <label htmlFor="status_expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Berakhir Status Cuaca
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="date"
                        id="status_expiry_date"
                        name="status_expiry_date"
                        className={`pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 ${errors.status_expiry_date ? 'border-red-500' : ''}`}
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                        value={formData.status_expiry_date}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.status_expiry_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.status_expiry_date}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Tanggal saat status cuaca diperkirakan berakhir</p>
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 text-sm text-blue-700">
                      <p>Kapasitas penumpang dan kendaraan akan menggunakan nilai default dari kapal. Anda dapat mengubahnya nanti jika diperlukan.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Link
                    to={`/operator/schedules/${id}/dates`}
                    className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Batal
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {submitting ? 'Menyimpan...' : 'Simpan Tanggal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bantuan */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mt-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">Bantuan</h2>
          </div>
          <div className="p-6">
            <dl className="space-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-700">Status Tanggal</dt>
                <dd className="mt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200 shadow-sm">
                      <div className="flex items-center">
                        <div className="bg-green-500/20 p-2 rounded-full mr-2">
                          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">Tersedia</p>
                          <p className="text-xs text-green-600">Jadwal normal, dapat dipesan</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200 shadow-sm">
                      <div className="flex items-center">
                        <div className="bg-red-500/20 p-2 rounded-full mr-2">
                          <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-700">Tidak Tersedia</p>
                          <p className="text-xs text-red-600">Jadwal tidak beroperasi</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-200 shadow-sm">
                      <div className="flex items-center">
                        <div className="bg-yellow-500/20 p-2 rounded-full mr-2">
                          <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-yellow-700">Dibatalkan</p>
                          <p className="text-xs text-yellow-600">Jadwal dibatalkan</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200 shadow-sm">
                      <div className="flex items-center">
                        <div className="bg-blue-500/20 p-2 rounded-full mr-2">
                          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">Masalah Cuaca</p>
                          <p className="text-xs text-blue-600">Jadwal berubah karena cuaca</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-700">Tanggal Berakhir Status</dt>
                <dd className="mt-1 text-sm text-gray-600 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  Hanya berlaku untuk status "Masalah Cuaca". Menentukan kapan status akan otomatis kembali ke "Tersedia" jika kondisi cuaca membaik.
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* CSS untuk animasi */}
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

export default ScheduleCreateDate;