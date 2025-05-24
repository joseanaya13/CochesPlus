import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cocheService from '../../services/CocheService';
import SelectField from '../common/SelectField';
import Button from '../common/Button';

const QuickSearch = () => {
    const navigate = useNavigate();
    const [marcas, setMarcas] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [filtros, setFiltros] = useState({
        id_marca: '',
        id_provincia: '',
        precio_max: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [marcasData, provinciasData] = await Promise.all([
                    cocheService.getMarcas(),
                    cocheService.getProvincias()
                ]);

                setMarcas(Array.isArray(marcasData) ? marcasData : []);
                setProvincias(Array.isArray(provinciasData) ? provinciasData : []);
            } catch (err) {
                console.error('Error al cargar datos para QuickSearch:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        setFiltros({
            ...filtros,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let queryParams = new URLSearchParams();

        if (filtros.id_marca) queryParams.append('id_marca', filtros.id_marca);
        if (filtros.id_provincia) queryParams.append('id_provincia', filtros.id_provincia);
        if (filtros.precio_max) queryParams.append('precio_max', filtros.precio_max);

        navigate(`/coches?${queryParams.toString()}`);
    };

    const precioOptions = [
        { value: '', label: 'Cualquier precio' },
        { value: '10000', label: 'Hasta 10.000€' },
        { value: '20000', label: 'Hasta 20.000€' },
        { value: '30000', label: 'Hasta 30.000€' },
        { value: '40000', label: 'Hasta 40.000€' },
        { value: '50000', label: 'Hasta 50.000€' },
        { value: '100000', label: 'Hasta 100.000€' }
    ];

    return (
        <section className="bg-gradient-to-b dark:from-primary-dark dark:to-background-dark py-12 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-text-light mb-2">Te ayudamos, acompañamos y asesoramos en tu búsqueda.</h2>
                    <p className="text-text-light/80 dark:text-text-light/70">Utiliza nuestros filtros para buscar coches según tus preferencias.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-secondary-light backdrop-blur-sm dark:bg-primary-dark rounded-xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl border border-white/20 dark:border-secondary/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SelectField
                            label="Marca"
                            name="id_marca"
                            value={filtros.id_marca}
                            onChange={handleChange}
                            disabled={loading}
                            options={[
                                { value: '', label: 'Selecciona una marca' },
                                ...marcas.map(marca => ({
                                    value: marca.id,
                                    label: marca.nombre
                                }))
                            ]}
                        />

                        <SelectField
                            label="Provincia"
                            name="id_provincia"
                            value={filtros.id_provincia}
                            onChange={handleChange}
                            disabled={loading}
                            options={[
                                { value: '', label: 'Selecciona una provincia' },
                                ...provincias.map(provincia => ({
                                    value: provincia.id,
                                    label: provincia.nombre
                                }))
                            ]}
                        />

                        <SelectField
                            label="Precio máximo"
                            name="precio_max"
                            value={filtros.precio_max}
                            onChange={handleChange}
                            options={precioOptions}
                        />
                    </div>
                    <div className="mt-6 text-center">
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Cargando...' : 'Buscar coches'}
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default QuickSearch;