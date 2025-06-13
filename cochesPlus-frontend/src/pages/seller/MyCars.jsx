import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import cocheService from '../../services/CocheService';
import Spinner from '../../components/common/Spinner';
import CarCardProfile from '../../components/cars/CarCardProfile';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

function MyCars() {
    const [coches, setCoches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [cocheToDelete, setCocheToDelete] = useState(null);
    const [cocheInfo, setCocheInfo] = useState(null);

    useEffect(() => {
        const cargarCoches = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await cocheService.getUserCars();
                setCoches(response);

            } catch (err) {
                console.error("Error al cargar los coches:", err);
                setError("Ocurrió un error al cargar tus anuncios. Por favor, intenta de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };

        cargarCoches();
    }, []);

    const handleEliminarClick = (id) => {
        const coche = coches.find(c => c.id === id);
        setCocheToDelete(id);
        setCocheInfo(coche);
        setIsDeleteModalOpen(true);
    };

    const handleEliminarCoche = async () => {
        try {
            await cocheService.deleteCoche(cocheToDelete);
            setCoches(coches.filter(coche => coche.id !== cocheToDelete));
            setIsDeleteModalOpen(false);
            setCocheToDelete(null);
            setCocheInfo(null);
        } catch (err) {
            console.error("Error al eliminar el coche:", err);
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setCocheToDelete(null);
        setCocheInfo(null);
    };

    return (
        <Layout>
            <div className="bg-primary-light dark:bg-primary-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-extrabold text-text-dark dark:text-text-light">Mis Anuncios</h1>
                            <p className="mt-2 text-text-dark dark:text-text-light">Gestiona tus coches en venta</p>
                        </div>
                        <Link
                            to="/vendedor/publicar"
                            className="px-4 py-2 bg-on-primary text-text-light dark:text-text-dark dark:bg-primary-light bg-primary-dark font-medium rounded-md"
                        >
                            Publicar nuevo anuncio
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner variant={'page'} />
                    </div>
                ) : error ? (
                    <Alert
                        type="error"
                        message={error}
                        className="mb-4 animate-fade"
                    />
                ) : coches.length === 0 ? (
                    <div className="bg-background-light dark:bg-primary-dark p-8 rounded-lg shadow-md text-center">
                        <div className="flex justify-center mb-4">
                            <svg className="h-16 w-16 text-text-secondary dark:text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-text-dark dark:text-text-light mb-2">No tienes anuncios publicados</h2>
                        <p className="text-text-secondary dark:text-text-secondary mb-6">
                            Cuando publiques un coche, aparecerá aquí para que puedas gestionarlo.
                        </p>
                        <Link to="/vendedor/publicar">
                            <Button variant="primary">
                                Publicar anuncio
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {coches.map(coche => (
                            <CarCardProfile
                                key={coche.id}
                                coche={coche}
                                onDelete={handleEliminarClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                title="Confirmar eliminación"
                confirmAction={handleEliminarCoche}
                confirmText="Eliminar"
                cancelText="Cancelar"
            >
                <p className="mb-4">¿Estás seguro que deseas eliminar este anuncio? Esta acción no se puede deshacer.</p>
                {cocheInfo && (
                    <div className="p-3 bg-secondary-light dark:bg-secondary-dark rounded-md border border-secondary-light dark:border-secondary-dark">
                        <p className="font-semibold text-text-dark dark:text-text-light">
                            {cocheInfo?.marca?.nombre || 'Marca desconocida'} {cocheInfo?.modelo?.nombre || 'Modelo desconocido'} ({cocheInfo?.anio || 'Año desconocido'})
                        </p>
                    </div>
                )}
            </Modal>
        </Layout>
    );
}

export default MyCars;