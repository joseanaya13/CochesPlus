import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import authService from '../../services/authService';
import Layout from '../../components/layout/Layout';

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Extraer token y email de los query params
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    // Verificar si tenemos los datos necesarios
    useEffect(() => {
        if (!token) {
            setError('Token no proporcionado. Este enlace no es válido o ha expirado.');
        }
    }, [token]);

    useEffect(() => {
        // Si ya está autenticado, redirigir al dashboard
        if (authService.isAuthenticated()) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleReset = async (data) => {
        try {
            setLoading(true);
            setError(null);

            // Asegurarnos de que el token esté incluido en los datos
            const resetData = {
                ...data,
                token: token
            };

            await authService.resetPassword(resetData);

            setSuccess(true);
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                navigate('/login', {
                    state: { message: 'Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión.' }
                });
            }, 3000);
        } catch (err) {
            console.error('Error al restablecer contraseña:', err);

            // Manejar errores de validación específicos
            if (err.errors && err.errors.token) {
                setError('El token no es válido o ha expirado. Por favor, solicita un nuevo enlace de recuperación.');
            } else {
                setError(err.message || 'Ha ocurrido un error al restablecer la contraseña. Por favor, intente de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout hideFooter={true} hideNavbar={true}>
            <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 bg-gray-50 dark:bg-gray-900">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8 animate-slide-up">
                        <h1 className="text-3xl font-extrabold mb-2 text-primary-600 dark:text-primary-400">
                            CochesPlus
                        </h1>
                        <p className="text-balance text-gray-600 dark:text-gray-300">
                            Recupera el acceso a tu cuenta
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-fade">
                        {success ? (
                            <div className="bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300 p-4 rounded-md mb-4 animate-fade text-center">
                                <p className="text-sm font-medium mb-2">¡Contraseña restablecida correctamente!</p>
                                <p className="text-xs">Serás redirigido al inicio de sesión en unos segundos...</p>
                            </div>
                        ) : (
                            <ResetPasswordForm
                                onSubmit={handleReset}
                                loading={loading}
                                error={error}
                                token={token}
                                email={email}
                            />
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ResetPassword;
