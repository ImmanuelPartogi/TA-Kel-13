import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { routeService } from '../../../services/api';
import { toast } from 'react-toastify';

const RouteShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchRouteData();
  }, [id]);

  const fetchRouteData = async () => {
    setLoading(true);
    try {
      const response = await routeService.getRoute(id);
      setRoute(response.data.data);
      if (response.data.schedules) {
        setSchedules(response.data.schedules);
      }
    } catch (error) {
      console.error('Error fetching route data:', error);
      toast.error('Gagal memuat data rute');
      navigate('/admin/routes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await routeService.deleteRoute(id);
      toast.success('Rute berhasil dihapus');
      navigate('/admin/routes');
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error('Gagal menghapus rute');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="fas fa-exclamation-circle text-red-500 mt-1"></i>
          </div>
          <div className="ml-3">
            <p>Data rute tidak ditemukan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-500 p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <i className="fas fa-route mr-3"></i> Detail Rute
            </h1>
            <p className="text-blue-100 mt-1">
              <i className="fas fa-map-marker-alt mr-1"></i> {route.origin} <i className="fas fa-arrow-right mx-2"></i>{' '}
              {route.destination}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/admin/routes/${id}/edit`}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg flex items-center transition duration-200 shadow-sm transform hover:-translate-y-1"
            >
              <i className="fas fa-edit mr-2"></i> Edit
            </Link>
            <Link
              to="/admin/routes"
              className="bg-white text-blue-700 hover:bg-blue-50 py-2 px-4 rounded-lg transition duration-200 flex items-center shadow-sm transform hover:-translate-y-1"
            >
              <i className="fas fa-arrow-left mr-2"></i> Kembali
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Status Alert untuk rute dengan masalah cuaca atau non-aktif */}
        {route.status !== 'ACTIVE' && (
          <div
            className={`mb-6 ${
              route.status === 'WEATHER_ISSUE'
                ? 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700'
                : 'bg-red-100 border-l-4 border-red-500 text-red-700'
            } p-4 rounded-r shadow-sm`}
            role="alert"
          >
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
                  {route.status === 'WEATHER_ISSUE'
                    ? 'Rute ini saat ini memiliki masalah cuaca.'
                    : 'Rute ini saat ini tidak aktif.'}
                </p>
                {route.status_reason && <p className="text-sm mt-1">Alasan: {route.status_reason}</p>}

                {(route.status_updated_at || (route.status === 'WEATHER_ISSUE' && route.status_expiry_date)) && (
                  <div className="mt-2 flex flex-wrap gap-x-8 text-sm">
                    {route.status_updated_at && (
                      <div>
                        <span className="font-medium">Diperbarui Pada:</span>
                        {' '}{new Date(route.status_updated_at).toLocaleString('id-ID')}
                      </div>
                    )}

                    {route.status === 'WEATHER_ISSUE' && route.status_expiry_date && (
                      <div>
                        <span className="font-medium">Berlaku Hingga:</span>
                        {' '}{new Date(route.status_expiry_date).toLocaleDateString('id-ID')}
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-12 w-12 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
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
                <div className="bg-blue-100 text-blue-600 h-6 w-6 rounded-full flex items-center justify-center mr-2">
                  <i className="fas fa-ruler-combined"></i>
                </div>
                <span className="text-gray-700">{route.distance ? `${route.distance} KM` : 'Jarak tidak diatur'}</span>
              </div>
              <div className="flex items-center">
                <div className="bg-green-100 text-green-600 h-6 w-6 rounded-full flex items-center justify-center mr-2">
                  <i className="fas fa-clock"></i>
                </div>
                <span className="text-gray-700">
                  {route.duration} menit ({Math.floor(route.duration / 60)}j {route.duration % 60}m)
                </span>
              </div>
              <div className="flex items-center">
                <div className="bg-purple-100 text-purple-600 h-6 w-6 rounded-full flex items-center justify-center mr-2">
                  <i className="fas fa-tag"></i>
                </div>
                <span className="font-medium text-gray-700">Rp {formatPrice(route.base_price)}</span>
              </div>
            </div>
            <div className="mt-3">
              {route.status === 'ACTIVE' && (
                <span className="relative px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200 pl-5">
                  <span className="absolute w-2 h-2 rounded-full bg-green-500 left-2 top-1/2 transform -translate-y-1/2 animate-pulse"></span>
                  Aktif
                </span>
              )}
              {route.status === 'WEATHER_ISSUE' && (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                  <i className="fas fa-cloud-rain mr-1"></i> Masalah Cuaca
                </span>
              )}
              {route.status === 'INACTIVE' && (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                  <i className="fas fa-ban mr-1"></i> Tidak Aktif
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-5 rounded-lg shadow-sm hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-transparent">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <i className="fas fa-map-marked-alt mr-2 text-blue-500"></i> Informasi Rute
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Kode Rute:</div>
                <div className="font-medium text-gray-800">{route.route_code}</div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Pelabuhan Asal:</div>
                <div className="font-medium text-gray-800 flex items-center">
                  <i className="fas fa-map-marker-alt text-blue-500 mr-2"></i>
                  {route.origin}
                </div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Pelabuhan Tujuan:</div>
                <div className="font-medium text-gray-800 flex items-center">
                  <i className="fas fa-map-marker-alt text-red-500 mr-2"></i>
                  {route.destination}
                </div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Jarak:</div>
                <div className="font-medium text-gray-800">{route.distance ? `${route.distance} KM` : '-'}</div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Durasi:</div>
                <div className="font-medium text-gray-800">{route.duration} menit</div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Status:</div>
                <div>
                  {route.status === 'ACTIVE' && (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      <i className="fas fa-check-circle mr-1"></i> Aktif
                    </span>
                  )}
                  {route.status === 'WEATHER_ISSUE' && (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      <i className="fas fa-cloud-rain mr-1"></i> Masalah Cuaca
                    </span>
                  )}
                  {route.status === 'INACTIVE' && (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      <i className="fas fa-ban mr-1"></i> Tidak Aktif
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg shadow-sm hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-transparent">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <i className="fas fa-money-bill-wave mr-2 text-green-500"></i> Informasi Harga
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Harga Dasar:</div>
                <div className="font-medium text-gray-800">Rp {formatPrice(route.base_price)}</div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-motorcycle text-gray-400 mr-2"></i> Harga Motor:
                </div>
                <div className="font-medium text-gray-800">Rp {formatPrice(route.motorcycle_price)}</div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-car text-gray-400 mr-2"></i> Harga Mobil:
                </div>
                <div className="font-medium text-gray-800">Rp {formatPrice(route.car_price)}</div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-bus text-gray-400 mr-2"></i> Harga Bus:
                </div>
                <div className="font-medium text-gray-800">Rp {formatPrice(route.bus_price)}</div>
              </div>
              <div className="border-b border-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-truck text-gray-400 mr-2"></i> Harga Truk:
                </div>
                <div className="font-medium text-gray-800">Rp {formatPrice(route.truck_price)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section untuk jadwal, jika ada */}
        {schedules && schedules.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <i className="fas fa-ship mr-2 text-blue-500"></i> Jadwal Keberangkatan
              </h3>
              <Link
                to={`/admin/schedules/create?route_id=${route.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-300 flex items-center text-sm shadow-sm"
              >
                <i className="fas fa-plus mr-2"></i> Tambah Jadwal Baru
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kapal
                      </th>
                      <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hari
                      </th>
                      <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu Keberangkatan
                      </th>
                      <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu Kedatangan
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
                    {schedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50 transition-all duration-200">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-600">
                              <i className="fas fa-ship"></i>
                            </div>
                            {schedule.ferry.name}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {schedule.days.split(',').map((day) => {
                            const dayMap = {
                              '1': 'Sen',
                              '2': 'Sel',
                              '3': 'Rab',
                              '4': 'Kam',
                              '5': 'Jum',
                              '6': 'Sab',
                              '7': 'Min',
                            };
                            return (
                              <span key={day} className="inline-block px-1 py-0.5 bg-blue-50 text-blue-700 rounded mr-1">
                                {dayMap[day]}
                              </span>
                            );
                          })}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-700">
                          <div className="flex items-center">
                            <i className="far fa-clock text-blue-500 mr-2"></i>
                            {new Date(`2000-01-01T${schedule.departure_time}`).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-700">
                          <div className="flex items-center">
                            <i className="far fa-clock text-green-500 mr-2"></i>
                            {new Date(`2000-01-01T${schedule.arrival_time}`).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {schedule.status === 'ACTIVE' && (
                            <span className="relative px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200 pl-5">
                              <span className="absolute w-2 h-2 rounded-full bg-green-500 left-2 top-1/2 transform -translate-y-1/2 animate-pulse"></span>
                              Aktif
                            </span>
                          )}
                          {schedule.status === 'DELAYED' && (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                              <i className="fas fa-clock mr-1"></i> Tertunda
                              {route.status === 'WEATHER_ISSUE' && ' (Cuaca)'}
                            </span>
                          )}
                          {schedule.status === 'FULL' && (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              <i className="fas fa-users mr-1"></i> Penuh
                            </span>
                          )}
                          {schedule.status === 'CANCELLED' && (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                              <i className="fas fa-ban mr-1"></i> Dibatalkan
                              {route.status === 'INACTIVE' && ' (Rute)'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/admin/schedules/${schedule.id}`}
                              className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-lg transition-colors transform hover:scale-110"
                              title="Detail"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>
                            <Link
                              to={`/admin/schedules/${schedule.id}/edit`}
                              className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 p-2 rounded-lg transition-colors transform hover:scale-110"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Delete Route Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-colors"
          >
            <i className="fas fa-trash mr-2"></i> Hapus Rute
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
              <p className="text-gray-500">Apakah Anda yakin ingin menghapus rute:</p>
              <p className="font-semibold text-gray-800 mt-2 mb-4">
                {route.origin} - {route.destination}
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
    </div>
  );
};

export default RouteShow;