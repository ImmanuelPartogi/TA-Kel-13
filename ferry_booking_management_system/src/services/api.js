// src/services/api.js
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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Tambahkan interceptor untuk menangani error
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Jika response adalah 401 (Unauthorized), logout user
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API services for reports
export const reportService = {
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
// API services for schedules
export const scheduleService = {
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


export default api;