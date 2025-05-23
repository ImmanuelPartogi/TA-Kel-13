import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../../services/api';

const RefundCreate = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [errors, setErrors] = useState([]);

  const [formData, setFormData] = useState({
    amount: 0,
    reason: '',
    refund_method: 'BANK_TRANSFER',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    notes: ''
  });

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  useEffect(() => {
    // Auto-hide alert after 5 seconds
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ show: false, type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin-panel/refunds/create/${bookingId}`);
      
      console.log('Booking details response:', response.data); // Debugging
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        setBookingData(data);
        
        // Set default amount berdasarkan suggested amount
        setFormData(prev => ({
          ...prev,
          amount: data.suggested_refund_amount || data.payment.amount
        }));
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: response.data?.message || 'Data booking tidak ditemukan'
        });
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      let errorMessage = 'Gagal memuat data booking';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAlert({
        show: true,
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.push('Jumlah refund harus lebih dari 0');
    }
    
    if (bookingData && formData.amount > bookingData.payment.amount) {
      newErrors.push('Jumlah refund tidak boleh melebihi total pembayaran');
    }
    
    if (!formData.reason) {
      newErrors.push('Alasan refund harus diisi');
    }
    
    if (!formData.refund_method) {
      newErrors.push('Metode refund harus dipilih');
    }
    
    if (formData.refund_method === 'BANK_TRANSFER') {
      if (!formData.bank_name) {
        newErrors.push('Nama bank harus diisi untuk transfer bank');
      }
      if (!formData.bank_account_number) {
        newErrors.push('Nomor rekening harus diisi untuk transfer bank');
      }
      if (!formData.bank_account_name) {
        newErrors.push('Nama pemilik rekening harus diisi untuk transfer bank');
      }
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setErrors([]);
    setAlert({ show: false, type: '', message: '' });

    try {
      const response = await api.post(`/admin-panel/refunds/store/${bookingId}`, formData);
      
      console.log('Create refund response:', response.data); // Debugging
      
      if (response.data && response.data.success) {
        setAlert({
          show: true,
          type: 'success',
          message: 'Permintaan refund berhasil dibuat! Redirecting...'
        });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/admin/refunds');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating refund:', error);
      
      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = Object.values(error.response.data.errors).flat();
        setErrors(backendErrors);
      } else {
        const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat membuat refund';
        setAlert({
          show: true,
          type: 'error',
          message: errorMessage
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="inline-block relative">
          <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
        <p className="mt-4 text-gray-600">Memuat data booking...</p>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-exclamation-triangle text-gray-400 text-4xl"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Data Booking Tidak Ditemukan</h3>
        <p className="text-gray-600 mb-6">Booking tidak ditemukan atau tidak dapat di-refund</p>
        <div className="flex justify-center space-x-3">
          <Link 
            to="/admin/bookings"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
            <i className="fas fa-ticket-alt mr-2"></i> Lihat Daftar Booking
          </Link>
          <Link 
            to="/admin/refunds"
            className="inline-flex items-center px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-sm">
            <i className="fas fa-hand-holding-usd mr-2"></i> Lihat Daftar Refund
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Modern Header */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-600 to-emerald-500 p-8 text-white relative">
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
                <i className="fas fa-plus-circle text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Buat Refund Baru</h1>
                <p className="mt-1 text-emerald-100">
                  Booking: <span className="font-medium">{bookingData.booking.booking_code}</span>
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

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-6 rounded-lg shadow-lg overflow-hidden animate-slideIn">
            <div className="bg-red-500 px-4 py-2 text-white flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                <span className="font-medium">Kesalahan Validasi</span>
              </div>
              <button onClick={() => setErrors([])} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="bg-red-50 border-red-100 text-red-700 px-4 py-3 border-t">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-edit text-emerald-500 mr-2"></i>
                  Form Refund
                </h2>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Refund Policy Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                      <i className="fas fa-info-circle mr-2"></i>
                      Kebijakan Refund
                    </h3>
                    <p className="text-sm text-blue-700 mb-2">{bookingData.refund_policy}</p>
                    <div className="grid grid-cols-2 gap-4 text-xs text-blue-600">
                      <div>
                        <span className="font-medium">Hari hingga keberangkatan:</span> {bookingData.days_until_departure} hari
                      </div>
                      <div>
                        <span className="font-medium">Persentase refund:</span> {bookingData.refund_percentage}%
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Refund <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rp</span>
                      </div>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="0"
                        min="0"
                        max={bookingData.payment.amount}
                        step="1000"
                        required
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>Maksimal: {formatCurrency(bookingData.payment.amount)}</span>
                      <span>Disarankan: {formatCurrency(bookingData.suggested_refund_amount)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, amount: bookingData.suggested_refund_amount }))}
                      className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 underline"
                    >
                      Gunakan jumlah yang disarankan
                    </button>
                  </div>

                  {/* Reason */}
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                      Alasan Refund <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      required
                    >
                      <option value="">Pilih alasan refund</option>
                      <option value="CUSTOMER_REQUEST">Permintaan Pelanggan</option>
                      <option value="SCHEDULE_CANCELLED">Jadwal Dibatalkan</option>
                      <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                      <option value="FERRY_ISSUE">Masalah Kapal</option>
                      <option value="FORCE_MAJEURE">Force Majeure</option>
                      <option value="ADMIN_DECISION">Keputusan Admin</option>
                      <option value="OTHER">Lainnya</option>
                    </select>
                  </div>

                  {/* Refund Method */}
                  <div>
                    <label htmlFor="refund_method" className="block text-sm font-medium text-gray-700 mb-1">
                      Metode Refund <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="refund_method"
                      name="refund_method"
                      value={formData.refund_method}
                      onChange={handleInputChange}
                      className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      required
                    >
                      <option value="BANK_TRANSFER">Transfer Bank</option>
                      <option value="ORIGINAL_PAYMENT_METHOD">Metode Pembayaran Asli</option>
                      <option value="CASH">Tunai</option>
                    </select>
                  </div>

                  {/* Bank Details - Show only for BANK_TRANSFER */}
                  {formData.refund_method === 'BANK_TRANSFER' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-800 flex items-center">
                        <i className="fas fa-university text-blue-500 mr-2"></i>
                        Detail Bank
                      </h4>
                      
                      <div>
                        <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Bank <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="bank_name"
                          name="bank_name"
                          value={formData.bank_name}
                          onChange={handleInputChange}
                          className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          placeholder="Contoh: Bank BCA"
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
                          onChange={handleInputChange}
                          className="block w-full py-3 px-3 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          placeholder="1234567890"
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
                          onChange={handleInputChange}
                          className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          placeholder="Nama sesuai rekening bank"
                          required={formData.refund_method === 'BANK_TRANSFER'}
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan Admin
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows="4"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Catatan tambahan untuk refund ini..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium rounded-lg shadow-sm transition-colors disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle mr-2"></i>
                          Buat Refund
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden sticky top-20 hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-ticket-alt text-purple-500 mr-2"></i>
                  Detail Booking
                </h2>
              </div>

              <div className="p-6">
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Kode Booking</dt>
                    <dd className="text-sm font-medium text-blue-600">{bookingData.booking.booking_code}</dd>
                  </div>
                  
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Pengguna</dt>
                    <dd className="text-sm text-gray-900">{bookingData.booking.user.name}</dd>
                  </div>

                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900 text-right break-all">{bookingData.booking.user.email}</dd>
                  </div>

                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Rute</dt>
                    <dd className="text-sm text-gray-900 text-right">
                      {bookingData.booking.schedule.route.origin} → {bookingData.booking.schedule.route.destination}
                    </dd>
                  </div>

                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Tanggal</dt>
                    <dd className="text-sm text-gray-900 text-right">
                      {formatDate(bookingData.booking.departure_date)}
                    </dd>
                  </div>

                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Kapal</dt>
                    <dd className="text-sm text-gray-900 text-right">{bookingData.booking.schedule.ferry.name}</dd>
                  </div>

                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Penumpang</dt>
                    <dd className="text-sm text-gray-900">{bookingData.booking.passenger_count} orang</dd>
                  </div>

                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Dibayar</dt>
                    <dd className="text-sm font-bold text-green-600">
                      {formatCurrency(bookingData.payment.amount)}
                    </dd>
                  </div>

                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Metode Bayar</dt>
                    <dd className="text-sm text-gray-900 text-right">
                      {bookingData.payment.payment_method} - {bookingData.payment.payment_channel}
                    </dd>
                  </div>
                </dl>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <Link
                    to={`/admin/bookings/${bookingData.booking.id}`}
                    className="block w-full text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                  >
                    <i className="fas fa-eye mr-2"></i> Lihat Detail Booking
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
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

export default RefundCreate;