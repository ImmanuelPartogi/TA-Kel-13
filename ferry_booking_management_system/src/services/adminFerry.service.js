import api from './api';

export class AdminFerryService {
  /**
   * Mendapatkan daftar ferry dengan filter
   * @param {Object} params - Filter parameters
   * @returns {Promise}
   */
  async getFerries(params = {}) {
    try {
      const response = await api.get('/admin-panel/ferries', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching ferries:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan detail ferry
   * @param {number} id - Ferry ID
   * @returns {Promise}
   */
  async getFerryDetail(id) {
    try {
      const response = await api.get(`/admin-panel/ferries/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ferry detail:', error);
      throw error;
    }
  }

  /**
   * Membuat ferry baru
   * @param {FormData} formData - Ferry data with image
   * @returns {Promise}
   */
  async createFerry(formData) {
    try {
      const response = await api.post('/admin-panel/ferries', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating ferry:', error);
      throw error;
    }
  }

  /**
   * Memperbarui ferry
   * @param {number} id - Ferry ID
   * @param {FormData} formData - Ferry data with image
   * @returns {Promise}
   */
  async updateFerry(id, formData) {
    try {
      // Add _method field for Laravel to handle PUT request
      formData.append('_method', 'PUT');
      
      const response = await api.post(`/admin-panel/ferries/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating ferry:', error);
      throw error;
    }
  }

  /**
   * Menghapus ferry
   * @param {number} id - Ferry ID
   * @returns {Promise}
   */
  async deleteFerry(id) {
    try {
      const response = await api.delete(`/admin-panel/ferries/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting ferry:', error);
      throw error;
    }
  }

  /**
   * Format capacity display
   * @param {Object} ferry - Ferry object
   * @returns {Array}
   */
  formatCapacities(ferry) {
    return [
      { type: 'Penumpang', count: ferry.capacity_passenger, icon: 'users' },
      { type: 'Motor', count: ferry.capacity_vehicle_motorcycle, icon: 'motorcycle' },
      { type: 'Mobil', count: ferry.capacity_vehicle_car, icon: 'car' },
      { type: 'Bus', count: ferry.capacity_vehicle_bus, icon: 'bus' },
      { type: 'Truk', count: ferry.capacity_vehicle_truck, icon: 'truck' }
    ];
  }

  /**
   * Get status color
   * @param {string} status - Ferry status
   * @returns {string}
   */
  getStatusColor(status) {
    const colors = {
      'ACTIVE': 'green',
      'MAINTENANCE': 'yellow',
      'INACTIVE': 'red'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get status text
   * @param {string} status - Ferry status
   * @returns {string}
   */
  getStatusText(status) {
    const texts = {
      'ACTIVE': 'Aktif',
      'MAINTENANCE': 'Perawatan',
      'INACTIVE': 'Tidak Aktif'
    };
    return texts[status] || status;
  }

  /**
   * Validate ferry form
   * @param {Object} formData - Form data
   * @returns {Object}
   */
  validateFerryForm(formData) {
    const errors = {};

    if (!formData.name) {
      errors.name = 'Nama ferry harus diisi';
    }

    if (!formData.registration_number) {
      errors.registration_number = 'Nomor registrasi harus diisi';
    }

    if (!formData.capacity_passenger || formData.capacity_passenger < 1) {
      errors.capacity_passenger = 'Kapasitas penumpang minimal 1';
    }

    if (formData.capacity_vehicle_motorcycle < 0) {
      errors.capacity_vehicle_motorcycle = 'Kapasitas motor tidak boleh negatif';
    }

    if (formData.capacity_vehicle_car < 0) {
      errors.capacity_vehicle_car = 'Kapasitas mobil tidak boleh negatif';
    }

    if (formData.capacity_vehicle_bus < 0) {
      errors.capacity_vehicle_bus = 'Kapasitas bus tidak boleh negatif';
    }

    if (formData.capacity_vehicle_truck < 0) {
      errors.capacity_vehicle_truck = 'Kapasitas truk tidak boleh negatif';
    }

    if (!formData.status) {
      errors.status = 'Status harus dipilih';
    }

    if (formData.year_built) {
      const currentYear = new Date().getFullYear();
      if (formData.year_built < 1900 || formData.year_built > currentYear) {
        errors.year_built = `Tahun pembuatan harus antara 1900 dan ${currentYear}`;
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

    if (filters.name) {
      params.name = filters.name;
    }

    if (filters.registration_number) {
      params.registration_number = filters.registration_number;
    }

    if (filters.status) {
      params.status = filters.status;
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
   * Get image URL
   * @param {string} imagePath - Image path from database
   * @returns {string}
   */
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    
    // If it's already a full URL, return it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Otherwise, prepend the base URL
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    return `${baseUrl}/${imagePath}`;
  }
}

export default new AdminFerryService();