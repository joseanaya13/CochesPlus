import React from 'react';
import PropTypes from 'prop-types';

const InputField = ({
  label,
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  icon,
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
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={name}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-2.5 
            ${icon ? 'pl-10' : 'pl-4'} 
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
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-error animate-slide-up">{error}</p>
      )}
    </div>
  );
};

InputField.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
  icon: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

export default InputField;
