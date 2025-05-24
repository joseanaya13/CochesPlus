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
    ...props
}) => {
    return (
        <div className="mb-4">
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
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    className={`
                        w-full px-3 py-3 
                        bg-background-light dark:bg-primary-dark 
                        border border-primary-dark dark:border-primary-light 
                        text-text-dark dark:text-text-light 
                        rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition-all duration-200
                        ${error ? 'border-error focus:border-error focus:ring-error' : ''}
                        ${className}
                    `}
                    {...props}
                >
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            {error && (
                <p className="mt-1 text-sm text-error animate-slide-up">{error}</p>
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
        })
    ).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    error: PropTypes.string,
    required: PropTypes.bool,
    className: PropTypes.string,
    disabled: PropTypes.bool,
};

export default SelectField;
