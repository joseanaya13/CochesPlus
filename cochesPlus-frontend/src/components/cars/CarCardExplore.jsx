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
                    <div className="absolute bottom-3 left-3 bg-primary-dark/80 dark:bg-primary/80 text-text-light text-xs px-2 py-1 rounded-md flex items-center">
                        <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
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
                    <div className="flex-1">
                        {/* Marca y modelo */}
                        <h3 className="text-lg font-bold text-text-dark dark:text-text-light truncate">
                            {coche.marca.nombre}
                        </h3>
                        <p className="text-text-dark dark:text-text-light truncate mb-3">
                            {coche.modelo.nombre}
                        </p>

                        {/* Características clave con iconos */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center text-xs text-secondary dark:text-text-secondary">
                                <svg className="h-4 w-4 mr-1.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium">{coche.anio}</span>
                            </div>

                            <div className="flex items-center text-xs text-secondary dark:text-text-secondary">
                                <svg className="h-4 w-4 mr-1.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="font-medium">{coche.kilometraje.toLocaleString()} km</span>
                            </div>

                            <div className="flex items-center text-xs text-secondary dark:text-text-secondary">
                                <svg className="h-4 w-4 mr-1.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                                </svg>
                                <span className="font-medium">{coche.combustible}</span>
                            </div>

                            <div className="flex items-center text-xs text-secondary dark:text-text-secondary">
                                <svg className="h-4 w-4 mr-1.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="font-medium">{coche.transmision}</span>
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
                            className="ml-2 mt-1 text-secondary dark:text-secondary-light hover:text-error dark:hover:text-error transition-colors duration-200 flex-shrink-0"
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
        transmision: PropTypes.string.isRequired,
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