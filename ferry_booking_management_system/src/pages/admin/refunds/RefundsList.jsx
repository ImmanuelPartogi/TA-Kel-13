import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';

const RefundsList = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    booking_code: '',
    status: '',
    date_from: '',
    date_to: ''
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [viewMode, setViewMode] = useState('table'); // table or grid
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10
  });

  useEffect(() => {
    fetchRefunds();

    // Auto-hide alert after 5 seconds
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const fetchRefunds = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get('/admin-panel/refunds', {
        params: {
          ...filters,
          page
        }
      });

      console.log('API Response:', response.data); // Debugging

      if (response.data && response.data.data) {
        let refundsData = [];
        let paginationData = {};

        // Check if response.data.data is array (new format) or paginated object (old format)
        if (Array.isArray(response.data.data)) {
          // New format: data is direct array
          refundsData = response.data.data;

          // Pagination info in meta
          if (response.data.meta) {
            paginationData = response.data.meta;
          }
        } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          // Old format: data.data.data is the array (Laravel paginate structure)
          refundsData = response.data.data.data;

          // Pagination info in data level
          paginationData = {
            current_page: response.data.data.current_page || 1,
            last_page: response.data.data.last_page || 1,
            total: response.data.data.total || 0,
            per_page: response.data.data.per_page || 10
          };
        }

        console.log('Processed refunds data:', refundsData); // Debugging
        console.log('Processed pagination data:', paginationData); // Debugging

        setRefunds(refundsData);

        if (Object.keys(paginationData).length > 0) {
          setPagination({
            current_page: paginationData.current_page || 1,
            last_page: paginationData.last_page || 1,
            total: paginationData.total || refundsData.length,
            per_page: paginationData.per_page || 10
          });
        } else {
          setPagination({
            current_page: 1,
            last_page: 1,
            total: refundsData.length,
            per_page: 10
          });
        }
      } else {
        console.log('Invalid response structure:', response.data); // Debugging
        setRefunds([]);
        setAlert({
          show: true,
          type: 'error',
          message: 'Format data tidak valid'
        });
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
      console.error('Error response:', error.response?.data); // Debugging
      setRefunds([]);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal memuat data refund: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRefunds(1);
  };

  const handleReset = () => {
    setFilters({
      booking_code: '',
      status: '',
      date_from: '',
      date_to: ''
    });
    setTimeout(() => fetchRefunds(1), 0);
  };

  const viewRefundDetail = (refund) => {
    setSelectedRefund(refund);
    setShowDetailModal(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.last_page) return;
    fetchRefunds(newPage);
  };

  const getFirstItem = () => ((pagination.current_page - 1) * pagination.per_page) + 1;
  const getLastItem = () => Math.min(pagination.current_page * pagination.per_page, pagination.total);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: 'fa-clock',
          label: 'Pending',
          border: 'border-yellow-200',
          indicator: 'bg-yellow-500'
        };
      case 'APPROVED':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: 'fa-check',
          label: 'Approved',
          border: 'border-blue-200',
          indicator: 'bg-blue-500'
        };
      case 'REJECTED':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: 'fa-times',
          label: 'Rejected',
          border: 'border-red-200',
          indicator: 'bg-red-500'
        };
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-800',
          icon: 'fa-check-circle',
          label: 'Completed',
          border: 'border-emerald-200',
          indicator: 'bg-emerald-500'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: 'fa-question-circle',
          label: status || 'Unknown',
          border: 'border-gray-200',
          indicator: 'bg-gray-500'
        };
    }
  };

  const getRefundMethodText = (method) => {
    const methods = {
      ORIGINAL_PAYMENT_METHOD: 'Metode Pembayaran Asal',
      BANK_TRANSFER: 'Transfer Bank',
      CASH: 'Tunai'
    };
    return methods[method] || method;
  };

  const getRefundMethodIcon = (method) => {
    const icons = {
      ORIGINAL_PAYMENT_METHOD: 'fa-credit-card',
      BANK_TRANSFER: 'fa-university',
      CASH: 'fa-money-bill-wave'
    };
    return icons[method] || 'fa-money-bill-alt';
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Helper function to format date
  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';

    try {
      const options = {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      };

      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }

      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Helper function to safely get filtered refunds
  const getFilteredRefunds = (status) => {
    return Array.isArray(refunds) ? refunds.filter(refund => refund.status === status) : [];
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
                <i className="fas fa-hand-holding-usd text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Manajemen Refund</h1>
                <p className="mt-1 text-blue-100">Kelola seluruh refund tiket kapal ferry dalam sistem</p>
              </div>
            </div>

            <div>
              <Link 
                to="/admin/refunds/settings"
                className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm"
              >
                <i className="fas fa-cog mr-2"></i> Kebijakan Refund
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Total Refund</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-hand-holding-usd mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{pagination.total}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Pending</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-clock mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">
                  {getFilteredRefunds('PENDING').length}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Approved</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-check mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">
                  {getFilteredRefunds('APPROVED').length}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Completed</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-check-circle mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">
                  {getFilteredRefunds('COMPLETED').length}
                </span>
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
              <button onClick={() => setAlert({ ...alert, show: false })} className="text-white/80 hover:text-white">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="booking_code" className="block text-sm font-medium text-gray-700 mb-1">Kode Booking</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-hashtag text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="booking_code"
                      name="booking_code"
                      value={filters.booking_code}
                      onChange={handleFilterChange}
                      placeholder="Masukkan kode booking..."
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-toggle-on text-gray-400"></i>
                    </div>
                    <select
                      id="status"
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Semua Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Dari</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-calendar-alt text-gray-400"></i>
                    </div>
                    <input
                      type="date"
                      id="date_from"
                      name="date_from"
                      value={filters.date_from}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Sampai</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-calendar-alt text-gray-400"></i>
                    </div>
                    <input
                      type="date"
                      id="date_to"
                      name="date_to"
                      value={filters.date_to}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {(filters.booking_code || filters.status || filters.date_from || filters.date_to) && (
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
                <span className="font-medium"> {pagination.total}</span> refund
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
            <p className="mt-4 text-gray-600">Memuat data refund...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && (!Array.isArray(refunds) || refunds.length === 0) && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-hand-holding-usd text-gray-400 text-4xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Data Refund</h3>
            <p className="text-gray-600 mb-6">Belum ada refund yang ditemukan atau sesuai dengan filter yang Anda pilih</p>
            <button
              onClick={handleReset}
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
              <i className="fas fa-sync-alt mr-2"></i> Reset Filter
            </button>
          </div>
        )}

        {/* Table View */}
        {!loading && Array.isArray(refunds) && refunds.length > 0 && viewMode === 'table' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Refund</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {refunds.map((refund) => {
                    const statusConfig = getStatusConfig(refund.status);
                    return (
                      <tr key={refund.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                              <i className="fas fa-hashtag"></i>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">#{refund.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                              <i className="fas fa-ticket-alt"></i>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-blue-600">{refund.booking?.booking_code || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                              <i className="fas fa-user"></i>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{refund.booking?.user?.name || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-medium">
                              <i className="fas fa-money-bill-wave mr-1"></i> {formatCurrency(refund.amount || 0)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">
                              <i className={`fas ${getRefundMethodIcon(refund.refund_method)} mr-1`}></i>
                              {getRefundMethodText(refund.refund_method)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                            <span className={`w-1.5 h-1.5 ${statusConfig.indicator} rounded-full mr-1.5 ${refund.status === 'PENDING' ? 'animate-pulse' : ''}`}></span>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(refund.created_at, true)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => viewRefundDetail(refund)}
                              className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                              title="Detail">
                              <i className="fas fa-eye"></i>
                            </button>
                            {refund.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => setAlert({ show: true, type: 'success', message: 'Refund telah disetujui' })}
                                  className="btn-icon bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-2 rounded-lg transition-colors"
                                  title="Approve">
                                  <i className="fas fa-check"></i>
                                </button>
                                <button
                                  onClick={() => setAlert({ show: true, type: 'error', message: 'Refund telah ditolak' })}
                                  className="btn-icon bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                                  title="Reject">
                                  <i className="fas fa-times"></i>
                                </button>
                              </>
                            )}
                            <Link to={`/admin/refunds/${refund.id}`}
                              className="btn-icon bg-purple-50 hover:bg-purple-100 text-purple-600 p-2 rounded-lg transition-colors"
                              title="Manage">
                              <i className="fas fa-cog"></i>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grid View */}
        {!loading && Array.isArray(refunds) && refunds.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {refunds.map(refund => {
              const statusConfig = getStatusConfig(refund.status);
              return (
                <div key={refund.id} className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 relative">
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fas fa-hand-holding-usd text-white text-5xl opacity-25"></i>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h3 className="text-xl font-bold">#{refund.id}</h3>
                      <p className="text-sm text-white/80">{refund.booking?.booking_code || 'N/A'}</p>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                        <span className={`w-1.5 h-1.5 ${statusConfig.indicator} rounded-full mr-1.5 ${refund.status === 'PENDING' ? 'animate-pulse' : ''}`}></span>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Pengguna</div>
                      <div className="text-sm font-medium text-gray-800">
                        {refund.booking?.user?.name || 'N/A'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-emerald-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-emerald-600 mb-1">Jumlah Refund</p>
                        <div className="flex items-center justify-center">
                          <i className="fas fa-money-bill-wave text-emerald-400 mr-1"></i>
                          <span className="text-sm font-semibold text-emerald-700">
                            {formatCurrency(refund.amount || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-blue-600 mb-1">Metode</p>
                        <div className="flex items-center justify-center">
                          <i className={`fas ${getRefundMethodIcon(refund.refund_method)} text-blue-400 mr-1`}></i>
                          <span className="text-sm font-semibold text-blue-700">
                            {refund.refund_method === 'ORIGINAL_PAYMENT_METHOD' ? 'Pembayaran Asal' :
                              (refund.refund_method === 'BANK_TRANSFER' ? 'Transfer Bank' :
                                (refund.refund_method === 'CASH' ? 'Tunai' : refund.refund_method))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-xs text-gray-500 mb-1 text-center">Tanggal Pengajuan</p>
                      <p className="text-center text-sm font-medium text-gray-700">
                        {formatDate(refund.created_at, true)}
                      </p>
                    </div>

                    <div className="flex justify-between border-t border-gray-100 pt-4">
                      <button
                        onClick={() => viewRefundDetail(refund)}
                        className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                      >
                        <i className="fas fa-eye"></i>
                      </button>

                      {refund.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => setAlert({ show: true, type: 'success', message: 'Refund telah disetujui' })}
                            className="btn-icon bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-2 rounded-lg transition-colors"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            onClick={() => setAlert({ show: true, type: 'error', message: 'Refund telah ditolak' })}
                            className="btn-icon bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      ) : (
                        <div className="flex-1"></div>
                      )}

                      <Link to={`/admin/refunds/${refund.id}`} className="btn-icon bg-purple-50 hover:bg-purple-100 text-purple-600 p-2 rounded-lg transition-colors">
                        <i className="fas fa-cog"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modern Pagination */}
        {!loading && pagination.total > 0 && pagination.last_page > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              Menampilkan <span className="font-medium">{getFirstItem()}</span> -
              <span className="font-medium"> {getLastItem()}</span> dari
              <span className="font-medium"> {pagination.total}</span> hasil
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.current_page === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-left"></i>
              </button>

              {/* Page numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                  let pageNum;
                  if (pagination.last_page <= 5) {
                    // Show all pages if 5 or fewer
                    pageNum = i + 1;
                  } else if (pagination.current_page <= 3) {
                    // Near the start
                    pageNum = i + 1;
                  } else if (pagination.current_page >= pagination.last_page - 2) {
                    // Near the end
                    pageNum = pagination.last_page - 4 + i;
                  } else {
                    // Middle cases
                    pageNum = pagination.current_page - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors shadow-sm 
                        ${pagination.current_page === pageNum ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-right"></i>
              </button>
              <button
                onClick={() => handlePageChange(pagination.last_page)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Refund Detail Modal */}
      {showDetailModal && selectedRefund && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all animate-modal-in">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-hand-holding-usd text-blue-500 mr-2"></i>
                Detail Refund <span className="text-blue-600 ml-2">#{selectedRefund.id}</span>
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
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Informasi Refund</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusConfig(selectedRefund.status).bg} ${getStatusConfig(selectedRefund.status).text}`}>
                          {getStatusConfig(selectedRefund.status).label}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Tanggal Pengajuan:</span>
                        <span className="text-sm font-medium">{formatDate(selectedRefund.created_at, true)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Jumlah Refund:</span>
                        <span className="text-sm font-bold text-emerald-600">{formatCurrency(selectedRefund.amount || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Metode Refund:</span>
                        <span className="text-sm font-medium">{getRefundMethodText(selectedRefund.refund_method)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Informasi Pengguna</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                          <i className="fas fa-user"></i>
                        </div>
                        <div>
                          <div className="font-medium">{selectedRefund.booking?.user?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{selectedRefund.booking?.user?.email || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Telepon:</span>
                        <span className="text-sm font-medium">{selectedRefund.booking?.user?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Detail Booking</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Kode Booking:</span>
                        <div className="font-medium text-blue-600 mt-1">
                          {selectedRefund.booking?.booking_code || 'N/A'}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Rute:</span>
                        <span className="text-sm font-medium">
                          {selectedRefund.booking?.schedule?.route ?
                            `${selectedRefund.booking.schedule.route.origin} - ${selectedRefund.booking.schedule.route.destination}` :
                            'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Tanggal Keberangkatan:</span>
                        <span className="text-sm font-medium">
                          {selectedRefund.booking?.departure_date ?
                            formatDate(selectedRefund.booking.departure_date) :
                            'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Booking:</span>
                        <span className="text-sm font-medium">
                          {selectedRefund.booking?.total_amount ?
                            formatCurrency(selectedRefund.booking.total_amount) :
                            'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Alasan Refund</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        {selectedRefund.reason || 'Tidak ada alasan yang dicantumkan'}
                      </p>
                    </div>
                  </div>

                  {selectedRefund.status === 'PENDING' && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Tindakan</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              setShowDetailModal(false);
                              setAlert({ show: true, type: 'success', message: 'Refund telah disetujui' });
                            }}
                            className="flex items-center justify-center py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            <i className="fas fa-check mr-2"></i> Setujui
                          </button>
                          <button
                            onClick={() => {
                              setShowDetailModal(false);
                              setAlert({ show: true, type: 'error', message: 'Refund telah ditolak' });
                            }}
                            className="flex items-center justify-center py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <i className="fas fa-times mr-2"></i> Tolak
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50"
                >
                  <i className="fas fa-times mr-2"></i> Tutup
                </button>

                <div className="flex space-x-2">
                  <Link
                    to={`/admin/refunds/${selectedRefund.id}`}
                    onClick={() => setShowDetailModal(false)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <i className="fas fa-external-link-alt mr-2"></i> Lihat Detail Lengkap
                  </Link>
                </div>
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

export default RefundsList;