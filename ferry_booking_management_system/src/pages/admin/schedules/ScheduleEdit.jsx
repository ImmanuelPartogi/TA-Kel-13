import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminScheduleService as scheduleService } from '../../../services/api'; 
import { toast } from 'react-toastify';

const ScheduleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch routes, ferries, and schedule data in parallel
        const [routesResponse, ferriesResponse, scheduleResponse] = await Promise.all([
          scheduleService.getRoutes(),
          scheduleService.getFerries(),
          scheduleService.getSchedule(id)
        ]);
        
        setRoutes(routesResponse.data.data);
        setFerries(ferriesResponse.data.data);
        
        const scheduleData = scheduleResponse.data.data;
        
        // Process days array from comma-separated string
        const daysArray = scheduleData.days ? scheduleData.days.split(',') : [];
        
        // Format times
        const formattedDepartureTime = scheduleData.departure_time ? 
          formatTimeForInput(scheduleData.departure_time) : '';
        const formattedArrivalTime = scheduleData.arrival_time ? 
          formatTimeForInput(scheduleData.arrival_time) : '';
        
        // Format expiry date if exists
        const formattedExpiryDate = scheduleData.status_expiry_date ? 
          formatDatetimeForInput(scheduleData.status_expiry_date) : '';
        
        setFormData({
          route_id: scheduleData.route_id,
          ferry_id: scheduleData.ferry_id,
          departure_time: formattedDepartureTime,
          arrival_time: formattedArrivalTime,
          days: daysArray,
          status: scheduleData.status || 'ACTIVE',
          status_reason: scheduleData.status_reason || '',
          status_expiry_date: formattedExpiryDate
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data jadwal. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Format time string to HH:MM for input fields
  const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    
    // If time is in object format with hours/minutes properties
    if (typeof timeString === 'object' && timeString.hours !== undefined) {
      return `${String(timeString.hours).padStart(2, '0')}:${String(timeString.minutes).padStart(2, '0')}`;
    }
    
    // If time is already in HH:MM format
    if (timeString.includes(':')) {
      return timeString;
    }
    
    // Try to parse as a date string
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }
    } catch (e) {
      console.error('Error parsing time:', e);
    }
    
    return '';
  };

  // Format datetime string to yyyy-MM-ddThh:mm format for datetime-local input
  const formatDatetimeForInput = (datetimeString) => {
    if (!datetimeString) return '';
    
    try {
      const date = new Date(datetimeString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().slice(0, 16);
      }
    } catch (e) {
      console.error('Error parsing datetime:', e);
    }
    
    return '';
  };

  // Handler for form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: undefined
      }));
    }
  };

  // Handler for days (checkboxes)
  const handleDayChange = (e) => {
    const { value, checked } = e.target;
    
    setFormData(prevState => {
      let updatedDays = [...prevState.days];
      
      if (checked) {
        updatedDays.push(value);
      } else {
        updatedDays = updatedDays.filter(day => day !== value);
      }
      
      return {
        ...prevState,
        days: updatedDays
      };
    });

    // Clear days error if it exists
    if (errors.days) {
      setErrors(prevErrors => ({
        ...prevErrors,
        days: undefined
      }));
    }
  };

  // Validate the form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.route_id) newErrors.route_id = 'Rute harus dipilih';
    if (!formData.ferry_id) newErrors.ferry_id = 'Kapal harus dipilih';
    if (!formData.departure_time) newErrors.departure_time = 'Waktu keberangkatan harus diisi';
    if (!formData.arrival_time) newErrors.arrival_time = 'Waktu kedatangan harus diisi';
    if (formData.days.length === 0) newErrors.days = 'Pilih minimal satu hari operasi';
    
    if (formData.status !== 'ACTIVE' && !formData.status_reason) {
      newErrors.status_reason = 'Alasan status harus diisi jika status bukan Aktif';
    }
    
    if (formData.status === 'DELAYED' && !formData.status_expiry_date) {
      newErrors.status_expiry_date = 'Tanggal berakhir status harus diisi untuk status Ditunda';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    try {
      // Format days array to comma-separated string for API
      const submissionData = {
        ...formData,
        days: formData.days.join(',')
      };
      
      await scheduleService.updateSchedule(id, submissionData);
      toast.success('Jadwal berhasil diperbarui!');
      navigate('/admin/schedules');
    } catch (error) {
      console.error('Error updating schedule:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Terjadi kesalahan saat menyimpan jadwal. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Edit Jadwal</h1>
        <Link
          to="/admin/schedules"
          className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 transition ease-in-out duration-150"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali
        </Link>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
          <div className="font-medium">Terjadi kesalahan:</div>
          <ul className="mt-1.5 ml-4 list-disc list-inside">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{error}</li>
            ))}
          </ul>
          <button
            type="button"
            className="float-right -mt-4 text-red-700"
            onClick={() => setErrors({})}
          >
            <span className="text-2xl" aria-hidden="true">&times;</span>
          </button>
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
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Rute</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.origin} - {route.destination} ({route.route_code})
                    </option>
                  ))}
                </select>
                {errors.route_id && <p className="mt-1 text-sm text-red-600">{errors.route_id}</p>}
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
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Kapal</option>
                  {ferries.map((ferry) => (
                    <option key={ferry.id} value={ferry.id}>
                      {ferry.name} ({ferry.registration_number})
                    </option>
                  ))}
                </select>
                {errors.ferry_id && <p className="mt-1 text-sm text-red-600">{errors.ferry_id}</p>}
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
                  onChange={handleChange}
                  required
                />
                {errors.departure_time && <p className="mt-1 text-sm text-red-600">{errors.departure_time}</p>}
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
                  onChange={handleChange}
                  required
                />
                {errors.arrival_time && <p className="mt-1 text-sm text-red-600">{errors.arrival_time}</p>}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hari Operasi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="flex items-center">
                  <input
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    type="checkbox"
                    name="days"
                    value="1"
                    id="day-1"
                    checked={formData.days.includes('1')}
                    onChange={handleDayChange}
                  />
                  <label className="ml-2 block text-sm text-gray-700" htmlFor="day-1">Senin</label>
                </div>
                <div className="flex items-center">
                  <input
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    type="checkbox"
                    name="days"
                    value="2"
                    id="day-2"
                    checked={formData.days.includes('2')}
                    onChange={handleDayChange}
                  />
                  <label className="ml-2 block text-sm text-gray-700" htmlFor="day-2">Selasa</label>
                </div>
                <div className="flex items-center">
                  <input
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    type="checkbox"
                    name="days"
                    value="3"
                    id="day-3"
                    checked={formData.days.includes('3')}
                    onChange={handleDayChange}
                  />
                  <label className="ml-2 block text-sm text-gray-700" htmlFor="day-3">Rabu</label>
                </div>
                <div className="flex items-center">
                  <input
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    type="checkbox"
                    name="days"
                    value="4"
                    id="day-4"
                    checked={formData.days.includes('4')}
                    onChange={handleDayChange}
                  />
                  <label className="ml-2 block text-sm text-gray-700" htmlFor="day-4">Kamis</label>
                </div>
                <div className="flex items-center">
                  <input
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    type="checkbox"
                    name="days"
                    value="5"
                    id="day-5"
                    checked={formData.days.includes('5')}
                    onChange={handleDayChange}
                  />
                  <label className="ml-2 block text-sm text-gray-700" htmlFor="day-5">Jumat</label>
                </div>
                <div className="flex items-center">
                  <input
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    type="checkbox"
                    name="days"
                    value="6"
                    id="day-6"
                    checked={formData.days.includes('6')}
                    onChange={handleDayChange}
                  />
                  <label className="ml-2 block text-sm text-gray-700" htmlFor="day-6">Sabtu</label>
                </div>
                <div className="flex items-center">
                  <input
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    type="checkbox"
                    name="days"
                    value="7"
                    id="day-7"
                    checked={formData.days.includes('7')}
                    onChange={handleDayChange}
                  />
                  <label className="ml-2 block text-sm text-gray-700" htmlFor="day-7">Minggu</label>
                </div>
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
                  onChange={handleChange}
                  required
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Tidak Aktif</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
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
                    onChange={handleChange}
                  />
                  {errors.status_reason && <p className="mt-1 text-sm text-red-600">{errors.status_reason}</p>}
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
                  onChange={handleChange}
                />
                {errors.status_expiry_date && <p className="mt-1 text-sm text-red-600">{errors.status_expiry_date}</p>}
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
                disabled={submitting}
                className={`px-6 py-3 ${
                  submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md text-white font-medium`}
              >
                {submitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </div>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEdit;