// src/pages/admin/bookings/BookingCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    vehicles: []
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [scheduleInfo, setScheduleInfo] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/admin-panel/routes');
      setRoutes(response.data.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const checkSchedules = async () => {
    if (!formData.route_id || !formData.booking_date) {
      alert('Silakan pilih rute dan tanggal terlebih dahulu');
      return;
    }

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
    }
  };

  const searchUsers = async () => {
    if (userSearchQuery.trim().length < 3) {
      alert('Masukkan minimal 3 karakter untuk pencarian');
      return;
    }

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
        setMotorcyclePrice(selectedSchedule.route.motorcycle_price);
        setCarPrice(selectedSchedule.route.car_price);
        setBusPrice(selectedSchedule.route.bus_price);
        setTruckPrice(selectedSchedule.route.truck_price);

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
        newVehicles.push({ type: '', license_plate: '', brand: '', model: '' });
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

    formData.vehicles.forEach(vehicle => {
      switch (vehicle.type) {
        case 'MOTORCYCLE': total += motorcyclePrice; break;
        case 'CAR': total += carPrice; break;
        case 'BUS': total += busPrice; break;
        case 'TRUCK': total += truckPrice; break;
      }
    });

    return total;
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
        navigate('/admin/bookings');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(Object.values(error.response.data.errors).flat());
      } else {
        setErrors(['Terjadi kesalahan saat membuat booking']);
      }
      console.error('Error creating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Buat Booking Baru</h1>
          <p className="mt-1 text-gray-600">Buat reservasi tiket kapal ferry baru</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => navigate('/admin/bookings')}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors shadow-sm"
          >
            <i className="fas fa-arrow-left mr-2 text-sm"></i> Kembali
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-500"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ada beberapa kesalahan:</h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-xl text-gray-800">Form Booking</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Travel Information */}
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Informasi Perjalanan</h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Rute <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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

                    <div>
                      <label htmlFor="booking_date" className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Keberangkatan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        id="booking_date"
                        value={formData.booking_date}
                        onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="schedule_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Jadwal <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                      {scheduleInfo && (
                        <div className="mt-2 text-sm text-gray-600">
                          {scheduleInfo}
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={checkSchedules}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors"
                      >
                        <i className="fas fa-search mr-2"></i> Cek Jadwal
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Passenger Information */}
              <div className="space-y-6">
                <div className="bg-green-50 rounded-lg border border-green-100 p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">Informasi Penumpang Utama</h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="user_search" className="block text-sm font-medium text-gray-700 mb-1">
                        Cari Pengguna <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          className="flex-grow rounded-l-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          id="user_search"
                          placeholder="Masukkan nama, email, atau telepon"
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                        />
                        <button
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100"
                          type="button"
                          onClick={searchUsers}
                        >
                          <i className="fas fa-search"></i>
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Minimal 3 karakter</p>
                    </div>

                    {showSearchResults && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hasil Pencarian</label>
                        <div className="list-group overflow-y-auto max-h-48 border rounded-md divide-y divide-gray-200">
                          {searchResults.map(user => (
                            <div
                              key={user.id}
                              className="block px-4 py-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => selectUser(user)}
                            >
                              <div className="flex justify-between">
                                <h6 className="text-sm font-medium text-gray-900">{user.name}</h6>
                              </div>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-xs text-gray-500">{user.phone || 'Tidak ada nomor telepon'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedUser && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pengguna Terpilih</label>
                        <div className="bg-white rounded-md border border-gray-200 shadow-sm">
                          <div className="p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <h6 className="font-medium text-gray-900">{selectedUser.name}</h6>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                <p className="text-sm text-gray-500">{selectedUser.phone}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUser(null);
                                  setFormData({ ...formData, user_id: '' });
                                  setShowBookingDetails(false);
                                }}
                                className="text-sm px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Ganti
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
              <div className="space-y-6">
                <div className="border-t border-gray-200 my-6"></div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Passengers & Vehicles */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Penumpang & Kendaraan</h3>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="passenger_count" className="block text-sm font-medium text-gray-700 mb-1">
                          Jumlah Penumpang <span className="text-red-500">*</span>
                        </label>
                        <div className="flex">
                          <button
                            className="inline-flex items-center justify-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-700 rounded-l-md hover:bg-gray-100"
                            type="button"
                            onClick={() => updatePassengerCount(-1)}
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
                            className="inline-flex items-center justify-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100"
                            type="button"
                            onClick={() => updatePassengerCount(1)}
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
                            className="inline-flex items-center justify-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-700 rounded-l-md hover:bg-gray-100"
                            type="button"
                            onClick={() => updateVehicleCount(-1)}
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
                            className="inline-flex items-center justify-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100"
                            type="button"
                            onClick={() => updateVehicleCount(1)}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      </div>

                      {/* Vehicle Details */}
                      {formData.vehicle_count > 0 && (
                        <div className="space-y-4">
                          {formData.vehicles.map((vehicle, index) => (
                            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h4 className="font-medium text-gray-800">Kendaraan {index + 1}</h4>
                              </div>
                              <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Jenis <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                      className="w-full rounded-md border-gray-300 shadow-sm"
                                      value={vehicle.type}
                                      onChange={(e) => {
                                        const newVehicles = [...formData.vehicles];
                                        newVehicles[index].type = e.target.value;
                                        setFormData({ ...formData, vehicles: newVehicles });
                                      }}
                                      required
                                    >
                                      <option value="">Pilih Jenis</option>
                                      <option value="MOTORCYCLE">Motor</option>
                                      <option value="CAR">Mobil</option>
                                      <option value="BUS">Bus</option>
                                      <option value="TRUCK">Truk</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Plat Nomor <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full rounded-md border-gray-300 shadow-sm"
                                      value={vehicle.license_plate}
                                      onChange={(e) => {
                                        const newVehicles = [...formData.vehicles];
                                        newVehicles[index].license_plate = e.target.value;
                                        setFormData({ ...formData, vehicles: newVehicles });
                                      }}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Merk
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full rounded-md border-gray-300 shadow-sm"
                                      value={vehicle.brand}
                                      onChange={(e) => {
                                        const newVehicles = [...formData.vehicles];
                                        newVehicles[index].brand = e.target.value;
                                        setFormData({ ...formData, vehicles: newVehicles });
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Model
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full rounded-md border-gray-300 shadow-sm"
                                      value={vehicle.model}
                                      onChange={(e) => {
                                        const newVehicles = [...formData.vehicles];
                                        newVehicles[index].model = e.target.value;
                                        setFormData({ ...formData, vehicles: newVehicles });
                                      }}
                                    />
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
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Pembayaran</h3>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                          Metode Pembayaran <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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

                      {formData.payment_method && (
                        <div>
                          <label htmlFor="payment_channel" className="block text-sm font-medium text-gray-700 mb-1">
                            Channel Pembayaran <span className="text-red-500">*</span>
                          </label>
                          <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                      )}

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                          Catatan
                        </label>
                        <textarea
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          id="notes"
                          rows="3"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Passenger Data */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Data Penumpang</h3>

                  {formData.passengers.map((passenger, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h4 className="font-medium text-gray-800">
                          Penumpang {index + 1} {index === 0 && '(Utama)'}
                        </h4>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nama <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              className="w-full rounded-md border-gray-300 shadow-sm"
                              value={passenger.name}
                              onChange={(e) => {
                                const newPassengers = [...formData.passengers];
                                newPassengers[index].name = e.target.value;
                                setFormData({ ...formData, passengers: newPassengers });
                              }}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nomor Identitas <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              className="w-full rounded-md border-gray-300 shadow-sm"
                              value={passenger.id_number}
                              onChange={(e) => {
                                const newPassengers = [...formData.passengers];
                                newPassengers[index].id_number = e.target.value;
                                setFormData({ ...formData, passengers: newPassengers });
                              }}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Jenis Identitas <span className="text-red-500">*</span>
                            </label>
                            <select
                              className="w-full rounded-md border-gray-300 shadow-sm"
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
                  ))}
                </div>

                {/* Booking Summary */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
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
                            Rp {calculateTotal().toLocaleString('id-ID')}
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
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg shadow-sm transition-colors disabled:bg-gray-400"
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
  );
};

export default BookingCreate;