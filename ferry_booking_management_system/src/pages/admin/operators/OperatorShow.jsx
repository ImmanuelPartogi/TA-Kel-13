import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import adminOperatorService from '../../../services/adminOperator.service';

const OperatorShow = () => {
  const { id } = useParams();
  const [operator, setOperator] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchOperator();
    fetchRoutes();
  }, [id]);

  const fetchOperator = async () => {
    try {
      const data = await adminOperatorService.getOperator(id);
      // Handle direct operator data or operator inside response object
      if (data.operator) {
        setOperator(data.operator);
      } else {
        setOperator(data);
      }
    } catch (error) {
      console.error('Error fetching operator:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const data = await adminOperatorService.getRoutes();
      // Ensure routes is always an array
      if (Array.isArray(data)) {
        setRoutes(data);
      } else if (data && Array.isArray(data.data)) {
        setRoutes(data.data);
      } else {
        console.error('Invalid routes data format:', data);
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes([]);
    }
  };

  if (loading) {
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

  if (!operator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-700">Operator Tidak Ditemukan</h2>
        <p className="text-gray-500 mt-2">Data operator dengan ID {id} tidak dapat ditemukan</p>
        <Link to="/admin/operators" className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Daftar Operator
        </Link>
      </div>
    );
  }

  const assignedRoutes = routes.filter(route =>
    operator.assigned_routes && operator.assigned_routes.includes(route.id)
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Modern Styling */}
      <div className="bg-gradient-to-br from-blue-800 via-blue-600 to-blue-500 rounded-xl shadow-lg mb-8 p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" className="w-full h-full">
            <path d="M472.3 724.1c-142.9 52.5-285.8-46.9-404.6-124.4 104.1 31.6 255-30.3 307.6-130.9 52.5-100.6-17.3-178.1-96.4-193.9 207.6 26.6 285.8 337.7 193.4 449.2z"
              fill="#fff" opacity="0.2" />
            <path d="M472.3 724.1c-142.9 52.5-285.8-46.9-404.6-124.4 104.1 31.6 255-30.3 307.6-130.9 52.5-100.6-17.3-178.1-96.4-193.9 207.6 26.6 285.8 337.7 193.4 449.2z"
              fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeDasharray="10 20" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-start">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{operator.company_name}</h1>
                <p className="mt-1 text-blue-100">ID: {operator.id} | Terdaftar: {new Date(operator.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <Link to={`/admin/operators/${operator.id}/edit`} className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
              <Link to="/admin/operators" className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali
              </Link>
            </div>
          </div>

          {/* Quick Info Stats */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-2 mt-6">
            {/* <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/70 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-xs text-blue-100">Status</p>
                  <p className="text-xl font-bold text-white">Aktif</p>
                </div>
              </div>
            </div> */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/70 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div>
                  <p className="text-xs text-blue-100">Armada</p>
                  <p className="text-xl font-bold text-white">{operator.fleet_size || 0} Unit</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/70 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <div>
                  <p className="text-xs text-blue-100">Rute</p>
                  <p className="text-xl font-bold text-white">{assignedRoutes.length}</p>
                </div>
              </div>
            </div>
            {/* <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/70 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-blue-100">Login Terakhir</p>
                  <p className="text-base font-bold text-white">
                    {operator.last_login ? new Date(operator.last_login).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Belum Login'}
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('info')}
          className={`py-3 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 relative ${activeTab === 'info'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Informasi Dasar
          </div>
        </button>
        <button
          onClick={() => setActiveTab('routes')}
          className={`py-3 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 relative ${activeTab === 'routes'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Rute Dikelola
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full px-2 py-0.5">
              {assignedRoutes.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`py-3 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 relative ${activeTab === 'activity'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Aktivitas
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-xl">
        {/* Informasi Dasar Tab */}
        {activeTab === 'info' && (
          <div>
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">Informasi Operator</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-medium text-gray-700">Informasi Dasar</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 px-6 py-3 bg-gray-50 font-medium text-sm text-gray-600">Nama Perusahaan</div>
                      <div className="sm:w-2/3 px-6 py-3 text-gray-800">{operator.company_name}</div>
                    </div>

                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 px-6 py-3 bg-gray-50 font-medium text-sm text-gray-600">Email</div>
                      <div className="sm:w-2/3 px-6 py-3 text-gray-800">
                        <a href={`mailto:${operator.email}`} className="text-blue-600 hover:underline flex items-center">
                          {operator.email}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 px-6 py-3 bg-gray-50 font-medium text-sm text-gray-600">Nomor Telepon</div>
                      <div className="sm:w-2/3 px-6 py-3 text-gray-800">
                        <a href={`tel:${operator.phone_number}`} className="text-blue-600 hover:underline flex items-center">
                          {operator.phone_number}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 px-6 py-3 bg-gray-50 font-medium text-sm text-gray-600">Jumlah Armada</div>
                      <div className="sm:w-2/3 px-6 py-3 text-gray-800">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {operator.fleet_size || 0} Unit
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-medium text-gray-700">Administrasi</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 px-6 py-3 bg-gray-50 font-medium text-sm text-gray-600">Nomor Lisensi</div>
                      <div className="sm:w-2/3 px-6 py-3 text-gray-800">{operator.license_number}</div>
                    </div>

                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 px-6 py-3 bg-gray-50 font-medium text-sm text-gray-600">Alamat</div>
                      <div className="sm:w-2/3 px-6 py-3 text-gray-800">{operator.company_address}</div>
                    </div>

                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 px-6 py-3 bg-gray-50 font-medium text-sm text-gray-600">Login Terakhir</div>
                      <div className="sm:w-2/3 px-6 py-3 text-gray-800">
                        {operator.last_login ? (
                          <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                            {new Date(operator.last_login).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                            Belum pernah login
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 px-6 py-3 bg-gray-50 font-medium text-sm text-gray-600">Terdaftar Pada</div>
                      <div className="sm:w-2/3 px-6 py-3 text-gray-800">{new Date(operator.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">Status Akun</h3>
                    <p className="text-sm text-blue-700">Aktif</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-100 flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-green-900">Verifikasi Email</h3>
                    <p className="text-sm text-green-700">Terverifikasi</p>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 flex items-center">
                  <div className="bg-indigo-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-indigo-900">Dokumen</h3>
                    <p className="text-sm text-indigo-700">Lengkap</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rute Tab */}
        {activeTab === 'routes' && (
          <div>
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-800">Rute yang Dikelola</h2>
              </div>
              <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                Total: {assignedRoutes.length} Rute
              </div>
            </div>

            <div className="p-6">
              {assignedRoutes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedRoutes.map((route) => (
                    <div key={route.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                          <h3 className="font-medium text-gray-900">Rute ID: {route.id}</h3>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {route.status || 'Aktif'}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-8 flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-700 text-xs font-bold">A</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs text-gray-500">Asal</p>
                            <p className="text-gray-800 font-medium">{route.origin}</p>
                          </div>
                        </div>

                        <div className="ml-4 mb-3 border-l-2 border-dashed border-gray-300 pl-4 py-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </div>

                        <div className="flex items-center">
                          <div className="w-8 flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-700 text-xs font-bold">B</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs text-gray-500">Tujuan</p>
                            <p className="text-gray-800 font-medium">{route.destination}</p>
                          </div>
                        </div>

                        {route.description && (
                          <div className="mt-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
                            {route.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Tidak Ada Rute</h3>
                  <p className="text-gray-500 max-w-md mb-6">Operator ini belum memiliki rute yang dikelola. Tambahkan rute melalui halaman edit operator.</p>
                  <Link to={`/admin/operators/${operator.id}/edit`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah Rute
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aktivitas Tab */}
        {activeTab === 'activity' && (
          <div>
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">Log Aktivitas</h2>
            </div>

            <div className="p-6">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute h-full w-0.5 bg-gray-200 left-7 top-0"></div>

                {/* Timeline items */}
                <div className="space-y-8">
                  <div className="relative">
                    <div className="absolute left-0 top-1 bg-blue-100 border-4 border-white rounded-full h-6 w-6 flex items-center justify-center shadow-md z-10">
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="ml-14">
                      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <h3 className="font-medium text-gray-800">Akun dibuat</h3>
                        <p className="text-sm text-gray-600 mt-1">Akun operator berhasil dibuat di sistem</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(operator.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>

                  {operator.updated_at && operator.updated_at !== operator.created_at && (
                    <div className="relative">
                      <div className="absolute left-0 top-1 bg-green-100 border-4 border-white rounded-full h-6 w-6 flex items-center justify-center shadow-md z-10">
                        <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                      </div>
                      <div className="ml-14">
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                          <h3 className="font-medium text-gray-800">Akun diperbarui</h3>
                          <p className="text-sm text-gray-600 mt-1">Informasi akun operator telah diperbarui</p>
                          <p className="text-xs text-gray-500 mt-2">{new Date(operator.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {operator.last_login && (
                    <div className="relative">
                      <div className="absolute left-0 top-1 bg-indigo-100 border-4 border-white rounded-full h-6 w-6 flex items-center justify-center shadow-md z-10">
                        <div className="h-2 w-2 bg-indigo-600 rounded-full"></div>
                      </div>
                      <div className="ml-14">
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                          <h3 className="font-medium text-gray-800">Login terakhir</h3>
                          <p className="text-sm text-gray-600 mt-1">Operator terakhir kali login ke sistem</p>
                          <p className="text-xs text-gray-500 mt-2">{new Date(operator.last_login).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tombol Aksi Tambahan
      <div className="mt-8 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
        <button
          type="button"
          onClick={() => alert('Fitur ini akan datang segera!')}
          className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition-colors duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak Informasi
        </button>

        <button
          type="button"
          onClick={() => alert('Fitur ini akan datang segera!')}
          className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition-colors duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Kirim Informasi via Email
        </button>

        <button
          type="button"
          onClick={() => window.confirm('Apakah Anda yakin ingin menonaktifkan operator ini?') && alert('Operator berhasil dinonaktifkan')}
          className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center transition-colors duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          Nonaktifkan Operator
        </button>
      </div> */}
    </div>
  );
};

export default OperatorShow;