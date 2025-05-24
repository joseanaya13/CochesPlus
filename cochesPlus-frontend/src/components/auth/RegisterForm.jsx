import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Spinner from '../common/Spinner';

const RegisterForm = ({ onRegister, loading = false, error = null }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
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

        if (!formData.nombre.trim()) {
            errors.nombre = 'El nombre es obligatorio';
        }

        if (!formData.email.trim()) {
            errors.email = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email no válido';
        }

        if (formData.telefono && !/^[0-9]{9,15}$/.test(formData.telefono)) {
            errors.telefono = 'Formato de teléfono no válido';
        }

        if (formData.direccion && formData.direccion.length > 255) {
            errors.direccion = 'La dirección no puede exceder los 255 caracteres';
        }

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
                await onRegister(formData);
            } catch (err) {
                console.error('Error en registro:', err);
            }
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-info dark:from-primary dark:to-info">
                    Crear cuenta
                </h2>
            </div>

            {error && (
                <Alert
                    type="error"
                    message={error}
                    className="mb-6 animate-slide-up"
                    onClose={() => { }}
                />
            )}

            <form onSubmit={handleSubmit} className="space-y-5 animate-fade">
                <InputField
                    label="Nombre completo"
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    required
                    error={formErrors.nombre}
                    icon={
                        <svg className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    }
                />

                <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    required
                    error={formErrors.email}
                    icon={
                        <svg className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                    }
                />

                <InputField
                    label="Teléfono"
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="612345678"
                    error={formErrors.telefono}
                    icon={
                        <svg className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                    }
                />

                <InputField
                    label="Dirección"
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Calle, número"
                    error={formErrors.direccion}
                    icon={
                        <svg className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                    }
                />

                <InputField
                    label="Contraseña"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    error={formErrors.password}
                    icon={
                        <svg className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    }
                />

                <InputField
                    label="Confirmar contraseña"
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    error={formErrors.password_confirmation}
                    icon={
                        <svg className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    }
                />

                <div className="mt-1 text-sm text-text-dark dark:text-text-secondary">
                    <p>
                        Al registrarte, aceptas nuestros{' '}
                        <Link to="/terminos" className="text-primary hover:underline">
                            Términos de servicio
                        </Link>{' '}
                        y{' '}
                        <Link to="/privacidad" className="text-primary hover:underline">
                            Política de privacidad
                        </Link>
                    </p>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                    fullWidth
                    className="py-3 rounded-lg text-text-light bg-gradient-to-r from-primary to-info hover:from-primary-dark hover:to-primary transition-all duration-300 transform hover:translate-y-[-2px] shadow-md hover:shadow-lg"
                >
                    {loading ? <Spinner></Spinner> : 'Crear mi cuenta'}
                </Button>
            </form>

            <div className="text-center mt-8">
                <p className="text-sm text-text-dark dark:text-text-secondary">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
};

RegisterForm.propTypes = {
    onRegister: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    error: PropTypes.string
};

export default RegisterForm;
