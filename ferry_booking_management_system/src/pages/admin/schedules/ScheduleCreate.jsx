import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminScheduleService from '../../../services/adminSchedule.service';

const ScheduleCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [ferries, setFerries] = useState([]);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  
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
  }, []);

  const fetchData = async () => {
    try {
      const [routesRes, ferriesRes] = await Promise.all([
        adminScheduleService.get('/admin-panel/routes'),
        adminScheduleService.get('/admin-panel/ferries')
      ]);
      
      // Debug response struktur
      console.log('Routes Response:', routesRes.data);
      console.log('Ferries Response:', ferriesRes.data);
      
      // Berbagai kemungkinan struktur response
      const routesData = routesRes.data.data || routesRes.data;
      const ferriesData = ferriesRes.data.data || ferriesRes.data;
      
      // Extract routes array dengan berbagai kemungkinan struktur
      if (Array.isArray(routesData)) {
        setRoutes(routesData);
      } else if (routesData.routes) {
        setRoutes(routesData.routes);
      } else if (routesData.data) {
        setRoutes(routesData.data);
      } else {
        console.error('Unexpected routes data structure:', routesData);
        setRoutes([]);
      }
      
      // Extract ferries array dengan berbagai kemungkinan struktur
      if (Array.isArray(ferriesData)) {
        setFerries(ferriesData);
      } else if (ferriesData.ferries) {
        setFerries(ferriesData.ferries);
      } else if (ferriesData.data) {
        setFerries(ferriesData.data);
      } else {
        console.error('Unexpected ferries data structure:', ferriesData);
        setFerries([]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response);
    }
  };

  // Debug state changes
  useEffect(() => {
    console.log('Routes state:', routes);
    console.log('Ferries state:', ferries);
  }, [routes, ferries]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const numValue = parseInt(value); // Konversi ke number
      const newDays = checked 
        ? [...formData.days, numValue]
        : formData.days.filter(day => day !== numValue);
      setFormData({ ...formData, days: newDays });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const calculateArrivalTime = () => {
    if (!formData.departure_time || !formData.route_id) return;
    
    const route = routes.find(r => r.id === parseInt(formData.route_id));
    if (!route) return;
    
    const [hours, minutes] = formData.departure_time.split(':').map(Number);
    const duration = route.duration || 0;
    
    let totalMinutes = hours * 60 + minutes + duration;
    const arrivalHours = Math.floor(totalMinutes / 60) % 24;
    const arrivalMinutes = totalMinutes % 60;
    
    const formattedHours = arrivalHours.toString().padStart(2, '0');
    const formattedMinutes = arrivalMinutes.toString().padStart(2, '0');
    
    setFormData(prev => ({
      ...prev,
      arrival_time: `${formattedHours}:${formattedMinutes}`
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.route_id) newErrors.route_id = 'Rute harus dipilih';
    if (!formData.ferry_id) newErrors.ferry_id = 'Kapal harus dipilih';
    if (!formData.departure_time) newErrors.departure_time = 'Waktu keberangkatan harus diisi';
    if (!formData.arrival_time) newErrors.arrival_time = 'Waktu kedatangan harus diisi';
    if (formData.days.length === 0) newErrors.days = 'Pilih minimal satu hari operasional';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const requiredFields = ['route_id', 'ferry_id', 'departure_time', 'arrival_time'];
      const hasErrors = requiredFields.some(field => !formData[field]);
      
      if (hasErrors) {
        validateForm();
        return;
      }
      
      setCurrentStep(2);
    }
  };

  const handlePrev = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await adminScheduleService.post('/admin-panel/schedules', {
        ...formData,
        days: formData.days  // Kirim sebagai array, bukan string
      });
      navigate('/admin/schedules');
    } catch (error) {
      console.error('Submit error:', error.response?.data);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6 text-white relative">
          <div className="flex justify-between items-center relative z-10">
            <h1 className="text-2xl font-bold flex items-center">
              <i className="fas fa-plus-circle mr-3 text-blue-200"></i> Tambah Jadwal Baru
            </h1>
            <Link to="/admin/schedules" 
              className="inline-flex items-center px-4 py-2 bg-gray-600 rounded-md font-semibold text-xs text-white uppercase hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
            </Link>
          </div>
        </div>

        <div className="p-6">

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1 mb-4 md:mb-0">
                <div className="flex items-center">
                  <div className={`${currentStep >= 1 ? 'bg-blue-500' : 'bg-gray-300'} text-white rounded-full h-10 w-10 flex items-center justify-center font-bold shadow-md`}>
                    1
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Informasi Dasar</p>
                    <p className="text-xs text-gray-500">Detail jadwal utama</p>
                  </div>
                </div>
              </div>
              <div className="w-full mx-4 h-2 bg-gray-200 rounded-full hidden md:block">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: currentStep === 2 ? '100%' : '50%' }}></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <div className={`${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'} text-${currentStep >= 2 ? 'white' : 'gray-700'} rounded-full h-10 w-10 flex items-center justify-center font-bold shadow-sm`}>
                    2
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Hari Operasional</p>
                    <p className="text-xs text-gray-500">Jadwal mingguan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center border-b pb-3">
                  <i className="fas fa-info-circle mr-2 text-blue-500"></i> Informasi Dasar Jadwal
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Rute <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-map-marked-alt text-gray-400"></i>
                      </div>
                      <select
                        className={`pl-10 bg-white border ${errors.route_id ? 'border-red-300' : 'border-gray-300'} rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm`}
                        id="route_id" 
                        name="route_id" 
                        value={formData.route_id}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTimeout(calculateArrivalTime, 100);
                        }}
                        required
                      >
                        <option value="">-- Pilih Rute --</option>
                        {routes.map(route => (
                          <option key={route.id} value={route.id} data-duration={route.duration}>
                            {route.origin} - {route.destination} ({route.route_code || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.route_id && <p className="mt-1 text-sm text-red-600">{errors.route_id}</p>}
                    {routes.length === 0 && <p className="mt-1 text-sm text-yellow-600">Loading routes...</p>}
                  </div>

                  <div>
                    <label htmlFor="ferry_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Kapal <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-ship text-gray-400"></i>
                      </div>
                      <select
                        className={`pl-10 bg-white border ${errors.ferry_id ? 'border-red-300' : 'border-gray-300'} rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm`}
                        id="ferry_id" 
                        name="ferry_id" 
                        value={formData.ferry_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">-- Pilih Kapal --</option>
                        {ferries.map(ferry => (
                          <option key={ferry.id} value={ferry.id}>
                            {ferry.name} ({ferry.registration_number || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.ferry_id && <p className="mt-1 text-sm text-red-600">{errors.ferry_id}</p>}
                    {ferries.length === 0 && <p className="mt-1 text-sm text-yellow-600">Loading ferries...</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Keberangkatan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-clock text-gray-400"></i>
                      </div>
                      <input 
                        type="time"
                        className={`pl-10 bg-white border ${errors.departure_time ? 'border-red-300' : 'border-gray-300'} rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm`}
                        id="departure_time" 
                        name="departure_time" 
                        value={formData.departure_time}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTimeout(calculateArrivalTime, 100);
                        }}
                        required
                      />
                    </div>
                    {errors.departure_time && <p className="mt-1 text-sm text-red-600">{errors.departure_time}</p>}
                  </div>

                  <div>
                    <label htmlFor="arrival_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Kedatangan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-clock text-gray-400"></i>
                      </div>
                      <input 
                        type="time"
                        className={`pl-10 bg-white border ${errors.arrival_time ? 'border-red-300' : 'border-gray-300'} rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm`}
                        id="arrival_time" 
                        name="arrival_time" 
                        value={formData.arrival_time}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {errors.arrival_time && <p className="mt-1 text-sm text-red-600">{errors.arrival_time}</p>}
                  </div>
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
                        className="pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                        id="status_reason" 
                        name="status_reason" 
                        value={formData.status_reason}
                        onChange={handleInputChange}
                        placeholder="Mis. Cuaca buruk, Pemeliharaan kapal"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Operating Days */}
            {currentStep === 2 && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center border-b pb-3">
                  <i className="fas fa-calendar-alt mr-2 text-blue-500"></i> Hari Operasional
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <p className="mb-3 text-sm text-gray-700">Pilih hari-hari di mana jadwal ini beroperasi:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {Object.entries(dayNames).map(([value, name]) => {
                        const numValue = parseInt(value);
                        return (
                          <div key={value} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
                            <input 
                              type="checkbox" 
                              id={`day_${value}`}
                              name="days"
                              value={value}
                              checked={formData.days.includes(numValue)}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`day_${value}`} className="ml-2 text-sm font-medium text-gray-900 cursor-pointer select-none">
                              {name}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    {errors.days && <p className="mt-1 text-sm text-red-600">{errors.days}</p>}
                  </div>
                </div>

                {/* Schedule Summary Card */}
                <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                  <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <i className="fas fa-clipboard-list mr-2 text-blue-500"></i> Ringkasan Jadwal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Rute:</p>
                      <p className="font-medium text-gray-900 flex items-center">
                        <i className="fas fa-route mr-2 text-blue-500"></i>
                        <span>
                          {formData.route_id 
                            ? routes.find(r => r.id === parseInt(formData.route_id))?.origin + ' - ' + 
                              routes.find(r => r.id === parseInt(formData.route_id))?.destination
                            : '-'}
                        </span>
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Kapal:</p>
                      <p className="font-medium text-gray-900 flex items-center">
                        <i className="fas fa-ship mr-2 text-blue-500"></i>
                        <span>
                          {formData.ferry_id
                            ? ferries.find(f => f.id === parseInt(formData.ferry_id))?.name
                            : '-'}
                        </span>
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Waktu:</p>
                      <p className="font-medium text-gray-900 flex items-center">
                        <i className="fas fa-clock mr-2 text-blue-500"></i>
                        <span>
                          {formData.departure_time && formData.arrival_time
                            ? `${formData.departure_time} - ${formData.arrival_time}`
                            : '-'}
                        </span>
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Hari Operasional:</p>
                      <p className="font-medium text-gray-900 flex items-center">
                        <i className="fas fa-calendar-day mr-2 text-blue-500"></i>
                        <span>
                          {formData.days.length > 0
                            ? formData.days.map(day => dayNames[day]).join(', ')
                            : '-'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between mt-6">
              {currentStep === 2 && (
                <button 
                  type="button" 
                  onClick={handlePrev}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center"
                >
                  <i className="fas fa-arrow-left mr-2"></i> Kembali
                </button>
              )}

              <div className="flex space-x-3">
                <Link to="/admin/schedules"
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center">
                  <i className="fas fa-times mr-2"></i> Batal
                </Link>
                
                {currentStep === 1 ? (
                  <button 
                    type="button" 
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center"
                  >
                    <span>Lanjut</span> <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                ) : (
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center disabled:opacity-50"
                  >
                    <i className="fas fa-save mr-2"></i> {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCreate;