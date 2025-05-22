import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import adminFerryService from '../../../services/adminFerry.service';

const FerryShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ferry, setFerry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchFerry();

    // Auto-hide alert after 5 seconds
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [id, alert.show]);

  const fetchFerry = async () => {
    try {
      const response = await adminFerryService.getFerryDetail(id);

      if (response.status === 'success' && response.data) {
        setFerry(response.data);
      } else {
        setFerry(null);
        setAlert({
          show: true,
          type: 'error',
          message: 'Gagal memuat data kapal'
        });
      }
    } catch (error) {
      console.error('Error fetching ferry:', error);
      setFerry(null);
      setAlert({
        show: true,
        type: 'error',
        message: 'Terjadi kesalahan saat memuat data kapal'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await adminFerryService.deleteFerry(id);

      if (response.status === 'success' || response.success) {
        setAlert({
          show: true,
          type: 'success',
          message: 'Kapal berhasil dihapus'
        });
        setTimeout(() => {
          navigate('/admin/ferries');
        }, 1500);
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: response.message || 'Gagal menghapus kapal'
        });
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting ferry:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Terjadi kesalahan saat menghapus kapal'
      });
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const dayNames = {
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
    7: 'Minggu'
  };

  const getDayNames = (days) => {
    if (!days) return [];
    const dayArray = typeof days === 'string' ? days.split(',') : [days];
    return dayArray.map(day => dayNames[day] || day);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="mt-4 text-center text-gray-600 font-medium">Memuat data...</div>
        </div>
      </div>
    );
  }

  if (!ferry) {
    return (
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
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
            <div className="flex items-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-4">
                <i className="fas fa-ship text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Detail Kapal</h1>
                <p className="text-blue-100 mt-1">Data tidak ditemukan</p>
              </div>
            </div>
            <Link to="/admin/ferries"
              className="mt-4 inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20">
              <i className="fas fa-arrow-left mr-2"></i> Kembali ke Daftar Kapal
            </Link>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="bg-red-100 rounded-full p-2 mr-4">
                <i className="fas fa-exclamation-circle text-red-500 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Data Tidak Ditemukan</h3>
                <p className="mt-2">Kapal yang Anda cari tidak ditemukan atau telah dihapus dari sistem.</p>
                <Link to="/admin/ferries" className="mt-4 inline-flex items-center text-red-700 hover:text-red-900 font-medium">
                  <i className="fas fa-long-arrow-alt-left mr-2"></i> Kembali ke daftar kapal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Status color schemes
  const statusColors = {
    ACTIVE: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      indicator: 'bg-emerald-500',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    MAINTENANCE: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      indicator: 'bg-amber-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    INACTIVE: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      indicator: 'bg-gray-500',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600'
    }
  };

  const statusConfig = statusColors[ferry.status] || statusColors.INACTIVE;

  return (
    <div className="bg-white shadow-xl rounded-xl overflow-hidden">
      {/* Modern Hero Header */}
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
                <i className="fas fa-ship text-2xl"></i>
              </div>
              <div>
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold">{ferry.name}</h1>
                  <div className={`ml-3 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text} text-xs font-medium px-2.5 py-1 rounded-full flex items-center`}>
                    <span className={`w-2 h-2 ${statusConfig.indicator} rounded-full mr-1.5 ${ferry.status === 'ACTIVE' ? 'animate-pulse' : ''}`}></span>
                    {ferry.status === 'ACTIVE' ? 'Aktif' : ferry.status === 'MAINTENANCE' ? 'Perawatan' : 'Tidak Aktif'}
                  </div>
                </div>
                <div className="flex items-center mt-2 text-blue-100">
                  <i className="fas fa-id-card mr-2"></i>
                  <span>{ferry.registration_number}</span>
                  {ferry.year_built && (
                    <>
                      <span className="mx-2">•</span>
                      <i className="fas fa-calendar-alt mr-2"></i>
                      <span>Tahun {ferry.year_built}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to={`/admin/ferries/${ferry.id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20">
                <i className="fas fa-edit mr-2"></i> Edit
              </Link>
              <Link to="/admin/ferries"
                className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20">
                <i className="fas fa-arrow-left mr-2"></i> Kembali
              </Link>
            </div>
          </div>

        </div>
      </div>

      <div className="p-8">
        {/* Alert Messages with modern styling */}
        {alert.show && (
          <div className={`mb-6 rounded-lg shadow-lg overflow-hidden animate-slideIn`}>
            <div className={`${alert.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} px-4 py-2 text-white flex items-center justify-between`}>
              <div className="flex items-center">
                <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                <span className="font-medium">{alert.type === 'success' ? 'Sukses' : 'Error'}</span>
              </div>
              <button onClick={() => setAlert({ ...alert, show: false })} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={`${alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'} px-4 py-3 border-t`}>
              {alert.message}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Foto Kapal with modern styling */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-image text-blue-500 mr-2"></i>
                  Foto Kapal
                </h2>
              </div>

              <div className="p-6">
                {ferry.image ? (
                  <div className="aspect-w-16 aspect-h-10 rounded-lg overflow-hidden shadow-md">
                    <img
                      src={adminFerryService.getImageUrl(ferry.image)}
                      alt={ferry.name}
                      className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-ferry-image.png';
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-w-16 aspect-h-10 flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <div className="rounded-full bg-gray-100 p-6 mb-4">
                      <i className="fas fa-ship text-gray-300 text-4xl"></i>
                    </div>
                    <p className="text-gray-500 text-center">Belum ada foto untuk kapal ini</p>
                    <Link to={`/admin/ferries/${ferry.id}/edit`} className="mt-4 text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center">
                      <i className="fas fa-upload mr-1"></i> Upload foto
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Status Kapal with modern styling */}
            <div className={`${statusConfig.bg} rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border ${statusConfig.border}`}>
              <div className="px-6 py-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                  Status Kapal
                </h2>
              </div>

              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${statusConfig.iconBg} mb-4`}>
                    <i className={`${ferry.status === 'ACTIVE' ? 'fas fa-check-circle' : ferry.status === 'MAINTENANCE' ? 'fas fa-tools' : 'fas fa-ban'} text-4xl ${statusConfig.iconColor}`}></i>
                  </div>

                  <div className={`px-6 py-2 rounded-full ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} text-lg font-medium inline-flex items-center`}>
                    <span className={`w-3 h-3 ${statusConfig.indicator} rounded-full mr-2 ${ferry.status === 'ACTIVE' ? 'animate-pulse' : ''}`}></span>
                    {ferry.status === 'ACTIVE' ? 'Aktif' : ferry.status === 'MAINTENANCE' ? 'Dalam Perawatan' : 'Tidak Aktif'}
                  </div>

                  <p className="mt-4 text-center text-gray-600">
                    {ferry.status === 'ACTIVE'
                      ? 'Kapal siap beroperasi dan melayani penumpang'
                      : ferry.status === 'MAINTENANCE'
                        ? 'Kapal sedang dalam perawatan dan tidak dapat beroperasi'
                        : 'Kapal sedang tidak beroperasi'}
                  </p>
                </div>

                <div className="mt-6 space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Terakhir diperbarui:</span>
                    <span className="font-medium">{formatDate(ferry.updated_at || ferry.created_at)}</span>
                  </div>

                  {ferry.last_maintenance_date && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Perawatan terakhir:</span>
                      <span className="font-medium">{formatDate(ferry.last_maintenance_date)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Tahun pembuatan:</span>
                    <span className="font-medium">{ferry.year_built || 'Tidak diketahui'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Modern Capacity Cards */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-users text-blue-500 mr-2"></i>
                  Kapasitas Kapal
                </h2>
                <span className="text-sm text-gray-500">Total daya tampung</span>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Penumpang */}
                  <div className="card-3d bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex flex-col h-full">
                      <div className="mb-auto">
                        <div className="bg-blue-200/50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                          <i className="fas fa-users text-blue-600 text-lg"></i>
                        </div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-blue-600 mb-1">Penumpang</p>
                      </div>
                      <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-blue-700">{ferry.capacity_passenger}</p>
                        <p className="text-xs text-blue-500">orang</p>
                      </div>
                    </div>
                  </div>

                  {/* Motor */}
                  <div className="card-3d bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex flex-col h-full">
                      <div className="mb-auto">
                        <div className="bg-emerald-200/50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                          <i className="fas fa-motorcycle text-emerald-600 text-lg"></i>
                        </div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-emerald-600 mb-1">Motor</p>
                      </div>
                      <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-emerald-700">{ferry.capacity_vehicle_motorcycle}</p>
                        <p className="text-xs text-emerald-500">unit</p>
                      </div>
                    </div>
                  </div>

                  {/* Mobil */}
                  <div className="card-3d bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex flex-col h-full">
                      <div className="mb-auto">
                        <div className="bg-indigo-200/50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                          <i className="fas fa-car text-indigo-600 text-lg"></i>
                        </div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 mb-1">Mobil</p>
                      </div>
                      <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-indigo-700">{ferry.capacity_vehicle_car}</p>
                        <p className="text-xs text-indigo-500">unit</p>
                      </div>
                    </div>
                  </div>

                  {/* Bus */}
                  <div className="card-3d bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex flex-col h-full">
                      <div className="mb-auto">
                        <div className="bg-amber-200/50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                          <i className="fas fa-bus text-amber-600 text-lg"></i>
                        </div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-amber-600 mb-1">Bus</p>
                      </div>
                      <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-amber-700">{ferry.capacity_vehicle_bus}</p>
                        <p className="text-xs text-amber-500">unit</p>
                      </div>
                    </div>
                  </div>

                  {/* Truk */}
                  <div className="card-3d bg-gradient-to-br from-rose-50 to-rose-100 p-5 rounded-xl border border-rose-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex flex-col h-full">
                      <div className="mb-auto">
                        <div className="bg-rose-200/50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                          <i className="fas fa-truck text-rose-600 text-lg"></i>
                        </div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-rose-600 mb-1">Truk</p>
                      </div>
                      <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-rose-700">{ferry.capacity_vehicle_truck}</p>
                        <p className="text-xs text-rose-500">unit</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Kapal */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                  Informasi Kapal
                </h2>
              </div>

              <div className="p-6">
                {ferry.description ? (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{ferry.description}</p>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                      <i className="fas fa-file-alt text-gray-400"></i>
                    </div>
                    <p className="text-gray-500">Belum ada deskripsi untuk kapal ini</p>
                    <Link to={`/admin/ferries/${ferry.id}/edit`} className="mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium inline-flex items-center">
                      <i className="fas fa-edit mr-1"></i> Tambahkan deskripsi
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Jadwal Aktif with modern styling */}
            {ferry.schedules && (
              <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <i className="fas fa-calendar-alt text-blue-500 mr-2"></i>
                    Jadwal Aktif
                  </h2>
                  <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
                    {ferry.schedules.length} Jadwal
                  </span>
                </div>

                <div className="p-6">
                  {ferry.schedules.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <i className="fas fa-calendar-times text-3xl text-gray-400"></i>
                      </div>
                      <p className="text-gray-500 mb-4">Tidak ada jadwal aktif untuk kapal ini</p>
                      <Link to="/admin/schedules/create" className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                        <i className="fas fa-plus mr-2"></i> Tambah Jadwal Baru
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Rute</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Waktu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Hari</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {ferry.schedules.map((schedule) => (
                            <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                      <i className="fas fa-route"></i>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{schedule.route?.origin || 'N/A'} - {schedule.route?.destination || 'N/A'}</div>
                                    <div className="text-xs text-gray-500">
                                      {schedule.route?.distance ? `${schedule.route.distance} km` : 'Jarak tidak tercatat'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <div className="flex items-center text-sm text-gray-900">
                                    <i className="fas fa-plane-departure text-emerald-500 mr-2"></i>
                                    {schedule.departure_time ? new Intl.DateTimeFormat('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour24: true,
                                    }).format(new Date(schedule.departure_time)) : 'N/A'}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-900 mt-1">
                                    <i className="fas fa-plane-arrival text-red-500 mr-2"></i>
                                    {schedule.arrival_time ? new Intl.DateTimeFormat('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour24: true,
                                    }).format(new Date(schedule.arrival_time)) : 'N/A'}
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {getDayNames(schedule.days).map((day, idx) => (
                                    <span key={idx} className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700">
                                      {day.substr(0, 3)}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end space-x-2">
                                  <Link to={`/admin/schedules/${schedule.id}`}
                                    className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                                    title="Detail">
                                    <i className="fas fa-eye"></i>
                                  </Link>
                                  <Link to={`/admin/schedules/${schedule.id}/edit`}
                                    className="btn-icon bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded-lg transition-colors"
                                    title="Edit">
                                    <i className="fas fa-edit"></i>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
          <Link to="/admin/ferries" className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
            <i className="fas fa-arrow-left mr-2"></i> Kembali ke Daftar
          </Link>
          <div className="flex space-x-3">
            <Link to={`/admin/ferries/${ferry.id}/edit`} className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm">
              <i className="fas fa-edit mr-2"></i> Edit Kapal
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
            >
              <i className="fas fa-trash mr-2"></i> Hapus
            </button>
          </div>
        </div>
      </div>

      {/* Modern Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-modal-in">
            <div className="p-6">
              <div className="text-center mb-5">
                <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus kapal:</p>
                <div className="bg-gray-50 rounded-lg p-3 mt-3 border border-gray-200">
                  <p className="font-semibold text-lg text-gray-800">{ferry.name}</p>
                  <p className="text-gray-600">{ferry.registration_number}</p>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">
                      Kapal dengan jadwal aktif tidak dapat dihapus. Pastikan tidak ada jadwal terkait untuk melanjutkan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full py-3 px-4 bg-red-500 rounded-lg text-white font-medium hover:bg-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i> Hapus Kapal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for modern animations and transitions */}
      <style jsx>{`
        .card-3d {
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        
        .capacity-card {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        
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
        
        @keyframes modal-in {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-modal-in {
          animation: modal-in 0.3s ease-out forwards;
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

export default FerryShow;