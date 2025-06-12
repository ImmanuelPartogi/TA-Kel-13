// src/services/welcome.service.js
import axios from 'axios';

// Buat instance axios terpisah untuk welcome service
// Ini tidak akan terpengaruh oleh interceptor di api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const welcomeAxios = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    // Tidak perlu withCredentials untuk endpoint publik
    withCredentials: false
});

export const welcomeService = {
    // Get list of routes
    getRoutes: () => {
        return welcomeAxios.get('/public/routes');
    },

    // Get route detail by ID
    getRouteById: (id) => {
        return welcomeAxios.get(`/routes/${id}`);
    },

    // Search schedules
    searchSchedules: (params) => {
        return welcomeAxios.get('/search', { params });
    }
};

export default welcomeService;