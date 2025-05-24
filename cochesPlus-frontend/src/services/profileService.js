import apiService from './apiService';

const profileService = {
    /**
     * Obtiene los datos del perfil del usuario
     */
    getProfile: async () => {
        try {
            const response = await apiService.get('/profile');
            return response;
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            throw error;
        }
    },

    /**
     * Actualiza la información del perfil del usuario
     * @param {Object} profileData - Datos del perfil a actualizar
     */
    updateProfile: async (profileData) => {
        try {
            const response = await apiService.put('/profile', profileData);
            return response;
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            throw error;
        }
    },

    /**
     * Cambia la contraseña del usuario
     * @param {Object} passwordData - Datos para cambiar la contraseña
     */
    changePassword: async (passwordData) => {
        try {
            const response = await apiService.post('/profile/password', passwordData);
            return response;
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            throw error;
        }
    }
};

export default profileService;