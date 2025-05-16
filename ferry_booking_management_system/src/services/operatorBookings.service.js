// src/services/operatorBookings.service.js
import api from './api.js';

export const operatorBookingsService = {
  // Get all bookings with filtering
  getAll: (params = {}) => {
    return api.get('/operator-panel/bookings', { params });
  },

  // Get single booking by ID
  getById: (id) => {
    return api.get(`/operator-panel/bookings/${id}`);
  },

  // Update booking status
  updateStatus: (id, data) => {
    return api.put(`/operator-panel/bookings/${id}/status`, data);
  },

  // Check-in related services
  checkIn: {
    // Validate ticket/booking code
    validate: (data) => {
      return api.post('/operator-panel/bookings/check-in/validate', data);
    },

    // Process check-in
    process: (data) => {
      return api.post('/operator-panel/bookings/check-in/process', data);
    }
  }
};

export default operatorBookingsService;