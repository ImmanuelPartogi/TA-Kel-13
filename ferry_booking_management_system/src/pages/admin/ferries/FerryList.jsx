import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api'; // Gunakan configured API service

const FerryList = () => {
  const [ferries, setFerries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    registration_number: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  useEffect(() => {
    fetchFerries();
  }, [filters, pagination.current_page]);

  const fetchFerries = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.current_page
      };
      
      // Gunakan configured API service
      const response = await api.get('/admin-panel/ferries', { params });
      
      console.log('Ferries response:', response.data);
      
      // Handle response structure dari Laravel
      if (response.data.success) {
        const paginatedData = response.data.data;
        
        // Set ferries data (array of ferries)
        setFerries(paginatedData.data || []);
        
        // Set pagination info
        setPagination({
          current_page: paginatedData.current_page || 1,
          last_page: paginatedData.last_page || 1,
          per_page: paginatedData.per_page || 10,
          total: paginatedData.total || 0
        });
      } else {
        // Handle error case
        setFerries([]);
        console.error('API returned success: false');
      }
    } catch (error) {
      console.error('Error fetching ferries:', error);
      setFerries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, current_page: 1 });
    fetchFerries();
  };

  const handleReset = () => {
    setFilters({
      name: '',
      registration_number: '',
      status: ''
    });
    setPagination({ ...pagination, current_page: 1 });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kapal ini?')) {
      try {
        const response = await api.delete(`/admin-panel/ferries/${id}`);
        
        if (response.data.success) {
          // Refresh list after successful delete
          fetchFerries();
          alert('Kapal berhasil dihapus');
        } else {
          alert(response.data.message || 'Gagal menghapus kapal');
        }
      } catch (error) {
        console.error('Error deleting ferry:', error);
        alert(error.response?.data?.message || 'Terjadi kesalahan saat menghapus kapal');
      }
    }
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, current_page: page });
  };

  // Helper function untuk mendapatkan URL gambar
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Jika path adalah URL lengkap, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Jika tidak, gabungkan dengan backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    return `${backendUrl}/${imagePath}`;
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Kapal</h1>
        <Link to="/admin/ferries/create" className="mt-3 md:mt-0 flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Kapal
        </Link>
      </div>

      {/* Form Pencarian */}
      <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h2 className="text-lg font-semibold text-blue-600">Filter Kapal</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Kapal</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={filters.name}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 mb-1">Nomor Registrasi</label>
                <input 
                  type="text" 
                  id="registration_number" 
                  name="registration_number" 
                  value={filters.registration_number}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  id="status" 
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Status</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="MAINTENANCE">Perawatan</option>
                  <option value="INACTIVE">Tidak Aktif</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex items-center space-x-3">
              <button type="submit" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Cari
              </button>
              <button type="button" onClick={handleReset} className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md shadow-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Daftar Kapal */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h2 className="text-lg font-semibold text-blue-600">Daftar Kapal</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Registrasi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapasitas Penumpang</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapasitas Kendaraan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun Pembuatan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : ferries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p>Tidak ada data kapal</p>
                    </div>
                  </td>
                </tr>
              ) : (
                ferries.map((ferry) => (
                  <tr key={ferry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {ferry.image ? (
                        <img 
                          src={getImageUrl(ferry.image)} 
                          alt={ferry.name} 
                          className="h-10 w-10 rounded-full object-cover mx-auto" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-ferry-image.png'; // Fallback image
                          }}
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ferry.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ferry.registration_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ferry.capacity_passenger} orang</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-xs space-y-1">
                        <div>Motor: <span className="font-medium">{ferry.capacity_vehicle_motorcycle}</span></div>
                        <div>Mobil: <span className="font-medium">{ferry.capacity_vehicle_car}</span></div>
                        <div>Bus: <span className="font-medium">{ferry.capacity_vehicle_bus}</span></div>
                        <div>Truk: <span className="font-medium">{ferry.capacity_vehicle_truck}</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ferry.status === 'ACTIVE' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Aktif</span>
                      )}
                      {ferry.status === 'MAINTENANCE' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Perawatan</span>
                      )}
                      {ferry.status === 'INACTIVE' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Tidak Aktif</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ferry.year_built || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link to={`/admin/ferries/${ferry.id}`} className="inline-flex items-center px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded shadow-sm transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Detail
                        </Link>
                        <Link to={`/admin/ferries/${ferry.id}/edit`} className="inline-flex items-center px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded shadow-sm transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(ferry.id)}
                          className="inline-flex items-center px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded shadow-sm transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span> - 
              <span className="font-medium">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> dari 
              <span className="font-medium">{pagination.total}</span> hasil
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {/* Pagination numbers - simplified for better UX */}
              {pagination.last_page <= 7 ? (
                // Show all pages if 7 or less
                [...Array(pagination.last_page)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 rounded transition-colors ${
                      pagination.current_page === i + 1 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))
              ) : (
                // Show smart pagination for many pages
                <>
                  {/* Always show first page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    className={`px-3 py-1 rounded transition-colors ${
                      pagination.current_page === 1 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    1
                  </button>

                  {/* Show dots if current page is far from start */}
                  {pagination.current_page > 3 && <span className="px-2">...</span>}

                  {/* Show pages around current page */}
                  {[...Array(3)].map((_, i) => {
                    const page = pagination.current_page - 1 + i;
                    if (page > 1 && page < pagination.last_page) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded transition-colors ${
                            pagination.current_page === page 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                    return null;
                  })}

                  {/* Show dots if current page is far from end */}
                  {pagination.current_page < pagination.last_page - 2 && <span className="px-2">...</span>}

                  {/* Always show last page */}
                  <button
                    onClick={() => handlePageChange(pagination.last_page)}
                    className={`px-3 py-1 rounded transition-colors ${
                      pagination.current_page === pagination.last_page 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {pagination.last_page}
                  </button>
                </>
              )}
              
              <button 
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FerryList;