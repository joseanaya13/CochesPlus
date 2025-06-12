import apiService from './apiService';

const purchaseService = {
    /**
     * Iniciar proceso de compra
     * @param {Object} purchaseData - Datos de la compra
     */
    iniciarCompra: async (purchaseData) => {
        try {
            const response = await apiService.post('/compras', purchaseData);
            return response;
        } catch (error) {
            console.error('Error al iniciar compra:', error);
            throw error;
        }
    },

    /**
     * Vendedor responde a solicitud de compra
     * @param {number} compraId - ID de la compra
     * @param {Object} respuesta - Datos de la respuesta
     */
    responderVendedor: async (compraId, respuesta) => {
        try {
            const response = await apiService.put(`/compras/${compraId}/responder-vendedor`, respuesta);
            return response;
        } catch (error) {
            console.error('Error al responder solicitud:', error);
            throw error;
        }
    },

    /**
     * Comprador confirma la compra
     * @param {number} compraId - ID de la compra
     */
    confirmarComprador: async (compraId) => {
        try {
            const response = await apiService.put(`/compras/${compraId}/confirmar-comprador`);
            return response;
        } catch (error) {
            console.error('Error al confirmar compra:', error);
            throw error;
        }
    },

    /**
     * Obtener compras del usuario (como comprador)
     */
    getMisCompras: async () => {
        try {
            const response = await apiService.get('/compras/mis-compras');
            return response;
        } catch (error) {
            console.error('Error al obtener compras:', error);
            throw error;
        }
    },

    /**
     * Obtener ventas del usuario (como vendedor)
     */
    getMisVentas: async () => {
        try {
            const response = await apiService.get('/compras/mis-ventas');
            return response;
        } catch (error) {
            console.error('Error al obtener ventas:', error);
            throw error;
        }
    },

    /**
     * Cancelar solicitud de compra
     * @param {number} compraId - ID de la compra
     */
    cancelarCompra: async (compraId) => {
        try {
            const response = await apiService.delete(`/compras/${compraId}`);
            return response;
        } catch (error) {
            console.error('Error al cancelar compra:', error);
            throw error;
        }
    },

    /**
     * Obtener estado de una compra específica
     * @param {number} compraId - ID de la compra
     */
    getEstadoCompra: async (compraId) => {
        try {
            const response = await apiService.get(`/compras/${compraId}`);
            return response;
        } catch (error) {
            console.error('Error al obtener estado de compra:', error);
            throw error;
        }
    }
};

export default purchaseService;