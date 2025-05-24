import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const CarCardProfile = ({ coche, onDelete }) => {
    return (
        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md overflow-hidden border border-secondary-light dark:border-secondary-dark hover-lift">
            <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-sm bg-secondary-light dark:bg-secondary-dark">
                    {coche.imagenes && coche.imagenes.length > 0 ? (
                        <img
                            src={`${import.meta.env.PROD
                                ? 'https://josefa25.iesmontenaranco.com:8000'
                                : 'http://localhost:8000'}/${coche.imagenes[0].ruta}`}
                            alt={`${coche.marca.nombre} ${coche.modelo.nombre}`}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full w-full bg-secondary-light dark:bg-secondary-dark">
                            <svg className="h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="p-4 md:p-6 flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                            <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-2">
                                {coche.marca.nombre} {coche.modelo.nombre}
                            </h2>
                            <div className="flex items-center text-sm text-secondary dark:text-text-secondary mb-2">
                                <span className="mr-2">{coche.anio}</span>
                                <span className="mr-2">•</span>
                                <span className="mr-2">{coche.kilometraje.toLocaleString()} km</span>
                                <span className="mr-2">•</span>
                                <span>{coche.combustible}</span>
                            </div>
                            <div className="text-text-dark dark:text-text-secondary mb-4 line-clamp-2">
                                {coche.descripcion || "Sin descripción"}
                            </div>
                            <div className="flex items-center text-sm text-secondary dark:text-text-secondary">
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{coche.provincia.nombre}</span>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col items-end">
                            <div className="text-2xl font-bold text-primary dark:text-primary mb-2">
                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(coche.precio)}
                            </div>
                            <div className="flex space-x-2 mt-2">
                                <Link to={`/coches/${coche.id}`} className="px-3 py-1 bg-secondary-light hover:bg-secondary-light dark:bg-secondary-dark dark:hover:bg-secondary-dark hover:opacity-90 rounded-md text-sm font-medium text-text-dark dark:text-text-light">
                                    Ver
                                </Link>
                                <Link to={`/vendedor/editar/${coche.id}`} className="px-3 py-1 bg-primary-light hover:opacity-90 dark:bg-primary dark:bg-opacity-30 dark:hover:bg-opacity-40 rounded-md text-sm font-medium text-primary dark:text-primary-light">
                                    Editar
                                </Link>
                                <button
                                    onClick={() => onDelete(coche.id)}
                                    className="px-3 py-1 bg-error bg-opacity-10 hover:bg-opacity-20 dark:bg-error dark:bg-opacity-30 dark:hover:bg-opacity-40 rounded-md text-sm font-medium text-text-light dark:text-text-light"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

CarCardProfile.propTypes = {
    coche: PropTypes.shape({
        id: PropTypes.number.isRequired,
        marca: PropTypes.shape({
            nombre: PropTypes.string.isRequired
        }).isRequired,
        modelo: PropTypes.shape({
            nombre: PropTypes.string.isRequired
        }).isRequired,
        anio: PropTypes.number,
        kilometraje: PropTypes.number,
        combustible: PropTypes.string,
        precio: PropTypes.number.isRequired,
        provincia: PropTypes.shape({
            nombre: PropTypes.string
        }),
        descripcion: PropTypes.string,
        imagenes: PropTypes.arrayOf(
            PropTypes.shape({
                ruta: PropTypes.string
            })
        )
    }).isRequired,
    onDelete: PropTypes.func.isRequired
};

export default CarCardProfile;