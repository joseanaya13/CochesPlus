// cochesPlus-frontend/src/services/adminService.js
import apiService from './apiService';

const adminService = {
    // Dashboard y estadísticas
    getDashboardStats: async () => {
        try {
            const response = await apiService.get('/admin/dashboard');
            return response.datos;
        } catch (error) {
            console.error('Error al obtener estadísticas del dashboard:', error);
            throw error;
        }
    },

    // Gestión de usuarios
    getUsers: async (params = {}) => {
        try {
            const response = await apiService.get('/admin/users', { params });
            return response.datos;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    },

    getUser: async (userId) => {
        try {
            const response = await apiService.get(`/admin/users/${userId}`);
            return response.datos;
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            throw error;
        }
    },

    createUser: async (userData) => {
        try {
            const response = await apiService.post('/admin/users', userData);
            return response.datos;
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
    },

    updateUser: async (userId, userData) => {
        try {
            const response = await apiService.put(`/admin/users/${userId}`, userData);
            return response.datos;
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    },

    deleteUser: async (userId) => {
        try {
            const response = await apiService.delete(`/admin/users/${userId}`);
            return response;
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    },

    // Gestión de mensajes
    getMessages: async (params = {}) => {
        try {
            const response = await apiService.get('/admin/messages', { params });
            return response.datos;
        } catch (error) {
            console.error('Error al obtener mensajes:', error);
            throw error;
        }
    },

    getMessage: async (messageId) => {
        try {
            const response = await apiService.get(`/admin/messages/${messageId}`);
            return response.datos;
        } catch (error) {
            console.error('Error al obtener mensaje:', error);
            throw error;
        }
    },

    deleteMessage: async (messageId) => {
        try {
            const response = await apiService.delete(`/admin/messages/${messageId}`);
            return response;
        } catch (error) {
            console.error('Error al eliminar mensaje:', error);
            throw error;
        }
    },

    // Gestión de conversaciones
    getConversations: async (params = {}) => {
        try {
            const response = await apiService.get('/admin/conversations', { params });
            return response.datos;
        } catch (error) {
            console.error('Error al obtener conversaciones:', error);
            throw error;
        }
    },

    getConversationMessages: async (conversationId) => {
        try {
            const response = await apiService.get(`/admin/conversations/${conversationId}/messages`);
            return response.datos;
        } catch (error) {
            console.error('Error al obtener mensajes de conversación:', error);
            throw error;
        }
    },

    closeConversation: async (conversationId, reason = '') => {
        try {
            const response = await apiService.post(`/admin/conversations/${conversationId}/close`, {
                razon: reason
            });
            return response.datos;
        } catch (error) {
            console.error('Error al cerrar conversación:', error);
            throw error;
        }
    }
};

export default adminService;