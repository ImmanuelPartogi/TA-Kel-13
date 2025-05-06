import api from './config';

// Dashboard
export const getOperatorDashboardStats = () => api.get('/operator-panel/dashboard/stats');
export const getOperatorDashboardSummary = () => api.get('/operator-panel/dashboard/summary');

// Schedules
export const getOperatorSchedules = () => api.get('/operator-panel/schedules');
export const getOperatorScheduleById = (id) => api.get(`/operator-panel/schedules/${id}`);
export const getOperatorScheduleDates = (id) => api.get(`/operator-panel/schedules/${id}/dates`);

// Bookings
export const getOperatorBookings = () => api.get('/operator-panel/bookings');
export const getOperatorBookingById = (id) => api.get(`/operator-panel/bookings/${id}`);
export const checkInBooking = (id) => api.post(`/operator-panel/bookings/${id}/check-in`);

// Tambahkan fungsi lain sesuai kebutuhan