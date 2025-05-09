import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { routeService } from '../../../services/routeService';
import { toast } from 'react-toastify';

const RouteCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    route_code: '',
    origin: '',
    destination: '',
    distance: '',
    duration: '',
    base_price: '0',
    motorcycle_price: '0',
    car_price: '0',
    bus_price: '0',
    truck_price: '0',
    status: 'ACTIVE',
    status_reason: '',
    status_expiry_date: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Jika ada error sebelumnya untuk field ini, hapus error
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validasi input yang wajib diisi
    if (!formData.route_code.trim()) newErrors.route_code = 'Kode rute wajib diisi';
    if (!formData.origin.trim()) newErrors.origin = 'Asal wajib diisi';
    if (!formData.destination.trim()) newErrors.destination = 'Tujuan wajib diisi';
    if (!formData.duration) newErrors.duration = 'Durasi wajib diisi';
    
    // Validasi harga (harus berupa angka)
    if (isNaN(formData.base_price) || parseFloat(formData.base_price) < 0) 
      newErrors.base_price = 'Harga dasar harus berupa angka positif';
    if (isNaN(formData.motorcycle_price) || parseFloat(formData.motorcycle_price) < 0) 
      newErrors.motorcycle_price = 'Harga motor harus berupa angka positif';
    if (isNaN(formData.car_price) || parseFloat(formData.car_price) < 0) 
      newErrors.car_price = 'Harga mobil harus berupa angka positif';
    if (isNaN(formData.bus_price) || parseFloat(formData.bus_price) < 0) 
      newErrors.bus_price = 'Harga bus harus berupa angka positif';
    if (isNaN(formData.truck_price) || parseFloat(formData.truck_price) < 0) 
      newErrors.truck_price = 'Harga truk harus berupa angka positif';
    
    // Validasi alasan jika status bukan ACTIVE
    if (formData.status !== 'ACTIVE' && !formData.status_reason.trim()) 
      newErrors.status_reason = 'Alasan status wajib diisi jika status bukan Aktif';
    
    // Validasi tanggal kedaluwarsa untuk status WEATHER_ISSUE
    if (formData.status === 'WEATHER_ISSUE' && !formData.status_expiry_date) 
      newErrors.status_expiry_date = 'Tanggal berakhir status wajib diisi untuk Masalah Cuaca';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Ada kesalahan pada form. Silakan periksa kembali.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await routeService.createRoute(formData);
      toast.success('Rute berhasil ditambahkan!');
      navigate('/admin/routes');
    } catch (error) {
      console.error('Error creating route:', error);
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
        toast.error('Gagal menambahkan rute. Silakan periksa form kembali.');
      } else {
        toast.error('Terjadi kesalahan. Silakan coba lagi nanti.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tambah Rute Baru</h1>
        <Link
          to="/admin/routes"
          className="mt-3 md:mt-0 flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali
        </Link>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md relative" role="alert">
          <div className="font-bold">Terjadi kesalahan:</div>
          <ul className="list-disc ml-6">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{error}</li>
            ))}
          </ul>
          <button 
            className="absolute top-2 right-2 text-red-700" 
            onClick={() => setErrors({})}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
                  onChange={handleChange}
                  required
                  className={`w-full rounded-md border ${
                    errors.route_code ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <p className="mt-1 text-xs text-gray-500">Contoh: JKT-SBY001, BDG-SMG002</p>
                {errors.route_code && <p className="mt-1 text-xs text-red-500">{errors.route_code}</p>}
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
                  onChange={handleChange}
                  required
                  className={`w-full rounded-md border ${
                    errors.origin ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.origin && <p className="mt-1 text-xs text-red-500">{errors.origin}</p>}
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
                  onChange={handleChange}
                  required
                  className={`w-full rounded-md border ${
                    errors.destination ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.destination && <p className="mt-1 text-xs text-red-500">{errors.destination}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
                  Jarak (km)
                </label>
                <input
                  type="number"
                  id="distance"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full rounded-md border ${
                    errors.distance ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.distance && <p className="mt-1 text-xs text-red-500">{errors.distance}</p>}
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
                  onChange={handleChange}
                  min="1"
                  required
                  className={`w-full rounded-md border ${
                    errors.duration ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.duration && <p className="mt-1 text-xs text-red-500">{errors.duration}</p>}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-700 mt-8 mb-4">Harga Tiket</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Dasar Penumpang <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    id="base_price"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleChange}
                    min="0"
                    required
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border ${
                      errors.base_price ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                {errors.base_price && <p className="mt-1 text-xs text-red-500">{errors.base_price}</p>}
              </div>
              <div>
                <label htmlFor="motorcycle_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Motor <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    id="motorcycle_price"
                    name="motorcycle_price"
                    value={formData.motorcycle_price}
                    onChange={handleChange}
                    min="0"
                    required
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border ${
                      errors.motorcycle_price ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                {errors.motorcycle_price && <p className="mt-1 text-xs text-red-500">{errors.motorcycle_price}</p>}
              </div>
              <div>
                <label htmlFor="car_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Mobil <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    id="car_price"
                    name="car_price"
                    value={formData.car_price}
                    onChange={handleChange}
                    min="0"
                    required
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border ${
                      errors.car_price ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                {errors.car_price && <p className="mt-1 text-xs text-red-500">{errors.car_price}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="bus_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Bus <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    id="bus_price"
                    name="bus_price"
                    value={formData.bus_price}
                    onChange={handleChange}
                    min="0"
                    required
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border ${
                      errors.bus_price ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                {errors.bus_price && <p className="mt-1 text-xs text-red-500">{errors.bus_price}</p>}
              </div>
              <div>
                <label htmlFor="truck_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Truk <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    id="truck_price"
                    name="truck_price"
                    value={formData.truck_price}
                    onChange={handleChange}
                    min="0"
                    required
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border ${
                      errors.truck_price ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                {errors.truck_price && <p className="mt-1 text-xs text-red-500">{errors.truck_price}</p>}
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
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Tidak Aktif</option>
                  <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                </select>
                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
              </div>
              
              <div className={formData.status === 'ACTIVE' ? 'hidden' : ''}>
                <label htmlFor="status_reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan Status
                </label>
                <input
                  type="text"
                  id="status_reason"
                  name="status_reason"
                  value={formData.status_reason}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.status_reason ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.status_reason && <p className="mt-1 text-xs text-red-500">{errors.status_reason}</p>}
              </div>
            </div>

            <div className={`mt-6 ${formData.status === 'WEATHER_ISSUE' ? '' : 'hidden'}`}>
              <label htmlFor="status_expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Berakhir Status
              </label>
              <input
                type="datetime-local"
                id="status_expiry_date"
                name="status_expiry_date"
                value={formData.status_expiry_date}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  errors.status_expiry_date ? 'border-red-300' : 'border-gray-300'
                } shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Isi jika status akan berakhir pada waktu tertentu. Khusus untuk status Masalah Cuaca (WEATHER_ISSUE).
              </p>
              {errors.status_expiry_date && <p className="mt-1 text-xs text-red-500">{errors.status_expiry_date}</p>}
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-base font-medium rounded-md text-white ${
                  isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Rute'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RouteCreate;