// cochesPlus-frontend/src/pages/dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import AdminStats from '../../components/admin/AdminStats';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import adminService from '../../services/adminService';

const Dashboard = () => {
    const { user, hasRole } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!hasRole('admin')) {
            navigate('/', { replace: true });
        } else {
            fetchDashboardStats();
        }
    }, [hasRole, navigate]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const statsData = await adminService.getDashboardStats();
            setStats(statsData);
            setError(null);
        } catch (err) {
            console.error('Error al cargar estadísticas del dashboard:', err);
            setError('Error al cargar las estadísticas del dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (!hasRole('admin')) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <Alert
                        type="error"
                        message="No tienes permiso para acceder al panel de administración."
                        onClose={() => { }}
                    />
                    <div className="mt-4">
                        <Button onClick={() => navigate('/')} fullWidth>
                            Volver a la página principal
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-primary-light/10 dark:bg-primary-dark/5">
                <header className="bg-background-light dark:bg-primary-dark shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-text-dark dark:text-text-light">Panel de Administración</h1>
                        <Button onClick={fetchDashboardStats} variant="secondary" className="flex items-center">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Actualizar
                        </Button>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Mostrar errores */}
                    {error && (
                        <Alert
                            type="error"
                            message={error}
                            onClose={() => setError(null)}
                            className="mb-6"
                        />
                    )}

                    {/* Estadísticas principales */}
                    <AdminStats stats={stats} loading={loading} />

                    {/* Sección de gestión rápida */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Gestión de Usuarios */}
                        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                                        {stats?.usuarios?.total || 0} usuarios
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-text-dark dark:text-text-light mb-2">
                                    Gestión de Usuarios
                                </h3>
                                <p className="text-text-secondary text-sm mb-4">
                                    Administra cuentas de usuarios, roles y permisos del sistema.
                                </p>
                                <Link to="/admin/users" className="block">
                                    <Button variant="primary" fullWidth>
                                        Gestionar usuarios
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Gestión de Mensajes */}
                        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-info/10 text-info">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-info/10 text-info">
                                        {stats?.conversaciones?.total || 0} conversaciones
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-text-dark dark:text-text-light mb-2">
                                    Mensajes y Conversaciones
                                </h3>
                                <p className="text-text-secondary text-sm mb-4">
                                    Supervisa y modera las comunicaciones entre usuarios.
                                </p>
                                <Link to="/admin/messages" className="block">
                                    <Button variant="primary" fullWidth>
                                        Ver mensajes
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Verificación de documentos */}
                        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-warning/10 text-warning">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${(stats?.anuncios?.pendientes_verificacion || 0) > 0
                                            ? 'bg-warning/10 text-warning'
                                            : 'bg-success/10 text-success'
                                        }`}>
                                        {(stats?.anuncios?.pendientes_verificacion || 0) > 0
                                            ? `${stats.anuncios.pendientes_verificacion} pendientes`
                                            : 'Al día'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-text-dark dark:text-text-light mb-2">
                                    Verificar Documentos
                                </h3>
                                <p className="text-text-secondary text-sm mb-4">
                                    Revisa y verifica documentación de los vehículos publicados.
                                </p>
                                <Link to="/admin/verificar-documentos" className="block">
                                    <Button variant="primary" fullWidth>
                                        Gestionar documentos
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Actividad reciente */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Gráfico de usuarios */}
                        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-text-dark dark:text-text-light mb-4">
                                Usuarios registrados (última semana)
                            </h3>
                            {stats?.estadisticas_recientes?.usuarios_ultima_semana ? (
                                <div className="flex items-end space-x-2 h-32">
                                    {stats.estadisticas_recientes.usuarios_ultima_semana.map((count, index) => (
                                        <div key={index} className="flex-1 flex flex-col items-center">
                                            <div
                                                className="w-full bg-primary/20 rounded-t-sm"
                                                style={{
                                                    height: `${Math.max((count / Math.max(...stats.estadisticas_recientes.usuarios_ultima_semana)) * 100, 10)}%`
                                                }}
                                            >
                                                <div
                                                    className="w-full bg-primary rounded-t-sm"
                                                    style={{
                                                        height: `${Math.max((count / Math.max(...stats.estadisticas_recientes.usuarios_ultima_semana)) * 100, 10)}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-text-secondary mt-1">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-32 flex items-center justify-center text-text-secondary">
                                    No hay datos disponibles
                                </div>
                            )}
                        </div>

                        {/* Gráfico de anuncios */}
                        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-text-dark dark:text-text-light mb-4">
                                Anuncios publicados (última semana)
                            </h3>
                            {stats?.estadisticas_recientes?.anuncios_ultima_semana ? (
                                <div className="flex items-end space-x-2 h-32">
                                    {stats.estadisticas_recientes.anuncios_ultima_semana.map((count, index) => (
                                        <div key={index} className="flex-1 flex flex-col items-center">
                                            <div
                                                className="w-full bg-success/20 rounded-t-sm"
                                                style={{
                                                    height: `${Math.max((count / Math.max(...stats.estadisticas_recientes.anuncios_ultima_semana)) * 100, 10)}%`
                                                }}
                                            >
                                                <div
                                                    className="w-full bg-success rounded-t-sm"
                                                    style={{
                                                        height: `${Math.max((count / Math.max(...stats.estadisticas_recientes.anuncios_ultima_semana)) * 100, 10)}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-text-secondary mt-1">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-32 flex items-center justify-center text-text-secondary">
                                    No hay datos disponibles
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Distribución de roles */}
                    {stats?.usuarios?.por_rol && (
                        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6 mb-8">
                            <h3 className="text-lg font-semibold text-text-dark dark:text-text-light mb-4">
                                Distribución de usuarios por rol
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(stats.usuarios.por_rol).map(([rol, cantidad]) => (
                                    <div key={rol} className="text-center p-4 bg-secondary-light/20 dark:bg-secondary-dark/20 rounded-lg">
                                        <div className="text-2xl font-bold text-text-dark dark:text-text-light">
                                            {cantidad}
                                        </div>
                                        <div className="text-sm text-text-secondary capitalize">
                                            {rol.replace('_', ' ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sección de bienvenida */}
                    <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-4">
                            Bienvenido, {user?.nombre || 'Administrador'}
                        </h2>
                        <p className="text-text-secondary mb-4">
                            Desde este panel puedes administrar toda la plataforma CochesPlus. Utiliza las tarjetas de arriba para acceder a las diferentes funcionalidades administrativas.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h4 className="font-semibold text-text-dark dark:text-text-light mb-2">Funciones principales:</h4>
                                <ul className="text-sm text-text-secondary space-y-1">
                                    <li>• Gestión completa de usuarios y roles</li>
                                    <li>• Supervisión de mensajes y conversaciones</li>
                                    <li>• Verificación de documentos de vehículos</li>
                                    <li>• Estadísticas en tiempo real</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-text-dark dark:text-text-light mb-2">Estado del sistema:</h4>
                                <ul className="text-sm space-y-1">
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
                                        <span className="text-text-secondary">Sistema operativo</span>
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
                                        <span className="text-text-secondary">Base de datos conectada</span>
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
                                        <span className="text-text-secondary">Mensajería en tiempo real activa</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default Dashboard;
