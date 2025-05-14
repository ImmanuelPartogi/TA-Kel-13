import { api } from './api';

class adminRefundService {
  /**
   * Mendapatkan daftar refund dengan filter
   * @param {Object} params - Filter parameters
   * @returns {Promise}
   */
  async getRefunds(params = {}) {
    try {
      const response = await api.get('/admin-panel/refunds', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching refunds:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan detail refund
   * @param {number} id - Refund ID
   * @returns {Promise}
   */
  async getRefundDetail(id) {
    try {
      const response = await api.get(`/admin-panel/refunds/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching refund detail:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan form refund untuk booking
   * @param {number} bookingId - Booking ID
   * @returns {Promise}
   */
  async getRefundForm(bookingId) {
    try {
      const response = await api.get(`/admin-panel/refunds/create/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching refund form:', error);
      throw error;
    }
  }

  /**
   * Membuat refund baru
   * @param {number} bookingId - Booking ID
   * @param {Object} data - Refund data
   * @returns {Promise}
   */
  async createRefund(bookingId, data) {
    try {
      const response = await api.post(`/admin-panel/refunds/store/${bookingId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }

  /**
   * Menyetujui refund
   * @param {number} id - Refund ID
   * @returns {Promise}
   */
  async approveRefund(id) {
    try {
      const response = await api.post(`/admin-panel/refunds/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving refund:', error);
      throw error;
    }
  }

  /**
   * Menolak refund
   * @param {number} id - Refund ID
   * @param {Object} data - Rejection data
   * @returns {Promise}
   */
  async rejectRefund(id, data) {
    try {
      const response = await api.post(`/admin-panel/refunds/${id}/reject`, data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting refund:', error);
      throw error;
    }
  }

  /**
   * Menyelesaikan refund
   * @param {number} id - Refund ID
   * @param {Object} data - Complete data
   * @returns {Promise}
   */
  async completeRefund(id, data) {
    try {
      const response = await api.post(`/admin-panel/refunds/${id}/complete`, data);
      return response.data;
    } catch (error) {
      console.error('Error completing refund:', error);
      throw error;
    }
  }

  /**
   * Format currency
   * @param {number} amount - Amount
   * @returns {string}
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format date
   * @param {string} date - Date string
   * @returns {string}
   */
  formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get status color
   * @param {string} status - Refund status
   * @returns {string}
   */
  getStatusColor(status) {
    const colors = {
      'PENDING': 'yellow',
      'APPROVED': 'blue',
      'REJECTED': 'red',
      'COMPLETED': 'green'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get status text
   * @param {string} status - Refund status
   * @returns {string}
   */
  getStatusText(status) {
    const texts = {
      'PENDING': 'Menunggu',
      'APPROVED': 'Disetujui',
      'REJECTED': 'Ditolak',
      'COMPLETED': 'Selesai'
    };
    return texts[status] || status;
  }

  /**
   * Get refund method text
   * @param {string} method - Refund method
   * @returns {string}
   */
  getRefundMethodText(method) {
    const texts = {
      'ORIGINAL_PAYMENT_METHOD': 'Metode Pembayaran Awal',
      'BANK_TRANSFER': 'Transfer Bank',
      'CASH': 'Tunai'
    };
    return texts[method] || method;
  }

  /**
   * Validate refund form
   * @param {Object} formData - Form data
   * @returns {Object}
   */
  validateRefundForm(formData) {
    const errors = {};

    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Jumlah refund harus lebih dari 0';
    }

    if (!formData.reason) {
      errors.reason = 'Alasan refund harus diisi';
    }

    if (!formData.refund_method) {
      errors.refund_method = 'Metode refund harus dipilih';
    }

    if (formData.refund_method === 'BANK_TRANSFER') {
      if (!formData.bank_name) {
        errors.bank_name = 'Nama bank harus diisi';
      }
      if (!formData.bank_account_number) {
        errors.bank_account_number = 'Nomor rekening harus diisi';
      }
      if (!formData.bank_account_name) {
        errors.bank_account_name = 'Nama pemilik rekening harus diisi';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate rejection form
   * @param {Object} formData - Form data
   * @returns {Object}
   */
  validateRejectionForm(formData) {
    const errors = {};

    if (!formData.rejection_reason) {
      errors.rejection_reason = 'Alasan penolakan harus diisi';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate complete form
   * @param {Object} formData - Form data
   * @returns {Object}
   */
  validateCompleteForm(formData) {
    const errors = {};

    if (!formData.transaction_id) {
      errors.transaction_id = 'ID transaksi harus diisi';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Check if refund can be processed
   * @param {Object} refund - Refund object
   * @returns {Object}
   */
  checkRefundActions(refund) {
    return {
      canApprove: refund.status === 'PENDING',
      canReject: refund.status === 'PENDING',
      canComplete: refund.status === 'APPROVED'
    };
  }

  /**
   * Build filter params
   * @param {Object} filters - Filter object
   * @returns {Object}
   */
  buildFilterParams(filters) {
    const params = {};

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.booking_code) {
      params.booking_code = filters.booking_code;
    }

    if (filters.date_from) {
      params.date_from = filters.date_from;
    }

    if (filters.date_to) {
      params.date_to = filters.date_to;
    }

    if (filters.per_page) {
      params.per_page = filters.per_page;
    }

    if (filters.page) {
      params.page = filters.page;
    }

    return params;
  }
}

export default new adminRefundService();