import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import cocheService from '../../services/CocheService';
import Spinner from '../../components/common/Spinner';
import CarCardProfile from '../../components/cars/CarCardProfile';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

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
            <div className="bg-primary text-on-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-extrabold !text-primary-light">Mis Anuncios</h1>
                            <p className="mt-2">Gestiona tus coches en venta</p>
                        </div>
                        <Link
                            to="/vendedor/publicar"
                            className="px-4 py-2 bg-on-primary text-text-dark bg-primary-light font-medium rounded-md"
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
                    <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-md p-8 text-center">
                        <svg className="mx-auto h-16 w-16 text-icon-light dark:text-icon-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-on-surface-light dark:text-on-surface-dark">No tienes anuncios publicados</h3>
                        <p className="mt-2 text-on-surface-muted-light dark:text-on-surface-muted-dark">Comienza a vender tus coches publicando tu primer anuncio.</p>
                        <div className="mt-6">
                            <Link
                                to="/vendedor/publicar"
                                className="px-4 py-2 bg-primary text-on-primary font-medium rounded-md hover:bg-primary-hover"
                            >
                                Publicar anuncio
                            </Link>
                        </div>
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