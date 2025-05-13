import axios from 'axios';

export const operatorDashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await axios.get('/operator-panel/dashboard/stats');
    return response.data;
  },

  // Get dashboard summary (jadwal hari ini, aktivitas terkini, dll)
  getSummary: async () => {
    const response = await axios.get('/operator-panel/dashboard/summary');
    return response.data;
  }
};


export default operatorDashboardService;