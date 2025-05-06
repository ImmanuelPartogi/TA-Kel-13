import api from './config';

// Dashboard
export const getAdminDashboardStats = () => api.get('/admin-panel/dashboard/stats');
export const getAdminDashboardSummary = () => api.get('/admin-panel/dashboard/summary');

// Routes
export const getRoutes = () => api.get('/admin-panel/routes');
export const getRouteById = (id) => api.get(`/admin-panel/routes/${id}`);
export const createRoute = (data) => api.post('/admin-panel/routes', data);
export const updateRoute = (id, data) => api.put(`/admin-panel/routes/${id}`, data);
export const deleteRoute = (id) => api.delete(`/admin-panel/routes/${id}`);

// Schedules
export const getSchedules = () => api.get('/admin-panel/schedules');
export const getScheduleById = (id) => api.get(`/admin-panel/schedules/${id}`);
export const createSchedule = (data) => api.post('/admin-panel/schedules', data);
export const updateSchedule = (id, data) => api.put(`/admin-panel/schedules/${id}`, data);
export const deleteSchedule = (id) => api.delete(`/admin-panel/schedules/${id}`);

// Tambahkan fungsi lain sesuai kebutuhan