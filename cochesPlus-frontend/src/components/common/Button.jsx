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
            case 'success':
                return 'bg-success text-text-light hover:bg-success/90 border border-success';
            case 'warning':
                return 'bg-warning text-text-dark hover:bg-warning/90 border border-warning';
            case 'error':
                return 'bg-error text-text-light hover:bg-error/90 border border-error';
            case 'danger':
                return 'bg-error text-text-light hover:bg-error/90 border border-error';
            case 'info':
                return 'bg-info text-text-light hover:bg-info/90 border border-info';
            case 'outline':
                return 'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white dark:hover:bg-primary-light dark:hover:text-text-dark';
            case 'link':
                return 'bg-transparent text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary border-none underline-offset-2 hover:underline';
            case 'secondary-light':
                return 'bg-secondary-light text-text-dark hover:bg-secondary border border-secondary-light dark:bg-secondary-dark dark:text-text-light dark:border-secondary-dark';
            case 'background-light':
                return 'bg-background-light text-text-dark border border-secondary-light hover:bg-secondary-light dark:bg-primary-dark dark:text-text-light dark:border-secondary-dark dark:hover:bg-secondary-dark';
            case 'background-dark':
                return 'bg-background-dark text-text-light border border-secondary-dark hover:bg-primary-dark dark:bg-background-light dark:text-text-dark dark:border-secondary-light dark:hover:bg-secondary-light';
            default:
                return 'bg-primary text-text-light hover:bg-primary-dark border border-primary';
        }
    };

    const baseClasses = 'py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 ease-in-out inline-flex items-center justify-center';
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
    variant: PropTypes.oneOf([
        'primary',
        'secondary',
        'primary-invert',
        'success',
        'warning',
        'error',
        'danger',
        'info',
        'outline',
        'link',
        'secondary-light',
        'background-light',
        'background-dark'
    ]),
    isLoading: PropTypes.bool,
    disabled: PropTypes.bool,
    fullWidth: PropTypes.bool,
    onClick: PropTypes.func,
    className: PropTypes.string
};

export default Button;


