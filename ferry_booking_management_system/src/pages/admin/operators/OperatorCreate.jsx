import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import Swal from 'sweetalert2';

const OperatorCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [errors, setErrors] = useState({});
  
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

  // UI state
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthText, setPasswordStrengthText] = useState('Lemah');
  const [passwordStrengthClass, setPasswordStrengthClass] = useState('bg-red-500');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [routeSearch, setRouteSearch] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/admin-panel/routes');
      setRoutes(response.data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat data rute.'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Validasi password strength saat password berubah
    if (name === 'password') {
      checkPasswordStrength(value);
    }

    // Validasi password match saat password atau konfirmasi berubah
    if (name === 'password' || name === 'password_confirmation') {
      checkPasswordMatch(name === 'password' ? value : formData.password, 
                        name === 'password_confirmation' ? value : formData.password_confirmation);
    }
  };

  const handleRouteChange = (e) => {
    const { value, checked } = e.target;
    const routeId = parseInt(value);
    
    if (checked) {
      setFormData(prevState => ({
        ...prevState,
        assigned_routes: [...prevState.assigned_routes, routeId]
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        assigned_routes: prevState.assigned_routes.filter(id => id !== routeId)
      }));
    }
  };

  const handleSelectAllRoutes = () => {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Apakah Anda yakin ingin memilih semua rute?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Lanjutkan',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData(prevState => ({
          ...prevState,
          assigned_routes: routes.map(route => route.id)
        }));
      }
    });
  };

  const handleClearAllRoutes = () => {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Apakah Anda yakin ingin menghapus semua pilihan rute?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Lanjutkan',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData(prevState => ({
          ...prevState,
          assigned_routes: []
        }));
      }
    });
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    
    // Minimal 8 karakter
    if (password.length >= 8) strength += 25;
    
    // Mengandung huruf besar
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Mengandung huruf kecil
    if (/[a-z]/.test(password)) strength += 25;
    
    // Mengandung angka atau simbol
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
    
    // Perbarui warna dan teks kekuatan password
    if (strength < 50) {
      setPasswordStrengthClass('bg-red-500');
      setPasswordStrengthText('Lemah');
    } else if (strength < 75) {
      setPasswordStrengthClass('bg-yellow-500');
      setPasswordStrengthText('Sedang');
    } else {
      setPasswordStrengthClass('bg-green-500');
      setPasswordStrengthText('Kuat');
    }
  };

  const checkPasswordMatch = (password, confirmPassword) => {
    if (confirmPassword === '') {
      setPasswordsMatch(true);
      return;
    }
    
    setPasswordsMatch(password === confirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validasi field required
    if (!formData.company_name.trim()) newErrors.company_name = 'Nama perusahaan wajib diisi';
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Nomor telepon wajib diisi';
    if (!formData.license_number.trim()) newErrors.license_number = 'Nomor lisensi wajib diisi';
    if (!formData.company_address.trim()) newErrors.company_address = 'Alamat perusahaan wajib diisi';
    if (!formData.password) newErrors.password = 'Password wajib diisi';
    if (!formData.password_confirmation) newErrors.password_confirmation = 'Konfirmasi password wajib diisi';
    
    // Validasi format email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailPattern.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    // Validasi password
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }
    
    // Validasi password dan konfirmasi
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Password dan konfirmasi tidak cocok';
    }
    
    // Validasi rute
    if (formData.assigned_routes.length === 0) {
      newErrors.assigned_routes = 'Pilih minimal satu rute';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        text: 'Silakan periksa kembali form Anda'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post('/admin-panel/operators', formData);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Operator berhasil ditambahkan',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate('/admin/operators');
      });
    } catch (error) {
      console.error('Error adding operator:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Gagal menambahkan operator'
        });
      }
      
      setLoading(false);
    }
  };

  // Filter rute berdasarkan pencarian
  const filteredRoutes = routes.filter(route => {
    const routeName = `${route.origin} - ${route.destination}`.toLowerCase();
    return routeName.includes(routeSearch.toLowerCase());
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header dengan gradient background */}
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
            <Link to="/admin/operators" 
                  className="inline-flex items-center px-4 py-2 bg-blue-800 bg-opacity-50 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
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
                    />
                  </div>
                  {errors.phone_number ? (
                    <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">Format: +62xxx atau 08xxx (10-15 digit)</p>
                  )}
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
                    value={formData.company_address}
                    onChange={handleChange}
                    rows="3"
                    required
                  ></textarea>
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
                      type={showPassword ? 'text' : 'password'}
                      className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${errors.password ? 'border-red-500' : ''}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${showPassword ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  ) : (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Kekuatan Password:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength < 50 ? 'text-red-500' : 
                          passwordStrength < 75 ? 'text-yellow-500' : 
                          'text-green-500'
                        }`}>
                          {passwordStrengthText}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`${passwordStrengthClass} h-2 rounded-full transition-all duration-300`} style={{ width: `${passwordStrength}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol</p>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${!passwordsMatch && formData.password_confirmation ? 'border-red-500' : ''}`}
                      id="password_confirmation"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      required
                      minLength="8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${showConfirmPassword ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  {formData.password_confirmation && !passwordsMatch ? (
                    <p className="mt-1 text-sm text-red-600">Password tidak cocok</p>
                  ) : formData.password_confirmation && passwordsMatch ? (
                    <p className="mt-1 text-sm text-green-600">Password cocok</p>
                  ) : null}
                  {errors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
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
                    value={routeSearch}
                    onChange={(e) => setRouteSearch(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSelectAllRoutes}
                    className="px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                  >
                    Pilih Semua
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllRoutes}
                    className="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150"
                  >
                    Hapus Semua
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-4 max-h-60 overflow-y-auto">
                  {filteredRoutes.length > 0 ? (
                    filteredRoutes.map((route) => (
                      <div key={route.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition duration-150">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition duration-150"
                            id={`route_${route.id}`}
                            name="assigned_routes"
                            value={route.id}
                            checked={formData.assigned_routes.includes(route.id)}
                            onChange={handleRouteChange}
                          />
                        </div>
                        <label htmlFor={`route_${route.id}`} className="ml-2 block text-sm text-gray-900 cursor-pointer">
                          <span className="font-medium">{route.origin} - {route.destination}</span>
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-4 text-center text-gray-500">
                      Tidak ada rute yang cocok dengan pencarian Anda
                    </div>
                  )}
                </div>
              </div>

              {errors.assigned_routes && (
                <p className="mt-2 text-sm text-red-600">{errors.assigned_routes}</p>
              )}

              <div className="mt-2 text-sm text-gray-500">
                <span>{formData.assigned_routes.length}</span> rute dipilih
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <Link
                to="/admin/operators"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 flex items-center`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OperatorCreate;