// src/services/operatorReports.service.js
import api from './api';

export const operatorReportsService = {
  // Get daily report
  getDaily: (params = {}) => {
    return api.get('/operator-panel/reports/daily', { params });
  },

  // Get monthly report  
  getMonthly: (params = {}) => {
    return api.get('/operator-panel/reports/monthly', { params });
  },

  // Export daily report
  exportDaily: (params = {}) => {
    return api.get('/operator-panel/reports/daily/export', { 
      params,
      responseType: 'blob' 
    });
  },

  // Export monthly report
  exportMonthly: (params = {}) => {
    return api.get('/operator-panel/reports/monthly/export', { 
      params,
      responseType: 'blob' 
    });
  }
};

export default operatorReportsService;