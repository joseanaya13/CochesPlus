import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const ResetPasswordForm = ({ onSubmit, loading = false, error = null, token = '', email = '' }) => {
    const [formData, setFormData] = useState({
        token,
        email,
        password: '',
        password_confirmation: ''
    });

    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.password) {
            errors.password = 'La contraseña es obligatoria';
        } else if (formData.password.length < 8) {
            errors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (formData.password !== formData.password_confirmation) {
            errors.password_confirmation = 'Las contraseñas no coinciden';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                const resetData = {
                    token: formData.token,
                    email: formData.email,
                    password: formData.password,
                    password_confirmation: formData.password_confirmation
                };

                await onSubmit(resetData);
            } catch (err) {
                console.error('Error al restablecer contraseña:', err);
            }
        }
    };

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Restablecer Contraseña
                </h2>
                <p className="text-gray-600 mt-1">
                    Crea una nueva contraseña para tu cuenta
                </p>
            </div>

            {error && (
                <Alert
                    type="error"
                    message={error}
                    className="mb-4 animate-fade"
                />
            )}

            <form onSubmit={handleSubmit} className="animate-fade">
                <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    required
                    disabled={!!formData.email}
                    error={formErrors.email}
                />

                <InputField
                    label="Nueva Contraseña"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="********"
                    required
                    error={formErrors.password}
                />
                <p className="text-xs text-gray-500 mt-1 -mb-2">
                    La contraseña debe tener al menos 8 caracteres.
                </p>

                <InputField
                    label="Confirmar Contraseña"
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="********"
                    required
                    error={formErrors.password_confirmation}
                />

                <input type="hidden" name="token" value={formData.token} />

                <Button
                    type="submit"
                    variant="secondary"
                    isLoading={loading}
                    fullWidth
                >
                    Restablecer Contraseña
                </Button>
            </form>

            <div className="text-center mt-4">
                <p className="text-sm text-gray-600 ">
                    ¿Recordaste tu contraseña?{' '}
                    <Link to="/login" className="text-primary-600 hover:text-primary-500">
                        Volver al inicio de sesión
                    </Link>
                </p>
            </div>
        </div>
    );
};

ResetPasswordForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    error: PropTypes.string,
    token: PropTypes.string,
    email: PropTypes.string
};

export default ResetPasswordForm;
