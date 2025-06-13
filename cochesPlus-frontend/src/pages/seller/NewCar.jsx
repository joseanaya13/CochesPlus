import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import CarForm from '../../components/cars/CarForm';
import cocheService from '../../services/CocheService';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/common/Spinner';

const NewCar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const initialData = {
        id_usuario: user?.id,
    };

    const handleSubmit = async (formData, imagenes, documentos) => {
        if (!imagenes || imagenes.length === 0) {
            setError('Debe incluir al menos una imagen principal');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await cocheService.publicarAnuncio(formData, imagenes, documentos);

            setSuccess(true);
            setTimeout(() => {
                navigate('/', {
                    state: {
                        successMessage: 'Su anuncio ha sido publicado correctamente.'
                    }
                });
            }, 2000);
        } catch (err) {
            console.error('Error al publicar anuncio:', err);
            setError('Ocurrió un error al publicar el anuncio. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="bg-primary-light dark:bg-primary-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-extrabold">Publicar Nuevo Anuncio</h1>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner variant={"page"}></Spinner>
                    </div>
                ) : (
                    <CarForm
                        onSubmit={handleSubmit}
                        initialData={initialData}
                        loading={loading}
                        error={error}
                        success={success}
                    />
                )}
            </div>
        </Layout>
    );
};

export default NewCar;