import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import cocheService from '../../services/CocheService';

const Dashboard = () => {
    const { user, hasRole } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        cochesNoVerificados: 0,
        totalCoches: 0,
        cochesVendidos: 0,
        loading: true,
        error: null
    });

    useEffect(() => {
        if (!hasRole('admin')) {
            navigate('/', { replace: true });
        } else {
            // Cargar estadísticas
            fetchCochesStats();
        }
    }, [hasRole, navigate]);

    const fetchCochesStats = async () => {
        try {
            // Obtener coches no verificados
            const paramsNoVerificados = {
                verificado: 'false',
                incluir_vendidos: 'true'
            };
            const responseNoVerificados = await cocheService.getAllCoches(paramsNoVerificados);

            // Obtener todos los coches
            const paramsTodos = {
                incluir_vendidos: 'true'
            };
            const responseTodos = await cocheService.getAllCoches(paramsTodos);

            // Filtrar solo los que tienen documentos para verificar
            const cochesConDocumentos = responseNoVerificados.data.filter(coche =>
                coche.documentos && coche.documentos.length > 0
            );

            // Contar coches vendidos
            const cochesVendidos = responseTodos.data.filter(coche => coche.vendido).length;

            setStats({
                cochesNoVerificados: cochesConDocumentos.length,
                totalCoches: responseTodos.data.length,
                cochesVendidos: cochesVendidos,
                loading: false,
                error: null
            });
        } catch (error) {
            setStats(prevStats => ({
                ...prevStats,
                loading: false,
                error: "Error al cargar estadísticas"
            }));
            console.error('Error al cargar estadísticas:', error);
        }
    };

    if (!hasRole('admin')) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <Alert
                        type="error"
                        message="No tienes permiso para acceder al panel de administración."
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
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Resumen de estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Estadística 1: Total coches */}
                        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6 border-l-4 border-primary hover:shadow-lg transition-all duration-300">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-text-secondary">Total Anuncios</p>
                                    <p className="text-3xl font-bold text-text-dark dark:text-text-light">
                                        {stats.loading ? (
                                            <span className="animate-pulse">...</span>
                                        ) : stats.error ? (
                                            <span className="text-error">Error</span>
                                        ) : (
                                            stats.totalCoches
                                        )}
                                    </p>
                                </div>
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Estadística 2: Coches vendidos */}
                        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6 border-l-4 border-success hover:shadow-lg transition-all duration-300">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-text-secondary">Coches Vendidos</p>
                                    <p className="text-3xl font-bold text-text-dark dark:text-text-light">
                                        {stats.loading ? (
                                            <span className="animate-pulse">...</span>
                                        ) : stats.error ? (
                                            <span className="text-error">Error</span>
                                        ) : (
                                            stats.cochesVendidos
                                        )}
                                    </p>
                                </div>
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-success/10 text-success">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Estadística 3: Documentos pendientes */}
                        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6 border-l-4 border-warning hover:shadow-lg transition-all duration-300">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-text-secondary">Pendientes Verificación</p>
                                    <p className="text-3xl font-bold text-text-dark dark:text-text-light">
                                        {stats.loading ? (
                                            <span className="animate-pulse">...</span>
                                        ) : stats.error ? (
                                            <span className="text-error">Error</span>
                                        ) : (
                                            stats.cochesNoVerificados
                                        )}
                                    </p>
                                </div>
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-warning/10 text-warning">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tarjetas de funcionalidades */}
                    <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-4">
                        Gestión de la plataforma
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Tarjeta 1: Verificación de documentos */}
                        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${stats.cochesNoVerificados > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                                        {stats.cochesNoVerificados > 0 ? `${stats.cochesNoVerificados} pendientes` : 'Al día'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-text-dark dark:text-text-light mb-2">
                                    Verificar Documentos
                                </h3>
                                <p className="text-text-secondary text-sm mb-4">
                                    Revisa y verifica documentación de los vehículos publicados por los vendedores.
                                </p>
                                <Link to="/admin/verificar-documentos" className="block">
                                    <Button variant="primary" fullWidth>
                                        Gestionar documentos
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Se pueden añadir más tarjetas para otras funcionalidades administrativas */}
                    </div>

                    {/* Sección de bienvenida */}
                    <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-4">
                            Bienvenido, {user?.nombre || 'Administrador'}
                        </h2>
                        <p className="text-text-secondary mb-4">
                            Desde este panel puedes administrar toda la plataforma CochesPlus. Utiliza las tarjetas de arriba para acceder a las diferentes funcionalidades.
                        </p>
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default Dashboard;
