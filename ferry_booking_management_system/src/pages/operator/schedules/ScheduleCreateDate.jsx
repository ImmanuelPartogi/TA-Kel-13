import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { operatorScheduleService as scheduleService } from '../../../services/api';
import { toast } from 'react-toastify';

const ScheduleCreateDate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    date: '',
    status: 'active',
    status_reason: '',
    status_expiry_date: ''
  });
  const [error, setError] = useState({});

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await scheduleService.getSchedule(id);
        setSchedule(response.data.data);
        setLoading(false);
      } catch (error) {
        toast.error(`Gagal memuat data jadwal: ${error.message}`);
        setLoading(false);
      }
    };
    
    fetchSchedule();
  }, [id]);

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
      await scheduleService.createDate(id, form);
      toast.success('Tanggal jadwal berhasil ditambahkan');
      navigate(`/operator/schedules/${id}/dates`);
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors);
      }
      toast.error('Gagal menyimpan tanggal jadwal');
    }
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Tambah Tanggal Jadwal</h1>
              {schedule && (
                <p className="text-blue-100 mt-1">{schedule.route.origin} - {schedule.route.destination}</p>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to={`/operator/schedules/${id}`} className="inline-flex items-center px-4 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
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
        {schedule && (
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
                  <span className="text-sm text-gray-500">Keberangkatan:</span>
                  <span className="text-sm font-medium text-gray-900">{new Date(schedule.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">Kedatangan:</span>
                  <span className="text-sm font-medium text-gray-900">{new Date(schedule.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">Hari Operasi:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
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
                        <span key={day} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {dayNames[day] || day}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ID Jadwal:</span>
                  <span className="text-sm font-medium text-gray-900">{schedule.id}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">Tambah Tanggal Baru</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal <span className="text-red-600">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input 
                      type="date" 
                      id="date" 
                      name="date"
                      min={new Date().toISOString().split('T')[0]}
                      className={`pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 ${error.date ? 'border-red-500' : ''}`}
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {error.date && <p className="mt-1 text-sm text-red-600">{error.date}</p>}
                  <p className="mt-1 text-xs text-gray-500">Pilih tanggal sesuai hari operasi kapal</p>
                </div>

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
                    min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                    className={`pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 ${error.status_expiry_date ? 'border-red-500' : ''}`}
                    value={form.status_expiry_date}
                    onChange={handleChange}
                  />
                </div>
                {error.status_expiry_date && <p className="mt-1 text-sm text-red-600">{error.status_expiry_date}</p>}
                <p className="mt-1 text-xs text-gray-500">Tanggal saat status cuaca diperkirakan berakhir</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 text-sm text-blue-700">
                    <p>Kapasitas penumpang dan kendaraan akan menggunakan nilai default dari kapal. Anda dapat mengubahnya nanti jika diperlukan.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link 
                  to={`/operator/schedules/${id}`}
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
                  Simpan Tanggal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Bantuan */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mt-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">Bantuan</h2>
        </div>
        <div className="p-6">
          <dl className="space-y-6">
            <div>
              <dt className="text-sm font-medium text-gray-700">Status Tanggal</dt>
              <dd className="mt-1 text-sm text-gray-600">
                <ul className="list-disc pl-5 space-y-1">
                  <li><span className="font-medium text-green-600">Tersedia</span> - Jadwal normal, penumpang dapat memesan tiket.</li>
                  <li><span className="font-medium text-red-600">Tidak Tersedia</span> - Jadwal tidak beroperasi, tidak dapat dipesan.</li>
                  <li><span className="font-medium text-red-600">Dibatalkan</span> - Jadwal dibatalkan setelah sebelumnya tersedia.</li>
                  <li><span className="font-medium text-yellow-600">Penuh</span> - Kapasitas penumpang/kendaraan sudah penuh.</li>
                  <li><span className="font-medium text-blue-600">Masalah Cuaca</span> - Jadwal berpotensi berubah karena kondisi cuaca.</li>
                </ul>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-700">Tanggal Berakhir Status</dt>
              <dd className="mt-1 text-sm text-gray-600">
                Hanya berlaku untuk status "Masalah Cuaca". Menentukan kapan status akan otomatis kembali ke "Tersedia" jika kondisi cuaca membaik.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCreateDate;