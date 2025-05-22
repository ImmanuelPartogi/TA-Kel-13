import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminUserService from '../../../services/adminUser.service';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeUsers: 0,
    avgBookingsPerUser: 0
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [viewMode, setViewMode] = useState('table'); // table or grid
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUsers();

    // Auto-hide alert after 5 seconds
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({...alert, show: false});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pagination.currentPage, filters, alert.show]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        ...filters
      };
      
      const response = await adminUserService.getUsers(params);
      
      // Handle response structure from Laravel
      if (response.status === 'success' && response.data) {
        const data = response.data;
        
        // Set users array from paginated data
        setUsers(data.users.data || []);
        
        // Set pagination info
        setPagination({
          currentPage: data.users.current_page || 1,
          lastPage: data.users.last_page || 1,
          total: data.users.total || 0
        });
        
        // Set stats
        setStats({
          totalUsers: data.stats.total_users || 0,
          newUsersThisMonth: data.stats.new_users_this_month || 0,
          activeUsers: data.stats.active_users || 0,
          avgBookingsPerUser: data.stats.avg_bookings_per_user || 0
        });
      } else {
        // Handle error case
        setUsers([]);
        setAlert({
          show: true,
          type: 'error',
          message: 'Gagal memuat data pengguna'
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setAlert({
        show: true,
        type: 'error',
        message: 'Terjadi kesalahan saat memuat data pengguna'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchUsers();
  };

  const handleReset = () => {
    setFilters({
      name: '',
      email: '',
      phone: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setTimeout(() => fetchUsers(), 0);
  };

  const confirmDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await adminUserService.deleteUser(selectedUser.id);
      
      if (response.status === 'success') {
        // Refresh data after successful delete
        fetchUsers();
        setShowDeleteModal(false);
        setSelectedUser(null);
        setAlert({
          show: true,
          type: 'success',
          message: 'Pengguna berhasil dihapus'
        });
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: response.message || 'Gagal menghapus pengguna'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Terjadi kesalahan saat menghapus pengguna'
      });
    }
  };

  const viewUserDetail = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.lastPage) return;
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const getFirstItem = () => ((pagination.currentPage - 1) * 10) + 1;
  const getLastItem = () => Math.min(pagination.currentPage * 10, pagination.total);

  const getUserStatusBadge = (user) => {
    // Assume user is active if they have bookings or have recent account creation
    const isActive = user.total_bookings > 0 || new Date(user.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    if (isActive) {
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
          Tidak Aktif
        </span>
      );
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
                <i className="fas fa-users text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
                <p className="mt-1 text-blue-100">Kelola seluruh pengguna dalam sistem</p>
              </div>
            </div>
            
            <div>
              <Link to="/admin/users/create"
                className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                <i className="fas fa-user-plus mr-2"></i> Tambah Pengguna
              </Link>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Total Pengguna</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-users mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{stats.totalUsers}</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Pengguna Baru (Bulan Ini)</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-user-plus mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{stats.newUsersThisMonth}</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Pengguna Aktif</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-user-check mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{stats.activeUsers}</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Rata-rata Booking/Pengguna</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-ticket-alt mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{stats.avgBookingsPerUser.toFixed(1)}</span>
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
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-user text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={filters.name}
                      onChange={handleFilterChange}
                      placeholder="Cari nama pengguna..."
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-envelope text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="email"
                      name="email"
                      value={filters.email}
                      onChange={handleFilterChange}
                      placeholder="Cari email..."
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-phone text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={filters.phone}
                      onChange={handleFilterChange}
                      placeholder="Cari nomor telepon..."
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {(filters.name || filters.email || filters.phone) && (
                  <button
                    onClick={handleReset}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    <i className="fas fa-times mr-2"></i> Reset
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <i className="fas fa-search mr-2"></i> Cari
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* View Toggle & Result Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">
            {pagination.total > 0 ? (
              <>
                Menampilkan <span className="font-medium">{getFirstItem()}</span> - 
                <span className="font-medium"> {getLastItem()}</span> dari 
                <span className="font-medium"> {pagination.total}</span> pengguna
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
            <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-users text-gray-400 text-4xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Data Pengguna</h3>
            <p className="text-gray-600 mb-6">Belum ada pengguna yang ditemukan atau sesuai dengan filter yang Anda pilih</p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={handleReset}
                className="inline-flex items-center px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-sm">
                <i className="fas fa-sync-alt mr-2"></i> Reset Filter
              </button>
              <Link to="/admin/users/create" className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
                <i className="fas fa-user-plus mr-2"></i> Tambah Pengguna
              </Link>
            </div>
          </div>
        )}

        {/* Table View */}
        {!loading && users.length > 0 && viewMode === 'table' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Daftar</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktivitas</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <i className="fas fa-user"></i>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone || 'No Phone'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getUserStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span className="font-medium">{formatDate(user.created_at)}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(user.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-900">
                            <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">
                              <i className="fas fa-ticket-alt mr-1"></i> {user.total_bookings || 0} Booking
                            </span>
                          </div>
                          {user.last_booking_date && (
                            <div className="text-xs text-gray-500 mt-1">
                              Terakhir: {formatDate(user.last_booking_date)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => viewUserDetail(user)}
                            className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                            title="Detail">
                            <i className="fas fa-eye"></i>
                          </button>
                          <Link to={`/admin/users/${user.id}/edit`}
                            className="btn-icon bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded-lg transition-colors"
                            title="Edit">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            onClick={() => confirmDelete(user)}
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
        {!loading && users.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {users.map(user => (
              <div key={user.id} className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-28 bg-gradient-to-r from-blue-500 to-blue-600 relative">
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fas fa-user text-white text-5xl opacity-25"></i>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="text-xl font-bold">{user.name}</h3>
                    <p className="text-sm text-white/80">{user.email}</p>
                  </div>
                  <div className="absolute top-3 right-3">
                    {getUserStatusBadge(user)}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-blue-600 mb-1">Tanggal Daftar</p>
                      <div className="flex items-center justify-center">
                        <i className="fas fa-calendar-alt text-blue-400 mr-1"></i>
                        <span className="text-sm font-semibold text-blue-700">
                          {formatDate(user.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-emerald-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-emerald-600 mb-1">Total Booking</p>
                      <div className="flex items-center justify-center">
                        <i className="fas fa-ticket-alt text-emerald-400 mr-1"></i>
                        <span className="text-sm font-semibold text-emerald-700">
                          {user.total_bookings || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Telepon</p>
                        <p className="text-sm font-medium">
                          {user.phone || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Booking Terakhir</p>
                        <p className="text-sm font-medium">
                          {user.last_booking_date ? formatDate(user.last_booking_date) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between border-t border-gray-100 pt-4">
                    <button
                      onClick={() => viewUserDetail(user)}
                      className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <Link to={`/admin/users/${user.id}/edit`} className="btn-icon bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded-lg transition-colors">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      onClick={() => confirmDelete(user)}
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

        {/* Modern Pagination */}
        {!loading && pagination.total > 0 && pagination.lastPage > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              Menampilkan <span className="font-medium">{getFirstItem()}</span> - 
              <span className="font-medium"> {getLastItem()}</span> dari 
              <span className="font-medium"> {pagination.total}</span> hasil
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-left"></i>
              </button>
              
              {/* Page numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
                  let pageNum;
                  if (pagination.lastPage <= 5) {
                    // Show all pages if 5 or fewer
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    // Near the start
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.lastPage - 2) {
                    // Near the end
                    pageNum = pagination.lastPage - 4 + i;
                  } else {
                    // Middle cases
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors shadow-sm 
                        ${pagination.currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.lastPage}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-right"></i>
              </button>
              <button 
                onClick={() => handlePageChange(pagination.lastPage)}
                disabled={pagination.currentPage === pagination.lastPage}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl transform transition-all animate-modal-in">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-user text-blue-500 mr-2"></i>
                Detail Pengguna
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Informasi Pengguna</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                          <i className="fas fa-user text-2xl"></i>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">{selectedUser.name}</h2>
                          <p className="text-gray-500">{selectedUser.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">ID Pengguna</p>
                          <p className="text-sm font-medium">{selectedUser.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <div className="mt-1">{getUserStatusBadge(selectedUser)}</div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Tanggal Daftar</p>
                          <p className="text-sm font-medium">{formatDate(selectedUser.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Telepon</p>
                          <p className="text-sm font-medium">{selectedUser.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Alamat</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        {selectedUser.address || 'Alamat tidak tersedia'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Statistik Booking</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-blue-600 mb-1">Total Booking</p>
                          <p className="text-2xl font-bold text-blue-700">{selectedUser.total_bookings || 0}</p>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-emerald-600 mb-1">Booking Terakhir</p>
                          <p className="text-sm font-medium text-emerald-700">
                            {selectedUser.last_booking_date ? formatDate(selectedUser.last_booking_date) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Catatan</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        {selectedUser.notes || 'Tidak ada catatan untuk pengguna ini'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Tindakan Cepat</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Link 
                          to={`/admin/users/${selectedUser.id}/edit`}
                          className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => setShowUserModal(false)}
                        >
                          <i className="fas fa-edit mr-2"></i> Edit Pengguna
                        </Link>
                        <button
                          onClick={() => {
                            setShowUserModal(false);
                            confirmDelete(selectedUser);
                          }}
                          className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
                        >
                          <i className="fas fa-trash mr-2"></i> Hapus Pengguna
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowUserModal(false)}
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
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-modal-in">
            <div className="p-6">
              <div className="text-center mb-5">
                <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus pengguna:</p>
                <div className="bg-gray-50 rounded-lg p-3 mt-3 border border-gray-200">
                  <p className="font-semibold text-lg text-gray-800">{selectedUser.name}</p>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">
                      Menghapus pengguna akan menghapus semua data terkait dengan pengguna ini. Tindakan ini tidak dapat dibatalkan.
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
                  <i className="fas fa-trash mr-2"></i> Hapus Pengguna
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations and button styling */}
      <style jsx>{`
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

export default UserList;