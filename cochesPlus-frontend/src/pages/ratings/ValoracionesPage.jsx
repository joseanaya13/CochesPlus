import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ValoracionForm from '../../components/valoraciones/ValoracionForm';
import ValoracionesDisplay from '../../components/valoraciones/ValoracionesDisplay';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import valoracionService from '../../services/valoracionService';
import { useAuth } from '../../contexts/AuthContext';

const ValoracionesPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('pendientes');
    const [comprasSinValorar, setComprasSinValorar] = useState([]);
    const [valoracionesRealizadas, setValoracionesRealizadas] = useState([]);
    const [estadisticasVendedor, setEstadisticasVendedor] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Estados para el modal de valoración
    const [showValoracionModal, setShowValoracionModal] = useState(false);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null);
    const [valoracionEnEdicion, setValoracionEnEdicion] = useState(null);
    const [loadingValoracion, setLoadingValoracion] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        loadData();
    }, [isAuthenticated, navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [compras, valoraciones, estadisticas] = await Promise.all([
                valoracionService.getComprasSinValorar(),
                valoracionService.getValoracionesRealizadas(),
                valoracionService.getEstadisticasVendedor()
            ]);

            setComprasSinValorar(compras);
            setValoracionesRealizadas(valoraciones);
            setEstadisticasVendedor(estadisticas);
        } catch (err) {
            console.error('Error al cargar datos de valoraciones:', err);
            setError('Error al cargar las valoraciones. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleValorarCompra = (compra) => {
        setCompraSeleccionada(compra);
        setValoracionEnEdicion(null);
        setShowValoracionModal(true);
    };

    const handleEditarValoracion = (valoracion) => {
        setCompraSeleccionada(valoracion.compra);
        setValoracionEnEdicion(valoracion);
        setShowValoracionModal(true);
    };

    const handleSubmitValoracion = async (valoracionData) => {
        try {
            setLoadingValoracion(true);

            if (valoracionEnEdicion) {
                await valoracionService.actualizarValoracion(valoracionEnEdicion.id, valoracionData);
                setSuccessMessage('Valoración actualizada correctamente');
            } else {
                await valoracionService.crearValoracion(valoracionData);
                setSuccessMessage('Valoración publicada correctamente');
            }

            setShowValoracionModal(false);
            setCompraSeleccionada(null);
            setValoracionEnEdicion(null);

            // Recargar datos
            await loadData();
        } catch (err) {
            console.error('Error al guardar valoración:', err);
            setError(err.message || 'Error al guardar la valoración');
        } finally {
            setLoadingValoracion(false);
        }
    };

    const handleEliminarValoracion = async (valoracionId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta valoración?')) {
            return;
        }

        try {
            await valoracionService.eliminarValoracion(valoracionId);
            setSuccessMessage('Valoración eliminada correctamente');
            await loadData();
        } catch (err) {
            console.error('Error al eliminar valoración:', err);
            setError('Error al eliminar la valoración');
        }
    };

    const closeModal = () => {
        setShowValoracionModal(false);
        setCompraSeleccionada(null);
        setValoracionEnEdicion(null);
    };

    const puedeEditarValoracion = (valoracion) => {
        const fechaCreacion = new Date(valoracion.created_at);
        const ahora = new Date();
        const horasTranscurridas = (ahora - fechaCreacion) / (1000 * 60 * 60);
        return horasTranscurridas <= 24;
    };

    if (loading) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-center items-center h-64">
                        <Spinner variant="page" />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-primary text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-extrabold">Valoraciones</h1>
                    <p className="mt-2">Gestiona tus valoraciones como comprador y vendedor</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Alertas */}
                {successMessage && (
                    <Alert
                        type="success"
                        message={successMessage}
                        onClose={() => setSuccessMessage('')}
                        className="mb-6"
                    />
                )}

                {error && (
                    <Alert
                        type="error"
                        message={error}
                        onClose={() => setError(null)}
                        className="mb-6"
                    />
                )}

                {/* Tabs */}
                <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md overflow-hidden">
                    <div className="border-b border-secondary-light dark:border-secondary-dark">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('pendientes')}
                                className={`py-4 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${activeTab === 'pendientes'
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-text-dark dark:text-text-light hover:text-primary'
                                    }`}
                            >
                                Pendientes de valorar ({comprasSinValorar.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('realizadas')}
                                className={`py-4 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${activeTab === 'realizadas'
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-text-dark dark:text-text-light hover:text-primary'
                                    }`}
                            >
                                Mis valoraciones ({valoracionesRealizadas.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('recibidas')}
                                className={`py-4 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${activeTab === 'recibidas'
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-text-dark dark:text-text-light hover:text-primary'
                                    }`}
                            >
                                Valoraciones recibidas ({estadisticasVendedor?.estadisticas?.total || 0})
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Tab: Compras pendientes de valorar */}
                        {activeTab === 'pendientes' && (
                            <div>
                                <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-4">
                                    Compras pendientes de valorar
                                </h2>

                                {comprasSinValorar.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-text-secondary dark:text-text-secondary mb-4">
                                            <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-text-dark dark:text-text-light mb-2">
                                            ¡Estás al día!
                                        </h3>
                                        <p className="text-text-secondary dark:text-text-secondary">
                                            No tienes compras pendientes de valorar.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {comprasSinValorar.map((compra) => (
                                            <div key={compra.id} className="bg-secondary-light dark:bg-secondary-dark rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-medium text-text-dark dark:text-text-light">
                                                            {compra.coche?.marca?.nombre} {compra.coche?.modelo?.nombre}
                                                        </h3>
                                                        <p className="text-sm text-text-secondary dark:text-text-secondary">
                                                            Vendedor: {compra.vendedor?.nombre}
                                                        </p>
                                                        <p className="text-sm text-text-secondary dark:text-text-secondary">
                                                            Comprado el: {new Date(compra.fecha_venta).toLocaleDateString('es-ES')}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleValorarCompra(compra)}
                                                        variant="primary"
                                                        className="flex items-center"
                                                    >
                                                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                        </svg>
                                                        Valorar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Valoraciones realizadas */}
                        {activeTab === 'realizadas' && (
                            <div>
                                <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-4">
                                    Mis valoraciones realizadas
                                </h2>

                                {valoracionesRealizadas.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-text-secondary dark:text-text-secondary mb-4">
                                            <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-text-dark dark:text-text-light mb-2">
                                            Sin valoraciones realizadas
                                        </h3>
                                        <p className="text-text-secondary dark:text-text-secondary">
                                            Cuando compres coches, podrás valorar a los vendedores aquí.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {valoracionesRealizadas.map((valoracion) => (
                                            <div key={valoracion.id} className="bg-secondary-light dark:bg-secondary-dark rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <span
                                                                    key={star}
                                                                    className={`text-lg ${star <= valoracion.puntuacion
                                                                            ? 'text-warning'
                                                                            : 'text-gray-300 dark:text-gray-600'
                                                                        }`}
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <h3 className="font-medium text-text-dark dark:text-text-light">
                                                            {valoracion.compra?.coche?.marca?.nombre} {valoracion.compra?.coche?.modelo?.nombre}
                                                        </h3>
                                                        <p className="text-sm text-text-secondary dark:text-text-secondary">
                                                            Vendedor: {valoracion.compra?.vendedor?.nombre}
                                                        </p>
                                                        {valoracion.comentario && (
                                                            <p className="text-sm text-text-dark dark:text-text-light mt-2">
                                                                "{valoracion.comentario}"
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-text-secondary dark:text-text-secondary mt-2">
                                                            Valorado el: {new Date(valoracion.created_at).toLocaleDateString('es-ES')}
                                                        </p>
                                                    </div>

                                                    <div className="flex space-x-2">
                                                        {puedeEditarValoracion(valoracion) && (
                                                            <Button
                                                                onClick={() => handleEditarValoracion(valoracion)}
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                Editar
                                                            </Button>
                                                        )}
                                                        <Button
                                                            onClick={() => handleEliminarValoracion(valoracion.id)}
                                                            variant="danger"
                                                            className="text-xs"
                                                        >
                                                            Eliminar
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Valoraciones recibidas */}
                        {activeTab === 'recibidas' && (
                            <div>
                                <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-4">
                                    Valoraciones recibidas como vendedor
                                </h2>

                                <ValoracionesDisplay
                                    valoraciones={estadisticasVendedor?.valoraciones || []}
                                    estadisticas={estadisticasVendedor?.estadisticas}
                                    loading={false}
                                    showCompact={false}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para valorar/editar valoración */}
            {showValoracionModal && compraSeleccionada && (
                <Modal
                    isOpen={showValoracionModal}
                    onClose={closeModal}
                    title={valoracionEnEdicion ? 'Editar valoración' : 'Valorar vendedor'}
                    size="lg"
                >
                    <ValoracionForm
                        compra={compraSeleccionada}
                        onSubmit={handleSubmitValoracion}
                        onCancel={closeModal}
                        loading={loadingValoracion}
                        error={error}
                        initialValoracion={valoracionEnEdicion}
                    />
                </Modal>
            )}
        </Layout>
    );
};

export default ValoracionesPage;