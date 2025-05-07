// src/services/booking.js
import api from './api';

export const fetchBookings = async (params = {}) => {
  try {
    const response = await api.get('/operator-panel/bookings', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchBookingDetails = async (id) => {
  try {
    const response = await api.get(`/operator-panel/bookings/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkIn = async (ticketCode) => {
  try {
    const response = await api.post('/operator-panel/bookings/check-in', { ticket_code: ticketCode });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const validateBooking = async (bookingCode) => {
  try {
    const response = await api.post('/operator-panel/bookings/validate', { booking_code: bookingCode });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBookingStatus = async (id, status, notes) => {
  try {
    const response = await api.put(`/operator-panel/bookings/${id}/status`, { status, notes });
    return response.data;
  } catch (error) {
    throw error;
  }
};