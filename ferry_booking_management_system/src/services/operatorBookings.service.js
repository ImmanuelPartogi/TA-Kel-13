// src/services/bookings.service.js
import axios from 'axios';

export const operatorBookingsService = {
  // Operator Bookings API
  getAll: (params) => axios.get('/operator-panel/bookings', { params }),
  getById: (id) => axios.get(`/operator-panel/bookings/${id}`),
  updateStatus: (id, status) => axios.put(`/operator-panel/bookings/${id}/status`, { status }),
  
  // Check-in methods
  checkIn: {
    form: () => axios.get('/operator-panel/bookings/check-in'),
    validate: (data) => axios.post('/operator-panel/bookings/validate', data),
    process: (data) => axios.post('/operator-panel/bookings/check-in', data),
    byTicket: (id, data) => axios.post(`/operator-panel/bookings/${id}/check-in`, data),
  },
  
  // Additional methods for operator panel
  getDashboardStats: () => axios.get('/operator-panel/dashboard/stats'),
  getDashboardSummary: () => axios.get('/operator-panel/dashboard/summary'),
};

export default operatorBookingsService;