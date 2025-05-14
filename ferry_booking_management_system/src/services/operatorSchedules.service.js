import api from './api';

export const operatorSchedulesService = {
  // Get list of schedules
  getSchedules: (params = {}) => {
    return api.get('/operator-panel/schedules', { params });
  },

  // Get schedule detail
  getSchedule: (id) => {
    return api.get(`/operator-panel/schedules/${id}`);
  },

  // Get schedule dates
  getScheduleDates: (id, params = {}) => {
    return api.get(`/operator-panel/schedules/${id}/dates`, { params });
  },

  // Create new schedule date
  createScheduleDate: (id, data) => {
    return api.post(`/operator-panel/schedules/${id}/dates`, data);
  },

  // Update schedule date
  updateScheduleDate: (scheduleId, dateId, data) => {
    return api.put(`/operator-panel/schedules/${scheduleId}/dates/${dateId}`, data);
  },

  // Update schedule date status
  updateScheduleDateStatus: (scheduleId, dateId, data) => {
    return api.put(`/operator-panel/schedules/${scheduleId}/dates/${dateId}/status`, data);
  },

  // Delete schedule date
  deleteScheduleDate: (scheduleId, dateId) => {
    return api.delete(`/operator-panel/schedules/${scheduleId}/dates/${dateId}`);
  },

  // Check schedule availability
  checkAvailability: (data) => {
    return api.post('/operator-panel/schedules/check-availability', data);
  }
};

export default operatorSchedulesService;