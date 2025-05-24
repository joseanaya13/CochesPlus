import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import messageService from '../../services/messageService';
import echo from '../../services/echoService';
import { formatDate } from '../../utils/formatters';
import Spinner from '../common/Spinner';
import Alert from '../common/Alert';
import Button from '../common/Button';

const ConversationPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (id) {
            fetchConversation();
            fetchMessages();
        }
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Configurar escucha de mensajes en tiempo real
    useEffect(() => {
        if (!conversation) return;

        const channel = echo.private(`conversacion.${conversation.id}`);

        channel.listen('.message.sent', (e) => {
            console.log('Nuevo mensaje recibido:', e);
            setMessages(prevMensajes => [...prevMensajes, e]);
        });

        return () => {
            echo.leave(`conversacion.${conversation.id}`);
        };
    }, [conversation]);

    const fetchConversation = async () => {
        try {
            const data = await messageService.getConversacion(id);
            setConversation(data);
        } catch (err) {
            console.error('Error al cargar conversación:', err);
            setError('No se pudo cargar la conversación');
        }
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await messageService.getMensajes(id);
            setMessages(response.data || response);

            // Marcar mensajes como leídos
            await messageService.markAllAsRead(id);
        } catch (err) {
            console.error('Error al cargar mensajes:', err);
            setError('No se pudieron cargar los mensajes');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            setSendingMessage(true);
            const response = await messageService.sendMensaje(id, newMessage.trim());

            setMessages(prev => [...prev, response]);
            setNewMessage('');
        } catch (err) {
            console.error('Error al enviar mensaje:', err);
            setError('No se pudo enviar el mensaje');
        } finally {
            setSendingMessage(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Ahora';
        } else if (diffInHours < 24) {
            return date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffInHours < 48) {
            return 'Ayer ' + date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit'
            }) + ' ' + date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const getOtherUser = () => {
        if (!conversation || !user) return null;
        return user.id === conversation.id_comprador
            ? conversation.vendedor
            : conversation.comprador;
    };

    if (loading && !conversation) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <Spinner variant="page" />
                </div>
            </Layout>
        );
    }

    if (error && !conversation) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Alert type="error" message={error} />
                    <Link to="/mensajes" className="text-primary hover:underline mt-4 inline-block">
                        ← Volver a mensajes
                    </Link>
                </div>
            </Layout>
        );
    }

    const otherUser = getOtherUser();

    return (
        <Layout>
            <div className="max-w-4xl mx-auto h-screen flex flex-col">
                {/* Header de la conversación */}
                <div className="bg-background-light dark:bg-primary-dark border-b border-secondary-light dark:border-secondary-dark p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link to="/mensajes" className="text-primary hover:text-primary-dark">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>

                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary dark:text-primary-light">
                                        {otherUser?.nombre?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="font-semibold text-text-dark dark:text-text-light">
                                        {otherUser?.nombre || 'Usuario'}
                                    </h2>
                                    {conversation?.coche && (
                                        <p className="text-sm text-text-secondary dark:text-text-secondary">
                                            {conversation.coche.marca?.nombre} {conversation.coche.modelo?.nombre}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {conversation?.coche && (
                            <Link
                                to={`/coches/${conversation.coche.id}`}
                                className="text-primary hover:text-primary-dark text-sm font-medium"
                            >
                                Ver anuncio
                            </Link>
                        )}
                    </div>
                </div>

                {/* Área de mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {error && (
                        <Alert
                            type="error"
                            message={error}
                            onClose={() => setError(null)}
                            className="mb-4"
                        />
                    )}

                    {loading ? (
                        <div className="flex justify-center">
                            <Spinner />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-text-secondary dark:text-text-secondary">
                                No hay mensajes en esta conversación. ¡Envía el primero!
                            </p>
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const isOwn = message.id_remitente === user?.id;
                            const prevMessage = index > 0 ? messages[index - 1] : null;
                            const showAvatar = !prevMessage || prevMessage.id_remitente !== message.id_remitente;
                            const showName = showAvatar && !isOwn;

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}
                                >
                                    {/* Avatar del remitente (solo para mensajes de otros usuarios) */}
                                    {!isOwn && (
                                        <div className="flex-shrink-0 mr-3">
                                            {showAvatar ? (
                                                <div className="w-8 h-8 rounded-full bg-secondary/20 dark:bg-secondary/30 flex items-center justify-center">
                                                    <span className="text-xs font-medium text-text-secondary">
                                                        {message.remitente?.nombre?.charAt(0).toUpperCase() || otherUser?.nombre?.charAt(0).toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8"></div>
                                            )}
                                        </div>
                                    )}

                                    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
                                        {/* Nombre del remitente */}
                                        {showName && (
                                            <p className="text-xs text-text-secondary mb-1 ml-1">
                                                {message.remitente?.nombre || otherUser?.nombre || 'Usuario'}
                                            </p>
                                        )}

                                        {/* Burbuja del mensaje */}
                                        <div className={`inline-block px-4 py-2 rounded-lg ${isOwn
                                                ? 'bg-primary text-white rounded-br-sm'
                                                : 'bg-secondary-light dark:bg-secondary-dark text-text-dark dark:text-text-light rounded-bl-sm'
                                            }`}>
                                            <p className="text-sm">{message.contenido}</p>
                                        </div>

                                        {/* Timestamp */}
                                        <p className={`text-xs mt-1 ${isOwn
                                                ? 'text-text-secondary'
                                                : 'text-text-secondary'
                                            }`}>
                                            {formatMessageTime(message.created_at)}
                                            {/* Indicador de mensaje propio */}
                                            {isOwn && (
                                                <span className="ml-1 text-primary">
                                                    ✓
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Formulario para enviar mensajes */}
                <div className="bg-background-light dark:bg-primary-dark border-t border-secondary-light dark:border-secondary-dark p-4">
                    <form onSubmit={sendMessage} className="flex space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe tu mensaje..."
                            className="flex-1 px-4 py-2 border border-secondary-light dark:border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background-light dark:bg-primary-dark text-text-dark dark:text-text-light"
                            disabled={sendingMessage}
                        />
                        <Button
                            type="submit"
                            disabled={sendingMessage || !newMessage.trim()}
                            className="px-6"
                        >
                            {sendingMessage ? (
                                <Spinner />
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default ConversationPage;