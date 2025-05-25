import apiService from './apiService';

const valoracionService = {
    /**
     * Obtener valoraciones de un vendedor específico
     * @param {number} vendedorId - ID del vendedor
     */
    getValoracionesVendedor: async (vendedorId) => {
        try {
            const response = await apiService.get(`/vendedores/${vendedorId}/valoraciones`);
            return response;
        } catch (error) {
            console.error('Error al obtener valoraciones del vendedor:', error);
            throw error;
        }
    },

    /**
     * Crear una nueva valoración
     * @param {Object} valoracionData - Datos de la valoración
     */
    crearValoracion: async (valoracionData) => {
        try {
            const response = await apiService.post('/valoraciones', valoracionData);
            return response;
        } catch (error) {
            console.error('Error al crear valoración:', error);
            throw error;
        }
    },

    /**
     * Actualizar una valoración existente
     * @param {number} valoracionId - ID de la valoración
     * @param {Object} valoracionData - Datos actualizados
     */
    actualizarValoracion: async (valoracionId, valoracionData) => {
        try {
            const response = await apiService.put(`/valoraciones/${valoracionId}`, valoracionData);
            return response;
        } catch (error) {
            console.error('Error al actualizar valoración:', error);
            throw error;
        }
    },

    /**
     * Eliminar una valoración
     * @param {number} valoracionId - ID de la valoración
     */
    eliminarValoracion: async (valoracionId) => {
        try {
            const response = await apiService.delete(`/valoraciones/${valoracionId}`);
            return response;
        } catch (error) {
            console.error('Error al eliminar valoración:', error);
            throw error;
        }
    },

    /**
     * Obtener compras sin valorar del usuario autenticado
     */
    getComprasSinValorar: async () => {
        try {
            const response = await apiService.get('/user/compras-sin-valorar');
            return response;
        } catch (error) {
            console.error('Error al obtener compras sin valorar:', error);
            throw error;
        }
    },

    /**
     * Obtener valoraciones realizadas por el usuario autenticado
     */
    getValoracionesRealizadas: async () => {
        try {
            const response = await apiService.get('/user/valoraciones-realizadas');
            return response;
        } catch (error) {
            console.error('Error al obtener valoraciones realizadas:', error);
            throw error;
        }
    },

    /**
     * Obtener estadísticas del usuario autenticado como vendedor
     */
    getEstadisticasVendedor: async () => {
        try {
            const response = await apiService.get('/user/estadisticas-vendedor');
            return response;
        } catch (error) {
            console.error('Error al obtener estadísticas de vendedor:', error);
            throw error;
        }
    }
};

export default valoracionService;