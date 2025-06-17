import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../services/api';

const RefundShow = () => {
  const { id } = useParams();
  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchRefundDetails();
  }, [id]);

  useEffect(() => {
    // Auto-hide alert after 5 seconds
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ show: false, type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const fetchRefundDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin-panel/refunds/${id}`);
      
      console.log('Refund detail response:', response.data); // Debugging
      
      if (response.data && response.data.success) {
        setRefund(response.data.data);
      } else if (response.data && !response.data.data) {
        // Handle case where response doesn't have success flag but has data directly
        setRefund(response.data);
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: 'Data refund tidak ditemukan'
        });
      }
    } catch (error) {
      console.error('Error fetching refund details:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal memuat detail refund: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      const response = await api.post(`/admin-panel/refunds/${id}/approve`, {
        notes: approvalNotes
      });
      
      if (response.data && response.data.success) {
        setAlert({ 
          show: true, 
          type: 'success', 
          message: 'Refund berhasil disetujui' 
        });
        setShowApproveModal(false);
        fetchRefundDetails();
      }
    } catch (error) {
      console.error('Error approving refund:', error);
      setAlert({ 
        show: true, 
        type: 'error', 
        message: 'Gagal menyetujui refund: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      const response = await api.post(`/admin-panel/refunds/${id}/reject`, {
        rejection_reason: rejectionReason
      });
      
      if (response.data && response.data.success) {
        setAlert({ 
          show: true, 
          type: 'success', 
          message: 'Refund berhasil ditolak' 
        });
        setShowRejectModal(false);
        setRejectionReason('');
        fetchRefundDetails();
      }
    } catch (error) {
      console.error('Error rejecting refund:', error);
      setAlert({ 
        show: true, 
        type: 'error', 
        message: 'Gagal menolak refund: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      const response = await api.post(`/admin-panel/refunds/${id}/complete`, {
        transaction_id: transactionId,
        notes: completionNotes
      });
      
      if (response.data && response.data.success) {
        setAlert({ 
          show: true, 
          type: 'success', 
          message: 'Refund berhasil diselesaikan' 
        });
        setShowCompleteModal(false);
        setTransactionId('');
        setCompletionNotes('');
        fetchRefundDetails();
      }
    } catch (error) {
      console.error('Error completing refund:', error);
      setAlert({ 
        show: true, 
        type: 'error', 
        message: 'Gagal menyelesaikan refund: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setProcessing(false);
    }
  };

  // Helper function untuk memeriksa apakah refund dibuat admin
  const isAdminRefund = (refund) => {
    return (refund.reason && refund.reason.startsWith('[ADMIN]')) || 
           (refund.notes && refund.notes.startsWith('[ADMIN REFUND]'));
  };

  const getStatusConfig = (status) => {
    switch(status) {
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="inline-block relative">
          <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
        <p className="mt-4 text-gray-600">Memuat detail refund...</p>
      </div>
    );
  }

  if (!refund) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-exclamation-triangle text-gray-400 text-4xl"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Refund Tidak Ditemukan</h3>
        <p className="text-gray-600 mb-6">Refund dengan ID ini tidak ditemukan atau tidak dapat diakses</p>
        <Link 
          to="/admin/refunds"
          className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
          <i className="fas fa-arrow-left mr-2"></i> Kembali ke Daftar Refund
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(refund.status);
  const adminCreated = isAdminRefund(refund);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Modern Header */}
      <div className="bg-gradient-to-br from-blue-800 via-blue-600 to-blue-500 p-8 text-white relative">
        <div className="absolute inset-0 opacity-20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" className="w-full h-full">
            <path d="M472.3 724.1c-142.9 52.5-285.8-46.9-404.6-124.4 104.1 31.6 255-30.3 307.6-130.9 52.5-100.6-17.3-178.1-96.4-193.9 207.6 26.6 285.8 337.7 193.4 449.2z" 
                  fill="#fff" opacity="0.2" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-4">
                <i className="fas fa-hand-holding-usd text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Detail Refund #{refund.id}</h1>
                <p className="mt-1 text-blue-100">
                  Status: <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} ml-2`}>
                    <span className={`w-1.5 h-1.5 ${statusConfig.indicator} rounded-full mr-1.5 ${refund.status === 'PENDING' ? 'animate-pulse' : ''}`}></span>
                    {statusConfig.label}
                  </span>
                </p>
              </div>
            </div>
            
            <div>
              <Link
                to="/admin/refunds"
                className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                <i className="fas fa-arrow-left mr-2"></i> Kembali
              </Link>
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
              <button onClick={() => setAlert({ show: false, type: '', message: '' })} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={`${alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'} px-4 py-3 border-t`}>
              {alert.message}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Refund Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Refund Info Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-hand-holding-usd text-blue-500 mr-2"></i>
                  Informasi Refund
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Tambahkan badge Admin Refund jika dibuat oleh admin */}
                {adminCreated && (
                  <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg inline-flex items-center mb-2">
                    <i className="fas fa-user-shield mr-2"></i>
                    <span className="font-medium">Dibuat oleh Admin</span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Jumlah Refund</p>
                    <p className="font-medium text-emerald-600 text-lg">
                      {formatCurrency(refund.amount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Metode Refund</p>
                    <p className="flex items-center">
                      <i className="fas fa-credit-card text-blue-500 mr-2"></i>
                      {getRefundMethodText(refund.refund_method)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Dibuat Pada</p>
                    <p>{formatDate(refund.created_at, true)}</p>
                  </div>
                  
                  {/* Bank Transfer Details */}
                  {refund.refund_method === 'BANK_TRANSFER' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Nama Bank</p>
                        <p>{refund.bank_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Nomor Rekening</p>
                        <p className="font-mono">{refund.bank_account_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Nama Pemilik Rekening</p>
                        <p>{refund.bank_account_name || 'N/A'}</p>
                      </div>
                    </>
                  )}
                  
                  {refund.transaction_id && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">ID Transaksi Refund</p>
                      <p className="font-mono text-blue-600">{refund.transaction_id}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500 mb-1">Alasan Refund</p>
                  <p className="bg-gray-50 p-3 rounded-lg">
                    {refund.reason ? 
                      (refund.reason.startsWith('[ADMIN]') ? 
                        refund.reason.substring(7).trim() : 
                        refund.reason) : 
                      'Tidak ada alasan yang dicantumkan'}
                  </p>
                </div>

                {refund.notes && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500 mb-1">Catatan</p>
                    <p className="bg-blue-50 p-3 rounded-lg text-blue-800">
                      {refund.notes.startsWith('[ADMIN REFUND]') ? 
                        refund.notes.substring(14).trim() : 
                        refund.notes}
                    </p>
                  </div>
                )}

                {refund.rejection_reason && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500 mb-1">Alasan Penolakan</p>
                    <p className="bg-red-50 p-3 rounded-lg text-red-800">{refund.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Information Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-ticket-alt text-purple-500 mr-2"></i>
                  Informasi Booking
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Kode Booking</p>
                    <p className="font-medium text-blue-600">{refund.booking?.booking_code || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status Booking</p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {refund.booking?.status || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Rute</p>
                    <p className="flex items-center">
                      <i className="fas fa-route text-green-500 mr-2"></i>
                      {refund.booking?.schedule?.route ? 
                        `${refund.booking.schedule.route.origin} → ${refund.booking.schedule.route.destination}` : 
                        'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tanggal Keberangkatan</p>
                    <p className="flex items-center">
                      <i className="fas fa-calendar text-blue-500 mr-2"></i>
                      {refund.booking?.departure_date ? formatDate(refund.booking.departure_date) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Pembayaran</p>
                    <p className="font-medium text-lg">
                      {refund.booking?.total_amount ? formatCurrency(refund.booking.total_amount) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Dibuat Pada</p>
                    <p>{refund.booking?.created_at ? formatDate(refund.booking.created_at, true) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information Card */}
            {refund.payment && (
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <i className="fas fa-credit-card text-green-500 mr-2"></i>
                    Informasi Pembayaran
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Jumlah Pembayaran</p>
                      <p className="font-medium text-lg">
                        {formatCurrency(refund.payment.amount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Metode Pembayaran</p>
                      <p>
                        {refund.payment.payment_method} - {refund.payment.payment_channel}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Tanggal Pembayaran</p>
                      <p>
                        {refund.payment.payment_date ? formatDate(refund.payment.payment_date, true) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Status Pembayaran</p>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {refund.payment.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">ID Transaksi</p>
                      <p className="font-mono text-blue-600">{refund.payment.transaction_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - User & Actions */}
          <div className="space-y-6">
            {/* User Information Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-user text-purple-500 mr-2"></i>
                  Informasi Pengguna
                </h2>
              </div>

              <div className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <i className="fas fa-user-circle text-4xl text-purple-600"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{refund.booking?.user?.name || 'N/A'}</h3>
                  <p className="text-sm text-gray-500">
                    Member sejak {refund.booking?.user?.created_at ? formatDate(refund.booking.user.created_at) : 'N/A'}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-right text-gray-900">{refund.booking?.user?.email || 'N/A'}</dd>
                    </div>
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Telepon</dt>
                      <dd className="text-sm text-right text-gray-900">{refund.booking?.user?.phone || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-cogs text-blue-500 mr-2"></i>
                  Tindakan
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {refund.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => setShowApproveModal(true)}
                      disabled={processing}
                      className="w-full flex justify-center items-center px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-lg shadow-sm transition-colors"
                    >
                      {processing ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i> Memproses...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle mr-2"></i> Setujui Refund
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={processing}
                      className="w-full flex justify-center items-center px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg shadow-sm transition-colors"
                    >
                      <i className="fas fa-times-circle mr-2"></i> Tolak Refund
                    </button>
                  </>
                )}

                {refund.status === 'APPROVED' && (
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    disabled={processing}
                    className="w-full flex justify-center items-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg shadow-sm transition-colors"
                  >
                    <i className="fas fa-check-double mr-2"></i> Selesaikan Refund
                  </button>
                )}

                <Link
                  to={`/admin/bookings/${refund.booking_id}`}
                  className="block w-full text-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                >
                  <i className="fas fa-eye mr-2"></i> Lihat Detail Booking
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-modal-in">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-check-circle text-emerald-500 mr-2"></i>
                Setujui Refund
              </h3>
              <button
                onClick={() => setShowApproveModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="approval_notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan Persetujuan <span className="text-gray-400">(Opsional)</span>
                </label>
                <textarea
                  id="approval_notes"
                  rows="4"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Tambahkan catatan persetujuan (opsional)..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg transition-colors"
                >
                  {processing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i> Menyetujui...
                    </>
                  ) : (
                    'Setujui'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-modal-in">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-times-circle text-red-500 mr-2"></i>
                Tolak Refund
              </h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleReject}>
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="rejection_reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan Penolakan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="rejection_reason"
                    rows="4"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Jelaskan alasan penolakan refund..."
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
                  >
                    {processing ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i> Menolak...
                      </>
                    ) : (
                      'Tolak'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-modal-in">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-check-double text-blue-500 mr-2"></i>
                Selesaikan Refund
              </h3>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleComplete}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700 mb-1">
                    ID Transaksi Refund <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="transaction_id"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan ID transaksi dari sistem pembayaran"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">ID transaksi untuk melacak refund yang telah diproses</p>
                </div>

                <div>
                  <label htmlFor="completion_notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan Penyelesaian
                  </label>
                  <textarea
                    id="completion_notes"
                    rows="3"
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Catatan tambahan untuk penyelesaian refund..."
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCompleteModal(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                  >
                    {processing ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i> Memproses...
                      </>
                    ) : (
                      'Selesaikan'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
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

export default RefundShow;