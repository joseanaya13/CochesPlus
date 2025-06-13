import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import purchaseService from '../../services/purchaseService';
import { useAuth } from '../../contexts/AuthContext';

const ComprasPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('compras');
    const [misCompras, setMisCompras] = useState([]);
    const [misVentas, setMisVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Estados para modales
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [selectedCompra, setSelectedCompra] = useState(null);
    const [responseData, setResponseData] = useState({ acepta: true, mensaje: '' });
    const [actionLoading, setActionLoading] = useState(false);
    // Modal para confirmar compra
    const [showConfirmCompraModal, setShowConfirmCompraModal] = useState(false);
    const [compraToConfirm, setCompraToConfirm] = useState(null); useEffect(() => {
        if (!isAuthenticated) {
            // Redirigir a login si no está autenticado
            navigate('/login');
            return;
        }
        loadData();
    }, [isAuthenticated, navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [compras, ventas] = await Promise.all([
                purchaseService.getMisCompras(),
                purchaseService.getMisVentas()
            ]);

            setMisCompras(compras);
            setMisVentas(ventas);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar las compras y ventas');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmarCompra = (compraId) => {
        setCompraToConfirm(compraId);
        setShowConfirmCompraModal(true);
    };

    const confirmarCompra = async () => {
        if (!compraToConfirm) return;
        try {
            setActionLoading(true);
            await purchaseService.confirmarComprador(compraToConfirm);
            setSuccessMessage('¡Compra confirmada exitosamente! Ya puedes valorar al vendedor.');
            await loadData();
        } catch (err) {
            console.error('Error al confirmar compra:', err);
            setError(err.message || 'Error al confirmar la compra');
        } finally {
            setActionLoading(false);
            setShowConfirmCompraModal(false);
            setCompraToConfirm(null);
        }
    };

    const handleCancelarCompra = async (compraId) => {
        if (!window.confirm('¿Estás seguro de que quieres cancelar esta solicitud de compra?')) {
            return;
        }

        try {
            setActionLoading(true);
            await purchaseService.cancelarCompra(compraId);
            setSuccessMessage('Solicitud de compra cancelada');
            await loadData();
        } catch (err) {
            console.error('Error al cancelar compra:', err);
            setError(err.message || 'Error al cancelar la compra');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResponderVendedor = (compra) => {
        setSelectedCompra(compra);
        setResponseData({ acepta: true, mensaje: '' });
        setShowResponseModal(true);
    };

    const submitVendedorResponse = async () => {
        try {
            setActionLoading(true);
            await purchaseService.responderVendedor(selectedCompra.id, responseData);

            const message = responseData.acepta
                ? 'Solicitud de compra aceptada'
                : 'Solicitud de compra rechazada';

            setSuccessMessage(message);
            setShowResponseModal(false);
            await loadData();
        } catch (err) {
            console.error('Error al responder solicitud:', err);
            setError(err.message || 'Error al responder la solicitud');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (estado) => {
        switch (estado) {
            case 'PENDIENTE_VENDEDOR':
            case 'PENDIENTE_COMPRADOR':
                return 'text-warning';
            case 'CONFIRMADA':
                return 'text-success';
            case 'CANCELADA':
                return 'text-error';
            default:
                return 'text-text-secondary';
        }
    };

    const getStatusText = (estado) => {
        switch (estado) {
            case 'PENDIENTE_VENDEDOR':
                return 'Esperando respuesta del vendedor';
            case 'PENDIENTE_COMPRADOR':
                return 'Esperando tu confirmación';
            case 'CONFIRMADA':
                return 'Compra confirmada';
            case 'CANCELADA':
                return 'Cancelada';
            default:
                return estado;
        }
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
            <div className="bg-primary-light dark:bg-primary-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-extrabold">Mis Compras y Ventas</h1>
                    <p className="mt-2 text-text-dark dark:text-text-light">Gestiona tus transacciones de compra y venta</p>
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
                                onClick={() => setActiveTab('compras')}
                                className={`py-4 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${activeTab === 'compras'
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-text-dark dark:text-text-light hover:text-primary'
                                    }`}
                            >
                                Mis Compras ({misCompras.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('ventas')}
                                className={`py-4 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${activeTab === 'ventas'
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-text-dark dark:text-text-light hover:text-primary'
                                    }`}
                            >
                                Mis Ventas ({misVentas.length})
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Tab: Mis Compras */}
                        {activeTab === 'compras' && (
                            <div>
                                <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-4">
                                    Mis Solicitudes de Compra
                                </h2>

                                {misCompras.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-text-secondary dark:text-text-secondary mb-4">
                                            <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-text-dark dark:text-text-light mb-2">
                                            No tienes compras realizadas
                                        </h3>
                                        <p className="text-text-secondary dark:text-text-secondary">
                                            Cuando realices solicitudes de compra, aparecerán aquí.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {misCompras.map((compra) => (
                                            <div key={compra.id} className="bg-primary-light dark:bg-primary-dark rounded-lg p-4 border border-primary-dark dark:border-primary-light">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h3 className="font-medium text-text-dark dark:text-text-light">
                                                                    {compra.coche?.marca?.nombre} {compra.coche?.modelo?.nombre}
                                                                </h3>
                                                                <p className="text-sm text-text-secondary dark:text-text-secondary">
                                                                    Vendedor: {compra.vendedor?.nombre}
                                                                </p>
                                                            </div>
                                                            <span className={`text-sm font-medium ${getStatusColor(compra.estado)}`}>
                                                                {getStatusText(compra.estado)}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-text-secondary dark:text-text-secondary">Precio ofrecido:</span>
                                                                <p className="font-medium text-primary">{compra.precio_acordado}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-text-secondary dark:text-text-secondary">Fecha solicitud:</span>
                                                                <p className="font-medium text-text-dark dark:text-text-light">
                                                                    {new Date(compra.created_at).toLocaleDateString('es-ES')}
                                                                </p>
                                                            </div>
                                                            {compra.fecha_limite_confirmacion && (
                                                                <div>
                                                                    <span className="text-text-secondary dark:text-text-secondary">Fecha límite:</span>
                                                                    <p className="font-medium text-warning">
                                                                        {new Date(compra.fecha_limite_confirmacion).toLocaleDateString('es-ES')}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {compra.fecha_venta && (
                                                                <div>
                                                                    <span className="text-text-secondary dark:text-text-secondary">Fecha venta:</span>
                                                                    <p className="font-medium text-success">
                                                                        {new Date(compra.fecha_venta).toLocaleDateString('es-ES')}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {compra.condiciones && (
                                                            <div className="mt-2">
                                                                <span className="text-text-secondary dark:text-text-secondary text-sm">Condiciones:</span>
                                                                <p className="text-sm text-text-dark dark:text-text-light mt-1">{compra.condiciones}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex space-x-2 mt-4 md:mt-0 md:ml-4">
                                                        {compra.estado === 'PENDIENTE_COMPRADOR' && (
                                                            <Button
                                                                onClick={() => handleConfirmarCompra(compra.id)}
                                                                variant="primary"
                                                                disabled={actionLoading}
                                                                className="text-sm"
                                                            >
                                                                Confirmar Compra
                                                            </Button>
                                                        )}

                                                        {(compra.estado === 'PENDIENTE_VENDEDOR' || compra.estado === 'PENDIENTE_COMPRADOR') && (
                                                            <Button
                                                                onClick={() => handleCancelarCompra(compra.id)}
                                                                variant="secondary"
                                                                disabled={actionLoading}
                                                                className="text-sm"
                                                            >
                                                                Cancelar
                                                            </Button>
                                                        )}                                                        {compra.estado === 'CONFIRMADA' && !compra.valoracion && (
                                                            <Button
                                                                onClick={() => navigate('/valoraciones')}
                                                                variant="primary"
                                                                className="text-sm"
                                                            >
                                                                Valorar Vendedor
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Mis Ventas */}
                        {activeTab === 'ventas' && (
                            <div>
                                <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-4">
                                    Solicitudes de Compra Recibidas
                                </h2>

                                {misVentas.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-text-secondary dark:text-text-secondary mb-4">
                                            <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-text-dark dark:text-text-light mb-2">
                                            No tienes solicitudes de compra
                                        </h3>
                                        <p className="text-text-secondary dark:text-text-secondary">
                                            Cuando recibas solicitudes de compra para tus coches, aparecerán aquí.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {misVentas.map((venta) => (
                                            <div key={venta.id} className="bg-secondary-light dark:bg-secondary-dark rounded-lg p-4 border border-secondary-light dark:border-secondary-dark">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h3 className="font-medium text-text-dark dark:text-text-light">
                                                                    {venta.coche?.marca?.nombre} {venta.coche?.modelo?.nombre}
                                                                </h3>
                                                                <p className="text-sm text-text-secondary dark:text-text-secondary">
                                                                    Comprador: {venta.comprador?.nombre}
                                                                </p>
                                                            </div>
                                                            <span className={`text-sm font-medium ${getStatusColor(venta.estado)}`}>
                                                                {getStatusText(venta.estado)}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-text-secondary dark:text-text-secondary">Precio ofrecido:</span>
                                                                <p className="font-medium text-primary">{venta.precio_acordado}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-text-secondary dark:text-text-secondary">Fecha solicitud:</span>
                                                                <p className="font-medium text-text-dark dark:text-text-light">
                                                                    {new Date(venta.created_at).toLocaleDateString('es-ES')}
                                                                </p>
                                                            </div>
                                                            {venta.fecha_limite_confirmacion && (
                                                                <div>
                                                                    <span className="text-text-secondary dark:text-text-secondary">Fecha límite:</span>
                                                                    <p className="font-medium text-warning">
                                                                        {new Date(venta.fecha_limite_confirmacion).toLocaleDateString('es-ES')}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {venta.fecha_venta && (
                                                                <div>
                                                                    <span className="text-text-secondary dark:text-text-secondary">Fecha venta:</span>
                                                                    <p className="font-medium text-success">
                                                                        {new Date(venta.fecha_venta).toLocaleDateString('es-ES')}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {venta.condiciones && (
                                                            <div className="mt-2">
                                                                <span className="text-text-secondary dark:text-text-secondary text-sm">Condiciones del comprador:</span>
                                                                <p className="text-sm text-text-dark dark:text-text-light mt-1">{venta.condiciones}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex space-x-2 mt-4 md:mt-0 md:ml-4">
                                                        {venta.estado === 'PENDIENTE_VENDEDOR' && (
                                                            <Button
                                                                onClick={() => handleResponderVendedor(venta)}
                                                                variant="primary"
                                                                disabled={actionLoading}
                                                                className="text-sm"
                                                            >
                                                                Responder
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para respuesta del vendedor */}
            {showResponseModal && selectedCompra && (
                <Modal
                    isOpen={showResponseModal}
                    onClose={() => setShowResponseModal(false)}
                    title="Responder Solicitud de Compra"
                    size="md"
                >
                    <div className="space-y-4">
                        <div className="bg-secondary-light dark:bg-secondary-dark rounded-lg p-4">
                            <h3 className="font-medium text-text-dark dark:text-text-light mb-2">
                                {selectedCompra.coche?.marca?.nombre} {selectedCompra.coche?.modelo?.nombre}
                            </h3>
                            <p className="text-sm text-text-secondary dark:text-text-secondary">
                                Comprador: {selectedCompra.comprador?.nombre}
                            </p>
                            <p className="text-sm text-text-secondary dark:text-text-secondary">
                                Precio ofrecido: <span className="font-medium text-primary">{selectedCompra.precio_acordado}</span>
                            </p>
                            {selectedCompra.condiciones && (
                                <p className="text-sm text-text-secondary dark:text-text-secondary mt-2">
                                    Condiciones: {selectedCompra.condiciones}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="acepta"
                                        checked={responseData.acepta === true}
                                        onChange={() => setResponseData({ ...responseData, acepta: true })}
                                        className="mr-2"
                                    />
                                    <span className="text-success">Aceptar solicitud</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="acepta"
                                        checked={responseData.acepta === false}
                                        onChange={() => setResponseData({ ...responseData, acepta: false })}
                                        className="mr-2"
                                    />
                                    <span className="text-error">Rechazar solicitud</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-2">
                                    Mensaje {responseData.acepta ? '(opcional)' : '(motivo del rechazo)'}
                                </label>
                                <textarea
                                    value={responseData.mensaje}
                                    onChange={(e) => setResponseData({ ...responseData, mensaje: e.target.value })}
                                    placeholder={responseData.acepta
                                        ? "Mensaje para el comprador..."
                                        : "Explica el motivo del rechazo..."}
                                    rows={3}
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background-light dark:bg-primary-dark text-text-dark dark:text-text-light border-secondary-dark dark:border-primary-light"
                                    maxLength={500}
                                />
                                <p className="text-xs text-text-secondary dark:text-text-secondary mt-1">
                                    {responseData.mensaje.length}/500 caracteres
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <Button
                                type="button"
                                onClick={() => setShowResponseModal(false)}
                                variant="secondary"
                                className="flex-1"
                                disabled={actionLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={submitVendedorResponse}
                                variant="primary"
                                className="flex-1"
                                isLoading={actionLoading}
                                disabled={actionLoading}
                            >
                                {responseData.acepta ? 'Aceptar Solicitud' : 'Rechazar Solicitud'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal para confirmar compra */}
            {showConfirmCompraModal && (
                <Modal
                    isOpen={showConfirmCompraModal}
                    onClose={() => setShowConfirmCompraModal(false)}
                    title="Confirmar compra"
                    size="sm"
                >
                    <div className="space-y-4">
                        <p>¿Confirmas que quieres proceder con esta compra? Esta acción no se puede deshacer.</p>
                        <div className="flex space-x-3 pt-4">
                            <Button
                                type="button"
                                onClick={() => setShowConfirmCompraModal(false)}
                                variant="secondary"
                                className="flex-1"
                                disabled={actionLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={confirmarCompra}
                                variant="primary"
                                className="flex-1"
                                isLoading={actionLoading}
                                disabled={actionLoading}
                            >
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </Layout>
    );
};

export default ComprasPage;