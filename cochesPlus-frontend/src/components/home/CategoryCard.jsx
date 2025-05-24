import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const CategoryCard = ({ category }) => {
    const { name, icon, count } = category;

    return (
        <Link to={`/coches?categoria=${name}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center hover:shadow-lg duration-300 hover:-translate-y-1 transform transition border border-gray-100 dark:border-gray-700">
                <div className="text-4xl text-primary-500 dark:text-primary-400 mb-3">{icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{count} coches</p>
            </div>
        </Link>
    );
};

CategoryCard.propTypes = {
    category: PropTypes.shape({
        name: PropTypes.string.isRequired,
        icon: PropTypes.node.isRequired,
        count: PropTypes.number.isRequired
    }).isRequired
};

export default CategoryCard;
