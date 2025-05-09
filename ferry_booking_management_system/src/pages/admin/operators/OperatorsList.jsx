import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import Swal from 'sweetalert2';

const OperatorList = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });
  
  // State untuk filter dan pencarian
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOption, setSortOption] = useState('id_asc');
  const [showNoResults, setShowNoResults] = useState(false);

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/admin-panel/operators', { 
        params: { page } 
      });
      setOperators(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching operators:', error);
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchOperators(page);
  };

  const handleDelete = (id, companyName) => {
    Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus operator "${companyName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin-panel/operators/${id}`);
          Swal.fire(
            'Berhasil Dihapus!',
            `Operator ${companyName} telah dihapus.`,
            'success'
          );
          fetchOperators(pagination.current_page);
        } catch (error) {
          console.error('Error deleting operator:', error);
          Swal.fire(
            'Error',
            'Gagal menghapus operator.',
            'error'
          );
        }
      }
    });
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    filterOperators();
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    filterOperators();
  };

  const handleSort = (e) => {
    setSortOption(e.target.value);
    filterOperators();
  };

  const filterOperators = () => {
    const filteredOperators = operators.filter(operator => {
      const matchesSearch = 
        operator.company_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        operator.email.toLowerCase().includes(searchValue.toLowerCase()) ||
        operator.phone_number.toLowerCase().includes(searchValue.toLowerCase());
      
      const matchesStatus = statusFilter === '' || operator.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort the filtered operators
    const sortedOperators = [...filteredOperators].sort((a, b) => {
      switch(sortOption) {
        case 'id_asc':
          return a.id - b.id;
        case 'id_desc':
          return b.id - a.id;
        case 'company_asc':
          return a.company_name.localeCompare(b.company_name);
        case 'company_desc':
          return b.company_name.localeCompare(a.company_name);
        case 'last_login_desc': {
          const aTimestamp = a.last_login ? new Date(a.last_login).getTime() : 0;
          const bTimestamp = b.last_login ? new Date(b.last_login).getTime() : 0;
          return bTimestamp - aTimestamp;
        }
        default:
          return 0;
      }
    });

    setShowNoResults(sortedOperators.length === 0);
    return sortedOperators;
  };

  const filteredAndSortedOperators = operators.length > 0 ? filterOperators() : [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2 md:mb-0">Manajemen Operator</h1>
        <Link 
          to="/admin/operators/create" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Operator
        </Link>
      </div>

      {/* Filter dan Pencarian */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-blue-600">Filter dan Pencarian</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="searchInput" className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
              <input 
                type="text" 
                id="searchInput" 
                placeholder="Cari nama perusahaan, email, atau telepon" 
                className="w-full px-4 py-2 border rounded-md"
                value={searchValue}
                onChange={handleSearch}
              />
            </div>
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                id="statusFilter" 
                className="w-full px-4 py-2 border rounded-md"
                value={statusFilter}
                onChange={handleStatusFilter}
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
            <div>
              <label htmlFor="sortOptions" className="block text-sm font-medium text-gray-700 mb-1">Urutkan</label>
              <select 
                id="sortOptions" 
                className="w-full px-4 py-2 border rounded-md"
                value={sortOption}
                onChange={handleSort}
              >
                <option value="id_asc">ID (Asc)</option>
                <option value="id_desc">ID (Desc)</option>
                <option value="company_asc">Nama Perusahaan (A-Z)</option>
                <option value="company_desc">Nama Perusahaan (Z-A)</option>
                <option value="last_login_desc">Login Terakhir (Terbaru)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* No Results Message */}
      {showNoResults && (
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Tidak ada operator yang sesuai dengan kriteria pencarian Anda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Daftar Operator */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-blue-600">Daftar Operator</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Perusahaan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telepon</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Lisensi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Armada</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Terakhir</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredAndSortedOperators.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data operator
                  </td>
                </tr>
              ) : (
                filteredAndSortedOperators.map((operator) => (
                  <tr key={operator.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{operator.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{operator.company_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{operator.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{operator.phone_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{operator.license_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{operator.fleet_size}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {operator.last_login 
                        ? new Date(operator.last_login).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Belum pernah login'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/admin/operators/${operator.id}`}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Detail
                        </Link>
                        <Link 
                          to={`/admin/operators/${operator.id}/edit`}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(operator.id, operator.company_name)}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan {(pagination.current_page - 1) * (pagination.per_page || 10) + 1} - {Math.min(pagination.current_page * (pagination.per_page || 10), pagination.total)} dari {pagination.total} data
            </div>
            <div className="flex space-x-1">
              {Array.from({ length: pagination.last_page }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded-md ${
                    pagination.current_page === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorList;