import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';

const Register = () => {
    const { register, isAuthenticated, loading, error } = useAuth();
    const [registerError, setRegisterError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleRegister = async (userData) => {
        try {
            setRegisterError(null);
            await register(userData);
        } catch (err) {
            console.error('Error en registro:', err);

            if (err.errors) {
                const errorMessages = Object.values(err.errors).flat().join('\n');
                setRegisterError(errorMessages);
            } else {
                setRegisterError(err.message || 'Error al registrarse. Inténtalo de nuevo.');
            }
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
                            <h2 className="text-3xl font-bold mb-6">¡Únete a nuestra comunidad!</h2>
                            <p className="text-lg text-text-light mb-8 max-w-md text-pretty">
                                Crea una cuenta y empieza a comprar o vender coches de segunda mano con las ventajas de una plataforma diseñada para tu seguridad y comodidad.
                            </p>
                        </div>

                        <div className="space-y-6 animate-fade">
                            <div className="flex items-center space-x-3">
                                <div className="bg-primary/30 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="font-medium">Publicaciones gratuitas ilimitadas</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="bg-primary/30 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="font-medium">Chat directo con vendedores</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="bg-primary/30 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="font-medium">Guardado de favoritos y alertas</p>
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
                                Únete a la comunidad de compra-venta de coches
                            </p>
                        </div>

                        <div className="bg-background-light dark:bg-primary-dark rounded-xl shadow-xl p-8 animate-fade transition-all duration-300 hover-glow">
                            <RegisterForm
                                onRegister={handleRegister}
                                loading={loading}
                                error={registerError || error}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Register;
