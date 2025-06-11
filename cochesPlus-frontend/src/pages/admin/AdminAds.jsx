// cochesPlus-frontend/src/pages/admin/AdminAds.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import AdminTable from '../../components/admin/AdminTable';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import InputField from '../../components/common/InputField';
import SelectField from '../../components/common/SelectField';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

const AdminAds = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Paginación y filtros
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filtros individuales
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [verifiedFilter, setVerifiedFilter] = useState('');
    const [featuredFilter, setFeaturedFilter] = useState('');
    const [priceMinFilter, setPriceMinFilter] = useState('');
    const [priceMaxFilter, setPriceMaxFilter] = useState('');

    // Debounce para búsqueda
    const [searchDebounce, setSearchDebounce] = useState('');

    // Modales
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFeatureModal, setShowFeatureModal] = useState(false);
    const [selectedAd, setSelectedAd] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const statusOptions = [
        { value: '', label: 'Todos los estados' },
        { value: 'activo', label: 'Activos' },
        { value: 'vendido', label: 'Vendidos' },
    ];

    const verifiedOptions = [
        { value: '', label: 'Todos' },
        { value: '1', label: 'Verificados' },
        { value: '0', label: 'No verificados' }
    ];

    const featuredOptions = [
        { value: '', label: 'Todos' },
        { value: '1', label: 'Destacados' },
        { value: '0', label: 'No destacados' }
    ];

    // Debounce para la búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Cargar anuncios cuando cambien los filtros
    useEffect(() => {
        loadAds();
    }, [currentPage, searchDebounce, statusFilter, verifiedFilter, featuredFilter, priceMinFilter, priceMaxFilter]);

    const loadAds = async () => {
        try {
            setLoading(true);

            // Construir parámetros de forma más robusta
            const params = new URLSearchParams();
            params.append('page', currentPage.toString());
            params.append('per_page', '5');

            if (searchDebounce.trim()) {
                params.append('search', searchDebounce.trim());
            }

            if (statusFilter) {
                if (statusFilter === 'vendido') {
                    params.append('vendido', '1');
                } else if (statusFilter === 'activo') {
                    params.append('vendido', '0');
                }
            }

            if (verifiedFilter) {
                params.append('verificado', verifiedFilter);
            }

            if (featuredFilter) {
                params.append('destacado', featuredFilter);
            }

            if (priceMinFilter && !isNaN(Number(priceMinFilter))) {
                params.append('precio_min', priceMinFilter);
            }

            if (priceMaxFilter && !isNaN(Number(priceMaxFilter))) {
                params.append('precio_max', priceMaxFilter);
            }

            console.log('Parámetros de búsqueda:', params.toString());

            const response = await adminService.getAds(params);

            // Manejar diferentes estructuras de respuesta
            if (response.data) {
                setAds(response.data || []);
                setCurrentPage(response.current_page || 1);
                setTotalPages(response.last_page || 1);
                setTotalItems(response.total || 0);
            } else if (Array.isArray(response)) {
                setAds(response);
                setTotalPages(1);
                setTotalItems(response.length);
            } else {
                setAds([]);
                setTotalPages(1);
                setTotalItems(0);
            }

            setError(null);
        } catch (err) {
            console.error('Error cargando anuncios:', err);
            setError('Error al cargar anuncios: ' + (err.message || 'Error desconocido'));
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset página al buscar
    };

    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleVerifiedFilter = (e) => {
        setVerifiedFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleFeaturedFilter = (e) => {
        setFeaturedFilter(e.target.value);
        setCurrentPage(1);
    };

    const handlePriceMinFilter = (e) => {
        const value = e.target.value;
        if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
            setPriceMinFilter(value);
            setCurrentPage(1);
        }
    };

    const handlePriceMaxFilter = (e) => {
        const value = e.target.value;
        if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
            setPriceMaxFilter(value);
            setCurrentPage(1);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0); // Scroll al top al cambiar página
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setVerifiedFilter('');
        setFeaturedFilter('');
        setPriceMinFilter('');
        setPriceMaxFilter('');
        setCurrentPage(1);
    };

    const handleViewDetails = async (ad) => {
        try {
            setModalLoading(true);
            const fullAd = await adminService.getAd(ad.id);
            setSelectedAd(fullAd);
            setShowDetailsModal(true);
        } catch (err) {
            console.error('Error cargando detalles:', err);
            setError('Error al cargar detalles del anuncio: ' + (err.message || ''));
        } finally {
            setModalLoading(false);
        }
    };

    const handleDeleteAd = (ad) => {
        setSelectedAd(ad);
        setShowDeleteModal(true);
    };

    const handleFeatureAd = (ad) => {
        setSelectedAd(ad);
        setShowFeatureModal(true);
    };

    const submitDeleteAd = async () => {
        try {
            setModalLoading(true);
            await adminService.deleteAd(selectedAd.id);
            setShowDeleteModal(false);
            setSelectedAd(null);
            setSuccessMessage('Anuncio eliminado exitosamente');
            loadAds(); // Recargar lista

            // Auto-hide success message
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error('Error eliminando anuncio:', err);
            setError(err.message || 'Error al eliminar anuncio');
        } finally {
            setModalLoading(false);
        }
    };

    const submitFeatureAd = async () => {
        try {
            setModalLoading(true);
            const isCurrentlyFeatured = selectedAd.destacado;
            await adminService.toggleFeatureAd(selectedAd.id, !isCurrentlyFeatured);
            setShowFeatureModal(false);
            setSelectedAd(null);
            setSuccessMessage(
                isCurrentlyFeatured
                    ? 'Anuncio removido de destacados'
                    : 'Anuncio destacado exitosamente'
            );
            loadAds(); // Recargar lista

            // Auto-hide success message
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error('Error destacando anuncio:', err);
            setError(err.message || 'Error al destacar anuncio');
        } finally {
            setModalLoading(false);
        }
    };

    const columns = [
        {
            key: 'titulo',
            header: 'Vehículo',
            render: (_, row) => (
                <div>
                    <div className="font-medium text-text-dark dark:text-text-light">
                        {row.marca?.nombre || 'N/A'} {row.modelo?.nombre || 'N/A'}
                    </div>
                    <div className="text-xs text-text-secondary">
                        {row.anio || 'N/A'} • {row.kilometraje ? row.kilometraje.toLocaleString() : 'N/A'} km
                    </div>
                </div>
            )
        },
        {
            key: 'precio',
            header: 'Precio',
            render: (precio) => (
                <span className="font-semibold text-success">
                    {precio ? precio : 'N/A'}
                </span>
            )
        },
        {
            key: 'vendedor',
            header: 'Vendedor',
            render: (_, row) => (
                <div>
                    <div className="font-medium text-text-dark dark:text-text-light">
                        {row.usuario?.nombre || 'N/A'}
                    </div>
                    <div className="text-xs text-text-secondary">
                        {row.usuario?.email || 'N/A'}
                    </div>
                </div>
            )
        },
        {
            key: 'estado',
            header: 'Estado',
            render: (_, row) => (
                <div className="flex flex-col gap-1">
                    {/* Estado vendido/activo */}
                    <span className={`px-2 py-1 rounded text-xs font-medium text-center ${row.vendido
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        }`}>
                        {row.vendido ? 'Vendido' : 'Activo'}
                    </span>

                    {/* Estado verificación */}
                    <span className={`px-2 py-1 rounded text-xs font-medium text-center ${row.verificado
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                        {row.verificado ? '✅ Verificado' : '⏳ Sin verificar'}
                    </span>

                    {/* Estado destacado */}
                    {row.destacado == true && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 text-center">
                            ⭐ Destacado
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'fecha_publicacion',
            header: 'Publicado',
            render: (date) => (
                <div className="text-sm">
                    <div>{formatDate(date)}</div>
                    <div className="text-xs text-text-secondary">
                        {new Date(date).toLocaleDateString('es-ES')}
                    </div>
                </div>
            )
        }
    ];

    const actions = [
        {
            label: 'Ver',
            onClick: handleViewDetails,
            variant: 'primary',
            icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            )
        },
        {
            label: (row) => row.destacado ? 'Quitar destacado' : 'Destacar',
            onClick: handleFeatureAd,
            variant: 'warning',
            icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            )
        },
        {
            label: 'Eliminar',
            onClick: handleDeleteAd,
            variant: 'error',
            icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            )
        }
    ];

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold !text-text-dark dark:text-text-light">
                            Gestión de Anuncios
                        </h1>
                        <p className="text-text-secondary mt-1">
                            {totalItems > 0 ? `${totalItems} anuncios encontrados` : 'No hay anuncios'}
                        </p>
                    </div>
                </div>

                {/* Alertas */}
                {error && (
                    <Alert
                        type="error"
                        message={error}
                        onClose={() => setError(null)}
                        className="mb-4"
                    />
                )}

                {successMessage && (
                    <Alert
                        type="success"
                        message={successMessage}
                        onClose={() => setSuccessMessage('')}
                        className="mb-4"
                    />
                )}

                {/* Filtros mejorados */}
                <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold text-text-dark dark:text-text-light mb-4">
                        Filtros de búsqueda
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                        <InputField
                            label="Buscar anuncios"
                            placeholder="Marca, modelo, vendedor..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="col-span-1 md:col-span-2"
                        />

                        <SelectField
                            label="Estado de venta"
                            value={statusFilter}
                            onChange={handleStatusFilter}
                            options={statusOptions}
                        />

                        <SelectField
                            label="Verificación"
                            value={verifiedFilter}
                            onChange={handleVerifiedFilter}
                            options={verifiedOptions}
                        />

                        <SelectField
                            label="Destacados"
                            value={featuredFilter}
                            onChange={handleFeaturedFilter}
                            options={featuredOptions}
                        />

                        <InputField
                            label="Precio mínimo (€)"
                            type="number"
                            placeholder="0"
                            min="0"
                            value={priceMinFilter}
                            onChange={handlePriceMinFilter}
                        />

                        <InputField
                            label="Precio máximo (€)"
                            type="number"
                            placeholder="999999"
                            min="0"
                            value={priceMaxFilter}
                            onChange={handlePriceMaxFilter}
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-sm text-text-secondary">
                            {loading ? 'Buscando...' : `Mostrando ${ads.length} de ${totalItems} anuncios`}
                        </div>
                        <Button
                            variant="secondary"
                            onClick={resetFilters}
                            className="flex items-center gap-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Limpiar filtros
                        </Button>
                    </div>
                </div>

                {/* Tabla mejorada */}
                <AdminTable
                    columns={columns}
                    data={ads}
                    loading={loading}
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems
                    }}
                    onPageChange={handlePageChange}
                    actions={actions}
                    emptyMessage="No se encontraron anuncios con los filtros aplicados"
                />

                {/* Modal Ver Detalles mejorado */}
                <Modal
                    isOpen={showDetailsModal}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedAd(null);
                    }}
                    title="Detalles del Anuncio"
                    confirmAction={() => {
                        setShowDetailsModal(false);
                        setSelectedAd(null);
                    }}
                    confirmText="Cerrar"
                    cancelText=""
                >
                    {selectedAd && (
                        <div className="space-y-6 max-h-96 overflow-y-auto">
                            {/* Información básica */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><strong>Estado:</strong>
                                    <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedAd.vendido
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {selectedAd.vendido ? 'Vendido' : 'Activo'}
                                    </span>
                                </div>
                                <div><strong>Vehículo:</strong> {selectedAd.marca?.nombre} {selectedAd.modelo?.nombre}</div>
                                <div><strong>Año:</strong> {selectedAd.anio}</div>
                                <div><strong>Precio:</strong> {selectedAd.precio}</div>
                                <div><strong>Provincia:</strong> {selectedAd.provincia?.nombre}</div>
                                <div><strong>Categoría:</strong> {selectedAd.categoria?.nombre}</div>
                            </div>

                            {/* Enlaces */}
                            <div className="flex space-x-2">
                                <Link
                                    to={`/coches/${selectedAd.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="primary" size="sm">
                                        Ver anuncio público
                                    </Button>
                                </Link>
                            </div>

                            {/* Imágenes */}
                            {selectedAd.imagenes && selectedAd.imagenes.length > 0 && (
                                <div>
                                    <strong>Imágenes ({selectedAd.imagenes.length}):</strong>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {selectedAd.imagenes.slice(0, 6).map((imagen, index) => (
                                            <img
                                                key={index}
                                                src={`${import.meta.env.PROD
                                                    ? 'https://josefa25.iesmontenaranco.com:8000'
                                                    : 'http://localhost:8000'}/${imagen.ruta}`}
                                                alt={`Imagen ${index + 1}`}
                                                className="w-full h-20 object-cover rounded-lg border"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-car.jpg';
                                                }}
                                            />
                                        ))}
                                    </div>
                                    {selectedAd.imagenes.length > 6 && (
                                        <p className="text-xs text-text-secondary mt-1">
                                            +{selectedAd.imagenes.length - 6} imágenes más
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </Modal>

                {/* Modal Eliminar Anuncio */}
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedAd(null);
                    }}
                    title="Confirmar Eliminación"
                    confirmAction={submitDeleteAd}
                    confirmText={modalLoading ? "Eliminando..." : "Eliminar"}
                    cancelText="Cancelar"
                    confirmVariant="error"
                >
                    <div className="space-y-4">
                        <p>
                            ¿Estás seguro de que quieres eliminar el anuncio <strong>{selectedAd?.marca?.nombre} {selectedAd?.modelo?.nombre}</strong>?
                        </p>
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                ⚠️ Esta acción no se puede deshacer y eliminará todos los datos asociados al anuncio, incluyendo imágenes y mensajes.
                            </p>
                        </div>
                    </div>
                </Modal>

                {/* Modal Destacar/Quitar Destacado */}
                <Modal
                    isOpen={showFeatureModal}
                    onClose={() => {
                        setShowFeatureModal(false);
                        setSelectedAd(null);
                    }}
                    title={selectedAd?.destacado ? "Quitar Destacado" : "Destacar Anuncio"}
                    confirmAction={submitFeatureAd}
                    confirmText={modalLoading ? "Procesando..." : (selectedAd?.destacado ? "Quitar Destacado" : "Destacar")}
                    cancelText="Cancelar"
                    confirmVariant={selectedAd?.destacado ? "secondary" : "warning"}
                >
                    <div className="space-y-4">
                        <p>
                            ¿Estás seguro de que quieres {selectedAd?.destacado ? 'quitar el destacado del' : 'destacar el'} anuncio <strong>{selectedAd?.marca?.nombre} {selectedAd?.modelo?.nombre}</strong>?
                        </p>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                ⭐ Los anuncios destacados aparecen en posiciones privilegiadas en los resultados de búsqueda y tienen mayor visibilidad.
                            </p>
                        </div>
                    </div>
                </Modal>
            </div>
        </Layout>
    );
};

export default AdminAds;