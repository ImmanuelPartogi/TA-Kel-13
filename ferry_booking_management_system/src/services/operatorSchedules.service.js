import axios from 'axios';

export const operatorSchedulesService = {
  // Get list of schedules
  getSchedules: (params = {}) => {
    return axios.get('/operator-panel/schedules', { params });
  },

  // Get schedule detail
  getSchedule: (id) => {
    return axios.get(`/operator-panel/schedules/${id}`);
  },

  // Get schedule dates
  getScheduleDates: (id, params = {}) => {
    return axios.get(`/operator-panel/schedules/${id}/dates`, { params });
  },

  // Create new schedule date
  createScheduleDate: (id, data) => {
    return axios.post(`/operator-panel/schedules/${id}/dates`, data);
  },

  // Update schedule date
  updateScheduleDate: (scheduleId, dateId, data) => {
    return axios.put(`/operator-panel/schedules/${scheduleId}/dates/${dateId}`, data);
  },

  // Update schedule date status
  updateScheduleDateStatus: (scheduleId, dateId, data) => {
    return axios.put(`/operator-panel/schedules/${scheduleId}/dates/${dateId}/status`, data);
  },

  // Delete schedule date
  deleteScheduleDate: (scheduleId, dateId) => {
    return axios.delete(`/operator-panel/schedules/${scheduleId}/dates/${dateId}`);
  },

  // Check schedule availability
  checkAvailability: (data) => {
    return axios.post('/operator-panel/schedules/check-availability', data);
  }
};

export default operatorSchedulesService;