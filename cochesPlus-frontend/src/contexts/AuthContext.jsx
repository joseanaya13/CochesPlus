import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import authService from '../services/authService';
import { reconnectEcho, disconnectEcho } from '../services/echoService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);    // Estado para controlar si ya se ha validado al usuario
    const [hasValidated, setHasValidated] = useState(false);

    // Función para validar usuario actual con el servidor
    const validateCurrentUser = async () => {
        // Evitar validaciones repetidas innecesarias
        if (hasValidated && user) {
            console.log('Usuario ya validado previamente, omitiendo validación');
            return { user, roles };
        }

        try {
            console.log('Validando usuario con el servidor...');
            const response = await authService.validateCurrentUser();
            setUser(response.user);
            setRoles(response.roles || []);
            setHasValidated(true);

            // Actualizar localStorage con datos del servidor
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('roles', JSON.stringify(response.roles || []));

            return response;
        } catch (err) {
            console.error('Error al validar usuario:', err);
            // Si hay error, limpiar datos locales
            logout();
            throw err;
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = authService.getCurrentUser();
                const token = localStorage.getItem('token');

                if (storedUser && token) {
                    // IMPORTANTE: Validar con el servidor en lugar de confiar en localStorage
                    await validateCurrentUser();

                    // Reconectar Echo después de validar
                    setTimeout(() => {
                        reconnectEcho();
                    }, 100);
                } else {
                    setUser(null);
                    setRoles([]);
                }
            } catch (err) {
                console.error('Error al cargar usuario:', err);
                setError('Error al cargar información del usuario');
                setUser(null);
                setRoles([]);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.register(userData);

            // Validar con el servidor después del registro
            await validateCurrentUser();

            // Conectar Echo después del registro
            setTimeout(() => {
                reconnectEcho();
            }, 100);

            return response;
        } catch (err) {
            setError(err.message || 'Error al registrar usuario');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.login(credentials);

            // Validar con el servidor después del login
            await validateCurrentUser();

            // Conectar Echo después del login
            setTimeout(() => {
                reconnectEcho();
            }, 100);

            return response;
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
            throw err;
        } finally {
            setLoading(false);
        }
    }; const logout = async () => {
        setLoading(true);
        setError(null);
        try {
            // Desconectar Echo antes del logout
            disconnectEcho();

            await authService.logout();
            setUser(null);
            setRoles([]);
            setHasValidated(false); // Resetear el estado de validación
        } catch (err) {
            setError(err.message || 'Error al cerrar sesión');
        } finally {
            setLoading(false);
        }
    };

    const hasRole = (role) => {
        // Usar los roles del estado (validados por el servidor) en lugar de localStorage
        return Array.isArray(roles) && roles.includes(role);
    };

    const value = {
        user,
        roles,
        loading,
        error,
        register,
        login,
        logout,
        validateCurrentUser,
        isAuthenticated: !!user,
        hasRole
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthContext;
