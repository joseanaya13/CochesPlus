import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import CarForm from '../../components/cars/CarForm';
import cocheService from '../../services/CocheService';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../../components/common/Alert';

const EditCar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [carData, setCarData] = useState(null);

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                setLoading(true);
                const response = await cocheService.getCocheById(id);

                if (response.id_usuario !== user.id) {
                    setError('No tienes permiso para editar este anuncio');
                    return;
                }

                setCarData(response);
            } catch (err) {
                console.error('Error al cargar los datos del coche:', err);
                setError('No se pudo cargar la información del anuncio. Inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCarDetails();
        }
    }, [id, user]);

    const handleSubmit = async (formData, imagenes, documentos) => {
        try {
            setFormLoading(true);
            setError(null);

            await cocheService.updateCoche(id, formData);

            if (imagenes && imagenes.length > 0) {
                for (const imagen of imagenes) {
                    await cocheService.addImage(id, imagen);
                }
            }

            if (documentos && documentos.length > 0) {
                for (const documento of documentos) {
                    await cocheService.addDocument(id, documento);
                }
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/profile', {
                    state: {
                        successMessage: 'Su anuncio ha sido actualizado correctamente.'
                    }
                });
            }, 2000);
        } catch (err) {
            console.error('Error al actualizar anuncio:', err);
            setError('Ocurrió un error al actualizar el anuncio. Por favor, inténtalo de nuevo.');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Editar Anuncio</h1>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <Alert type="error" message={error} />
                ) : (
                    <CarForm
                        onSubmit={handleSubmit}
                        initialData={carData}
                        loading={formLoading}
                        error={error}
                        success={success}
                        isEditing={true}
                    />
                )}
            </div>
        </Layout>
    );
};

export default EditCar;