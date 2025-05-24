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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = authService.getCurrentUser();
                if (storedUser) {
                    setUser(storedUser);
                    // Reconectar Echo después de cargar el usuario
                    setTimeout(() => {
                        reconnectEcho();
                    }, 100);
                }
            } catch (err) {
                console.error('Error al cargar usuario:', err);
                setError('Error al cargar información del usuario');
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
            setUser(response.user);

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
            setUser(response.user);

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
    };

    const logout = async () => {
        setLoading(true);
        setError(null);
        try {
            // Desconectar Echo antes del logout
            disconnectEcho();

            await authService.logout();
            setUser(null);
        } catch (err) {
            setError(err.message || 'Error al cerrar sesión');
        } finally {
            setLoading(false);
        }
    };

    const hasRole = (role) => {
        const roles = authService.getRoles();
        return Array.isArray(roles) && roles.includes(role);
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthContext;