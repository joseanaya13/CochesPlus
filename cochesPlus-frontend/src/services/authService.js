import apiService from './apiService';

const authService = {
    /**
     * Validar usuario actual con el servidor
     */
    validateCurrentUser: async () => {
        try {
            const response = await apiService.get('/validate-user');
            return response;
        } catch (error) {
            console.error('Error al validar usuario:', error);
            throw error;
        }
    },

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
     * NOTA: Solo para uso interno, la validación real debe hacerse en el servidor
     */
    getRoles: () => {
        const rolesStr = localStorage.getItem('roles');
        return rolesStr ? JSON.parse(rolesStr) : [];
    },

    /**
     * Comprobar si el usuario tiene un rol específico
     * NOTA: Solo para uso interno, la validación real debe hacerse en el servidor
     */
    hasRole: (roleName) => {
        const roles = authService.getRoles();
        return Array.isArray(roles) && roles.includes(roleName);
    }
};

export default authService;