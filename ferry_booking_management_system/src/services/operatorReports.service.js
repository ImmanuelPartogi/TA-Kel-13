// src/services/reports.service.js
import axios from 'axios';

export const operatorReportService = {
  // Daily Report
  getDaily: (params) => axios.get('/operator-panel/reports/daily', { params }),
  exportDaily: (params) => axios.get('/operator-panel/reports/daily/export', { 
    params,
    responseType: 'blob'
  }),
  
  // Monthly Report
  getMonthly: (params) => axios.get('/operator-panel/reports/monthly', { params }),
  exportMonthly: (params) => axios.get('/operator-panel/reports/monthly/export', { 
    params,
    responseType: 'blob'
  }),
  
  // General reports
  getIndex: () => axios.get('/operator-panel/reports'),
};

export default operatorReportService;