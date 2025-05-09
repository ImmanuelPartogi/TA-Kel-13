import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { refundService } from '../../../services/api';
import Loading from '../../../components/ui/LoadingSpinner';
import Alert from '../../../components/ui/Alert';

const RefundCreate = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  
  const [formData, setFormData] = useState({
    amount: 0,
    reason: '',
    refund_method: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: ''
  });

  useEffect(() => {
    fetchRefundForm();
  }, [bookingId]);

  const fetchRefundForm = async () => {
    setLoading(true);
    try {
      const response = await refundService.getRefundForm(bookingId);
      const { booking, payment } = response.data;
      
      setBooking(booking);
      setPayment(payment);
      setFormData({
        ...formData,
        amount: booking.total_amount
      });
    } catch (err) {
      setError('Gagal memuat data. Silakan coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await refundService.createRefund(bookingId, formData);
      navigate(`/admin/bookings/${bookingId}`);
    } catch (err) {
      setError('Gagal membuat refund. Silakan coba lagi.');
      console.error(err);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  if (loading && !booking) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Buat Refund</h1>
          {booking && (
            <p className="mt-1 text-gray-600">Untuk Booking: <span className="font-medium">{booking.booking_code}</span></p>
          )}
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to={`/admin/bookings/${bookingId}`}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors shadow-sm"
          >
            <i className="fas fa-arrow-left mr-2 text-sm"></i> Kembali
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Main Content */}
      {booking && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Refund Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-lg text-gray-800">Form Refund</h2>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Refund <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">Rp</span>
                        <input
                          type="number"
                          id="amount"
                          name="amount"
                          min="0"
                          max={booking.total_amount}
                          value={formData.amount}
                          onChange={handleChange}
                          className="flex-1 min-w-0 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Maksimal: Rp {formatCurrency(booking.total_amount)}</p>
                    </div>

                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                        Alasan Refund <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="reason"
                        name="reason"
                        rows="3"
                        value={formData.reason}
                        onChange={handleChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label htmlFor="refund_method" className="block text-sm font-medium text-gray-700 mb-1">
                        Metode Refund <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="refund_method"
                        name="refund_method"
                        value={formData.refund_method}
                        onChange={handleChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                      >
                        <option value="">Pilih Metode</option>
                        <option value="ORIGINAL_PAYMENT_METHOD">Metode Pembayaran Asal</option>
                        <option value="BANK_TRANSFER">Transfer Bank</option>
                        <option value="CASH">Tunai</option>
                      </select>
                    </div>

                    <div id="bankTransferFields" className={`space-y-4 ${formData.refund_method === 'BANK_TRANSFER' ? '' : 'hidden'}`}>
                      <div>
                        <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Bank <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="bank_name"
                          name="bank_name"
                          value={formData.bank_name}
                          onChange={handleChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          required={formData.refund_method === 'BANK_TRANSFER'}
                        />
                      </div>

                      <div>
                        <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700 mb-1">
                          Nomor Rekening <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="bank_account_number"
                          name="bank_account_number"
                          value={formData.bank_account_number}
                          onChange={handleChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          required={formData.refund_method === 'BANK_TRANSFER'}
                        />
                      </div>

                      <div>
                        <label htmlFor="bank_account_name" className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Pemilik Rekening <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="bank_account_name"
                          name="bank_account_name"
                          value={formData.bank_account_name}
                          onChange={handleChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          required={formData.refund_method === 'BANK_TRANSFER'}
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i> Memproses...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save mr-2"></i> Buat Refund
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Details */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-800">Ringkasan Booking</h2>
              </div>

              <div className="p-6">
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Kode Booking</dt>
                    <dd className="text-sm font-medium text-blue-600">{booking.booking_code}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd>
                      {booking.status === 'PENDING' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      )}
                      {booking.status === 'COMPLETED' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Completed
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Pengguna</dt>
                    <dd className="text-sm text-gray-900">{booking.user.name}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Rute</dt>
                    <dd className="text-sm text-gray-900">{booking.schedule.route.origin} - {booking.schedule.route.destination}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Tanggal</dt>
                    <dd className="text-sm text-gray-900">{new Date(booking.booking_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Penumpang</dt>
                    <dd className="text-sm text-gray-900">{booking.passenger_count} orang</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Kendaraan</dt>
                    <dd className="text-sm text-gray-900">{booking.vehicle_count} unit</dd>
                  </div>
                  {payment && (
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Pembayaran</dt>
                      <dd className="text-sm text-gray-900">{payment.payment_method} ({payment.payment_channel})</dd>
                    </div>
                  )}
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Bayar</dt>
                    <dd className="text-sm font-bold text-blue-600">Rp {formatCurrency(booking.total_amount)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundCreate;