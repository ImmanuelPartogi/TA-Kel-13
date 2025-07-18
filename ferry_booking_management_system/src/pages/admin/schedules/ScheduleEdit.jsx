import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import adminScheduleService from '../../../services/adminSchedule.service';

const ScheduleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [ferries, setFerries] = useState([]);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const [formData, setFormData] = useState({
    route_id: '',
    ferry_id: '',
    departure_time: '',
    arrival_time: '',
    days: [],
    status: 'ACTIVE',
    status_reason: '',
    status_expiry_date: ''
  });

  const dayNames = {
    1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis',
    5: 'Jumat', 6: 'Sabtu', 7: 'Minggu'
  };

  // Fungsi untuk mengurutkan array hari
  const getSortedDays = (days) => {
    // Urutkan hari-hari secara numerik (1=Senin, 2=Selasa, dst.)
    return [...days].sort((a, b) => parseInt(a) - parseInt(b));
  };

  useEffect(() => {
    fetchData();

    // Auto-hide alert after 5 seconds
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [id, alert.show]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scheduleRes, routesRes, ferriesRes] = await Promise.all([
        adminScheduleService.get(`/admin-panel/schedules/${id}`),
        adminScheduleService.get('/admin-panel/routes?all=true'),
        adminScheduleService.get('/admin-panel/ferries?all=true')
      ]);

      console.log('Schedule Response:', scheduleRes.data);
      console.log('Routes Response:', routesRes.data);
      console.log('Ferries Response:', ferriesRes.data);

      const schedule = scheduleRes.data.data;

      // Format waktu dari UTC ke HH:mm
      const formatTime = (timeString) => {
        if (!timeString) return '';

        // Jika format "HH:mm:ss"
        if (timeString.includes(':') && timeString.length <= 8) {
          return timeString.substring(0, 5);
        }

        // Jika format ISO date-time
        const date = new Date(timeString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      // Parse days dari string menjadi array
      const parsedDays = schedule.days ? schedule.days.split(',') : [];

      setFormData({
        route_id: schedule.route_id,
        ferry_id: schedule.ferry_id,
        departure_time: formatTime(schedule.departure_time),
        arrival_time: formatTime(schedule.arrival_time),
        days: parsedDays,
        status: schedule.status,
        status_reason: schedule.status_reason || '',
        status_expiry_date: schedule.status_expiry_date || ''
      });

      // Handle pagination response
      let routesData = [];
      let ferriesData = [];

      // Extract routes from pagination response
      if (routesRes.data?.data?.data) {
        routesData = routesRes.data.data.data;
      } else if (routesRes.data?.data) {
        routesData = Array.isArray(routesRes.data.data) ? routesRes.data.data : [];
      }

      // Extract ferries from pagination response  
      if (ferriesRes.data?.data?.data) {
        ferriesData = ferriesRes.data.data.data;
      } else if (ferriesRes.data?.data) {
        ferriesData = Array.isArray(ferriesRes.data.data) ? ferriesRes.data.data : [];
      }

      console.log('Routes array:', routesData);
      console.log('Ferries array:', ferriesData);

      setRoutes(routesData);
      setFerries(ferriesData);
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

  // Fungsi untuk memvalidasi waktu
  const validateTimes = () => {
    // Jika salah satu waktu belum diisi, abaikan validasi
    if (!formData.departure_time || !formData.arrival_time) {
      return true;
    }

    // Parse waktu keberangkatan dan kedatangan
    const [departureHour, departureMinute] = formData.departure_time.split(':').map(Number);
    const [arrivalHour, arrivalMinute] = formData.arrival_time.split(':').map(Number);

    // Konversi ke menit untuk memudahkan perbandingan
    const departureTimeInMinutes = departureHour * 60 + departureMinute;
    const arrivalTimeInMinutes = arrivalHour * 60 + arrivalMinute;

    // Jika waktu kedatangan lebih awal dari waktu keberangkatan
    if (arrivalTimeInMinutes < departureTimeInMinutes) {
      return false;
    }

    return true;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      // Untuk checkbox days, simpan tanpa mengurutkan terlebih dahulu
      // Urutan hanya diterapkan saat menampilkan dan menyimpan ke server
      const newDays = checked
        ? [...formData.days, value]
        : formData.days.filter(day => day !== value);
      setFormData({ ...formData, days: newDays });
    } else {
      setFormData({ ...formData, [name]: value });

      // Hapus error jika user sudah memperbaiki input
      if (name === 'departure_time' || name === 'arrival_time') {
        const newErrors = { ...errors };
        delete newErrors.arrival_time;
        setErrors(newErrors);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    const newErrors = {};

    // Validasi hari operasional
    if (formData.days.length === 0) {
      newErrors.days = 'Pilih minimal satu hari operasional';
    }

    // Validasi waktu
    if (!validateTimes()) {
      newErrors.arrival_time = 'Waktu kedatangan tidak boleh lebih awal dari waktu keberangkatan';
    }

    // Jika ada error, tampilkan dan hentikan proses submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      // Urutkan array hari operasional sebelum dikirim
      const sortedDays = getSortedDays(formData.days);

      console.log('Hari operasional asli:', formData.days);
      console.log('Hari operasional berurutan:', sortedDays);

      await adminScheduleService.put(`/admin-panel/schedules/${id}`, {
        ...formData,
        days: sortedDays // Gunakan array hari yang sudah diurutkan
      });

      setAlert({
        show: true,
        type: 'success',
        message: 'Jadwal berhasil diperbarui'
      });

      setTimeout(() => {
        navigate('/admin/schedules');
      }, 2000);
    } catch (error) {
      console.error('Submit error:', error.response?.data);

      // Tambahkan penanganan khusus untuk error konflik jadwal
      if (error.response?.data?.conflicting_schedule) {
        const conflict = error.response.data.conflicting_schedule;
        setErrors({
          ...error.response?.data?.errors,
          general: [
            'Terjadi konflik jadwal untuk kapal yang dipilih.',
            `Jadwal yang bertabrakan: Hari ${adminScheduleService.formatDays(conflict.days)}`,
            '1. Pilih kapal lain yang tersedia',
            '2. Pilih hari operasional yang berbeda (hindari hari yang sama)',
            '3. Hubungi admin untuk menyesuaikan jadwal yang sudah ada'
          ]
        });
        // Scroll ke atas agar pengguna dapat melihat pesan error
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: 'Gagal memperbarui jadwal: ' + (error.response?.data?.message || 'Terjadi kesalahan')
        });
      }
      setSaving(false);
    }
  };

  // Loading State - sama dengan SchedulesList
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-md p-8 text-center">
        <div className="inline-block relative">
          <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="mt-4 text-gray-600">Memuat data jadwal...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Modern Header - sama dengan SchedulesList */}
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
                <i className="fas fa-edit text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Edit Jadwal</h1>
                <p className="mt-1 text-blue-100">Perbarui informasi jadwal pelayaran</p>
              </div>
            </div>

            <div>
              <Link to="/admin/schedules"
                className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                <i className="fas fa-arrow-left mr-2"></i> Kembali ke Daftar
              </Link>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Rute Tersedia</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-route mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{routes.length}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Kapal Tersedia</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-ship mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{ferries.length}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Status Saat Ini</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-toggle-on mr-2 text-blue-100"></i>
                <span className="text-lg font-semibold">
                  {formData.status === 'ACTIVE' ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Alert Messages - sama dengan SchedulesList */}
        {(errors.general || errors.route_id || errors.ferry_id || errors.departure_time || errors.arrival_time) && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 shadow-md rounded-md animate-fadeIn">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Perhatian: Konflik Jadwal</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {/* Tampilkan error general */}
                    {Array.isArray(errors.general) ?
                      errors.general.map((err, index) => (<li key={`general-${index}`}>{err}</li>)) :
                      errors.general && <li>{errors.general}</li>}

                    {/* Tampilkan error route_id */}
                    {Array.isArray(errors.route_id) ?
                      errors.route_id.map((err, index) => (<li key={`route-${index}`}>{err}</li>)) :
                      errors.route_id && <li>{errors.route_id}</li>}

                    {/* Tampilkan error ferry_id */}
                    {Array.isArray(errors.ferry_id) ?
                      errors.ferry_id.map((err, index) => (<li key={`ferry-${index}`}>{err}</li>)) :
                      errors.ferry_id && <li>{errors.ferry_id}</li>}

                    {/* Tampilkan error waktu */}
                    {Array.isArray(errors.departure_time) ?
                      errors.departure_time.map((err, index) => (<li key={`departure-${index}`}>{err}</li>)) :
                      errors.departure_time && <li>{errors.departure_time}</li>}

                    {Array.isArray(errors.arrival_time) ?
                      errors.arrival_time.map((err, index) => (<li key={`arrival-${index}`}>{err}</li>)) :
                      errors.arrival_time && <li>{errors.arrival_time}</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <i className="fas fa-edit text-blue-500 mr-2"></i>
              Form Edit Jadwal
            </h2>
          </div>

          <div className="p-6 bg-white">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Rute <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-route text-gray-400"></i>
                    </div>
                    <select
                      id="route_id"
                      name="route_id"
                      value={formData.route_id}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    >
                      <option value="">Pilih Rute</option>
                      {routes.length > 0 ? (
                        routes.map(route => (
                          <option key={route.id} value={route.id}>
                            {route.origin} - {route.destination} {route.route_code ? `(${route.route_code})` : ''}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Tidak ada rute tersedia</option>
                      )}
                    </select>
                  </div>
                  {routes.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      <span className="font-medium">Perhatian:</span> Tidak ada rute yang tersedia
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="ferry_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Kapal <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-ship text-gray-400"></i>
                    </div>
                    <select
                      id="ferry_id"
                      name="ferry_id"
                      value={formData.ferry_id}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    >
                      <option value="">Pilih Kapal</option>
                      {ferries.length > 0 ? (
                        ferries.map(ferry => (
                          <option key={ferry.id} value={ferry.id}>
                            {ferry.name} {ferry.registration_number ? `(${ferry.registration_number})` : ''}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Tidak ada kapal tersedia</option>
                      )}
                    </select>
                  </div>
                  {ferries.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      <span className="font-medium">Perhatian:</span> Tidak ada kapal yang tersedia
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Keberangkatan <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i className="fas fa-clock text-blue-600"></i>
                      </div>
                      <select
                        className="block w-full pl-10 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition-all duration-200 appearance-none bg-white"
                        id="departure_hour"
                        name="departure_hour"
                        value={formData.departure_time ? formData.departure_time.split(':')[0] : ''}
                        onChange={(e) => {
                          const hour = e.target.value;
                          const minute = formData.departure_time ? formData.departure_time.split(':')[1] || '00' : '00';
                          const newTime = `${hour}:${minute}`;
                          setFormData({ ...formData, departure_time: newTime });

                          // Reset error saat user mengubah waktu
                          const newErrors = { ...errors };
                          delete newErrors.arrival_time;
                          setErrors(newErrors);
                        }}
                        required
                      >
                        <option value="">Jam</option>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <i className="fas fa-chevron-down text-gray-400"></i>
                      </div>
                    </div>

                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i className="fas fa-stopwatch text-blue-600"></i>
                      </div>
                      <select
                        className="block w-full pl-10 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition-all duration-200 appearance-none bg-white"
                        id="departure_minute"
                        name="departure_minute"
                        value={formData.departure_time ? formData.departure_time.split(':')[1] || '' : ''}
                        onChange={(e) => {
                          const minute = e.target.value;
                          const hour = formData.departure_time ? formData.departure_time.split(':')[0] || '00' : '00';
                          const newTime = `${hour}:${minute}`;
                          setFormData({ ...formData, departure_time: newTime });

                          // Reset error saat user mengubah waktu
                          const newErrors = { ...errors };
                          delete newErrors.arrival_time;
                          setErrors(newErrors);
                        }}
                        required
                      >
                        <option value="">Menit</option>
                        {Array.from({ length: 60 }, (_, i) => {
                          const minute = i.toString().padStart(2, '0');
                          return (
                            <option key={minute} value={minute}>
                              {minute}
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <i className="fas fa-chevron-down text-gray-400"></i>
                      </div>
                    </div>
                  </div>
                  {/* Error message */}
                  {errors.departure_time && (
                    <p className="mt-1 text-sm text-red-600">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.departure_time}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="arrival_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Kedatangan <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i className="fas fa-clock text-blue-600"></i>
                      </div>
                      <select
                        className={`block w-full pl-10 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition-all duration-200 appearance-none bg-white ${errors.arrival_time ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        id="arrival_hour"
                        name="arrival_hour"
                        value={formData.arrival_time ? formData.arrival_time.split(':')[0] : ''}
                        onChange={(e) => {
                          const hour = e.target.value;
                          const minute = formData.arrival_time ? formData.arrival_time.split(':')[1] || '00' : '00';
                          const newTime = `${hour}:${minute}`;
                          setFormData({ ...formData, arrival_time: newTime });

                          // Reset error saat user mengubah waktu
                          const newErrors = { ...errors };
                          delete newErrors.arrival_time;
                          setErrors(newErrors);
                        }}
                        required
                      >
                        <option value="">Jam</option>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <i className="fas fa-chevron-down text-gray-400"></i>
                      </div>
                    </div>

                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i className="fas fa-stopwatch text-blue-600"></i>
                      </div>
                      <select
                        className={`block w-full pl-10 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition-all duration-200 appearance-none bg-white ${errors.arrival_time ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        id="arrival_minute"
                        name="arrival_minute"
                        value={formData.arrival_time ? formData.arrival_time.split(':')[1] || '' : ''}
                        onChange={(e) => {
                          const minute = e.target.value;
                          const hour = formData.arrival_time ? formData.arrival_time.split(':')[0] || '00' : '00';
                          const newTime = `${hour}:${minute}`;
                          setFormData({ ...formData, arrival_time: newTime });

                          // Reset error saat user mengubah waktu
                          const newErrors = { ...errors };
                          delete newErrors.arrival_time;
                          setErrors(newErrors);
                        }}
                        required
                      >
                        <option value="">Menit</option>
                        {Array.from({ length: 60 }, (_, i) => {
                          const minute = i.toString().padStart(2, '0');
                          return (
                            <option key={minute} value={minute}>
                              {minute}
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <i className="fas fa-chevron-down text-gray-400"></i>
                      </div>
                    </div>
                  </div>
                  {/* Error message untuk waktu kedatangan */}
                  {errors.arrival_time && (
                    <p className="mt-1 text-sm text-red-600">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.arrival_time}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Hari Operasi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {/* Urutan checkbox hari tetap Senin-Minggu */}
                  {Object.entries(dayNames).map(([value, name]) => {
                    const isChecked = formData.days.includes(value);
                    return (
                      <div
                        key={value}
                        className={`flex items-center p-3 border rounded-lg transition-all duration-200 ${isChecked
                          ? 'bg-blue-50 border-blue-300 shadow-sm'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                      >
                        <input
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          type="checkbox"
                          name="days"
                          value={value}
                          id={`day-${value}`}
                          checked={isChecked}
                          onChange={handleInputChange}
                        />
                        <label className={`ml-2 block text-sm ${isChecked ? 'font-medium text-blue-800' : 'text-gray-700'}`} htmlFor={`day-${value}`}>
                          {name}
                        </label>
                      </div>
                    )
                  })}
                </div>
                {errors.days && (
                  <p className="mt-2 text-sm text-red-600">
                    <span className="font-medium">Error:</span> {errors.days}
                  </p>
                )}
              </div>

              {/* Summary of Selected Days (Displayed in Order) */}
              <div className="mt-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Hari terpilih:</span>{' '}
                  {formData.days.length > 0
                    ? getSortedDays(formData.days).map(day => dayNames[day]).join(', ')
                    : 'Belum ada hari yang dipilih'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
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
                      <option value="ACTIVE">Aktif</option>
                      <option value="INACTIVE">Tidak Aktif</option>
                      <option value="CANCELLED">Dibatalkan</option>
                      <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                    </select>
                  </div>
                </div>

                {formData.status !== 'ACTIVE' && (
                  <div>
                    <label htmlFor="status_reason" className="block text-sm font-medium text-gray-700 mb-1">
                      Alasan Status
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-info-circle text-gray-400"></i>
                      </div>
                      <input
                        type="text"
                        id="status_reason"
                        name="status_reason"
                        value={formData.status_reason}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Masukkan alasan perubahan status"
                      />
                    </div>
                  </div>
                )}
              </div>

              {formData.status === 'DELAYED' && (
                <div className="mt-6">
                  <label htmlFor="status_expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Berakhir Status
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-calendar-alt text-gray-400"></i>
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
                  <p className="mt-1 text-sm text-gray-500">
                    Isi jika status akan berakhir pada waktu tertentu. Khusus untuk status Ditunda (DELAYED).
                  </p>
                </div>
              )}

              {formData.status !== 'ACTIVE' && (
                <div className="mt-6">
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="fas fa-exclamation-triangle text-amber-500"></i>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">Perhatian!</h3>
                        <p className="text-sm text-amber-700 mt-1">
                          Mengubah status jadwal akan mempengaruhi tanggal-tanggal jadwal yang sudah ada. Perubahan status menjadi Dibatalkan atau Ditunda akan secara otomatis mengubah status semua tanggal jadwal di masa mendatang.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/schedules')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Batalkan
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
      </div>

      {/* CSS for animations - sama dengan SchedulesList */}
      <style>{`
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

export default ScheduleEdit;