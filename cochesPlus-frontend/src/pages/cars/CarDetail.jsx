import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import cocheService from '../../services/CocheService';
import favoritoService from '../../services/FavoritoService';
import { formatPrice, formatDate } from '../../utils/formatters';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import ChatButton from '../../components/messages/ChatButton';

const CarDetail = () => {
    const { id } = useParams();
    const { isAuthenticated, hasRole, user } = useAuth();
    const navigate = useNavigate();
    const [coche, setCoche] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [cochesRecomendados, setCochesRecomendados] = useState([]);
    const [loadingRecomendados, setLoadingRecomendados] = useState(false);
    const [alertInfo, setAlertInfo] = useState(null);
    const [loadingFavorito, setLoadingFavorito] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDocumentDeleteModalOpen, setIsDocumentDeleteModalOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);

    useEffect(() => {
        const fetchCocheDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await cocheService.getCocheById(id);
                setCoche(data);

                if (isAuthenticated) {
                    checkFavoriteStatus(id);
                }

                fetchCochesRecomendados(data);
            } catch (err) {
                console.error('Error al cargar el coche:', err);
                setError('No se pudo cargar la información del coche');
            } finally {
                setLoading(false);
            }
        };

        fetchCocheDetail();
    }, [id, isAuthenticated]);

    const checkFavoriteStatus = async (cocheId) => {
        try {
            const favoritos = await favoritoService.getUserFavorites();
            const esFavorito = favoritos.some(fav => fav.id_coche === parseInt(cocheId));
            setIsFavorite(esFavorito);
        } catch (err) {
            console.error('Error al verificar estado de favorito:', err);
        }
    };

    const fetchCochesRecomendados = useCallback(async (cocheActual) => {
        if (!cocheActual) return;

        try {
            setLoadingRecomendados(true);
            const params = {
                id_marca: cocheActual.id_marca,
                id_categoria: cocheActual.id_categoria,
                per_page: 8, 
                incluir_vendidos: 'false' 
            };
            const response = await cocheService.getAllCoches(params);
            const filteredCoches = response.data?.filter(c => c.id !== parseInt(id)) || [];
            setCochesRecomendados(filteredCoches.slice(0, 4));
        } catch (err) {
            console.error('Error al cargar coches recomendados:', err);
        } finally {
            setLoadingRecomendados(false);
        }
    }, [id]);

    const changeImage = (direction) => {
        if (!coche || !coche.imagenes || coche.imagenes.length === 0) return;

        if (direction === 'next') {
            setActiveImageIndex((prev) =>
                prev === coche.imagenes.length - 1 ? 0 : prev + 1
            );
        } else {
            setActiveImageIndex((prev) =>
                prev === 0 ? coche.imagenes.length - 1 : prev - 1
            );
        }
    };

    const handleMarkAsSold = async () => {
        try {
            await cocheService.updateCoche(id, { vendido: true });
            setCoche(prev => ({ ...prev, vendido: true }));
            setAlertInfo({
                type: 'success',
                message: 'El coche ha sido marcado como vendido'
            });
        } catch (err) {
            console.error('Error al marcar como vendido:', err);
            setAlertInfo({
                type: 'error',
                message: 'Error al marcar como vendido. Por favor, inténtalo de nuevo.'
            });
        }
    };

    const toggleFavorite = async () => {
        if (!isAuthenticated) {
            setAlertInfo({
                type: 'warning',
                message: 'Debes iniciar sesión para añadir a favoritos'
            });
            return;
        }

        try {
            setLoadingFavorito(true);
            if (isFavorite) {
                await favoritoService.removeFavorite(id);
                setAlertInfo({
                    type: 'info',
                    message: 'Eliminado de favoritos'
                });
            } else {
                await favoritoService.addFavorite(id);
                setAlertInfo({
                    type: 'success',
                    message: 'Añadido a favoritos'
                });
            }
            setIsFavorite(!isFavorite);
        } catch (err) {
            console.error('Error al cambiar estado de favorito:', err);
            setAlertInfo({
                type: 'error',
                message: 'Error al actualizar favoritos. Por favor, inténtalo de nuevo.'
            });
        } finally {
            setLoadingFavorito(false);
        }
    };

    const openDeleteModal = () => {
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };

    const confirmDeleteCoche = async () => {
        try {
            await cocheService.deleteCoche(id);
            setIsDeleteModalOpen(false);
            setAlertInfo({
                type: 'success',
                message: 'El anuncio ha sido eliminado correctamente'
            });

            setTimeout(() => {
                navigate('/user/mis-anuncios');
            }, 2000);
        } catch (err) {
            console.error('Error al eliminar el coche:', err);
            setAlertInfo({
                type: 'error',
                message: 'Error al eliminar el anuncio. Por favor, inténtalo de nuevo.'
            });
            setIsDeleteModalOpen(false);
        }
    };

    const openDocumentDeleteModal = (documento) => {
        setDocumentToDelete(documento);
        setIsDocumentDeleteModalOpen(true);
    };

    const closeDocumentDeleteModal = () => {
        setDocumentToDelete(null);
        setIsDocumentDeleteModalOpen(false);
    };

    const confirmDeleteDocument = async () => {
        if (!documentToDelete) return;

        try {
            setAlertInfo({
                type: 'info',
                message: 'Eliminando documento...'
            });

            await cocheService.removeDocument(coche.id, documentToDelete.id);

            const updatedCoche = await cocheService.getCocheById(id);
            setCoche(updatedCoche);

            setAlertInfo({
                type: 'success',
                message: 'Documento eliminado correctamente'
            });

            closeDocumentDeleteModal();
        } catch (err) {
            console.error('Error al eliminar documento:', err);
            setAlertInfo({
                type: 'error',
                message: 'Error al eliminar el documento'
            });
            closeDocumentDeleteModal();
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        {/* Carrusel */}
                        <div className="h-96 bg-secondary-light dark:bg-secondary-dark rounded-lg mb-4"></div>
                        <div className="flex space-x-2 mb-8">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 w-20 bg-secondary-light dark:bg-secondary-dark rounded"></div>
                            ))}
                        </div>

                        {/* Títulos y datos */}
                        <div className="h-8 bg-secondary-light dark:bg-secondary-dark rounded w-3/4 mb-4"></div>
                        <div className="h-6 bg-secondary-light dark:bg-secondary-dark rounded w-1/4 mb-8"></div>

                        {/* Especificaciones */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[...Array(8)].map((_, i) => (
                                <div key={i}>
                                    <div className="h-4 bg-secondary-light dark:bg-secondary-dark rounded w-20 mb-2"></div>
                                    <div className="h-6 bg-secondary-light dark:bg-secondary-dark rounded w-24"></div>
                                </div>
                            ))}
                        </div>

                        {/* Descripción */}
                        <div className="h-40 bg-secondary-light dark:bg-secondary-dark rounded mb-8"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !coche) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-error/10 text-error p-4 rounded-lg mb-4">
                        {error || 'No se encontró información del coche'}
                    </div>
                    <Link to="/coches" className="text-primary hover:underline">
                        ← Volver a la búsqueda
                    </Link>
                </div>
            </Layout>
        );
    }

    const canEdit = isAuthenticated && (user.id === coche.id_usuario || hasRole('admin'));

    const baseImageUrl = import.meta.env.PROD
        ? 'https://josefa25.iesmontenaranco.com:8000'
        : 'http://localhost:8000';

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Alerta de información */}
                {alertInfo && (
                    <Alert
                        type={alertInfo.type}
                        message={alertInfo.message}
                        onClose={() => setAlertInfo(null)}
                        className="mb-4"
                    />
                )}

                {/* Breadcrumbs */}
                <div className="text-sm text-text-secondary dark:text-text-secondary mb-6">
                    <Link to="/" className="hover:text-primary font-semibold">Inicio</Link> {' > '}
                    <Link to="/coches" className="hover:text-primary font-semibold">Explorar coches</Link> {' > '}
                    <span className="text-primary font-semibold">
                        {coche.marca?.nombre} {coche.modelo?.nombre}
                    </span>
                </div>

                {/* 1. Carrusel de imágenes */}
                <div className="mb-8 relative">
                    {/* Imagen principal */}
                    <div className="relative h-136 bg-background-light dark:bg-primary-dark rounded-lg overflow-hidden">
                        {coche.imagenes && coche.imagenes.length > 0 ? (
                            <img
                                src={`${baseImageUrl}/${coche.imagenes[activeImageIndex]?.ruta}`}
                                alt={`${coche.marca?.nombre} ${coche.modelo?.nombre}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary-light dark:bg-secondary-dark text-text-secondary">
                                No hay imágenes disponibles
                            </div>
                        )}

                        {/* Distintivo de verificado */}
                        {coche.verificado && (
                            <div className="absolute top-4 left-4 bg-success/90 text-text-light px-3 py-1 rounded-md flex items-center text-sm font-semibold">
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Verificado
                            </div>
                        )}

                        {/* Botones de navegación */}
                        {coche.imagenes && coche.imagenes.length > 1 && (
                            <>
                                <button
                                    onClick={() => changeImage('prev')}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                                    aria-label="Imagen anterior"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => changeImage('next')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                                    aria-label="Imagen siguiente"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                {/* Contador de imágenes */}
                                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
                                    {activeImageIndex + 1} / {coche.imagenes.length}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Miniaturas de imágenes */}
                    {coche.imagenes && coche.imagenes.length > 1 && (
                        <div className="flex mt-2 space-x-2 overflow-x-auto pb-2">
                            {coche.imagenes.map((imagen, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`h-20 w-20 rounded overflow-hidden flex-shrink-0 ${index === activeImageIndex
                                        ? 'ring-2 ring-primary'
                                        : 'opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={`${baseImageUrl}/${imagen.ruta}`}
                                        alt={`${coche.marca?.nombre} ${coche.modelo?.nombre} - Vista ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Información Principal */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h1 className="text-3xl font-bold !text-text-dark mb-1">
                                {coche.marca?.nombre} {coche.modelo?.nombre}
                            </h1>
                            <p className="text-text-secondary dark:text-text-secondary">
                                {coche.provincia?.nombre} · {coche.anio} · {coche.kilometraje.toLocaleString()} km
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <div className="text-3xl font-bold text-primary">
                                {formatPrice(Number(coche.precio))}
                            </div>
                        </div>
                    </div>

                    {/* Estado vendido */}
                    {coche.vendido != false && (
                        <div className="mt-4 bg-warning/10 border border-warning/30 text-warning rounded-md px-4 py-3 flex items-center">
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Este coche ya ha sido vendido</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna principal (2/3) */}
                    <div className="lg:col-span-2">
                        {/* 3. Datos Técnicos */}
                        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-6">
                                Datos técnicos
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6">
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary text-sm mb-1">Marca</p>
                                    <p className="font-medium text-text-dark dark:text-text-light">{coche.marca?.nombre || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary text-sm mb-1">Modelo</p>
                                    <p className="font-medium text-text-dark dark:text-text-light">{coche.modelo?.nombre || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary text-sm mb-1">Carrocería</p>
                                    <p className="font-medium text-text-dark dark:text-text-light">{coche.categoria?.nombre || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary text-sm mb-1">Provincia</p>
                                    <p className="font-medium text-text-dark dark:text-text-light">{coche.provincia?.nombre || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary text-sm mb-1">Año</p>
                                    <p className="font-medium text-text-dark dark:text-text-light">{coche.anio || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary text-sm mb-1">Kilómetros</p>
                                    <p className="font-medium text-text-dark dark:text-text-light">{coche.kilometraje ? coche.kilometraje.toLocaleString() + ' km' : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary text-sm mb-1">Combustible</p>
                                    <p className="font-medium text-text-dark dark:text-text-light">{coche.combustible || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary text-sm mb-1">Transmisión</p>
                                    <p className="font-medium text-text-dark dark:text-text-light">{coche.transmision || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary text-sm mb-1">Color</p>
                                    <p className="font-medium text-text-dark dark:text-text-light">{coche.color || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary text-sm mb-1">Puertas</p>
                                    <p className="font-medium text-text-dark dark:text-text-light">{coche.puertas || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary text-sm mb-1">Plazas</p>
                                    <p className="font-medium text-text-dark dark:text-text-light">{coche.plazas || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary text-sm mb-1">Potencia</p>
                                    <p className="font-medium text-text-dark dark:text-text-light">{coche.potencia ? `${coche.potencia} CV` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary text-sm mb-1">Fecha publicación</p>
                                    <p className="font-medium text-text-dark dark:text-text-light">{coche.fecha_publicacion ? formatDate(coche.fecha_publicacion) : '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* 4. Descripción */}
                        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-4">
                                Descripción
                            </h2>
                            <div className="prose prose-sm max-w-none text-text-dark dark:text-text-light">
                                {coche.descripcion ? (
                                    <p style={{ whiteSpace: 'pre-line' }}>{coche.descripcion}</p>
                                ) : (
                                    <p className="text-text-secondary">No hay descripción disponible para este vehículo.</p>
                                )}
                            </div>
                        </div>

                        {/* 5. Documentos adjuntos */}
                        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-4">
                                Documentos
                            </h2>

                            {/* Subida de documentos (solo para el propietario o admin) */}
                            {canEdit && !coche.vendido && (
                                <div className="mb-6 border-b pb-4 border-secondary-light dark:border-secondary-dark">
                                    <h3 className="text-md font-semibold text-text-dark dark:text-text-light mb-3">
                                        Añadir documento
                                    </h3>
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    const formData = new FormData();
                                                    formData.append('documento', e.target.files[0]);

                                                    setAlertInfo({
                                                        type: 'info',
                                                        message: 'Subiendo documento...'
                                                    });

                                                    cocheService.addDocument(coche.id, formData)
                                                        .then(() => {
                                                            // Actualizar el coche para mostrar el nuevo documento
                                                            cocheService.getCocheById(id).then(updatedCoche => {
                                                                setCoche(updatedCoche);
                                                                setAlertInfo({
                                                                    type: 'success',
                                                                    message: 'Documento añadido correctamente'
                                                                });

                                                                // Limpiar el input de archivo
                                                                e.target.value = '';
                                                            });
                                                        })
                                                        .catch(err => {
                                                            console.error('Error al subir documento:', err);
                                                            setAlertInfo({
                                                                type: 'error',
                                                                message: 'Error al subir el documento. Inténtalo de nuevo.'
                                                            });
                                                        });
                                                }
                                            }}
                                            className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 focus:outline-none cursor-pointer"
                                        />
                                        <div className="text-xs text-text-secondary dark:text-text-secondary">
                                            Formatos aceptados: PDF, DOC, DOCX (máx. 10MB)
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Lista de documentos */}
                            {coche.documentos && coche.documentos.length > 0 ? (
                                <div className="space-y-3">
                                    {coche.documentos.map((documento, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 rounded-md bg-background dark:bg-primary-dark/50 hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors"
                                        >
                                            <a
                                                href={`${baseImageUrl}/${documento.ruta}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center flex-1"
                                            >
                                                {/* Icono según tipo */}
                                                <div className="h-9 w-9 flex items-center justify-center rounded-md bg-primary/10 text-primary mr-3">
                                                    {documento.tipo === 'pdf' ? (
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                                            <path d="M3 8a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                                        </svg>
                                                    ) : documento.tipo === 'doc' || documento.tipo === 'docx' ? (
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-text-dark dark:text-text-light">{documento.descripcion || `Documento ${index + 1}`}</p>
                                                    <p className="text-xs text-text-secondary dark:text-text-secondary">{documento.tipo.toUpperCase()} - Haz clic para ver</p>
                                                </div>
                                            </a>

                                            {/* Botón eliminar documento (solo para propietario o admin) */}
                                            {canEdit && !coche.vendido && (
                                                <button
                                                    onClick={() => openDocumentDeleteModal(documento)}
                                                    className="text-error hover:text-error-dark p-1 rounded-full hover:bg-error/10 transition-colors ml-2"
                                                    aria-label="Eliminar documento"
                                                >
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-text-secondary dark:text-text-secondary">
                                        No hay documentos adjuntos para este vehículo.
                                    </p>
                                    {canEdit && !coche.vendido && (
                                        <p className="text-sm text-primary mt-2">
                                            Puedes añadir documentos como ficha técnica, historial de mantenimiento, etc.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Columna lateral (1/3) */}
                    <div>
                        {/* 6. Información del vendedor */}
                        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-bold text-text-dark dark:text-text-light mb-4">
                                Información del vendedor
                            </h2>
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-text-dark dark:text-text-light">{coche.usuario?.name || 'Usuario'}</p>
                                    <p className="text-sm text-text-secondary dark:text-text-secondary">
                                        {coche.usuario?.email && isAuthenticated
                                            ? coche.usuario.email
                                            : 'Contacta para más información'}
                                    </p>
                                    <p className="text-sm text-text-secondary dark:text-text-secondary">
                                        {coche.usuario?.telefono && isAuthenticated
                                            ? coche.usuario.telefono
                                            : 'Contacta para más información'}
                                    </p>
                                </div>
                            </div>

                            {/* Botones de acción para interactuar con el vendedor */}
                            {isAuthenticated ? (
                                <>
                                    <ChatButton
                                        coche={coche}
                                        className="mb-3 w-full"
                                    />
                                    <Button
                                        variant={isFavorite ? "secondary" : "outline"}
                                        fullWidth
                                        className="mb-3 flex items-center justify-center"
                                        onClick={toggleFavorite}
                                        disabled={loadingFavorito}
                                    >
                                        <svg className="h-5 w-5 mr-2" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        {isFavorite ? 'Guardado en favoritos' : 'Guardar en favoritos'}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={() => navigate('/login')}
                                >
                                    Inicia sesión para contactar
                                </Button>
                            )}

                        {/* 7. Acciones disponibles (solo para propietario o admin) */}
                        {canEdit && (
                            <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6 mb-6">
                                <h2 className="text-lg font-bold text-text-dark dark:text-text-light mb-4">
                                    Gestión del anuncio
                                </h2>
                                <div className="space-y-3">
                                    <Button
                                        variant="primary"
                                        className='flex items-center justify-center'
                                        fullWidth
                                        onClick={() => navigate(`/vendedor/editar/${id}`)}
                                    >
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Editar anuncio
                                    </Button>

                                    {!coche.vendido && (
                                        <Button
                                            variant="success"
                                            className='flex items-center justify-center'
                                            fullWidth
                                            onClick={handleMarkAsSold}
                                        >
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Marcar como vendido
                                        </Button>
                                    )}

                                    <Button
                                        variant="danger"
                                        fullWidth
                                        className='flex items-center justify-center'
                                        onClick={openDeleteModal}
                                    >
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Eliminar anuncio
                                    </Button>
                                </div>

                                {/* Estados del anuncio */}
                                <div className="mt-4 pt-4 border-t border-secondary-light dark:border-secondary-dark">
                                    <h3 className="text-sm font-medium text-text-dark dark:text-text-light mb-3">Estado del anuncio</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-text-secondary dark:text-text-secondary">Publicado</span>
                                            <span className="inline-flex items-center text-xs font-medium bg-success/10 text-success px-2 py-1 rounded-full">
                                                Activo
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-text-secondary dark:text-text-secondary">Verificado</span>
                                            <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${coche.verificado
                                                ? 'bg-success/10 text-success'
                                                : 'bg-text-secondary/10 text-text-secondary'
                                                }`}>
                                                {coche.verificado ? 'Sí' : 'No'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-text-secondary dark:text-text-secondary">Destacado</span>
                                            <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${coche.destacado
                                                ? 'bg-warning/10 text-warning'
                                                : 'bg-text-secondary/10 text-text-secondary'
                                                }`}>
                                                {coche.destacado ? 'Sí' : 'No'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-text-secondary dark:text-text-secondary">Vendido</span>
                                            <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${coche.vendido
                                                ? 'bg-error/10 text-error'
                                                : 'bg-text-secondary/10 text-text-secondary'
                                                }`}>
                                                {coche.vendido ? 'Sí' : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 8. Recomendaciones */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-text-dark dark:text-text-light mb-6">
                        Anuncios similares
                    </h2>

                    {loadingRecomendados ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md overflow-hidden animate-pulse">
                                    <div className="h-40 bg-secondary-light dark:bg-secondary-dark"></div>
                                    <div className="p-4">
                                        <div className="h-4 bg-secondary-light dark:bg-secondary-dark rounded w-3/4 mb-2"></div>
                                        <div className="h-6 bg-secondary-light dark:bg-secondary-dark rounded w-1/2 mb-2"></div>
                                        <div className="h-4 bg-secondary-light dark:bg-secondary-dark rounded w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : cochesRecomendados.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {cochesRecomendados.map(coche => (
                                <Link
                                    key={coche.id}
                                    to={`/coches/${coche.id}`}
                                    className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="h-40 relative">
                                        {coche.imagenes && coche.imagenes.length > 0 ? (
                                            <img
                                                src={`${baseImageUrl}/${coche.imagenes[0].ruta}`}
                                                alt={`${coche.marca.nombre} ${coche.modelo.nombre}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-secondary-light dark:bg-secondary-dark text-text-secondary">
                                                Sin imagen
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 right-2 bg-primary text-white text-sm font-bold px-2 py-1 rounded">
                                            {formatPrice(coche.precio)}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-text-dark dark:text-text-light mb-1 truncate">
                                            {coche.marca.nombre} {coche.modelo.nombre}
                                        </h3>
                                        <div className="text-sm text-text-secondary dark:text-text-secondary flex items-center">
                                            <span>{coche.anio}</span>
                                            <span className="mx-1">•</span>
                                            <span>{coche.kilometraje.toLocaleString()} km</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-background-light dark:bg-primary-dark rounded-lg">
                            <p className="text-text-secondary dark:text-text-secondary">
                                No se encontraron anuncios similares.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal para confirmar eliminación de anuncio */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                title="Confirmar eliminación"
                confirmAction={confirmDeleteCoche}
                confirmText="Eliminar"
                cancelText="Cancelar"
            >
                <p className="mb-4">¿Estás seguro que deseas eliminar este anuncio? Esta acción no se puede deshacer.</p>
                {coche && (
                    <div className="p-3 bg-secondary-light dark:bg-secondary-dark rounded-md border border-secondary-light dark:border-secondary-dark">
                        <p className="font-semibold text-text-dark dark:text-text-light">
                            {coche.marca?.nombre} {coche.modelo?.nombre} ({coche.anio})
                        </p>
                    </div>
                )}
            </Modal>

            {/* Modal para confirmar eliminación de documento */}
            <Modal
                isOpen={isDocumentDeleteModalOpen}
                onClose={closeDocumentDeleteModal}
                title="Confirmar eliminación de documento"
                confirmAction={confirmDeleteDocument}
                confirmText="Eliminar"
                cancelText="Cancelar"
            >
                <p className="mb-4">¿Estás seguro que deseas eliminar este documento? Esta acción no se puede deshacer.</p>
                {documentToDelete && (
                    <div className="p-3 bg-secondary-light dark:bg-secondary-dark rounded-md border border-secondary-light dark:border-secondary-dark">
                        <p className="font-semibold text-text-dark dark:text-text-light">
                            {documentToDelete.descripcion || `Documento ${documentToDelete.id}`}
                        </p>
                        <p className="text-xs text-text-secondary dark:text-text-secondary mt-1">
                            Tipo: {documentToDelete.tipo?.toUpperCase() || 'Desconocido'}
                        </p>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default CarDetail;
