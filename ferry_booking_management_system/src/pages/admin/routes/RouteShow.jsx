import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import adminRouteService from '../../../services/adminRoute.service';
import api from '../../../services/api';

const RouteShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchRoute();
    fetchSchedules();
  }, [id]);

  const fetchRoute = async () => {
    try {
      const response = await adminRouteService.getRouteDetail(id);
      // Perbaiki struktur response
      if (response.status === 'success' && response.data) {
        setRoute(response.data);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      // Gunakan api langsung untuk consistency
      const response = await api.get('/admin-panel/schedules', {
        params: { route_id: id }
      });
      
      // Perbaiki struktur response untuk pagination
      if (response.data.status === 'success') {
        setSchedules(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await adminRouteService.deleteRoute(id);
      navigate('/admin/routes');
    } catch (error) {
      console.error('Error deleting route:', error.message);
      alert('Error: Rute tidak dapat dihapus karena digunakan dalam jadwal');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    try {
      // Handle jika timeString sudah termasuk tanggal
      if (timeString.includes('T')) {
        return new Date(timeString).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      // Handle jika hanya waktu (HH:mm:ss)
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Failed to parse time:', error);
      return timeString;
    }    
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  const getDayNames = (days) => {
    if (!days) return [];
    const dayNames = {
      '1': 'Sen',
      '2': 'Sel', 
      '3': 'Rab',
      '4': 'Kam',
      '5': 'Jum',
      '6': 'Sab',
      '7': 'Min'
    };
    const dayArray = typeof days === 'string' ? days.split(',') : [days];
    return dayArray.map(day => dayNames[day] || day);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg text-gray-600">Loading...</div>
    </div>
  );

  if (!route) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg text-gray-600">Route not found</div>
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="header-gradient p-6 text-white bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <i className="fas fa-route mr-3"></i> Detail Rute
            </h1>
            <p className="text-blue-100 mt-1">
              <i className="fas fa-map-marker-alt mr-1"></i> {route.origin} <i className="fas fa-arrow-right mx-2"></i> {route.destination}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/admin/routes/${route.id}/edit`}
              className="action-button bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg flex items-center transition duration-200 shadow-sm">
              <i className="fas fa-edit mr-2"></i> Edit
            </Link>
            <Link to="/admin/routes"
              className="action-button bg-white text-blue-700 hover:bg-blue-50 py-2 px-4 rounded-lg transition duration-200 flex items-center shadow-sm">
              <i className="fas fa-arrow-left mr-2"></i> Kembali
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Status Alert */}
        {route.status !== 'ACTIVE' && (
          <div className={`mb-6 ${route.status === 'WEATHER_ISSUE' ? 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700' : 'bg-red-100 border-l-4 border-red-500 text-red-700'} p-4 rounded-r shadow-sm`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {route.status === 'WEATHER_ISSUE' ? (
                  <i className="fas fa-cloud-rain text-yellow-500 text-lg"></i>
                ) : (
                  <i className="fas fa-ban text-red-500 text-lg"></i>
                )}
              </div>
              <div className="ml-3">
                <p className="font-medium">
                  {route.status === 'WEATHER_ISSUE' ? 'Rute ini saat ini memiliki masalah cuaca.' : 'Rute ini saat ini tidak aktif.'}
                </p>
                {route.status_reason && (
                  <p className="text-sm mt-1">Alasan: {route.status_reason}</p>
                )}
                {(route.status_updated_at || (route.status === 'WEATHER_ISSUE' && route.status_expiry_date)) && (
                  <div className="mt-2 flex flex-wrap gap-x-8 text-sm">
                    {route.status_updated_at && (
                      <div>
                        <span className="font-medium">Diperbarui Pada:</span> {formatDate(route.status_updated_at)}
                      </div>
                    )}
                    {route.status === 'WEATHER_ISSUE' && route.status_expiry_date && (
                      <div>
                        <span className="font-medium">Berlaku Hingga:</span> {formatDate(route.status_expiry_date)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Route Summary */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="md:w-32 flex justify-center">
            <div className="route-icon bg-gradient-to-br from-blue-600 to-blue-800 h-16 w-16 flex items-center justify-center rounded-full text-white text-2xl shadow-lg">
              <i className="fas fa-exchange-alt"></i>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-800">{route.origin} - {route.destination}</h2>
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                {route.route_code}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-6">
              <div className="flex items-center">
                <div className="vehicle-icon bg-blue-100 text-blue-600 h-6 w-6 rounded-full flex items-center justify-center">
                  <i className="fas fa-ruler-combined"></i>
                </div>
                <span className="text-gray-700 ml-2">{route.distance ? route.distance + ' KM' : 'Jarak tidak diatur'}</span>
              </div>
              <div className="flex items-center">
                <div className="vehicle-icon bg-green-100 text-green-600 h-6 w-6 rounded-full flex items-center justify-center">
                  <i className="fas fa-clock"></i>
                </div>
                <span className="text-gray-700 ml-2">{route.duration} menit ({Math.floor(route.duration / 60)}j {route.duration % 60}m)</span>
              </div>
              <div className="flex items-center">
                <div className="vehicle-icon bg-purple-100 text-purple-600 h-6 w-6 rounded-full flex items-center justify-center">
                  <i className="fas fa-tag"></i>
                </div>
                <span className="font-medium text-gray-700 ml-2">Rp {formatPrice(route.base_price)}</span>
              </div>
            </div>
            <div className="mt-3">
              {route.status === 'ACTIVE' ? (
                <span className="schedule-badge active px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                  <i className="fas fa-check-circle ml-1 mr-1"></i> Aktif
                </span>
              ) : route.status === 'WEATHER_ISSUE' ? (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                  <i className="fas fa-cloud-rain mr-1"></i> Masalah Cuaca
                </span>
              ) : (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                  <i className="fas fa-ban mr-1"></i> Tidak Aktif
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="detail-card bg-gray-50 p-5 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <i className="fas fa-map-marked-alt mr-2 text-blue-500"></i> Informasi Rute
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Kode Rute:</div>
                <div className="font-medium text-gray-800">{route.route_code}</div>
              </div>
              <div className="price-label"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Pelabuhan Asal:</div>
                <div className="font-medium text-gray-800 flex items-center">
                  <i className="fas fa-map-marker-alt text-blue-500 mr-2"></i>
                  {route.origin}
                </div>
              </div>
              <div className="price-label"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Pelabuhan Tujuan:</div>
                <div className="font-medium text-gray-800 flex items-center">
                  <i className="fas fa-map-marker-alt text-red-500 mr-2"></i>
                  {route.destination}
                </div>
              </div>
              <div className="price-label"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Jarak:</div>
                <div className="font-medium text-gray-800">{route.distance ? route.distance + ' KM' : '-'}</div>
              </div>
              <div className="price-label"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Durasi:</div>
                <div className="font-medium text-gray-800">{route.duration} menit</div>
              </div>
              <div className="price-label"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Status:</div>
                <div>
                  {route.status === 'ACTIVE' ? (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      <i className="fas fa-check-circle mr-1"></i> Aktif
                    </span>
                  ) : route.status === 'WEATHER_ISSUE' ? (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      <i className="fas fa-cloud-rain mr-1"></i> Masalah Cuaca
                    </span>
                  ) : (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      <i className="fas fa-ban mr-1"></i> Tidak Aktif
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card bg-gray-50 p-5 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <i className="fas fa-money-bill-wave mr-2 text-green-500"></i> Informasi Harga
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Harga Dasar:</div>
                <div className="font-medium text-gray-800">Rp {formatPrice(route.base_price)}</div>
              </div>
              <div className="price-label"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-motorcycle text-gray-400 mr-2"></i> Harga Motor:
                </div>
                <div className="font-medium text-gray-800">Rp {formatPrice(route.motorcycle_price)}</div>
              </div>
              <div className="price-label"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-car text-gray-400 mr-2"></i> Harga Mobil:
                </div>
                <div className="font-medium text-gray-800">Rp {formatPrice(route.car_price)}</div>
              </div>
              <div className="price-label"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-bus text-gray-400 mr-2"></i> Harga Bus:
                </div>
                <div className="font-medium text-gray-800">Rp {formatPrice(route.bus_price)}</div>
              </div>
              <div className="price-label"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-truck text-gray-400 mr-2"></i> Harga Truk:
                </div>
                <div className="font-medium text-gray-800">Rp {formatPrice(route.truck_price)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedules Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <i className="fas fa-ship mr-2 text-blue-500"></i> Jadwal Keberangkatan
            </h3>
            <Link to={`/admin/schedules/create?route_id=${route.id}`} 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-300 flex items-center text-sm shadow-sm">
              <i className="fas fa-plus mr-2"></i> Tambah Jadwal Baru
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 table-header">
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapal</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Keberangkatan</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Kedatangan</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules.length > 0 ? schedules.map(schedule => (
                    <tr key={schedule.id} className="schedule-row">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-600">
                            <i className="fas fa-ship"></i>
                          </div>
                          {schedule.ferry?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {getDayNames(schedule.days).map((day, index) => (
                          <span key={index} className="px-1 py-0.5 bg-blue-50 text-blue-700 rounded mr-1">
                            {day}
                          </span>
                        ))}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-700">
                        <div className="flex items-center">
                          <i className="far fa-clock text-blue-500 mr-2"></i>
                          {formatTime(schedule.departure_time)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-700">
                        <div className="flex items-center">
                          <i className="far fa-clock text-green-500 mr-2"></i>
                          {formatTime(schedule.arrival_time)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {schedule.status === 'ACTIVE' ? (
                          <span className="schedule-badge active px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                            <i className="fas fa-check-circle ml-1 mr-1"></i> Aktif
                          </span>
                        ) : schedule.status === 'DELAYED' ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <i className="fas fa-clock mr-1"></i> Tertunda
                            {route.status === 'WEATHER_ISSUE' && ' (Cuaca)'}
                          </span>
                        ) : schedule.status === 'FULL' ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            <i className="fas fa-users mr-1"></i> Penuh
                          </span>
                        ) : (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                            <i className="fas fa-ban mr-1"></i> Dibatalkan
                            {route.status === 'INACTIVE' && ' (Rute)'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Link to={`/admin/schedules/${schedule.id}`}
                            className="action-button text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-lg transition-colors"
                            title="Detail">
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link to={`/admin/schedules/${schedule.id}/edit`}
                            className="action-button text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 p-2 rounded-lg transition-colors"
                            title="Edit">
                            <i className="fas fa-edit"></i>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="py-6 px-4 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="text-gray-300 mb-4">
                            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                          </div>
                          <p className="text-lg font-medium">Tidak ada jadwal keberangkatan</p>
                          <p className="text-sm text-gray-400 mb-4">Belum ada jadwal yang ditambahkan untuk rute ini</p>
                          <Link to={`/admin/schedules/create?route_id=${route.id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm">
                            <i className="fas fa-plus mr-2"></i> Tambah Jadwal Baru
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

        {/* Delete Button */}
        <div className="mt-8 flex justify-end">
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-colors"
          >
            <i className="fas fa-trash mr-2"></i> Hapus Rute
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Konfirmasi Hapus</h3>
                <p className="text-gray-500">Apakah Anda yakin ingin menghapus rute:</p>
                <p className="font-semibold text-gray-800 mt-2 mb-4">
                  {route.origin} - {route.destination}
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-times mr-2"></i> Batal
                </button>
                <button 
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700">
                  <i className="fas fa-trash mr-2"></i> Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteShow;