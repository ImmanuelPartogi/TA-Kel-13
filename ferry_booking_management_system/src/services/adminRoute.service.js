import { api } from './api';

export class adminRouteService {
  /**
   * Mendapatkan daftar route dengan filter
   * @param {Object} params - Filter parameters
   * @returns {Promise}
   */
  async getRoutes(params = {}) {
    try {
      const response = await api.get('/admin-panel/routes', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan detail route
   * @param {number} id - Route ID
   * @returns {Promise}
   */
  async getRouteDetail(id) {
    try {
      const response = await api.get(`/admin-panel/routes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching route detail:', error);
      throw error;
    }
  }

  /**
   * Membuat route baru
   * @param {Object} data - Route data
   * @returns {Promise}
   */
  async createRoute(data) {
    try {
      const response = await api.post('/admin-panel/routes', data);
      return response.data;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  }

  /**
   * Memperbarui route
   * @param {number} id - Route ID
   * @param {Object} data - Route data
   * @returns {Promise}
   */
  async updateRoute(id, data) {
    try {
      const response = await api.put(`/admin-panel/routes/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating route:', error);
      throw error;
    }
  }

  /**
   * Menghapus route
   * @param {number} id - Route ID
   * @returns {Promise}
   */
  async deleteRoute(id) {
    try {
      const response = await api.delete(`/admin-panel/routes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
  }

  /**
   * Memperbarui status route
   * @param {number} id - Route ID
   * @param {Object} data - Status data
   * @returns {Promise}
   */
  async updateRouteStatus(id, data) {
    try {
      const response = await api.put(`/admin-panel/routes/${id}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating route status:', error);
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
   * Format distance
   * @param {number} distance - Distance in km
   * @returns {string}
   */
  formatDistance(distance) {
    return `${distance} km`;
  }

  /**
   * Format duration
   * @param {number} duration - Duration in minutes
   * @returns {string}
   */
  formatDuration(duration) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours} jam ${minutes} menit`;
    } else if (hours > 0) {
      return `${hours} jam`;
    } else {
      return `${minutes} menit`;
    }
  }

  /**
   * Get status color
   * @param {string} status - Route status
   * @returns {string}
   */
  getStatusColor(status) {
    const colors = {
      'ACTIVE': 'green',
      'INACTIVE': 'red',
      'WEATHER_ISSUE': 'yellow'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get status text
   * @param {string} status - Route status
   * @returns {string}
   */
  getStatusText(status) {
    const texts = {
      'ACTIVE': 'Aktif',
      'INACTIVE': 'Tidak Aktif',
      'WEATHER_ISSUE': 'Masalah Cuaca'
    };
    return texts[status] || status;
  }

  /**
   * Format route display
   * @param {Object} route - Route object
   * @returns {string}
   */
  formatRouteDisplay(route) {
    return `${route.origin} - ${route.destination}`;
  }

  /**
   * Get price list
   * @param {Object} route - Route object
   * @returns {Array}
   */
  getPriceList(route) {
    return [
      { type: 'Tiket', price: route.base_price, icon: 'ticket' },
      { type: 'Motor', price: route.motorcycle_price, icon: 'motorcycle' },
      { type: 'Mobil', price: route.car_price, icon: 'car' },
      { type: 'Bus', price: route.bus_price, icon: 'bus' },
      { type: 'Truk', price: route.truck_price, icon: 'truck' }
    ];
  }

  /**
   * Validate route form
   * @param {Object} formData - Form data
   * @returns {Object}
   */
  validateRouteForm(formData) {
    const errors = {};

    if (!formData.origin) {
      errors.origin = 'Asal harus diisi';
    }

    if (!formData.destination) {
      errors.destination = 'Tujuan harus diisi';
    }

    if (!formData.route_code) {
      errors.route_code = 'Kode rute harus diisi';
    }

    if (!formData.duration || formData.duration < 1) {
      errors.duration = 'Durasi minimal 1 menit';
    }

    if (formData.distance !== null && formData.distance < 0) {
      errors.distance = 'Jarak tidak boleh negatif';
    }

    if (!formData.base_price || formData.base_price < 0) {
      errors.base_price = 'Harga tiket tidak boleh negatif';
    }

    if (!formData.motorcycle_price || formData.motorcycle_price < 0) {
      errors.motorcycle_price = 'Harga motor tidak boleh negatif';
    }

    if (!formData.car_price || formData.car_price < 0) {
      errors.car_price = 'Harga mobil tidak boleh negatif';
    }

    if (!formData.bus_price || formData.bus_price < 0) {
      errors.bus_price = 'Harga bus tidak boleh negatif';
    }

    if (!formData.truck_price || formData.truck_price < 0) {
      errors.truck_price = 'Harga truk tidak boleh negatif';
    }

    if (!formData.status) {
      errors.status = 'Status harus dipilih';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate status update form
   * @param {Object} formData - Form data
   * @returns {Object}
   */
  validateStatusUpdateForm(formData) {
    const errors = {};

    if (!formData.status) {
      errors.status = 'Status harus dipilih';
    }

    if (formData.status === 'WEATHER_ISSUE' && formData.status_expiry_date) {
      const expiryDate = new Date(formData.status_expiry_date);
      const now = new Date();
      
      if (expiryDate <= now) {
        errors.status_expiry_date = 'Tanggal kedaluwarsa harus setelah hari ini';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
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

    if (filters.origin) {
      params.origin = filters.origin;
    }

    if (filters.destination) {
      params.destination = filters.destination;
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

export default new adminRouteService();