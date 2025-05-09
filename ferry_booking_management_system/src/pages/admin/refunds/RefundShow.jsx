import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { refundService } from '../../services/api';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

const RefundShow = () => {
  const { id } = useParams();
    const [loading, setLoading] = useState(true);
  const [refund, setRefund] = useState(null);
  const [alert, setAlert] = useState(null);
  
  // Modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    fetchRefundDetails();
  }, [id]);

  const fetchRefundDetails = async () => {
    setLoading(true);
    try {
      const response = await refundService.getRefund(id);
      setRefund(response.data.refund);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Gagal memuat data refund. Silakan coba lagi.'
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async () => {
    setLoading(true);
    try {
      await refundService.approveRefund(id);
      setAlert({
        type: 'success',
        message: 'Refund berhasil disetujui'
      });
      fetchRefundDetails();
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Gagal menyetujui refund. Silakan coba lagi.'
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRefund = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await refundService.rejectRefund(id, { rejection_reason: rejectionReason });
      setShowRejectModal(false);
      setAlert({
        type: 'success',
        message: 'Refund berhasil ditolak'
      });
      fetchRefundDetails();
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Gagal menolak refund. Silakan coba lagi.'
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRefund = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await refundService.completeRefund(id, { transaction_id: transactionId });
      setShowCompleteModal(false);
      setAlert({
        type: 'success',
        message: 'Refund berhasil diselesaikan'
      });
      fetchRefundDetails();
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Gagal menyelesaikan refund. Silakan coba lagi.'
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Approved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
      default:
        return null;
    }
  };

  if (loading && !refund) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detail Refund</h1>
          {refund && <p className="mt-1 text-gray-600">ID: <span className="font-medium">#{refund.id}</span></p>}
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

      {/* Alert message */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Main Content */}
      {refund && (
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
                    <p className="font-medium">#{refund.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <div>
                      {getStatusBadge(refund.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Jumlah Refund</p>
                    <p className="font-medium text-blue-600">Rp {formatCurrency(refund.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Metode Refund</p>
                    <p>
                      {refund.refund_method === 'ORIGINAL_PAYMENT_METHOD' && 'Metode Pembayaran Asal'}
                      {refund.refund_method === 'BANK_TRANSFER' && 'Transfer Bank'}
                      {refund.refund_method === 'CASH' && 'Tunai'}
                    </p>
                  </div>
                  {refund.refund_method === 'BANK_TRANSFER' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Nama Bank</p>
                        <p>{refund.bank_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Nomor Rekening</p>
                        <p>{refund.bank_account_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Nama Pemilik Rekening</p>
                        <p>{refund.bank_account_name}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Dibuat Pada</p>
                    <p>{formatDate(refund.created_at)}</p>
                  </div>
                  {refund.transaction_id && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">ID Transaksi</p>
                      <p>{refund.transaction_id}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500 mb-1">Alasan Refund</p>
                  <p>{refund.reason}</p>
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
                    <p className="font-medium">{refund.booking.booking_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status Booking</p>
                    <div>
                      {refund.booking.status === 'PENDING' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                      {refund.booking.status === 'CONFIRMED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      )}
                      {refund.booking.status === 'CANCELLED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Cancelled
                        </span>
                      )}
                      {refund.booking.status === 'COMPLETED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Completed
                        </span>
                      )}
                      {refund.booking.status === 'REFUNDED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Refunded
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Rute</p>
                    <p>{refund.booking.schedule.route.origin} - {refund.booking.schedule.route.destination}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tanggal Keberangkatan</p>
                    <p>{new Date(refund.booking.booking_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Penumpang</p>
                    <p>{refund.booking.passenger_count} orang</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Kendaraan</p>
                    <p>{refund.booking.vehicle_count} unit</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Pembayaran</p>
                    <p className="font-medium">Rp {formatCurrency(refund.booking.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Dibuat Pada</p>
                    <p>{formatDate(refund.booking.created_at)}</p>
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
                    <p className="font-medium">#{refund.payment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status Pembayaran</p>
                    <div>
                      {refund.payment.status === 'PENDING' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                      {refund.payment.status === 'SUCCESS' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Success
                        </span>
                      )}
                      {refund.payment.status === 'FAILED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Failed
                        </span>
                      )}
                      {refund.payment.status === 'REFUNDED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Refunded
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Jumlah Pembayaran</p>
                    <p className="font-medium">Rp {formatCurrency(refund.payment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Metode Pembayaran</p>
                    <p>{refund.payment.payment_method} ({refund.payment.payment_channel})</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tanggal Pembayaran</p>
                    <p>{refund.payment.payment_date ? formatDate(refund.payment.payment_date) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Transaksi</p>
                    <p>{refund.payment.transaction_id || 'N/A'}</p>
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
                  <h3 className="text-lg font-medium text-gray-900">{refund.booking.user.name}</h3>
                  <p className="text-sm text-gray-500">Member sejak {new Date(refund.booking.user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-right text-gray-900">{refund.booking.user.email}</dd>
                    </div>
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Telepon</dt>
                      <dd className="text-sm text-right text-gray-900">{refund.booking.user.phone || 'N/A'}</dd>
                    </div>
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Total Booking</dt>
                      <dd className="text-sm text-right text-gray-900">{refund.booking.user.total_bookings || '0'}</dd>
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
                {refund.status === 'PENDING' && (
                  <>
                    <button
                      onClick={handleApproveRefund}
                      disabled={loading}
                      className="w-full flex justify-center items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm"
                    >
                      <i className="fas fa-check-circle mr-2"></i> Setujui Refund
                    </button>

                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={loading}
                      className="w-full flex justify-center items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm"
                    >
                      <i className="fas fa-times-circle mr-2"></i> Tolak Refund
                    </button>
                  </>
                )}

                {refund.status === 'APPROVED' && (
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    disabled={loading}
                    className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
                  >
                    <i className="fas fa-check-double mr-2"></i> Selesaikan Refund
                  </button>
                )}

                <Link
                  to={`/admin/bookings/${refund.booking_id}`}
                  className="block w-full text-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md shadow-sm"
                >
                  <i className="fas fa-eye mr-2"></i> Lihat Detail Booking
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white rounded-lg overflow-hidden shadow-xl relative z-10 w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Tolak Refund</h3>
            </div>
            <form onSubmit={handleRejectRefund}>
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="rejection_reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan Penolakan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="rejection_reason"
                    name="rejection_reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
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
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    {loading ? 'Memproses...' : 'Tolak'}
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
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white rounded-lg overflow-hidden shadow-xl relative z-10 w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Selesaikan Refund</h3>
            </div>
            <form onSubmit={handleCompleteRefund}>
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700 mb-1">
                    ID Transaksi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="transaction_id"
                    name="transaction_id"
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
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    {loading ? 'Memproses...' : 'Selesaikan'}
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