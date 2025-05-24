import React, { useState } from 'react';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import authService from '../../services/authService';
import Layout from '../../components/layout/Layout';

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (data) => {
        try {
            setLoading(true);
            setError(null);

            await authService.forgotPassword(data.email);

            setSuccess('Se ha enviado un enlace de recuperación a tu correo electrónico.');
        } catch (err) {
            console.error('Error al solicitar recuperación:', err);
            setError(err.message || 'Ha ocurrido un error al procesar tu solicitud.');
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
                        <ForgotPasswordForm
                            onSubmit={handleSubmit}
                            loading={loading}
                            error={error}
                            success={success}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ForgotPassword;
