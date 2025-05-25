import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import TextArea from '../common/TextArea';
import Alert from '../common/Alert';

const ValoracionForm = ({
    compra,
    onSubmit,
    onCancel,
    loading = false,
    error = null,
    initialValoracion = null
}) => {
    const [puntuacion, setPuntuacion] = useState(initialValoracion?.puntuacion || 0);
    const [comentario, setComentario] = useState(initialValoracion?.comentario || '');
    const [hoveredStar, setHoveredStar] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (puntuacion === 0) {
            return;
        }

        onSubmit({
            id_compra: compra.id,
            puntuacion,
            comentario: comentario.trim()
        });
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const isActive = i <= (hoveredStar || puntuacion);
            stars.push(
                <button
                    key={i}
                    type="button"
                    className={`text-3xl transition-colors duration-200 hover:scale-110 transform ${isActive ? 'text-warning' : 'text-gray-300 dark:text-gray-600'
                        }`}
                    onClick={() => setPuntuacion(i)}
                    onMouseEnter={() => setHoveredStar(i)}
                    onMouseLeave={() => setHoveredStar(0)}
                    aria-label={`${i} estrella${i > 1 ? 's' : ''}`}
                >
                    ★
                </button>
            );
        }
        return stars;
    };

    const getPuntuacionTexto = (rating) => {
        const textos = {
            1: 'Muy malo',
            2: 'Malo',
            3: 'Regular',
            4: 'Bueno',
            5: 'Excelente'
        };
        return textos[rating] || '';
    };

    return (
        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-text-dark dark:text-text-light mb-2">
                    {initialValoracion ? 'Editar valoración' : 'Valorar al vendedor'}
                </h3>

                {/* Información de la compra */}
                <div className="bg-secondary-light dark:bg-secondary-dark rounded-md p-4 mb-4">
                    <p className="text-sm text-text-secondary dark:text-text-secondary mb-1">
                        Vehículo comprado:
                    </p>
                    <p className="font-medium text-text-dark dark:text-text-light">
                        {compra.coche?.marca?.nombre} {compra.coche?.modelo?.nombre} ({compra.coche?.anio})
                    </p>
                    <p className="text-sm text-text-secondary dark:text-text-secondary mt-1">
                        Vendedor: {compra.vendedor?.nombre}
                    </p>
                    {compra.fecha_venta && (
                        <p className="text-sm text-text-secondary dark:text-text-secondary">
                            Fecha de compra: {new Date(compra.fecha_venta).toLocaleDateString('es-ES')}
                        </p>
                    )}
                </div>
            </div>

            {error && (
                <Alert
                    type="error"
                    message={error}
                    className="mb-4"
                    onClose={() => { }}
                />
            )}

            <form onSubmit={handleSubmit}>
                {/* Puntuación con estrellas */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-3">
                        Puntuación <span className="text-error">*</span>
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                        {renderStars()}
                    </div>
                    {puntuacion > 0 && (
                        <p className="text-sm text-primary font-medium">
                            {getPuntuacionTexto(puntuacion)}
                        </p>
                    )}
                    {puntuacion === 0 && (
                        <p className="text-sm text-error">
                            Por favor, selecciona una puntuación
                        </p>
                    )}
                </div>

                {/* Comentario */}
                <div className="mb-6">
                    <TextArea
                        label="Comentario (opcional)"
                        placeholder="Comparte tu experiencia con este vendedor..."
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        rows={4}
                        maxLength={1000}
                        className="resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-text-secondary dark:text-text-secondary">
                            Ayuda a otros compradores con tu opinión honesta
                        </p>
                        <p className="text-xs text-text-secondary dark:text-text-secondary">
                            {comentario.length}/1000
                        </p>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={loading}
                        disabled={puntuacion === 0 || loading}
                        className="flex-1"
                    >
                        {initialValoracion ? 'Actualizar valoración' : 'Publicar valoración'}
                    </Button>
                </div>
            </form>

            {initialValoracion && (
                <div className="mt-4 p-3 bg-warning/10 rounded-md">
                    <p className="text-xs text-warning">
                        ⚠️ Las valoraciones solo pueden editarse durante las primeras 24 horas después de su publicación.
                    </p>
                </div>
            )}
        </div>
    );
};

ValoracionForm.propTypes = {
    compra: PropTypes.shape({
        id: PropTypes.number.isRequired,
        coche: PropTypes.shape({
            marca: PropTypes.shape({
                nombre: PropTypes.string.isRequired
            }),
            modelo: PropTypes.shape({
                nombre: PropTypes.string.isRequired
            }),
            anio: PropTypes.number
        }),
        vendedor: PropTypes.shape({
            nombre: PropTypes.string.isRequired
        }),
        fecha_venta: PropTypes.string
    }).isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    error: PropTypes.string,
    initialValoracion: PropTypes.shape({
        puntuacion: PropTypes.number,
        comentario: PropTypes.string
    })
};

export default ValoracionForm;