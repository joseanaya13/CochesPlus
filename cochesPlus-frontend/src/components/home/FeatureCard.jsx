import React from 'react';
import PropTypes from 'prop-types';

const FeatureCard = ({ feature }) => {
    const { title, description, icon } = feature;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300 w-full h-full dark:border dark:border-gray-700">
            <div className="mb-4 text-primary-500 dark:text-primary-400">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
    );
};

FeatureCard.propTypes = {
    feature: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        icon: PropTypes.node.isRequired
    }).isRequired
};

export default FeatureCard;
