import { api } from './api';

class adminScheduleService {
  get(endpoint, config) {
    return api.get(endpoint, config);
  }

  post(endpoint, data, config) {
    return api.post(endpoint, data, config);
  }

  put(endpoint, data, config) {
    return api.put(endpoint, data, config);
  }

  delete(endpoint, config) {
    return api.delete(endpoint, config);
  }

  /**
   * Mendapatkan daftar schedule dengan filter
   * @param {Object} params - Filter parameters
   * @returns {Promise}
   */
  async getSchedules(params = {}) {
    try {
      const response = await api.get('/admin-panel/schedules', { params });
      return response;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan detail schedule
   * @param {number} id - Schedule ID
   * @returns {Promise}
   */
  async getScheduleDetail(id) {
    try {
      const response = await api.get(`/admin-panel/schedules/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching schedule detail:', error);
      throw error;
    }
  }

  /**
   * Membuat schedule baru
   * @param {Object} data - Schedule data
   * @returns {Promise}
   */
  async createSchedule(data) {
    try {
      const response = await api.post('/admin-panel/schedules', data);
      return response;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  /**
   * Memperbarui schedule
   * @param {number} id - Schedule ID
   * @param {Object} data - Schedule data
   * @returns {Promise}
   */
  async updateSchedule(id, data) {
    try {
      const response = await api.put(`/admin-panel/schedules/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  /**
   * Menghapus schedule
   * @param {number} id - Schedule ID
   * @returns {Promise}
   */
  async deleteSchedule(id) {
    try {
      const response = await api.delete(`/admin-panel/schedules/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan tanggal-tanggal schedule
   * @param {number} id - Schedule ID
   * @param {Object} params - Filter parameters
   * @returns {Promise}
   */
  async getScheduleDates(id, params = {}) {
    try {
      const response = await api.get(`/admin-panel/schedules/${id}/dates`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching schedule dates:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan detail tanggal schedule
   * @param {number} scheduleId - Schedule ID
   * @param {number} dateId - Date ID
   * @returns {Promise}
   */
  async getScheduleDateDetail(scheduleId, dateId) {
    try {
      const response = await api.get(`/admin-panel/schedules/${scheduleId}/dates/${dateId}`);
      return response;
    } catch (error) {
      console.error('Error fetching schedule date detail:', error);
      throw error;
    }
  }

  /**
   * Membuat tanggal schedule
   * @param {number} id - Schedule ID
   * @param {Object} data - Date data
   * @returns {Promise}
   */
  async createScheduleDate(id, data) {
    try {
      const response = await api.post(`/admin-panel/schedules/${id}/dates`, data);
      return response;
    } catch (error) {
      console.error('Error creating schedule date:', error);
      throw error;
    }
  }

  /**
   * Menambahkan multiple tanggal schedule
   * @param {number} id - Schedule ID
   * @param {Object} data - Dates data
   * @returns {Promise}
   */
  async addScheduleDates(id, data) {
    try {
      const response = await api.post(`/admin-panel/schedules/${id}/dates/add`, data);
      return response;
    } catch (error) {
      console.error('Error adding schedule dates:', error);
      throw error;
    }
  }

  /**
   * Memperbarui tanggal schedule
   * @param {number} scheduleId - Schedule ID
   * @param {number} dateId - Date ID
   * @param {Object} data - Date data
   * @returns {Promise}
   */
  async updateScheduleDate(scheduleId, dateId, data) {
    try {
      const response = await api.put(`/admin-panel/schedules/${scheduleId}/dates/${dateId}`, data);
      return response;
    } catch (error) {
      console.error('Error updating schedule date:', error);
      throw error;
    }
  }

  /**
   * Menghapus tanggal schedule
   * @param {number} scheduleId - Schedule ID
   * @param {number} dateId - Date ID
   * @returns {Promise}
   */
  async deleteScheduleDate(scheduleId, dateId) {
    try {
      const response = await api.delete(`/admin-panel/schedules/${scheduleId}/dates/${dateId}`);
      return response;
    } catch (error) {
      console.error('Error deleting schedule date:', error);
      throw error;
    }
  }

  /**
   * Format time
   * @param {string} time - Time string
   * @returns {string}
   */
  formatTime(time) {
    return time ? time.substring(0, 5) : '-';
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
   * Format days
   * @param {string} days - Days string (1,2,3)
   * @returns {string}
   */
  formatDays(days) {
    if (!days) return '-';
    
    const dayNames = {
      '1': 'Senin',
      '2': 'Selasa',
      '3': 'Rabu',
      '4': 'Kamis',
      '5': 'Jumat',
      '6': 'Sabtu',
      '7': 'Minggu'
    };
    
    const dayArray = days.split(',');
    return dayArray.map(day => dayNames[day] || day).join(', ');
  }

  /**
   * Format days array
   * @param {Array} days - Days array
   * @returns {string}
   */
  formatDaysArray(days) {
    const dayNames = {
      1: 'Senin',
      2: 'Selasa',
      3: 'Rabu',
      4: 'Kamis',
      5: 'Jumat',
      6: 'Sabtu',
      7: 'Minggu'
    };
    
    return days.map(day => dayNames[day] || day).join(', ');
  }

  /**
   * Get status color
   * @param {string} status - Schedule status
   * @returns {string}
   */
  getStatusColor(status) {
    const colors = {
      'ACTIVE': 'green',
      'INACTIVE': 'red',
      'AVAILABLE': 'green',
      'FULL': 'red',
      'CANCELLED': 'gray',
      'DEPARTED': 'blue',
      'WEATHER_ISSUE': 'yellow'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get status text
   * @param {string} status - Schedule status
   * @returns {string}
   */
  getStatusText(status) {
    const texts = {
      'ACTIVE': 'Aktif',
      'INACTIVE': 'Tidak Aktif',
      'AVAILABLE': 'Tersedia',
      'FULL': 'Penuh',
      'CANCELLED': 'Dibatalkan',
      'DEPARTED': 'Berangkat',
      'WEATHER_ISSUE': 'Masalah Cuaca'
    };
    return texts[status] || status;
  }

  /**
   * Validate schedule form
   * @param {Object} formData - Form data
   * @returns {Object}
   */
  validateScheduleForm(formData) {
    const errors = {};

    if (!formData.route_id) {
      errors.route_id = 'Rute harus dipilih';
    }

    if (!formData.ferry_id) {
      errors.ferry_id = 'Kapal harus dipilih';
    }

    if (!formData.departure_time) {
      errors.departure_time = 'Waktu keberangkatan harus diisi';
    }

    if (!formData.arrival_time) {
      errors.arrival_time = 'Waktu tiba harus diisi';
    }

    if (formData.departure_time && formData.arrival_time) {
      if (formData.arrival_time <= formData.departure_time) {
        errors.arrival_time = 'Waktu tiba harus setelah waktu keberangkatan';
      }
    }

    if (!formData.days || formData.days.length === 0) {
      errors.days = 'Minimal pilih satu hari operasi';
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
   * Validate schedule date form
   * @param {Object} formData - Form data
   * @returns {Object}
   */
  validateScheduleDateForm(formData) {
    const errors = {};

    if (!formData.date_type) {
      errors.date_type = 'Tipe tanggal harus dipilih';
    }

    if (!formData.date) {
      errors.date = 'Tanggal harus diisi';
    }

    if (formData.date_type === 'range' && !formData.end_date) {
      errors.end_date = 'Tanggal akhir harus diisi';
    }

    if (formData.date && formData.end_date) {
      const startDate = new Date(formData.date);
      const endDate = new Date(formData.end_date);
      
      if (endDate < startDate) {
        errors.end_date = 'Tanggal akhir harus setelah tanggal mulai';
      }
    }

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

    if (filters.route_id) {
      params.route_id = filters.route_id;
    }

    if (filters.ferry_id) {
      params.ferry_id = filters.ferry_id;
    }

    if (filters.status) {
      params.status = filters.status;
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

  /**
   * Calculate occupancy rate
   * @param {Object} scheduleDate - Schedule date object
   * @returns {Object}
   */
  calculateOccupancy(scheduleDate) {
    const ferry = scheduleDate.schedule?.ferry;
    if (!ferry) return null;

    const passengerOccupancy = ferry.capacity_passenger > 0   
      ? (scheduleDate.passenger_count / ferry.capacity_passenger * 100).toFixed(1)
      : 0;

    const motorcycleOccupancy = ferry.capacity_vehicle_motorcycle > 0
      ? (scheduleDate.motorcycle_count / ferry.capacity_vehicle_motorcycle * 100).toFixed(1)
      : 0;

    const carOccupancy = ferry.capacity_vehicle_car > 0
      ? (scheduleDate.car_count / ferry.capacity_vehicle_car * 100).toFixed(1)
      : 0;

    const busOccupancy = ferry.capacity_vehicle_bus > 0
      ? (scheduleDate.bus_count / ferry.capacity_vehicle_bus * 100).toFixed(1)
      : 0;

    const truckOccupancy = ferry.capacity_vehicle_truck > 0
      ? (scheduleDate.truck_count / ferry.capacity_vehicle_truck * 100).toFixed(1)
      : 0;

    return {
      passenger: passengerOccupancy,
      motorcycle: motorcycleOccupancy,
      car: carOccupancy,
      bus: busOccupancy,
      truck: truckOccupancy
    };
  }
}

export default new adminScheduleService();