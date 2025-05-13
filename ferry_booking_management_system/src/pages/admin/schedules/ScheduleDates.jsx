import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const ScheduleDates = () => {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [scheduleDates, setScheduleDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateType, setDateType] = useState('single');
  
  const [formData, setFormData] = useState({
    date: '',
    end_date: '',
    status: 'ACTIVE',
    status_reason: '',
    status_expiry_date: ''
  });

  const dayNames = {
    1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis',
    5: 'Jumat', 6: 'Sabtu', 7: 'Minggu'
  };

  useEffect(() => {
    fetchScheduleData();
  }, [id]);

  const fetchScheduleData = async () => {
    try {
      const [scheduleRes, datesRes] = await Promise.all([
        axios.get(`/api/admin-panel/schedules/${id}`),
        axios.get(`/api/admin-panel/schedules/${id}/dates`)
      ]);
      setSchedule(scheduleRes.data.data);
      setScheduleDates(datesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddDate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/admin-panel/schedules/${id}/dates`, {
        ...formData,
        date_type: dateType
      });
      setShowAddModal(false);
      fetchScheduleData();
      resetForm();
    } catch (error) {
      console.error('Error adding date:', error);
    }
  };

  const handleEditDate = async (e) => {
    e.preventDefault();
    if (!selectedDate) return;
    
    try {
      await axios.put(`/api/admin-panel/schedules/${id}/dates/${selectedDate.id}`, {
        status: formData.status,
        status_reason: formData.status_reason,
        status_expiry_date: formData.status_expiry_date
      });
      setShowEditModal(false);
      fetchScheduleData();
      resetForm();
    } catch (error) {
      console.error('Error editing date:', error);
    }
  };

  const handleDeleteDate = async (dateId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tanggal jadwal ini?')) return;
    
    try {
      await axios.delete(`/api/admin-panel/schedules/${id}/dates/${dateId}`);
      fetchScheduleData();
    } catch (error) {
      console.error('Error deleting date:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      end_date: '',
      status: 'ACTIVE',
      status_reason: '',
      status_expiry_date: ''
    });
    setSelectedDate(null);
    setDateType('single');
  };

  const openEditModal = (date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      status: date.status,
      status_reason: date.status_reason || '',
      status_expiry_date: date.status_expiry_date || ''
    });
    setShowEditModal(true);
  };

  if (loading) return <div>Loading...</div>;
  if (!schedule) return <div>Schedule not found</div>;

  const getOperatingDaysText = () => {
    const days = schedule.days.split(',');
    return days.map(day => dayNames[day] || '').join(', ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Kelola Tanggal Jadwal</h1>
        <Link to="/admin/schedules"
          className="inline-flex items-center px-4 py-2 bg-gray-600 rounded-md font-semibold text-xs text-white uppercase hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </Link>
      </div>

      {/* Schedule Information Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-white">Informasi Jadwal</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dl className="grid grid-cols-4 md:grid-cols-3 gap-x-4 gap-y-2">
                <dt className="col-span-1 text-sm font-medium text-gray-500">Rute:</dt>
                <dd className="col-span-3 md:col-span-2 text-sm text-gray-900">
                  {schedule.route.origin} - {schedule.route.destination}
                </dd>

                <dt className="col-span-1 text-sm font-medium text-gray-500">Kapal:</dt>
                <dd className="col-span-3 md:col-span-2 text-sm text-gray-900">{schedule.ferry.name}</dd>

                <dt className="col-span-1 text-sm font-medium text-gray-500">Waktu:</dt>
                <dd className="col-span-3 md:col-span-2 text-sm text-gray-900">
                  {schedule.departure_time} - {schedule.arrival_time}
                </dd>
              </dl>
            </div>
            <div>
              <dl className="grid grid-cols-4 md:grid-cols-3 gap-x-4 gap-y-2">
                <dt className="col-span-1 text-sm font-medium text-gray-500">Hari Operasi:</dt>
                <dd className="col-span-3 md:col-span-2 text-sm text-gray-900">{getOperatingDaysText()}</dd>

                <dt className="col-span-1 text-sm font-medium text-gray-500">Status:</dt>
                <dd className="col-span-3 md:col-span-2 text-sm text-gray-900">
                  {schedule.status === 'ACTIVE' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Aktif
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Tidak Aktif
                    </span>
                  )}
                </dd>

                <dt className="col-span-1 text-sm font-medium text-gray-500">Kapasitas:</dt>
                <dd className="col-span-3 md:col-span-2 text-sm text-gray-900">
                  <div className="flex flex-col space-y-1">
                    <span>Penumpang: {schedule.ferry.capacity_passenger}</span>
                    <span>Motor: {schedule.ferry.capacity_vehicle_motorcycle}</span>
                    <span>Mobil: {schedule.ferry.capacity_vehicle_car}</span>
                    <span>Bus: {schedule.ferry.capacity_vehicle_bus}</span>
                    <span>Truk: {schedule.ferry.capacity_vehicle_truck}</span>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Dates Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-blue-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Tanggal Jadwal</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tambah Tanggal
          </button>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penumpang</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kendaraan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alasan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terakhir Diperbarui</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scheduleDates.length > 0 ? scheduleDates.map(date => (
                  <tr key={date.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(date.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="mr-2">{date.passenger_count} / {schedule.ferry.capacity_passenger}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${Math.min(100, (date.passenger_count / schedule.ferry.capacity_passenger) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Motor:</span>
                          <span className="font-medium">{date.motorcycle_count} / {schedule.ferry.capacity_vehicle_motorcycle}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Mobil:</span>
                          <span className="font-medium">{date.car_count} / {schedule.ferry.capacity_vehicle_car}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Bus:</span>
                          <span className="font-medium">{date.bus_count} / {schedule.ferry.capacity_vehicle_bus}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Truk:</span>
                          <span className="font-medium">{date.truck_count} / {schedule.ferry.capacity_vehicle_truck}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {date.status === 'ACTIVE' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Tersedia
                        </span>
                      )}
                      {date.status === 'INACTIVE' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Tidak Tersedia
                        </span>
                      )}
                      {date.status === 'FULL' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Penuh
                        </span>
                      )}
                      {date.status === 'CANCELLED' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Dibatalkan
                        </span>
                      )}
                      {date.status === 'DEPARTED' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          Sudah Berangkat
                        </span>
                      )}
                      {date.status === 'WEATHER_ISSUE' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Masalah Cuaca
                        </span>
                      )}
                      {date.modified_by_schedule && (
                        <span className="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-800 text-white">
                          Diubah Oleh Jadwal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {date.status_reason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(date.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-1 justify-end">
                        <button 
                          onClick={() => openEditModal(date)}
                          className="text-white bg-blue-600 hover:bg-blue-700 rounded-full p-1.5 inline-flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteDate(date.id)}
                          className="text-white bg-red-600 hover:bg-red-700 rounded-full p-1.5 inline-flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>Tidak ada data tanggal</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Date Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tambah Tanggal Jadwal</h3>
              
              <form onSubmit={handleAddDate}>
                <div className="mb-4">
                  <label htmlFor="date_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Penambahan <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    id="date_type" 
                    value={dateType}
                    onChange={(e) => setDateType(e.target.value)}
                    required
                  >
                    <option value="single">Tanggal Tunggal</option>
                    <option value="range">Rentang Tanggal</option>
                  </select>
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Hari Operasi:</span> {getOperatingDaysText()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    <i>Catatan: Jika menggunakan rentang tanggal, hanya tanggal yang sesuai dengan hari operasi yang akan dibuat.</i>
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    id="date" 
                    name="date" 
                    value={formData.date}
                    onChange={handleInputChange}
                    required 
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {dateType === 'range' && (
                  <div className="mb-4">
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Akhir <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="date"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      id="end_date" 
                      name="end_date" 
                      value={formData.end_date}
                      onChange={handleInputChange}
                      required={dateType === 'range'}
                      min={formData.date || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}

                <div className="mb-4">
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
                    <option value="ACTIVE">Tersedia</option>
                    <option value="INACTIVE">Tidak Tersedia</option>
                    <option value="CANCELLED">Dibatalkan</option>
                    <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                  </select>
                </div>

                {formData.status !== 'ACTIVE' && (
                  <div className="mb-4">
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

                {formData.status === 'WEATHER_ISSUE' && (
                  <div className="mb-4">
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
                    <p className="mt-1 text-xs text-gray-500">Isi jika status akan berakhir pada waktu tertentu.</p>
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => {setShowAddModal(false); resetForm();}}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Date Modal */}
      {showEditModal && selectedDate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Tanggal Jadwal</h3>
              
              <form onSubmit={handleEditDate}>
                <p className="mb-4 text-gray-700 font-medium">Tanggal: {formatDate(selectedDate.date)}</p>
                
                <div className="mb-4">
                  <label htmlFor="edit_status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    id="edit_status" 
                    name="status" 
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="ACTIVE">Tersedia</option>
                    <option value="INACTIVE">Tidak Tersedia</option>
                    <option value="FULL">Penuh</option>
                    <option value="CANCELLED">Dibatalkan</option>
                    <option value="DEPARTED">Sudah Berangkat</option>
                    <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                  </select>
                </div>

                {formData.status !== 'ACTIVE' && (
                  <div className="mb-4">
                    <label htmlFor="edit_status_reason" className="block text-sm font-medium text-gray-700 mb-1">
                      Alasan Status
                    </label>
                    <input 
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      id="edit_status_reason" 
                      name="status_reason" 
                      value={formData.status_reason}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                {formData.status === 'WEATHER_ISSUE' && (
                  <div className="mb-4">
                    <label htmlFor="edit_status_expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Berakhir Status
                    </label>
                    <input 
                      type="datetime-local"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      id="edit_status_expiry_date" 
                      name="status_expiry_date" 
                      value={formData.status_expiry_date}
                      onChange={handleInputChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">Isi jika status akan berakhir pada waktu tertentu.</p>
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => {setShowEditModal(false); resetForm();}}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleDates;