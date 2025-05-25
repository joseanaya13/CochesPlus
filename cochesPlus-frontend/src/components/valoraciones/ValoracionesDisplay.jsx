import React from 'react';
import PropTypes from 'prop-types';

const ValoracionesDisplay = ({
    valoraciones = [],
    estadisticas = null,
    loading = false,
    showCompact = false
}) => {
    const renderStars = (puntuacion, size = 'text-base') => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`${size} ${i <= puntuacion ? 'text-warning' : 'text-gray-300 dark:text-gray-600'
                        }`}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    const renderDistribucion = (distribucion) => {
        const total = Object.values(distribucion).reduce((sum, count) => sum + count, 0);

        return (
            <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                    const count = distribucion[rating] || 0;
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    return (
                        <div key={rating} className="flex items-center space-x-2 text-sm">
                            <span className="w-3 text-text-secondary dark:text-text-secondary">{rating}</span>
                            <span className="text-warning">★</span>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-warning h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <span className="w-8 text-xs text-text-secondary dark:text-text-secondary text-right">
                                {count}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {/* Skeleton para estadísticas */}
                <div className="bg-background-light dark:bg-primary-dark rounded-lg p-4">
                    <div className="animate-pulse">
                        <div className="h-4 bg-secondary-light dark:bg-secondary-dark rounded w-32 mb-2"></div>
                        <div className="h-6 bg-secondary-light dark:bg-secondary-dark rounded w-24 mb-4"></div>
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-2 bg-secondary-light dark:bg-secondary-dark rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Skeleton para valoraciones */}
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-background-light dark:bg-primary-dark rounded-lg p-4">
                        <div className="animate-pulse">
                            <div className="h-4 bg-secondary-light dark:bg-secondary-dark rounded w-24 mb-2"></div>
                            <div className="h-4 bg-secondary-light dark:bg-secondary-dark rounded w-full mb-2"></div>
                            <div className="h-4 bg-secondary-light dark:bg-secondary-dark rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!valoraciones.length && !loading) {
        return (
            <div className="text-center py-8">
                <div className="text-text-secondary dark:text-text-secondary mb-4">
                    <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-text-dark dark:text-text-light mb-2">
                    Sin valoraciones aún
                </h3>
                <p className="text-text-secondary dark:text-text-secondary">
                    Este vendedor aún no ha recibido valoraciones de compradores.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Estadísticas generales */}
            {estadisticas && !showCompact && (
                <div className="bg-background-light dark:bg-primary-dark rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text-dark dark:text-text-light mb-4">
                        Resumen de valoraciones
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Promedio y total */}
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">
                                {estadisticas.promedio}
                            </div>
                            <div className="flex justify-center mb-2">
                                {renderStars(Math.round(estadisticas.promedio), 'text-xl')}
                            </div>
                            <p className="text-text-secondary dark:text-text-secondary">
                                Basado en {estadisticas.total} valoracion{estadisticas.total !== 1 ? 'es' : ''}
                            </p>
                        </div>

                        {/* Distribución de estrellas */}
                        <div>
                            <h4 className="font-medium text-text-dark dark:text-text-light mb-3">
                                Distribución de puntuaciones
                            </h4>
                            {renderDistribucion(estadisticas.distribucion)}
                        </div>
                    </div>
                </div>
            )}

            {/* Resumen compacto */}
            {estadisticas && showCompact && (
                <div className="flex items-center space-x-3 p-3 bg-background-light dark:bg-primary-dark rounded-lg">
                    <div className="flex items-center space-x-1">
                        {renderStars(Math.round(estadisticas.promedio))}
                    </div>
                    <span className="font-medium text-text-dark dark:text-text-light">
                        {estadisticas.promedio}
                    </span>
                    <span className="text-text-secondary dark:text-text-secondary text-sm">
                        ({estadisticas.total} valoracion{estadisticas.total !== 1 ? 'es' : ''})
                    </span>
                </div>
            )}

            {/* Lista de valoraciones */}
            <div className="space-y-4">
                {!showCompact && (
                    <h3 className="text-lg font-semibold text-text-dark dark:text-text-light">
                        Valoraciones de compradores
                    </h3>
                )}

                {valoraciones.slice(0, showCompact ? 3 : valoraciones.length).map((valoracion) => (
                    <div
                        key={valoracion.id}
                        className="bg-background-light dark:bg-primary-dark rounded-lg p-4 border border-secondary-light dark:border-secondary-dark"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                {/* Avatar del comprador */}
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                        {valoracion.comprador.nombre.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-text-dark dark:text-text-light">
                                        {valoracion.comprador.nombre}
                                    </p>
                                    <p className="text-sm text-text-secondary dark:text-text-secondary">
                                        {valoracion.fecha}
                                    </p>
                                </div>
                            </div>

                            {/* Puntuación */}
                            <div className="flex items-center space-x-1">
                                {renderStars(valoracion.puntuacion)}
                            </div>
                        </div>

                        {/* Comentario */}
                        {valoracion.comentario && (
                            <div className="pl-13">
                                <p className="text-text-dark dark:text-text-light leading-relaxed">
                                    "{valoracion.comentario}"
                                </p>
                            </div>
                        )}
                    </div>
                ))}

                {/* Mostrar más valoraciones */}
                {showCompact && valoraciones.length > 3 && (
                    <div className="text-center">
                        <p className="text-text-secondary dark:text-text-secondary text-sm">
                            Y {valoraciones.length - 3} valoracion{valoraciones.length - 3 !== 1 ? 'es' : ''} más...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

ValoracionesDisplay.propTypes = {
    valoraciones: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        puntuacion: PropTypes.number.isRequired,
        comentario: PropTypes.string,
        fecha: PropTypes.string.isRequired,
        comprador: PropTypes.shape({
            nombre: PropTypes.string.isRequired
        }).isRequired
    })),
    estadisticas: PropTypes.shape({
        promedio: PropTypes.number.isRequired,
        total: PropTypes.number.isRequired,
        distribucion: PropTypes.object.isRequired
    }),
    loading: PropTypes.bool,
    showCompact: PropTypes.bool
};

export default ValoracionesDisplay;