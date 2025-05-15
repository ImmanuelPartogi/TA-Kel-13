import { api } from './api';

class adminOperatorService {
    /**
     * Mendapatkan daftar operator
     * @param {Object} params - Query parameters
     * @returns {Promise}
     */
    async getOperators(params = {}) {
        try {
            const response = await api.get('/admin-panel/operators', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching operators:', error);
            throw error;
        }
    }

    /**
     * Mendapatkan detail operator
     * @param {number} id - Operator ID
     * @returns {Promise}
     */
    async getOperator(id) {
        try {
            const response = await api.get(`/admin-panel/operators/${id}`);
            // Response dari Laravel mengembalikan { operator: ..., routes: ... }
            // Kita hanya perlu data operator-nya
            return response.data.operator;
        } catch (error) {
            console.error('Error fetching operator:', error);
            throw error;
        }
    }

    /**
     * Mendapatkan detail operator dengan routes
     * @param {number} id - Operator ID
     * @returns {Promise}
     */
    async getOperatorWithRoutes(id) {
        try {
            const response = await api.get(`/admin-panel/operators/${id}`);
            // Mengembalikan response lengkap dengan operator dan routes
            return response.data;
        } catch (error) {
            console.error('Error fetching operator with routes:', error);
            throw error;
        }
    }

    /**
     * Membuat operator baru
     * @param {Object} data - Operator data
     * @returns {Promise}
     */
    async createOperator(data) {
        try {
            const response = await api.post('/admin-panel/operators', data);
            return response.data;
        } catch (error) {
            console.error('Error creating operator:', error);
            throw error;
        }
    }

    /**
     * Update operator
     * @param {number} id - Operator ID
     * @param {Object} data - Update data
     * @returns {Promise}
     */
    async updateOperator(id, data) {
        try {
            const response = await api.put(`/admin-panel/operators/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating operator:', error);
            throw error;
        }
    }

    /**
     * Hapus operator
     * @param {number} id - Operator ID
     * @returns {Promise}
     */
    async deleteOperator(id) {
        try {
            const response = await api.delete(`/admin-panel/operators/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting operator:', error);
            throw error;
        }
    }

    /**
     * Check email availability
     * @param {string} email - Email to check
     * @returns {Promise}
     */
    async checkEmailAvailability(email) {
        try {
            const response = await api.post('/admin-panel/operators/check-email', { email });
            return response.data;
        } catch (error) {
            console.error('Error checking email:', error);
            throw error;
        }
    }

    /**
     * Get all routes - menggunakan endpoint khusus operator atau fallback ke routes biasa
     * @returns {Promise}
     */
    async getRoutes() {
        try {
            // Coba gunakan endpoint khusus operator terlebih dahulu
            const response = await api.get('/admin-panel/operators/routes');
            console.log('Operator routes response:', response.data);
            return response.data;
        } catch (error) {
            console.log('Error fetching operator routes, trying admin routes endpoint:', error);

            // Fallback ke endpoint routes biasa
            try {
                const adminResponse = await api.get('/admin-panel/routes');
                console.log('Admin routes response:', adminResponse.data);

                // Handle berbagai format response yang mungkin
                if (Array.isArray(adminResponse.data)) {
                    return adminResponse.data;
                } else if (adminResponse.data && adminResponse.data.status === 'success' && Array.isArray(adminResponse.data.data)) {
                    return adminResponse.data.data;
                } else if (adminResponse.data && adminResponse.data.status === 'success' && adminResponse.data.data && Array.isArray(adminResponse.data.data.routes)) {
                    return adminResponse.data.data.routes;
                } else if (adminResponse.data && adminResponse.data.status === 'success' && adminResponse.data.data && Array.isArray(adminResponse.data.data.data)) {
                    return adminResponse.data.data.data;
                }

                console.error('Unexpected routes response format:', adminResponse.data);
                return [];
            } catch (fallbackError) {
                console.error('Error fetching routes from both endpoints:', fallbackError);
                throw fallbackError;
            }
        }
    }

    /**
     * Get active routes only
     * @returns {Promise}
     */
    async getActiveRoutes() {
        try {
            const response = await api.get('/admin-panel/routes', {
                params: { status: 'ACTIVE' }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching active routes:', error);
            throw error;
        }
    }

    // Backward compatibility methods for direct HTTP methods
    get(url, config) {
        return api.get(url, config);
    }

    post(url, data, config) {
        return api.post(url, data, config);
    }

    put(url, data, config) {
        return api.put(url, data, config);
    }

    delete(url, config) {
        return api.delete(url, config);
    }
}

export default new adminOperatorService();