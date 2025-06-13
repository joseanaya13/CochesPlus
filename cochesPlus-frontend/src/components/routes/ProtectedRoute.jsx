// cochesPlus-frontend/src/components/ProtectedRoute.jsx

import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const ProtectedRoute = ({
    children,
    requiredRole = null,
    loadingComponent = null,
    redirectTo = '/login',
    unauthorizedRedirect = '/'
}) => {
    const { isAuthenticated, hasRole, loading, user } = useAuth();
    const [validating, setValidating] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [error, setError] = useState(null); useEffect(() => {
        const checkAuth = async () => {
            console.log('ProtectedRoute: Iniciando verificación de autenticación');

            if (!isAuthenticated) {
                console.log('ProtectedRoute: Usuario no autenticado');
                setValidating(false);
                setAuthorized(false);
                return;
            }

            try {
                console.log('ProtectedRoute: Verificando autorización...');

                // Verificar roles si es necesario
                if (requiredRole) {
                    let authorized = false;

                    if (Array.isArray(requiredRole)) {
                        // Si requiredRole es un array, verificar si tiene alguno de los roles
                        authorized = requiredRole.some(role => hasRole(role));
                        console.log('ProtectedRoute: Verificando múltiples roles:', {
                            requiredRoles: requiredRole,
                            userRoles: user?.roles || [],
                            authorized
                        });
                    } else {
                        // Si es un solo rol
                        authorized = hasRole(requiredRole);
                        console.log('ProtectedRoute: Verificando rol único:', {
                            requiredRole,
                            userRoles: user?.roles || [],
                            authorized
                        });
                    }

                    setAuthorized(authorized);

                    if (!authorized) {
                        console.warn('ProtectedRoute: Usuario no autorizado para esta ruta', {
                            requiredRole,
                            userRoles: user?.roles || []
                        });
                    }
                } else {
                    // Si no se requiere rol específico, solo necesita estar autenticado
                    setAuthorized(true);
                    console.log('ProtectedRoute: Acceso autorizado (solo requiere autenticación)');
                }
            } catch (error) {
                console.error('ProtectedRoute: Error al validar autorización:', error);
                setError(error.message || 'Error de autorización');
                setAuthorized(false);
            } finally {
                setValidating(false);
            }
        };

        checkAuth();
    }, [isAuthenticated, hasRole, requiredRole, user]);

    // Mostrar componente de carga durante la validación
    if (loading || validating) {
        if (loadingComponent) {
            return loadingComponent;
        }

        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                </div>
            </div>
        );
    }

    // Mostrar error si hubo problemas de validación
    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Error de Autorización
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {error}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // Redirigir si no está autenticado
    if (!isAuthenticated) {
        console.log('ProtectedRoute: Redirigiendo a login');
        return <Navigate to={redirectTo} replace />;
    }

    // Redirigir si no tiene los permisos necesarios
    if (requiredRole && !authorized) {
        console.log('ProtectedRoute: Redirigiendo por falta de permisos');
        return <Navigate to={unauthorizedRedirect} replace />;
    }

    // Si todo está bien, mostrar el contenido protegido
    console.log('ProtectedRoute: Acceso autorizado, mostrando contenido');
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiredRole: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
    ]),
    loadingComponent: PropTypes.node,
    redirectTo: PropTypes.string,
    unauthorizedRedirect: PropTypes.string
};

export default ProtectedRoute;