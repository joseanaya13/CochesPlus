import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import cocheService from '../../services/CocheService';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

const VerifyDocuments = () => {
    const [coches, setCoches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertInfo, setAlertInfo] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    // Estados para filtros
    const [filtro, setFiltro] = useState('no-verificados');

    useEffect(() => {
        fetchCoches();
    }, [filtro]);

    const fetchCoches = async () => {
        try {
            setLoading(true);
            // Obtener todos los coches con sus documentos
            const params = {};

            // Filtrar según selección
            if (filtro === 'no-verificados') {
                params.verificado = 'false';
            } else if (filtro === 'verificados') {
                params.verificado = 'true';
            }

            const response = await cocheService.getAllCoches(params);

            // Filtrar coches que tienen documentos
            let cochesConDocumentos = response.data.filter(coche =>
                coche.documentos && coche.documentos.length > 0
            );

            setCoches(cochesConDocumentos);
            setError(null);
        } catch (err) {
            console.error('Error al cargar los coches con documentos:', err);
            setError('Error al cargar los coches. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerificarCoche = async (id, verificado) => {
        try {
            setProcessingId(id);
            setAlertInfo(null);

            await cocheService.verificarCoche(id, verificado);

            // Actualizar la lista
            fetchCoches();

            setAlertInfo({
                type: 'success',
                message: verificado
                    ? 'Coche verificado correctamente'
                    : 'Se ha removido la verificación del coche'
            });
        } catch (err) {
            console.error('Error al verificar el coche:', err);
            setAlertInfo({
                type: 'error',
                message: 'Error al actualizar el estado del coche'
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handleFiltroChange = (e) => {
        setFiltro(e.target.value);
    };

    const baseImageUrl = import.meta.env.PROD
        ? 'https://josefa25.iesmontenaranco.com:8000'
        : 'http://localhost:8000';

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold !text-text-dark">
                        Verificación de Documentos
                    </h1>

                    <div className="flex items-center space-x-4">
                        <label htmlFor="filtro" className="text-sm text-text-dark dark:text-text-secondary">
                            Filtrar por:
                        </label>
                        <select
                            id="filtro"
                            className="text-text-dark dark:text-text-light bg-background-light dark:bg-primary-dark border border-secondary-light dark:border-secondary-dark rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={filtro}
                            onChange={handleFiltroChange}
                        >
                            <option value="verificados">Verificados</option>
                            <option value="no-verificados">No verificados</option>
                        </select>
                    </div>
                </div>

                {alertInfo && (
                    <Alert
                        type={alertInfo.type}
                        message={alertInfo.message}
                        onClose={() => setAlertInfo(null)}
                        className="mb-4"
                    />
                )}

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-4">
                                <div className="h-5 bg-secondary-light dark:bg-secondary-dark rounded w-1/4 mb-3"></div>
                                <div className="h-20 bg-secondary-light dark:bg-secondary-dark rounded mb-3"></div>
                                <div className="h-8 bg-secondary-light dark:bg-secondary-dark rounded w-1/3"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-error/10 text-error p-4 rounded-lg mb-4">
                        {error}
                    </div>
                ) : coches.length > 0 ? (
                    <div className="space-y-6">
                        {coches.map(coche => (
                            <div
                                key={coche.id}
                                className={`bg-background-light dark:bg-primary-dark rounded-lg shadow-md overflow-hidden ${coche.verificado ? 'border-l-4 border-success' : ''
                                    }`}
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-text-dark dark:text-text-light">
                                                {coche.marca?.nombre} {coche.modelo?.nombre} ({coche.anio})
                                            </h2>
                                            <p className="text-text-secondary dark:text-text-secondary mt-1">
                                                ID: {coche.id} - Publicado: {formatDate(coche.fecha_publicacion)}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {coche.verificado && (
                                                    <span className="bg-success/10 text-success text-xs font-medium px-2 py-1 rounded">
                                                        Verificado
                                                    </span>
                                                )}
                                                {coche.vendido && (
                                                    <span className="bg-warning/10 text-warning text-xs font-medium px-2 py-1 rounded">
                                                        Vendido
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 md:mt-0 flex items-center">
                                            <Link
                                                to={`/coches/${coche.id}`}
                                                className="text-primary underline text-sm mr-4"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Ver anuncio
                                            </Link>

                                            {coche.verificado ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleVerificarCoche(coche.id, false)}
                                                    disabled={processingId === coche.id}
                                                >
                                                    Quitar verificación
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => handleVerificarCoche(coche.id, true)}
                                                    disabled={processingId === coche.id}
                                                >
                                                    Verificar coche
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-medium text-text-dark dark:text-text-light mt-6 mb-3">
                                        Documentos ({coche.documentos?.length || 0})
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {coche.documentos?.map((doc, idx) => (
                                            <div
                                                key={doc.id}
                                                className="border border-secondary-light dark:border-secondary-dark rounded-lg p-3"
                                            >
                                                <div className="flex items-center mb-2">
                                                    <div className="h-9 w-9 flex items-center justify-center rounded-md bg-primary/10 text-primary mr-3">
                                                        {doc.tipo === 'pdf' ? (
                                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                                                <path d="M3 8a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                                            </svg>
                                                        ) : doc.tipo === 'doc' || doc.tipo === 'docx' ? (
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
                                                        <p className="font-medium text-text-dark dark:text-text-light">
                                                            {doc.descripcion || `Documento ${idx + 1}`}
                                                        </p>
                                                        <p className="text-xs text-text-secondary dark:text-text-secondary">
                                                            {doc.tipo.toUpperCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <a
                                                        href={`${baseImageUrl}/${doc.ruta}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-primary hover:underline flex items-center"
                                                    >
                                                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        Ver documento
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-8 text-center">
                        <p className="text-text-secondary dark:text-text-secondary text-lg">
                            No hay coches con documentos {filtro === 'no-verificados' ? 'por verificar' : 'verificados'}.
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default VerifyDocuments;
