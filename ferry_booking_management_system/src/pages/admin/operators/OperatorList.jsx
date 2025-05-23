import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminOperatorService from '../../../services/adminOperator.service';

const OperatorList = () => {
  const [operators, setOperators] = useState([]);
  const [originalOperators, setOriginalOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOption, setSortOption] = useState('id_asc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [noResults, setNoResults] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [viewMode, setViewMode] = useState('table'); // table or grid
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [stats, setStats] = useState({
    totalOperators: 0,
    activeOperators: 0,
    inactiveOperators: 0,
    totalFleetSize: 0
  });

  useEffect(() => {
    fetchOperators();
    
    // Auto-hide alert after 5 seconds
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({...alert, show: false});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  useEffect(() => {
    if (originalOperators.length > 0) {
      filterAndSortOperators();
    }
  }, [searchText, statusFilter, sortOption, originalOperators]);

  const fetchOperators = async () => {
    setLoading(true);
    try {
      const response = await adminOperatorService.getOperators();

      // Handle response - could be paginated or direct array
      let operatorData = [];

      if (response) {
        if (response.data && Array.isArray(response.data)) {
          // Handle paginated response
          operatorData = response.data;
        } else if (Array.isArray(response)) {
          // Handle direct array response
          operatorData = response;
        } else {
          console.warn('Unexpected response format:', response);
          operatorData = [];
        }
      }

      setOriginalOperators(operatorData);
      
      // Calculate stats
      const activeOps = operatorData.filter(op => op.status === 'active').length;
      const inactiveOps = operatorData.filter(op => op.status === 'inactive').length;
      const totalFleet = operatorData.reduce((sum, op) => sum + (op.fleet_size || 0), 0);
      
      setStats({
        totalOperators: operatorData.length,
        activeOperators: activeOps,
        inactiveOperators: inactiveOps,
        totalFleetSize: totalFleet
      });
      
      filterAndSortOperators(operatorData);
    } catch (error) {
      console.error('Error fetching operators:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal memuat data operator'
      });
      setOperators([]); // Set empty array on error
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOperators = (data) => {
    // Use the provided data or the original data if not provided
    let filtered = [...(data || originalOperators)];

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(operator =>
        (operator.company_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (operator.email || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (operator.phone_number || '').toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(operator => operator.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'id_asc':
          return a.id - b.id;
        case 'id_desc':
          return b.id - a.id;
        case 'company_asc':
          return (a.company_name || '').localeCompare(b.company_name || '');
        case 'company_desc':
          return (b.company_name || '').localeCompare(a.company_name || '');
        case 'last_login_desc': {
          const aLogin = a.last_login ? new Date(a.last_login).getTime() : 0;
          const bLogin = b.last_login ? new Date(b.last_login).getTime() : 0;
          return bLogin - aLogin;
        }
        default:
          return 0;
      }
    });

    setOperators(filtered);
    setNoResults(filtered.length === 0);
  };

  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteModal(true);
  };

  const viewOperatorDetail = (operator) => {
    setSelectedOperator(operator);
    setShowDetailModal(true);
  };

  const handleDelete = async () => {
    try {
      await adminOperatorService.delete(`/admin-panel/operators/${deleteId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAlert({
        show: true,
        type: 'success',
        message: 'Operator berhasil dihapus'
      });
      fetchOperators();
    } catch (error) {
      console.error('Error deleting operator:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal menghapus operator'
      });
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleReset = () => {
    setSearchText('');
    setStatusFilter('');
    setSortOption('id_asc');
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
          Aktif
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-1.5"></span>
          Nonaktif
        </span>
      );
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Belum pernah login';
    
    try {
      return new Date(dateString).toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'Format tanggal invalid';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Modern Header */}
      <div className="bg-gradient-to-br from-blue-800 via-blue-600 to-blue-500 p-8 text-white relative">
        <div className="absolute inset-0 opacity-20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" className="w-full h-full">
            <path d="M472.3 724.1c-142.9 52.5-285.8-46.9-404.6-124.4 104.1 31.6 255-30.3 307.6-130.9 52.5-100.6-17.3-178.1-96.4-193.9 207.6 26.6 285.8 337.7 193.4 449.2z" 
                  fill="#fff" opacity="0.2" />
            <path d="M472.3 724.1c-142.9 52.5-285.8-46.9-404.6-124.4 104.1 31.6 255-30.3 307.6-130.9 52.5-100.6-17.3-178.1-96.4-193.9 207.6 26.6 285.8 337.7 193.4 449.2z" 
                  fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeDasharray="10 20" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-4">
                <i className="fas fa-building text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Manajemen Operator</h1>
                <p className="mt-1 text-blue-100">Kelola seluruh operator dalam sistem</p>
              </div>
            </div>
            
            <div>
              <Link to="/admin/operators/create"
                className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                <i className="fas fa-plus mr-2"></i> Tambah Operator
              </Link>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Total Operator</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-building mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{stats.totalOperators}</span>
              </div>
            </div>
            
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-100 text-sm">Operator Aktif</p>
                <div className="flex items-center mt-1">
                  <i className="fas fa-check-circle mr-2 text-blue-100"></i>
                  <span className="text-2xl font-bold">{stats.activeOperators}</span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-100 text-sm">Operator Nonaktif</p>
                <div className="flex items-center mt-1">
                  <i className="fas fa-times-circle mr-2 text-blue-100"></i>
                  <span className="text-2xl font-bold">{stats.inactiveOperators}</span>
                </div>
              </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Total Armada</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-ship mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{stats.totalFleetSize}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Alert Messages with modern styling */}
        {alert.show && (
          <div className={`mb-6 rounded-lg shadow-lg overflow-hidden animate-slideIn`}>
            <div className={`${alert.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} px-4 py-2 text-white flex items-center justify-between`}>
              <div className="flex items-center">
                <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                <span className="font-medium">{alert.type === 'success' ? 'Sukses' : 'Error'}</span>
              </div>
              <button onClick={() => setAlert({...alert, show: false})} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={`${alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'} px-4 py-3 border-t`}>
              {alert.message}
            </div>
          </div>
        )}

        {/* Modern Filter Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-8 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <i className="fas fa-filter text-blue-500 mr-2"></i>
              Filter & Pencarian
            </h2>
          </div>
          
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="searchInput" className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-search text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    id="searchInput"
                    placeholder="Cari nama perusahaan, email, atau telepon"
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-toggle-on text-gray-400"></i>
                  </div>
                  <select
                    id="statusFilter"
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="sortOptions" className="block text-sm font-medium text-gray-700 mb-1">Urutkan</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-sort text-gray-400"></i>
                  </div>
                  <select
                    id="sortOptions"
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
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

            <div className="mt-6 flex justify-end space-x-3">
              {(searchText || statusFilter || sortOption !== 'id_asc') && (
                <button
                  onClick={handleReset}
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <i className="fas fa-times mr-2"></i> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Toggle & Result Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">
            {operators.length > 0 ? (
              <>
                Menampilkan <span className="font-medium">{operators.length}</span> dari 
                <span className="font-medium"> {originalOperators.length}</span> operator
              </>
            ) : (
              <span>Tidak ada hasil yang ditemukan</span>
            )}
          </p>
          
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-gray-100 rounded-lg flex">
              <button 
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <i className="fas fa-list"></i>
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <i className="fas fa-th-large"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-8 text-center">
            <div className="inline-block relative">
              <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="mt-4 text-gray-600">Memuat data operator...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && noResults && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-building text-gray-400 text-4xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Tidak Ada Data Operator</h3>
            <p className="text-gray-600 mb-6">
              {searchText || statusFilter || sortOption !== 'id_asc'
                ? 'Tidak ada operator yang sesuai dengan kriteria pencarian Anda.'
                : 'Belum ada operator yang terdaftar dalam sistem.'}
            </p>
            <div className="flex justify-center space-x-4">
              {searchText || statusFilter || sortOption !== 'id_asc' ? (
                <button 
                  onClick={handleReset}
                  className="inline-flex items-center px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-sm">
                  <i className="fas fa-sync-alt mr-2"></i> Reset Filter
                </button>
              ) : (
                <Link to="/admin/operators/create" className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
                  <i className="fas fa-plus mr-2"></i> Tambah Operator
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Table View */}
        {!loading && !noResults && viewMode === 'table' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perusahaan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lisensi</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Armada</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Terakhir</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {operators.map((operator) => (
                    <tr key={operator.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <i className="fas fa-building"></i>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{operator.company_name}</div>
                            <div className="text-xs text-gray-500">ID: {operator.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{operator.email}</div>
                        <div className="text-sm text-gray-500">{operator.phone_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">
                            <i className="fas fa-id-card mr-1"></i> {operator.license_number || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-medium">
                            <i className="fas fa-ship mr-1"></i> {operator.fleet_size || 0} Kapal
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(operator.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(operator.last_login)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => viewOperatorDetail(operator)}
                            className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                            title="Detail">
                            <i className="fas fa-eye"></i>
                          </button>
                          <Link to={`/admin/operators/${operator.id}/edit`}
                            className="btn-icon bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded-lg transition-colors"
                            title="Edit">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            onClick={() => confirmDelete(operator.id, operator.company_name)}
                            className="btn-icon bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grid View */}
        {!loading && !noResults && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {operators.map(operator => (
              <div key={operator.id} className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-28 bg-gradient-to-r from-blue-500 to-blue-600 relative">
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fas fa-building text-white text-5xl opacity-25"></i>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="text-xl font-bold">{operator.company_name}</h3>
                    <p className="text-sm text-white/80">{operator.license_number || 'No License'}</p>
                  </div>
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(operator.status)}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-blue-600 mb-1">Email</p>
                      <div className="flex items-center justify-center">
                        <i className="fas fa-envelope text-blue-400 mr-1"></i>
                        <span className="text-sm font-semibold text-blue-700 truncate max-w-[120px]">
                          {operator.email || 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-emerald-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-emerald-600 mb-1">Telepon</p>
                      <div className="flex items-center justify-center">
                        <i className="fas fa-phone text-emerald-400 mr-1"></i>
                        <span className="text-sm font-semibold text-emerald-700">
                          {operator.phone_number || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Armada</p>
                        <p className="text-sm font-medium">
                          <i className="fas fa-ship text-gray-400 mr-1"></i> {operator.fleet_size || 0} Kapal
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Login Terakhir</p>
                        <p className="text-sm font-medium truncate max-w-[150px]">
                          {operator.last_login ? formatDate(operator.last_login).split(' ')[0] : 'Belum pernah'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between border-t border-gray-100 pt-4">
                    <button
                      onClick={() => viewOperatorDetail(operator)}
                      className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <Link to={`/admin/operators/${operator.id}/edit`} className="btn-icon bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded-lg transition-colors">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      onClick={() => confirmDelete(operator.id, operator.company_name)}
                      className="btn-icon bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Operator Detail Modal */}
      {showDetailModal && selectedOperator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl transform transition-all animate-modal-in">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-building text-blue-500 mr-2"></i>
                Detail Operator
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Informasi Perusahaan</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                          <i className="fas fa-building text-2xl"></i>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">{selectedOperator.company_name}</h2>
                          <p className="text-gray-500">ID: {selectedOperator.id}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <div className="mt-1">{getStatusBadge(selectedOperator.status)}</div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Nomor Lisensi</p>
                          <p className="text-sm font-medium">{selectedOperator.license_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Jumlah Armada</p>
                          <p className="text-sm font-medium">{selectedOperator.fleet_size || 0} Kapal</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Login Terakhir</p>
                          <p className="text-sm font-medium">{formatDate(selectedOperator.last_login)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Alamat</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        {selectedOperator.address || 'Alamat tidak tersedia'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Informasi Kontak</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium">{selectedOperator.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Telepon:</span>
                        <span className="text-sm font-medium">{selectedOperator.phone_number || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Website:</span>
                        <span className="text-sm font-medium">{selectedOperator.website || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Catatan</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        {selectedOperator.notes || 'Tidak ada catatan untuk operator ini'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Tindakan Cepat</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Link 
                          to={`/admin/operators/${selectedOperator.id}/edit`}
                          className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => setShowDetailModal(false)}
                        >
                          <i className="fas fa-edit mr-2"></i> Edit Operator
                        </Link>
                        <button
                          onClick={() => {
                            setShowDetailModal(false);
                            confirmDelete(selectedOperator.id, selectedOperator.company_name);
                          }}
                          className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
                        >
                          <i className="fas fa-trash mr-2"></i> Hapus Operator
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50"
                >
                  <i className="fas fa-times mr-2"></i> Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-modal-in">
            <div className="p-6">
              <div className="text-center mb-5">
                <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus operator:</p>
                <div className="bg-gray-50 rounded-lg p-3 mt-3 border border-gray-200">
                  <p className="font-semibold text-lg text-gray-800">{deleteName}</p>
                </div>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">
                      Menghapus operator akan menghapus semua data terkait. Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDelete}
                  className="w-full py-3 px-4 bg-red-500 rounded-lg text-white font-medium hover:bg-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i> Hapus Operator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations and button styling */}
      <style>{`
        .btn-icon {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        
        .btn-icon:hover {
          transform: translateY(-2px);
        }
        
        @keyframes modal-in {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-modal-in {
          animation: modal-in 0.3s ease-out forwards;
        }
        
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OperatorList;