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
        const response = await AdminVehicleCategoriesService.getCategoryDetail(id);

        // Ekstrak data kategori dari response
        if (response && response.data) {
          setCategory(response.data);
        } else if (response) {
          setCategory(response);
        } else {
          setError('Data kategori tidak lengkap');
        }
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
      await AdminVehicleCategoriesService.toggleCategoryStatus(id);

      // Refresh data
      const response = await AdminVehicleCategoriesService.getCategoryDetail(id);
      
      // Ekstrak data kategori dari response
      let categoryData;
      if (response && response.data) {
        categoryData = response.data;
        setCategory(response.data);
      } else if (response && typeof response === 'object') {
        categoryData = response;
        setCategory(response);
      } else {
        throw new Error('Format respons tidak valid');
      }

      setNotification({
        show: true,
        message: `Kategori kendaraan berhasil ${categoryData.is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
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

  // Mendapatkan ikon yang sesuai dengan tipe kendaraan
  const getVehicleTypeIcon = (type) => {
    const icons = {
      'MOTORCYCLE': 'fa-motorcycle',
      'CAR': 'fa-car',
      'BUS': 'fa-bus',
      'TRUCK': 'fa-truck',
      'PICKUP': 'fa-truck-pickup',
      'TRONTON': 'fa-truck-moving'
    };
    return icons[type] || 'fa-truck';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Modern Header - Hanya ditampilkan jika category sudah ada */}
      {!loading && category && (
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <circle cx="500" cy="500" r="300" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
              <circle cx="500" cy="500" r="200" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
            </svg>
          </div>

          {/* Floating elements */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -left-10 bottom-0 w-40 h-40 bg-indigo-500 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start">
                {/* Category Icon Badge */}
                <div className="rounded-lg mr-4 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg">
                  <i className={`fas ${getVehicleTypeIcon(category.vehicle_type)} text-2xl`}></i>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <h2 className="text-3xl font-bold tracking-tight">{category.code}</h2>
                    <span className={`ml-3 px-2.5 py-1 text-xs font-semibold rounded-full ${
                      category.is_active 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {AdminVehicleCategoriesService.getStatusText(category.is_active)}
                    </span>
                  </div>
                  <p className="text-blue-100 text-lg">{category.name}</p>
                  <p className="text-blue-200 text-sm mt-1">
                    <i className="fas fa-tag mr-1"></i>
                    {AdminVehicleCategoriesService.getVehicleTypeText(category.vehicle_type)} • 
                    <span className="ml-1 font-medium">{AdminVehicleCategoriesService.formatPrice(category.base_price)}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/admin/vehicleCategories"
                  className="inline-flex items-center px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white transition-all duration-200 transform hover:-translate-y-1"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Kembali ke Daftar
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Alert Messages */}
        {notification.show && (
          <div className={`mb-6 rounded-lg shadow-lg overflow-hidden animate-slideIn`}>
            <div className={`${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} px-4 py-2.5 text-white flex items-center justify-between`}>
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
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-12 text-center">
            <div className="relative inline-flex">
              <div className="w-16 h-16 rounded-full border-4 border-blue-100"></div>
              <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent absolute top-0 left-0 animate-spin"></div>
              <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-r-blue-300 border-b-transparent border-l-transparent absolute top-0 left-0 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.2s'}}></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Memuat data kategori kendaraan...</p>
            <p className="mt-2 text-gray-500 text-sm">Mohon tunggu sebentar</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-red-500 h-2"></div>
            <div className="p-6">
              <div className="flex items-start">
                <div className="bg-red-100 rounded-full p-3 mr-4">
                  <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
                  <p className="text-gray-700 mb-4">{error}</p>
                  <Link 
                    to="/admin/vehicleCategories" 
                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Kembali ke daftar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : !category ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-yellow-500 h-2"></div>
            <div className="p-6">
              <div className="flex items-start">
                <div className="bg-yellow-100 rounded-full p-3 mr-4">
                  <i className="fas fa-search text-yellow-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Tidak Ditemukan</h3>
                  <p className="text-gray-700 mb-4">Kategori kendaraan yang Anda cari tidak ditemukan dalam sistem.</p>
                  <Link 
                    to="/admin/vehicleCategories" 
                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Kembali ke daftar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Detail Content */}
            <div className="mb-6">
              {/* Info Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Card 1: Informasi Dasar */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                      <i className="fas fa-info-circle mr-2"></i>
                      Informasi Dasar
                    </h3>
                  </div>
                  <div className="p-5">
                    <ul className="space-y-3">
                      <li className="flex items-start border-b border-gray-100 pb-3">
                        <div className="w-32 text-sm font-medium text-gray-500">Kode Golongan</div>
                        <div className="flex-1 font-semibold text-gray-900">{category.code}</div>
                      </li>
                      <li className="flex items-start border-b border-gray-100 pb-3">
                        <div className="w-32 text-sm font-medium text-gray-500">Nama Golongan</div>
                        <div className="flex-1 font-semibold text-gray-900">{category.name}</div>
                      </li>
                      <li className="flex items-start border-b border-gray-100 pb-3">
                        <div className="w-32 text-sm font-medium text-gray-500">Tipe Kendaraan</div>
                        <div className="flex-1">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <i className={`fas ${getVehicleTypeIcon(category.vehicle_type)} mr-1`}></i>
                            {AdminVehicleCategoriesService.getVehicleTypeText(category.vehicle_type)}
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start border-b border-gray-100 pb-3">
                        <div className="w-32 text-sm font-medium text-gray-500">Harga Dasar</div>
                        <div className="flex-1 font-semibold text-emerald-600">
                          {AdminVehicleCategoriesService.formatPrice(category.base_price)}
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="w-32 text-sm font-medium text-gray-500">Status</div>
                        <div className="flex-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            category.is_active 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                            <span className={`w-1.5 h-1.5 ${
                              category.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'
                              } rounded-full mr-1.5`}></span>
                            {AdminVehicleCategoriesService.getStatusText(category.is_active)}
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card 2: Deskripsi */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                      <i className="fas fa-align-left mr-2"></i>
                      Deskripsi
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[150px] border border-gray-100 text-gray-700">
                      {category.description || (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                          <i className="fas fa-file-alt text-2xl mb-2"></i>
                          <p>Tidak ada deskripsi untuk kategori ini</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 3: Informasi Tambahan */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                      <i className="fas fa-clock mr-2"></i>
                      Informasi Tambahan
                    </h3>
                  </div>
                  <div className="p-5">
                    <ul className="space-y-3">
                      <li className="flex items-start border-b border-gray-100 pb-3">
                        <div className="w-32 text-sm font-medium text-gray-500">Dibuat Pada</div>
                        <div className="flex-1 text-sm text-gray-700">
                          {category.created_at ? (
                            <div className="flex items-center">
                              <i className="fas fa-calendar-alt text-gray-400 mr-2"></i>
                              {AdminVehicleCategoriesService.formatDateTime(category.created_at)}
                            </div>
                          ) : 'N/A'}
                        </div>
                      </li>
                      <li className="flex items-start border-b border-gray-100 pb-3">
                        <div className="w-32 text-sm font-medium text-gray-500">Diperbarui</div>
                        <div className="flex-1 text-sm text-gray-700">
                          {category.updated_at ? (
                            <div className="flex items-center">
                              <i className="fas fa-edit text-gray-400 mr-2"></i>
                              {AdminVehicleCategoriesService.formatDateTime(category.updated_at)}
                            </div>
                          ) : 'N/A'}
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-5 flex flex-wrap justify-end gap-3">
                  <button
                    onClick={handleToggleStatus}
                    className={`inline-flex items-center justify-center px-4 py-2.5 border rounded-lg text-sm font-medium shadow-sm transition-all hover:-translate-y-1 ${category.is_active ?
                      'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                  >
                    <i className={`fas ${category.is_active ? 'fa-toggle-off' : 'fa-toggle-on'} mr-2`}></i>
                    {category.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>

                  <Link
                    to={`/admin/vehicleCategories/${id}/edit`}
                    className="inline-flex items-center justify-center px-4 py-2.5 border border-yellow-300 rounded-lg text-sm font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 shadow-sm transition-all hover:-translate-y-1"
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Edit
                  </Link>

                  <button
                    onClick={confirmDelete}
                    className="inline-flex items-center justify-center px-4 py-2.5 border border-red-300 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 shadow-sm transition-all hover:-translate-y-1"
                  >
                    <i className="fas fa-trash mr-2"></i>
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-modal-in">
            <div className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 text-white">
              <h3 className="text-lg font-semibold flex items-center">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Konfirmasi Hapus
              </h3>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center mb-5">
                <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center">
                  <i className="fas fa-trash text-red-500 text-3xl"></i>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Apakah Anda yakin?</h3>
                <p className="text-gray-600">Tindakan ini akan menghapus kategori kendaraan dan tidak dapat dibatalkan.</p>
                
                {category && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-center items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <i className={`fas ${getVehicleTypeIcon(category.vehicle_type)} text-blue-500`}></i>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">{category.code}</p>
                        <p className="text-sm text-gray-600">{category.name}</p>
                      </div>
                    </div>
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
                      Menghapus kategori kendaraan akan menghapus semua data terkait dan dapat memengaruhi tiket yang sudah diterbitkan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsDeleting(false)}
                  className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all transform hover:-translate-y-1"
                >
                  <i className="fas fa-times mr-2"></i> Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-500 rounded-lg text-white font-medium hover:from-red-700 hover:to-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all transform hover:-translate-y-1"
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