import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { operatorScheduleService as scheduleService } from '../../../services/api';
import { toast } from 'react-toastify';

const ScheduleEditDate = () => {
  const { scheduleId, dateId } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    status: '',
    status_reason: '',
    status_expiry_date: '',
    passenger_count: 0,
    motorcycle_count: 0,
    car_count: 0,
    bus_count: 0,
    truck_count: 0
  });
  const [error, setError] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleResponse, dateResponse] = await Promise.all([
          scheduleService.getSchedule(scheduleId),
          scheduleService.getDate(scheduleId, dateId)
        ]);
        
        setSchedule(scheduleResponse.data.data);
        setScheduleDate(dateResponse.data.data);
        
        setForm({
          status: dateResponse.data.data.status,
          status_reason: dateResponse.data.data.status_reason || '',
          status_expiry_date: dateResponse.data.data.status_expiry_date || '',
          passenger_count: dateResponse.data.data.passenger_count || 0,
          motorcycle_count: dateResponse.data.data.motorcycle_count || 0,
          car_count: dateResponse.data.data.car_count || 0,
          bus_count: dateResponse.data.data.bus_count || 0,
          truck_count: dateResponse.data.data.truck_count || 0
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Gagal memuat data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [scheduleId, dateId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await scheduleService.updateDate(scheduleId, dateId, form);
      toast.success('Tanggal jadwal berhasil diperbarui');
      navigate(`/operator/schedules/${scheduleId}/dates`);
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors);
      }
      toast.error('Gagal memperbarui tanggal jadwal');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header dengan gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-8 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-30 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Tanggal Jadwal</h1>
              {scheduleDate && (
                <p className="text-blue-100 mt-1">{formatDate(scheduleDate.date)}</p>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to={`/operator/schedules/${scheduleId}/dates`} className="inline-flex items-center px-4 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Daftar Tanggal
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Jadwal Info Card */}
        {schedule && scheduleDate && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">Informasi Jadwal</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">Rute:</span>
                  <span className="text-sm font-medium text-gray-900">{schedule.route.origin} - {schedule.route.destination}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">Tanggal:</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(scheduleDate.date)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">Keberangkatan:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(schedule.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">Kedatangan:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(schedule.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status saat ini:</span>
                  <span className="text-sm font-medium">
                    {scheduleDate.status === 'ACTIVE' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Tersedia</span>
                    )}
                    {scheduleDate.status === 'INACTIVE' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Tidak Tersedia</span>
                    )}
                    {scheduleDate.status === 'FULL' && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Penuh</span>
                    )}
                    {scheduleDate.status === 'CANCELLED' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Dibatalkan</span>
                    )}
                    {scheduleDate.status === 'WEATHER_ISSUE' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Masalah Cuaca</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">Edit Tanggal Jadwal</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-600">*</span>
                </label>
                <select 
                  id="status" 
                  name="status"
                  className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 ${error.status ? 'border-red-500' : ''}`}
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  <option value="active">Tersedia</option>
                  <option value="inactive">Tidak Tersedia</option>
                  <option value="suspended">Dibatalkan</option>
                  <option value="full">Penuh</option>
                  <option value="weather_issue">Masalah Cuaca</option>
                </select>
                {error.status && <p className="mt-1 text-sm text-red-600">{error.status}</p>}
              </div>

              <div>
                <label htmlFor="status_reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan Status (Opsional)
                </label>
                <textarea 
                  id="status_reason" 
                  name="status_reason" 
                  rows="3"
                  className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 ${error.status_reason ? 'border-red-500' : ''}`}
                  value={form.status_reason}
                  onChange={handleChange}
                ></textarea>
                {error.status_reason && <p className="mt-1 text-sm text-red-600">{error.status_reason}</p>}
                <p className="mt-1 text-xs text-gray-500">Tambahkan alasan jika status bukan 'Tersedia'</p>
              </div>

              <div className="weather-expiry-group" style={{ display: form.status === 'weather_issue' ? 'block' : 'none' }}>
                <label htmlFor="status_expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Berakhir Status Cuaca
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input 
                    type="date" 
                    id="status_expiry_date" 
                    name="status_expiry_date"
                    className={`pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 ${error.status_expiry_date ? 'border-red-500' : ''}`}
                    value={form.status_expiry_date ? new Date(form.status_expiry_date).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                  />
                </div>
                {error.status_expiry_date && <p className="mt-1 text-sm text-red-600">{error.status_expiry_date}</p>}
                <p className="mt-1 text-xs text-gray-500">Tanggal saat status cuaca diperkirakan berakhir</p>
              </div>

              {/* Kapasitas Section */}
              <div className="mt-6">
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Pengaturan Kapasitas
                  </h3>
                  {schedule && (
                    <p className="mb-4 text-sm text-gray-500">
                      Kapasitas default kapal: {schedule.ferry.capacity_passenger} penumpang,
                      {schedule.ferry.capacity_motorcycle} motor,
                      {schedule.ferry.capacity_car} mobil,
                      {schedule.ferry.capacity_bus} bus,
                      {schedule.ferry.capacity_truck} truk
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="passenger_count" className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Penumpang
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input 
                          type="number" 
                          id="passenger_count" 
                          name="passenger_count"
                          value={form.passenger_count}
                          onChange={handleChange}
                          min="0"
                          className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 ${error.passenger_count ? 'border-red-500' : ''}`}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">orang</span>
                        </div>
                      </div>
                      {error.passenger_count && <p className="mt-1 text-sm text-red-600">{error.passenger_count}</p>}
                    </div>

                    <div>
                      <label htmlFor="motorcycle_count" className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Motor
                      </label>
                      <input 
                        type="number" 
                        id="motorcycle_count" 
                        name="motorcycle_count"
                        value={form.motorcycle_count}
                        onChange={handleChange}
                        min="0"
                        className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 ${error.motorcycle_count ? 'border-red-500' : ''}`}
                      />
                      {error.motorcycle_count && <p className="mt-1 text-sm text-red-600">{error.motorcycle_count}</p>}
                    </div>

                    <div>
                      <label htmlFor="car_count" className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Mobil
                      </label>
                      <input 
                        type="number" 
                        id="car_count" 
                        name="car_count"
                        value={form.car_count}
                        onChange={handleChange}
                        min="0"
                        className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 ${error.car_count ? 'border-red-500' : ''}`}
                      />
                      {error.car_count && <p className="mt-1 text-sm text-red-600">{error.car_count}</p>}
                    </div>

                    <div>
                      <label htmlFor="bus_count" className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Bus
                      </label>
                      <input 
                        type="number" 
                        id="bus_count" 
                        name="bus_count"
                        value={form.bus_count}
                        onChange={handleChange}
                        min="0"
                        className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 ${error.bus_count ? 'border-red-500' : ''}`}
                      />
                      {error.bus_count && <p className="mt-1 text-sm text-red-600">{error.bus_count}</p>}
                    </div>

                    <div>
                      <label htmlFor="truck_count" className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Truk
                      </label>
                      <input 
                        type="number" 
                        id="truck_count" 
                        name="truck_count"
                        value={form.truck_count}
                        onChange={handleChange}
                        min="0"
                        className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 ${error.truck_count ? 'border-red-500' : ''}`}
                      />
                      {error.truck_count && <p className="mt-1 text-sm text-red-600">{error.truck_count}</p>}
                    </div>
                  </div>
                  <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Nilai 0 berarti menggunakan kapasitas default kapal. Jika Anda ingin membatasi kapasitas, masukkan nilai yang lebih rendah dari kapasitas default.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Link 
                  to={`/operator/schedules/${scheduleId}/dates`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150"
                >
                  Batal
                </Link>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditDate;