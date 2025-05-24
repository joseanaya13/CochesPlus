import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Spinner from '../common/Spinner';

const LoginForm = ({ onLogin, loading = false, error = null }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(null);
    const location = useLocation();

    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.email.trim()) {
            errors.email = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email no válido';
        }

        if (!formData.password) {
            errors.password = 'La contraseña es obligatoria';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                await onLogin(formData);
            } catch (err) {
                console.error('Error en inicio de sesión:', err);
            }
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-info dark:from-primary dark:to-info">
                    Iniciar Sesión
                </h2>
                <p className="mt-1 text-text-dark dark:text-text-light text-pretty">
                    Accede a tu cuenta para comprar, vender o gestionar tus anuncios de coches
                </p>
            </div>

            {successMessage && (
                <Alert
                    type="success"
                    message={successMessage}
                    className="mb-6 animate-slide-up"
                    onClose={() => setSuccessMessage(null)}
                />
            )}

            {error && (
                <Alert
                    type="error"
                    message={error}
                    className="mb-6 animate-slide-up"
                    onClose={() => { }}
                />
            )}

            <form onSubmit={handleSubmit} className="space-y-6 animate-fade">
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

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember_me"
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-secondary-light rounded transition-all dark:bg-primary-dark dark:border-secondary-dark"
                        />
                        <label htmlFor="remember_me" className="ml-2 block text-sm text-text-dark dark:text-text-secondary">
                            Recordarme
                        </label>
                    </div>

                    <div className="text-sm">
                        <Link to="/forgot-password" className="text-primary hover:text-primary-dark transition-colors duration-200 font-medium hover:underline">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                    fullWidth
                    className="font-black py-3 rounded-lg text-text-light bg-gradient-to-r from-primary to-info hover:from-primary-dark hover:to-primary transition-all duration-300 transform hover:translate-y-[-2px] shadow-md hover:shadow-lg"
                >
                    {loading ? <Spinner></Spinner> : 'Acceder a mi cuenta'}
                </Button>

                {/* <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-secondary-light dark:border-secondary-dark"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-background-light dark:bg-primary-dark text-secondary dark:text-text-secondary">
                            O continúa con
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        className="py-2.5 px-4 flex justify-center items-center border border-secondary-light dark:border-secondary-dark rounded-lg shadow-sm bg-background-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors duration-200"
                    >
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </button>

                    <button
                        type="button"
                        className="py-2.5 px-4 flex justify-center items-center border border-secondary-light dark:border-secondary-dark rounded-lg shadow-sm bg-background-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors duration-200"
                    >
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <path
                                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                fill="#1877F2"
                            />
                        </svg>
                        Facebook
                    </button>
                </div> */}
            </form>

            <div className="text-center mt-8">
                <p className="text-sm text-text-dark dark:text-text-light">
                    ¿Aún no tienes cuenta?
                    <Link to="/register" className="ml-1 text-primary font-medium hover:underline">
                        Regístrate 
                    </Link>
                </p>
            </div>
        </div>
    );
};

LoginForm.propTypes = {
    onLogin: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    error: PropTypes.string
};

export default LoginForm;
