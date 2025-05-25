import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminVehicleCategoriesService from '../../../services/adminVehicleCategories.service';

const VehicleCategoriesEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    vehicle_type: '',
    base_price: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Daftar tipe kendaraan
  const vehicleTypes = [
    { value: 'MOTORCYCLE', label: 'Sepeda Motor' },
    { value: 'CAR', label: 'Mobil' },
    { value: 'BUS', label: 'Bus' },
    { value: 'TRUCK', label: 'Truk' },
    { value: 'PICKUP', label: 'Pickup' },
    { value: 'TRONTON', label: 'Tronton' }
  ];

  // Fetch kategori kendaraan by ID
  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoading(true);
      try {
        // Menggunakan getCategoryDetail dari service baru
        const response = await AdminVehicleCategoriesService.getCategoryDetail(id);

        // Log untuk debugging
        console.log('API Response:', response);

        // Cek struktur data - mungkin data ada langsung di response, bukan di response.data
        let categoryData;
        if (response.data) {
          categoryData = response.data;
        } else if (response && typeof response === 'object') {
          categoryData = response;
        } else {
          throw new Error('Invalid response format');
        }

        // Pastikan semua properti yang dibutuhkan ada
        setFormData({
          code: categoryData.code || '',
          name: categoryData.name || '',
          description: categoryData.description || '',
          vehicle_type: categoryData.vehicle_type || '',
          base_price: categoryData.base_price?.toString() || '',
          is_active: categoryData.is_active || false
        });
      } catch (error) {
        console.error('Error fetching category:', error);
        setNotification({
          show: true,
          message: 'Gagal memuat data kategori kendaraan',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id]);

  // Handler untuk perubahan input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Reset error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Handler untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi form menggunakan service
    const validation = AdminVehicleCategoriesService.validateCategoryForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Format data sebelum kirim
      const dataToSubmit = {
        ...formData,
        base_price: parseFloat(formData.base_price)
      };

      // Kirim data ke API menggunakan updateCategory
      await AdminVehicleCategoriesService.updateCategory(id, dataToSubmit);

      setNotification({
        show: true,
        message: 'Kategori kendaraan berhasil diperbarui',
        type: 'success'
      });

      // Redirect setelah 1.5 detik
      setTimeout(() => {
        navigate('/admin/vehicleCategories');
      }, 1500);
    } catch (error) {
      console.error('Error updating vehicle category:', error);

      // Handle API validation errors
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setNotification({
          show: true,
          message: 'Gagal memperbarui kategori kendaraan',
          type: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to original data
  const resetForm = () => {
    setIsLoading(true);
    AdminVehicleCategoriesService.getCategoryDetail(id)
      .then(response => {
        // Cek struktur data
        let categoryData;
        if (response.data) {
          categoryData = response.data;
        } else if (response && typeof response === 'object') {
          categoryData = response;
        } else {
          throw new Error('Invalid response format');
        }

        setFormData({
          code: categoryData.code || '',
          name: categoryData.name || '',
          description: categoryData.description || '',
          vehicle_type: categoryData.vehicle_type || '',
          base_price: categoryData.base_price?.toString() || '',
          is_active: categoryData.is_active || false
        });
        setErrors({});
      })
      .catch(error => {
        console.error('Error resetting form:', error);
        setNotification({
          show: true,
          message: 'Gagal memuat ulang data kategori kendaraan',
          type: 'error'
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
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
                <i className="fas fa-edit text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Edit Kategori Kendaraan</h1>
                <p className="mt-1 text-blue-100">Perbarui informasi kategori kendaraan untuk sistem tiket ferry</p>
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
        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-8 text-center">
            <div className="inline-block relative">
              <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="mt-4 text-gray-600">Memuat data kategori kendaraan...</p>
          </div>
        ) : (
          /* Form */
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kode Golongan */}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Golongan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-tag text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border ${errors.code ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-lg transition-all`}
                      placeholder="Contoh: GOL I, GOL II"
                      maxLength={10}
                    />
                  </div>
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600"><i className="fas fa-exclamation-circle mr-1"></i> {errors.code}</p>
                  )}
                </div>

                {/* Nama Golongan */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Golongan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-file-signature text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-lg transition-all`}
                      placeholder="Nama lengkap golongan"
                      maxLength={100}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600"><i className="fas fa-exclamation-circle mr-1"></i> {errors.name}</p>
                  )}
                </div>

                {/* Tipe Kendaraan */}
                <div>
                  <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Kendaraan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-truck text-gray-400"></i>
                    </div>
                    <select
                      id="vehicle_type"
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border ${errors.vehicle_type ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-lg transition-all`}
                    >
                      <option value="">Pilih Tipe Kendaraan</option>
                      {vehicleTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.vehicle_type && (
                    <p className="mt-1 text-sm text-red-600"><i className="fas fa-exclamation-circle mr-1"></i> {errors.vehicle_type}</p>
                  )}
                </div>

                {/* Harga Dasar */}
                <div>
                  <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
                    Harga Dasar (Rp) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-money-bill text-gray-400"></i>
                    </div>
                    <input
                      type="number"
                      id="base_price"
                      name="base_price"
                      value={formData.base_price}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border ${errors.base_price ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-lg transition-all`}
                      placeholder="Contoh: 150000"
                      min="0"
                      step="1000"
                    />
                  </div>
                  {errors.base_price && (
                    <p className="mt-1 text-sm text-red-600"><i className="fas fa-exclamation-circle mr-1"></i> {errors.base_price}</p>
                  )}
                </div>

                {/* Deskripsi */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <i className="fas fa-align-left text-gray-400"></i>
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Deskripsi detail golongan kendaraan (opsional)"
                    />
                  </div>
                </div>

                {/* Status Aktif */}
                <div className="md:col-span-2">
                  <div className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                      Aktif
                    </label>
                    <div className="ml-4 text-xs text-gray-500">
                      <i className="fas fa-info-circle mr-1"></i>
                      Kategori kendaraan yang tidak aktif tidak akan ditampilkan pada aplikasi
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  disabled={isSubmitting || isLoading}
                >
                  <i className="fas fa-undo mr-2"></i> Reset
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-b-transparent border-white animate-spin mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i> Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
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

export default VehicleCategoriesEdit;