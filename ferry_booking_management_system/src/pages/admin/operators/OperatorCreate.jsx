import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminOperatorService from '../../../services/adminOperator.service';

const OperatorCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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
      const response = await adminOperatorService.getRoutes();
      console.log('Routes response:', response); // Debug log

      // Handle different API response structures
      let routesData = [];

      if (response && response.data && Array.isArray(response.data)) {
        // Laravel paginated response: {current_page: 1, data: [...], ...}
        routesData = response.data;
      } else if (response && response.status === 'success' && response.data) {
        // API response with status: {status: 'success', data: [...]}
        if (Array.isArray(response.data)) {
          routesData = response.data;
        } else if (response.data.routes && Array.isArray(response.data.routes)) {
          // Or {status: 'success', data: {routes: [...]}}
          routesData = response.data.routes;
        } else {
          console.warn('Unexpected data structure in response.data:', response.data);
        }
      } else if (Array.isArray(response)) {
        // Direct array response
        routesData = response;
      } else {
        console.error('Invalid routes data format:', response);
      }

      setRoutes(routesData);
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes([]);
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
      await adminOperatorService.createOperator(formData);
      navigate('/admin/operators');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error('Error creating operator:', error);
        setErrors({ general: 'Terjadi kesalahan saat menyimpan data' });
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(formData.password);
  const strengthInfo = getPasswordStrengthText(passwordStrength);

  // Filter routes based on search term
  const filteredRoutes = routes.filter(route => {
    const searchLower = searchTerm.toLowerCase();
    return (
      route.origin?.toLowerCase().includes(searchLower) ||
      route.destination?.toLowerCase().includes(searchLower)
    );
  });

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
            <Link to="/admin/operators" className="inline-flex items-center px-4 py-2 bg-blue-800 bg-opacity-50 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 transition-colors duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
            </Link>
          </div>
        </div>
      </div>

      {/* Error message */}
      {errors.general && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Terjadi kesalahan:</h3>
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition duration-200 hover:shadow-xl">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">Data Operator</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informasi Dasar */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm shadow-sm">1</span>
                Informasi Dasar
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${errors.company_name ? 'border-red-500' : ''}`}
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan nama perusahaan"
                  />
                  {errors.company_name && (
                    <p className="mt-2 text-sm text-red-600">{errors.company_name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${errors.email ? 'border-red-500' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="contoh@email.com"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Informasi Kontak & Administrasi */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm shadow-sm">2</span>
                Informasi Kontak & Administrasi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon <span className="text-red-500">*</span>
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
                      <p className="mt-2 text-sm text-red-600">{errors.phone_number}</p>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Format: +62xxx atau 08xxx (10-15 digit)</p>
                </div>
                <div>
                  <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Lisensi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${errors.license_number ? 'border-red-500' : ''}`}
                    id="license_number"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan nomor lisensi"
                  />
                  {errors.license_number && (
                    <p className="mt-2 text-sm text-red-600">{errors.license_number}</p>
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
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">unit</span>
                    </div>
                  </div>
                  {errors.fleet_size && (
                    <p className="mt-2 text-sm text-red-600">{errors.fleet_size}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${errors.company_address ? 'border-red-500' : ''}`}
                    id="company_address"
                    name="company_address"
                    rows="3"
                    value={formData.company_address}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan alamat lengkap perusahaan"
                  />
                  {errors.company_address && (
                    <p className="mt-2 text-sm text-red-600">{errors.company_address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pengaturan Akun */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm shadow-sm">3</span>
                Pengaturan Akun
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
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
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}

                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Kekuatan Password:</span>
                      <span className={`text-xs font-medium ${strengthInfo.class}`}>{strengthInfo.text}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength < 50 ? 'bg-red-500' :
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
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${formData.password && formData.password_confirmation && formData.password !== formData.password_confirmation ? 'border-red-300' : ''}`}
                      id="password_confirmation"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      required
                      minLength="8"
                      placeholder="••••••••"
                    />
                  </div>
                  {formData.password && formData.password_confirmation && (
                    <p className={`mt-2 text-sm ${formData.password === formData.password_confirmation ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.password === formData.password_confirmation ? (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                          </svg>
                          Password cocok
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                          </svg>
                          Password tidak cocok
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Rute */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm shadow-sm">4</span>
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={selectAllRoutes}
                    className="px-3 py-2 text-blue-700 bg-blue-100 text-sm font-medium rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Pilih Semua
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={clearAllRoutes}
                    className="px-3 py-2 text-red-700 bg-red-100 text-sm font-medium rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150"
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus Semua
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-4 max-h-60 overflow-y-auto">
                  {Array.isArray(filteredRoutes) && filteredRoutes.length > 0 ? (
                    filteredRoutes.map((route) => (
                      <div key={route.id} className="flex items-center p-2 rounded-lg hover:bg-blue-50 route-item transition duration-150">
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
                    ))
                  ) : (
                    <div className="col-span-full text-center py-4 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <p>{searchTerm ? `Tidak ada rute yang cocok dengan "${searchTerm}"` : 'Tidak ada rute tersedia'}</p>
                    </div>
                  )}
                </div>
              </div>
              {errors.routes && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors.routes}
                </p>
              )}

              <div className="mt-3">
                <div className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-50 border border-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-blue-700">{formData.assigned_routes.length}</span> <span className="text-blue-700 ml-1">rute dipilih</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <Link to="/admin/operators" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 disabled:opacity-50 shadow-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Konfirmasi Tindakan</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{modalMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={modalAction}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Ya, Lanjutkan
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Batal
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