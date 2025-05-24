import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const CarCard = ({ car }) => {
    return (
        <Link to={`/coches/${car.id}`} className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                <div className="relative h-48 bg-gray-300 dark:bg-gray-700 overflow-hidden">
                    <img
                        src={car.image}
                        alt={car.title}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                    />
                    {car.verified && (
                        <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                            Verificado
                        </div>
                    )}
                    {car.featured && (
                        <div className="absolute top-2 left-2 bg-warning-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                            Destacado
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{car.title}</h3>
                    <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}</p>
                    <div className="mt-2 flex justify-between text-sm text-gray-600 dark:text-gray-300">
                        <span>{car.year} • {car.mileage.toLocaleString()} km</span>
                        <span>{car.location}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

CarCard.propTypes = {
    car: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        year: PropTypes.number.isRequired,
        mileage: PropTypes.number.isRequired,
        location: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
        verified: PropTypes.bool,
        featured: PropTypes.bool
    }).isRequired
};

export default CarCard;
