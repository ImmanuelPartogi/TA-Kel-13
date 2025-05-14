import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import adminRouteService from '../../../services/adminRoute.service';

const RouteList = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
    per_page: 10
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVehiclePriceModal, setShowVehiclePriceModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [vehiclePrices, setVehiclePrices] = useState({});

  // Get filters from URL
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const page = searchParams.get('page') || 1;

  useEffect(() => {
    fetchRoutes();
  }, [searchParams]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await adminRouteService.getRoutes({
        search,
        status,
        page
      });
      
      // // Debug: Lihat struktur response
      // console.log('Response:', response);
      // console.log('Response data:', response.data);
      
      setRoutes(response.data.data || []);
      setPagination({
        current_page: response.data.current_page,
        total: response.data.total,
        last_page: response.data.last_page,
        per_page: response.data.per_page
      });
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    searchParams.set('search', formData.get('search'));
    searchParams.set('status', formData.get('status'));
    setSearchParams(searchParams);
  };

  const resetFilters = () => {
    setSearchParams({});
  };

  const handleDelete = async () => {
    if (!selectedRoute) return;

    try {
      // Menggunakan deleteRoute dengan hanya ID
      await adminRouteService.deleteRoute(selectedRoute.id);
      fetchRoutes();
      setShowDeleteModal(false);
      setSelectedRoute(null);
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  };

  const showVehiclePriceDetails = (route) => {
    setVehiclePrices({
      motorcycle: route.motorcycle_price,
      car: route.car_price,
      bus: route.bus_price,
      truck: route.truck_price
    });
    setShowVehiclePriceModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  const getFirstItem = () => ((pagination.current_page - 1) * pagination.per_page) + 1;

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="page-header p-6 text-white relative bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <i className="fas fa-route mr-3 text-blue-200"></i> Manajemen Rute
            </h1>
            <p className="mt-1 text-blue-100">Kelola semua rute pelayaran dalam sistem</p>
          </div>
          <div>
            <Link to="/admin/routes/create"
              className="bg-white hover:bg-blue-700 hover:text-white text-blue-700 font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-md">
              <i className="fas fa-plus mr-2"></i> Tambah Rute Baru
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filter and Search */}
        <div className="mb-6 filter-container p-5 rounded-lg border border-gray-200 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
            <div className="flex-grow">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Cari Rute</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input
                  type="text"
                  id="search"
                  name="search"
                  defaultValue={search}
                  placeholder="Cari asal atau tujuan..."
                  className="search-input pl-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm transition-all duration-200"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                name="status"
                defaultValue={status}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm">
                <option value="">Semua Status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Tidak Aktif</option>
                <option value="WEATHER_ISSUE">Masalah Cuaca</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg h-10 font-medium transition-colors shadow-sm">
                <i className="fas fa-filter mr-1"></i> Filter
              </button>

              {(search || status) && (
                <button onClick={resetFilters} type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded-lg h-10 flex items-center transition-colors shadow-sm">
                  <i className="fas fa-times mr-1"></i> Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm text-gray-600">
            Menampilkan <span className="font-medium">{routes.length}</span> dari
            <span className="font-medium"> {pagination.total}</span> rute
          </p>
        </div>

        {/* Route Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50 table-header">
                <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asal</th>
                <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan</th>
                <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jarak (KM)</th>
                <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi</th>
                <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Dasar</th>
                <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routes.length > 0 ? routes.map((route, index) => (
                <tr key={route.id} className="route-hover">
                  <td className="py-3 px-4 text-sm text-gray-500">{getFirstItem() + index}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-600 h-7 w-7 rounded-full flex items-center justify-center mr-2">
                        <i className="fas fa-map-marker-alt"></i>
                      </div>
                      {route.origin}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 text-indigo-600 h-7 w-7 rounded-full flex items-center justify-center mr-2">
                        <i className="fas fa-map-marker-alt"></i>
                      </div>
                      {route.destination}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    <div className="flex items-center">
                      <i className="fas fa-ruler text-gray-400 mr-2"></i>
                      {route.distance || '-'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    <div className="flex items-center">
                      <i className="fas fa-clock text-gray-400 mr-2"></i>
                      <span>{route.duration} menit</span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.floor(route.duration / 60)}j {route.duration % 60}m)
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <i className="fas fa-tag text-gray-400 mr-2"></i>
                        <span className="font-medium">Rp {formatPrice(route.base_price)}</span>
                      </div>
                      <button
                        type="button"
                        className="ml-2 price-info-btn px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 focus:outline-none"
                        onClick={() => showVehiclePriceDetails(route)}
                      >
                        <i className="fas fa-info-circle"></i> Kendaraan
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {route.status === 'ACTIVE' ? (
                      <span className="badge-active px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
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
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Link to={`/admin/routes/${route.id}`}
                        className="action-button text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-lg transition-colors"
                        title="Detail">
                        <i className="fas fa-eye"></i>
                      </Link>
                      <Link to={`/admin/routes/${route.id}/edit`}
                        className="action-button text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 p-2 rounded-lg transition-colors"
                        title="Edit">
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        onClick={() => { setSelectedRoute(route); setShowDeleteModal(true); }}
                        className="action-button text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="py-8 px-4 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-gray-100 p-6 text-gray-300">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-gray-500 mt-4">Tidak ada data rute</p>
                      <p className="text-sm text-gray-400 mb-4">Belum ada rute yang ditambahkan atau sesuai filter yang dipilih</p>
                      <Link to="/admin/routes/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md">
                        <i className="fas fa-plus mr-2"></i> Tambah Rute Baru
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination would go here */}
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
                  {selectedRoute?.origin} - {selectedRoute?.destination}
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

      {/* Vehicle Price Modal */}
      {showVehiclePriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-tag text-blue-500 mr-2"></i>
                Detail Harga Kendaraan
              </h3>
              <button
                onClick={() => setShowVehiclePriceModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full mr-3">
                      <i className="fas fa-motorcycle text-sm"></i>
                    </div>
                    <span className="font-medium text-gray-700">Motor</span>
                  </div>
                  <span className="font-semibold text-gray-800">Rp {formatPrice(vehiclePrices.motorcycle)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full mr-3">
                      <i className="fas fa-car text-sm"></i>
                    </div>
                    <span className="font-medium text-gray-700">Mobil</span>
                  </div>
                  <span className="font-semibold text-gray-800">Rp {formatPrice(vehiclePrices.car)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-full mr-3">
                      <i className="fas fa-bus text-sm"></i>
                    </div>
                    <span className="font-medium text-gray-700">Bus</span>
                  </div>
                  <span className="font-semibold text-gray-800">Rp {formatPrice(vehiclePrices.bus)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full mr-3">
                      <i className="fas fa-truck text-sm"></i>
                    </div>
                    <span className="font-medium text-gray-700">Truck</span>
                  </div>
                  <span className="font-semibold text-gray-800">Rp {formatPrice(vehiclePrices.truck)}</span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowVehiclePriceModal(false)}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50"
                >
                  <i className="fas fa-times mr-2"></i> Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteList;