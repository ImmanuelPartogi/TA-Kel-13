import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../services/api';

const RefundShow = () => {
  const { id } = useParams();
  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchRefundDetails();
  }, [id]);

  const fetchRefundDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin-panel/refunds/${id}`);
      setRefund(response.data);
    } catch (error) {
      console.error('Error fetching refund details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/admin-panel/refunds/${id}/approve`);
      setMessage({ type: 'success', text: 'Refund berhasil disetujui' });
      fetchRefundDetails();
    } catch (error) {
      console.error('Error approving refund:', error);
      setMessage({ type: 'error', text: 'Gagal menyetujui refund' });
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin-panel/refunds/${id}/reject`, {
        rejection_reason: rejectionReason
      });
      setMessage({ type: 'success', text: 'Refund berhasil ditolak' });
      setShowRejectModal(false);
      fetchRefundDetails();
    } catch (error) {
      console.error('Error rejecting refund:', error);
      setMessage({ type: 'error', text: 'Gagal menolak refund' });
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin-panel/refunds/${id}/complete`, {
        transaction_id: transactionId
      });
      setMessage({ type: 'success', text: 'Refund berhasil diselesaikan' });
      setShowCompleteModal(false);
      fetchRefundDetails();
    } catch (error) {
      console.error('Error completing refund:', error);
      setMessage({ type: 'error', text: 'Gagal menyelesaikan refund' });
    }
  };

  const getStatusBadge = (status, type = 'refund') => {
    const badges = {
      refund: {
        PENDING: 'bg-yellow-100 text-yellow-800',
        APPROVED: 'bg-blue-100 text-blue-800',
        REJECTED: 'bg-red-100 text-red-800',
        COMPLETED: 'bg-green-100 text-green-800'
      },
      booking: {
        PENDING: 'bg-yellow-100 text-yellow-800',
        CONFIRMED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
        COMPLETED: 'bg-blue-100 text-blue-800',
        REFUNDED: 'bg-gray-100 text-gray-800'
      },
      payment: {
        PENDING: 'bg-yellow-100 text-yellow-800',
        SUCCESS: 'bg-green-100 text-green-800',
        FAILED: 'bg-red-100 text-red-800',
        REFUNDED: 'bg-gray-100 text-gray-800'
      }
    };
    return badges[type][status] || 'bg-gray-100 text-gray-800';
  };

  const getRefundMethodText = (method) => {
    const methods = {
      ORIGINAL_PAYMENT_METHOD: 'Metode Pembayaran Asal',
      BANK_TRANSFER: 'Transfer Bank',
      CASH: 'Tunai'
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detail Refund</h1>
          <p className="mt-1 text-gray-600">
            ID: <span className="font-medium">#{refund?.id}</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/admin/refunds"
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors shadow-sm"
          >
            <i className="fas fa-arrow-left mr-2 text-sm"></i> Kembali
          </Link>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`border-l-4 p-4 mb-6 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-500' 
            : 'bg-red-50 border-red-500'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <i className={`fas ${
                message.type === 'success' 
                  ? 'fa-check-circle text-green-500' 
                  : 'fa-exclamation-circle text-red-500'
              }`}></i>
            </div>
            <div className="ml-3">
              <p className={`text-sm ${
                message.type === 'success' 
                  ? 'text-green-700' 
                  : 'text-red-700'
              }`}>{message.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Refund Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Refund Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Informasi Refund</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">ID Refund</p>
                  <p className="font-medium">#{refund?.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(refund?.status)}`}>
                      {refund?.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Jumlah Refund</p>
                  <p className="font-medium text-blue-600">
                    Rp {new Intl.NumberFormat('id-ID').format(refund?.amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Metode Refund</p>
                  <p>{getRefundMethodText(refund?.refund_method)}</p>
                </div>
                {refund?.refund_method === 'BANK_TRANSFER' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nama Bank</p>
                      <p>{refund?.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nomor Rekening</p>
                      <p>{refund?.bank_account_number}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Nama Pemilik Rekening</p>
                      <p>{refund?.bank_account_name}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Dibuat Pada</p>
                  <p>
                    {refund?.created_at && new Date(refund.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {refund?.transaction_id && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Transaksi</p>
                    <p>{refund?.transaction_id}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500 mb-1">Alasan Refund</p>
                <p>{refund?.reason}</p>
              </div>
            </div>
          </div>

          {/* Booking Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Informasi Booking</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Kode Booking</p>
                  <p className="font-medium">{refund?.booking?.booking_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status Booking</p>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(refund?.booking?.status, 'booking')}`}>
                      {refund?.booking?.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rute</p>
                  <p>
                    {refund?.booking?.schedule?.route?.origin} - {refund?.booking?.schedule?.route?.destination}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tanggal Keberangkatan</p>
                  <p>
                    {refund?.booking?.booking_date && new Date(refund.booking.booking_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Penumpang</p>
                  <p>{refund?.booking?.passenger_count} orang</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Kendaraan</p>
                  <p>{refund?.booking?.vehicle_count} unit</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Pembayaran</p>
                  <p className="font-medium">
                    Rp {new Intl.NumberFormat('id-ID').format(refund?.booking?.total_amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Dibuat Pada</p>
                  <p>
                    {refund?.booking?.created_at && new Date(refund.booking.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Informasi Pembayaran</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">ID Pembayaran</p>
                  <p className="font-medium">#{refund?.payment?.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status Pembayaran</p>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(refund?.payment?.status, 'payment')}`}>
                      {refund?.payment?.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Jumlah Pembayaran</p>
                  <p className="font-medium">
                    Rp {new Intl.NumberFormat('id-ID').format(refund?.payment?.amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Metode Pembayaran</p>
                  <p>
                    {refund?.payment?.payment_method} ({refund?.payment?.payment_channel})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tanggal Pembayaran</p>
                  <p>
                    {refund?.payment?.payment_date 
                      ? new Date(refund.payment.payment_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">ID Transaksi</p>
                  <p>{refund?.payment?.transaction_id || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - User & Actions */}
        <div className="space-y-6">
          {/* User Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Informasi Pengguna</h2>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <i className="fas fa-user-circle text-4xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{refund?.booking?.user?.name}</h3>
                <p className="text-sm text-gray-500">
                  Member sejak {refund?.booking?.user?.created_at && new Date(refund.booking.user.created_at).toLocaleDateString('id-ID', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-right text-gray-900">{refund?.booking?.user?.email}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Telepon</dt>
                    <dd className="text-sm text-right text-gray-900">{refund?.booking?.user?.phone || 'N/A'}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Booking</dt>
                    <dd className="text-sm text-right text-gray-900">{refund?.booking?.user?.total_bookings || '0'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Tindakan</h2>
            </div>

            <div className="p-6 space-y-4">
              {refund?.status === 'PENDING' && (
                <>
                  <button
                    onClick={handleApprove}
                    className="w-full flex justify-center items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm"
                  >
                    <i className="fas fa-check-circle mr-2"></i> Setujui Refund
                  </button>

                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-full flex justify-center items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm"
                  >
                    <i className="fas fa-times-circle mr-2"></i> Tolak Refund
                  </button>
                </>
              )}

              {refund?.status === 'APPROVED' && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
                >
                  <i className="fas fa-check-double mr-2"></i> Selesaikan Refund
                </button>
              )}

              <Link
                to={`/admin/bookings/${refund?.booking_id}`}
                className="block w-full text-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md shadow-sm"
              >
                <i className="fas fa-eye mr-2"></i> Lihat Detail Booking
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowRejectModal(false)}></div>
          <div className="bg-white rounded-lg overflow-hidden shadow-xl relative z-10 w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Tolak Refund</h3>
            </div>
            <form onSubmit={handleReject}>
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="rejection_reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan Penolakan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="rejection_reason"
                    rows="3"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowCompleteModal(false)}></div>
          <div className="bg-white rounded-lg overflow-hidden shadow-xl relative z-10 w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Selesaikan Refund</h3>
            </div>
            <form onSubmit={handleComplete}>
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700 mb-1">
                    ID Transaksi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="transaction_id"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Masukkan ID transaksi refund dari sistem pembayaran</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCompleteModal(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    Selesaikan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundShow;