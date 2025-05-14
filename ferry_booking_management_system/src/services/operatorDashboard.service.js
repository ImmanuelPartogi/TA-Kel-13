import api from './api';

export const operatorDashboardService = {
  // Get dashboard statistics
  getStats: () => {
    return api.get('/operator-panel/dashboard/stats');
  },

  // Get dashboard summary (jadwal hari ini, aktivitas terkini, dll)
  getSummary: () => {
    return api.get('/operator-panel/dashboard/summary');
  }
};

export default operatorDashboardService;