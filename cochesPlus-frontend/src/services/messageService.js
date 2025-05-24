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
            throw new Error(error.message || 'No se pudieron cargar las conversaciones');
        }
    },

    /**
     * Crear o obtener una conversación
     */
    createConversacion: async (cocheId) => {
        try {
            if (!cocheId || isNaN(cocheId)) {
                throw new Error('ID de coche inválido');
            }

            const response = await apiService.post('/conversaciones', {
                id_coche: cocheId
            });
            return response;
        } catch (error) {
            console.error('Error al crear conversación:', error);

            if (error.status === 400) {
                throw new Error('No puedes iniciar una conversación sobre tu propio anuncio');
            }

            throw new Error(error.message || 'No se pudo crear la conversación');
        }
    },

    /**
     * Obtener una conversación específica con sus mensajes
     */
    getConversacion: async (conversacionId) => {
        try {
            if (!conversacionId || isNaN(conversacionId)) {
                throw new Error('ID de conversación inválido');
            }

            const response = await apiService.get(`/conversaciones/${conversacionId}`);
            return response;
        } catch (error) {
            console.error('Error al obtener conversación:', error);

            if (error.status === 404) {
                throw new Error('Conversación no encontrada');
            }

            if (error.status === 403) {
                throw new Error('No tienes acceso a esta conversación');
            }

            throw new Error(error.message || 'No se pudo cargar la conversación');
        }
    },

    /**
     * Obtener mensajes de una conversación
     */
    getMensajes: async (conversacionId, page = 1) => {
        try {
            if (!conversacionId || isNaN(conversacionId)) {
                throw new Error('ID de conversación inválido');
            }

            const response = await apiService.get(`/conversaciones/${conversacionId}/mensajes?page=${page}`);
            return response;
        } catch (error) {
            console.error('Error al obtener mensajes:', error);
            throw new Error(error.message || 'No se pudieron cargar los mensajes');
        }
    },

    /**
     * Enviar un mensaje
     */
    sendMensaje: async (conversacionId, contenido) => {
        try {
            if (!conversacionId || isNaN(conversacionId)) {
                throw new Error('ID de conversación inválido');
            }

            if (!contenido || typeof contenido !== 'string' || contenido.trim().length === 0) {
                throw new Error('El mensaje no puede estar vacío');
            }

            if (contenido.trim().length > 1000) {
                throw new Error('El mensaje es demasiado largo (máximo 1000 caracteres)');
            }

            const response = await apiService.post(`/conversaciones/${conversacionId}/mensajes`, {
                contenido: contenido.trim()
            });
            return response;
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            throw new Error(error.message || 'No se pudo enviar el mensaje');
        }
    },

    /**
     * Marcar mensaje como leído
     */
    markAsRead: async (conversacionId, mensajeId) => {
        try {
            if (!conversacionId || isNaN(conversacionId) || !mensajeId || isNaN(mensajeId)) {
                throw new Error('IDs inválidos');
            }

            const response = await apiService.put(`/conversaciones/${conversacionId}/mensajes/${mensajeId}/leido`);
            return response;
        } catch (error) {
            console.error('Error al marcar mensaje como leído:', error);
            // No lanzar error aquí ya que no es crítico para la funcionalidad
            return null;
        }
    },

    /**
     * Marcar todos los mensajes como leídos
     */
    markAllAsRead: async (conversacionId) => {
        try {
            if (!conversacionId || isNaN(conversacionId)) {
                throw new Error('ID de conversación inválido');
            }

            const response = await apiService.put(`/conversaciones/${conversacionId}/mensajes/leer-todos`);
            return response;
        } catch (error) {
            console.error('Error al marcar todos los mensajes como leídos:', error);
            // No lanzar error aquí ya que no es crítico para la funcionalidad
            return null;
        }
    },

    /**
     * Eliminar conversación
     */
    deleteConversacion: async (conversacionId) => {
        try {
            if (!conversacionId || isNaN(conversacionId)) {
                throw new Error('ID de conversación inválido');
            }

            const response = await apiService.delete(`/conversaciones/${conversacionId}`);
            return response;
        } catch (error) {
            console.error('Error al eliminar conversación:', error);
            throw new Error(error.message || 'No se pudo eliminar la conversación');
        }
    }
};

export default messageService;