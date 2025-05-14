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
  }, [id]);

  const fetchData = async () => {
    try {
      const [scheduleRes, routesRes, ferriesRes] = await Promise.all([
        adminScheduleService.get(`/admin-panel/schedules/${id}`),
        adminScheduleService.get('/admin-panel/routes'),
        adminScheduleService.get('/admin-panel/ferries')
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
      await adminScheduleService.put(`/api/admin-panel/schedules/${id}`, {
        ...formData,
        days: formData.days.join(',')
      });
      navigate('/admin/schedules');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Edit Jadwal</h1>
        <Link to="/admin/schedules"
          className="inline-flex items-center px-4 py-2 bg-gray-600 rounded-md font-semibold text-xs text-white uppercase hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </Link>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
          <div className="font-medium">Terjadi kesalahan:</div>
          <ul className="mt-1.5 ml-4 list-disc list-inside">
            {Object.values(errors).flat().map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-white">Form Edit Jadwal</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Rute <span className="text-red-500">*</span>
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  id="route_id" 
                  name="route_id" 
                  value={formData.route_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Pilih Rute</option>
                  {routes.length > 0 ? (
                    routes.map(route => (
                      <option key={route.id} value={route.id}>
                        {route.origin} - {route.destination} ({route.route_code})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Tidak ada rute tersedia</option>
                  )}
                </select>
                {routes.length === 0 && (
                  <p className="mt-1 text-sm text-red-600">Tidak ada rute yang tersedia</p>
                )}
              </div>
              <div>
                <label htmlFor="ferry_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Kapal <span className="text-red-500">*</span>
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  id="ferry_id" 
                  name="ferry_id" 
                  value={formData.ferry_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Pilih Kapal</option>
                  {ferries.length > 0 ? (
                    ferries.map(ferry => (
                      <option key={ferry.id} value={ferry.id}>
                        {ferry.name} ({ferry.registration_number})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Tidak ada kapal tersedia</option>
                  )}
                </select>
                {ferries.length === 0 && (
                  <p className="mt-1 text-sm text-red-600">Tidak ada kapal yang tersedia</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Waktu Keberangkatan <span className="text-red-500">*</span>
                </label>
                <input 
                  type="time"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  id="departure_time" 
                  name="departure_time" 
                  value={formData.departure_time}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="arrival_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Waktu Kedatangan <span className="text-red-500">*</span>
                </label>
                <input 
                  type="time"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  id="arrival_time" 
                  name="arrival_time" 
                  value={formData.arrival_time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hari Operasi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {Object.entries(dayNames).map(([value, name]) => (
                  <div key={value} className="flex items-center">
                    <input 
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      type="checkbox" 
                      name="days" 
                      value={value} 
                      id={`day-${value}`}
                      checked={formData.days.includes(value)}
                      onChange={handleInputChange}
                    />
                    <label className="ml-2 block text-sm text-gray-700" htmlFor={`day-${value}`}>
                      {name}
                    </label>
                  </div>
                ))}
              </div>
              {errors.days && <p className="mt-1 text-sm text-red-600">{errors.days}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  id="status" 
                  name="status" 
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Tidak Aktif</option>
                </select>
              </div>
              {formData.status !== 'ACTIVE' && (
                <div>
                  <label htmlFor="status_reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan Status
                  </label>
                  <input 
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    id="status_reason" 
                    name="status_reason" 
                    value={formData.status_reason}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            {formData.status === 'DELAYED' && (
              <div className="mt-6">
                <label htmlFor="status_expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Berakhir Status
                </label>
                <input 
                  type="datetime-local"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  id="status_expiry_date" 
                  name="status_expiry_date" 
                  value={formData.status_expiry_date}
                  onChange={handleInputChange}
                />
                <p className="mt-1 text-sm text-gray-500">Isi jika status akan berakhir pada waktu tertentu. Khusus untuk status Ditunda (DELAYED).</p>
              </div>
            )}

            {formData.status !== 'ACTIVE' && (
              <div className="mt-6">
                <div className="p-4 rounded-md bg-yellow-50 border-l-4 border-yellow-400">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Perhatian!</strong> Mengubah status jadwal akan mempengaruhi tanggal-tanggal jadwal yang sudah ada. Perubahan status menjadi Dibatalkan atau Ditunda akan secara otomatis mengubah status semua tanggal jadwal di masa mendatang.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8">
              <button 
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md text-white font-medium disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEdit;