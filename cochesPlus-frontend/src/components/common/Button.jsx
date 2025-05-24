import React from 'react';
import PropTypes from 'prop-types';
import Spinner from './Spinner'; 

const Button = ({
    children,
    type = 'button',
    variant,
    isLoading = false,
    disabled = false,
    fullWidth = false,
    onClick,
    className = '',
    ...props
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return 'bg-primary-dark text-text-light hover:bg-primary hover:text-text-light border border-primary-dark dark:bg-primary-light dark:hover:bg-primary dark:text-text-dark';
            case 'secondary':
                return 'bg-secondary hover:bg-secondary-dark text-text-light border border-primary-dark dark:bg-secondary dark:hover:bg-secondary-light dark:text-text-light dark:hover:text-text-dark';
            case 'primary-invert':
                return 'bg-primary-dark hover:bg-primary-dark hover:text-text-light text-text-light border border-primary-dark dark:bg-primary-dark dark:hover:bg-secondary-light dark:hover:text-text-dark dark:text-text-light dark:border-primary-light';
            default:
                return 'bg-primary text-text-light';
        }
    };

    const baseClasses = 'py-2 px-4 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out';
    const widthClasses = fullWidth ? 'w-full' : '';
    const disabledClasses = disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '';

    return (
        <button
            type={type}
            className={`${baseClasses} ${getVariantClasses()} ${widthClasses} ${disabledClasses} ${className}`}
            disabled={disabled || isLoading}
            onClick={onClick}
            {...props}
        >
            {isLoading ? (
                <Spinner />
            ) : (
                children
            )}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info', 'outline']),
    isLoading: PropTypes.bool,
    disabled: PropTypes.bool,
    fullWidth: PropTypes.bool,
    onClick: PropTypes.func,
    className: PropTypes.string
};

export default Button;


