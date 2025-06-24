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
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isArrivalTimeAuto, setIsArrivalTimeAuto] = useState(true); // Default ke true
  const [nextDayArrival, setNextDayArrival] = useState(false); // Menandai jika kedatangan di hari berikutnya

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

  // Effect untuk otomatis menghitung waktu kedatangan saat rute atau waktu keberangkatan berubah
  useEffect(() => {
    if (isArrivalTimeAuto && formData.route_id && formData.departure_time) {
      calculateArrivalTime();
    }
  }, [formData.route_id, formData.departure_time, isArrivalTimeAuto]);

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
      const [routesRes, ferriesRes] = await Promise.all([
        adminScheduleService.get('/admin-panel/routes'),
        adminScheduleService.get('/admin-panel/ferries')
      ]);

      // Log respons untuk debugging
      console.log('Routes response:', routesRes);

      // Extract routes array dengan berbagai kemungkinan struktur
      const routesData = routesRes.data.data || routesRes.data;
      const ferriesData = ferriesRes.data.data || ferriesRes.data;

      let extractedRoutes = [];

      if (Array.isArray(routesData)) {
        extractedRoutes = routesData;
      } else if (routesData.routes && Array.isArray(routesData.routes)) {
        extractedRoutes = routesData.routes;
      } else if (routesData.data && Array.isArray(routesData.data)) {
        extractedRoutes = routesData.data;
      } else {
        console.error('Unexpected routes data structure:', routesData);
        extractedRoutes = [];
      }

      // Verifikasi apakah setiap rute memiliki properti duration
      const routesWithDuration = extractedRoutes.map(route => {
        if (route.duration === undefined || route.duration === null) {
          console.warn(`Rute ${route.id} (${route.origin} - ${route.destination}) tidak memiliki durasi!`);
          // Opsional: Tambahkan durasi default jika perlu
          return { ...route, duration: 0 };
        }

        // Pastikan durasi adalah angka
        const duration = parseInt(route.duration, 10);
        if (isNaN(duration)) {
          console.warn(`Rute ${route.id} memiliki durasi yang bukan angka: ${route.duration}`);
          return { ...route, duration: 0 };
        }

        return route;
      });

      console.log('Routes dengan durasi:', routesWithDuration);
      setRoutes(routesWithDuration);

      // Proses data kapal seperti biasa
      let extractedFerries = [];
      if (Array.isArray(ferriesData)) {
        extractedFerries = ferriesData;
      } else if (ferriesData.ferries && Array.isArray(ferriesData.ferries)) {
        extractedFerries = ferriesData.ferries;
      } else if (ferriesData.data && Array.isArray(ferriesData.data)) {
        extractedFerries = ferriesData.data;
      } else {
        console.error('Unexpected ferries data structure:', ferriesData);
        extractedFerries = [];
      }

      setFerries(extractedFerries);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'auto_arrival') {
      // Toggle mode otomatis/manual untuk waktu kedatangan
      console.log("Toggle auto_arrival:", checked);
      setIsArrivalTimeAuto(checked);
      if (checked && formData.route_id && formData.departure_time) {
        // Recalculate arrival time when turning auto back on
        calculateArrivalTime();
      }
    } else if (type === 'checkbox' && name === 'days') {
      const numValue = parseInt(value); // Konversi ke number
      const newDays = checked
        ? [...formData.days, numValue]
        : formData.days.filter(day => day !== numValue);
      // Note: Kita tetap simpan days sesuai urutan klik user di state
      // Pengurutan dilakukan saat menampilkan dan mengirim data
      setFormData({ ...formData, days: newDays });
    } else if (name === 'departure_time' || name === 'arrival_time') {
      // Khusus untuk input waktu, hanya update langsung
      // Pemformatan akan dilakukan di onBlur
      setFormData({ ...formData, [name]: value });

      // Jika pengguna mengubah waktu kedatangan secara manual, tandai bahwa ini bukan hasil otomatis
      if (name === 'arrival_time') {
        setIsArrivalTimeAuto(false);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const calculateArrivalTime = () => {
    if (!formData.departure_time || !formData.route_id) {
      console.log('Tidak dapat menghitung waktu kedatangan: waktu keberangkatan atau rute belum dipilih');
      return;
    }

    // Validasi format waktu keberangkatan
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.departure_time)) {
      console.warn('Format waktu keberangkatan tidak valid:', formData.departure_time);
      return;
    }

    const route = routes.find(r => r.id === parseInt(formData.route_id));
    if (!route || !route.duration) {
      console.warn('Durasi rute tidak ditemukan atau tidak valid:', route);
      return;
    }

    // Parse departure time
    const parts = formData.departure_time.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    const duration = parseInt(route.duration, 10);
    if (isNaN(duration)) {
      console.warn('Durasi rute bukan angka valid:', route.duration);
      return;
    }

    console.log(`Menghitung waktu kedatangan: ${hours}:${minutes} + ${duration} menit`);

    let totalMinutes = hours * 60 + minutes + duration;
    let isNextDay = false;

    // Cek apakah waktu kedatangan di hari berikutnya
    if (totalMinutes >= 24 * 60) {
      isNextDay = true;
      totalMinutes = totalMinutes % (24 * 60);
    }

    const arrivalHours = Math.floor(totalMinutes / 60);
    const arrivalMinutes = totalMinutes % 60;

    const formattedHours = arrivalHours.toString().padStart(2, '0');
    const formattedMinutes = arrivalMinutes.toString().padStart(2, '0');

    const newArrivalTime = `${formattedHours}:${formattedMinutes}`;
    console.log(`Waktu kedatangan yang dihitung: ${newArrivalTime} ${isNextDay ? '(hari berikutnya)' : ''}`);

    // Update arrival_time, tandai ini hasil otomatis, dan status hari berikutnya
    setFormData(prev => ({
      ...prev,
      arrival_time: newArrivalTime
    }));
    setIsArrivalTimeAuto(true);
    setNextDayArrival(isNextDay);
  };

  // Fungsi untuk menangani perubahan jam keberangkatan
  const handleDepartureHourChange = (e) => {
    const hour = e.target.value;
    const minute = formData.departure_time ? formData.departure_time.split(':')[1] || '00' : '00';
    const newTime = `${hour}:${minute}`;

    // Perbarui waktu keberangkatan
    setFormData({ ...formData, departure_time: newTime });

    // calculateArrivalTime akan dipanggil melalui useEffect
  };

  // Fungsi untuk menangani perubahan menit keberangkatan
  const handleDepartureMinuteChange = (e) => {
    const minute = e.target.value;
    const hour = formData.departure_time ? formData.departure_time.split(':')[0] || '00' : '00';
    const newTime = `${hour}:${minute}`;

    // Perbarui waktu keberangkatan
    setFormData({ ...formData, departure_time: newTime });

    // calculateArrivalTime akan dipanggil melalui useEffect
  };

  // Fungsi untuk menangani perubahan jam kedatangan
  const handleArrivalHourChange = (e) => {
    const hour = e.target.value;
    const minute = formData.arrival_time ? formData.arrival_time.split(':')[1] || '00' : '00';
    const newTime = `${hour}:${minute}`;

    setFormData({ ...formData, arrival_time: newTime });
    setIsArrivalTimeAuto(false); // User mengubah manual
  };

  // Fungsi untuk menangani perubahan menit kedatangan
  const handleArrivalMinuteChange = (e) => {
    const minute = e.target.value;
    const hour = formData.arrival_time ? formData.arrival_time.split(':')[0] || '00' : '00';
    const newTime = `${hour}:${minute}`;

    setFormData({ ...formData, arrival_time: newTime });
    setIsArrivalTimeAuto(false); // User mengubah manual
  };

  // Fungsi untuk menghitung durasi perjalanan dari waktu keberangkatan dan kedatangan
  const calculateTravelDuration = () => {
    if (!formData.departure_time || !formData.arrival_time) {
      return null;
    }

    // Parse departure time
    const [depHours, depMinutes] = formData.departure_time.split(':').map(num => parseInt(num, 10));
    const [arrHours, arrMinutes] = formData.arrival_time.split(':').map(num => parseInt(num, 10));

    // Convert to minutes
    let depTotalMinutes = depHours * 60 + depMinutes;
    let arrTotalMinutes = arrHours * 60 + arrMinutes;

    // Handle next day arrival
    if (nextDayArrival || arrTotalMinutes < depTotalMinutes) {
      arrTotalMinutes += 24 * 60; // Add a full day in minutes
    }

    // Calculate duration
    return arrTotalMinutes - depTotalMinutes;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.route_id) newErrors.route_id = 'Rute harus dipilih';
    if (!formData.ferry_id) newErrors.ferry_id = 'Kapal harus dipilih';

    if (!formData.departure_time) {
      newErrors.departure_time = 'Waktu keberangkatan harus diisi';
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.departure_time)) {
      newErrors.departure_time = 'Pilih jam dan menit keberangkatan';
    }

    if (!formData.arrival_time) {
      newErrors.arrival_time = 'Waktu kedatangan harus diisi';
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.arrival_time)) {
      newErrors.arrival_time = 'Pilih jam dan menit kedatangan';
    } else if (!nextDayArrival) {
      // Verifikasi waktu kedatangan hanya jika bukan di hari berikutnya
      // Parse waktu
      const [dHour, dMinute] = formData.departure_time.split(':').map(Number);
      const [aHour, aMinute] = formData.arrival_time.split(':').map(Number);

      const departureMinutes = dHour * 60 + dMinute;
      const arrivalMinutes = aHour * 60 + aMinute;

      if (arrivalMinutes <= departureMinutes && !nextDayArrival) {
        newErrors.arrival_time = 'Waktu kedatangan harus setelah waktu keberangkatan';
      }
    }

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
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fungsi untuk mengurutkan array hari
  const getSortedDays = (days) => {
    // Urutkan hari-hari secara numerik (1=Senin, 2=Selasa, dst.)
    return [...days].sort((a, b) => a - b);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Urutkan array hari operasional sebelum dikirim
      const sortedDays = getSortedDays(formData.days);

      console.log('Hari operasional asli:', formData.days);
      console.log('Hari operasional berurutan:', sortedDays);

      // Tambahkan informasi durasi dan flag hari berikutnya ke data yang dikirim
      await adminScheduleService.post('/admin-panel/schedules', {
        ...formData,
        days: sortedDays, // Gunakan array hari yang sudah diurutkan
        next_day_arrival: nextDayArrival
      });

      // Success notification
      const notification = document.getElementById('notification');
      if (notification) {
        notification.classList.remove('opacity-0');
        notification.classList.add('opacity-100');

        setTimeout(() => {
          notification.classList.remove('opacity-100');
          notification.classList.add('opacity-0');

          setTimeout(() => {
            navigate('/admin/schedules');
          }, 300);
        }, 1500);
      } else {
        navigate('/admin/schedules');
      }
    } catch (error) {
      console.error('Submit error:', error.response?.data);

      // Tambahkan penanganan khusus untuk error konflik jadwal
      if (error.response?.data?.conflicting_schedule) {
        setErrors({
          ...error.response?.data?.errors,
          general: [
            'Terjadi konflik jadwal untuk kapal yang dipilih.',
            '1. Pilih kapal lain yang tersedia',
            '2. Pilih hari operasional yang berbeda (hindari hari yang sama)',
            '3. Hubungi admin untuk menyesuaikan jadwal yang sudah ada'
          ]
        });
      } else if (error.response?.data?.errors) {
        // Penanganan error lainnya tetap sama
        setErrors(error.response.data.errors);
      }
      setLoading(false);
    }
  };

  // Menentukan durasi rute yang dipilih
  const getSelectedRouteDuration = () => {
    if (!formData.route_id) return null;
    const route = routes.find(r => r.id === parseInt(formData.route_id));
    return route?.duration || null;
  };

  // Mengubah menit ke format jam:menit
  const formatDuration = (minutes) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}j ${mins}m` : `${mins}m`;
  };

  // Cek apakah rute yang dipilih memiliki durasi
  const selectedRoute = formData.route_id ? routes.find(r => r.id === parseInt(formData.route_id)) : null;
  const isDurationAvailable = selectedRoute && selectedRoute.duration > 0;

  // Menghitung perbedaan antara durasi terhitung dan durasi rute
  const calculatedDuration = calculateTravelDuration();
  const durationDifference = calculatedDuration !== null && getSelectedRouteDuration() !== null
    ? calculatedDuration - getSelectedRouteDuration()
    : null;
  const hasDurationDiscrepancy = durationDifference !== null && Math.abs(durationDifference) > 5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
      {/* Success Notification */}
      <div id="notification" className="fixed top-4 right-4 bg-green-50 border-l-4 border-green-500 p-4 shadow-2xl rounded-r-lg transition-opacity duration-300 opacity-0 z-50 flex items-center">
        <div className="text-green-500 mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div>
          <p className="font-medium text-green-800">Jadwal berhasil disimpan!</p>
          <p className="text-sm text-green-700">Mengalihkan ke daftar jadwal...</p>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100 mb-6 transition-all duration-300 hover:shadow-2xl">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#smallGrid)" />
            </svg>
          </div>

          <div className="flex justify-between items-center relative z-10">
            <h1 className="text-2xl font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tambah Jadwal Baru
            </h1>
            <Link to="/admin/schedules"
              className="inline-flex items-center px-4 py-2 bg-black/20 backdrop-blur-sm rounded-lg font-medium text-sm text-white hover:bg-black/30 transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
            </Link>
          </div>

          {/* Breadcrumb */}
          <div className="mt-2 flex items-center text-sm text-blue-100/80">
            <Link to="/admin/dashboard" className="hover:text-white">Dashboard</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/admin/schedules" className="hover:text-white">Jadwal</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span>Tambah Jadwal</span>
          </div>
        </div>

        {isDataLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Memuat data rute dan kapal...</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1 mb-4 md:mb-0">
                  <div className="flex items-center">
                    <div className={`${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'} text-white rounded-full h-12 w-12 flex items-center justify-center font-bold shadow-lg transition-all duration-300 transform ${currentStep >= 1 ? 'scale-100' : 'scale-95'}`}>
                      1
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-semibold text-gray-900">Informasi Dasar</p>
                      <p className="text-sm text-gray-500">Detail jadwal utama</p>
                    </div>
                  </div>
                </div>
                <div className="w-full mx-6 h-2 bg-gray-200 rounded-full hidden md:block relative">
                  <div className="h-2 bg-blue-600 rounded-full transition-all duration-500 ease-in-out" style={{ width: currentStep === 2 ? '100%' : '50%' }}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className={`${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'} text-white rounded-full h-12 w-12 flex items-center justify-center font-bold shadow-lg transition-all duration-300 transform ${currentStep >= 2 ? 'scale-100' : 'scale-95'}`}>
                      2
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-semibold text-gray-900">Hari Operasional</p>
                      <p className="text-sm text-gray-500">Jadwal mingguan</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tambahkan di bawah Progress Steps, sekitar baris 200 */}
            {(errors.general || errors.route_id || errors.ferry_id || errors.departure_time || errors.arrival_time) && (
              <div class="mb-6 bg-red-50 border-l-4 border-red-500 p-5 rounded-md shadow-md">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="ml-3 w-full">
                    <h3 class="text-lg font-medium text-red-800">Konflik Jadwal Terdeteksi</h3>

                    <div class="mt-3 p-4 bg-white rounded-lg border border-red-200">

                      <ul class="ml-7 space-y-1.5 text-sm text-gray-800">
                        <li><span class="font-medium">Hari:</span> Minggu</li>
                        <li><span class="font-medium">Waktu:</span> 20:00 - 20:50</li>
                        <li><span class="font-medium">Jenis Konflik:</span> <span class="text-orange-600 font-medium">Waktu persis sama</span></li>
                      </ul>
                    </div>

                    <div class="mt-4 text-sm">
                      <p class="font-medium text-gray-900 mb-2">Solusi yang dapat dilakukan:</p>
                      <ul class="space-y-1.5 ml-5 list-disc text-gray-800">
                        <li>Ubah waktu keberangkatan atau kedatangan jadwal yang ingin Anda buat</li>
                        <li>Pilih kapal yang berbeda untuk rute dan waktu yang sama</li>
                        <li>Pilih hari operasi yang berbeda (hindari hari Minggu)</li>
                        <li>Periksa dan ubah jadwal #26 yang bertabrakan jika memungkinkan</li>
                      </ul>
                    </div>

                    <div class="mt-4 p-2 bg-blue-50 rounded border border-blue-200 text-sm text-blue-800">
                      <svg class="inline-block h-4 w-4 mr-1 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="font-medium">Info:</span> Kapal hanya dapat beroperasi pada satu jadwal pada waktu yang sama. Sistem mencegah tumpang tindih jadwal untuk memastikan operasional yang efisien.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
                  <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center border-b pb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Informasi Dasar Jadwal
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Column 1 */}
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">
                          Rute <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </div>
                          <select
                            className={`pl-10 bg-white border ${errors.route_id ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm transition-all duration-200`}
                            id="route_id"
                            name="route_id"
                            value={formData.route_id}
                            onChange={handleInputChange}
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
                        {errors.route_id && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {errors.route_id}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700 mb-1">
                          Waktu Keberangkatan <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-2">
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <select
                              className={`block w-full pl-10 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition-all duration-200 ${errors.departure_time ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300 hover:border-gray-400'} appearance-none bg-white`}
                              id="departure_hour"
                              name="departure_hour"
                              value={formData.departure_time ? formData.departure_time.split(':')[0] : ''}
                              onChange={handleDepartureHourChange}
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
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            <div className="absolute top-0 right-0 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-bl-lg rounded-tr-lg">
                              Jam
                            </div>
                          </div>

                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h4" />
                              </svg>
                            </div>
                            <select
                              className={`block w-full pl-10 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition-all duration-200 ${errors.departure_time ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300 hover:border-gray-400'} appearance-none bg-white`}
                              id="departure_minute"
                              name="departure_minute"
                              value={formData.departure_time ? formData.departure_time.split(':')[1] || '' : ''}
                              onChange={handleDepartureMinuteChange}
                              required
                            >
                              <option value="">Menit</option>
                              {Array.from({ length: 12 }, (_, i) => {
                                const minute = (i * 5).toString().padStart(2, '0');
                                return (
                                  <option key={minute} value={minute}>
                                    {minute}
                                  </option>
                                );
                              })}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            <div className="absolute top-0 right-0 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-bl-lg rounded-tr-lg">
                              Menit
                            </div>
                          </div>
                        </div>

                        {/* Selected Time Display */}
                        {formData.departure_time && formData.departure_time.includes(':') && (
                          <div className="mt-2 flex items-center text-sm text-blue-700 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Waktu keberangkatan: {formData.departure_time}
                          </div>
                        )}

                        {errors.departure_time && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {errors.departure_time}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                          Status <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <select
                            className="pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm transition-all duration-200"
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
                      </div>

                      {formData.status !== 'ACTIVE' && (
                        <div className="animate-fadeIn">
                          <label htmlFor="status_reason" className="block text-sm font-medium text-gray-700 mb-1">
                            Alasan Status <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              className="pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                              id="status_reason"
                              name="status_reason"
                              value={formData.status_reason}
                              onChange={handleInputChange}
                              placeholder="Mis. Cuaca buruk, Pemeliharaan kapal"
                              required={formData.status !== 'ACTIVE'}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="ferry_id" className="block text-sm font-medium text-gray-700 mb-1">
                          Kapal <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <select
                            className={`pl-10 bg-white border ${errors.ferry_id ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm transition-all duration-200`}
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
                        {errors.ferry_id && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {errors.ferry_id}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label htmlFor="arrival_time" className="block text-sm font-medium text-gray-700">
                            Waktu Kedatangan <span className="text-red-500">*</span>
                            {isArrivalTimeAuto && isDurationAvailable && (
                              <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                Otomatis Dihitung
                              </span>
                            )}
                          </label>

                          {/* Toggle switch for automatic arrival time */}
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">Otomatis</span>
                            <label className="inline-flex relative items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                id="auto_arrival"
                                name="auto_arrival"
                                checked={isArrivalTimeAuto}
                                onChange={() => {
                                  console.log("Toggle clicked, new state will be:", !isArrivalTimeAuto);
                                  setIsArrivalTimeAuto(!isArrivalTimeAuto);
                                  if (!isArrivalTimeAuto && formData.route_id && formData.departure_time) {
                                    // Jika berubah dari manual ke otomatis, hitung ulang waktu kedatangan
                                    setTimeout(() => calculateArrivalTime(), 100);
                                  }
                                }}
                              />
                              <div className={`w-9 h-5 ${isArrivalTimeAuto ? 'bg-blue-600' : 'bg-gray-200'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}></div>
                            </label>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <select
                              className={`block w-full pl-10 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition-all duration-200 ${errors.arrival_time ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300 hover:border-gray-400'} appearance-none bg-white ${isArrivalTimeAuto ? 'bg-gray-50' : ''}`}
                              id="arrival_hour"
                              name="arrival_hour"
                              value={formData.arrival_time ? formData.arrival_time.split(':')[0] : ''}
                              onChange={handleArrivalHourChange}
                              disabled={isArrivalTimeAuto}
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
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            <div className="absolute top-0 right-0 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-bl-lg rounded-tr-lg">
                              Jam
                            </div>
                          </div>

                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h4" />
                              </svg>
                            </div>
                            <select
                              className={`block w-full pl-10 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition-all duration-200 ${errors.arrival_time ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300 hover:border-gray-400'} appearance-none bg-white ${isArrivalTimeAuto ? 'bg-gray-50' : ''}`}
                              id="arrival_minute"
                              name="arrival_minute"
                              value={formData.arrival_time ? formData.arrival_time.split(':')[1] || '' : ''}
                              onChange={handleArrivalMinuteChange}
                              disabled={isArrivalTimeAuto}
                              required
                            >
                              <option value="">Menit</option>
                              {Array.from({ length: 12 }, (_, i) => {
                                const minute = (i * 5).toString().padStart(2, '0');
                                return (
                                  <option key={minute} value={minute}>
                                    {minute}
                                  </option>
                                );
                              })}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            <div className="absolute top-0 right-0 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-bl-lg rounded-tr-lg">
                              Menit
                            </div>
                          </div>
                        </div>

                        {/* Next Day Arrival Indicator */}
                        {nextDayArrival && (
                          <div className="mt-2 flex items-center text-sm text-orange-700 font-medium bg-orange-50 p-2 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Kedatangan di hari berikutnya
                          </div>
                        )}

                        {isArrivalTimeAuto && isDurationAvailable && (
                          <div className="mt-2 flex items-center text-sm text-blue-700 font-medium bg-blue-50 p-2 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Waktu kedatangan dihitung otomatis ({formatDuration(selectedRoute.duration)})
                            <button
                              type="button"
                              onClick={() => calculateArrivalTime()}
                              className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                            >
                              Hitung Ulang
                            </button>
                          </div>
                        )}

                        {!isArrivalTimeAuto && isDurationAvailable && (
                          <div className="mt-2 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setIsArrivalTimeAuto(true);
                                calculateArrivalTime();
                              }}
                              className="text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Hitung otomatis berdasarkan durasi rute
                            </button>
                          </div>
                        )}

                        {errors.arrival_time && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {errors.arrival_time}
                          </p>
                        )}
                      </div>

                      {/* Route Information Card */}
                      {formData.route_id && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm mt-4 transition-all duration-300 animate-fadeIn">
                          <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Informasi Rute
                          </h3>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700 flex justify-between">
                              <span className="font-medium">Durasi Perjalanan:</span>
                              <span className="text-blue-700 font-medium">
                                {formatDuration(getSelectedRouteDuration())}
                              </span>
                            </p>

                            {calculatedDuration !== null && (
                              <p className="text-sm text-gray-700 flex justify-between">
                                <span className="font-medium">Durasi Terhitung:</span>
                                <span className={`font-medium ${hasDurationDiscrepancy ? 'text-orange-600' : 'text-blue-700'}`}>
                                  {formatDuration(calculatedDuration)}
                                  {hasDurationDiscrepancy && (
                                    <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                                      {durationDifference > 0 ? '+' : ''}{formatDuration(durationDifference)}
                                    </span>
                                  )}
                                </span>
                              </p>
                            )}

                            <p className="text-sm text-gray-700 flex justify-between">
                              <span className="font-medium">Rute:</span>
                              <span className="text-blue-700">
                                {formData.route_id && routes.find(r => r.id === parseInt(formData.route_id))
                                  ? `${routes.find(r => r.id === parseInt(formData.route_id))?.origin} - ${routes.find(r => r.id === parseInt(formData.route_id))?.destination}`
                                  : '-'}
                              </span>
                            </p>
                            {formData.route_id && routes.find(r => r.id === parseInt(formData.route_id))?.route_code && (
                              <p className="text-sm text-gray-700 flex justify-between">
                                <span className="font-medium">Kode Rute:</span>
                                <span className="text-blue-700">{routes.find(r => r.id === parseInt(formData.route_id))?.route_code}</span>
                              </p>
                            )}

                            {hasDurationDiscrepancy && (
                              <div className="mt-2 p-2 bg-orange-50 border border-orange-100 rounded text-xs text-orange-800">
                                <p className="font-medium mb-1">Perhatian!</p>
                                <p>Durasi terhitung berbeda dari durasi rute yang diatur. Ini mungkin memengaruhi jadwal perjalanan.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tips Card */}
                  <div className="mt-8 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tips
                    </h3>
                    <ul className="text-sm text-gray-700 space-y-1 ml-6 list-disc">
                      <li>Pilih jam dan menit untuk waktu keberangkatan dalam format 24 jam</li>
                      <li>Waktu kedatangan akan dihitung otomatis berdasarkan durasi rute yang dipilih</li>
                      <li>Toggle "Otomatis" dapat dinonaktifkan jika Anda ingin mengatur waktu kedatangan secara manual</li>
                      <li>Jika durasi menyebabkan waktu kedatangan di hari berikutnya, sistem akan otomatis menandainya</li>
                      <li>Pastikan semua informasi yang dimasukkan sudah benar sebelum melanjutkan</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 2: Operating Days */}
              {currentStep === 2 && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
                  <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center border-b pb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Hari Operasional
                  </h2>

                  <div className="mb-8">
                    <p className="mb-4 text-gray-700">Pilih hari-hari di mana jadwal ini beroperasi:</p>
                    {/* Menampilkan hari dalam urutan tetap (Senin-Minggu) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                      {Object.entries(dayNames).map(([value, name]) => {
                        const numValue = parseInt(value);
                        const isChecked = formData.days.includes(numValue);
                        return (
                          <div
                            key={value}
                            className={`relative flex items-center p-4 ${isChecked ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'} border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer`}
                            onClick={() => {
                              const e = {
                                target: {
                                  type: 'checkbox',
                                  name: 'days',
                                  value,
                                  checked: !isChecked
                                }
                              };
                              handleInputChange(e);
                            }}
                          >
                            <input
                              type="checkbox"
                              id={`day_${value}`}
                              name="days"
                              value={value}
                              checked={isChecked}
                              onChange={handleInputChange}
                              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`day_${value}`} className="ml-3 text-base font-medium text-gray-900 cursor-pointer select-none">
                              {name}
                            </label>
                            {isChecked && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 absolute top-1 right-1 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {errors.days && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {errors.days}
                      </p>
                    )}
                  </div>

                  {/* Schedule Summary Card */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg shadow-sm animate-fadeIn">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Ringkasan Jadwal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Rute:</p>
                        <p className="font-medium text-gray-900 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <span>
                            {formData.route_id
                              ? routes.find(r => r.id === parseInt(formData.route_id))?.origin + ' → ' +
                              routes.find(r => r.id === parseInt(formData.route_id))?.destination
                              : '-'}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1 ml-7">
                          {formData.route_id && routes.find(r => r.id === parseInt(formData.route_id))?.route_code
                            ? `Kode Rute: ${routes.find(r => r.id === parseInt(formData.route_id))?.route_code}`
                            : ''}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Kapal:</p>
                        <p className="font-medium text-gray-900 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>
                            {formData.ferry_id
                              ? ferries.find(f => f.id === parseInt(formData.ferry_id))?.name
                              : '-'}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1 ml-7">
                          {formData.ferry_id && ferries.find(f => f.id === parseInt(formData.ferry_id))?.registration_number
                            ? `Nomor Registrasi: ${ferries.find(f => f.id === parseInt(formData.ferry_id))?.registration_number}`
                            : ''}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Waktu:</p>
                        <p className="font-medium text-gray-900 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>
                            {formData.departure_time && formData.arrival_time
                              ? `${formData.departure_time} → ${formData.arrival_time}`
                              : '-'}
                          </span>
                          {nextDayArrival && (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                              +1 hari
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 ml-7">
                          {calculatedDuration
                            ? `Durasi: ${formatDuration(calculatedDuration)}`
                            : getSelectedRouteDuration()
                              ? `Durasi: ${formatDuration(getSelectedRouteDuration())}`
                              : ''}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Hari Operasional:</p>
                        <p className="font-medium text-gray-900 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {formData.days.length > 0
                              ? getSortedDays(formData.days).map(day => dayNames[day]).join(', ')
                              : '-'}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1 ml-7">
                          {formData.status === 'ACTIVE'
                            ? 'Status: Aktif'
                            : `Status: Tidak Aktif (${formData.status_reason || 'Tidak ada alasan'})`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-between mt-8">
                {currentStep === 2 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 px-5 rounded-lg transition-all duration-200 shadow-sm flex items-center border border-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali
                  </button>
                ) : (
                  <div></div> // Empty div to maintain the spacing
                )}

                <div className="flex space-x-3">
                  <Link to="/admin/schedules"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 px-5 rounded-lg transition-all duration-200 shadow-sm flex items-center border border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Batal
                  </Link>

                  {currentStep === 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-200 shadow-md flex items-center group"
                    >
                      <span>Lanjut</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-200 shadow-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          Simpan
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Helper Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 mb-6">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-gray-800 font-semibold">Panduan Singkat</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                  <span className="text-lg font-bold">1</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-gray-900">Pilih Rute dan Kapal</h3>
                <p className="mt-1 text-sm text-gray-600">Pilih rute dan kapal dari daftar yang tersedia.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                  <span className="text-lg font-bold">2</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-gray-900">Atur Waktu</h3>
                <p className="mt-1 text-sm text-gray-600">Tentukan waktu keberangkatan. Waktu kedatangan akan dihitung otomatis dari durasi rute.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                  <span className="text-lg font-bold">3</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-gray-900">Pilih Hari Operasional</h3>
                <p className="mt-1 text-sm text-gray-600">Tentukan hari apa saja jadwal ini beroperasi.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                  <span className="text-lg font-bold">4</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-gray-900">Simpan Jadwal</h3>
                <p className="mt-1 text-sm text-gray-600">Periksa ringkasan jadwal dan simpan perubahan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCreate;