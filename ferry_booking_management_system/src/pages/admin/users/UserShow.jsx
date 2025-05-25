import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import adminUserService from '../../../services/adminUser.service';

const UserShow = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await adminUserService.getUserDetail(id);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal memuat data pengguna'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await adminUserService.deleteUser(id);
      if (response.status === 'success') {
        setAlert({
          show: true,
          type: 'success',
          message: 'Pengguna berhasil dihapus. Anda akan diarahkan ke halaman daftar pengguna.'
        });
        setTimeout(() => {
          window.location.href = '/admin/users';
        }, 2000);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Terjadi kesalahan saat menghapus pengguna'
      });
    }
    setShowDeleteModal(false);
  };

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    
    try {
      const options = {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      };

      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }

      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending', border: 'border-yellow-200', indicator: 'bg-yellow-500' },
      'CONFIRMED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Konfirmasi', border: 'border-green-200', indicator: 'bg-green-500' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Dibatalkan', border: 'border-red-200', indicator: 'bg-red-500' },
      'COMPLETED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Selesai', border: 'border-blue-200', indicator: 'bg-blue-500' },
      'REFUNDED': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Dikembalikan', border: 'border-gray-200', indicator: 'bg-gray-500' }
    };
    const statusInfo = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status, border: 'border-gray-200', indicator: 'bg-gray-500' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text} border ${statusInfo.border}`}>
        <span className={`w-1.5 h-1.5 ${statusInfo.indicator} rounded-full mr-1.5`}></span>
        {statusInfo.label}
      </span>
    );
  };

  const getVehicleTypeBadge = (type) => {
    const typeMap = {
      'MOTORCYCLE': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Motor', icon: 'fa-motorcycle' },
      'CAR': { bg: 'bg-green-100', text: 'text-green-800', label: 'Mobil', icon: 'fa-car' },
      'BUS': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Bus', icon: 'fa-bus' },
      'TRUCK': { bg: 'bg-red-100', text: 'text-red-800', label: 'Truk', icon: 'fa-truck' }
    };
    const typeInfo = typeMap[type] || { bg: 'bg-gray-100', text: 'text-gray-800', label: type, icon: 'fa-car' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.text}`}>
        <i className={`fas ${typeInfo.icon} mr-1`}></i>
        {typeInfo.label}
      </span>
    );
  };

  const getUserStatusBadge = (user) => {
    if (!user) return null;
    
    const isActive = user.total_bookings > 0 || new Date(user.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
          Aktif
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-1.5"></span>
          Tidak Aktif
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-blue-800 via-blue-600 to-blue-500 p-8 text-white">
          <div className="flex items-start">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-4">
              <i className="fas fa-user text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Detail Pengguna</h1>
              <p className="mt-1 text-blue-100">Informasi lengkap pengguna sistem</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <div className="inline-block relative">
            <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-red-800 via-red-600 to-red-500 p-8 text-white">
          <div className="flex items-start">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-4">
              <i className="fas fa-exclamation-triangle text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Pengguna Tidak Ditemukan</h1>
              <p className="mt-1 text-red-100">Data pengguna yang Anda cari tidak tersedia</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-user-times text-red-500 text-4xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Data Tidak Ditemukan</h3>
          <p className="text-gray-600 mb-6">Pengguna dengan ID tersebut tidak ditemukan dalam sistem</p>
          <Link 
            to="/admin/users"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
            <i className="fas fa-arrow-left mr-2"></i> Kembali ke Daftar Pengguna
          </Link>
        </div>
      </div>
    );
  }

  // Get unique vehicles (remove duplicates by license_plate)
  const uniqueVehicles = user.vehicles ? 
    Array.from(new Map(user.vehicles.map(v => [v.license_plate, v])).values()) : [];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Modern Header with Decorative Background */}
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
                <i className="fas fa-user text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Detail Pengguna</h1>
                <p className="mt-1 text-blue-100">Informasi lengkap pengguna sistem</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Link 
                to={`/admin/users/${user.id}/edit`}
                className="inline-flex items-center px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-amber-400/30 shadow-sm"
              >
                <i className="fas fa-edit mr-2"></i> Edit Pengguna
              </Link>
              <Link 
                to="/admin/users"
                className="inline-flex items-center px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm"
              >
                <i className="fas fa-arrow-left mr-2"></i> Kembali
              </Link>
            </div>
          </div>

          {/* User Profile Header */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                {user.profile_picture ? (
                  <img
                    src={`/storage/${user.profile_picture}`}
                    alt={user.name}
                    className="h-24 w-24 rounded-full object-cover border-4 border-white/30 shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2">
                  {getUserStatusBadge(user)}
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
                <p className="text-blue-100 mb-1">{user.email}</p>
                <p className="text-blue-200 text-sm">
                  <i className="fas fa-calendar-alt mr-1"></i>
                  Member sejak {formatDate(user.created_at)}
                </p>
                <p className="text-blue-200 text-sm mt-1">
                  <i className="fas fa-hashtag mr-1"></i>
                  ID Pengguna: {user.id}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-2xl font-bold text-white">
                    {user.bookings?.length || 0}
                  </div>
                  <div className="text-xs text-blue-100">Total Booking</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-2xl font-bold text-emerald-300">
                    {user.bookings?.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status)).length || 0}
                  </div>
                  <div className="text-xs text-blue-100">Aktif</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-2xl font-bold text-blue-300">
                    {user.bookings?.filter(b => b.status === 'COMPLETED').length || 0}
                  </div>
                  <div className="text-xs text-blue-100">Selesai</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-2xl font-bold text-amber-300">
                    {uniqueVehicles.length}
                  </div>
                  <div className="text-xs text-blue-100">Kendaraan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Alert Messages */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Profile Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                  <i className="fas fa-id-card text-blue-500 mr-2"></i>
                  Informasi Personal
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Nama Lengkap</span>
                    <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Telepon</span>
                    <span className="text-sm text-gray-900">{user.phone || 'Tidak ada'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Jenis Kelamin</span>
                    <span className="text-sm text-gray-900">
                      {user.gender === 'MALE' ? 'Laki-laki' : 
                       user.gender === 'FEMALE' ? 'Perempuan' : 'Tidak ada'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Tanggal Lahir</span>
                    <span className="text-sm text-gray-900">
                      {user.date_of_birthday ? formatDate(user.date_of_birthday) : 'Tidak ada'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">Alamat</span>
                    <span className="text-sm text-gray-900 text-right max-w-xs">
                      {user.address || 'Tidak ada'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Identity Information Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
                <h2 className="text-lg font-semibold text-purple-800 flex items-center">
                  <i className="fas fa-address-card text-purple-500 mr-2"></i>
                  Identitas
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Jenis Identitas</span>
                    <span className="text-sm text-gray-900">{user.id_type || 'Tidak ada'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Nomor Identitas</span>
                    <span className="text-sm text-gray-900 font-mono">
                      {user.id_number || 'Tidak ada'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Activity Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
                <h2 className="text-lg font-semibold text-emerald-800 flex items-center">
                  <i className="fas fa-chart-line text-emerald-500 mr-2"></i>
                  Aktivitas Akun
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{user.bookings?.length || 0}</div>
                    <div className="text-xs text-blue-600 mt-1">Total Booking</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {user.bookings?.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status)).length || 0}
                    </div>
                    <div className="text-xs text-green-600 mt-1">Booking Aktif</div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {user.bookings?.filter(b => b.status === 'COMPLETED').length || 0}
                    </div>
                    <div className="text-xs text-indigo-600 mt-1">Selesai</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {user.bookings?.filter(b => b.status === 'CANCELLED').length || 0}
                    </div>
                    <div className="text-xs text-red-600 mt-1">Dibatalkan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Bookings and Vehicles */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking History */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-ticket-alt text-blue-500 mr-2"></i>
                  Riwayat Booking ({user.bookings?.length || 0})
                </h2>
              </div>
              <div className="p-6">
                {!user.bookings || user.bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-ticket-alt text-gray-400 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum Ada Booking</h3>
                    <p className="text-gray-600">Pengguna ini belum pernah melakukan booking</p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Booking</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penumpang</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {user.bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                {booking.booking_code}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div>
                                  <div className="font-medium">
                                    {booking.schedule?.route?.origin} - {booking.schedule?.route?.destination}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {booking.schedule?.ship?.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div>
                                  <div className="font-medium">
                                    {formatDate(booking.booking_date)}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {formatDate(booking.booking_date, true)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
                                  <i className="fas fa-users mr-1"></i>
                                  {booking.passenger_count}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                {formatCurrency(booking.total_amount)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {getStatusBadge(booking.status)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <Link
                                  to={`/admin/bookings/${booking.id}`}
                                  className="inline-flex items-center px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md shadow-sm transition-colors text-xs"
                                >
                                  <i className="fas fa-eye mr-1"></i>
                                  Detail
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Registered Vehicles */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-car text-green-500 mr-2"></i>
                  Kendaraan Terdaftar ({uniqueVehicles.length})
                </h2>
              </div>
              <div className="p-6">
                {uniqueVehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-car text-gray-400 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum Ada Kendaraan</h3>
                    <p className="text-gray-600">Pengguna ini belum mendaftarkan kendaraan</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {uniqueVehicles.map((vehicle) => (
                      <div key={vehicle.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                              <i className={`fas ${
                                vehicle.type === 'MOTORCYCLE' ? 'fa-motorcycle' :
                                vehicle.type === 'CAR' ? 'fa-car' :
                                vehicle.type === 'BUS' ? 'fa-bus' :
                                vehicle.type === 'TRUCK' ? 'fa-truck' : 'fa-car'
                              } text-blue-600`}></i>
                            </div>
                            <div>
                              <div className="font-bold text-lg text-gray-900">{vehicle.license_plate}</div>
                              <div className="text-sm text-gray-500">
                                {vehicle.brand} {vehicle.model}
                              </div>
                            </div>
                          </div>
                          <div>
                            {getVehicleTypeBadge(vehicle.type)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Merk:</span>
                            <div className="font-medium text-gray-900">{vehicle.brand || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Model:</span>
                            <div className="font-medium text-gray-900">{vehicle.model || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <i className="fas fa-cogs text-gray-500 mr-2"></i>
              Tindakan
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                <p>Kelola pengguna dengan berbagai tindakan yang tersedia.</p>
              </div>
              
              <div className="flex space-x-3">
                <Link
                  to={`/admin/users/${user.id}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Pengguna
                </Link>
                
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Hapus Pengguna
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-modal-in">
            <div className="p-6">
              <div className="text-center mb-5">
                <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus pengguna:</p>
                <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
                  <div className="flex items-center justify-center mb-2">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-lg font-bold text-blue-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-gray-800">{user.name}</p>
                      <p className="text-gray-600 text-sm">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">
                      <strong>Peringatan:</strong> Menghapus pengguna akan menghapus semua data terkait termasuk 
                      {user.bookings?.length || 0} booking dan {uniqueVehicles.length} kendaraan. 
                      Tindakan ini tidak dapat dibatalkan.
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
                  <i className="fas fa-trash mr-2"></i> Hapus Pengguna
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style>{`
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

        /* Enhanced hover effects */
        .bg-white:hover {
          filter: brightness(1.02);
        }

        /* Button hover animations */
        button:not(:disabled):hover {
          filter: brightness(1.05);
        }

        /* Table row hover effects */
        tbody tr:hover {
          background-color: rgba(59, 130, 246, 0.05);
        }
      `}</style>
    </div>
  );
};

export default UserShow;