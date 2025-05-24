import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';

const Login = () => {
    const { login, isAuthenticated, loading, error, hasRole } = useAuth();
    const [loginError, setLoginError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/';

            if (hasRole('admin')) {
                navigate('/dashboard', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        }
    }, [isAuthenticated, navigate, location, hasRole]);

    const handleLogin = async (userData) => {
        try {
            setLoginError(null);
            await login(userData);
        } catch (err) {
            console.error('Error en inicio de sesión:', err);
            setLoginError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        }
    };

    return (
        <Layout hideFooter={true} hideNavbar={true}>
            <div className="min-h-screen flex flex-col md:flex-row items-stretch">
                {/* Lado izquierdo - Imagen de fondo con overlay */}
                <div className="hidden md:flex md:w-1/2 bg-primary-dark relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 to-primary/70"></div>
                    
                    {/* Elementos decorativos flotantes */}
                    <div className="absolute top-20 left-10 w-64 h-64 bg-primary-light/10 rounded-full filter blur-xl opacity-30 animate-blob"></div>
                    <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/20 rounded-full filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    
                    <div className="relative z-10 flex flex-col justify-center items-center px-8 w-full text-text-light">
                        <div className="mb-10 animate-slide-up">
                            <div className="flex items-center mb-6">
                                <span className="text-4xl font-bold text-primary">Coches</span>
                                <span className="text-4xl font-bold text-text-light">Plus</span>
                            </div>
                            <h2 className="text-3xl font-bold mb-6">¡Bienvenido de nuevo!</h2>
                            <p className="text-lg text-text-light mb-8 max-w-md text-pretty">
                                Tu marketplace de confianza para comprar y vender coches de segunda mano con total seguridad, verificación y transparencia.
                            </p>
                        </div>
                        
                        <div className="space-y-6 animate-fade">
                            <div className="flex items-center space-x-3">
                                <div className="bg-primary/30 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="font-medium">Miles de coches verificados</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="bg-primary/30 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="font-medium">Contacto directo con vendedores</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="bg-primary/30 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="font-medium">Documentación y vendedores verificados</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Lado derecho - Formulario */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background-light dark:bg-background-dark">
                    <div className="w-full max-w-md">
                        <div className="md:hidden text-center mb-10 animate-slide-up">
                            <div className="flex items-center justify-center mb-6">
                                <span className="text-3xl font-bold text-primary">Coches</span>
                                <span className="text-3xl font-bold dark:text-text-light text-text-dark">Plus</span>
                            </div>
                            <p className="text-balance dark:text-text-secondary text-secondary-dark">
                                Tu marketplace de coches de segunda mano de confianza
                            </p>
                        </div>

                        <div className="bg-background-light dark:bg-primary-dark rounded-xl shadow-xl p-8 animate-fade transition-all duration-300 hover-glow">
                            <LoginForm
                                onLogin={handleLogin}
                                loading={loading}
                                error={loginError || error}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Login;
