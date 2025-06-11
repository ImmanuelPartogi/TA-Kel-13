import { api } from './api';

class AdminVehicleCategoriesService {
  /**
   * Mendapatkan daftar kategori kendaraan dengan filter
   * @param {Object} params - Filter parameters
   * @returns {Promise}
   */
  async getCategories(params = {}) {
    try {
      // Menggunakan endpoint yang benar sesuai dengan API routes di Laravel
      const response = await api.get('/admin-panel/vehicle-categories', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle categories:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan detail kategori kendaraan
   * @param {number} id - Category ID
   * @returns {Promise}
   */
  async getCategoryDetail(id) {
    try {
      const response = await api.get(`/admin-panel/vehicle-categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category detail:', error);
      throw error;
    }
  }

  /**
   * Membuat kategori kendaraan baru
   * @param {Object} data - Category data
   * @returns {Promise}
   */
  async createCategory(data) {
    try {
      const response = await api.post('/admin-panel/vehicle-categories', data);
      return response.data;
    } catch (error) {
      console.error('Error creating vehicle category:', error);
      throw error;
    }
  }

  /**
   * Memperbarui kategori kendaraan
   * @param {number} id - Category ID
   * @param {Object} data - Category data
   * @returns {Promise}
   */
  async updateCategory(id, data) {
    try {
      const response = await api.put(`/admin-panel/vehicle-categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle category:', error);
      throw error;
    }
  }

  /**
   * Menghapus kategori kendaraan
   * @param {number} id - Category ID
   * @returns {Promise}
   */
  async deleteCategory(id) {
    try {
      const response = await api.delete(`/admin-panel/vehicle-categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting vehicle category:', error);
      throw error;
    }
  }

  /**
   * Toggle status aktif/nonaktif kategori kendaraan
   * @param {number} id - Category ID
   * @returns {Promise}
   */
  async toggleCategoryStatus(id) {
    try {
      const response = await api.put(`/admin-panel/vehicle-categories/${id}/status`);
      return response.data;
    } catch (error) {
      console.error('Error toggling category status:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan kategori berdasarkan tipe kendaraan
   * @param {string} type - Vehicle type
   * @returns {Promise}
   */
  async getCategoriesByType(type) {
    try {
      const response = await api.get(`/admin-panel/vehicle-categories/by-type`, {
        params: { type }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories by type:', error);
      throw error;
    }
  }

  /**
   * Format harga ke format Rupiah
   * @param {number} price - Harga
   * @returns {string}
   */
  formatPrice(price) {
    if (!price && price !== 0) return '-';

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('IDR', 'Rp');
  }

  /**
   * Format tanggal
   * @param {string} date - Date string
   * @returns {string}
   */
  formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Format datetime
   * @param {string} date - Date string
   * @returns {string}
   */
  formatDateTime(date) {
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
   * Get vehicle type text
   * @param {string} type - Vehicle type value
   * @returns {string}
   */
  getVehicleTypeText(type) {
    const texts = {
      'MOTORCYCLE': 'Sepeda Motor',
      'CAR': 'Mobil',
      'BUS': 'Bus',
      'TRUCK': 'Truk',
      'PICKUP': 'Pickup',
      'TRONTON': 'Tronton'
    };
    return texts[type] || type || '-';
  }

  /**
   * Get status text
   * @param {boolean} isActive - Status value
   * @returns {string}
   */
  getStatusText(isActive) {
    return isActive ? 'Aktif' : 'Nonaktif';
  }

  /**
   * Validate category form
   * @param {Object} formData - Form data
   * @returns {Object}
   */
  validateCategoryForm(formData) {
    const errors = {};

    if (!formData.code) {
      errors.code = 'Kode golongan harus diisi';
    } else if (formData.code.length > 10) {
      errors.code = 'Kode golongan maksimal 10 karakter';
    }

    if (!formData.name) {
      errors.name = 'Nama golongan harus diisi';
    } else if (formData.name.length > 100) {
      errors.name = 'Nama golongan maksimal 100 karakter';
    }

    if (!formData.vehicle_type) {
      errors.vehicle_type = 'Tipe kendaraan harus dipilih';
    }

    if (!formData.base_price && formData.base_price !== 0) {
      errors.base_price = 'Harga dasar harus diisi';
    } else if (isNaN(formData.base_price) || parseFloat(formData.base_price) < 0) {
      errors.base_price = 'Harga dasar harus berupa angka positif';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Export categories data
   * @param {Array} categories - Categories array
   * @returns {Array}
   */
  exportCategoriesData(categories) {
    return categories.map(category => ({
      'ID': category.id,
      'Kode': category.code,
      'Nama': category.name,
      'Tipe Kendaraan': this.getVehicleTypeText(category.vehicle_type),
      'Harga Dasar': this.formatPrice(category.base_price),
      'Status': this.getStatusText(category.is_active),
      'Deskripsi': category.description || '-',
      'Dibuat Pada': this.formatDateTime(category.created_at),
      'Diperbarui Pada': this.formatDateTime(category.updated_at)
    }));
  }
}

export default new AdminVehicleCategoriesService();