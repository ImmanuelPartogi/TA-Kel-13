import { api } from './api';

class adminBookingService {
  /**
   * Mendapatkan daftar booking dengan filter
   * @param {Object} params - Filter parameters
   * @returns {Promise}
   */
  async getBookings(params = {}) {
    try {
      const response = await api.get('/admin-panel/bookings', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan detail booking berdasarkan ID
   * @param {number} id - Booking ID
   * @returns {Promise}
   */
  async getBookingDetail(id) {
    try {
      const response = await api.get(`/admin-panel/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking detail:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan jadwal berdasarkan rute dan tanggal
   * @param {Object} data - Request data
   * @returns {Promise}
   */
  async getSchedules(data) {
    try {
      const response = await api.post('/admin-panel/bookings/schedules', data);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  }

  /**
   * Memperbarui status booking
   * @param {number} id - Booking ID
   * @param {Object} data - Status update data
   * @returns {Promise}
   */
  async updateBookingStatus(id, data) {
    try {
      const response = await api.put(`/admin-panel/bookings/${id}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan data form reschedule
   * @param {number} id - Booking ID
   * @returns {Promise}
   */
  async getRescheduleForm(id) {
    try {
      const response = await api.get(`/admin-panel/bookings/${id}/reschedule`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reschedule form:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan jadwal tersedia untuk reschedule
   * @param {Object} data - Request data
   * @returns {Promise}
   */
  async getAvailableSchedules(data) {
    try {
      const response = await api.post('/admin-panel/bookings/get-available-schedules', data);
      return response.data;
    } catch (error) {
      console.error('Error fetching available schedules:', error);
      throw error;
    }
  }

  /**
   * Memproses reschedule booking
   * @param {number} id - Booking ID
   * @param {Object} data - Reschedule data
   * @returns {Promise}
   */
  async processReschedule(id, data) {
    try {
      const response = await api.post(`/admin-panel/bookings/${id}/process-reschedule`, data);
      return response.data;
    } catch (error) {
      console.error('Error processing reschedule:', error);
      throw error;
    }
  }

  /**
   * Mengekspor daftar booking
   * @param {Object} params - Export parameters
   * @returns {Promise}
   */
  async exportBookings(params = {}) {
    try {
      const response = await api.get('/admin-panel/bookings/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting bookings:', error);
      throw error;
    }
  }

  async getVehicleCategories() {
    try {
      const response = await api.get('/admin-panel/vehicle-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle categories:', error);
      throw error;
    }
  }

  /**
   * Format tanggal untuk display
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
   * Get status color class
   * @param {string} status - Booking status
   * @returns {string}
   */
  getStatusColor(status) {
    const colors = {
      'PENDING': 'yellow',
      'CONFIRMED': 'green',
      'CANCELLED': 'red',
      'COMPLETED': 'blue',
      'REFUNDED': 'purple',
      'RESCHEDULED': 'orange'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get status text
   * @param {string} status - Booking status
   * @returns {string}
   */
  getStatusText(status) {
    const texts = {
      'PENDING': 'Menunggu',
      'CONFIRMED': 'Dikonfirmasi',
      'CANCELLED': 'Dibatalkan',
      'COMPLETED': 'Selesai',
      'REFUNDED': 'Dikembalikan',
      'RESCHEDULED': 'Dijadwalkan Ulang'
    };
    return texts[status] || status;
  }

  /**
   * Check if booking can be rescheduled
   * @param {Object} booking - Booking object
   * @returns {boolean}
   */
  canReschedule(booking) {
    return booking.status === 'CONFIRMED';
  }

  /**
   * Check if booking status can be updated
   * @param {string} currentStatus - Current status
   * @param {string} newStatus - New status
   * @returns {boolean}
   */
  canUpdateStatus(currentStatus, newStatus) {
    const allowedTransitions = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['COMPLETED', 'CANCELLED'],
      'CANCELLED': ['REFUNDED'],
      'COMPLETED': ['REFUNDED'],
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Build filter query string
   * @param {Object} filters - Filter object
   * @returns {Object}
   */
  buildFilterParams(filters) {
    const params = {};

    if (filters.booking_code) {
      params.booking_code = filters.booking_code;
    }

    if (filters.user_name) {
      params.user_name = filters.user_name;
    }

    if (filters.route_id) {
      params.route_id = filters.route_id;
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.departure_date_from) {
      params.departure_date_from = filters.departure_date_from;
    }

    if (filters.departure_date_to) {
      params.departure_date_to = filters.departure_date_to;
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

export default new adminBookingService();