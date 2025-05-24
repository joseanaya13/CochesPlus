import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import messageService from '../../services/messageService';
import { formatDate } from '../../utils/formatters';
import Spinner from '../common/Spinner';

const ConversationsList = ({ onSelectConversation, selectedConversacionId }) => {
    const [conversaciones, setConversaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadConversaciones();
    }, []);

    const loadConversaciones = async () => {
        try {
            setLoading(true);
            const data = await messageService.getConversaciones();
            setConversaciones(data);
        } catch (err) {
            console.error('Error al cargar conversaciones:', err);
            setError('Error al cargar las conversaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = (conversacion) => {
        if (onSelectConversation) {
            onSelectConversation(conversacion);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner variant="page" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-error/10 text-error p-4 rounded-lg">
                {error}
            </div>
        );
    }

    if (conversaciones.length === 0) {
        return (
            <div className="text-center py-8">
                <svg className="mx-auto h-16 w-16 text-text-secondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="text-lg font-medium text-text-dark dark:text-text-light mb-2">
                    No tienes conversaciones
                </h3>
                <p className="text-text-secondary mb-4">
                    Las conversaciones aparecerán aquí cuando contactes con vendedores
                </p>
                <Link
                    to="/coches"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                >
                    Explorar coches
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {conversaciones.map((conversacion) => {
                const ultimoMensaje = conversacion.mensajes?.[0];
                const otherUser = conversacion.comprador.id === user?.id
                    ? conversacion.vendedor
                    : conversacion.comprador;
                const hasUnread = ultimoMensaje && !ultimoMensaje.leido && ultimoMensaje.id_remitente !== user?.id;

                return (
                    <div
                        key={conversacion.id}
                        onClick={() => handleSelectConversation(conversacion)}
                        className={`p-4 rounded-lg cursor-pointer transition-colors duration-200 border ${selectedConversacionId === conversacion.id
                                ? 'bg-primary/10 border-primary'
                                : 'bg-background-light dark:bg-primary-dark border-secondary-light dark:border-secondary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark'
                            }`}
                    >
                        <div className="flex items-start space-x-3">
                            {/* Avatar del otro usuario */}
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                        {otherUser.nombre.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Información de la conversación */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-text-dark dark:text-text-light truncate">
                                        {otherUser.nombre}
                                    </p>
                                    {ultimoMensaje && (
                                        <p className="text-xs text-text-secondary">
                                            {formatDate(ultimoMensaje.created_at)}
                                        </p>
                                    )}
                                </div>

                                {/* Información del coche */}
                                <p className="text-xs text-text-secondary truncate">
                                    {conversacion.coche.marca.nombre} {conversacion.coche.modelo.nombre}
                                </p>

                                {/* Último mensaje */}
                                {ultimoMensaje && (
                                    <div className="flex items-center justify-between mt-1">
                                        <p className={`text-sm truncate ${hasUnread
                                                ? 'font-medium text-text-dark dark:text-text-light'
                                                : 'text-text-secondary'
                                            }`}>
                                            {ultimoMensaje.contenido}
                                        </p>
                                        {hasUnread && (
                                            <div className="w-2 h-2 bg-primary rounded-full ml-2 flex-shrink-0"></div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

ConversationsList.propTypes = {
    onSelectConversation: PropTypes.func,
    selectedConversacionId: PropTypes.number
};

export default ConversationsList;