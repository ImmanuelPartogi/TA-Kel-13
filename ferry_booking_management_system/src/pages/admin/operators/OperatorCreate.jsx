import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OperatorCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone_number: '',
    license_number: '',
    fleet_size: 0,
    company_address: '',
    password: '',
    password_confirmation: '',
    assigned_routes: []
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await axios.get('/admin-panel/routes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRoutes(response.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRouteChange = (routeId) => {
    const newRoutes = [...formData.assigned_routes];
    const index = newRoutes.indexOf(routeId);
    
    if (index > -1) {
      newRoutes.splice(index, 1);
    } else {
      newRoutes.push(routeId);
    }
    
    setFormData({ ...formData, assigned_routes: newRoutes });
  };

  const selectAllRoutes = () => {
    setModalMessage('Apakah Anda yakin ingin memilih semua rute?');
    setModalAction(() => () => {
      setFormData({ ...formData, assigned_routes: routes.map(r => r.id) });
      setShowModal(false);
    });
    setShowModal(true);
  };

  const clearAllRoutes = () => {
    setModalMessage('Apakah Anda yakin ingin menghapus semua pilihan rute?');
    setModalAction(() => () => {
      setFormData({ ...formData, assigned_routes: [] });
      setShowModal(false);
    });
    setShowModal(true);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 50) return { text: 'Lemah', class: 'text-red-500' };
    if (strength < 75) return { text: 'Sedang', class: 'text-yellow-500' };
    return { text: 'Kuat', class: 'text-green-500' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (formData.assigned_routes.length === 0) {
      setErrors({ ...errors, routes: 'Pilih minimal satu rute yang dikelola' });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setErrors({ ...errors, password_confirmation: 'Password tidak cocok' });
      setLoading(false);
      return;
    }

    try {
      await axios.post('/admin-panel/operators', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      navigate('/admin/operators');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(formData.password);
  const strengthInfo = getPasswordStrengthText(passwordStrength);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-8 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-30 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Tambah Operator Baru</h1>
              <p className="text-blue-100 mt-1">Lengkapi form berikut untuk menambahkan operator</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/admin/operators" className="inline-flex items-center px-4 py-2 bg-blue-800 bg-opacity-50 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">Data Operator</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informasi Dasar */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm">1</span>
                Informasi Dasar
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Perusahaan <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="text"
                    className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${errors.company_name ? 'border-red-500' : ''}`}
                    id="company_name" 
                    name="company_name" 
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                  />
                  {errors.company_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="email"
                    className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${errors.email ? 'border-red-500' : ''}`}
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Informasi Kontak & Administrasi */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm">2</span>
                Informasi Kontak & Administrasi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">+62</span>
                    </div>
                    <input 
                      type="text"
                      className={`w-full pl-12 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${errors.phone_number ? 'border-red-500' : ''}`}
                      id="phone_number" 
                      name="phone_number" 
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="8123456789" 
                      required 
                      pattern="[0-9\+\-\s]{10,15}"
                    />
                    {errors.phone_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Format: +62xxx atau 08xxx (10-15 digit)</p>
                </div>
                <div>
                  <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Lisensi <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="text"
                    className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${errors.license_number ? 'border-red-500' : ''}`}
                    id="license_number" 
                    name="license_number" 
                    value={formData.license_number}
                    onChange={handleChange}
                    required
                  />
                  {errors.license_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.license_number}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fleet_size" className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Armada
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${errors.fleet_size ? 'border-red-500' : ''}`}
                      id="fleet_size" 
                      name="fleet_size" 
                      value={formData.fleet_size}
                      onChange={handleChange}
                      min="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">unit</span>
                    </div>
                  </div>
                  {errors.fleet_size && (
                    <p className="mt-1 text-sm text-red-600">{errors.fleet_size}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Perusahaan <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${errors.company_address ? 'border-red-500' : ''}`}
                    id="company_address" 
                    name="company_address" 
                    rows="3" 
                    value={formData.company_address}
                    onChange={handleChange}
                    required
                  />
                  {errors.company_address && (
                    <p className="mt-1 text-sm text-red-600">{errors.company_address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pengaturan Akun */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm">3</span>
                Pengaturan Akun
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="password"
                      className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${errors.password ? 'border-red-500' : ''}`}
                      id="password" 
                      name="password" 
                      value={formData.password}
                      onChange={handleChange}
                      required 
                      minLength="8"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}

                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Kekuatan Password:</span>
                      <span className={`text-xs font-medium ${strengthInfo.class}`}>{strengthInfo.text}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength < 50 ? 'bg-red-500' : 
                          passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`} 
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol</p>
                  </div>
                </div>
                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="password"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150"
                      id="password_confirmation" 
                      name="password_confirmation" 
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      required 
                      minLength="8"
                    />
                  </div>
                  {formData.password && formData.password_confirmation && (
                    <p className={`mt-1 text-sm ${formData.password === formData.password_confirmation ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.password === formData.password_confirmation ? 'Password cocok' : 'Password tidak cocok'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Rute */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm">4</span>
                Rute yang Dikelola
              </h3>

              <div className="flex justify-between items-center mb-3">
                <div className="relative flex-grow mr-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    id="route-search" 
                    placeholder="Cari rute..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  />
                </div>
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={selectAllRoutes}
                    className="px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                  >
                    Pilih Semua
                  </button>
                  <button 
                    type="button" 
                    onClick={clearAllRoutes}
                    className="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150"
                  >
                    Hapus Semua
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-4 max-h-60 overflow-y-auto">
                  {routes.map((route) => (
                    <div key={route.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 route-item transition duration-150">
                      <div className="flex items-center h-5">
                        <input 
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 route-checkbox transition duration-150"
                          id={`route_${route.id}`} 
                          checked={formData.assigned_routes.includes(route.id)}
                          onChange={() => handleRouteChange(route.id)}
                        />
                      </div>
                      <label htmlFor={`route_${route.id}`} className="ml-2 block text-sm text-gray-900 route-label cursor-pointer">
                        <span className="font-medium">{route.origin} - {route.destination}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {errors.routes && (
                <p className="mt-2 text-sm text-red-600">{errors.routes}</p>
              )}

              <div className="mt-2 text-sm text-gray-500">
                <span>{formData.assigned_routes.length}</span> rute dipilih
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <Link to="/admin/operators" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150">
                Batal
              </Link>
              <button 
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Konfirmasi Tindakan</h3>
              <p className="text-gray-700 mb-6">{modalMessage}</p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none transition duration-150"
                >
                  Batal
                </button>
                <button 
                  onClick={modalAction}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none transition duration-150"
                >
                  Ya, Lanjutkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorCreate;