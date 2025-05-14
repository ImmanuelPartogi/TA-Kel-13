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

  // Validate booking for check-in
  validateBooking: (data) => {
    return api.post('/operator-panel/bookings/validate', data);
  },

  // Process check-in
  processCheckIn: (data) => {
    return api.post('/operator-panel/bookings/check-in', data);
  }
};

export default operatorBookingsService;