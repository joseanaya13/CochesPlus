import React from 'react';
import PropTypes from 'prop-types';

const SelectField = ({
    label,
    name,
    options,
    value,
    onChange,
    error,
    required = false,
    className = '',
    disabled = false,
    icon,
    ...props
}) => {
    return (
        <div className={`mb-4 ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="block mb-2 text-sm font-medium text-text-dark dark:text-text-light"
                >
                    {label}
                    {required && <span className="text-error ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-text-secondary dark:text-text-secondary">
                            {icon}
                        </span>
                    </div>
                )}
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    className={`
                        w-full px-4 py-2.5 
                        ${icon ? 'pl-10' : 'pl-4'} 
                        pr-10
                        bg-background-light dark:bg-primary-dark 
                        border border-primary-dark dark:border-primary-light 
                        text-text-dark dark:text-text-light 
                        rounded-md 
                        appearance-none
                        cursor-pointer
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                        hover:border-primary dark:hover:border-primary-light
                        disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-secondary-light dark:disabled:bg-secondary-dark
                        transition-all duration-200
                        ${error ? 'border-error focus:border-error focus:ring-error' : ''}
                    `}
                    {...props}
                >
                    {options.map((option, index) => (
                        <option
                            key={index}
                            value={option.value}
                            disabled={option.disabled}
                            className="py-2 px-4 bg-background-light dark:bg-primary-dark text-text-dark dark:text-text-light"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Icono de flecha personalizado */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                        className={`h-5 w-5 text-text-secondary dark:text-text-secondary transition-transform duration-200 ${disabled ? 'opacity-50' : ''
                            }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>

                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 rounded-md pointer-events-none">
                    <div className={`
                        h-full w-full rounded-md opacity-0 
                        bg-gradient-to-r from-transparent via-primary/5 to-transparent 
                        hover:opacity-100 transition-opacity duration-300
                        ${disabled ? 'hover:opacity-0' : ''}
                    `} />
                </div>
            </div>

            {error && (
                <p className="mt-1 text-sm text-error animate-slide-up flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

SelectField.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
                .isRequired,
            label: PropTypes.string.isRequired,
            disabled: PropTypes.bool,
        })
    ).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    error: PropTypes.string,
    required: PropTypes.bool,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    icon: PropTypes.node,
};

export default SelectField;
