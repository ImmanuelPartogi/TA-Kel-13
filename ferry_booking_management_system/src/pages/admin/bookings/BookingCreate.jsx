// src/pages/admin/bookings/BookingCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../../services/api';

const BookingCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [basePrice, setBasePrice] = useState(0);
  const [motorcyclePrice, setMotorcyclePrice] = useState(0);
  const [carPrice, setCarPrice] = useState(0);
  const [busPrice, setBusPrice] = useState(0);
  const [truckPrice, setTruckPrice] = useState(0);
  const [vehicleCategories, setVehicleCategories] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);


  const [formData, setFormData] = useState({
    route_id: '',
    booking_date: new Date().toISOString().split('T')[0],
    schedule_id: '',
    user_id: '',
    passenger_count: 1,
    vehicle_count: 0,
    payment_method: '',
    payment_channel: '',
    notes: '',
    passengers: [{ name: '', id_number: '', id_type: 'KTP' }],
    vehicles: [{ type: 'MOTORCYCLE', license_plate: '', brand: '', model: '', vehicle_category_id: '' }],
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [scheduleInfo, setScheduleInfo] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
    fetchVehicleCategories();
    fetchVehicleTypes(); // Tambahkan ini
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/admin-panel/bookings/create');
      if (response.data.success && response.data.data.routes) {
        setRoutes(response.data.data.routes);
      } else {
        console.error('Invalid response structure:', response.data);
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes([]);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchVehicleCategories = async () => {
    try {
      const response = await api.get('/admin-panel/vehicle-categories');
      if (response.data.success) {
        setVehicleCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vehicle categories:', error);
    }
  };

  const fetchVehicleTypes = async () => {
    try {
      const response = await api.get('/admin-panel/vehicle-categories/types');
      if (response.data.success) {
        setVehicleTypes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
    }
  };

  const checkSchedules = async () => {
    if (!formData.route_id || !formData.booking_date) {
      alert('Silakan pilih rute dan tanggal terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/admin-panel/bookings/get-schedules', {
        params: {
          route_id: formData.route_id,
          date: formData.booking_date
        }
      });

      if (response.data.success) {
        setScheduleData(response.data.data);
        if (response.data.data.length === 0) {
          setScheduleInfo('Tidak ada jadwal tersedia untuk tanggal yang dipilih');
        } else {
          setScheduleInfo('Jadwal tersedia, silakan pilih jadwal');
        }
      }
    } catch (error) {
      console.error('Error checking schedules:', error);
      alert('Gagal mendapatkan jadwal');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (userSearchQuery.trim().length < 3) {
      alert('Masukkan minimal 3 karakter untuk pencarian');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/admin-panel/bookings/search-users', {
        params: { query: userSearchQuery }
      });

      if (response.data.success) {
        setSearchResults(response.data.data);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      alert('Gagal mencari pengguna');
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setFormData({
      ...formData,
      user_id: user.id,
      passengers: [{
        name: user.name,
        id_number: formData.passengers[0].id_number,
        id_type: formData.passengers[0].id_type
      }]
    });
    setShowSearchResults(false);

    if (formData.schedule_id) {
      setShowBookingDetails(true);
    }
  };

  const handleScheduleChange = (e) => {
    const scheduleId = e.target.value;
    setFormData({ ...formData, schedule_id: scheduleId });

    if (scheduleId && formData.user_id) {
      setShowBookingDetails(true);
    }

    if (scheduleId) {
      const selectedSchedule = scheduleData.find(s => s.id == scheduleId);
      if (selectedSchedule) {
        setBasePrice(selectedSchedule.route.base_price);

        setScheduleInfo(`
          Kapasitas Penumpang: ${selectedSchedule.available_passenger} tersedia
          Kapasitas Motor: ${selectedSchedule.available_motorcycle} tersedia
          Kapasitas Mobil: ${selectedSchedule.available_car} tersedia
          Kapasitas Bus: ${selectedSchedule.available_bus} tersedia
          Kapasitas Truk: ${selectedSchedule.available_truck} tersedia
        `);
      }
    }
  };

  const updatePassengerCount = (increment) => {
    const newCount = formData.passenger_count + increment;
    if (newCount >= 1 && newCount <= 10) {
      const newPassengers = [...formData.passengers];

      if (increment > 0) {
        newPassengers.push({ name: '', id_number: '', id_type: 'KTP' });
      } else {
        newPassengers.pop();
      }

      setFormData({
        ...formData,
        passenger_count: newCount,
        passengers: newPassengers
      });
    }
  };

  const updateVehicleCount = (increment) => {
    const newCount = formData.vehicle_count + increment;
    if (newCount >= 0 && newCount <= 5) {
      const newVehicles = [...formData.vehicles];

      if (increment > 0) {
        // Gunakan jenis kendaraan default dari database jika tersedia
        const defaultType = vehicleTypes.length > 0 ? vehicleTypes[0].code : 'MOTORCYCLE';
        newVehicles.push({
          type: defaultType,
          license_plate: '',
          brand: '',
          model: '',
          vehicle_category_id: ''
        });
      } else {
        newVehicles.pop();
      }

      setFormData({
        ...formData,
        vehicle_count: newCount,
        vehicles: newVehicles
      });
    }
  };

  const updatePaymentChannels = () => {
    const channels = {
      'CASH': [{ value: 'COUNTER', label: 'Counter' }],
      'BANK_TRANSFER': [
        { value: 'BCA', label: 'BCA' },
        { value: 'MANDIRI', label: 'Mandiri' },
        { value: 'BNI', label: 'BNI' },
        { value: 'BRI', label: 'BRI' }
      ],
      'VIRTUAL_ACCOUNT': [
        { value: 'BCA_VA', label: 'BCA Virtual Account' },
        { value: 'MANDIRI_VA', label: 'Mandiri Virtual Account' },
        { value: 'BNI_VA', label: 'BNI Virtual Account' },
        { value: 'BRI_VA', label: 'BRI Virtual Account' }
      ],
      'E_WALLET': [
        { value: 'GOPAY', label: 'GoPay' },
        { value: 'OVO', label: 'OVO' },
        { value: 'DANA', label: 'DANA' },
        { value: 'LINKAJA', label: 'LinkAja' }
      ],
      'CREDIT_CARD': [{ value: 'CREDIT_CARD', label: 'Kartu Kredit' }]
    };

    return channels[formData.payment_method] || [];
  };

  const calculateTotal = () => {
    let total = formData.passenger_count * basePrice;

    // Gunakan kategori kendaraan untuk menghitung harga
    formData.vehicles.forEach(vehicle => {
      if (vehicle.vehicle_category_id) {
        const category = vehicleCategories.find(cat => cat.id == vehicle.vehicle_category_id);
        if (category) {
          total += parseFloat(category.base_price);
        }
      }
    });

    return total;
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi data sebelum kirim
    if (!formData.schedule_id) {
      alert('Silakan pilih jadwal terlebih dahulu');
      return;
    }

    if (!formData.user_id) {
      alert('Silakan pilih pengguna terlebih dahulu');
      return;
    }

    if (!formData.payment_method || !formData.payment_channel) {
      alert('Silakan pilih metode dan channel pembayaran');
      return;
    }

    // Validasi passengers
    const isPassengersValid = formData.passengers.every(p =>
      p.name && p.id_number && p.id_type
    );

    if (!isPassengersValid) {
      alert('Silakan lengkapi data semua penumpang');
      return;
    }

    // Validasi vehicles jika ada
    if (formData.vehicle_count > 0) {
      const isVehiclesValid = formData.vehicles.every(v =>
        v.type && v.license_plate
      );

      if (!isVehiclesValid) {
        alert('Silakan lengkapi data semua kendaraan');
        return;
      }
    }

    setLoading(true);
    setErrors([]);

    try {
      // Siapkan data untuk dikirim
      const dataToSend = {
        ...formData,
        departure_date: formData.booking_date, // Backend mengharapkan departure_date
        // Pastikan vehicles kosong jika tidak ada kendaraan
        vehicles: formData.vehicle_count > 0 ? formData.vehicles : []
      };

      const response = await api.post('/admin-panel/bookings', dataToSend);

      if (response.data.success) {
        navigate('/admin/bookings', {
          state: {
            successMessage: 'Booking baru berhasil dibuat!'
          }
        });
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(Object.values(error.response.data.errors).flat());
      } else {
        setErrors(['Terjadi kesalahan saat membuat booking']);
      }
      console.error('Error creating booking:', error);
      // Scroll to top to show error messages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white rounded-xl border border-gray-100 shadow-md p-8 text-center">
          <div className="inline-block relative">
            <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Modern Header */}
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
                <i className="fas fa-plus-circle text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Buat Booking Baru</h1>
                <p className="mt-1 text-blue-100">Buat reservasi tiket kapal ferry baru</p>
              </div>
            </div>

            <div>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm"
              >
                <i className="fas fa-arrow-left mr-2"></i> Kembali
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Tanggal Keberangkatan</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-calendar-day mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{formData.booking_date}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Jumlah Penumpang</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-users mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{formData.passenger_count}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Jumlah Kendaraan</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-car mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{formData.vehicle_count}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Total Pembayaran</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-money-bill-wave mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{formData.schedule_id ? formatCurrency(calculateTotal()) : 'Rp 0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Alert Messages with modern styling */}
        {errors.length > 0 && (
          <div className="mb-6 rounded-lg shadow-lg overflow-hidden animate-slideIn">
            <div className="bg-red-500 px-4 py-2 text-white flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                <span className="font-medium">Error</span>
              </div>
              <button onClick={() => setErrors([])} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="bg-red-50 border-red-100 text-red-700 px-4 py-3 border-t">
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-xl text-gray-800 flex items-center">
              <i className="fas fa-ticket-alt text-blue-500 mr-2"></i>
              Form Booking
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Travel Information */}
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg border border-blue-100 p-6 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                      <i className="fas fa-route mr-2"></i>
                      Informasi Perjalanan
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">
                          Rute <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-route text-gray-400"></i>
                          </div>
                          <select
                            className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            id="route_id"
                            value={formData.route_id}
                            onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                            required
                          >
                            <option value="">Pilih Rute</option>
                            {routes.map(route => (
                              <option key={route.id} value={route.id}>
                                {route.origin} - {route.destination} ({route.route_code})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="booking_date" className="block text-sm font-medium text-gray-700 mb-1">
                          Tanggal Keberangkatan <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-calendar-alt text-gray-400"></i>
                          </div>
                          <input
                            type="date"
                            className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            id="booking_date"
                            value={formData.booking_date}
                            onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="schedule_id" className="block text-sm font-medium text-gray-700 mb-1">
                          Jadwal <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-clock text-gray-400"></i>
                          </div>
                          <select
                            className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            id="schedule_id"
                            value={formData.schedule_id}
                            onChange={handleScheduleChange}
                            disabled={scheduleData.length === 0}
                            required
                          >
                            <option value="">Pilih rute dan tanggal terlebih dahulu</option>
                            {scheduleData.map(schedule => (
                              <option key={schedule.id} value={schedule.id}>
                                {schedule.departure_time} - {schedule.arrival_time} ({schedule.ferry.name})
                              </option>
                            ))}
                          </select>
                        </div>
                        {scheduleInfo && (
                          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {scheduleInfo}
                          </div>
                        )}
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={checkSchedules}
                          disabled={loading}
                          className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors disabled:bg-gray-400"
                        >
                          {loading ? (
                            <><i className="fas fa-spinner fa-spin mr-2"></i> Memproses...</>
                          ) : (
                            <><i className="fas fa-search mr-2"></i> Cek Jadwal</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Passenger Information */}
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-lg border border-green-100 p-6 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                      <i className="fas fa-user mr-2"></i>
                      Informasi Penumpang Utama
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="user_search" className="block text-sm font-medium text-gray-700 mb-1">
                          Cari Pengguna <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-search text-gray-400"></i>
                          </div>
                          <input
                            type="text"
                            className="block w-full pl-10 pr-12 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-all"
                            id="user_search"
                            placeholder="Masukkan nama, email, atau telepon"
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center">
                            <button
                              className="h-full px-3 text-gray-600 bg-gray-100 rounded-r-lg hover:bg-gray-200 transition-colors border-l border-gray-300"
                              type="button"
                              onClick={searchUsers}
                              disabled={loading}
                            >
                              {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Minimal 3 karakter</p>
                      </div>

                      {showSearchResults && (
                        <div className="mt-4 animate-slideIn">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Hasil Pencarian</label>
                          <div className="list-group overflow-y-auto max-h-48 border rounded-md divide-y divide-gray-200 bg-white shadow-sm">
                            {searchResults.length > 0 ? (
                              searchResults.map(user => (
                                <div
                                  key={user.id}
                                  className="block px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                  onClick={() => selectUser(user)}
                                >
                                  <div className="flex justify-between">
                                    <h6 className="text-sm font-medium text-gray-900">{user.name}</h6>
                                  </div>
                                  <p className="text-sm text-gray-600">{user.email}</p>
                                  <p className="text-xs text-gray-500">{user.phone || 'Tidak ada nomor telepon'}</p>
                                </div>
                              ))
                            ) : (
                              <div className="block px-4 py-3 text-center text-gray-500">
                                Tidak ada hasil yang ditemukan
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedUser && (
                        <div className="mt-4 animate-slideIn">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Pengguna Terpilih</label>
                          <div className="bg-white rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="flex items-start">
                                  <div className="bg-green-100 p-2 rounded-full mr-3">
                                    <i className="fas fa-user text-green-600"></i>
                                  </div>
                                  <div>
                                    <h6 className="font-medium text-gray-900">{selectedUser.name}</h6>
                                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                    <p className="text-sm text-gray-500">{selectedUser.phone || 'Tidak ada nomor telepon'}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUser(null);
                                    setFormData({ ...formData, user_id: '' });
                                    setShowBookingDetails(false);
                                  }}
                                  className="text-sm px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                  <i className="fas fa-user-times mr-1"></i> Ganti
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              {showBookingDetails && (
                <div className="space-y-6 animate-slideIn">
                  <div className="border-t border-gray-200 my-6"></div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Passengers & Vehicles */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-users text-blue-500 mr-2"></i>
                        Penumpang & Kendaraan
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="passenger_count" className="block text-sm font-medium text-gray-700 mb-1">
                            Jumlah Penumpang <span className="text-red-500">*</span>
                          </label>
                          <div className="flex">
                            <button
                              className="inline-flex items-center justify-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-700 rounded-l-md hover:bg-gray-100 transition-colors"
                              type="button"
                              onClick={() => updatePassengerCount(-1)}
                              disabled={formData.passenger_count <= 1}
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <input
                              type="number"
                              className="flex-grow text-center border-gray-300"
                              value={formData.passenger_count}
                              readOnly
                            />
                            <button
                              className="inline-flex items-center justify-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100 transition-colors"
                              type="button"
                              onClick={() => updatePassengerCount(1)}
                              disabled={formData.passenger_count >= 10}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="vehicle_count" className="block text-sm font-medium text-gray-700 mb-1">
                            Jumlah Kendaraan
                          </label>
                          <div className="flex">
                            <button
                              className="inline-flex items-center justify-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-700 rounded-l-md hover:bg-gray-100 transition-colors"
                              type="button"
                              onClick={() => updateVehicleCount(-1)}
                              disabled={formData.vehicle_count <= 0}
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <input
                              type="number"
                              className="flex-grow text-center border-gray-300"
                              value={formData.vehicle_count}
                              readOnly
                            />
                            <button
                              className="inline-flex items-center justify-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100 transition-colors"
                              type="button"
                              onClick={() => updateVehicleCount(1)}
                              disabled={formData.vehicle_count >= 5}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                        </div>

                        {/* Vehicle Details */}
                        {formData.vehicle_count > 0 && (
                          <div className="space-y-4">
                            {formData.vehicles.map((vehicle, index) => (
                              <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-300">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                  <h4 className="font-medium text-gray-800 flex items-center">
                                    <i className="fas fa-car mr-2 text-blue-500"></i>
                                    Kendaraan {index + 1}
                                  </h4>
                                </div>
                                <div className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategori <span className="text-red-500">*</span>
                                      </label>
                                      <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <i className="fas fa-tag text-gray-400"></i>
                                        </div>
                                        <select
                                          className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                                          value={vehicle.vehicle_category_id}
                                          onChange={(e) => {
                                            const newVehicles = [...formData.vehicles];
                                            newVehicles[index].vehicle_category_id = e.target.value;
                                            setFormData({ ...formData, vehicles: newVehicles });
                                          }}
                                          required
                                        >
                                          <option value="">Pilih Kategori</option>
                                          {vehicleCategories
                                            .filter(cat => cat.vehicle_type === vehicle.type)
                                            .map(category => (
                                              <option key={category.id} value={category.id}>
                                                {category.code} - {category.name}
                                              </option>
                                            ))}
                                        </select>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Plat Nomor <span className="text-red-500">*</span>
                                      </label>
                                      <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <i className="fas fa-id-card text-gray-400"></i>
                                        </div>
                                        <input
                                          type="text"
                                          className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                                          value={vehicle.license_plate}
                                          onChange={(e) => {
                                            const newVehicles = [...formData.vehicles];
                                            newVehicles[index].license_plate = e.target.value;
                                            setFormData({ ...formData, vehicles: newVehicles });
                                          }}
                                          placeholder="B 1234 ABC"
                                          required
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Merk
                                      </label>
                                      <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <i className="fas fa-tag text-gray-400"></i>
                                        </div>
                                        <input
                                          type="text"
                                          className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                                          value={vehicle.brand}
                                          onChange={(e) => {
                                            const newVehicles = [...formData.vehicles];
                                            newVehicles[index].brand = e.target.value;
                                            setFormData({ ...formData, vehicles: newVehicles });
                                          }}
                                          placeholder="Toyota"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Model
                                      </label>
                                      <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <i className="fas fa-info-circle text-gray-400"></i>
                                        </div>
                                        <input
                                          type="text"
                                          className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                                          value={vehicle.model}
                                          onChange={(e) => {
                                            const newVehicles = [...formData.vehicles];
                                            newVehicles[index].model = e.target.value;
                                            setFormData({ ...formData, vehicles: newVehicles });
                                          }}
                                          placeholder="Avanza"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-money-bill-wave text-blue-500 mr-2"></i>
                        Pembayaran
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                            Metode Pembayaran <span className="text-red-500">*</span>
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-credit-card text-gray-400"></i>
                            </div>
                            <select
                              className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                              id="payment_method"
                              value={formData.payment_method}
                              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value, payment_channel: '' })}
                              required
                            >
                              <option value="">Pilih Metode Pembayaran</option>
                              <option value="CASH">Tunai</option>
                              <option value="BANK_TRANSFER">Transfer Bank</option>
                              <option value="VIRTUAL_ACCOUNT">Virtual Account</option>
                              <option value="E_WALLET">E-Wallet</option>
                              <option value="CREDIT_CARD">Kartu Kredit</option>
                            </select>
                          </div>
                        </div>

                        {formData.payment_method && (
                          <div>
                            <label htmlFor="payment_channel" className="block text-sm font-medium text-gray-700 mb-1">
                              Channel Pembayaran <span className="text-red-500">*</span>
                            </label>
                            <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-money-check text-gray-400"></i>
                              </div>
                              <select
                                className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                                id="payment_channel"
                                value={formData.payment_channel}
                                onChange={(e) => setFormData({ ...formData, payment_channel: e.target.value })}
                                required
                              >
                                <option value="">Pilih Channel Pembayaran</option>
                                {updatePaymentChannels().map(channel => (
                                  <option key={channel.value} value={channel.value}>
                                    {channel.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        <div>
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Catatan
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                              <i className="fas fa-sticky-note text-gray-400"></i>
                            </div>
                            <textarea
                              className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                              id="notes"
                              rows="3"
                              value={formData.notes}
                              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                              placeholder="Tambahkan catatan jika diperlukan"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Passenger Data */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <i className="fas fa-address-card text-blue-500 mr-2"></i>
                      Data Penumpang
                    </h3>

                    {formData.passengers.map((passenger, index) => (
                      <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                          <h4 className="font-medium text-gray-800 flex items-center">
                            <i className="fas fa-user mr-2 text-blue-500"></i>
                            Penumpang {index + 1} {index === 0 && '(Utama)'}
                          </h4>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama <span className="text-red-500">*</span>
                              </label>
                              <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <i className="fas fa-user text-gray-400"></i>
                                </div>
                                <input
                                  type="text"
                                  className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                                  value={passenger.name}
                                  onChange={(e) => {
                                    const newPassengers = [...formData.passengers];
                                    newPassengers[index].name = e.target.value;
                                    setFormData({ ...formData, passengers: newPassengers });
                                  }}
                                  required
                                  placeholder="Nama lengkap"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nomor Identitas <span className="text-red-500">*</span>
                              </label>
                              <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <i className="fas fa-id-card text-gray-400"></i>
                                </div>
                                <input
                                  type="text"
                                  className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                                  value={passenger.id_number}
                                  onChange={(e) => {
                                    const newPassengers = [...formData.passengers];
                                    newPassengers[index].id_number = e.target.value;
                                    setFormData({ ...formData, passengers: newPassengers });
                                  }}
                                  required
                                  placeholder="Nomor identitas"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Jenis Identitas <span className="text-red-500">*</span>
                              </label>
                              <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <i className="fas fa-clipboard-list text-gray-400"></i>
                                </div>
                                <select
                                  className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                                  value={passenger.id_type}
                                  onChange={(e) => {
                                    const newPassengers = [...formData.passengers];
                                    newPassengers[index].id_type = e.target.value;
                                    setFormData({ ...formData, passengers: newPassengers });
                                  }}
                                  required
                                >
                                  <option value="KTP">KTP</option>
                                  <option value="SIM">SIM</option>
                                  <option value="PASPOR">Paspor</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Booking Summary */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center">
                      <i className="fas fa-clipboard-check text-blue-600 mr-2"></i>
                      <h3 className="font-semibold text-blue-800">Ringkasan Booking</h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <div className="w-28 text-sm font-medium text-gray-500">Rute:</div>
                            <div className="flex-1 text-sm font-medium text-gray-900">
                              {formData.route_id ? routes.find(r => r.id == formData.route_id)?.origin + ' - ' + routes.find(r => r.id == formData.route_id)?.destination : '-'}
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-28 text-sm font-medium text-gray-500">Tanggal:</div>
                            <div className="flex-1 text-sm font-medium text-gray-900">
                              {formData.booking_date}
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-28 text-sm font-medium text-gray-500">Jadwal:</div>
                            <div className="flex-1 text-sm font-medium text-gray-900">
                              {formData.schedule_id ? scheduleData.find(s => s.id == formData.schedule_id)?.departure_time + ' - ' + scheduleData.find(s => s.id == formData.schedule_id)?.arrival_time : '-'}
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-28 text-sm font-medium text-gray-500">Kapal:</div>
                            <div className="flex-1 text-sm font-medium text-gray-900">
                              {formData.schedule_id ? scheduleData.find(s => s.id == formData.schedule_id)?.ferry.name : '-'}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <div className="w-28 text-sm font-medium text-gray-500">Penumpang:</div>
                            <div className="flex-1 text-sm font-medium text-gray-900">
                              {formData.passenger_count} orang
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-28 text-sm font-medium text-gray-500">Kendaraan:</div>
                            <div className="flex-1 text-sm font-medium text-gray-900">
                              {formData.vehicles.filter(v => v.type).map(v => {
                                const types = {
                                  'MOTORCYCLE': 'Motor',
                                  'CAR': 'Mobil',
                                  'BUS': 'Bus',
                                  'TRUCK': 'Truk'
                                };
                                return types[v.type];
                              }).join(', ') || 'Tidak ada'}
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-28 text-sm font-medium text-gray-500">Pembayaran:</div>
                            <div className="flex-1 text-sm font-medium text-gray-900">
                              {formData.payment_method && formData.payment_channel ?
                                `${formData.payment_method} - ${formData.payment_channel}` : '-'}
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-28 text-sm font-medium text-gray-500">Total:</div>
                            <div className="flex-1 text-lg font-bold text-blue-600">
                              {formatCurrency(calculateTotal())}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <><i className="fas fa-spinner fa-spin mr-2"></i> Memproses...</>
                      ) : (
                        <><i className="fas fa-check-circle mr-2"></i> Buat Booking</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
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

export default BookingCreate;