import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import adminRouteService from '../../../services/adminRoute.service';
import api from '../../../services/api';

const RouteShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleCategories, setVehicleCategories] = useState([]);

  useEffect(() => {
    fetchRoute();
    fetchSchedules();
    fetchVehicleCategories();
  }, [id]);

 const fetchVehicleCategories = async () => {
  try {
    const response = await adminRouteService.getVehicleCategories();
    // Tambahkan console.log untuk melihat respons lengkap
    console.log('Vehicle Categories API Response:', response);
    
    if (response.status === 'success') {
      // Tambahkan console.log untuk melihat data yang diambil
      console.log('Vehicle Categories Data:', response.data);
      setVehicleCategories(response.data || []);
    } else {
      console.warn('API berhasil tetapi status bukan success:', response.status);
      setVehicleCategories([]);
    }
  } catch (error) {
    console.error('Error fetching vehicle categories:', error);
    setVehicleCategories([]);
  }
};

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


  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };


  // Get vehicle categories by type
  const getVehicleCategoriesByType = (type) => {
    return vehicleCategories.filter(category => category.vehicle_type === type);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div>
          <p className="text-lg font-medium text-gray-700">Memuat Data Rute</p>
          <p className="text-sm text-gray-500">Mohon tunggu sebentar...</p>
        </div>
      </div>
    </div>
  );

  if (!route) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-8 bg-white rounded-lg shadow-lg text-center max-w-md">
        <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Rute Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-6">Data rute yang Anda cari tidak dapat ditemukan atau telah dihapus.</p>
        <Link to="/admin/routes" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow-md transition duration-200 inline-flex items-center">
          <i className="fas fa-arrow-left mr-2"></i> Kembali ke Daftar Rute
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header Section - Diselaraskan dengan halaman lain */}
      <div className="page-header p-6 text-white relative bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <i className="fas fa-route mr-3 text-blue-200"></i> Detail Rute
            </h1>
            <div className="mt-1 text-blue-100 flex items-center">
              <div className="flex items-center bg-blue-700/30 rounded-full py-1 px-3">
                <i className="fas fa-map-marker-alt text-blue-200"></i>
                <span className="mx-2 font-medium">{route.origin}</span>
                <i className="fas fa-arrow-right text-blue-200"></i>
                <span className="mx-2 font-medium">{route.destination}</span>
                <span className="text-xs bg-blue-700/50 rounded-full px-2 py-0.5 ml-1">{route.route_code}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/admin/routes/${route.id}/edit`}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg flex items-center transition-colors shadow-md">
              <i className="fas fa-edit mr-2"></i> Edit
            </Link>
            <Link to="/admin/routes"
              className="bg-white hover:bg-blue-700 hover:text-white text-blue-700 font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-md">
              <i className="fas fa-arrow-left mr-2"></i> Kembali
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Status Alert - Desain yang ditingkatkan */}
        {route.status !== 'ACTIVE' && (
          <div className={`mb-6 rounded-lg shadow-sm overflow-hidden border ${route.status === 'WEATHER_ISSUE' ? 'border-yellow-200' : 'border-red-200'}`}>
            <div className={`${route.status === 'WEATHER_ISSUE' ? 'bg-yellow-500' : 'bg-red-500'} px-4 py-2 text-white font-medium flex items-center`}>
              {route.status === 'WEATHER_ISSUE' ? (
                <>
                  <i className="fas fa-cloud-rain mr-2"></i> Peringatan Cuaca
                </>
              ) : (
                <>
                  <i className="fas fa-ban mr-2"></i> Rute Tidak Aktif
                </>
              )}
            </div>
            <div className={`${route.status === 'WEATHER_ISSUE' ? 'bg-yellow-50' : 'bg-red-50'} p-4`}>
              <div className="flex">
                <div className="flex-1">
                  <p className="font-medium text-gray-700">
                    {route.status === 'WEATHER_ISSUE'
                      ? 'Rute ini saat ini memiliki masalah cuaca dan beroperasi terbatas.'
                      : 'Rute ini saat ini tidak aktif dan tidak beroperasi.'}
                  </p>
                  {route.status_reason && (
                    <p className="text-sm mt-2 text-gray-600">
                      <span className="font-medium">Alasan:</span> {route.status_reason}
                    </p>
                  )}
                  {(route.status_updated_at || (route.status === 'WEATHER_ISSUE' && route.status_expiry_date)) && (
                    <div className="mt-3 flex flex-col sm:flex-row gap-y-2 gap-x-8 text-sm">
                      {route.status_updated_at && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                          <i className="far fa-clock mr-2 text-gray-500"></i>
                          <span className="font-medium">Diperbarui:</span>
                          <span className="ml-2">{formatDate(route.status_updated_at)}</span>
                        </div>
                      )}
                      {route.status === 'WEATHER_ISSUE' && route.status_expiry_date && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                          <i className="far fa-calendar-alt mr-2 text-gray-500"></i>
                          <span className="font-medium">Berlaku Hingga:</span>
                          <span className="ml-2">{formatDate(route.status_expiry_date)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Route Summary - Desain yang diperbaiki */}
        <div className="flex flex-col md:flex-row gap-6 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
          <div className="md:w-24 flex justify-center">
            <div className="route-icon bg-gradient-to-br from-blue-600 to-blue-800 h-20 w-20 flex items-center justify-center rounded-full text-white text-3xl shadow-lg">
              <i className="fas fa-exchange-alt"></i>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-gray-800">{route.origin} - {route.destination}</h2>
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium flex items-center">
                <i className="fas fa-hashtag text-blue-500 mr-1 text-xs"></i>
                {route.route_code}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6">
              <div className="flex items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="vehicle-icon bg-blue-100 text-blue-600 h-8 w-8 rounded-full flex items-center justify-center">
                  <i className="fas fa-ruler-combined"></i>
                </div>
                <div className="ml-3">
                  <div className="text-xs text-gray-500">Jarak</div>
                  <div className="font-medium">{route.distance ? route.distance + ' KM' : 'Tidak diatur'}</div>
                </div>
              </div>
              <div className="flex items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="vehicle-icon bg-green-100 text-green-600 h-8 w-8 rounded-full flex items-center justify-center">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="ml-3">
                  <div className="text-xs text-gray-500">Durasi</div>
                  <div className="font-medium">{Math.floor(route.duration / 60)}j {route.duration % 60}m</div>
                </div>
              </div>
              <div className="flex items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="vehicle-icon bg-purple-100 text-purple-600 h-8 w-8 rounded-full flex items-center justify-center">
                  <i className="fas fa-tag"></i>
                </div>
                <div className="ml-3">
                  <div className="text-xs text-gray-500">Harga Dasar</div>
                  <div className="font-medium">Rp {formatPrice(route.base_price)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Cards - Layout dan desain yang lebih profesional */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Informasi Rute Card - Desain yang ditingkatkan */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center">
                <i className="fas fa-map-marked-alt mr-3 text-blue-200"></i> Informasi Rute
              </h3>
              <div className="bg-blue-500/30 rounded-full h-8 w-8 flex items-center justify-center">
                <i className="fas fa-route"></i>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-5">
                <div className="flex items-center bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500 shadow-sm transition-all duration-200 hover:shadow">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg mr-3 shadow-sm">
                    <i className="fas fa-hashtag"></i>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-blue-500 uppercase tracking-wider">Kode Rute</div>
                    <div className="font-semibold text-gray-800 mt-1">{route.route_code}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-4 transition-all duration-200 hover:bg-gray-100 border border-gray-200">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-2 shadow-sm">
                        <i className="fas fa-map-marker-alt"></i>
                      </div>
                      <span className="text-sm font-medium text-gray-600">Asal</span>
                    </div>
                    <div className="font-bold text-gray-800 pl-2">{route.origin}</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 transition-all duration-200 hover:bg-gray-100 border border-gray-200">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full mr-2 shadow-sm">
                        <i className="fas fa-map-marker-alt"></i>
                      </div>
                      <span className="text-sm font-medium text-gray-600">Tujuan</span>
                    </div>
                    <div className="font-bold text-gray-800 pl-2">{route.destination}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  <div className="grid grid-cols-2 divide-x divide-gray-200">
                    <div className="p-4 transition-all duration-200 hover:bg-gray-100">
                      <div className="flex items-center mb-1">
                        <div className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full mr-2">
                          <i className="fas fa-ruler text-xs"></i>
                        </div>
                        <span className="text-xs font-medium text-gray-500">Jarak</span>
                      </div>
                      <div className="font-semibold text-gray-800">
                        {route.distance ? route.distance + ' KM' : '-'}
                      </div>
                    </div>

                    <div className="p-4 transition-all duration-200 hover:bg-gray-100">
                      <div className="flex items-center mb-1">
                        <div className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full mr-2">
                          <i className="fas fa-clock text-xs"></i>
                        </div>
                        <span className="text-xs font-medium text-gray-500">Durasi</span>
                      </div>
                      <div className="font-semibold text-gray-800">
                        <span>{Math.floor(route.duration / 60)}j {route.duration % 60}m</span>
                        <span className="text-xs text-gray-500 ml-1">({route.duration} menit)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center mt-4">
                  <div className="text-sm text-gray-600 font-medium mr-3">Status:</div>
                  <div>
                    {route.status === 'ACTIVE' ? (
                      <div className="flex items-center px-4 py-2 rounded-lg bg-green-100 text-green-800 border border-green-200 shadow-sm">
                        <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <i className="fas fa-check-circle mr-2"></i>
                        <span className="font-medium">Aktif</span>
                      </div>
                    ) : route.status === 'WEATHER_ISSUE' ? (
                      <div className="flex items-center px-4 py-2 rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">
                        <i className="fas fa-cloud-rain mr-2"></i>
                        <span className="font-medium">Masalah Cuaca</span>
                      </div>
                    ) : (
                      <div className="flex items-center px-4 py-2 rounded-lg bg-red-100 text-red-800 border border-red-200 shadow-sm">
                        <i className="fas fa-ban mr-2"></i>
                        <span className="font-medium">Tidak Aktif</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Harga Card - Desain yang ditingkatkan */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center">
                <i className="fas fa-money-bill-wave mr-3 text-green-200"></i> Informasi Harga
              </h3>
              <div className="bg-green-500/30 rounded-full h-8 w-8 flex items-center justify-center">
                <i className="fas fa-tag"></i>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between bg-green-50 rounded-lg p-4 border-l-4 border-green-500 shadow-sm mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-lg mr-3 shadow-sm">
                    <i className="fas fa-ticket-alt"></i>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-green-500 uppercase tracking-wider">Harga Dasar</div>
                    <div className="font-bold text-gray-800 mt-1">Penumpang</div>
                  </div>
                </div>
                <div className="font-bold text-lg text-green-700">
                  Rp {formatPrice(route.base_price)}
                </div>
              </div>

              {/* Tampilkan kategori kendaraan jika tersedia */}
              {vehicleCategories.length > 0 ? (
                <div className="space-y-4">
                  {/* Motor */}
                  {getVehicleCategoriesByType('MOTORCYCLE').length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow">
                      <div className="flex items-center justify-between p-4 hover:bg-blue-50">
                        <div className="flex items-center">
                          <div className="w-9 h-9 flex items-center justify-center bg-orange-100 text-orange-600 rounded-lg mr-3">
                            <i className="fas fa-motorcycle"></i>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Motor</div>
                            <div className="text-xs text-gray-500">{getVehicleCategoriesByType('MOTORCYCLE').length} kategori</div>
                          </div>
                        </div>
                        <i className="fas fa-chevron-right text-gray-400"></i>
                      </div>
                      {/* Sub items - motorcycle categories */}
                      <div className="border-t border-gray-100">
                        {getVehicleCategoriesByType('MOTORCYCLE').map(category => (
                          <div key={category.id} className="flex items-center justify-between p-3 pl-16 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                            <div>
                              <div className="text-sm text-gray-700">{category.name}</div>
                              <div className="text-xs text-gray-500">{category.code}</div>
                            </div>
                            <div className="font-bold text-gray-800">
                              Rp {formatPrice(category.base_price)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobil */}
                  {getVehicleCategoriesByType('CAR').length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow">
                      <div className="flex items-center justify-between p-4 hover:bg-indigo-50">
                        <div className="flex items-center">
                          <div className="w-9 h-9 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg mr-3">
                            <i className="fas fa-car"></i>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Mobil</div>
                            <div className="text-xs text-gray-500">{getVehicleCategoriesByType('CAR').length} kategori</div>
                          </div>
                        </div>
                        <i className="fas fa-chevron-right text-gray-400"></i>
                      </div>
                      {/* Sub items - car categories */}
                      <div className="border-t border-gray-100">
                        {getVehicleCategoriesByType('CAR').map(category => (
                          <div key={category.id} className="flex items-center justify-between p-3 pl-16 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                            <div>
                              <div className="text-sm text-gray-700">{category.name}</div>
                              <div className="text-xs text-gray-500">{category.code}</div>
                            </div>
                            <div className="font-bold text-gray-800">
                              Rp {formatPrice(category.base_price)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bus */}
                  {getVehicleCategoriesByType('BUS').length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow">
                      <div className="flex items-center justify-between p-4 hover:bg-purple-50">
                        <div className="flex items-center">
                          <div className="w-9 h-9 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg mr-3">
                            <i className="fas fa-bus"></i>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Bus</div>
                            <div className="text-xs text-gray-500">{getVehicleCategoriesByType('BUS').length} kategori</div>
                          </div>
                        </div>
                        <i className="fas fa-chevron-right text-gray-400"></i>
                      </div>
                      {/* Sub items - bus categories */}
                      <div className="border-t border-gray-100">
                        {getVehicleCategoriesByType('BUS').map(category => (
                          <div key={category.id} className="flex items-center justify-between p-3 pl-16 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                            <div>
                              <div className="text-sm text-gray-700">{category.name}</div>
                              <div className="text-xs text-gray-500">{category.code}</div>
                            </div>
                            <div className="font-bold text-gray-800">
                              Rp {formatPrice(category.base_price)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Truck */}
                  {getVehicleCategoriesByType('TRUCK').length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow">
                      <div className="flex items-center justify-between p-4 hover:bg-yellow-50">
                        <div className="flex items-center">
                          <div className="w-9 h-9 flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-lg mr-3">
                            <i className="fas fa-truck"></i>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Truk</div>
                            <div className="text-xs text-gray-500">{getVehicleCategoriesByType('TRUCK').length} kategori</div>
                          </div>
                        </div>
                        <i className="fas fa-chevron-right text-gray-400"></i>
                      </div>
                      {/* Sub items - truck categories */}
                      <div className="border-t border-gray-100">
                        {getVehicleCategoriesByType('TRUCK').map(category => (
                          <div key={category.id} className="flex items-center justify-between p-3 pl-16 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                            <div>
                              <div className="text-sm text-gray-700">{category.name}</div>
                              <div className="text-xs text-gray-500">{category.code}</div>
                            </div>
                            <div className="font-bold text-gray-800">
                              Rp {formatPrice(category.base_price)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Tampilkan pesan jika vehicle categories tidak tersedia
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-info text-gray-400 text-xl"></i>
                  </div>
                  <p className="text-gray-500">Harga kendaraan ada pada Kategori Kendaraan</p>
                  <p className="text-sm text-gray-400 mt-2">Menambahkan kategori kendaraan dapat dilakukan di Navigasi Kategori Kendaraan</p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Delete Button Section */}
        <div className="mt-10 flex justify-end">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md transition-colors"
          >
            <i className="fas fa-trash mr-2"></i> Hapus Rute
          </button>
        </div>
      </div>

      {/* Delete Modal - Konsisten dengan modals lain */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100">
              <h3 className="text-lg font-bold text-red-700 flex items-center">
                <i className="fas fa-exclamation-triangle mr-2"></i> Konfirmasi Hapus
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                  <i className="fas fa-trash-alt text-red-500 text-xl"></i>
                </div>
                <p className="text-gray-600 mb-1">Apakah Anda yakin ingin menghapus rute:</p>
                <p className="text-xl font-bold text-gray-800 mb-4">
                  {route.origin} <i className="fas fa-arrow-right mx-2 text-sm text-gray-400"></i> {route.destination}
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <i className="fas fa-exclamation-circle text-yellow-400"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Menghapus rute akan menghapus semua jadwal terkait. Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                  <i className="fas fa-times mr-2"></i> Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
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