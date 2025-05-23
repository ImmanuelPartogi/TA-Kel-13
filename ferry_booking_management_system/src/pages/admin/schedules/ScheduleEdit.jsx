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

  useEffect(() => {
    fetchData();
    
    // Auto-hide alert after 5 seconds
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({...alert, show: false});
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
      
      setFormData({
        route_id: schedule.route_id,
        ferry_id: schedule.ferry_id,
        departure_time: formatTime(schedule.departure_time),
        arrival_time: formatTime(schedule.arrival_time),
        days: schedule.days.split(','),
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const newDays = checked 
        ? [...formData.days, value]
        : formData.days.filter(day => day !== value);
      setFormData({ ...formData, days: newDays });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.days.length === 0) {
      setErrors({ days: 'Pilih minimal satu hari operasional' });
      return;
    }
    
    setSaving(true);
    try {
      await adminScheduleService.put(`/admin-panel/schedules/${id}`, {
        ...formData,
        days: formData.days // Kirim sebagai array, tidak perlu join
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
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal memperbarui jadwal'
      });
    } finally {
      setSaving(false);
    }
  };

  // Loading State - sama dengan SchedulesList
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-md p-8 text-center">
        <div className="inline-block relative">
          <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
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

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-red-500 px-4 py-2 text-white flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                <span className="font-medium">Error</span>
              </div>
            </div>
            <div className="bg-red-50 border-red-100 text-red-700 px-4 py-3 border-t">
              <ul className="list-disc list-inside space-y-1">
                {Object.values(errors).flat().map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
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
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-plane-departure text-gray-400"></i>
                    </div>
                    <input 
                      type="time"
                      id="departure_time" 
                      name="departure_time" 
                      value={formData.departure_time}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="arrival_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Kedatangan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-plane-arrival text-gray-400"></i>
                    </div>
                    <input 
                      type="time"
                      id="arrival_time" 
                      name="arrival_time" 
                      value={formData.arrival_time}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Hari Operasi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {Object.entries(dayNames).map(([value, name]) => {
                    const isChecked = formData.days.includes(value);
                    return (
                      <div 
                        key={value} 
                        className={`flex items-center p-3 border rounded-lg transition-all duration-200 ${
                          isChecked 
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