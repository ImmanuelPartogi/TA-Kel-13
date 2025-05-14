import api from './api';

export const operatorRoutesService = {
  // Get all routes (using admin endpoint since operator doesn't have specific route endpoint)
  getRoutes: (params = {}) => {
    return api.get('/admin-panel/routes', { params });
  },

  // Get route detail
  getRoute: (id) => {
    return api.get(`/admin-panel/routes/${id}`);
  },

  // Get schedules for a specific route
  getRouteSchedules: (routeId, params = {}) => {
    return api.get(`/operator-panel/routes/${routeId}/schedules`, { params });
  }
};

export default operatorRoutesService;