import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import messageService from '../../services/messageService';
import echo from '../../services/echoService';
import { formatDate, formatPrice } from '../../utils/formatters';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

const ChatWindow = ({ conversacion }) => {
    const { user } = useAuth();
    const [mensajes, setMensajes] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [loadingError, setLoadingError] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (conversacion) {
            loadMensajes();
            scrollToBottom();
        }
    }, [conversacion]);

    useEffect(() => {
        scrollToBottom();
    }, [mensajes]);

    // Configurar escucha de mensajes en tiempo real
    useEffect(() => {
        if (!conversacion) return;

        const channel = echo.private(`conversacion.${conversacion.id}`);

        channel.listen('.message.sent', (e) => {
            console.log('Nuevo mensaje recibido:', e);
            setMensajes(prevMensajes => [...prevMensajes, e]);
        });

        return () => {
            echo.leave(`conversacion.${conversacion.id}`);
        };
    }, [conversacion]);

    const loadMensajes = async () => {
        if (!conversacion) return;

        try {
            setLoading(true);
            setLoadingError(null);
            const response = await messageService.getMensajes(conversacion.id);
            setMensajes(response.data || []);

            // Marcar mensajes como leídos
            await messageService.markAllAsRead(conversacion.id);
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
            setLoadingError('Error al cargar los mensajes');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || sending) return;

        try {
            setSending(true);
            const mensaje = await messageService.sendMensaje(conversacion.id, newMessage);

            // Agregar el mensaje enviado localmente
            setMensajes(prevMensajes => [...prevMensajes, mensaje]);
            setNewMessage('');
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            // Aquí podrías mostrar una notificación de error
        } finally {
            setSending(false);
        }
    };

    if (!conversacion) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-primary-dark">
                <div className="text-center">
                    <svg className="mx-auto h-16 w-16 text-text-secondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <h3 className="text-lg font-medium text-text-dark dark:text-text-light mb-2">
                        Selecciona una conversación
                    </h3>
                    <p className="text-text-secondary">
                        Elige una conversación de la lista para empezar a chatear
                    </p>
                </div>
            </div>
        );
    }

    const otherUser = conversacion.comprador.id === user?.id
        ? conversacion.vendedor
        : conversacion.comprador;

    // Formatear fecha usando el formateador correcto
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
        } else {
            return formatDate(dateString);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-primary-dark">
            {/* Header del chat */}
            <div className="bg-white dark:bg-secondary-dark border-b border-secondary-light dark:border-secondary-dark p-4">
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                            {otherUser.nombre.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-medium text-text-dark dark:text-text-light">
                            {otherUser.nombre}
                        </h3>
                        <div className="flex items-center text-sm text-text-secondary">
                            <span>{conversacion.coche.marca.nombre} {conversacion.coche.modelo.nombre}</span>
                            <span className="mx-2">•</span>
                            <span className="font-medium text-primary">
                                {formatPrice(conversacion.coche.precio)}
                            </span>
                        </div>
                    </div>

                    {/* Estado de conexión */}
                    <div className="flex items-center text-xs text-text-secondary">
                        <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                        <span>En línea</span>
                    </div>
                </div>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="flex flex-col items-center">
                            <Spinner variant="page" />
                            <p className="text-text-secondary mt-2">Cargando mensajes...</p>
                        </div>
                    </div>
                ) : loadingError ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-error mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-error font-medium">{loadingError}</p>
                            <button
                                onClick={loadMensajes}
                                className="text-primary hover:text-primary-dark mt-2 text-sm"
                            >
                                Intentar de nuevo
                            </button>
                        </div>
                    </div>
                ) : mensajes.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-text-secondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <p className="text-text-secondary">
                            No hay mensajes aún. ¡Envía el primero!
                        </p>
                    </div>
                ) : (
                    mensajes.map((mensaje) => {
                        const isOwn = mensaje.id_remitente === user?.id;
                        const senderName = isOwn ? 'Tú' : (mensaje.remitente?.nombre || otherUser.nombre);

                        return (
                            <div
                                key={mensaje.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
                            >
                                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                                    {/* Avatar y nombre del remitente */}
                                    <div className={`flex items-center mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        {!isOwn && (
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                                                <span className="text-xs font-medium text-primary">
                                                    {senderName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <span className={`text-xs font-medium ${isOwn
                                                ? 'text-primary'
                                                : 'text-text-secondary dark:text-text-secondary'
                                            }`}>
                                            {senderName}
                                        </span>
                                        {isOwn && (
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center ml-2">
                                                <span className="text-xs font-medium text-primary">
                                                    {senderName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Burbuja del mensaje */}
                                    <div className={`px-4 py-2 rounded-lg ${isOwn
                                        ? 'bg-primary text-white rounded-br-sm'
                                        : 'bg-secondary-light dark:bg-secondary-dark text-text-dark dark:text-text-light rounded-bl-sm'
                                        }`}>
                                        <p className="text-sm">{mensaje.contenido}</p>
                                        <div className={`flex items-center justify-between mt-1`}>
                                            <p className={`text-xs ${isOwn
                                                ? 'text-white/70'
                                                : 'text-text-secondary'
                                                }`}>
                                                {formatMessageTime(mensaje.created_at)}
                                            </p>

                                            {/* Estado del mensaje para mensajes propios */}
                                            {isOwn && (
                                                <div className="ml-2">
                                                    {mensaje.leido ? (
                                                        <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input para nuevo mensaje */}
            <div className="border-t border-secondary-light dark:border-secondary-dark p-4 bg-white dark:bg-secondary-dark">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Mensaje a ${otherUser.nombre}...`}
                            className="w-full px-4 py-2 border border-secondary-light dark:border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-secondary-dark text-text-dark dark:text-text-light"
                            disabled={sending}
                            maxLength={1000}
                        />
                        {newMessage.length > 800 && (
                            <div className="absolute -top-6 right-2 text-xs text-text-secondary">
                                {1000 - newMessage.length} caracteres restantes
                            </div>
                        )}
                    </div>
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        isLoading={sending}
                        className="px-4 py-2 flex items-center"
                        title={sending ? 'Enviando...' : 'Enviar mensaje'}
                    >
                        {sending ? (
                            <Spinner />
                        ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </Button>
                </form>

                {/* Indicador de escritura (placeholder para futura implementación) */}
                <div className="mt-2 text-xs text-text-secondary h-4">
                    {/* Aquí se podría agregar "Usuario está escribiendo..." */}
                </div>
            </div>
        </div>
    );
};

ChatWindow.propTypes = {
    conversacion: PropTypes.object
};

export default ChatWindow;