import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import adminOperatorService from '../../../services/adminOperator.service';

const OperatorEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [operator, setOperator] = useState(null);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchOperatorAndRoutes();

    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [id, alert.show]);

  const fetchOperatorAndRoutes = async () => {
    try {
      setLoading(true);
      // Fetch operator dan routes yang sudah di-assign
      const operatorResponse = await adminOperatorService.getOperatorWithRoutes(id);

      const { operator: operatorData } = operatorResponse;

      // Fetch semua routes yang tersedia
      const allRoutesResponse = await adminOperatorService.getRoutes();

      // Ensure routes is an array
      let allRoutes = [];
      if (Array.isArray(allRoutesResponse)) {
        allRoutes = allRoutesResponse;
      } else if (allRoutesResponse && Array.isArray(allRoutesResponse.data)) {
        allRoutes = allRoutesResponse.data;
      } else if (allRoutesResponse && Array.isArray(allRoutesResponse.routes)) {
        allRoutes = allRoutesResponse.routes;
      }

      setOperator(operatorData);
      setRoutes(allRoutes);

      // Ensure assigned_routes is an array
      const assignedRouteIds = Array.isArray(operatorData.assigned_routes)
        ? operatorData.assigned_routes
        : [];

      // Set form data dengan data operator
      setFormData({
        company_name: operatorData.company_name || '',
        email: operatorData.email || '',
        phone_number: operatorData.phone_number || '',
        license_number: operatorData.license_number || '',
        fleet_size: operatorData.fleet_size || 0,
        company_address: operatorData.company_address || '',
        password: '',
        password_confirmation: '',
        assigned_routes: assignedRouteIds
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrors({ general: 'Gagal memuat data operator' });
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal memuat data operator'
      });
    } finally {
      setLoading(false);
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
      setAlert({
        show: true,
        type: 'error',
        message: 'Pilih minimal satu rute yang dikelola'
      });
      setLoading(false);
      return;
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      setErrors({ ...errors, password_confirmation: 'Password tidak cocok' });
      setAlert({
        show: true,
        type: 'error',
        message: 'Password tidak cocok'
      });
      setLoading(false);
      return;
    }

    const dataToSend = { ...formData };
    if (!dataToSend.password) {
      delete dataToSend.password;
      delete dataToSend.password_confirmation;
    }

    try {
      await adminOperatorService.updateOperator(id, dataToSend);
      setAlert({
        show: true,
        type: 'success',
        message: 'Data operator berhasil diperbarui'
      });
      setTimeout(() => {
        navigate('/admin/operators');
      }, 2000);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error('Error updating operator:', error);
        setErrors({ general: 'Terjadi kesalahan saat memperbarui data' });
      }
      setAlert({
        show: true,
        type: 'error',
        message: 'Terjadi kesalahan saat memperbarui data'
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(formData.password);
  const strengthInfo = getPasswordStrengthText(passwordStrength);

  // Mengubah objek errors ke array untuk tampilan yang konsisten dengan FerryCreate
  const errorMessages = errors.general
    ? [errors.general]
    : Object.values(errors).filter(error => error !== undefined);

  // Filter routes based on searchTerm
  const filteredRoutes = routes.filter(route =>
    `${route.origin} - ${route.destination}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (route.description && route.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!operator) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin mb-4"></div>
          <span className="text-lg font-medium text-gray-700">Memuat data operator...</span>
          <p className="mt-2 text-sm text-gray-500">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header Section - Selaras dengan FerryCreate */}
      <div className="page-header p-6 text-white relative bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <i className="fas fa-edit mr-3 text-blue-200"></i> Edit Operator
            </h1>
            <div className="flex items-center mt-1">
              <span className="text-sm font-medium text-blue-100">ID: {operator.id}</span>
              <span className="mx-2 text-white/50">•</span>
              <span className="text-sm font-medium text-blue-100">{operator.company_name}</span>
            </div>
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
        {/* Alert Messages */}
        {alert.show && (
          <div className={`mb-6 rounded-lg shadow-md overflow-hidden animate-fade-in-down`}>
            <div className={`${alert.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} px-4 py-3 text-white flex items-center justify-between`}>
              <div className="flex items-center">
                <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                <span className="font-medium">{alert.type === 'success' ? 'Sukses' : 'Error'}</span>
              </div>
              <button onClick={() => setAlert({ ...alert, show: false })} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={`${alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'} px-4 py-3 border-t`}>
              {alert.message}
            </div>
          </div>
        )}

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
                  Password <small className="text-gray-500">(Biarkan kosong jika tidak ingin mengubah)</small>
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

                {formData.password && (
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
                )}
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password
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

          {/* Status Operator */}
          <div className="mb-6 p-5 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Status Operator</h2>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-user-shield text-gray-400"></i>
                </div>
                <select
                  id="status"
                  name="status"
                  value={formData.status || 'ACTIVE'}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Nonaktif</option>
                  <option value="SUSPENDED">Ditangguhkan</option>
                </select>
              </div>
              {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
              <p className="mt-2 text-sm text-gray-500">
                <i className="fas fa-info-circle mr-1"></i>
                Operator dengan status Nonaktif atau Ditangguhkan tidak dapat login ke sistem.
              </p>
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
                        className={`flex items-center p-3 rounded-lg transition duration-150 ${formData.assigned_routes.includes(route.id)
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
            <Link
              to={`/admin/operators/${operator.id}`}
              className="px-6 py-2 border border-blue-300 shadow-sm text-base font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <i className="fas fa-eye mr-2"></i> Lihat Detail
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Memperbarui...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i> Perbarui Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CSS untuk animasi */}
      <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OperatorEdit;