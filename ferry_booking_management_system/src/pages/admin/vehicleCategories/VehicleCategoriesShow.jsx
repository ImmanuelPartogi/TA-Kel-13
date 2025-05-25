import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminVehicleCategoriesService from '../../../services/adminVehicleCategories.service';

const VehicleCategoriesShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Fetch detail kategori kendaraan
  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        // Menggunakan getCategoryDetail dari service baru
        const response = await AdminVehicleCategoriesService.getCategoryDetail(id);

        // Periksa dan sesuaikan cara mengakses data
        if (response.data) {
          setCategory(response.data);
        } else if (response) {
          // Jika data langsung pada respons tanpa wrapping .data
          setCategory(response);
        } else {
          setError('Data kategori tidak lengkap');
        }

        setError(null);
      } catch (err) {
        setError('Gagal memuat data kategori kendaraan');
        console.error('Error fetching category:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();

    // Auto-hide alert after 5 seconds
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [id, notification.show]);

  // Handler untuk konfirmasi delete
  const confirmDelete = () => {
    setIsDeleting(true);
  };

  // Handler untuk delete kategori
  const handleDelete = async () => {
    try {
      // Menggunakan deleteCategory dari service baru
      await AdminVehicleCategoriesService.deleteCategory(id);
      setNotification({
        show: true,
        message: 'Kategori kendaraan berhasil dihapus',
        type: 'success'
      });

      // Redirect setelah 1.5 detik
      setTimeout(() => {
        navigate('/admin/vehicleCategories');
      }, 1500);
    } catch (err) {
      setIsDeleting(false);

      if (err.response && err.response.data && err.response.data.message) {
        setNotification({
          show: true,
          message: err.response.data.message,
          type: 'error'
        });
      } else {
        setNotification({
          show: true,
          message: 'Gagal menghapus kategori kendaraan',
          type: 'error'
        });
      }
      console.error('Error deleting category:', err);
    }
  };

  // Handler untuk toggle status
  const handleToggleStatus = async () => {
    try {
      // Menggunakan toggleCategoryStatus dari service baru
      await AdminVehicleCategoriesService.toggleCategoryStatus(id);

      // Refresh data
      const response = await AdminVehicleCategoriesService.getCategoryDetail(id);
      setCategory(response.data);

      setNotification({
        show: true,
        message: `Kategori kendaraan berhasil ${response.data.is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
        type: 'success'
      });
    } catch (err) {
      setNotification({
        show: true,
        message: 'Gagal mengubah status kategori kendaraan',
        type: 'error'
      });
      console.error('Error toggling status:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Modern Header */}
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
                <i className="fas fa-eye text-2xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{category.code}</h2>
                <p className="text-blue-100">{category.name}</p>
              </div>
            </div>
            <div>
              <Link
                to="/admin/vehicleCategories"
                className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Kembali ke Daftar
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Alert Messages */}
        {notification.show && (
          <div className={`mb-6 rounded-lg shadow-lg overflow-hidden animate-slideIn`}>
            <div className={`${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} px-4 py-2 text-white flex items-center justify-between`}>
              <div className="flex items-center">
                <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                <span className="font-medium">{notification.type === 'success' ? 'Sukses' : 'Error'}</span>
              </div>
              <button onClick={() => setNotification({ ...notification, show: false })} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={`${notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'} px-4 py-3 border-t`}>
              {notification.message}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-8 text-center">
            <div className="inline-block relative">
              <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="mt-4 text-gray-600">Memuat data kategori kendaraan...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-700">{error}</p>
                <div className="mt-2">
                  <Link to="/admin/vehicleCategories" className="inline-flex items-center text-sm text-red-700 hover:text-red-900 underline">
                    <i className="fas fa-arrow-left mr-1"></i> Kembali ke daftar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : !category ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-triangle text-yellow-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-700">Kategori kendaraan tidak ditemukan</p>
                <div className="mt-2">
                  <Link to="/admin/vehicleCategories" className="inline-flex items-center text-sm text-yellow-700 hover:text-yellow-900 underline">
                    <i className="fas fa-arrow-left mr-1"></i> Kembali ke daftar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Detail Content */}
            <div className="mb-6">
              {/* Header Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informasi Detail */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                        Informasi Dasar
                      </h3>

                      <div className="space-y-4">
                        <div className="flex border-b border-gray-200 pb-3">
                          <div className="w-36 text-sm font-medium text-gray-600">Kode Golongan</div>
                          <div className="flex-1 text-sm font-semibold text-gray-900">{category.code}</div>
                        </div>

                        <div className="flex border-b border-gray-200 pb-3">
                          <div className="w-36 text-sm font-medium text-gray-600">Nama Golongan</div>
                          <div className="flex-1 text-sm font-semibold text-gray-900">{category.name}</div>
                        </div>

                        <div className="flex border-b border-gray-200 pb-3">
                          <div className="w-36 text-sm font-medium text-gray-600">Tipe Kendaraan</div>
                          <div className="flex-1 text-sm font-semibold text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {AdminVehicleCategoriesService.getVehicleTypeText(category.vehicle_type)}
                            </span>
                          </div>
                        </div>

                        <div className="flex border-b border-gray-200 pb-3">
                          <div className="w-36 text-sm font-medium text-gray-600">Harga Dasar</div>
                          <div className="flex-1 text-sm font-semibold text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              {AdminVehicleCategoriesService.formatPrice(category.base_price)}
                            </span>
                          </div>
                        </div>

                        <div className="flex border-b border-gray-200 pb-3">
                          <div className="w-36 text-sm font-medium text-gray-600">Status</div>
                          <div className="flex-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.is_active ?
                              'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              'bg-gray-100 text-gray-800 border border-gray-200'
                              }`}>
                              <span className={`w-1.5 h-1.5 ${category.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'
                                } rounded-full mr-1.5`}></span>
                              {AdminVehicleCategoriesService.getStatusText(category.is_active)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Informasi Tambahan */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-clock text-blue-500 mr-2"></i>
                        Informasi Tambahan
                      </h3>

                      <div className="space-y-4">
                        <div className="flex border-b border-gray-200 pb-3">
                          <div className="w-36 text-sm font-medium text-gray-600">Dibuat Pada</div>
                          <div className="flex-1 text-sm font-semibold text-gray-900">
                            {category.created_at ?
                              AdminVehicleCategoriesService.formatDateTime(category.created_at) :
                              'N/A'
                            }
                          </div>
                        </div>

                        <div className="flex border-b border-gray-200 pb-3">
                          <div className="w-36 text-sm font-medium text-gray-600">Diperbarui Pada</div>
                          <div className="flex-1 text-sm font-semibold text-gray-900">
                            {category.updated_at ?
                              AdminVehicleCategoriesService.formatDateTime(category.updated_at) :
                              'N/A'
                            }
                          </div>
                        </div>

                        <div>
                          <div className="w-full text-sm font-medium text-gray-600 mb-2">Deskripsi</div>
                          <div className="w-full bg-white p-3 rounded-lg border border-gray-200 text-sm text-gray-800 min-h-[100px]">
                            {category.description || 'Tidak ada deskripsi'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistik */}
                  {category.vehicles_count !== undefined && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-chart-bar text-blue-500 mr-2"></i>
                        Statistik Penggunaan
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-medium text-blue-600">Total Kendaraan</p>
                            <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                              <i className="fas fa-car text-blue-500"></i>
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-blue-700">{category.vehicles_count || 0}</p>
                        </div>

                        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-medium text-emerald-600">Kendaraan Aktif</p>
                            <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center">
                              <i className="fas fa-car-side text-emerald-500"></i>
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-emerald-700">{category.active_vehicles_count || 0}</p>
                        </div>

                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-medium text-amber-600">Total Tiket</p>
                            <div className="bg-amber-100 w-8 h-8 rounded-full flex items-center justify-center">
                              <i className="fas fa-ticket-alt text-amber-500"></i>
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-amber-700">{category.tickets_count || 0}</p>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-medium text-purple-600">Total Pendapatan</p>
                            <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center">
                              <i className="fas fa-money-bill text-purple-500"></i>
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-purple-700">
                            {AdminVehicleCategoriesService.formatPrice(category.total_revenue || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-100 p-6 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                    <button
                      onClick={handleToggleStatus}
                      className={`inline-flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium shadow-sm ${category.is_active ?
                        'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                    >
                      <i className={`fas ${category.is_active ? 'fa-toggle-off' : 'fa-toggle-on'} mr-2`}></i>
                      {category.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>

                    <Link
                      to={`/admin/vehicleCategories/${id}/edit`}
                      className="inline-flex items-center justify-center px-4 py-2 border border-yellow-300 rounded-lg text-sm font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 shadow-sm"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Edit
                    </Link>

                    <button
                      onClick={confirmDelete}
                      className="inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 shadow-sm"
                    >
                      <i className="fas fa-trash mr-2"></i>
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-modal-in">
            <div className="p-6">
              <div className="text-center mb-5">
                <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus kategori kendaraan ini?</p>
                {category && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-3 border border-gray-200">
                    <p className="font-semibold text-lg text-gray-800">{category.code}</p>
                    <p className="text-gray-600">{category.name}</p>
                  </div>
                )}
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">
                      Menghapus kategori kendaraan akan menghapus semua data terkait. Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsDeleting(false)}
                  className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full py-3 px-4 bg-red-500 rounded-lg text-white font-medium hover:bg-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i> Hapus Kategori
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
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
      `}</style>
    </div>
  );
};

export default VehicleCategoriesShow;