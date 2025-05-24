import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import messageService from '../../services/messageService';
import echo from '../../services/echoService';
import { formatDate } from '../../utils/formatters';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

const ChatWindow = ({ conversacion }) => {
    const { user } = useAuth();
    const [mensajes, setMensajes] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
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
            const response = await messageService.getMensajes(conversacion.id);
            setMensajes(response.data || []);

            // Marcar mensajes como leídos
            await messageService.markAllAsRead(conversacion.id);
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
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
                    <div>
                        <h3 className="text-lg font-medium text-text-dark dark:text-text-light">
                            {otherUser.nombre}
                        </h3>
                        <p className="text-sm text-text-secondary">
                            {conversacion.coche.marca.nombre} {conversacion.coche.modelo.nombre}
                        </p>
                    </div>
                </div>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        isLoading={sending}
                        className="px-4 py-2"
                    >
                        {sending ? <Spinner /> : 'Enviar'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

ChatWindow.propTypes = {
    conversacion: PropTypes.object
};

export default ChatWindow;