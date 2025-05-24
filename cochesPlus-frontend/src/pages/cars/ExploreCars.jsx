import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import CarCardExplore from '../../components/cars/CarCardExplore';
import cocheService from '../../services/CocheService';
import favoritoService from '../../services/FavoritoService';
import { useAuth } from '../../contexts/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import Alert from '../../components/common/Alert';

const ExploreCars = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const isFirstRender = useRef(true);
    const filtersAppliedFromUrl = useRef(false);
    const initialLoadComplete = useRef(false);
    const [coches, setCoches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [loadingFavorites, setLoadingFavorites] = useState(false);
    const [error, setError] = useState(null);
    const [alertInfo, setAlertInfo] = useState(null);
    const [paginacion, setPaginacion] = useState({
        currentPage: 1,
        totalPages: 1,
        perPage: 12
    });
    const [marcas, setMarcas] = useState([]);
    const [models, setModels] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [provincias, setProvincias] = useState([]);

    const [filters, setFilters] = useState({
        id_marca: '',
        id_modelo: '',
        precio_min: '',
        precio_max: '',
        anio_min: '',
        anio_max: '',
        km_min: '',
        km_max: '',
        potencia_min: '',
        potencia_max: '',
        id_categoria: '',
        id_provincia: '',
        combustible: '',
        transmision: '',
        plazas: '',
        puertas: '',
        verificado: '',
        order_by: 'fecha_publicacion',
        order_dir: 'desc'
    });

    const debouncedFilters = useDebounce(filters, 500);

    useEffect(() => {
        const fetchMarcas = async () => {
            try {
                const data = await cocheService.getMarcas();
                setMarcas(data);
            } catch (err) {
                console.error('Error al cargar marcas:', err);
            }
        };

        fetchMarcas();
    }, []);
    useEffect(() => {
        const fetchModelos = async () => {
            if (filters.id_marca) {
                try {
                    const data = await cocheService.getModelosByMarca(filters.id_marca);
                    setModels(data);
                } catch (err) {
                    console.error('Error al cargar modelos:', err);
                }
            } else {
                setModels([]);
            }
        };

        fetchModelos();
    }, [filters.id_marca]);

    // Leer parámetros de URL al iniciar el componente
    useEffect(() => {
        // Solo se ejecuta cuando se monta el componente
        if (isFirstRender.current) {
            isFirstRender.current = false;
            const initialFilters = { ...filters };
            let hasUrlParams = false;

            // Recorrer todos los parámetros de URL y aplicarlos a los filtros
            for (const [key, value] of searchParams.entries()) {
                if (key in initialFilters && value) {
                    initialFilters[key] = value;
                    hasUrlParams = true;
                    console.log(`Aplicando filtro inicial desde URL: ${key}=${value}`);
                }
            }

            // Solo actualizar los filtros si hay parámetros en la URL
            if (hasUrlParams) {
                console.log('Filtros iniciales aplicados desde URL:', initialFilters);
                setFilters(initialFilters);
                filtersAppliedFromUrl.current = true;
            } else {
                // Si no hay filtros en la URL, marcamos que estamos listos para cargar
                initialLoadComplete.current = true;
            }
        }
    }, []); // Se ejecuta solo al montar el componente

    useEffect(() => {
        // Cuando se actualizan los filtros desde URL, marcamos la carga completa
        if (filtersAppliedFromUrl.current && !initialLoadComplete.current) {
            console.log('Filtros aplicados desde URL, marcando carga inicial como completa');
            initialLoadComplete.current = true;
        }
    }, [filters]);

    // Función para cargar coches con los filtros actuales
    const fetchCoches = useCallback(async () => {
        // No cargar coches hasta que los filtros de URL se hayan aplicado si es necesario
        if (filtersAppliedFromUrl.current && !initialLoadComplete.current) {
            console.log('Esperando a que se apliquen los filtros de URL antes de cargar coches');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const params = {};
            Object.keys(debouncedFilters).forEach(key => {
                if (debouncedFilters[key] !== '' && debouncedFilters[key] !== null && debouncedFilters[key] !== undefined) {
                    params[key] = debouncedFilters[key];
                }
            });

            params.page = paginacion.currentPage;
            params.per_page = paginacion.perPage;

            console.log('Cargando coches con parámetros:', params);
            const response = await cocheService.getAllCoches(params);
            setCoches(response.data || []);

            setPaginacion({
                ...paginacion,
                currentPage: response.current_page || 1,
                totalPages: response.last_page || 1
            });

        } catch (err) {
            console.error('Error al cargar coches:', err);
            setError('No se pudieron cargar los coches. Por favor, inténtalo de nuevo más tarde.');
            setCoches([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedFilters, paginacion.currentPage, paginacion.perPage]);

    useEffect(() => {
        fetchCoches();
    }, [fetchCoches]);

    // Cargar categorías y provincias al iniciar
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const data = await cocheService.getCategorias();
                setCategorias(data);
            } catch (err) {
                console.error('Error al cargar categorías:', err);
            }
        };

        const fetchProvincias = async () => {
            try {
                const data = await cocheService.getProvincias();
                setProvincias(data);
            } catch (err) {
                console.error('Error al cargar provincias:', err);
            }
        };

        fetchCategorias();
        fetchProvincias();
    }, []);

    // Cargar favoritos del usuario si está autenticado
    useEffect(() => {
        const fetchFavorites = async () => {
            if (isAuthenticated) {
                try {
                    setLoadingFavorites(true);
                    const data = await favoritoService.getUserFavorites();
                    const favIds = data.map(fav => fav.id_coche);
                    setFavorites(favIds);
                } catch (err) {
                    console.error('Error al cargar favoritos:', err);
                } finally {
                    setLoadingFavorites(false);
                }
            }
        };

        fetchFavorites();
    }, [isAuthenticated]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        if (name === 'id_marca') {
            setFilters({
                ...filters,
                id_marca: value,
                id_modelo: ''
            });
        } else {
            setFilters({
                ...filters,
                [name]: value
            });
        }
    };

    const applyFilters = () => {
        setPaginacion({
            ...paginacion,
            currentPage: 1
        });
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= paginacion.totalPages) {
            setPaginacion({
                ...paginacion,
                currentPage: page
            });
        }
    };

    const handleToggleFavorite = async (cocheId) => {
        if (!isAuthenticated) {
            setAlertInfo({
                type: 'warning',
                message: 'Debes iniciar sesión para añadir a favoritos'
            });
            return;
        }

        try {
            setLoadingFavorites(true);
            if (favorites.includes(cocheId)) {
                await favoritoService.removeFavorite(cocheId);
                setFavorites(prevFavorites => prevFavorites.filter(id => id !== cocheId));
                setAlertInfo({
                    type: 'info',
                    message: 'Eliminado de favoritos'
                });
            } else {
                await favoritoService.addFavorite(cocheId);
                setFavorites(prevFavorites => [...prevFavorites, cocheId]);
                setAlertInfo({
                    type: 'success',
                    message: 'Añadido a favoritos'
                });
            }
        } catch (err) {
            console.error('Error al actualizar favoritos:', err);
            setAlertInfo({
                type: 'error',
                message: 'Error al actualizar favoritos. Por favor, inténtalo de nuevo.'
            });
        } finally {
            setLoadingFavorites(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Panel de filtros */}
                    <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-text-dark dark:text-text-light mb-4">Filtros</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
                                Marca
                            </label>
                            <select
                                name="id_marca"
                                value={filters.id_marca}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                            >
                                <option value="">Todas las marcas</option>
                                {marcas.map(marca => (
                                    <option key={marca.id} value={marca.id}>
                                        {marca.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
                                Modelo
                            </label>
                            <select
                                name="id_modelo"
                                value={filters.id_modelo}
                                onChange={handleFilterChange}
                                disabled={!filters.id_marca}
                                className={`w-full rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light ${!filters.id_marca ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <option value="">
                                    {!filters.id_marca ? 'Selecciona una marca' : 'Todos los modelos'}
                                </option>
                                {models.map(modelo => (
                                    <option key={modelo.id} value={modelo.id}>
                                        {modelo.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
                                Combustible
                            </label>
                            <select
                                name="combustible"
                                value={filters.combustible}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                            >
                                <option value="">Todos</option>
                                <option value="Gasolina">Gasolina</option>
                                <option value="Diesel">Diésel</option>
                                <option value="Híbrido">Híbrido</option>
                                <option value="Eléctrico">Eléctrico</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
                                Precio
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    name="precio_min"
                                    value={filters.precio_min}
                                    onChange={handleFilterChange}
                                    placeholder="Min €"
                                    className="w-full rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                                />
                                <input
                                    type="number"
                                    name="precio_max"
                                    value={filters.precio_max}
                                    onChange={handleFilterChange}
                                    placeholder="Max €"
                                    className="w-full rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
                                Año
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    value={filters.anio_min}
                                    onChange={handleFilterChange}
                                    placeholder="Desde"
                                    className="w-full rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                                />
                                <input
                                    type="number"
                                    name="anio_max"
                                    value={filters.anio_max}
                                    onChange={handleFilterChange}
                                    placeholder="Hasta"
                                    className="w-full rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
                                Categoría
                            </label>
                            <select
                                name="id_categoria"
                                value={filters.id_categoria}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                            >
                                <option value="">Todas las categorías</option>
                                {categorias.map(categoria => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
                                Provincia
                            </label>
                            <select
                                name="id_provincia"
                                value={filters.id_provincia}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                            >
                                <option value="">Todas las provincias</option>
                                {provincias.map(provincia => (
                                    <option key={provincia.id} value={provincia.id}>
                                        {provincia.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
                                Transmisión
                            </label>
                            <select
                                name="transmision"
                                value={filters.transmision}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                            >
                                <option value="">Todas</option>
                                <option value="Manual">Manual</option>
                                <option value="Automático">Automático</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
                                Potencia (CV)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    name="potencia_min"
                                    value={filters.potencia_min}
                                    onChange={handleFilterChange}
                                    placeholder="Desde"
                                    className="w-full rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                                />
                                <input
                                    type="number"
                                    name="potencia_max"
                                    value={filters.potencia_max}
                                    onChange={handleFilterChange}
                                    placeholder="Hasta"
                                    className="w-full rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
                                Plazas
                            </label>
                            <select
                                name="plazas"
                                value={filters.plazas}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                            >
                                <option value="">Todas</option>
                                {[2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
                                Puertas
                            </label>
                            <select
                                name="puertas"
                                value={filters.puertas}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                            >
                                <option value="">Todas</option>
                                {[2, 3, 4, 5].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>

                        <Button
                            variant="primary"
                            onClick={applyFilters}
                            fullWidth
                        >
                            Aplicar Filtros
                        </Button>
                    </div>

                    {/* Lista de coches */}
                    <div className="lg:col-span-3">
                        {/* Mostrar alertas */}
                        {alertInfo && (
                            <Alert
                                type={alertInfo.type}
                                message={alertInfo.message}
                                onClose={() => setAlertInfo(null)}
                                className="mb-4"
                            />
                        )}

                        {/* Opciones de ordenación */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-text-dark dark:text-text-secondary">
                                {loading ? 'Cargando resultados...' : error ? 'Error al cargar coches' : `${coches.length} resultados encontrados`}
                            </p>
                            <div className="flex items-center">
                                <label className="text-sm text-text-dark dark:text-text-secondary mr-2">Ordenar por:</label>
                                <select
                                    name="order_by"
                                    value={filters.order_by}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        let orderDir = 'desc';

                                        if (value === 'precio' || value === 'kilometraje') {
                                            orderDir = 'asc';
                                        }

                                        setFilters({
                                            ...filters,
                                            order_by: value,
                                            order_dir: orderDir
                                        });
                                    }}
                                    className="rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                                >
                                    <option value="fecha_publicacion">Más recientes</option>
                                    <option value="precio">Precio (menor a mayor)</option>
                                    <option value="anio">Año (más nuevo primero)</option>
                                    <option value="kilometraje">Kilómetros (menor a mayor)</option>
                                </select>

                                {/* Selector de dirección de ordenamiento */}
                                <select
                                    name="order_dir"
                                    value={filters.order_dir}
                                    onChange={(e) => setFilters({ ...filters, order_dir: e.target.value })}
                                    className="ml-2 rounded-md border-secondary-light shadow-sm focus:border-primary focus:ring-primary dark:bg-primary-dark dark:border-secondary-dark dark:text-text-light"
                                >
                                    <option value="asc">Ascendente</option>
                                    <option value="desc">Descendente</option>
                                </select>
                            </div>
                        </div>

                        {/* Mostrar error si existe */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-800 dark:text-red-200 mb-4">
                                {error}
                            </div>
                        )}

                        {/* Listado de coches */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, index) => (
                                    <div key={index} className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md overflow-hidden animate-pulse">
                                        <div className="h-48 bg-secondary-light dark:bg-secondary-dark"></div>
                                        <div className="p-4">
                                            <div className="h-4 bg-secondary-light dark:bg-secondary-dark rounded w-3/4 mb-2"></div>
                                            <div className="h-6 bg-secondary-light dark:bg-secondary-dark rounded w-1/2 mb-4"></div>
                                            <div className="h-4 bg-secondary-light dark:bg-secondary-dark rounded w-full mb-2"></div>
                                            <div className="h-4 bg-secondary-light dark:bg-secondary-dark rounded w-2/3"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : coches.length === 0 ? (
                            <div className="bg-background-light dark:bg-primary-dark p-8 rounded-lg shadow-md text-center">
                                <p className="text-lg text-text-dark dark:text-text-light">No se encontraron coches con los filtros seleccionados.</p>
                                <p className="text-text-secondary dark:text-text-secondary mt-2">Prueba a cambiar los filtros o a ampliar tu búsqueda.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {coches.map(coche => (
                                    <CarCardExplore
                                        key={coche.id}
                                        coche={coche}
                                        isFavorite={favorites.includes(coche.id)}
                                        onToggleFavorite={handleToggleFavorite}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Paginación */}
                        {!loading && coches.length > 0 && (
                            <div className="mt-8 flex justify-center">
                                <nav className="flex items-center">
                                    <button
                                        className={`px-3 py-1 border rounded-l-md border-secondary-light bg-background-light dark:bg-primary-dark dark:border-secondary-dark text-secondary dark:text-text-secondary hover:bg-secondary-light dark:hover:bg-secondary-dark ${paginacion.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={() => handlePageChange(paginacion.currentPage - 1)}
                                        disabled={paginacion.currentPage === 1}
                                    >
                                        Anterior
                                    </button>

                                    {/* Mostrar páginas */}
                                    {[...Array(Math.min(5, paginacion.totalPages))].map((_, index) => {
                                        let pageToShow;
                                        if (paginacion.totalPages <= 5) {
                                            pageToShow = index + 1;
                                        } else if (paginacion.currentPage <= 3) {
                                            pageToShow = index + 1;
                                        } else if (paginacion.currentPage >= paginacion.totalPages - 2) {
                                            pageToShow = paginacion.totalPages - 4 + index;
                                        } else {
                                            pageToShow = paginacion.currentPage - 2 + index;
                                        }

                                        if (pageToShow > paginacion.totalPages) return null;

                                        return (
                                            <button
                                                key={pageToShow}
                                                className={`px-3 py-1 border-t border-b border-secondary-light ${pageToShow === paginacion.currentPage
                                                    ? 'bg-primary/10 dark:bg-primary/20 dark:border-secondary-dark text-primary dark:text-primary'
                                                    : 'bg-background-light dark:bg-primary-dark dark:border-secondary-dark text-secondary dark:text-text-secondary hover:bg-secondary-light dark:hover:bg-secondary-dark'
                                                    }`}
                                                onClick={() => handlePageChange(pageToShow)}
                                            >
                                                {pageToShow}
                                            </button>
                                        );
                                    })}

                                    <button
                                        className={`px-3 py-1 border rounded-r-md border-secondary-light bg-background-light dark:bg-primary-dark dark:border-secondary-dark text-secondary dark:text-text-secondary hover:bg-secondary-light dark:hover:bg-secondary-dark ${paginacion.currentPage === paginacion.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={() => handlePageChange(paginacion.currentPage + 1)}
                                        disabled={paginacion.currentPage === paginacion.totalPages}
                                    >
                                        Siguiente
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ExploreCars;
