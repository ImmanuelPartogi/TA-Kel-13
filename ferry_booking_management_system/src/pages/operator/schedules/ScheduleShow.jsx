// src/pages/operator/schedules/ScheduleShow.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { operatorSchedulesService } from '../../../services/operatorSchedules.service';
import Swal from 'sweetalert2';

const ScheduleShow = () => {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [, setUpcomingDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      setLoading(true);
      try {
        // Fetch schedule details
        const scheduleResponse = await operatorSchedulesService.getById(id);
        // console.log('Schedule response:', scheduleResponse);

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

    fetchScheduleDetails();
  }, [id]);

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

  const formatTime = (isoTimeString) => {
    if (!isoTimeString) return 'N/A';

    try {
      // Membuat objek Date dari string waktu ISO
      const date = new Date(isoTimeString);

      // Mengecek apakah date valid
      if (isNaN(date.getTime())) return 'Format Waktu Invalid';

      // Memformat ke jam:menit
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error memformat waktu:", error);
      return 'Error Format';
    }
  };

  const formatDuration = (minutes) => {
    // Jika minutes adalah undefined, null, atau NaN
    if (!minutes && minutes !== 0) {
      // Coba hitung durasi dari waktu keberangkatan dan kedatangan
      if (schedule?.departure_time && schedule?.arrival_time) {
        try {
          const departure = new Date(schedule.departure_time);
          const arrival = new Date(schedule.arrival_time);
          if (!isNaN(departure.getTime()) && !isNaN(arrival.getTime())) {
            minutes = Math.round((arrival - departure) / (1000 * 60));
          }
        } catch (error) {
          console.error("Error menghitung durasi dari waktu:", error);
        }
      }

      // Jika masih tidak ada nilai valid
      if (!minutes && minutes !== 0) {
        return 'Tidak tersedia';
      }
    }

    // Pastikan minutes adalah angka
    const numMinutes = Number(minutes);
    if (isNaN(numMinutes)) return 'Format tidak valid';

    const hours = Math.floor(numMinutes / 60);
    const mins = numMinutes % 60;

    const durationText = [];
    if (hours > 0) {
      durationText.push(`${hours} jam`);
    }
    if (mins > 0) {
      durationText.push(`${mins} menit`);
    }

    return durationText.join(' ') || '0 menit';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            <div className="animate-ping absolute top-0 left-0 rounded-full h-16 w-16 border-2 border-blue-600 opacity-30"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Memuat detail jadwal...</p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="bg-red-100 rounded-full mx-auto h-20 w-20 flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Jadwal tidak ditemukan</h2>
          <p className="text-gray-600 mb-8">Maaf, data jadwal yang Anda cari tidak tersedia atau telah dihapus.</p>
          <Link
            to="/operator/schedules"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header with Graphic Banner */}
        <div className="bg-gradient-to-br from-blue-800 via-blue-600 to-blue-500 rounded-2xl shadow-xl text-white p-8 mb-8 relative overflow-hidden">
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
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Detail Jadwal</h1>
                  <p className="mt-1 text-blue-100">{schedule.route.origin} - {schedule.route.destination}</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Link
                  to="/operator/schedules"
                  className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali
                </Link>
                <Link
                  to={`/operator/schedules/${id}/dates`}
                  className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Kelola Tanggal
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Jadwal Summary Bar */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-4 flex flex-col items-center justify-center">
              <span className="text-sm text-gray-500 mb-1">ID Jadwal</span>
              <span className="text-xl font-bold text-gray-800">{schedule.id}</span>
            </div>
            <div className="p-4 flex flex-col items-center justify-center">
              <span className="text-sm text-gray-500 mb-1">Status</span>
              {schedule.status === 'ACTIVE' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-md">
                  Aktif
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 shadow-md">
                  Tidak Aktif
                </span>
              )}
            </div>
            <div className="p-4 flex flex-col items-center justify-center">
              <span className="text-sm text-gray-500 mb-1">Keberangkatan</span>
              <span className="text-xl font-bold text-gray-800">{formatTime(schedule.departure_time)}</span>
              <span className="text-xs text-gray-500">{new Date(schedule.departure_time).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="p-4 flex flex-col items-center justify-center">
              <span className="text-sm text-gray-500 mb-1">Kedatangan</span>
              <span className="text-xl font-bold text-gray-800">{formatTime(schedule.arrival_time)}</span>
              <span className="text-xs text-gray-500">{new Date(schedule.arrival_time).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Jadwal Info Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 shadow-sm">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm">
                    <span className="text-sm text-gray-500 mb-1 block">Dibuat pada</span>
                    <span className="text-sm font-medium text-gray-800">
                      {new Date(schedule.created_at).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm">
                    <span className="text-sm text-gray-500 mb-1 block">Diperbarui pada</span>
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
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Lihat dan kelola semua tanggal jadwal
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Rute Info Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">Informasi Rute</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-center px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
                  <span className="block text-sm text-gray-500">Asal</span>
                  <span className="block text-lg font-bold text-blue-700">{schedule.route.origin}</span>
                </div>

                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>

                <div className="text-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200 shadow-sm">
                  <span className="block text-sm text-gray-500">Tujuan</span>
                  <span className="block text-lg font-bold text-indigo-700">{schedule.route.destination}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm">
                <span className="text-sm text-gray-500 mb-1 block">Durasi Perjalanan</span>
                <span className="text-sm font-medium text-gray-800">{formatDuration(schedule.route.duration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ferry Info Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">Informasi Kapal</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
              <div className="md:w-1/3 mb-6 md:mb-0">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center border border-gray-200 shadow-sm">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4 border border-blue-300 shadow-md">
                    <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{schedule.ferry.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">ID Kapal: {schedule.ferry.id}</p>
                </div>
              </div>

              <div className="md:w-2/3">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Informasi Kapasitas</h3>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-4 border border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm text-gray-500">Kapasitas Penumpang</span>
                      <span className="block text-2xl font-bold text-blue-700">{schedule.ferry.capacity_passenger}</span>
                      <span className="text-xs text-gray-500">orang</span>
                    </div>
                    <svg className="h-10 w-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>

                <h4 className="text-sm font-medium text-gray-700 mb-2">Kapasitas Kendaraan</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <svg className="h-6 w-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="block text-lg font-bold text-gray-800">{schedule.ferry.capacity_vehicle_motorcycle}</span>
                    <span className="text-xs text-gray-500">Motor</span>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <svg className="h-6 w-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="block text-lg font-bold text-gray-800">{schedule.ferry.capacity_vehicle_car}</span>
                    <span className="text-xs text-gray-500">Mobil</span>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <svg className="h-6 w-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="block text-lg font-bold text-gray-800">{schedule.ferry.capacity_vehicle_bus}</span>
                    <span className="text-xs text-gray-500">Bus</span>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <svg className="h-6 w-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="block text-lg font-bold text-gray-800">{schedule.ferry.capacity_vehicle_truck}</span>
                    <span className="text-xs text-gray-500">Truk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS for animations */}
        <style>{`
          @keyframes fadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ScheduleShow;