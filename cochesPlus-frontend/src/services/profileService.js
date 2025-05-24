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
    updatePassword: async (passwordData) => {
        try {
            const response = await apiService.put('/profile/password', passwordData);
            return response;
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            throw error;
        }
    },

    /**
     * Alias para updatePassword (por compatibilidad)
     */
    changePassword: async (passwordData) => {
        return profileService.updatePassword(passwordData);
    }
};

export default profileService;