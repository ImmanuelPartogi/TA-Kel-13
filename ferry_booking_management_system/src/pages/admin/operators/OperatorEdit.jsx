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

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOperatorAndRoutes();
  }, [id]);

  // Filter routes berdasarkan search term
  const filteredRoutes = routes.filter(route => {
    const searchLower = searchTerm.toLowerCase();
    return (
      route.origin?.toLowerCase().includes(searchLower) || 
      route.destination?.toLowerCase().includes(searchLower)
    );
  });

  const fetchOperatorAndRoutes = async () => {
    try {
      setLoading(true);
      // Fetch operator dan routes yang sudah di-assign
      const operatorResponse = await adminOperatorService.getOperatorWithRoutes(id);
      console.log('Operator response:', operatorResponse);
      
      const { operator: operatorData } = operatorResponse;
      
      // Fetch semua routes yang tersedia
      const allRoutesResponse = await adminOperatorService.getRoutes();
      console.log('All routes response:', allRoutesResponse);
      
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
    setFormData({ ...formData, assigned_routes: routes.map(r => r.id) });
  };

  const clearAllRoutes = () => {
    setFormData({ ...formData, assigned_routes: [] });
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

    if (formData.password && formData.password !== formData.password_confirmation) {
      setErrors({ ...errors, password_confirmation: 'Password tidak cocok' });
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
      navigate('/admin/operators');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error('Error updating operator:', error);
        setErrors({ general: 'Terjadi kesalahan saat memperbarui data' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!operator) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-b-4 border-blue-200 rounded-full animate-pulse"></div>
        </div>
        <span className="ml-4 text-lg font-medium text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-8 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-30 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Operator</h1>
              <p className="text-blue-100 mt-1">{operator.company_name} (ID: {operator.id})</p>
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

      {/* Error notification */}
      {errors.general && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-600 rounded-lg p-4 mb-6 shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {errors.general}
              </h3>
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
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            Terakhir diperbarui: {new Date(operator.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
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
                    <input 
                      type="text"
                      className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${errors.phone_number ? 'border-red-500' : ''}`}
                      id="phone_number" 
                      name="phone_number" 
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                    />
                    {errors.phone_number && (
                      <p className="mt-2 text-sm text-red-600">{errors.phone_number}</p>
                    )}
                  </div>
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
                    Password <small className="text-gray-500">(Biarkan kosong jika tidak ingin mengubah)</small>
                  </label>
                  <div className="relative">
                    <input 
                      type="password"
                      className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ${errors.password ? 'border-red-500' : ''}`}
                      id="password" 
                      name="password" 
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol</p>
                </div>
                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input 
                      type="password"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150"
                      id="password_confirmation" 
                      name="password_confirmation" 
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                  </div>
                  {formData.password && formData.password_confirmation && (
                    <p className={`mt-2 text-sm ${formData.password === formData.password_confirmation ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                      {formData.password === formData.password_confirmation ? (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                          </svg>
                          Password cocok
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                          </svg>
                          Password tidak cocok
                        </>
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
                    className="px-3 py-2 text-blue-700 bg-blue-100 text-sm font-medium rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Pilih Semua
                  </button>
                  <button 
                    type="button" 
                    onClick={clearAllRoutes}
                    className="px-3 py-2 text-red-700 bg-red-100 text-sm font-medium rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus Semua
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {filteredRoutes.length > 0 ? (
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
            <div className="flex justify-between">
              <Link to={`/admin/operators/${operator.id}`} className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Lihat Detail
              </Link>

              <div className="flex space-x-3">
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
                  {loading ? 'Memperbarui...' : 'Perbarui'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Info tambahan */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-200">
          <h4 className="font-medium text-blue-700 mb-1 text-sm">Tanggal Pendaftaran</h4>
          <p className="text-gray-700 font-medium">{new Date(operator.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow duration-200">
          <h4 className="font-medium text-indigo-700 mb-1 text-sm">Login Terakhir</h4>
          <p className="text-gray-700 font-medium">
            {operator.last_login ? 
              new Date(operator.last_login).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 
              <span className="text-yellow-600">Belum pernah login</span>
            }
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
          <h4 className="font-medium text-green-700 mb-1 text-sm">Update Terakhir</h4>
          <p className="text-gray-700 font-medium">{new Date(operator.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </div>
  );
};

export default OperatorEdit;