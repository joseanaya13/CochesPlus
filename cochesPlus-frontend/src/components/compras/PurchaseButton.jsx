import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import InputField from '../common/InputField';
import TextArea from '../common/TextArea';
import Alert from '../common/Alert';
import purchaseService from '../../services/purchaseService';
import { useAuth } from '../../contexts/AuthContext';

const PurchaseButton = ({
    coche,
    conversacionId = null,
    onPurchaseInitiated = () => { },
    disabled = false,
    className = ''
}) => {
    const { isAuthenticated, user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        precio_acordado: coche.precio || '',
        condiciones: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.precio_acordado || formData.precio_acordado <= 0) {
            setError('El precio debe ser mayor a 0');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const purchaseData = {
                id_coche: coche.id,
                precio_acordado: parseFloat(formData.precio_acordado),
                condiciones: formData.condiciones.trim(),
                id_conversacion: conversacionId
            };

            const response = await purchaseService.iniciarCompra(purchaseData);

            setSuccess('¡Solicitud de compra enviada! El vendedor será notificado.');
            onPurchaseInitiated(response.compra);

            setTimeout(() => {
                setShowModal(false);
                setSuccess('');
                setFormData({
                    precio_acordado: coche.precio || '',
                    condiciones: ''
                });
            }, 2000);

        } catch (err) {
            console.error('Error al enviar solicitud:', err);
            setError(err.message || 'Error al enviar la solicitud de compra');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setError('');
        setSuccess('');
        setFormData({
            precio_acordado: coche.precio || '',
            condiciones: ''
        });
    };

    // No mostrar el botón si no está autenticado o es el propietario
    if (!isAuthenticated || user.id === coche.id_usuario || coche.vendido) {
        return null;
    }

    return (
        <>
            <Button
                onClick={() => setShowModal(true)}
                disabled={disabled || loading}
                className={`flex items-center justify-center ${className}`}
                variant="primary"
            >
                {/* Icono de compra (carrito) */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.9-1.45L17 13M7 13V6h13" />
                </svg>
                Solicitar Compra
            </Button>

            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title="Solicitar Compra"
                size="md"
            >
                <div className="space-y-4">
                    {/* Información del coche */}
                    <div className="bg-secondary-light dark:bg-secondary-dark rounded-lg p-4">
                        <h3 className="font-medium text-text-dark dark:text-text-light mb-2">
                            {coche.marca?.nombre} {coche.modelo?.nombre}
                        </h3>
                        <div className="text-sm text-text-secondary dark:text-text-secondary">
                            <p>Año: {coche.anio}</p>
                            <p>Precio publicado: {new Intl.NumberFormat('es-ES', {
                                style: 'currency',
                                currency: 'EUR'
                            }).format(coche.precio)}</p>
                        </div>
                    </div>

                    {/* Alertas */}
                    {error && (
                        <Alert
                            type="error"
                            message={error}
                            onClose={() => setError('')}
                        />
                    )}

                    {success && (
                        <Alert
                            type="success"
                            message={success}
                            onClose={() => setSuccess('')}
                        />
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InputField
                            label="Precio ofrecido (€)"
                            type="number"
                            name="precio_acordado"
                            value={formData.precio_acordado}
                            onChange={handleInputChange}
                            min="1"
                            required
                            placeholder="Ingresa tu oferta"
                        />

                        <TextArea
                            label="Condiciones adicionales (opcional)"
                            name="condiciones"
                            value={formData.condiciones}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Ej: Pago al contado, necesito factura, revisión previa..."
                            maxLength={1000}
                        />

                        <div className="text-xs text-text-secondary dark:text-text-secondary">
                            <p>• Tu solicitud será enviada al vendedor</p>
                            <p>• El vendedor tendrá 3 días para responder</p>
                            <p>• Si acepta, tendrás 2 días para confirmar la compra</p>
                            <p>• Una vez confirmada, podrás valorar al vendedor</p>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <Button
                                type="button"
                                onClick={closeModal}
                                variant="secondary"
                                className="flex-1"
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1"
                                isLoading={loading}
                                disabled={loading}
                            >
                                {loading ? 'Enviando...' : 'Enviar Solicitud'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
};

PurchaseButton.propTypes = {
    coche: PropTypes.shape({
        id: PropTypes.number.isRequired,
        precio: PropTypes.number.isRequired,
        id_usuario: PropTypes.number.isRequired,
        vendido: PropTypes.bool,
        marca: PropTypes.shape({
            nombre: PropTypes.string.isRequired
        }),
        modelo: PropTypes.shape({
            nombre: PropTypes.string.isRequired
        }),
        anio: PropTypes.number
    }).isRequired,
    conversacionId: PropTypes.number,
    onPurchaseInitiated: PropTypes.func,
    disabled: PropTypes.bool,
    className: PropTypes.string
};

export default PurchaseButton;