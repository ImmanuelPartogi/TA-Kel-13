import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Edit,
  Eye,
  Trash2,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';
import AdminVehicleCategoriesService from '../../../services/adminVehicleCategories.service';

const VehicleCategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'code', direction: 'asc' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [viewMode, setViewMode] = useState('table'); // table or grid
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    avgBasePrice: 0,
    popularVehicleType: ''
  });

  // Mengambil data kategori kendaraan
  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Menggunakan metode getCategories dari service baru
      const response = await AdminVehicleCategoriesService.getCategories();
      const categoriesData = response.data || [];
      setCategories(categoriesData);

      // Hitung statistik
      const activeCategories = categoriesData.filter(cat => cat.is_active).length;
      const avgBasePrice = categoriesData.length > 0
        ? categoriesData.reduce((sum, cat) => sum + parseFloat(cat.base_price || 0), 0) / categoriesData.length
        : 0;

      // Hitung tipe kendaraan terpopuler
      const vehicleTypeCounts = {};
      categoriesData.forEach(cat => {
        vehicleTypeCounts[cat.vehicle_type] = (vehicleTypeCounts[cat.vehicle_type] || 0) + 1;
      });

      let maxCount = 0;
      let popularType = '';
      Object.entries(vehicleTypeCounts).forEach(([type, count]) => {
        if (count > maxCount) {
          maxCount = count;
          popularType = type;
        }
      });

      setStats({
        totalCategories: categoriesData.length,
        activeCategories: activeCategories,
        avgBasePrice: avgBasePrice,
        popularVehicleType: popularType
      });

      setError(null);
    } catch (err) {
      setError('Gagal memuat data kategori kendaraan');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    // Auto-hide alert after 5 seconds
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Handler untuk sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Proses data untuk sorting dan filtering
  const processData = () => {
    let filteredData = [...categories];

    // Filtering
    if (searchTerm) {
      filteredData = filteredData.filter(category =>
        category.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        AdminVehicleCategoriesService.getVehicleTypeText(category.vehicle_type)?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle special cases like vehicle_type yang perlu dikonversi
        if (sortConfig.key === 'vehicle_type') {
          aValue = AdminVehicleCategoriesService.getVehicleTypeText(a.vehicle_type);
          bValue = AdminVehicleCategoriesService.getVehicleTypeText(b.vehicle_type);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  };

  const processedData = processData();

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // Handler untuk konfirmasi delete
  const confirmDelete = (id) => {
    setSelectedCategoryId(id);
    setIsDeleting(true);
  };

  // Handler untuk delete kategori
  const handleDelete = async () => {
    try {
      // Menggunakan metode deleteCategory dari service baru
      await AdminVehicleCategoriesService.deleteCategory(selectedCategoryId);
      setNotification({
        show: true,
        message: 'Kategori kendaraan berhasil dihapus',
        type: 'success'
      });
      fetchCategories();
    } catch (err) {
      setNotification({
        show: true,
        message: 'Gagal menghapus kategori kendaraan',
        type: 'error'
      });
      console.error('Error deleting category:', err);
    } finally {
      setIsDeleting(false);
      setSelectedCategoryId(null);
    }
  };

  // Handler untuk toggle status
  const handleToggleStatus = async (id) => {
    try {
      // Menggunakan metode toggleCategoryStatus dari service baru
      await AdminVehicleCategoriesService.toggleCategoryStatus(id);
      setNotification({
        show: true,
        message: 'Status kategori kendaraan berhasil diubah',
        type: 'success'
      });
      fetchCategories();
    } catch (err) {
      setNotification({
        show: true,
        message: 'Gagal mengubah status kategori kendaraan',
        type: 'error'
      });
      console.error('Error toggling status:', err);
    }
  };

  // Pagination navigation
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getFirstItem = () => ((currentPage - 1) * itemsPerPage) + 1;
  const getLastItem = () => Math.min(currentPage * itemsPerPage, processedData.length);

  // Handler untuk export data
  const handleExport = () => {
    try {
      // Menggunakan metode exportCategoriesData dari service
      const exportData = AdminVehicleCategoriesService.exportCategoriesData(categories);

      // Fungsi untuk escape karakter khusus dalam CSV
      const escapeCSV = (value) => {
        // Konversi ke string dan escape nilai
        const stringValue = String(value || '');
        // Jika mengandung koma, petik, atau baris baru, bungkus dengan tanda petik
        if (stringValue.includes(',') || stringValue.includes('"') ||
          stringValue.includes('\n') || stringValue.includes('\r')) {
          // Ganti tanda petik dengan double petik untuk escape
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      // Membuat header CSV dengan format yang benar
      const header = Object.keys(exportData[0]).map(key => escapeCSV(key)).join(',');

      // Membuat baris data dengan escape nilai yang benar
      const rows = exportData.map(row =>
        Object.values(row).map(value => escapeCSV(value)).join(',')
      );

      // Gabungkan header dan rows
      const csv = [header, ...rows].join('\n');

      // Tambahkan BOM untuk support UTF-8 di Excel
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csv;

      // Buat blob dan download
      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'kategori_kendaraan.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Notifikasi sukses
      setNotification({
        show: true,
        message: 'Data berhasil diekspor ke CSV',
        type: 'success'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      setNotification({
        show: true,
        message: 'Gagal mengekspor data',
        type: 'error'
      });
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
                <i className="fas fa-tags text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Manajemen Kategori Kendaraan</h1>
                <p className="mt-1 text-blue-100">Kelola kategori kendaraan untuk sistem tiket ferry</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Total Kategori</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-tags mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{stats.totalCategories}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Kategori Aktif</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-check-circle mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{stats.activeCategories}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Rata-rata Harga</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-money-bill mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">Rp {stats.avgBasePrice.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Tipe Kendaraan Terpopuler</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-truck mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">
                  {stats.popularVehicleType ? AdminVehicleCategoriesService.getVehicleTypeText(stats.popularVehicleType) : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Alert Messages */}
        {notification.show && (
          <div className={`mb-6 rounded-lg shadow-lg overflow-hidden animate-slideIn`}>
            <div className={`${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} px-4 py-2 text-white flex items-center justify-between`}>
              <div className="flex items-center">
                <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                <span className="font-medium">{notification.type === 'success' ? 'Sukses' : 'Error'}</span>
              </div>
              <button onClick={() => setNotification({ ...notification, show: false })} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={`${notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'} px-4 py-3 border-t`}>
              {notification.message}
            </div>
          </div>
        )}

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Cari kode, nama, atau tipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link
            to="/admin/vehicleCategories/create"
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah Kategori
          </Link>
        </div>

        {/* View Toggle & Result Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">
            {processedData.length > 0 ? (
              <>
                Menampilkan <span className="font-medium">{getFirstItem()}</span> -
                <span className="font-medium"> {getLastItem()}</span> dari
                <span className="font-medium"> {processedData.length}</span> kategori
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
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="mt-4 text-gray-600">Memuat data kategori kendaraan...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && currentItems.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-tags text-gray-400 text-4xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Data Kategori</h3>
            <p className="text-gray-600 mb-6">Belum ada kategori kendaraan yang ditemukan atau sesuai dengan filter yang Anda pilih</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-sm">
                <i className="fas fa-sync-alt mr-2"></i> Reset Filter
              </button>
              <Link to="/admin/vehicleCategories/create" className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
                <i className="fas fa-plus mr-2"></i> Tambah Kategori
              </Link>
            </div>
          </div>
        )}

        {/* Table View */}
        {!loading && currentItems.length > 0 && viewMode === 'table' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      onClick={() => requestSort('code')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    >
                      <div className="flex items-center">
                        Kode Golongan
                        {sortConfig.key === 'code' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ?
                              <i className="fas fa-sort-up"></i> :
                              <i className="fas fa-sort-down"></i>
                            }
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => requestSort('name')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    >
                      <div className="flex items-center">
                        Nama
                        {sortConfig.key === 'name' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ?
                              <i className="fas fa-sort-up"></i> :
                              <i className="fas fa-sort-down"></i>
                            }
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => requestSort('vehicle_type')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    >
                      <div className="flex items-center">
                        Tipe Kendaraan
                        {sortConfig.key === 'vehicle_type' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ?
                              <i className="fas fa-sort-up"></i> :
                              <i className="fas fa-sort-down"></i>
                            }
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => requestSort('base_price')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    >
                      <div className="flex items-center">
                        Harga Dasar
                        {sortConfig.key === 'base_price' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ?
                              <i className="fas fa-sort-up"></i> :
                              <i className="fas fa-sort-down"></i>
                            }
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => requestSort('is_active')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    >
                      <div className="flex items-center">
                        Status
                        {sortConfig.key === 'is_active' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ?
                              <i className="fas fa-sort-up"></i> :
                              <i className="fas fa-sort-down"></i>
                            }
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <i className="fas fa-tag"></i>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{category.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {AdminVehicleCategoriesService.getVehicleTypeText(category.vehicle_type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {AdminVehicleCategoriesService.formatPrice(category.base_price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${category.is_active ?
                            'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                          <span className={`w-1.5 h-1.5 ${category.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'
                            } rounded-full mr-1.5`}></span>
                          {AdminVehicleCategoriesService.getStatusText(category.is_active)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/admin/vehicleCategories/${category.id}`}
                            className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                            title="Detail">
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link to={`/admin/vehicleCategories/${category.id}/edit`}
                            className="btn-icon bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded-lg transition-colors"
                            title="Edit">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            onClick={() => confirmDelete(category.id)}
                            className="btn-icon bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(category.id)}
                            className={`btn-icon ${category.is_active ?
                                'bg-amber-50 hover:bg-amber-100 text-amber-600' :
                                'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                              } p-2 rounded-lg transition-colors`}
                            title={category.is_active ? "Nonaktifkan" : "Aktifkan"}
                          >
                            <i className={`fas ${category.is_active ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
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
        {!loading && currentItems.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {currentItems.map(category => (
              <div key={category.id} className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-28 bg-gradient-to-r from-blue-500 to-blue-600 relative">
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fas fa-tag text-white text-5xl opacity-25"></i>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="text-xl font-bold">{category.code}</h3>
                    <p className="text-sm text-white/80">{category.name}</p>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${category.is_active ?
                        'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                      <span className={`w-1.5 h-1.5 ${category.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'
                        } rounded-full mr-1.5`}></span>
                      {AdminVehicleCategoriesService.getStatusText(category.is_active)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-blue-600 mb-1">Tipe Kendaraan</p>
                      <div className="flex items-center justify-center">
                        <i className="fas fa-truck text-blue-400 mr-1"></i>
                        <span className="text-sm font-semibold text-blue-700">
                          {AdminVehicleCategoriesService.getVehicleTypeText(category.vehicle_type)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-amber-600 mb-1">Harga Dasar</p>
                      <div className="flex items-center justify-center">
                        <i className="fas fa-money-bill text-amber-400 mr-1"></i>
                        <span className="text-sm font-semibold text-amber-700">
                          {AdminVehicleCategoriesService.formatPrice(category.base_price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-xs text-gray-500 mb-1">Deskripsi</p>
                    <p className="text-sm font-medium line-clamp-2">
                      {category.description || 'Tidak ada deskripsi'}
                    </p>
                  </div>

                  <div className="flex justify-between border-t border-gray-100 pt-4">
                    <Link
                      to={`/admin/vehicleCategories/${category.id}`}
                      className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                    >
                      <i className="fas fa-eye"></i>
                    </Link>
                    <Link to={`/admin/vehicleCategories/${category.id}/edit`} className="btn-icon bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded-lg transition-colors">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(category.id)}
                      className={`btn-icon ${category.is_active ?
                          'bg-amber-50 hover:bg-amber-100 text-amber-600' :
                          'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                        } p-2 rounded-lg transition-colors`}
                    >
                      <i className={`fas ${category.is_active ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                    </button>
                    <button
                      onClick={() => confirmDelete(category.id)}
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
        {!loading && processedData.length > itemsPerPage && (
          <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              Menampilkan <span className="font-medium">{getFirstItem()}</span> -
              <span className="font-medium"> {getLastItem()}</span> dari
              <span className="font-medium"> {processedData.length}</span> hasil
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-left"></i>
              </button>

              {/* Page numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    // Show all pages if 5 or fewer
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // Near the start
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // Near the end
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Middle cases
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => paginate(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors shadow-sm 
                        ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-right"></i>
              </button>
              <button
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* Export Button */}
        {!loading && currentItems.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              className="flex items-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
              onClick={handleExport}
            >
              <i className="fas fa-file-export mr-2"></i>
              Export Data
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-modal-in">
            <div className="p-6">
              <div className="text-center mb-5">
                <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus kategori kendaraan ini?</p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">
                      Menghapus kategori kendaraan akan menghapus semua data terkait. Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsDeleting(false)}
                  className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full py-3 px-4 bg-red-500 rounded-lg text-white font-medium hover:bg-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i> Hapus Kategori
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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default VehicleCategoriesList;