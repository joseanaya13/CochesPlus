import apiService from './apiService';

const authService = {
    /**
     * Registrar un nuevo usuario
     */
    register: async (userData) => {
        try {
            const response = await apiService.post('/register', userData);

            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));

                if (response.roles) {
                    localStorage.setItem('roles', JSON.stringify(response.roles));
                }
            }

            return response;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    },

    /**
     * Iniciar sesión con email y password
     */
    login: async (credentials) => {
        try {
            const response = await apiService.post('/login', credentials);

            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));

                if (response.roles) {
                    localStorage.setItem('roles', JSON.stringify(response.roles));
                }
            }

            return response;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },

    /**
     * Cerrar sesión
     */
    logout: async () => {
        try {
            await apiService.post('/logout');
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('roles');
        }
    },

    /**
     * Solicitar recuperación de contraseña
     */
    forgotPassword: async (email) => {
        try {
            const response = await apiService.post('/forgot-password', { email });
            return {
                status: 'success',
                message: response.status || 'Se ha enviado un enlace de recuperación a tu correo electrónico'
            };
        } catch (error) {
            console.error('Error en recuperación de contraseña:', error);
            throw {
                message: error.message || 'No se pudo enviar el enlace de recuperación'
            };
        }
    },

    /**
     * Restablecer contraseña con token
     */
    resetPassword: async (data) => {
        try {
            const resetData = {
                token: data.token,
                email: data.email,
                password: data.password,
                password_confirmation: data.password_confirmation
            };

            const response = await apiService.post('/reset-password', resetData);
            return {
                status: 'success',
                message: response.status || 'Contraseña restablecida correctamente'
            };
        } catch (error) {
            console.error('Error en restablecimiento de contraseña:', error);
            throw {
                message: error.message || 'No se pudo restablecer la contraseña'
            };
        }
    },

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    /**
     * Obtener usuario actual del localStorage
     */
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Obtener roles del usuario
     */
    getRoles: () => {
        const rolesStr = localStorage.getItem('roles');
        return rolesStr ? JSON.parse(rolesStr) : [];
    },

    /**
     * Comprobar si el usuario tiene un rol específico
     */
    hasRole: (roleName) => {
        const roles = authService.getRoles();
        return Array.isArray(roles) && roles.includes(roleName);
    }
};

export default authService;