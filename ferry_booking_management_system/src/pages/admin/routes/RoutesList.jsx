import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { routeService } from '../../../services/routeService';
import { toast } from 'react-toastify';

const RouteList = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    total: 0,
    perPage: 10,
    lastPage: 1
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);
  const [showVehiclePriceModal, setShowVehiclePriceModal] = useState(false);
  const [vehiclePrices, setVehiclePrices] = useState({
    motorcycle: 0,
    car: 0,
    bus: 0,
    truck: 0
  });

  useEffect(() => {
    fetchRoutes();
  }, [search, status, pagination.currentPage]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await routeService.getAllRoutes({
        search,
        status,
        page: pagination.currentPage
      });
      
      setRoutes(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        total: response.data.total,
        perPage: response.data.per_page,
        lastPage: response.data.last_page
      });
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Gagal memuat data rute');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
  };

  const handleShowDeleteModal = (route) => {
    setRouteToDelete(route);
    setShowDeleteModal(true);
  };

  const handleDeleteRoute = async () => {
    try {
      await routeService.deleteRoute(routeToDelete.id);
      toast.success('Rute berhasil dihapus');
      fetchRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error('Gagal menghapus rute');
    } finally {
      setShowDeleteModal(false);
      setRouteToDelete(null);
    }
  };

  const showVehiclePrices = (motorcycle, car, bus, truck) => {
    setVehiclePrices({ motorcycle, car, bus, truck });
    setShowVehiclePriceModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= pagination.lastPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            pagination.currentPage === i
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="flex justify-center mt-4">
        {pagination.currentPage > 1 && (
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            &laquo; Prev
          </button>
        )}
        {pages}
        {pagination.currentPage < pagination.lastPage && (
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Next &raquo;
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-500 p-6 text-white relative">
        <div className="absolute right-0 bottom-0 opacity-30 pointer-events-none">
          <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M30.5,-45.6C40.1,-42.3,49.1,-35.8,55.9,-26.5C62.8,-17.3,67.4,-5.4,64.2,4.5C61,14.3,50.1,22.2,40.7,28.4C31.3,34.6,23.5,39.2,14.9,43.3C6.2,47.4,-3.2,51,-13.3,50.1C-23.4,49.3,-34.2,44,-43.5,35.7C-52.8,27.4,-60.6,16.1,-61.5,4.5C-62.4,-7.2,-56.4,-19.1,-48.2,-28.2C-40,-37.4,-29.6,-43.7,-19.4,-46.5C-9.2,-49.3,0.8,-48.5,10.9,-46.9C20.9,-45.3,30.9,-42.8,40.9,-39.9C40.9,-39.9,30.5,-45.6,30.5,-45.6Z"
              transform="translate(75 75)" fill="#FFFFFF" />
          </svg>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <i className="fas fa-route mr-3 text-blue-200"></i> Manajemen Rute
            </h1>
            <p className="mt-1 text-blue-100">Kelola semua rute pelayaran dalam sistem</p>
          </div>
          <div>
            <Link
              to="/admin/routes/create"
              className="bg-white hover:bg-blue-700 hover:text-white text-blue-700 font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-md"
            >
              <i className="fas fa-plus mr-2"></i> Tambah Rute Baru
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Alert Success */}
        {/* Ini akan diganti dengan toast notification */}

        {/* Filter and Search */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-transparent p-5 rounded-lg border border-gray-200 shadow-sm">
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari asal atau tujuan..."
                  className="pl-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm transition-all duration-200"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={handleStatusChange}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
              >
                <option value="">Semua Status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Tidak Aktif</option>
                <option value="WEATHER_ISSUE">Masalah Cuaca</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg h-10 font-medium transition-colors shadow-sm"
              >
                <i className="fas fa-filter mr-1"></i> Filter
              </button>

              {(search || status) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setStatus('');
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded-lg h-10 flex items-center transition-colors shadow-sm"
                >
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
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asal
                  </th>
                  <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tujuan
                  </th>
                  <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jarak (KM)
                  </th>
                  <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durasi
                  </th>
                  <th scope="col" className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga Dasar
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
                {routes.length > 0 ? (
                  routes.map((route, index) => (
                    <tr key={route.id} className="hover:bg-gray-50 transition-all duration-200">
                      <td className="py-3 px-4 text-sm text-gray-500">{(pagination.currentPage - 1) * pagination.perPage + index + 1}</td>
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
                            className="ml-2 px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 focus:outline-none transform transition hover:-translate-y-1 hover:shadow-md"
                            onClick={() => showVehiclePrices(
                              route.motorcycle_price,
                              route.car_price,
                              route.bus_price,
                              route.truck_price
                            )}
                          >
                            <i className="fas fa-info-circle"></i> Kendaraan
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {route.status === 'ACTIVE' && (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200 relative pl-5">
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
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/admin/routes/${route.id}`}
                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-lg transition-colors transform hover:scale-110"
                            title="Detail"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link
                            to={`/admin/routes/${route.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 p-2 rounded-lg transition-colors transform hover:scale-110"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleShowDeleteModal(route)}
                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-lg transition-colors transform hover:scale-110"
                            title="Hapus"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 px-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-gray-100 p-6 text-gray-300">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                          </svg>
                        </div>
                        <p className="text-lg font-medium text-gray-500 mt-4">Tidak ada data rute</p>
                        <p className="text-sm text-gray-400 mb-4">Belum ada rute yang ditambahkan atau sesuai filter yang dipilih</p>
                        <Link
                          to="/admin/routes/create"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
                        >
                          <i className="fas fa-plus mr-2"></i> Tambah Rute Baru
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {routes.length > 0 && renderPagination()}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform scale-100 opacity-100 transition-all duration-300">
            <div className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Konfirmasi Hapus</h3>
                <p className="text-gray-500">Apakah Anda yakin ingin menghapus rute:</p>
                <p className="font-semibold text-gray-800 mt-2 mb-4">
                  {routeToDelete?.origin} - {routeToDelete?.destination}
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <i className="fas fa-times mr-2"></i> Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRoute}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i> Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Price Modal */}
      {showVehiclePriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform scale-100 opacity-100 transition-all duration-300">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-tag text-blue-500 mr-2"></i>
                Detail Harga Kendaraan
              </h3>
              <button onClick={() => setShowVehiclePriceModal(false)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
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
                  type="button"
                  onClick={() => setShowVehiclePriceModal(false)}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
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