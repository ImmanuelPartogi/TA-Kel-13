import api from './api';

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