import apiService from './apiService';

const favoritoService = {
    /**
     * Obtiene los favoritos del usuario autenticado
     */
    getUserFavorites: async () => {
        try {
            const response = await apiService.get('/user/favoritos');
            return response;
        } catch (error) {
            console.error('Error al obtener favoritos:', error);
            throw error;
        }
    },

    /**
     * Añade un coche a favoritos
     * @param {number} cocheId - ID del coche a añadir a favoritos
     */
    addFavorite: async (cocheId) => {
        try {
            const response = await apiService.post('/user/favoritos', { id_coche: cocheId });
            return response;
        } catch (error) {
            console.error('Error al añadir favorito:', error);
            throw error;
        }
    },

    /**
     * Elimina un coche de favoritos
     * @param {number} cocheId - ID del coche a eliminar de favoritos
     */
    removeFavorite: async (cocheId) => {
        try {
            const response = await apiService.delete(`/user/favoritos/${cocheId}`);
            return response;
        } catch (error) {
            console.error('Error al eliminar favorito:', error);
            throw error;
        }
    },

    /**
     * Verifica si un coche está en favoritos
     * @param {number} cocheId - ID del coche a verificar
     */
    checkFavorite: async (cocheId) => {
        try {
            const favoritos = await favoritoService.getUserFavorites();
            return favoritos.some(favorito => favorito.id_coche === parseInt(cocheId));
        } catch (error) {
            console.error('Error al verificar favorito:', error);
            return false;
        }
    }
};

export default favoritoService;