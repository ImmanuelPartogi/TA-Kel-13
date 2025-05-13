import axios from 'axios';

export const operatorRoutesService = {
  // Mobile API Routes
  mobile: {
    // Get all routes for mobile
    getRoutes: (params = {}) => {
      return axios.get('/routes', { params });
    },

    // Get route detail for mobile
    getRoute: (id) => {
      return axios.get(`/routes/${id}`);
    }
  },

  // Admin Panel Routes
  admin: {
    // Get all routes
    getRoutes: (params = {}) => {
      return axios.get('/admin-panel/routes', { params });
    },

    // Get route detail
    getRoute: (id) => {
      return axios.get(`/admin-panel/routes/${id}`);
    },

    // Create new route
    createRoute: (data) => {
      return axios.post('/admin-panel/routes', data);
    },

    // Update route
    updateRoute: (id, data) => {
      return axios.put(`/admin-panel/routes/${id}`, data);
    },

    // Delete route
    deleteRoute: (id) => {
      return axios.delete(`/admin-panel/routes/${id}`);
    },

    // Update route status
    updateRouteStatus: (id, status) => {
      return axios.put(`/admin-panel/routes/${id}/status`, { status });
    }
  }
};

export default operatorRoutesService;