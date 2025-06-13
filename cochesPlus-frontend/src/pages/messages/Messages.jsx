import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ConversationsList from '../../components/messages/ConversationsList';
import ChatWindow from '../../components/messages/ChatWindow';
import messageService from '../../services/messageService';
import { getEcho } from '../../services/echoService';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';

const Messages = () => {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [conversaciones, setConversaciones] = useState([]);
    const [selectedConversacion, setSelectedConversacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para controlar la vista en móviles
    const [isMobile, setIsMobile] = useState(false);
    const [showChat, setShowChat] = useState(false);

    // Detectar si es móvil
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

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

            // En móvil, mostrar el chat automáticamente si se selecciona una conversación
            if (isMobile) {
                setShowChat(true);
            }
        } catch (error) {
            console.error('Error al cargar conversación específica:', error);
        }
    };

    const handleSelectConversation = (conversacion) => {
        setSelectedConversacion(conversacion);

        // En móvil, mostrar la vista de chat
        if (isMobile) {
            setShowChat(true);
        }

        // Actualizar URL sin recargar la página
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('conversacion', conversacion.id);
        window.history.pushState({}, '', newUrl);
    };

    const handleBackToConversations = () => {
        setShowChat(false);
        setSelectedConversacion(null);

        // Limpiar parámetro de conversación de la URL
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('conversacion');
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
            {/* Header */}
            <div className="bg-primary-light dark:bg-primary-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="flex items-center">
                        {/* Botón de volver en móvil cuando se muestra el chat */}
                        {isMobile && showChat && (
                            <Button
                                variant="background-light"
                                onClick={handleBackToConversations}
                                className="mr-4 !p-2"
                                aria-label="Volver a conversaciones"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Button>
                        )}

                        <div>
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-text-dark dark:text-text-light">
                                {isMobile && showChat && selectedConversacion ? 'Chat' : 'Mensajes'}
                            </h1>
                            <p className="mt-1 lg:mt-2 text-sm lg:text-base text-text-dark dark:text-text-light">
                                {isMobile && showChat && selectedConversacion
                                    ? `${selectedConversacion.comprador.id === user?.id
                                        ? selectedConversacion.vendedor.nombre
                                        : selectedConversacion.comprador.nombre}`
                                    : 'Conversa con compradores y vendedores'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md overflow-hidden h-[calc(100vh-200px)] lg:h-[600px]">
                    {/* Desktop: Vista de dos paneles */}
                    <div className="hidden lg:flex h-full">
                        {/* Lista de conversaciones */}
                        <div className="w-1/3 border-r border-secondary-light dark:border-secondary-dark flex flex-col">
                            <div className="p-4 border-b border-secondary-light dark:border-secondary-dark flex-shrink-0">
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
                            <div className="flex-1 overflow-hidden">
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
                        <div className="flex-1">
                            <ChatWindow
                                conversacion={selectedConversacion}
                                onNewMessage={handleNewMessage}
                            />
                        </div>
                    </div>

                    {/* Mobile: Vista condicional */}
                    <div className="lg:hidden h-full">
                        {!showChat ? (
                            /* Lista de conversaciones en móvil */
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b border-secondary-light dark:border-secondary-dark flex-shrink-0">
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
                                <div className="flex-1 overflow-hidden">
                                    <ConversationsList
                                        conversaciones={conversaciones}
                                        onSelectConversation={handleSelectConversation}
                                        selectedConversacionId={selectedConversacion?.id}
                                        loading={loading}
                                        error={error}
                                    />
                                </div>
                            </div>
                        ) : (
                            /* Chat en móvil */
                            <div className="h-full">
                                <ChatWindow
                                    conversacion={selectedConversacion}
                                    onNewMessage={handleNewMessage}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Indicador de estado de conexión */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-text-secondary dark:text-text-secondary">
                        Los mensajes se actualizan automáticamente en tiempo real
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default Messages;