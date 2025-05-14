import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import adminUserService from '../../../services/adminUser.service';

const UserShow = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await adminUserService.get(`/api/admin-panel/users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'CONFIRMED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Konfirmasi' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Dibatalkan' },
      'COMPLETED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Selesai' },
      'REFUNDED': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Dikembalikan' }
    };
    const statusInfo = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getVehicleTypeBadge = (type) => {
    const typeMap = {
      'MOTORCYCLE': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Motor' },
      'CAR': { bg: 'bg-green-100', text: 'text-green-800', label: 'Mobil' },
      'BUS': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Bus' },
      'TRUCK': { bg: 'bg-red-100', text: 'text-red-800', label: 'Truk' }
    };
    const typeInfo = typeMap[type] || { bg: 'bg-gray-100', text: 'text-gray-800', label: type };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.bg} ${typeInfo.text}`}>
        {typeInfo.label}
      </span>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">User not found</div>;
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Detail Pengguna</h1>
        <div className="mt-3 md:mt-0 flex space-x-2">
          <Link
            to={`/admin/users/${user.id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <h2 className="text-lg font-semibold text-blue-600">Profil Pengguna</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                {user.profile_picture ? (
                  <img
                    src={`/storage/${user.profile_picture}`}
                    alt={user.name}
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h4 className="mt-4 text-xl font-semibold text-gray-800">{user.name}</h4>
                <p className="text-sm text-gray-500">
                  Member sejak {formatDate(user.created_at)}
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 items-center">
                  <span className="col-span-1 text-sm font-medium text-gray-500">Email:</span>
                  <span className="col-span-2 text-sm text-gray-900">{user.email}</span>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <span className="col-span-1 text-sm font-medium text-gray-500">Telepon:</span>
                  <span className="col-span-2 text-sm text-gray-900">{user.phone || 'Tidak ada'}</span>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <span className="col-span-1 text-sm font-medium text-gray-500">Alamat:</span>
                  <span className="col-span-2 text-sm text-gray-900">{user.address || 'Tidak ada'}</span>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <span className="col-span-1 text-sm font-medium text-gray-500">Identitas:</span>
                  <span className="col-span-2 text-sm text-gray-900">
                    {user.id_number && user.id_type
                      ? `${user.id_type}: ${user.id_number}`
                      : 'Tidak ada'}
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <span className="col-span-1 text-sm font-medium text-gray-500">Tanggal Lahir:</span>
                  <span className="col-span-2 text-sm text-gray-900">
                    {user.date_of_birthday ? formatDate(user.date_of_birthday) : 'Tidak ada'}
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <span className="col-span-1 text-sm font-medium text-gray-500">Jenis Kelamin:</span>
                  <span className="col-span-2 text-sm text-gray-900">
                    {user.gender === 'MALE' ? 'Laki-laki' : user.gender === 'FEMALE' ? 'Perempuan' : 'Tidak ada'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Stats Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <h2 className="text-lg font-semibold text-blue-600">Statistik Pengguna</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-blue-500 p-4">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="text-xs font-bold text-blue-600 uppercase mb-1">Total Booking</div>
                      <div className="text-xl font-bold text-gray-800">{user.bookings?.length || 0}</div>
                    </div>
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-green-500 p-4">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="text-xs font-bold text-green-600 uppercase mb-1">Booking Aktif</div>
                      <div className="text-xl font-bold text-gray-800">
                        {user.bookings?.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status)).length || 0}
                      </div>
                    </div>
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-indigo-500 p-4">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="text-xs font-bold text-indigo-600 uppercase mb-1">Booking Selesai</div>
                      <div className="text-xl font-bold text-gray-800">
                        {user.bookings?.filter(b => b.status === 'COMPLETED').length || 0}
                      </div>
                    </div>
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-red-500 p-4">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="text-xs font-bold text-red-600 uppercase mb-1">Booking Dibatalkan</div>
                      <div className="text-xl font-bold text-gray-800">
                        {user.bookings?.filter(b => b.status === 'CANCELLED').length || 0}
                      </div>
                    </div>
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* User Bookings */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <h2 className="text-lg font-semibold text-blue-600">Riwayat Booking</h2>
            </div>
            <div className="p-6">
              {!user.bookings || user.bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <p className="text-gray-500">Pengguna ini belum memiliki booking</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Booking</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penumpang</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {user.bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {booking.booking_code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.schedule?.route?.origin} - {booking.schedule?.route?.destination}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(booking.booking_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.passenger_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(booking.total_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/admin/bookings/${booking.id}`}
                              className="inline-flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md shadow-sm transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Detail
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* User Vehicles */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <h2 className="text-lg font-semibold text-blue-600">Kendaraan Terdaftar</h2>
            </div>
            <div className="p-6">
              {!user.vehicles || user.vehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-gray-500">Pengguna ini belum mendaftarkan kendaraan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plat Nomor</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merk</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.from(new Map(user.vehicles.map(v => [v.license_plate, v])).values()).map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getVehicleTypeBadge(vehicle.type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {vehicle.license_plate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {vehicle.brand || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {vehicle.model || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserShow;