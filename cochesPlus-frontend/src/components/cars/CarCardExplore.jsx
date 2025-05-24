import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice } from '../../utils/formatters';

const CarCardExplore = ({
    coche,
    onToggleFavorite = () => { },
    isFavorite = false
}) => {
    const { isAuthenticated } = useAuth();
    const imageUrl = coche.imagenes && coche.imagenes.length > 0
        ? `${import.meta.env.PROD
            ? 'https://josefa25.iesmontenaranco.com:8000'
            : 'http://localhost:8000'}/${coche.imagenes[0].ruta}`
        : '/images/placeholder-car.jpg';

    return (
        <div className="bg-background-light dark:bg-primary-dark rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover-lift">
            <Link to={`/coches/${coche.id}`} className="block relative">
                {/* Imagen principal */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={`${coche.marca.nombre} ${coche.modelo.nombre}`}
                        className="w-full h-full object-cover"
                    />

                    {/* Insignia verificado */}
                    {coche.verificado && (
                        <div className="absolute top-3 left-3 bg-success/90 text-text-light text-xs font-semibold px-2 py-1 rounded-md flex items-center">
                            <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Verificado
                        </div>
                    )}

                    {/* Provincia */}
                    <div className="absolute bottom-3 left-3 bg-primary-dark/80 dark:bg-primary/80 text-text-light text-xs px-2 py-1 rounded-md">
                        {coche.provincia?.nombre || 'España'}
                    </div>

                    {/* Precio */}
                    <div className="absolute bottom-3 right-3 bg-primary text-text-light font-bold px-3 py-1.5 rounded-md">
                        {formatPrice(Number(coche.precio))}
                    </div>
                </div>
            </Link>

            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        {/* Marca y modelo */}
                        <h3 className="text-lg font-bold text-text-dark dark:text-text-light truncate">
                            {coche.marca.nombre}
                        </h3>
                        <p className="text-text-dark dark:text-text-light truncate">
                            {coche.modelo.nombre}
                        </p>

                        {/* Características clave */}
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-secondary dark:text-text-secondary">
                            <div className="flex items-center">
                                <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                {coche.anio}
                            </div>
                            <div className="flex items-center">
                                <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                {coche.kilometraje.toLocaleString()} km
                            </div>
                            <div className="flex items-center">
                                <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {coche.combustible}
                            </div>
                        </div>
                    </div>

                    {/* Botón de favorito */}
                    {isAuthenticated && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onToggleFavorite(coche.id);
                            }}
                            className="mt-1 text-secondary dark:text-secondary-light hover:text-error dark:hover:text-error transition-colors duration-200"
                            aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                        >
                            {isFavorite ? (
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

CarCardExplore.propTypes = {
    coche: PropTypes.shape({
        id: PropTypes.number.isRequired,
        marca: PropTypes.shape({
            nombre: PropTypes.string.isRequired
        }).isRequired,
        modelo: PropTypes.shape({
            nombre: PropTypes.string.isRequired
        }).isRequired,
        anio: PropTypes.number.isRequired,
        kilometraje: PropTypes.number.isRequired,
        combustible: PropTypes.string.isRequired,
        precio: PropTypes.number.isRequired,
        provincia: PropTypes.shape({
            nombre: PropTypes.string.isRequired
        }),
        verificado: PropTypes.bool,
        imagenes: PropTypes.arrayOf(
            PropTypes.shape({
                ruta: PropTypes.string.isRequired
            })
        )
    }).isRequired,
    onToggleFavorite: PropTypes.func,
    isFavorite: PropTypes.bool
};

export default CarCardExplore;