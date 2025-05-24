import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';

const Dashboard = () => {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!hasRole('admin')) {
            navigate('/', { replace: true });
        }
    }, [hasRole, navigate]);

    const handleLogout = async () => {
        await logout();
    };

    if (!hasRole('admin')) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <Alert
                        type="error"
                        message="No tienes permiso para acceder al panel de administración."
                    />
                    <div className="mt-4">
                        <Button onClick={() => navigate('/')} fullWidth>
                            Volver a la página principal
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
                <header className="bg-white dark:bg-gray-800 shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <h1 className="title-md">Panel de Administración</h1>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="card p-6">
                        <h2 className="title-md mb-4">
                            Bienvenido, {user?.name}
                        </h2>

                        {/* Resto del dashboard */}
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default Dashboard;
