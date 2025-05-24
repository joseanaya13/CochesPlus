import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ConversationsList from '../../components/messages/ConversationsList';
import ChatWindow from '../../components/messages/ChatWindow';
import messageService from '../../services/messageService';
import { getEcho } from '../../services/echoService';
import { useAuth } from '../../contexts/AuthContext';

const Messages = () => {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [conversaciones, setConversaciones] = useState([]);
    const [selectedConversacion, setSelectedConversacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadConversaciones();

        // Si hay un parámetro de conversación en la URL, cargar esa conversación
        const conversacionId = searchParams.get('conversacion');
        if (conversacionId) {
            loadSpecificConversacion(parseInt(conversacionId));
        }
    }, [searchParams]);

    // Configurar escucha global para nuevos mensajes en cualquier conversación
    useEffect(() => {
        if (!user || conversaciones.length === 0) return;

        const echo = getEcho();
        if (!echo) return;

        // Escuchar en el canal personal del usuario para notificaciones de nuevos mensajes
        const userChannel = echo.private(`App.Models.User.${user.id}`);

        userChannel.notification((notification) => {
            console.log('Nueva notificación recibida:', notification);

            // Actualizar la lista de conversaciones cuando hay un nuevo mensaje
            if (notification.type === 'NewMessage') {
                loadConversaciones();
            }
        });

        return () => {
            echo.leave(`App.Models.User.${user.id}`);
        };
    }, [user, conversaciones.length]);

    const loadConversaciones = async () => {
        try {
            setLoading(true);
            const data = await messageService.getConversaciones();
            setConversaciones(data);

            // Si hay una conversación seleccionada, actualizar su información
            if (selectedConversacion) {
                const updatedConversacion = data.find(c => c.id === selectedConversacion.id);
                if (updatedConversacion) {
                    setSelectedConversacion(updatedConversacion);
                }
            }
        } catch (err) {
            console.error('Error al cargar conversaciones:', err);
            setError('No se pudieron cargar las conversaciones');
        } finally {
            setLoading(false);
        }
    };

    const loadSpecificConversacion = async (conversacionId) => {
        try {
            const conversacion = await messageService.getConversacion(conversacionId);
            setSelectedConversacion(conversacion);
        } catch (error) {
            console.error('Error al cargar conversación específica:', error);
        }
    };

    const handleSelectConversation = (conversacion) => {
        setSelectedConversacion(conversacion);

        // Actualizar URL sin recargar la página
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('conversacion', conversacion.id);
        window.history.pushState({}, '', newUrl);
    };

    const handleNewMessage = (mensaje) => {
        // Actualizar la lista de conversaciones cuando llega un nuevo mensaje
        setConversaciones(prev => {
            return prev.map(conv => {
                if (conv.id === mensaje.id_conversacion) {
                    return {
                        ...conv,
                        mensajes: [mensaje], // Solo el último mensaje
                        updated_at: mensaje.created_at
                    };
                }
                return conv;
            }).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        });
    };

    return (
        <Layout>
            <div className="bg-primary text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-extrabold">Mensajes</h1>
                    <p className="mt-2">Conversa con compradores y vendedores</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-primary-dark rounded-lg shadow-md overflow-hidden">
                    <div className="flex h-96 lg:h-[600px]">
                        {/* Lista de conversaciones */}
                        <div className="w-full lg:w-1/3 border-r border-secondary-light dark:border-secondary-dark">
                            <div className="p-4 border-b border-secondary-light dark:border-secondary-dark">
                                <h2 className="text-lg font-semibold text-text-dark dark:text-text-light">
                                    Conversaciones
                                </h2>
                                {loading && (
                                    <div className="mt-2">
                                        <div className="animate-pulse flex space-x-2">
                                            <div className="h-2 bg-secondary-light dark:bg-secondary-dark rounded w-1/4"></div>
                                            <div className="h-2 bg-secondary-light dark:bg-secondary-dark rounded w-1/4"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="overflow-y-auto h-full">
                                <ConversationsList
                                    conversaciones={conversaciones}
                                    onSelectConversation={handleSelectConversation}
                                    selectedConversacionId={selectedConversacion?.id}
                                    loading={loading}
                                    error={error}
                                />
                            </div>
                        </div>

                        {/* Ventana de chat */}
                        <div className="hidden lg:flex lg:w-2/3">
                            <ChatWindow
                                conversacion={selectedConversacion}
                                onNewMessage={handleNewMessage}
                            />
                        </div>
                    </div>

                    {/* Vista móvil del chat */}
                    {selectedConversacion && (
                        <div className="lg:hidden border-t border-secondary-light dark:border-secondary-dark">
                            <div className="h-96">
                                <ChatWindow
                                    conversacion={selectedConversacion}
                                    onNewMessage={handleNewMessage}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Indicador de estado de conexión global */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-text-secondary">
                        Los mensajes se actualizan automáticamente en tiempo real
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default Messages;