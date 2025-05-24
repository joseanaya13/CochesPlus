import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import Spinner from '../common/Spinner';
import Alert from '../common/Alert';

const ConversationsList = () => {
    const { user } = useAuth(); 
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                const data = await apiService.get('/conversaciones');
                setConversations(data);
            } catch (err) {
                console.error('Error al cargar conversaciones:', err);
                setError('No se pudieron cargar las conversaciones');
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffInHours < 24 * 7) {
            return date.toLocaleDateString('es-ES', {
                weekday: 'short'
            });
        } else {
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit'
            });
        }
    };

    const getOtherUser = (conversation) => {
        if (!user) return null;
        return user.id === conversation.id_comprador
            ? conversation.vendedor
            : conversation.comprador;
    };

    const getLastMessage = (conversation) => {
        if (!conversation.mensajes || conversation.mensajes.length === 0) {
            return 'Sin mensajes';
        }
        return conversation.mensajes[0].contenido;
    };

    const hasUnreadMessages = (conversation) => {
        if (!conversation.mensajes || conversation.mensajes.length === 0 || !user) {
            return false;
        }

        return conversation.mensajes.some(
            mensaje => !mensaje.leido && mensaje.id_remitente !== user.id
        );
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
            <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
            />
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-text-secondary dark:text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-text-dark dark:text-text-light mb-2">
                    No tienes conversaciones
                </h3>
                <p className="text-text-secondary dark:text-text-secondary">
                    Cuando contactes con vendedores o compradores, las conversaciones aparecerán aquí.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {conversations.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                const lastMessage = getLastMessage(conversation);
                const unread = hasUnreadMessages(conversation);
                const lastMessageTime = conversation.mensajes && conversation.mensajes.length > 0
                    ? conversation.mensajes[0].created_at
                    : conversation.updated_at;

                return (
                    <Link
                        key={conversation.id}
                        to={`/mensajes/${conversation.id}`}
                        className={`block p-4 rounded-lg border transition-colors hover:bg-secondary-light dark:hover:bg-secondary-dark ${unread
                                ? 'bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40'
                                : 'bg-background-light dark:bg-primary-dark border-secondary-light dark:border-secondary-dark'
                            }`}
                    >
                        <div className="flex items-start space-x-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary dark:text-primary-light">
                                        {otherUser?.nombre?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                            </div>

                            {/* Contenido de la conversación */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className={`text-sm font-medium truncate ${unread
                                            ? 'text-text-dark dark:text-text-light'
                                            : 'text-text-dark dark:text-text-light'
                                        }`}>
                                        {otherUser?.nombre || 'Usuario'}
                                    </h3>
                                    <span className="text-xs text-text-secondary dark:text-text-secondary">
                                        {formatDate(lastMessageTime)}
                                    </span>
                                </div>

                                {/* Información del coche */}
                                <div className="text-xs text-text-secondary dark:text-text-secondary mb-1">
                                    {conversation.coche?.marca?.nombre} {conversation.coche?.modelo?.nombre}
                                    {conversation.coche?.precio && (
                                        <span className="ml-2 font-medium text-primary">
                                            {new Intl.NumberFormat('es-ES', {
                                                style: 'currency',
                                                currency: 'EUR'
                                            }).format(conversation.coche.precio)}
                                        </span>
                                    )}
                                </div>

                                {/* Último mensaje */}
                                <p className={`text-sm truncate ${unread
                                        ? 'text-text-dark dark:text-text-light font-medium'
                                        : 'text-text-secondary dark:text-text-secondary'
                                    }`}>
                                    {lastMessage}
                                </p>
                            </div>

                            {/* Indicador de no leído */}
                            {unread && (
                                <div className="flex-shrink-0">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                </div>
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};
export default ConversationsList;