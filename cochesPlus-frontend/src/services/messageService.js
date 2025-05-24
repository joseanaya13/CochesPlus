import apiService from './apiService';

const messageService = {
    /**
     * Obtener todas las conversaciones del usuario
     */
    getConversaciones: async () => {
        try {
            const response = await apiService.get('/conversaciones');
            return response;
        } catch (error) {
            console.error('Error al obtener conversaciones:', error);
            throw error;
        }
    },

    /**
     * Crear o obtener una conversación
     */
    createConversacion: async (cocheId) => {
        try {
            const response = await apiService.post('/conversaciones', {
                id_coche: cocheId
            });
            return response;
        } catch (error) {
            console.error('Error al crear conversación:', error);
            throw error;
        }
    },

    /**
     * Obtener una conversación específica con sus mensajes
     */
    getConversacion: async (conversacionId) => {
        try {
            const response = await apiService.get(`/conversaciones/${conversacionId}`);
            return response;
        } catch (error) {
            console.error('Error al obtener conversación:', error);
            throw error;
        }
    },

    /**
     * Obtener mensajes de una conversación
     */
    getMensajes: async (conversacionId, page = 1) => {
        try {
            const response = await apiService.get(`/conversaciones/${conversacionId}/mensajes?page=${page}`);
            return response;
        } catch (error) {
            console.error('Error al obtener mensajes:', error);
            throw error;
        }
    },

    /**
     * Enviar un mensaje
     */
    sendMensaje: async (conversacionId, contenido) => {
        try {
            const response = await apiService.post(`/conversaciones/${conversacionId}/mensajes`, {
                contenido
            });
            return response;
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            throw error;
        }
    },

    /**
     * Marcar mensaje como leído
     */
    markAsRead: async (conversacionId, mensajeId) => {
        try {
            const response = await apiService.put(`/conversaciones/${conversacionId}/mensajes/${mensajeId}/leido`);
            return response;
        } catch (error) {
            console.error('Error al marcar mensaje como leído:', error);
            throw error;
        }
    },

    /**
     * Marcar todos los mensajes como leídos
     */
    markAllAsRead: async (conversacionId) => {
        try {
            const response = await apiService.put(`/conversaciones/${conversacionId}/mensajes/leer-todos`);
            return response;
        } catch (error) {
            console.error('Error al marcar todos los mensajes como leídos:', error);
            throw error;
        }
    },

    /**
     * Eliminar conversación
     */
    deleteConversacion: async (conversacionId) => {
        try {
            const response = await apiService.delete(`/conversaciones/${conversacionId}`);
            return response;
        } catch (error) {
            console.error('Error al eliminar conversación:', error);
            throw error;
        }
    }
};

export default messageService;