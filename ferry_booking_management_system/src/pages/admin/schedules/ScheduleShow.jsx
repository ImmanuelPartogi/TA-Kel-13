import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { adminScheduleService } from '../../../services/api';
import { toast } from 'react-toastify';

const ScheduleShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [scheduleDates, setScheduleDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
  });

  useEffect(() => {
    fetchScheduleData();
  }, [id]);

  const fetchScheduleData = async () => {
    setLoading(true);
    try {
      const response = await adminScheduleService.getSchedule(id);
      setSchedule(response.data.schedule);
      const datesResponse = await adminScheduleService.getScheduleDates(id);
      setScheduleDates(datesResponse.data.dates || []);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      toast.error('Gagal memuat data jadwal');
      navigate('/admin/schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminScheduleService.deleteSchedule(id);
      toast.success('Jadwal berhasil dihapus');
      navigate('/admin/schedules');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Gagal menghapus jadwal');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    try {
      await adminScheduleService.updateScheduleDate(id, selectedDateId, rescheduleData);
      toast.success('Jadwal berhasil diperbarui');
      fetchScheduleData();
      setShowRescheduleModal(false);
    } catch (error) {
      console.error('Error rescheduling:', error);
      toast.error('Gagal mengubah jadwal');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="fas fa-exclamation-circle text-red-500 mt-1"></i>
          </div>
          <div className="ml-3">
            <p>Data jadwal tidak ditemukan</p>
          </div>
        </div>
      </div>
    );
  }

  const getDayName = (day) => {
    const dayMap = {
      '1': 'Senin',
      '2': 'Selasa',
      '3': 'Rabu',
      '4': 'Kamis',
      '5': 'Jumat',
      '6': 'Sabtu',
      '7': 'Minggu',
    };
    return dayMap[day] || day;
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-500 p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <i className="fas fa-ship mr-3"></i> Detail Jadwal
            </h1>
            <p className="text-blue-100 mt-1">
              <i className="fas fa-map-marker-alt mr-1"></i> {schedule.route.origin} <i className="fas fa-arrow-right mx-2"></i>{' '}
              {schedule.route.destination}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/admin/schedules/${id}/edit`}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg flex items-center transition duration-200 shadow-sm transform hover:-translate-y-1"
            >
              <i className="fas fa-edit mr-2"></i> Edit
            </Link>
            <Link
              to="/admin/schedules"
              className="bg-white text-blue-700 hover:bg-blue-50 py-2 px-4 rounded-lg transition duration-200 flex items-center shadow-sm transform hover:-translate-y-1"
            >
              <i className="fas fa-arrow-left mr-2"></i> Kembali
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Status Alert */}
        {schedule.status !== 'ACTIVE' && (
          <div
            className={`mb-6 ${
              schedule.status === 'DELAYED'
                ? 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700'
                : 'bg-red-100 border-l-4 border-red-500 text-red-700'
            } p-4 rounded-r shadow-sm`}
            role="alert"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {schedule.status === 'DELAYED' ? (
                  <i className="fas fa-clock text-yellow-500 text-lg"></i>
                ) : (
                  <i className="fas fa-ban text-red-500 text-lg"></i>
                )}
              </div>
              <div className="ml-3">
                <p className="font-medium">
                  {schedule.status === 'DELAYED'
                    ? 'Jadwal ini saat ini tertunda.'
                    : schedule.status === 'CANCELLED'
                    ? 'Jadwal ini dibatalkan.'
                    : 'Jadwal ini tidak aktif.'}
                </p>
                {schedule.status_reason && <p className="text-sm mt-1">Alasan: {schedule.status_reason}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Summary */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="md:w-32 flex justify-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-12 w-12 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
              <i className="fas fa-ship"></i>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-800">{schedule.ferry.name}</h2>
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                {schedule.ferry.registration_number}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-6">
              <div className="flex items-center">
                <div className="bg-blue-100 text-blue-600 h-6 w-6 rounded-full flex items-center justify-center mr-2">
                  <i className="fas fa-route"></i>
                </div>
                <span className="text-gray-700">{schedule.route.origin} - {schedule.route.destination}</span>
              </div>
              <div className="flex items-center">
                <div className="bg-green-100 text-green-600 h-6 w-6 rounded-full flex items-center justify-center mr-2">
                  <i className="fas fa-clock"></i>
                </div>
                <span className="text-gray-700">
                  {formatTime(schedule.departure_time)} - {formatTime(schedule.arrival_time)}
                </span>
              </div>
              <div className="flex items-center">
                <div className="bg-purple-100 text-purple-600 h-6 w-6 rounded-full flex items-center justify-center mr-2">
                  <i className="fas fa-calendar"></i>
                </div>
                <span className="text-gray-700">
                  {schedule.days.split(',').map(day => getDayName(day)).join(', ')}
                </span>
              </div>
            </div>
            <div className="mt-3">
              {schedule.status === 'ACTIVE' && (
                <span className="relative px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200 pl-5">
                  <span className="absolute w-2 h-2 rounded-full bg-green-500 left-2 top-1/2 transform -translate-y-1/2 animate-pulse"></span>
                  Aktif
                </span>
              )}
              {schedule.status === 'DELAYED' && (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                  <i className="fas fa-clock mr-1"></i> Tertunda
                </span>
              )}
              {schedule.status === 'CANCELLED' && (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                  <i className="fas fa-ban mr-1"></i> Dibatalkan
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-5 rounded-lg shadow-sm hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-transparent">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <i className="fas fa-info-circle mr-2 text-blue-500"></i> Informasi Jadwal
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Kapal:</div>
                <div className="font-medium text-gray-800">{schedule.ferry.name} ({schedule.ferry.registration_number})</div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Rute:</div>
                <div className="font-medium text-gray-800 flex items-center">
                  <i className="fas fa-map-marker-alt text-blue-500 mr-2"></i>
                  {schedule.route.origin} - {schedule.route.destination}
                </div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Durasi:</div>
                <div className="font-medium text-gray-800">{schedule.route.duration} menit</div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Hari Operasi:</div>
                <div className="font-medium text-gray-800">
                  {schedule.days.split(',').map(day => (
                    <span key={day} className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded mr-1 mb-1">
                      {getDayName(day)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Status:</div>
                <div>
                  {schedule.status === 'ACTIVE' && (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      <i className="fas fa-check-circle mr-1"></i> Aktif
                    </span>
                  )}
                  {schedule.status === 'DELAYED' && (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      <i className="fas fa-clock mr-1"></i> Tertunda
                    </span>
                  )}
                  {schedule.status === 'CANCELLED' && (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      <i className="fas fa-ban mr-1"></i> Dibatalkan
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg shadow-sm hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-transparent">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <i className="fas fa-clock mr-2 text-green-500"></i> Informasi Waktu
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Waktu Keberangkatan:</div>
                <div className="font-medium text-gray-800">{formatTime(schedule.departure_time)}</div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Waktu Kedatangan:</div>
                <div className="font-medium text-gray-800">{formatTime(schedule.arrival_time)}</div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Durasi Perjalanan:</div>
                <div className="font-medium text-gray-800">{schedule.route.duration} menit</div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Check-in Dibuka:</div>
                <div className="font-medium text-gray-800">{schedule.check_in_opens ? formatTime(schedule.check_in_opens) : '60 menit sebelum keberangkatan'}</div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Check-in Ditutup:</div>
                <div className="font-medium text-gray-800">{schedule.check_in_closes ? formatTime(schedule.check_in_closes) : '15 menit sebelum keberangkatan'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Schedule Dates */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <i className="fas fa-calendar-alt mr-2 text-blue-500"></i> Tanggal Jadwal
            </h3>
            <Link
              to={`/admin/schedules/${id}/dates/create`}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-300 flex items-center text-sm shadow-sm"
            >
              <i className="fas fa-plus mr-2"></i> Tambah Tanggal Baru
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keberangkatan
                    </th>
                    <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kedatangan
                    </th>
                    <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kapasitas
                    </th>
                    <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scheduleDates.length > 0 ? (
                    scheduleDates.map((date) => (
                      <tr key={date.id} className="hover:bg-gray-50 transition-all duration-200">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {formatDate(date.schedule_date)}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-700">
                          <div className="flex items-center">
                            <i className="far fa-clock text-blue-500 mr-2"></i>
                            {formatTime(date.departure_time || schedule.departure_time)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-700">
                          <div className="flex items-center">
                            <i className="far fa-clock text-green-500 mr-2"></i>
                            {formatTime(date.arrival_time || schedule.arrival_time)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {date.available_seats}/{date.total_seats || schedule.ferry.capacity}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {date.status === 'ACTIVE' && (
                            <span className="relative px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200 pl-5">
                              <span className="absolute w-2 h-2 rounded-full bg-green-500 left-2 top-1/2 transform -translate-y-1/2 animate-pulse"></span>
                              Aktif
                            </span>
                          )}
                          {date.status === 'DELAYED' && (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                              <i className="fas fa-clock mr-1"></i> Tertunda
                            </span>
                          )}
                          {date.status === 'FULL' && (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              <i className="fas fa-users mr-1"></i> Penuh
                            </span>
                          )}
                          {date.status === 'CANCELLED' && (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                              <i className="fas fa-ban mr-1"></i> Dibatalkan
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/admin/schedules/${id}/dates/${date.id}/edit`}
                              className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 p-2 rounded-lg transition-colors transform hover:scale-110"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            {date.status === 'DELAYED' && (
                              <button
                                type="button"
                                className="text-purple-600 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 p-2 rounded-lg transition-colors transform hover:scale-110"
                                onClick={() => {
                                  setSelectedDateId(date.id);
                                  setRescheduleData({
                                    date: date.schedule_date.split('T')[0],
                                    time: (date.departure_time || schedule.departure_time).substring(0, 5)
                                  });
                                  setShowRescheduleModal(true);
                                }}
                                title="Reschedule"
                              >
                                <i className="fas fa-calendar-alt"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-6 px-4 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="text-gray-300 mb-4">
                            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                          <p className="text-lg font-medium">Tidak ada tanggal jadwal</p>
                          <p className="text-sm text-gray-400 mb-4">Belum ada tanggal yang ditambahkan untuk jadwal ini</p>
                          <Link
                            to={`/admin/schedules/${id}/dates/create`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                          >
                            <i className="fas fa-plus mr-2"></i> Tambah Tanggal Baru
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Delete Schedule Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-colors"
          >
            <i className="fas fa-trash mr-2"></i> Hapus Jadwal
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-down">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Konfirmasi Hapus</h3>
              <p className="text-gray-500">Apakah Anda yakin ingin menghapus jadwal:</p>
              <p className="font-semibold text-gray-800 mt-2 mb-4">
                {schedule.route.origin} - {schedule.route.destination} ({schedule.ferry.name})
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <i className="fas fa-times mr-2"></i> Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i> Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-down">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Jadwal Ulang</h3>
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleReschedule}>
              <div className="mb-4">
                <label htmlFor="reschedule_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Baru
                </label>
                <input
                  type="date"
                  id="reschedule_date"
                  name="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="reschedule_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Waktu Keberangkatan Baru
                </label>
                <input
                  type="time"
                  id="reschedule_time"
                  name="time"
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleShow;