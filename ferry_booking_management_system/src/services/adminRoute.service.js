import { api } from './api';

export class adminRouteService {
  // Tambahkan pemetaan pelabuhan yang valid
  validPortMappings = {
    'Balige': ['Parapat', 'Samosir', 'Ajibata', 'Tomok', 'Onanrunggu'],
    'Parapat': ['Balige', 'Samosir', 'Tomok'],
    'Samosir': ['Balige', 'Parapat', 'Ajibata'],
    'Ajibata': ['Balige', 'Samosir', 'Tomok'],
    'Tomok': ['Parapat', 'Ajibata'],
  };

  /**
   * Fungsi untuk validasi kombinasi asal dan tujuan
   * @param {string} origin - Pelabuhan asal
   * @param {string} destination - Pelabuhan tujuan
   * @returns {boolean} - Apakah kombinasi valid
   */
  validateRouteOriginDestination(origin, destination) {
    if (!origin || !destination) return true; // Biarkan validasi required menanganinya

    // Ubah ke title case untuk standarisasi
    const normalizedOrigin = this.normalizePortName(origin);
    const normalizedDestination = this.normalizePortName(destination);

    // Cek apakah asal ada dalam pemetaan
    if (!this.validPortMappings[normalizedOrigin]) return false;

    // Cek apakah tujuan valid untuk asal tersebut
    return this.validPortMappings[normalizedOrigin].includes(normalizedDestination);
  }

  /**
   * Fungsi bantuan untuk standarisasi nama pelabuhan
   * @param {string} portName - Nama pelabuhan
   * @returns {string} - Nama pelabuhan yang sudah distandarisasi
   */
  normalizePortName(portName) {
    if (!portName) return '';
    return portName.trim().replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  /**
   * Mendapatkan tujuan yang valid berdasarkan asal
   * @param {string} origin - Pelabuhan asal
   * @returns {Array} - Daftar tujuan yang valid
   */
  getValidDestinations(origin) {
    if (!origin) return [];
    const normalizedOrigin = this.normalizePortName(origin);
    return this.validPortMappings[normalizedOrigin] || [];
  }

  /**
   * Mendapatkan semua nama pelabuhan yang tersedia
   * @returns {Array} - Daftar nama pelabuhan
   */
  getAllPorts() {
    return Object.keys(this.validPortMappings);
  }

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
 * Mendapatkan daftar kategori kendaraan
 * @param {Object} params - Filter parameters
 * @returns {Promise}
 */
  async getVehicleCategories(params = {}) {
    try {
      const response = await api.get('/admin-panel/vehicle-categories', { params });

      console.log('Raw API response:', response);

      // Perbaikan: Respons HTTP 200 berarti success, terlepas dari struktur data
      return {
        status: 'success',  // Tetapkan 'success' langsung karena HTTP 200
        data: response.data.data || []  // Ambil array data dari response.data.data (Laravel pagination)
      };
    } catch (error) {
      console.error('Error fetching vehicle categories:', error);
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
   * @param {Array} vehicleCategories - Vehicle categories
   * @returns {Array}
   */
  getPriceList(route, vehicleCategories = []) {
    // Mulai dengan harga dasar tiket penumpang
    const priceList = [
      { type: 'Tiket', price: route.base_price, icon: 'ticket' }
    ];

    // Tambahkan harga kendaraan dari vehicleCategories jika tersedia
    if (vehicleCategories && vehicleCategories.length > 0) {
      // Map tipe kendaraan ke icon
      const typeToIcon = {
        'MOTORCYCLE': 'motorcycle',
        'CAR': 'car',
        'BUS': 'bus',
        'TRUCK': 'truck',
        'PICKUP': 'pickup-truck',
        'TRONTON': 'truck-moving'
      };

      // Map tipe kendaraan ke nama yang lebih user-friendly
      const typeToName = {
        'MOTORCYCLE': 'Motor',
        'CAR': 'Mobil',
        'BUS': 'Bus',
        'TRUCK': 'Truk',
        'PICKUP': 'Pickup',
        'TRONTON': 'Tronton'
      };

      // Tambahkan setiap kategori kendaraan
      vehicleCategories.forEach(category => {
        priceList.push({
          type: typeToName[category.vehicle_type] || category.name,
          price: category.base_price,
          icon: typeToIcon[category.vehicle_type] || 'car',
          code: category.code,
          id: category.id
        });
      });
    }

    return priceList;
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

  /**
   * Get vehicle price by type from categories
   * @param {Array} vehicleCategories - List of vehicle categories
   * @param {String} vehicleType - Type of vehicle
   * @returns {Number}
   */
  getVehiclePriceByType(vehicleCategories, vehicleType) {
    if (!vehicleCategories || !vehicleCategories.length) {
      return 0;
    }

    const category = vehicleCategories.find(cat => cat.vehicle_type === vehicleType);
    return category ? category.base_price : 0;
  }

  /**
   * Format vehicle type to human readable name
   * @param {String} type - Vehicle type
   * @returns {String}
   */
  formatVehicleType(type) {
    const types = {
      'MOTORCYCLE': 'Motor',
      'CAR': 'Mobil',
      'BUS': 'Bus',
      'TRUCK': 'Truk',
      'PICKUP': 'Pickup',
      'TRONTON': 'Tronton'
    };

    return types[type] || type;
  }
}

export default new adminRouteService();