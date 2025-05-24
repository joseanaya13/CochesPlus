import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import messageService from '../../services/messageService';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

const ChatButton = ({ coche, className = '' }) => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChatClick = async () => {
        // Verificar si está autenticado
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // No permitir chat con el mismo propietario
        if (user.id === coche.id_usuario) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Crear o obtener conversación existente
            const conversacion = await messageService.createConversacion(coche.id);

            // Navegar a la página de mensajes con la conversación específica
            navigate(`/mensajes?conversacion=${conversacion.id}`);
        } catch (error) {
            console.error('Error al iniciar chat:', error);
            setError('No se pudo iniciar la conversación');

            // Auto-limpiar el error después de 3 segundos
            setTimeout(() => {
                setError(null);
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    // No mostrar botón para el propietario del coche
    if (isAuthenticated && user.id === coche.id_usuario) {
        return null;
    }

    return (
        <div className="relative">
            <Button
                onClick={handleChatClick}
                disabled={loading}
                className={`flex items-center justify-center ${className}`}
                variant="primary"
            >
                {loading ? (
                    <>
                        <Spinner />
                        <span className="ml-2">Conectando...</span>
                    </>
                ) : (
                    <>
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {isAuthenticated ? 'Contactar vendedor' : 'Inicia sesión para contactar'}
                    </>
                )}
            </Button>

            {/* Mostrar error si existe */}
            {error && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-error/10 border border-error/30 text-error text-xs rounded-md z-10">
                    {error}
                </div>
            )}
        </div>
    );
};

ChatButton.propTypes = {
    coche: PropTypes.shape({
        id: PropTypes.number.isRequired,
        id_usuario: PropTypes.number.isRequired
    }).isRequired,
    className: PropTypes.string
};

export default ChatButton;