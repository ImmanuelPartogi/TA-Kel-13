// src/pages/operator/schedules/ScheduleShow.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { operatorSchedulesService } from '../../../services/operatorSchedules.service';
import Swal from 'sweetalert2';

const ScheduleShow = () => {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [upcomingDates, setUpcomingDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduleDetails();
  }, [id]);

  const fetchScheduleDetails = async () => {
    setLoading(true);
    try {
      // Fetch schedule details
      const scheduleResponse = await operatorSchedulesService.getById(id);
      console.log('Schedule response:', scheduleResponse);

      if (scheduleResponse.data && scheduleResponse.data.data) {
        const scheduleData = scheduleResponse.data.data.schedule || scheduleResponse.data.data;
        setSchedule(scheduleData);

        // Set upcoming dates dari response schedule jika ada
        if (scheduleData.upcomingDates) {
          setUpcomingDates(scheduleData.upcomingDates);
        } else {
          // Jika tidak ada, ambil dari dates endpoint
          const datesResponse = await operatorSchedulesService.getScheduleDates(id, {
            status: 'ACTIVE',
            start_date: new Date().toISOString().split('T')[0],
            per_page: 14
          });

          if (datesResponse.data && datesResponse.data.data) {
            setUpcomingDates(datesResponse.data.data.dates || datesResponse.data.data || []);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching schedule details:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat detail jadwal',
      });
    }
    setLoading(false);
  };
  
  const getDayNames = () => {
    if (!schedule) return [];

    const dayNames = {
      '1': 'Senin',
      '2': 'Selasa',
      '3': 'Rabu',
      '4': 'Kamis',
      '5': 'Jumat',
      '6': 'Sabtu',
      '7': 'Minggu',
    };

    return schedule.days.split(',').map(day => dayNames[day] || day);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const durationText = [];

    if (hours > 0) {
      durationText.push(`${hours} jam`);
    }

    if (mins > 0) {
      durationText.push(`${mins} menit`);
    }

    return durationText.join(' ');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
  };

  const getStatusBadge = (status) => {
    const badges = {
      'ACTIVE': { class: 'bg-green-100 text-green-800', text: 'Tersedia' },
      'INACTIVE': { class: 'bg-red-100 text-red-800', text: 'Tidak Tersedia' },
      'FULL': { class: 'bg-yellow-100 text-yellow-800', text: 'Penuh' },
      'CANCELLED': { class: 'bg-red-100 text-red-800', text: 'Dibatalkan' },
      'WEATHER_ISSUE': { class: 'bg-blue-100 text-blue-800', text: 'Masalah Cuaca' },
    };

    const badge = badges[status] || { class: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Jadwal tidak ditemukan</h2>
          <Link to="/operator/schedules" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Daftar Jadwal
          </Link>
        </div>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Detail Jadwal</h1>
              <p className="text-blue-100 mt-1">{schedule.route.origin} - {schedule.route.destination}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <Link
              to="/operator/schedules"
              className="inline-flex items-center px-4 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Kembali
            </Link>
            <Link
              to={`/operator/schedules/${id}/dates`}
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Kelola Tanggal
            </Link>
          </div>
        </div>
      </div>

      {/* Jadwal Summary Bar */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-gray-500 mb-1">ID Jadwal</span>
            <span className="text-xl font-bold text-gray-800">{schedule.id}</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-gray-500 mb-1">Status</span>
            {schedule.status === 'ACTIVE' ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Aktif
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Tidak Aktif
              </span>
            )}
          </div>
          <div className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-gray-500 mb-1">Keberangkatan</span>
            <span className="text-xl font-bold text-gray-800">{schedule.departure_time}</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-gray-500 mb-1">Kedatangan</span>
            <span className="text-xl font-bold text-gray-800">{schedule.arrival_time}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Jadwal Info Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">Informasi Jadwal</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Hari Operasi</span>
                <div className="flex flex-wrap gap-2">
                  {getDayNames().map((day, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">Dibuat pada</span>
                  <span className="text-sm font-medium text-gray-800">
                    {new Date(schedule.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">Diperbarui pada</span>
                  <span className="text-sm font-medium text-gray-800">
                    {new Date(schedule.updated_at).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  to={`/operator/schedules/${id}/dates`}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-150"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Lihat dan kelola semua tanggal jadwal
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Rute Info Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">Informasi Rute</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-center px-4 py-2 bg-blue-50 rounded-lg">
                <span className="block text-sm text-gray-500">Asal</span>
                <span className="block text-lg font-bold text-blue-700">{schedule.route.origin}</span>
              </div>

              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>

              <div className="text-center px-4 py-2 bg-indigo-50 rounded-lg">
                <span className="block text-sm text-gray-500">Tujuan</span>
                <span className="block text-lg font-bold text-indigo-700">{schedule.route.destination}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
                <span className="text-sm text-gray-500 mb-1">ID Rute</span>
                <span className="text-sm font-medium text-gray-800">{schedule.route.id}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Jarak</span>
                <span className="text-sm font-medium text-gray-800">{schedule.route.distance} km</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Durasi Perjalanan</span>
              <span className="text-sm font-medium text-gray-800">{formatDuration(schedule.route.duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ferry Info Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">Informasi Kapal</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
            <div className="md:w-1/3 mb-6 md:mb-0">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">{schedule.ferry.name}</h3>
                <p className="text-sm text-gray-500 mt-1">ID Kapal: {schedule.ferry.id}</p>
              </div>
            </div>

            <div className="md:w-2/3">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Informasi Kapasitas</h3>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm text-gray-500">Kapasitas Penumpang</span>
                    <span className="block text-2xl font-bold text-blue-700">{schedule.ferry.capacity_passenger}</span>
                    <span className="text-xs text-gray-500">orang</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>

              <h4 className="text-sm font-medium text-gray-700 mb-2">Kapasitas Kendaraan</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="block text-lg font-bold text-gray-800">{schedule.ferry.capacity_motorcycle}</span>
                  <span className="text-xs text-gray-500">Motor</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="block text-lg font-bold text-gray-800">{schedule.ferry.capacity_car}</span>
                  <span className="text-xs text-gray-500">Mobil</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="block text-lg font-bold text-gray-800">{schedule.ferry.capacity_bus}</span>
                  <span className="text-xs text-gray-500">Bus</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="block text-lg font-bold text-gray-800">{schedule.ferry.capacity_truck}</span>
                  <span className="text-xs text-gray-500">Truk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tanggal Mendatang */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tanggal Jadwal Mendatang</h3>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Booking
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingDates.length > 0 ? (
                  upcomingDates.map((date) => (
                    <tr key={date.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatDate(date.date)}</div>
                        <div className="text-xs text-gray-500">{getDayName(date.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(date.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{date.booking_count} booking</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/operator/bookings?schedule_id=${schedule.id}&date=${date.date}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Lihat Booking
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-sm text-center text-gray-500">
                      Tidak ada tanggal jadwal mendatang yang tersedia.
                      <div className="mt-2">
                        <Link
                          to={`/operator/schedules/${id}/dates/create`}
                          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Tambahkan tanggal jadwal
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Menampilkan {upcomingDates.length} dari {upcomingDates.length} tanggal mendatang
            </span>
            <Link
              to={`/operator/schedules/${id}/dates`}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-150"
            >
              Lihat semua tanggal
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleShow;