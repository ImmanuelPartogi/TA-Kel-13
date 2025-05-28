import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminRouteService from '../../../services/adminRoute.service';

const RouteCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showReasonContainer, setShowReasonContainer] = useState(false);
  const [showExpiryDate, setShowExpiryDate] = useState(false);

  const [formData, setFormData] = useState({
    route_code: '',
    origin: '',
    destination: '',
    distance: '',
    duration: '',
    base_price: 0,
    // Hapus harga kendaraan dari state
    status: 'ACTIVE',
    status_reason: '',
    status_expiry_date: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'status') {
      setShowReasonContainer(value !== 'ACTIVE');
      setShowExpiryDate(value === 'WEATHER_ISSUE');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const response = await adminRouteService.createRoute(formData);

      if (response.status === 'success') {
        navigate('/admin/routes');
      } else {
        setErrors(['Gagal membuat rute']);
      }
    } catch (error) {
      console.error('Error creating route:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setErrors(errorMessages);
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(['Terjadi kesalahan saat membuat rute']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header Section - Selaras dengan RouteList */}
      <div className="page-header p-6 text-white relative bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <i className="fas fa-plus-circle mr-3 text-blue-200"></i> Tambah Rute Baru
            </h1>
            <p className="mt-1 text-blue-100">Isi form berikut untuk menambahkan rute pelayaran baru</p>
          </div>
          <div>
            <Link to="/admin/routes"
              className="bg-white hover:bg-blue-700 hover:text-white text-blue-700 font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-md">
              <i className="fas fa-arrow-left mr-2"></i> Kembali ke Daftar
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
            <div className="font-bold">Terjadi kesalahan:</div>
            <ul className="list-disc ml-6">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Form Section - Menggunakan styling yang konsisten */}
          <div className="mb-6 p-5 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Informasi Dasar Rute</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="route_code" className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Rute <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="route_code"
                  name="route_code"
                  value={formData.route_code}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: JKT-SBY001"
                />
                <p className="mt-1 text-xs text-gray-500">Contoh: JKT-SBY001, BDG-SMG002</p>
              </div>
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
                  Asal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-map-marker-alt text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    required
                    placeholder="Masukkan kota asal"
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                  Tujuan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-map-marker-alt text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    required
                    placeholder="Masukkan kota tujuan"
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">Jarak (km)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-ruler text-gray-400"></i>
                  </div>
                  <input
                    type="number"
                    id="distance"
                    name="distance"
                    value={formData.distance}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    placeholder="Masukkan jarak dalam kilometer"
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Durasi (menit) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-clock text-gray-400"></i>
                  </div>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    required
                    placeholder="Masukkan durasi perjalanan"
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Harga Tiket Section */}
          <div className="mb-6 p-5 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Harga Tiket</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Dasar Penumpang <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-lg shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">Rp</span>
                  <input
                    type="number"
                    id="base_price"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleInputChange}
                    min="0"
                    required
                    placeholder="Masukkan harga dasar"
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="mb-6 p-5 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Status Rute</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Tidak Aktif</option>
                  <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                </select>
              </div>
              {showReasonContainer && (
                <div>
                  <label htmlFor="status_reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan Status {formData.status === 'WEATHER_ISSUE' && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-info-circle text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="status_reason"
                      name="status_reason"
                      value={formData.status_reason}
                      onChange={handleInputChange}
                      placeholder="Masukkan alasan status"
                      required={formData.status === 'WEATHER_ISSUE'}
                      className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {showExpiryDate && (
              <div className="mt-6">
                <label htmlFor="status_expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Berakhir Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-calendar-alt text-gray-400"></i>
                  </div>
                  <input
                    type="datetime-local"
                    id="status_expiry_date"
                    name="status_expiry_date"
                    value={formData.status_expiry_date}
                    onChange={handleInputChange}
                    required
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Isi tanggal dan waktu kapan status ini akan berakhir. Khusus untuk status Masalah Cuaca (WEATHER_ISSUE).</p>
              </div>
            )}
          </div>

          {/* Buttons - Diselaraskan dengan style RouteList */}
          <div className="flex justify-end mt-8 space-x-4">
            <Link
              to="/admin/routes"
              className="px-6 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <i className="fas fa-times mr-2"></i> Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Menyimpan...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i> Simpan Rute
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteCreate;