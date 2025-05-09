import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { scheduleService } from '../../../services/scheduleService';
import { toast } from 'react-toastify';

const ScheduleCreate = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
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
        const [routesResponse, ferriesResponse] = await Promise.all([
          scheduleService.getRoutes(),
          scheduleService.getFerries()
        ]);
        
        setRoutes(routesResponse.data.data);
        setFerries(ferriesResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Calculate arrival time based on departure time and route duration
  const calculateArrivalTime = () => {
    const { route_id, departure_time } = formData;
    
    if (!route_id || !departure_time) return;
    
    const selectedRoute = routes.find(route => route.id === route_id);
    
    if (!selectedRoute || !selectedRoute.duration) return;
    
    const [hours, minutes] = departure_time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + parseInt(selectedRoute.duration);
    const arrivalHours = Math.floor(totalMinutes / 60) % 24;
    const arrivalMinutes = totalMinutes % 60;
    
    const formattedHours = arrivalHours.toString().padStart(2, '0');
    const formattedMinutes = arrivalMinutes.toString().padStart(2, '0');
    
    setFormData(prevState => ({
      ...prevState,
      arrival_time: `${formattedHours}:${formattedMinutes}`
    }));
  };

  useEffect(() => {
    calculateArrivalTime();
  }, [formData.route_id, formData.departure_time]);

  // Validate the form data
  const validateForm = () => {
    const newErrors = {};
    
    // Step 1 validation
    if (currentStep === 1) {
      if (!formData.route_id) newErrors.route_id = 'Rute harus dipilih';
      if (!formData.ferry_id) newErrors.ferry_id = 'Kapal harus dipilih';
      if (!formData.departure_time) newErrors.departure_time = 'Waktu keberangkatan harus diisi';
      if (!formData.arrival_time) newErrors.arrival_time = 'Waktu kedatangan harus diisi';
      if (formData.status !== 'ACTIVE' && !formData.status_reason) {
        newErrors.status_reason = 'Alasan status harus diisi';
      }
    }
    
    // Step 2 validation
    if (currentStep === 2) {
      if (formData.days.length === 0) {
        newErrors.days = 'Pilih minimal satu hari operasi';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Move to next step
  const nextStep = () => {
    if (validateForm()) {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    }
  };

  // Move to previous step
  const prevStep = () => {
    setCurrentStep(1);
    window.scrollTo(0, 0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Format days array to comma-separated string for API
      const submissionData = {
        ...formData,
        days: formData.days.join(',')
      };
      
      await scheduleService.createSchedule(submissionData);
      toast.success('Jadwal berhasil dibuat!');
      navigate('/admin/schedules');
    } catch (error) {
      console.error('Error creating schedule:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Terjadi kesalahan saat menyimpan jadwal. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Day names for display
  const dayNames = {
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
    7: 'Minggu'
  };

  if (loading && routes.length === 0 && ferries.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6 text-white relative">
          <div className="absolute inset-0 overflow-hidden">
            <svg className="absolute right-0 bottom-0 opacity-10 h-64 w-64" viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg">
              <path fill="white"
                d="M46.5,-75.3C58.9,-68.9,67.3,-53.9,74.4,-38.7C81.6,-23.5,87.6,-8.1,85.8,6.3C84,20.7,74.2,34,63,44.4C51.8,54.8,39.2,62.3,25.2,68.2C11.1,74,-4.4,78.2,-19.6,76.1C-34.8,74,-49.6,65.7,-59.5,53.6C-69.4,41.5,-74.3,25.5,-77.6,8.5C-80.9,-8.5,-82.5,-26.5,-75.8,-40C-69.1,-53.5,-54.1,-62.4,-39.3,-67.4C-24.6,-72.5,-10.1,-73.7,4.4,-80.8C18.9,-87.9,34.1,-81.8,46.5,-75.3Z"
                transform="translate(100 100)" />
            </svg>
          </div>
          <div className="flex justify-between items-center relative z-10">
            <h1 className="text-2xl font-bold flex items-center">
              <i className="fas fa-plus-circle mr-3 text-blue-200"></i> Tambah Jadwal Baru
            </h1>
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
        </div>

        <div className="p-6">
          {/* Display Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm relative" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="fas fa-exclamation-circle text-red-500 mt-1"></i>
                </div>
                <div className="ml-3">
                  <p className="font-medium">Ada beberapa kesalahan:</p>
                  <ul className="mt-1 list-disc list-inside text-sm">
                    {Object.entries(errors).map(([key, value]) => (
                      <li key={key}>{value}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button 
                className="absolute top-2 right-2 text-red-700" 
                onClick={() => setErrors({})}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1 mb-4 md:mb-0">
                <div className="flex items-center">
                  <div
                    className={`${
                      currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                    } rounded-full h-10 w-10 flex items-center justify-center font-bold shadow-md`}
                  >
                    1
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Informasi Dasar</p>
                    <p className="text-xs text-gray-500">Detail jadwal utama</p>
                  </div>
                </div>
              </div>
              <div className="w-full mx-4 h-2 bg-gray-200 rounded-full hidden md:block">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: currentStep === 1 ? '50%' : '100%' }}></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <div
                    className={`${
                      currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                    } rounded-full h-10 w-10 flex items-center justify-center font-bold shadow-md`}
                  >
                    2
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-700'}`}>Hari Operasional</p>
                    <p className="text-xs text-gray-500">Jadwal mingguan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="basic-info-section bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
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
                        className={`pl-10 bg-white border ${
                          errors.route_id ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm`}
                        id="route_id"
                        name="route_id"
                        value={formData.route_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Pilih Rute --</option>
                        {routes.map((route) => (
                          <option key={route.id} value={route.id} data-duration={route.duration}>
                            {route.origin} - {route.destination} ({route.route_code})
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.route_id && <p className="mt-1 text-sm text-red-600">{errors.route_id}</p>}
                    <p className="text-xs text-gray-500 mt-1">Pilih rute yang akan dijadwalkan</p>
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
                        className={`pl-10 bg-white border ${
                          errors.ferry_id ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm`}
                        id="ferry_id"
                        name="ferry_id"
                        value={formData.ferry_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Pilih Kapal --</option>
                        {ferries.map((ferry) => (
                          <option key={ferry.id} value={ferry.id}>
                            {ferry.name} ({ferry.registration_number})
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.ferry_id && <p className="mt-1 text-sm text-red-600">{errors.ferry_id}</p>}
                    <p className="text-xs text-gray-500 mt-1">Kapal yang akan beroperasi pada jadwal ini</p>
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
                        className={`pl-10 bg-white border ${
                          errors.departure_time ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm`}
                        id="departure_time"
                        name="departure_time"
                        value={formData.departure_time}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {errors.departure_time && <p className="mt-1 text-sm text-red-600">{errors.departure_time}</p>}
                    <p className="text-xs text-gray-500 mt-1">Waktu keberangkatan kapal (format 24 jam)</p>
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
                        className={`pl-10 bg-white border ${
                          errors.arrival_time ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm`}
                        id="arrival_time"
                        name="arrival_time"
                        value={formData.arrival_time}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {errors.arrival_time && <p className="mt-1 text-sm text-red-600">{errors.arrival_time}</p>}
                    <p className="text-xs text-gray-500 mt-1">Perkiraan waktu kedatangan (format 24 jam)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-toggle-on text-gray-400"></i>
                      </div>
                      <select
                        className="pl-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                      >
                        <option value="ACTIVE">Aktif</option>
                        <option value="INACTIVE">Tidak Aktif</option>
                      </select>
                    </div>
                    {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                    <p className="text-xs text-gray-500 mt-1">Status keaktifan jadwal</p>
                  </div>

                  {formData.status !== 'ACTIVE' && (
                    <div>
                      <label htmlFor="status_reason" className="block text-sm font-medium text-gray-700 mb-1">
                        Alasan Status
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-comment-alt text-gray-400"></i>
                        </div>
                        <input
                          type="text"
                          className={`pl-10 bg-white border ${
                            errors.status_reason ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm`}
                          id="status_reason"
                          name="status_reason"
                          value={formData.status_reason}
                          onChange={handleChange}
                          placeholder="Mis. Cuaca buruk, Pemeliharaan kapal"
                        />
                      </div>
                      {errors.status_reason && <p className="mt-1 text-sm text-red-600">{errors.status_reason}</p>}
                      <p className="text-xs text-gray-500 mt-1">Alasan jika status tidak aktif</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Operating Days */}
            {currentStep === 2 && (
              <div className="operating-days-section bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center border-b pb-3">
                  <i className="fas fa-calendar-alt mr-2 text-blue-500"></i> Hari Operasional
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <p className="mb-3 text-sm text-gray-700">Pilih hari-hari di mana jadwal ini beroperasi:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 days-selection">
                      {Object.entries(dayNames).map(([value, name]) => (
                        <div
                          key={value}
                          className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            id={`day_${value}`}
                            name="days"
                            value={value}
                            checked={formData.days.includes(value)}
                            onChange={handleDayChange}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`day_${value}`}
                            className="ml-2 text-sm font-medium text-gray-900 cursor-pointer select-none"
                          >
                            {name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.days && <p className="mt-1 text-sm text-red-600">{errors.days}</p>}
                    <p className="text-xs text-gray-500 mt-2">Jadwal ini akan beroperasi setiap hari yang dipilih</p>
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
                            ? routes.find(route => route.id === formData.route_id)?.origin +
                              ' - ' +
                              routes.find(route => route.id === formData.route_id)?.destination
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
                            ? ferries.find(ferry => ferry.id === formData.ferry_id)?.name
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
                  onClick={prevStep}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center"
                >
                  <i className="fas fa-arrow-left mr-2"></i> Kembali
                </button>
              )}

              {currentStep === 1 && (
                <div></div> // Empty div to maintain layout
              )}

              <div className="flex space-x-3">
                <Link
                  to="/admin/schedules"
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center"
                >
                  <i className="fas fa-times mr-2"></i> Batal
                </Link>
                
                {currentStep === 1 && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center"
                  >
                    <span>Lanjut</span> <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                )}
                
                {currentStep === 2 && (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`${
                      loading ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700'
                    } text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i> Simpan
                      </>
                    )}
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