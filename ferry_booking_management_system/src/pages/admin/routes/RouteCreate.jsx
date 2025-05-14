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
    motorcycle_price: 0,
    car_price: 0,
    bus_price: 0,
    truck_price: 0,
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
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tambah Rute Baru</h1>
        <Link to="/admin/routes"
          className="mt-3 md:mt-0 flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </Link>
      </div>

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

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h2 className="text-lg font-semibold text-blue-600">Form Rute</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
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
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Contoh: JKT-SBY001, BDG-SMG002</p>
              </div>
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
                  Asal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                  Tujuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">Jarak (km)</label>
                <input
                  type="number"
                  id="distance"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Durasi (menit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-700 mt-8 mb-4">Harga Tiket</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Dasar Penumpang <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">Rp</span>
                  <input
                    type="number"
                    id="base_price"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="motorcycle_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Motor <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">Rp</span>
                  <input
                    type="number"
                    id="motorcycle_price"
                    name="motorcycle_price"
                    value={formData.motorcycle_price}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="car_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Mobil <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">Rp</span>
                  <input
                    type="number"
                    id="car_price"
                    name="car_price"
                    value={formData.car_price}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="bus_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Bus <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">Rp</span>
                  <input
                    type="number"
                    id="bus_price"
                    name="bus_price"
                    value={formData.bus_price}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="truck_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Truk <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">Rp</span>
                  <input
                    type="number"
                    id="truck_price"
                    name="truck_price"
                    value={formData.truck_price}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Tidak Aktif</option>
                  <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                </select>
              </div>
              {showReasonContainer && (
                <div>
                  <label htmlFor="status_reason" className="block text-sm font-medium text-gray-700 mb-1">Alasan Status</label>
                  <input
                    type="text"
                    id="status_reason"
                    name="status_reason"
                    value={formData.status_reason}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {showExpiryDate && (
              <div className="mt-6">
                <label htmlFor="status_expiry_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Berakhir Status</label>
                <input
                  type="datetime-local"
                  id="status_expiry_date"
                  name="status_expiry_date"
                  value={formData.status_expiry_date}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Isi jika status akan berakhir pada waktu tertentu. Khusus untuk status Masalah Cuaca (WEATHER_ISSUE).</p>
              </div>
            )}

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan Rute'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RouteCreate;