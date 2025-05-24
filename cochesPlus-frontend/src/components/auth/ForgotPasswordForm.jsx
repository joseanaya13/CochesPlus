import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const ForgotPasswordForm = ({ onSubmit, loading = false, error = null, success = null }) => {
    const [email, setEmail] = useState('');
    const [formError, setFormError] = useState('');

    const validateForm = () => {
        if (!email.trim()) {
            setFormError('El email es obligatorio');
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setFormError('Email no válido');
            return false;
        }

        setFormError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                await onSubmit({ email });
            } catch (err) {
                console.error('Error al enviar recuperación:', err);
            }
        }
    };

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">
                    Recuperar Contraseña
                </h2>
                <p className="mt-1">
                    Introduce tu email y te enviaremos un enlace para restablecer tu contraseña
                </p>
            </div>

            {error && (
                <Alert
                    type="error"
                    message={error}
                    className="mb-4 animate-fade"
                />
            )}

            {success && (
                <Alert
                    type="success"
                    message={success}
                    className="mb-4 animate-fade"
                />
            )}

            <form onSubmit={handleSubmit} className="animate-fade">
                <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    error={formError}
                />

                <Button
                    type="submit"
                    variant="secondary"
                    isLoading={loading}
                    fullWidth
                >
                    Enviar enlace de recuperación
                </Button>
            </form>

            <div className="text-center mt-4">
                <p className="text-sm">
                    ¿Recordaste tu contraseña?{' '}
                    <Link to="/login" className="">
                        Volver al inicio de sesión
                    </Link>
                </p>
            </div>
        </div>
    );
};

ForgotPasswordForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    error: PropTypes.string,
    success: PropTypes.string
};

export default ForgotPasswordForm;
