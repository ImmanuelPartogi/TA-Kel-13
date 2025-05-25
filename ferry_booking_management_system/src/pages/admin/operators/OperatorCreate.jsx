import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminOperatorService from '../../../services/adminOperator.service';

const OperatorCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [errors, setErrors] = useState({});
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
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchRoutes();
    
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({...alert, show: false});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

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
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal memuat data rute'
      });
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
    if (window.confirm('Apakah Anda yakin ingin memilih semua rute?')) {
      setFormData({ ...formData, assigned_routes: routes.map(r => r.id) });
    }
  };

  const clearAllRoutes = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua pilihan rute?')) {
      setFormData({ ...formData, assigned_routes: [] });
    }
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
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
        setAlert({
          show: true,
          type: 'error',
          message: 'Terdapat kesalahan pada form'
        });
      } else {
        console.error('Error creating operator:', error);
        setErrors({ general: 'Terjadi kesalahan saat menyimpan data' });
        setAlert({
          show: true,
          type: 'error',
          message: 'Terjadi kesalahan saat menyimpan data'
        });
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
      route.destination?.toLowerCase().includes(searchLower) ||
      (route.description && route.description.toLowerCase().includes(searchLower))
    );
  });

  // Mengubah objek errors ke array untuk tampilan yang konsisten dengan FerryCreate
  const errorMessages = errors.general 
    ? [errors.general] 
    : Object.values(errors).filter(error => error !== undefined);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header Section - Selaras dengan FerryCreate */}
      <div className="page-header p-6 text-white relative bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <i className="fas fa-plus-circle mr-3 text-blue-200"></i> Tambah Operator Baru
            </h1>
            <p className="mt-1 text-blue-100">Lengkapi form berikut untuk menambahkan operator baru</p>
          </div>
          <div>
            <Link to="/admin/operators"
              className="bg-white hover:bg-blue-700 hover:text-white text-blue-700 font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-md">
              <i className="fas fa-arrow-left mr-2"></i> Kembali ke Daftar
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Error Messages */}
        {errorMessages.length > 0 && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
            <div className="font-bold">Terjadi kesalahan:</div>
            <ul className="list-disc ml-6">
              {errorMessages.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Informasi Dasar */}
          <div className="mb-6 p-5 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Informasi Dasar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Perusahaan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-building text-gray-400"></i>
                  </div>
                  <input 
                    type="text"
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="company_name" 
                    name="company_name" 
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan nama perusahaan"
                  />
                </div>
                {errors.company_name && <p className="mt-1 text-xs text-red-600">{errors.company_name}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-gray-400"></i>
                  </div>
                  <input 
                    type="email"
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="contoh@email.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Informasi Kontak & Administrasi */}
          <div className="mb-6 p-5 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Informasi Kontak & Administrasi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-phone text-gray-400"></i>
                  </div>
                  <input 
                    type="text"
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="phone_number" 
                    name="phone_number" 
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+628123456789"
                    required
                    pattern="[0-9\+\-\s]{10,15}"
                  />
                </div>
                {errors.phone_number && <p className="mt-1 text-xs text-red-600">{errors.phone_number}</p>}
                <p className="mt-1 text-xs text-gray-500">Format: +62xxx atau 08xxx (10-15 digit)</p>
              </div>
              
              <div>
                <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Lisensi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-id-card text-gray-400"></i>
                  </div>
                  <input 
                    type="text"
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="license_number" 
                    name="license_number" 
                    value={formData.license_number}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan nomor lisensi"
                  />
                </div>
                {errors.license_number && <p className="mt-1 text-xs text-red-600">{errors.license_number}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fleet_size" className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Armada
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-ship text-gray-400"></i>
                  </div>
                  <input 
                    type="number"
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="fleet_size" 
                    name="fleet_size" 
                    value={formData.fleet_size}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
                {errors.fleet_size && <p className="mt-1 text-xs text-red-600">{errors.fleet_size}</p>}
              </div>
              
              <div>
                <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Perusahaan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                    <i className="fas fa-map-marker-alt text-gray-400"></i>
                  </div>
                  <textarea
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="company_address" 
                    name="company_address" 
                    rows="3" 
                    value={formData.company_address}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan alamat lengkap perusahaan"
                  />
                </div>
                {errors.company_address && <p className="mt-1 text-xs text-red-600">{errors.company_address}</p>}
              </div>
            </div>
          </div>

          {/* Pengaturan Akun */}
          <div className="mb-6 p-5 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Pengaturan Akun</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400"></i>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="password" 
                    name="password" 
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="8"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}

                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Kekuatan Password:</span>
                    <span className={`text-xs font-medium ${strengthInfo.class}`}>{strengthInfo.text}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength < 50 ? 'bg-red-500' :
                        passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  
                  {/* Password criteria */}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-2 ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-xs ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>Minimal 8 karakter</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-2 ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-xs ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>Huruf besar</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-2 ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-xs ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>Huruf kecil</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-2 ${/[0-9!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-xs ${/[0-9!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>Angka/simbol</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400"></i>
                  </div>
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="password_confirmation" 
                    name="password_confirmation" 
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {formData.password && formData.password_confirmation && (
                  <div className="mt-2">
                    {formData.password === formData.password_confirmation ? (
                      <div className="flex items-center text-green-600">
                        <i className="fas fa-check-circle mr-1"></i>
                        <span className="text-xs">Password cocok</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <i className="fas fa-times-circle mr-1"></i>
                        <span className="text-xs">Password tidak cocok</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rute */}
          <div className="mb-6 p-5 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Rute yang Dikelola</h2>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-3 md:space-y-0">
              {/* Search Input */}
              <div className="relative w-full md:w-1/2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input 
                  type="text" 
                  id="route-search" 
                  placeholder="Cari rute..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button 
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button 
                  type="button" 
                  onClick={selectAllRoutes}
                  className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 flex items-center shadow-sm"
                >
                  <i className="fas fa-check-square mr-2"></i>
                  Pilih Semua
                </button>
                <button 
                  type="button" 
                  onClick={clearAllRoutes}
                  className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 flex items-center shadow-sm"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Hapus Semua
                </button>
              </div>
            </div>

            {/* Route Selection */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 max-h-64 overflow-y-auto">
                {filteredRoutes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredRoutes.map((route) => (
                      <div 
                        key={route.id} 
                        className={`flex items-center p-3 rounded-lg transition duration-150 ${
                          formData.assigned_routes.includes(route.id) 
                            ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                            : 'border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center h-5">
                          <input 
                            type="checkbox"
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition duration-150"
                            id={`route_${route.id}`} 
                            checked={formData.assigned_routes.includes(route.id)}
                            onChange={() => handleRouteChange(route.id)}
                          />
                        </div>
                        <label htmlFor={`route_${route.id}`} className="ml-2 block text-sm text-gray-900 cursor-pointer w-full">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <i className="fas fa-route text-blue-500 mr-2"></i>
                              <span className="font-semibold">
                                {route.origin} - {route.destination}
                              </span>
                            </div>
                            {route.description && (
                              <span className="text-xs text-gray-500 mt-1">{route.description}</span>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-route text-gray-300 text-4xl mb-3"></i>
                    <p className="text-lg font-medium">{searchTerm ? `Tidak ada rute yang cocok dengan "${searchTerm}"` : 'Tidak ada rute tersedia'}</p>
                    <p className="mt-1 text-sm">{searchTerm ? 'Coba gunakan kata kunci lain' : 'Silakan tambahkan rute terlebih dahulu'}</p>
                  </div>
                )}
              </div>
            </div>
            {errors.routes && <p className="mt-2 text-xs text-red-600">{errors.routes}</p>}

            {/* Selected Routes Counter */}
            <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200 inline-flex items-center">
              <div className="mr-3 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm">
                <span className="font-semibold">{formData.assigned_routes.length}</span>
              </div>
              <div>
                <p className="font-medium text-blue-700">Rute dipilih</p>
                <p className="text-xs text-blue-500">Operator akan dapat mengelola rute yang dipilih</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-8 space-x-4">
            <Link 
              to="/admin/operators"
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
                  <i className="fas fa-save mr-2"></i> Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperatorCreate;