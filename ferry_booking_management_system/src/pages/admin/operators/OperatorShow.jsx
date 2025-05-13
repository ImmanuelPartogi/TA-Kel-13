import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const OperatorShow = () => {
  const { id } = useParams();
  const [operator, setOperator] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperator();
    fetchRoutes();
  }, [id]);

  const fetchOperator = async () => {
    try {
      const response = await axios.get(`/admin-panel/operators/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setOperator(response.data);
    } catch (error) {
      console.error('Error fetching operator:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!operator) {
    return <div>Operator not found</div>;
  }

  const assignedRoutes = routes.filter(route =>
    operator.assigned_routes && operator.assigned_routes.includes(route.id)
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-8 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-30 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Detail Operator</h1>
              <p className="text-blue-100 mt-1">ID: {operator.id} | Terdaftar: {new Date(operator.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link to={`/admin/operators/${operator.id}/edit`} className="inline-flex items-center px-4 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200 transition-colors duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <Link to="/admin/operators" className="inline-flex items-center px-4 py-2 bg-blue-800 bg-opacity-50 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card Informasi Utama */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-lg">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">Informasi Operator</h2>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Nama Perusahaan</div>
                <div className="md:w-2/3 px-6 py-4 text-gray-800">{operator.company_name}</div>
              </div>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Email</div>
                <div className="md:w-2/3 px-6 py-4 text-gray-800">
                  <a href={`mailto:${operator.email}`} className="text-blue-600 hover:underline">{operator.email}</a>
                </div>
              </div>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Nomor Telepon</div>
                <div className="md:w-2/3 px-6 py-4 text-gray-800">
                  <a href={`tel:${operator.phone_number}`} className="text-blue-600 hover:underline">{operator.phone_number}</a>
                </div>
              </div>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Nomor Lisensi</div>
                <div className="md:w-2/3 px-6 py-4 text-gray-800">{operator.license_number}</div>
              </div>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Jumlah Armada</div>
                <div className="md:w-2/3 px-6 py-4 text-gray-800">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {operator.fleet_size} Unit
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Alamat Perusahaan</div>
                <div className="md:w-2/3 px-6 py-4 text-gray-800">{operator.company_address}</div>
              </div>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Login Terakhir</div>
                <div className="md:w-2/3 px-6 py-4 text-gray-800">
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

              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Tanggal Registrasi</div>
                <div className="md:w-2/3 px-6 py-4 text-gray-800">{new Date(operator.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Terakhir Diperbarui</div>
                <div className="md:w-2/3 px-6 py-4 text-gray-800">{new Date(operator.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Rute yang Dikelola */}
        <div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-lg h-full">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">Rute yang Dikelola</h2>
            </div>

            <div className="p-6">
              {assignedRoutes.length > 0 ? (
                <div className="space-y-3">
                  {assignedRoutes.map((route) => (
                    <div key={route.id} className="p-4 border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </span>
                          <div>
                            <h3 className="font-medium text-gray-900">{route.origin} - {route.destination}</h3>
                            {route.description && (
                              <p className="text-sm text-gray-500 mt-1">{route.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">ID: {route.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-gray-500">Operator ini belum memiliki rute yang dikelola</p>
                </div>
              )}<div className="mt-4 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Total: {assignedRoutes.length} Rute
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Aksi Tambahan */}
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
      </div>
    </div>
  );
};

export default OperatorShow;