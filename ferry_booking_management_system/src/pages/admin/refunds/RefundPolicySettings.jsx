import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';

const RefundPolicySettings = () => {
  const [policies, setPolicies] = useState([]);
  const [deletedPolicies, setDeletedPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin-panel/refunds/policy/settings');
      
      if (response.data && response.data.success) {
        setPolicies(response.data.data || []);
        setDeletedPolicies([]);
      } else {
        // Initialize with default policy if no data
        setPolicies([
          {
            days_before_departure: 7,
            refund_percentage: 80,
            min_fee: 10000,
            max_fee: null,
            description: 'Refund 7 hari sebelum keberangkatan',
            is_active: true
          },
          {
            days_before_departure: 3,
            refund_percentage: 50,
            min_fee: 15000,
            max_fee: null,
            description: 'Refund 3 hari sebelum keberangkatan',
            is_active: true
          },
          {
            days_before_departure: 0,
            refund_percentage: 0,
            min_fee: null,
            max_fee: null,
            description: 'Tidak dapat refund di hari keberangkatan',
            is_active: true
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      
      if (error.response?.status === 404 || error.response?.status === 500) {
        setPolicies([
          {
            days_before_departure: 7,
            refund_percentage: 80,
            min_fee: 10000,
            max_fee: null,
            description: 'Refund 7 hari sebelum keberangkatan',
            is_active: true
          },
          {
            days_before_departure: 3,
            refund_percentage: 50,
            min_fee: 15000,
            max_fee: null,
            description: 'Refund 3 hari sebelum keberangkatan',
            is_active: true
          },
          {
            days_before_departure: 0,
            refund_percentage: 0,
            min_fee: null,
            max_fee: null,
            description: 'Tidak dapat refund di hari keberangkatan',
            is_active: true
          }
        ]);
        setAlert({
          show: true,
          type: 'error',
          message: 'Gagal memuat kebijakan refund, menggunakan data default'
        });
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: 'Gagal memuat kebijakan refund'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePolicyChange = (index, field, value) => {
    const updatedPolicies = [...policies];
    updatedPolicies[index] = {
      ...updatedPolicies[index],
      [field]: value
    };
    setPolicies(updatedPolicies);
  };

  const addPolicy = () => {
    setPolicies([
      ...policies,
      {
        days_before_departure: 0,
        refund_percentage: 0,
        min_fee: null,
        max_fee: null,
        description: '',
        is_active: true
      }
    ]);
    setShowAddForm(false);
  };

  const removePolicy = (index) => {
    const policyToRemove = policies[index];
    
    if (!window.confirm('Apakah Anda yakin ingin menghapus kebijakan refund ini?')) {
      return;
    }

    if (policyToRemove.id) {
      setDeletedPolicies([...deletedPolicies, policyToRemove.id]);
    }

    const updatedPolicies = policies.filter((_, i) => i !== index);
    setPolicies(updatedPolicies);
  };

  const savePolicies = async () => {
    try {
      setSaving(true);
      const response = await api.post('/admin-panel/refunds/policy/update', {
        policies: policies,
        deleted_policies: deletedPolicies
      });
      
      if (response.data && response.data.success) {
        setAlert({
          show: true,
          type: 'success',
          message: 'Kebijakan refund berhasil disimpan'
        });
        fetchPolicies();
      }
    } catch (error) {
      console.error('Error saving policies:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Gagal menyimpan kebijakan refund'
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper functions
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getActivePolicies = () => policies.filter(p => p.is_active);
  const getInactivePolicies = () => policies.filter(p => !p.is_active);

  const getDaysText = (days) => {
    if (days === 0) return 'Hari H';
    if (days === 1) return '1 Hari';
    return `${days} Hari`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-800 via-indigo-600 to-indigo-500 p-8 text-white">
          <div className="flex items-start">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-4">
              <i className="fas fa-cog text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Pengaturan Kebijakan Refund</h1>
              <p className="mt-1 text-indigo-100">Atur persentase dan biaya refund berdasarkan waktu pembatalan</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <div className="inline-block relative">
            <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-indigo-200 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-4 text-gray-600">Memuat kebijakan refund...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Modern Header with Decorative Background */}
      <div className="bg-gradient-to-br from-indigo-800 via-indigo-600 to-indigo-500 p-8 text-white relative">
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
                <i className="fas fa-cog text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Pengaturan Kebijakan Refund</h1>
                <p className="mt-1 text-indigo-100">Atur persentase dan biaya refund berdasarkan waktu pembatalan</p>
              </div>
            </div>

            <div>
              <Link 
                to="/admin/refunds"
                className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm"
              >
                <i className="fas fa-arrow-left mr-2"></i> Kembali ke Refund
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-indigo-100 text-sm">Total Kebijakan</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-list mr-2 text-indigo-100"></i>
                <span className="text-2xl font-bold">{policies.length}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-indigo-100 text-sm">Kebijakan Aktif</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-check-circle mr-2 text-indigo-100"></i>
                <span className="text-2xl font-bold text-emerald-300">
                  {getActivePolicies().length}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-indigo-100 text-sm">Non-Aktif</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-pause-circle mr-2 text-indigo-100"></i>
                <span className="text-2xl font-bold text-red-300">
                  {getInactivePolicies().length}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-indigo-100 text-sm">Akan Dihapus</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-trash mr-2 text-indigo-100"></i>
                <span className="text-2xl font-bold text-orange-300">
                  {deletedPolicies.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Alert Messages */}
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

        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-8 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <h2 className="text-lg font-semibold text-blue-800 flex items-center">
              <i className="fas fa-info-circle text-blue-500 mr-2"></i>
              Informasi Kebijakan Refund
            </h2>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <i className="fas fa-check text-blue-500 mr-2 mt-0.5 flex-shrink-0"></i>
                  Kebijakan akan diterapkan berdasarkan jumlah hari sebelum keberangkatan
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-blue-500 mr-2 mt-0.5 flex-shrink-0"></i>
                  Sistem akan otomatis memilih kebijakan yang sesuai dengan waktu pembatalan
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-blue-500 mr-2 mt-0.5 flex-shrink-0"></i>
                  Persentase refund adalah jumlah yang akan dikembalikan kepada pengguna
                </li>
              </ul>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <i className="fas fa-check text-blue-500 mr-2 mt-0.5 flex-shrink-0"></i>
                  Biaya minimum dan maksimum bersifat opsional
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-blue-500 mr-2 mt-0.5 flex-shrink-0"></i>
                  Kebijakan non-aktif tetap ditampilkan untuk dapat diaktifkan kembali
                </li>
                <li className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-amber-500 mr-2 mt-0.5 flex-shrink-0"></i>
                  Perubahan akan berlaku setelah disimpan
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Add Policy Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Daftar Kebijakan Refund</h2>
          <button
            onClick={addPolicy}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
          >
            <i className="fas fa-plus mr-2"></i>
            Tambah Kebijakan
          </button>
        </div>

        {/* Empty State */}
        {policies.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-12 text-center">
            <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-cog text-indigo-500 text-4xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Kebijakan Refund</h3>
            <p className="text-gray-600 mb-6">Mulai dengan menambahkan kebijakan refund pertama Anda</p>
            <button
              onClick={addPolicy}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm">
              <i className="fas fa-plus mr-2"></i> Tambah Kebijakan Pertama
            </button>
          </div>
        )}

        {/* Policies Table */}
        {policies.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        Waktu Sebelum Keberangkatan
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <i className="fas fa-percentage mr-2"></i>
                        Refund (%)
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <i className="fas fa-money-bill-wave mr-2"></i>
                        Biaya Min
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <i className="fas fa-money-check-alt mr-2"></i>
                        Biaya Max
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <i className="fas fa-align-left mr-2"></i>
                        Deskripsi
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center">
                        <i className="fas fa-toggle-on mr-2"></i>
                        Status
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center">
                        <i className="fas fa-cogs mr-2"></i>
                        Aksi
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {policies.map((policy, index) => (
                    <tr key={index} className={`hover:bg-gray-50 transition-colors ${!policy.is_active ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
                            policy.days_before_departure === 0 ? 'bg-red-100 text-red-600' :
                            policy.days_before_departure <= 3 ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            <i className="fas fa-calendar-day"></i>
                          </div>
                          <div className="ml-4">
                            <input
                              type="number"
                              value={policy.days_before_departure}
                              onChange={(e) => handlePolicyChange(index, 'days_before_departure', parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                              min="0"
                              disabled={!policy.is_active}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {getDaysText(policy.days_before_departure)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              policy.refund_percentage === 0 ? 'bg-red-100 text-red-800' :
                              policy.refund_percentage < 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {policy.refund_percentage}%
                            </span>
                          </div>
                          <div className="ml-4">
                            <input
                              type="number"
                              value={policy.refund_percentage}
                              onChange={(e) => handlePolicyChange(index, 'refund_percentage', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                              min="0"
                              max="100"
                              step="0.01"
                              disabled={!policy.is_active}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <input
                            type="number"
                            value={policy.min_fee || ''}
                            onChange={(e) => handlePolicyChange(index, 'min_fee', e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-28 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            min="0"
                            placeholder="Opsional"
                            disabled={!policy.is_active}
                          />
                          {policy.min_fee && (
                            <span className="text-xs text-gray-500 mt-1">
                              {formatCurrency(policy.min_fee)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <input
                            type="number"
                            value={policy.max_fee || ''}
                            onChange={(e) => handlePolicyChange(index, 'max_fee', e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-28 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            min="0"
                            placeholder="Opsional"
                            disabled={!policy.is_active}
                          />
                          {policy.max_fee && (
                            <span className="text-xs text-gray-500 mt-1">
                              {formatCurrency(policy.max_fee)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={policy.description || ''}
                          onChange={(e) => handlePolicyChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="Deskripsi kebijakan..."
                          disabled={!policy.is_active}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={policy.is_active}
                              onChange={(e) => handlePolicyChange(index, 'is_active', e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                              policy.is_active ? 'bg-indigo-600' : 'bg-gray-300'
                            }`}>
                              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                                policy.is_active ? 'translate-x-4' : 'translate-x-0'
                              }`}></div>
                            </div>
                          </label>
                          <span className={`text-sm font-medium ${policy.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {policy.is_active ? 'Aktif' : 'Non-aktif'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => removePolicy(index)}
                          className="btn-icon bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-105"
                          title="Hapus Permanen"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {policies.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                {deletedPolicies.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center">
                    <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                    <span className="text-red-700 font-medium">
                      {deletedPolicies.length} kebijakan akan dihapus permanen setelah disimpan
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <i className="fas fa-undo mr-2"></i>
                  Reset
                </button>
                
                <button
                  onClick={savePolicies}
                  disabled={saving}
                  className="inline-flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg shadow-sm transition-all duration-200 disabled:cursor-not-allowed hover:shadow-md transform hover:scale-105 disabled:transform-none"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Simpan Kebijakan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Styles */}
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

        /* Custom toggle switch styling */
        input[type="checkbox"]:focus + div {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        /* Enhanced form inputs */
        input[type="number"]:focus,
        input[type="text"]:focus {
          transform: scale(1.01);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }

        /* Table row hover effects */
        tbody tr:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        /* Button hover animations */
        button:not(:disabled):hover {
          filter: brightness(1.05);
        }
      `}</style>
    </div>
  );
};

export default RefundPolicySettings;