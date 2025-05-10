import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { operatorScheduleService as scheduleService } from '../../../services/api';
import { toast } from 'react-toastify';

const ScheduleDatesList = () => {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: '',
    status_reason: '',
    status_expiry_date: ''
  });

  useEffect(() => {
    fetchData();
  }, [id, page]);

  const fetchData = async () => {
    try {
      const scheduleResponse = await scheduleService.getSchedule(id);
      const datesResponse = await scheduleService.getScheduleDates(id, { page });
      
      setSchedule(scheduleResponse.data.data);
      setDates(datesResponse.data.data);
      
      if (datesResponse.data.meta) {
        setTotalPages(Math.ceil(datesResponse.data.meta.total / datesResponse.data.meta.per_page));
      }
      
      setLoading(false);
    } catch (error) {
      toast.error(`Gagal memuat data: ${error.message}`);
      setLoading(false);
    }
  };

  const openDeleteModal = (date) => {
    setSelectedDate(date);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedDate(null);
  };

  const openUpdateStatusModal = (date) => {
    setSelectedDate(date);
    setStatusForm({
      status: date.status,
      status_reason: date.status_reason || '',
      status_expiry_date: date.status_expiry_date || ''
    });
    setShowUpdateStatusModal(true);
  };

  const closeUpdateStatusModal = () => {
    setShowUpdateStatusModal(false);
    setSelectedDate(null);
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteDate = async () => {
    try {
      await scheduleService.deleteDate(id, selectedDate.id);
      toast.success('Tanggal jadwal berhasil dihapus');
      fetchData();
      closeDeleteModal();
    } catch (error) {
      toast.error(`Gagal menghapus tanggal jadwal: ${error.message}`);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await scheduleService.updateDateStatus(id, selectedDate.id, statusForm);
      toast.success('Status tanggal berhasil diperbarui');
      fetchData();
      closeUpdateStatusModal();
    } catch (error) {
      toast.error(`Gagal memperbarui status tanggal: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Tanggal Jadwal</h1>
              {schedule && (
                <p className="text-blue-100 mt-1">
                  {schedule.route.origin} - {schedule.route.destination} • {new Date(schedule.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <Link to={`/operator/schedules/${id}`} className="inline-flex items-center px-4 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Detail Jadwal
            </Link>
            <Link to={`/operator/schedules/${id}/dates/create`} className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah Tanggal
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Jadwal Info Card */}
        {schedule && (
          <div className="lg:col-span-3 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">Informasi Jadwal</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">ID Jadwal</p>
                  <p className="text-lg font-semibold text-gray-800">{schedule.id}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  {schedule.status === 'ACTIVE' ? (
                    <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Aktif
                    </p>
                  ) : (
                    <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Tidak Aktif
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Waktu Keberangkatan</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(schedule.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Waktu Kedatangan</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(schedule.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Hari Operasi</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {schedule.days.split(',').map(day => {
                    const dayNames = {
                      '1': 'Senin',
                      '2': 'Selasa',
                      '3': 'Rabu',
                      '4': 'Kamis',
                      '5': 'Jumat',
                      '6': 'Sabtu',
                      '7': 'Minggu',
                    };
                    return (
                      <span key={day} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {dayNames[day] || day}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tanggal Jadwal Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">Tanggal Jadwal yang Tersedia</h2>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Total: {dates.length} tanggal
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alasan Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapasitas Tersisa</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penumpang</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kendaraan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dates.length > 0 ? (
                dates.map((date) => {
                  const passengerPercentage = schedule.ferry.capacity_passenger > 0
                    ? 100 - (date.passenger_count / schedule.ferry.capacity_passenger) * 100
                    : 0;
                  
                  return (
                    <tr key={date.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{formatDate(date.date)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {date.status === 'ACTIVE' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Tersedia
                          </span>
                        )}
                        {date.status === 'INACTIVE' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Tidak Tersedia
                          </span>
                        )}
                        {date.status === 'FULL' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Penuh
                          </span>
                        )}
                        {date.status === 'CANCELLED' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Dibatalkan
                          </span>
                        )}
                        {date.status === 'WEATHER_ISSUE' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Masalah Cuaca
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{date.status_reason || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${passengerPercentage}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {schedule.ferry.capacity_passenger - date.passenger_count} dari {schedule.ferry.capacity_passenger} kursi tersedia
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-semibold">
                          {date.passenger_count}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Motor:</span>
                            <span className="font-semibold">{date.motorcycle_count}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Mobil:</span>
                            <span className="font-semibold">{date.car_count}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Bus:</span>
                            <span className="font-semibold">{date.bus_count}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Truk:</span>
                            <span className="font-semibold">{date.truck_count}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-2">
                        <button 
                          type="button" 
                          onClick={() => openUpdateStatusModal(date)}
                          className="flex w-full items-center justify-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Update Status
                        </button>

                        <button 
                          type="button"
                          onClick={() => openDeleteModal(date)}
                          className="flex w-full items-center justify-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-sm text-gray-500 text-center">Tidak ada data tanggal jadwal</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-md ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Sebelumnya
            </button>
            <span className="text-sm text-gray-500">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-md ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>

      {/* Modal Delete */}
      {showDeleteModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Konfirmasi Hapus</h3>
              <button type="button" className="text-gray-400 hover:text-gray-500" onClick={closeDeleteModal}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="text-sm text-gray-600">
                Apakah Anda yakin ingin menghapus tanggal jadwal:
                <div className="font-semibold text-gray-900 mt-1">{formatDate(selectedDate.date)}</div>
              </div>
              <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                <div className="font-semibold">Perhatian:</div>
                <div>Tindakan ini tidak dapat dibatalkan dan seluruh data terkait dengan tanggal ini akan dihapus.</div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button 
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150"
                onClick={closeDeleteModal}
              >
                Batal
              </button>
              <button 
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150"
                onClick={handleDeleteDate}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Update Status */}
      {showUpdateStatusModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl max-w-lg w-full mx-4 shadow-2xl transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Update Status Tanggal: {formatDate(selectedDate.date)}
              </h3>
              <button type="button" className="text-gray-400 hover:text-gray-500" onClick={closeUpdateStatusModal}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateStatus}>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    id="status"
                    name="status"
                    value={statusForm.status}
                    onChange={handleStatusChange}
                    required
                  >
                    <option value="ACTIVE">Tersedia</option>
                    <option value="INACTIVE">Tidak Tersedia</option>
                    <option value="CANCELLED">Dibatalkan</option>
                    <option value="FULL">Penuh</option>
                    <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="status_reason" className="block text-sm font-medium text-gray-700 mb-1">Alasan Status (Opsional):</label>
                  <textarea
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    id="status_reason"
                    name="status_reason"
                    rows="3"
                    value={statusForm.status_reason}
                    onChange={handleStatusChange}
                  ></textarea>
                </div>

                <div className="mb-4" style={{ display: statusForm.status === 'WEATHER_ISSUE' ? 'block' : 'none' }}>
                  <label htmlFor="status_expiry_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal & Waktu Berakhir Status:</label>
                  <input 
                    type="datetime-local"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    id="status_expiry_date"
                    name="status_expiry_date"
                    value={statusForm.status_expiry_date}
                    onChange={handleStatusChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: Tanggal dan Waktu (yyyy-mm-dd HH:MM)</p>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button 
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150"
                  onClick={closeUpdateStatusModal}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleDatesList;