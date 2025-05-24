import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import CarCardFavorite from '../../components/cars/CarCardFavorite';
import favoritoService from '../../services/FavoritoService';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';

const Favorites = () => {
    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertInfo, setAlertInfo] = useState(null);

    useEffect(() => {
        const fetchFavoritos = async () => {
            try {
                setLoading(true);
                const data = await favoritoService.getUserFavorites();
                setFavoritos(data);
            } catch (err) {
                console.error('Error al cargar favoritos:', err);
                setError('No se pudieron cargar tus favoritos. Por favor, inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchFavoritos();
    }, []);

    const handleRemoveFavorite = async (cocheId) => {
        try {
            await favoritoService.removeFavorite(cocheId);
            setFavoritos(favoritos.filter(favorito => favorito.id_coche !== cocheId));
            setAlertInfo({
                type: 'success',
                message: 'Coche eliminado de favoritos'
            });
        } catch (err) {
            console.error('Error al eliminar favorito:', err);
            setAlertInfo({
                type: 'error',
                message: 'No se pudo eliminar el favorito. Por favor, inténtalo de nuevo.'
            });
        }
    };

    return (
        <Layout>
            <div className="bg-primary text-on-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-extrabold">Mis Favoritos</h1>
                    <p className="mt-2">Coches que has guardado para revisar más tarde</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {alertInfo && (
                    <Alert
                        type={alertInfo.type}
                        message={alertInfo.message}
                        onClose={() => setAlertInfo(null)}
                        className="mb-6"
                    />
                )}

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
                ) : favoritos.length === 0 ? (
                    <div className="bg-background-light dark:bg-primary-dark p-8 rounded-lg shadow-md text-center">
                        <div className="flex justify-center mb-4">
                            <svg className="h-16 w-16 text-text-secondary dark:text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-text-dark dark:text-text-light mb-2">No tienes coches en favoritos</h2>
                        <p className="text-text-secondary dark:text-text-secondary mb-6">
                            Cuando encuentres un coche que te interese, puedes añadirlo a favoritos para verlo más tarde.
                        </p>
                        <Link to="/coches">
                            <Button variant="primary">
                                Explorar coches
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {favoritos.map(favorito => (
                            <CarCardFavorite
                                key={favorito.id}
                                coche={favorito.coche}
                                onRemoveFavorite={() => handleRemoveFavorite(favorito.id_coche)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Favorites;
