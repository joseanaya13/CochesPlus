import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ConversationsList from '../../components/messages/ConversationsList';
import ChatWindow from '../../components/messages/ChatWindow';
import messageService from '../../services/messageService';

const Messages = () => {
    const [searchParams] = useSearchParams();
    const [selectedConversacion, setSelectedConversacion] = useState(null);
    const [loadingSpecific, setLoadingSpecific] = useState(false);

    useEffect(() => {
        // Si hay un parámetro de conversación en la URL, cargar esa conversación
        const conversacionId = searchParams.get('conversacion');
        if (conversacionId && !isNaN(conversacionId)) {
            loadSpecificConversacion(parseInt(conversacionId));
        }
    }, [searchParams]);

    const loadSpecificConversacion = async (conversacionId) => {
        try {
            setLoadingSpecific(true);
            const conversacion = await messageService.getConversacion(conversacionId);
            setSelectedConversacion(conversacion);
        } catch (error) {
            console.error('Error al cargar conversación específica:', error);
            // La conversación no existe o no tenemos acceso, resetear la selección
            setSelectedConversacion(null);
        } finally {
            setLoadingSpecific(false);
        }
    };

    const handleSelectConversation = (conversacion) => {
        setSelectedConversacion(conversacion);
        // Opcional: actualizar la URL sin navegar
        // window.history.replaceState(null, '', `/mensajes?conversacion=${conversacion.id}`);
    };

    return (
        <Layout>
            {/* Header */}
            <div className="bg-primary text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-extrabold">Mensajes</h1>
                    <p className="mt-2">Conversa con compradores y vendedores</p>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-primary-dark rounded-lg shadow-md overflow-hidden h-[600px]">
                    <div className="flex h-full">
                        {/* Lista de conversaciones - siempre visible en desktop, oculta en móvil cuando hay conversación seleccionada */}
                        <div className={`w-full lg:w-1/3 border-r border-secondary-light dark:border-secondary-dark flex flex-col ${selectedConversacion ? 'hidden lg:flex' : 'flex'
                            }`}>
                            <div className="p-4 border-b border-secondary-light dark:border-secondary-dark flex-shrink-0">
                                <h2 className="text-lg font-semibold text-text-dark dark:text-text-light">
                                    Conversaciones
                                </h2>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3">
                                <ConversationsList
                                    onSelectConversation={handleSelectConversation}
                                    selectedConversacionId={selectedConversacion?.id}
                                />
                            </div>
                        </div>

                        {/* Ventana de chat - visible en desktop, reemplaza lista en móvil */}
                        <div className={`lg:w-2/3 flex flex-col ${selectedConversacion ? 'w-full flex' : 'hidden lg:flex'
                            }`}>
                            {loadingSpecific ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        <p className="text-text-secondary mt-2 text-sm">Cargando conversación...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col relative">
                                    {/* Botón de volver en móvil */}
                                    {selectedConversacion && (
                                        <div className="lg:hidden absolute top-4 left-4 z-10">
                                            <button
                                                onClick={() => setSelectedConversacion(null)}
                                                className="bg-white dark:bg-primary-dark shadow-md rounded-full p-2 text-primary hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors"
                                                aria-label="Volver a conversaciones"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                    <ChatWindow conversacion={selectedConversacion} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Messages;