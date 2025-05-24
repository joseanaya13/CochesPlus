import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import InputField from '../common/InputField';

const PasswordForm = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.current_password) {
            newErrors.current_password = 'La contraseña actual es obligatoria';
        }

        if (!formData.password) {
            newErrors.password = 'La nueva contraseña es obligatoria';
        } else if (formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            onSubmit(formData);

            // Limpiar formulario tras envío exitoso
            setFormData({
                current_password: '',
                password: '',
                password_confirmation: ''
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade">
            <InputField
                label="Contraseña actual"
                type="password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                disabled={loading}
                error={errors.current_password}
                required
            />

            <InputField
                label="Nueva contraseña"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                error={errors.password}
                helperText={!errors.password ? "La contraseña debe tener al menos 8 caracteres." : null}
                required
            />

            <InputField
                label="Confirmar nueva contraseña"
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                disabled={loading}
                error={errors.password_confirmation}
                required
            />

            <div>
                <Button
                    type="submit"
                    isLoading={loading}
                    className="mt-2"
                >
                    Cambiar contraseña
                </Button>
            </div>
        </form>
    );
};

PasswordForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool
};

export default PasswordForm;
