import axios from 'axios';

console.log("API URL:", import.meta.env.VITE_API_URL);
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Tambahkan interceptor untuk otentikasi
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token'); // Menggunakan 'token' sebagai key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani error tetap sama
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Layanan API lainnya tetap sama...

// API services for reports
export const operatorReportService = {
  // Get report index data
  getReportIndex: () => {
    return api.get('/operator-panel/reports');
  },

  // Get daily report data
  getDailyReport: (date) => {
    return api.get(`/operator-panel/reports/daily?date=${date}`);
  },

  // Export daily report as CSV
  exportDailyReport: (date) => {
    return api.get(`/operator-panel/reports/daily/export?date=${date}`, {
      responseType: 'blob'
    });
  },

  // Get monthly report data
  getMonthlyReport: (month) => {
    return api.get(`/operator-panel/reports/monthly?month=${month}`);
  },

  // Export monthly report as CSV
  exportMonthlyReport: (month) => {
    return api.get(`/operator-panel/reports/monthly/export?month=${month}`, {
      responseType: 'blob'
    });
  }
};

// API services for bookings
export const bookingService = {
  // Get all bookings
  getAllBookings: (params) => {
    return api.get('/operator-panel/bookings', { params });
  },

  // Get booking details
  getBooking: (id) => {
    return api.get(`/operator-panel/bookings/${id}`);
  },

  // Update booking status
  updateBookingStatus: (id, status) => {
    return api.put(`/operator-panel/bookings/${id}/status`, { status });
  },

  // Validate booking for check-in
  validateBooking: (bookingCode) => {
    return api.post('/operator-panel/bookings/validate', { booking_code: bookingCode });
  },

  // Process check-in
  processCheckIn: (bookingId) => {
    return api.post(`/operator-panel/bookings/${bookingId}/check-in`);
  }
};

// API services for schedules
export const operatorScheduleService = {
  // Get all schedules
  getAllSchedules: (params) => {
    return api.get('/operator-panel/schedules', { params });
  },

  // Get schedule details
  getSchedule: (id) => {
    return api.get(`/operator-panel/schedules/${id}`);
  },

  // Get schedule dates
  getScheduleDates: (id, params) => {
    return api.get(`/operator-panel/schedules/${id}/dates`, { params });
  },

  // Get upcoming dates
  getUpcomingDates: (id) => {
    return api.get(`/operator-panel/schedules/${id}/upcoming-dates`);
  },

  // Get specific schedule date
  getDate: (scheduleId, dateId) => {
    return api.get(`/operator-panel/schedules/${scheduleId}/dates/${dateId}`);
  },

  // Get all active routes (for dropdown)
  getRoutes: () => {
    return api.get('/operator-panel/routes');
  },

  // Update schedule date status
  updateDateStatus: (scheduleId, dateId, data) => {
    return api.put(`/operator-panel/schedules/${scheduleId}/dates/${dateId}/status`, data);
  },

  // Create new schedule date
  createDate: (scheduleId, data) => {
    return api.post(`/operator-panel/schedules/${scheduleId}/dates`, data);
  },

  // Update schedule date
  updateDate: (scheduleId, dateId, data) => {
    return api.put(`/operator-panel/schedules/${scheduleId}/dates/${dateId}`, data);
  },

  // Delete schedule date
  deleteDate: (scheduleId, dateId) => {
    return api.delete(`/operator-panel/schedules/${scheduleId}/dates/${dateId}`);
  },

  // Check schedule availability
  checkAvailability: (data) => {
    return api.post('/operator-panel/schedules/check-availability', data);
  }
};

export const ferryService = {
  // Get all ferries with optional filters
  getAllFerries: (params) => {
    return api.get('/admin-panel/ferries', { params });
  },

  // Get ferry details
  getFerry: (id) => {
    return api.get(`/admin-panel/ferries/${id}`);
  },

  // Create new ferry
  createFerry: (data) => {
    return api.post('/admin-panel/ferries', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Update ferry
  updateFerry: (id, data) => {
    data.append('_method', 'PUT');
    return api.post(`/admin-panel/ferries/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete ferry
  deleteFerry: (id) => {
    return api.delete(`/admin-panel/ferries/${id}`);
  }
};

export const refundService = {
  // Get all refunds with optional filters
  getAllRefunds: (params) => {
    return api.get('/admin-panel/refunds', { params });
  },

  // Get refund details
  getRefund: (id) => {
    return api.get(`/admin-panel/refunds/${id}`);
  },

  // Create new refund
  createRefund: (bookingId, data) => {
    return api.post(`/admin-panel/refunds/store/${bookingId}`, data);
  },

  // Approve refund
  approveRefund: (id) => {
    return api.post(`/admin-panel/refunds/${id}/approve`);
  },

  // Reject refund
  rejectRefund: (id, data) => {
    return api.post(`/admin-panel/refunds/${id}/reject`, data);
  },

  // Complete refund
  completeRefund: (id, data) => {
    return api.post(`/admin-panel/refunds/${id}/complete`, data);
  },

  // Get refund form data for booking
  getRefundForm: (bookingId) => {
    return api.get(`/admin-panel/refunds/create/${bookingId}`);
  }
};

export const adminReportService = {
  // Get report index data
  getReportIndex: () => {
    return api.get('/admin-panel/reports');
  },

  // Get booking report data
  getBookingReport: (params) => {
    return api.get('/admin-panel/reports/booking', { params });
  },

  // Export booking report as CSV
  exportBookingReport: (params) => {
    return api.get('/admin-panel/reports/booking/export', {
      params,
      responseType: 'blob'
    });
  },

  // Get revenue report data
  getRevenueReport: (params) => {
    return api.get('/admin-panel/reports/revenue', { params });
  },

  // Export revenue report as CSV
  exportRevenueReport: (params) => {
    return api.get('/admin-panel/reports/revenue/export', {
      params,
      responseType: 'blob'
    });
  },

  // Get schedule report data
  getScheduleReport: (params) => {
    return api.get('/admin-panel/reports/schedule', { params });
  },

  // Export schedule report as CSV
  exportScheduleReport: (params) => {
    return api.get('/admin-panel/reports/schedule/export', {
      params,
      responseType: 'blob'
    });
  }
};

export const operatorService = {
  // Get all operators with optional filters
  getAllOperators: (params) => {
    return api.get('/admin-panel/operators', { params });
  },

  // Get operator details
  getOperator: (id) => {
    return api.get(`/admin-panel/operators/${id}`);
  },

  // Create new operator
  createOperator: (data) => {
    return api.post('/admin-panel/operators', data);
  },

  // Update operator
  updateOperator: (id, data) => {
    return api.put(`/admin-panel/operators/${id}`, data);
  },

  // Delete operator
  deleteOperator: (id) => {
    return api.delete(`/admin-panel/operators/${id}`);
  },

  // Check email availability
  checkEmailAvailability: (email) => {
    return api.post('/admin-panel/operators/check-email', { email });
  },

  // Get routes for operators
  getRoutes: () => {
    return api.get('/admin-panel/routes');
  }
};

export const routeService = {
  // Mendapatkan daftar rute dengan filter opsional
  getAllRoutes: (params) => {
    return api.get('/admin-panel/routes', { params });
  },

  // Mendapatkan detail rute
  getRoute: (id) => {
    return api.get(`/admin-panel/routes/${id}`);
  },

  // Membuat rute baru
  createRoute: (data) => {
    return api.post('/admin-panel/routes', data);
  },

  // Mengupdate rute
  updateRoute: (id, data) => {
    return api.put(`/admin-panel/routes/${id}`, data);
  },

  // Menghapus rute
  deleteRoute: (id) => {
    return api.delete(`/admin-panel/routes/${id}`);
  },

  // Mengupdate status rute
  updateRouteStatus: (id, status, reason = null, expiryDate = null) => {
    return api.put(`/admin-panel/routes/${id}/status`, {
      status,
      status_reason: reason,
      status_expiry_date: expiryDate
    });
  }
};

export const adminScheduleService = {
  // Mendapatkan daftar jadwal dengan filter opsional
  getAllSchedules: (params) => {
    return api.get('/admin-panel/schedules', { params });
  },

  // Mendapatkan detail jadwal
  getSchedule: (id) => {
    return api.get(`/admin-panel/schedules/${id}`);
  },

  // Membuat jadwal baru
  createSchedule: (data) => {
    return api.post('/admin-panel/schedules', data);
  },

  // Mengupdate jadwal
  updateSchedule: (id, data) => {
    return api.put(`/admin-panel/schedules/${id}`, data);
  },

  // Menghapus jadwal
  deleteSchedule: (id) => {
    return api.delete(`/admin-panel/schedules/${id}`);
  },

  // Mendapatkan daftar rute aktif (untuk dropdown)
  getRoutes: () => {
    return api.get('/admin-panel/routes', { params: { status: 'ACTIVE' } });
  },

  // Mendapatkan daftar kapal aktif (untuk dropdown)
  getFerries: () => {
    return api.get('/admin-panel/ferries');
  },

  // Mendapatkan tanggal-tanggal jadwal
  getScheduleDates: (scheduleId, params) => {
    return api.get(`/admin-panel/schedules/${scheduleId}/dates`, { params });
  },

  // Menambah tanggal jadwal
  addScheduleDate: (scheduleId, data) => {
    return api.post(`/admin-panel/schedules/${scheduleId}/dates`, data);
  },

  // Menambah tanggal jadwal dalam rentang
  addScheduleDateRange: (scheduleId, data) => {
    return api.post(`/admin-panel/schedules/${scheduleId}/dates/add`, data);
  },

  // Mengupdate tanggal jadwal
  updateScheduleDate: (scheduleId, dateId, data) => {
    return api.put(`/admin-panel/schedules/${scheduleId}/dates/${dateId}`, data);
  },

  // Menghapus tanggal jadwal
  deleteScheduleDate: (scheduleId, dateId) => {
    return api.delete(`/admin-panel/schedules/${scheduleId}/dates/${dateId}`);
  },

  // Mendapatkan detail tanggal jadwal
  getScheduleDate: (scheduleId, dateId) => {
    return api.get(`/admin-panel/schedules/${scheduleId}/dates/${dateId}`);
  }
};

export const fetchBookings = async (params = {}) => {
  const response = await api.get('/operator-panel/bookings', { params });
  return response.data;
};

export const fetchBookingDetails = async (id) => {
  const response = await api.get(`/operator-panel/bookings/${id}`);
  return response.data;
};

export const checkIn = async (ticketCode) => {
  const response = await api.post('/operator-panel/bookings/check-in', { ticket_code: ticketCode });
  return response.data;
};

export const validateBooking = async (bookingCode) => {
  const response = await api.post('/operator-panel/bookings/validate', { booking_code: bookingCode });
  return response.data;
};

export const updateBookingStatus = async (id, status, notes) => {
  const response = await api.put(`/operator-panel/bookings/${id}/status`, { status, notes });
  return response.data;
};

export const adminBookingService = {
  // Mendapatkan daftar booking dengan filter opsional
  getAllBookings: (params) => {
    return api.get('/admin-panel/bookings', { params });
  },

  // Mendapatkan detail booking
  getBooking: (id) => {
    return api.get(`/admin-panel/bookings/${id}`);
  },

  // Membuat booking baru
  createBooking: (data) => {
    return api.post('/admin-panel/bookings', data);
  },

  // Mengupdate status booking
  updateBookingStatus: (id, data) => {
    return api.put(`/admin-panel/bookings/${id}/status`, data);
  },

  // Mencari jadwal berdasarkan rute dan tanggal
  getSchedules: (routeId, date) => {
    return api.get(`/admin-panel/bookings/get-schedules?route_id=${routeId}&date=${date}`);
  },

  // Mencari pengguna berdasarkan kata kunci
  searchUsers: (query) => {
    return api.get(`/admin-panel/bookings/search-users?query=${query}`);
  },

  // Mendapatkan form reschedule
  getRescheduleForm: (id) => {
    return api.get(`/admin-panel/bookings/${id}/reschedule`);
  },

  // Mendapatkan jadwal yang tersedia untuk reschedule
  getAvailableSchedules: (data) => {
    return api.post('/admin-panel/bookings/get-available-schedules', data);
  },

  // Proses reschedule booking
  processReschedule: (id, data) => {
    return api.post(`/admin-panel/bookings/${id}/process-reschedule`, data);
  }
};

export default api;