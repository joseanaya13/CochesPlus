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

    // Gestión de anuncios - CORREGIDO PARA FILTROS
    getAds: async (params) => {
        try {
            console.log('AdminService: Obteniendo anuncios con parámetros:', params);

            let url = '/admin/ads';

            // Si params es URLSearchParams, convertir a objeto para apiService
            if (params instanceof URLSearchParams) {
                const paramsObj = {};
                for (const [key, value] of params.entries()) {
                    paramsObj[key] = value;
                }
                params = paramsObj;
            }

            console.log('AdminService: Parámetros procesados:', params);

            const response = await apiService.get(url, { params });
            console.log('AdminService: Respuesta recibida:', response);

            // Manejar diferentes estructuras de respuesta
            return response;
        } catch (error) {
            console.error('Error al obtener anuncios:', error);

            // Manejo mejorado de errores
            if (error.response) {
                const errorMessage = error.response.data?.mensaje ||
                    error.response.data?.message ||
                    `Error ${error.response.status}: ${error.response.statusText}`;
                throw new Error(errorMessage);
            } else if (error.request) {
                throw new Error('Error de conexión: No se pudo conectar al servidor');
            } else {
                throw new Error(`Error: ${error.message}`);
            }
        }
    },

    getAd: async (adId) => {
        try {
            console.log('AdminService: Obteniendo anuncio:', adId);

            const response = await apiService.get(`/admin/ads/${adId}`);
            console.log('AdminService: Detalles del anuncio:', response);

            // Manejar diferentes estructuras de respuesta
            if (response.datos) {
                return response.datos;
            } else if (response.data) {
                return response.data;
            } else {
                return response;
            }
        } catch (error) {
            console.error('Error al obtener anuncio:', error);

            if (error.response?.status === 404) {
                throw new Error('Anuncio no encontrado');
            }

            const errorMessage = error.response?.data?.mensaje ||
                error.response?.data?.message ||
                error.message ||
                'Error al obtener el anuncio';
            throw new Error(errorMessage);
        }
    },

    updateAd: async (adId, adData) => {
        try {
            console.log('AdminService: Actualizando anuncio:', { adId, adData });

            const response = await apiService.put(`/admin/ads/${adId}`, adData);
            console.log('AdminService: Anuncio actualizado:', response);

            return response.datos || response.data || response;
        } catch (error) {
            console.error('Error al actualizar anuncio:', error);

            if (error.response?.status === 404) {
                throw new Error('Anuncio no encontrado');
            }

            const errorMessage = error.response?.data?.mensaje ||
                error.response?.data?.message ||
                error.message ||
                'Error al actualizar el anuncio';
            throw new Error(errorMessage);
        }
    },

    deleteAd: async (adId) => {
        try {
            console.log('AdminService: Eliminando anuncio:', adId);

            const response = await apiService.delete(`/admin/ads/${adId}`);
            console.log('AdminService: Anuncio eliminado:', response);

            return response;
        } catch (error) {
            console.error('Error al eliminar anuncio:', error);

            if (error.response?.status === 404) {
                throw new Error('Anuncio no encontrado');
            }

            const errorMessage = error.response?.data?.mensaje ||
                error.response?.data?.message ||
                error.message ||
                'Error al eliminar el anuncio';
            throw new Error(errorMessage);
        }
    },

    toggleFeatureAd: async (adId, featured = true) => {
        try {
            console.log('AdminService: Cambiando destacado:', { adId, featured });

            const response = await apiService.post(`/admin/ads/${adId}/feature`, {
                destacado: featured
            });
            console.log('AdminService: Destacado cambiado:', response);

            return response.datos || response.data || response;
        } catch (error) {
            console.error('Error al destacar/quitar destacado del anuncio:', error);

            if (error.response?.status === 404) {
                throw new Error('Anuncio no encontrado');
            }

            const errorMessage = error.response?.data?.mensaje ||
                error.response?.data?.message ||
                error.message ||
                'Error al cambiar el destacado';
            throw new Error(errorMessage);
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
    },

    // Estadísticas y reportes adicionales
    getSystemStats: async () => {
        try {
            const response = await apiService.get('/admin/stats/system');
            return response.datos;
        } catch (error) {
            console.error('Error al obtener estadísticas del sistema:', error);
            throw error;
        }
    },

    getUserStats: async (userId) => {
        try {
            const response = await apiService.get(`/admin/stats/users/${userId}`);
            return response.datos;
        } catch (error) {
            console.error('Error al obtener estadísticas del usuario:', error);
            throw error;
        }
    },

    getAdStats: async (adId) => {
        try {
            const response = await apiService.get(`/admin/stats/ads/${adId}`);
            return response.datos;
        } catch (error) {
            console.error('Error al obtener estadísticas del anuncio:', error);
            throw error;
        }
    },

    // Moderación y configuración
    banUser: async (userId, reason = '') => {
        try {
            const response = await apiService.post(`/admin/users/${userId}/ban`, {
                razon: reason
            });
            return response.datos;
        } catch (error) {
            console.error('Error al banear usuario:', error);
            throw error;
        }
    },

    unbanUser: async (userId) => {
        try {
            const response = await apiService.post(`/admin/users/${userId}/unban`);
            return response.datos;
        } catch (error) {
            console.error('Error al desbanear usuario:', error);
            throw error;
        }
    },

    pauseAd: async (adId, reason = '') => {
        try {
            const response = await apiService.post(`/admin/ads/${adId}/pause`, {
                razon: reason
            });
            return response.datos;
        } catch (error) {
            console.error('Error al pausar anuncio:', error);
            throw error;
        }
    },

    unpauseAd: async (adId) => {
        try {
            const response = await apiService.post(`/admin/ads/${adId}/unpause`);
            return response.datos;
        } catch (error) {
            console.error('Error al reactivar anuncio:', error);
            throw error;
        }
    },

    // Logs y auditoría
    getAuditLogs: async (params = {}) => {
        try {
            const response = await apiService.get('/admin/audit-logs', { params });
            return response.datos;
        } catch (error) {
            console.error('Error al obtener logs de auditoría:', error);
            throw error;
        }
    },

    getSystemLogs: async (params = {}) => {
        try {
            const response = await apiService.get('/admin/system-logs', { params });
            return response.datos;
        } catch (error) {
            console.error('Error al obtener logs del sistema:', error);
            throw error;
        }
    },

    // Backup y mantenimiento
    createBackup: async () => {
        try {
            const response = await apiService.post('/admin/backup');
            return response.datos;
        } catch (error) {
            console.error('Error al crear backup:', error);
            throw error;
        }
    },

    getBackups: async () => {
        try {
            const response = await apiService.get('/admin/backups');
            return response.datos;
        } catch (error) {
            console.error('Error al obtener backups:', error);
            throw error;
        }
    },

    restoreBackup: async (backupId) => {
        try {
            const response = await apiService.post(`/admin/backups/${backupId}/restore`);
            return response.datos;
        } catch (error) {
            console.error('Error al restaurar backup:', error);
            throw error;
        }
    },

    // Configuración del sistema
    getSystemSettings: async () => {
        try {
            const response = await apiService.get('/admin/settings');
            return response.datos;
        } catch (error) {
            console.error('Error al obtener configuración:', error);
            throw error;
        }
    },

    updateSystemSettings: async (settings) => {
        try {
            const response = await apiService.put('/admin/settings', settings);
            return response.datos;
        } catch (error) {
            console.error('Error al actualizar configuración:', error);
            throw error;
        }
    },

    // Métodos adicionales para compatibilidad
    verifyAd: async (id) => {
        try {
            return await adminService.updateAd(id, { verificado: true });
        } catch (error) {
            throw new Error('Error al verificar el anuncio');
        }
    },

    markAsSold: async (id) => {
        try {
            return await adminService.updateAd(id, { vendido: true });
        } catch (error) {
            throw new Error('Error al marcar como vendido');
        }
    },

    // Obtener estadísticas de anuncios
    getStatistics: async () => {
        try {
            const response = await apiService.get('/admin/ads/statistics');
            return response.datos || response.data || response;
        } catch (error) {
            console.error('Error al obtener estadísticas de anuncios:', error);
            throw new Error(error.response?.data?.mensaje || error.message || 'Error al obtener estadísticas');
        }
    }
};

export default adminService;