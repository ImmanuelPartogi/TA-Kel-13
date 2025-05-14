import { api } from './api';

class adminUserService {
  /**
   * Mendapatkan daftar user dengan filter
   * @param {Object} params - Filter parameters
   * @returns {Promise}
   */
  async getUsers(params = {}) {
    try {
      const response = await api.get('/admin-panel/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan detail user
   * @param {number} id - User ID
   * @returns {Promise}
   */
  async getUserDetail(id) {
    try {
      const response = await api.get(`/admin-panel/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user detail:', error);
      throw error;
    }
  }

  /**
   * Memperbarui user
   * @param {number} id - User ID
   * @param {Object} data - User data
   * @returns {Promise}
   */
  async updateUser(id, data) {
    try {
      const response = await api.put(`/admin-panel/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Menghapus user
   * @param {number} id - User ID
   * @returns {Promise}
   */
  async deleteUser(id) {
    try {
      const response = await api.delete(`/admin-panel/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
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
   * Format phone number
   * @param {string} phone - Phone number
   * @returns {string}
   */
  formatPhone(phone) {
    if (!phone) return '-';
    
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as Indonesian phone number
    if (cleaned.startsWith('62')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`;
    } else if (cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    }
    
    return phone;
  }

  /**
   * Get gender text
   * @param {string} gender - Gender value
   * @returns {string}
   */
  getGenderText(gender) {
    const texts = {
      'MALE': 'Laki-laki',
      'FEMALE': 'Perempuan'
    };
    return texts[gender] || '-';
  }

  /**
   * Get ID type text
   * @param {string} idType - ID type value
   * @returns {string}
   */
  getIdTypeText(idType) {
    const texts = {
      'KTP': 'KTP',
      'SIM': 'SIM',
      'PASPOR': 'Paspor'
    };
    return texts[idType] || '-';
  }

  /**
   * Calculate age from birthday
   * @param {string} birthday - Birthday date string
   * @returns {number|null}
   */
  calculateAge(birthday) {
    if (!birthday) return null;
    
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Get user badge
   * @param {Object} stats - User stats
   * @returns {Object}
   */
  getUserBadge(stats) {
    const totalBookings = stats.total_bookings || 0;
    
    if (totalBookings >= 50) {
      return { label: 'Platinum', color: 'purple' };
    } else if (totalBookings >= 20) {
      return { label: 'Gold', color: 'yellow' };
    } else if (totalBookings >= 10) {
      return { label: 'Silver', color: 'gray' };
    } else if (totalBookings >= 5) {
      return { label: 'Bronze', color: 'orange' };
    } else {
      return { label: 'Baru', color: 'green' };
    }
  }

  /**
   * Format user stats
   * @param {Object} user - User object
   * @returns {Object}
   */
  formatUserStats(user) {
    return {
      totalBookings: user.total_bookings || 0,
      activeBookings: user.bookings?.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status)).length || 0,
      completedBookings: user.bookings?.filter(b => b.status === 'COMPLETED').length || 0,
      totalSpent: user.bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
      registeredDays: this.getDaysSinceRegistration(user.created_at),
      lastLogin: this.formatDateTime(user.last_login_at),
      lastDeparture: this.formatDate(user.last_departure_date)
    };
  }

  /**
   * Get days since registration
   * @param {string} createdAt - Registration date
   * @returns {number}
   */
  getDaysSinceRegistration(createdAt) {
    if (!createdAt) return 0;
    
    const registrationDate = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - registrationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Validate user form
   * @param {Object} formData - Form data
   * @returns {Object}
   */
  validateUserForm(formData) {
    const errors = {};

    if (!formData.name) {
      errors.name = 'Nama harus diisi';
    }

    if (!formData.email) {
      errors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (!formData.phone) {
      errors.phone = 'Nomor telepon harus diisi';
    }

    if (formData.id_number && !formData.id_type) {
      errors.id_type = 'Tipe identitas harus dipilih jika nomor identitas diisi';
    }

    if (formData.id_type && !formData.id_number) {
      errors.id_number = 'Nomor identitas harus diisi jika tipe identitas dipilih';
    }

    if (formData.password && formData.password.length < 8) {
      errors.password = 'Password minimal 8 karakter';
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Konfirmasi password tidak cocok';
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

    if (filters.email) {
      params.email = filters.email;
    }

    if (filters.phone) {
      params.phone = filters.phone;
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
   * Export user data
   * @param {Array} users - Users array
   * @returns {Array}
   */
  exportUserData(users) {
    return users.map(user => ({
      'ID': user.id,
      'Nama': user.name,
      'Email': user.email,
      'Telepon': this.formatPhone(user.phone),
      'Alamat': user.address || '-',
      'Jenis Kelamin': this.getGenderText(user.gender),
      'Tanggal Lahir': this.formatDate(user.date_of_birthday),
      'Umur': this.calculateAge(user.date_of_birthday) || '-',
      'Total Booking': user.total_bookings || 0,
      'Tanggal Daftar': this.formatDate(user.created_at),
      'Login Terakhir': this.formatDateTime(user.last_login_at)
    }));
  }
}

export default new adminUserService();