import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import messageService from '../../services/messageService';
import { getEcho } from '../../services/echoService';
// import { formatDate } from '../../utils/formatters';

// Función auxiliar para formatear fechas
const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = (now - date) / (1000 * 60);

        if (diffInMinutes < 1) {
            return 'Ahora';
        } else if (diffInMinutes < 60) {
            return `Hace ${Math.floor(diffInMinutes)} min`;
        } else if (diffInMinutes < 24 * 60) {
            return date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return '';
    }
};
import Button from '../common/Button';
import Spinner from '../common/Spinner';

const ChatWindow = ({ conversacion, onNewMessage }) => {
    const { user } = useAuth();
    const [mensajes, setMensajes] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef(null);
    const echoChannelRef = useRef(null);

    useEffect(() => {
        if (conversacion) {
            console.log('Conversación cambiada, cargando mensajes para conversación:', conversacion.id);
            loadMensajes();
            setupRealtimeConnection();
        }

        // Cleanup function
        return () => {
            cleanupRealtimeConnection();
        };
    }, [conversacion]);

    const setupRealtimeConnection = () => {
        if (!conversacion) return;

        try {
            const echo = getEcho();
            if (!echo) {
                console.warn('Echo no está disponible');
                return;
            }

            // Limpiar conexión anterior si existe
            cleanupRealtimeConnection();

            console.log(`Conectando al canal: conversacion.${conversacion.id}`);

            const channel = echo.private(`conversacion.${conversacion.id}`);
            echoChannelRef.current = channel;

            channel.listen('.message.sent', (data) => {
                console.log('Nuevo mensaje recibido en tiempo real:', data);

                // Solo agregar el mensaje si no es del usuario actual
                if (data.id_remitente !== user?.id) {
                    setMensajes(prevMensajes => {
                        // Evitar duplicados
                        const existingMessage = prevMensajes.find(m => m.id === data.id);
                        if (existingMessage) {
                            return prevMensajes;
                        }

                        const newMensajes = [...prevMensajes, data];
                        console.log('Mensajes actualizados:', newMensajes);

                        // Notificar al componente padre si hay callback
                        if (onNewMessage) {
                            onNewMessage(data);
                        }

                        return newMensajes;
                    });

                    // Marcar como leído automáticamente
                    setTimeout(() => {
                        messageService.markAsRead(conversacion.id, data.id).catch(console.error);
                    }, 1000);
                }
            });

            channel.subscribed(() => {
                console.log('Suscrito exitosamente al canal de conversación');
                setIsConnected(true);
            });

            channel.error((error) => {
                console.error('Error en el canal de Echo:', error);
                setIsConnected(false);
            });

        } catch (error) {
            console.error('Error al configurar conexión en tiempo real:', error);
            setIsConnected(false);
        }
    };

    const cleanupRealtimeConnection = () => {
        if (echoChannelRef.current) {
            try {
                const echo = getEcho();
                if (echo) {
                    echo.leave(`conversacion.${conversacion?.id}`);
                }
                echoChannelRef.current = null;
                setIsConnected(false);
                console.log('Canal de Echo desconectado');
            } catch (error) {
                console.error('Error al limpiar conexión:', error);
            }
        }
    };

    const loadMensajes = async () => {
        if (!conversacion) return;

        try {
            setLoading(true);
            console.log('Cargando mensajes para conversación:', conversacion.id);

            const response = await messageService.getMensajes(conversacion.id);
            console.log('Respuesta de mensajes:', response);

            // La respuesta puede tener la estructura { data: [...], current_page: ..., etc }
            const mensajesData = response.data || response || [];
            console.log('Mensajes extraídos:', mensajesData);

            setMensajes(mensajesData);

            // Marcar mensajes como leídos
            await messageService.markAllAsRead(conversacion.id);
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
            setMensajes([]); // Establecer array vacío en caso de error
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || sending) return;

        const messageContent = newMessage.trim();
        setNewMessage(''); // Limpiar input inmediatamente para mejor UX

        try {
            setSending(true);
            console.log('Enviando mensaje:', messageContent);

            const mensaje = await messageService.sendMensaje(conversacion.id, messageContent);
            console.log('Mensaje enviado:', mensaje);

            // Agregar el mensaje enviado localmente
            setMensajes(prevMensajes => {
                // Evitar duplicados
                const existingMessage = prevMensajes.find(m => m.id === mensaje.id);
                if (existingMessage) {
                    return prevMensajes;
                }

                const newMensajes = [...prevMensajes, mensaje];
                console.log('Mensajes actualizados después de envío:', newMensajes);
                return newMensajes;
            });

        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            // Restaurar el mensaje en caso de error
            setNewMessage(messageContent);
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

    console.log('Renderizando ChatWindow con:', {
        conversacion: conversacion.id,
        mensajesCount: mensajes.length,
        loading,
        mensajes: mensajes.slice(0, 3) 
    });

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-primary-dark">
            {/* Header del chat */}
            <div className="bg-white dark:bg-secondary-dark border-b border-secondary-light dark:border-secondary-dark p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                                {otherUser.nombre.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-text-dark dark:text-text-light">
                                {otherUser.nombre}
                            </h3>
                            <p className="text-sm text-text-secondary">
                                {conversacion.coche.marca.nombre} {conversacion.coche.modelo.nombre}
                            </p>
                        </div>
                    </div>

                    {/* Indicador de conexión */}
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-error'}`}></div>
                        <span className="text-xs text-text-secondary">
                            {isConnected ? 'Conectado' : 'Desconectado'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {loading ? (
                    <div className="flex justify-center">
                        <Spinner />
                    </div>
                ) : mensajes.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-text-secondary">
                            No hay mensajes aún. ¡Envía el primero!
                        </p>
                    </div>
                ) : (
                    mensajes.map((mensaje) => {
                        const isOwn = mensaje.id_remitente === user?.id;

                        console.log('Renderizando mensaje:', {
                            id: mensaje.id,
                            contenido: mensaje.contenido,
                            isOwn,
                            remitente: mensaje.id_remitente,
                            currentUser: user?.id
                        });

                        return (
                            <div
                                key={mensaje.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwn
                                    ? 'bg-primary text-white'
                                    : 'bg-secondary-light dark:bg-secondary-dark text-text-dark dark:text-text-light'
                                    }`}>
                                    <p className="text-sm">{mensaje.contenido}</p>
                                    <p className={`text-xs mt-1 ${isOwn
                                        ? 'text-white/70'
                                        : 'text-text-secondary'
                                        }`}>
                                        {formatDate(mensaje.created_at)}
                                        {!mensaje.leido && !isOwn && (
                                            <span className="ml-2">📩</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input para nuevo mensaje */}
            <div className="border-t border-secondary-light dark:border-secondary-dark p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-4 py-2 border border-secondary-light dark:border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-secondary-dark text-text-dark dark:text-text-light"
                        disabled={sending}
                        maxLength={1000}
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        isLoading={sending}
                        className="px-4 py-2"
                    >
                        {sending ? (
                            <Spinner />
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </Button>
                </form>

                {/* Indicador de estado */}
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-text-secondary">
                        {newMessage.length}/1000
                    </span>
                    {!isConnected && (
                        <span className="text-xs text-warning">
                            Conexión perdida - Los mensajes pueden no llegar en tiempo real
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

ChatWindow.propTypes = {
    conversacion: PropTypes.object,
    onNewMessage: PropTypes.func
};

export default ChatWindow;
