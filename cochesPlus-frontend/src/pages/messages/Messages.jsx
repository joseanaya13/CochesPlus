import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ConversationsList from '../../components/messages/ConversationsList';
import ChatWindow from '../../components/messages/ChatWindow';
import messageService from '../../services/messageService';

const Messages = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [selectedConversacion, setSelectedConversacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Si hay un parámetro de conversación en la URL, cargar esa conversación
        const conversacionId = searchParams.get('conversacion');
        if (conversacionId) {
            loadSpecificConversacion(parseInt(conversacionId));
        }
    }, [searchParams]);

    const loadSpecificConversacion = async (conversacionId) => {
        try {
            setLoading(true);
            const conversacion = await messageService.getConversacion(conversacionId);
            setSelectedConversacion(conversacion);
        } catch (error) {
            console.error('Error al cargar conversación específica:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = (conversacion) => {
        setSelectedConversacion(conversacion);

        // En móvil, navegar a la página individual de conversación
        if (isMobile) {
            navigate(`/mensajes/${conversacion.id}`);
        }
    };

    const handleBackToList = () => {
        setSelectedConversacion(null);
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
                        {/* Vista de escritorio */}
                        {!isMobile && (
                            <>
                                {/* Lista de conversaciones */}
                                <div className="w-1/3 border-r border-secondary-light dark:border-secondary-dark">
                                    <div className="p-4 border-b border-secondary-light dark:border-secondary-dark">
                                        <h2 className="text-lg font-semibold text-text-dark dark:text-text-light">
                                            Conversaciones
                                        </h2>
                                    </div>
                                    <div className="overflow-y-auto h-full p-4">
                                        <ConversationsList
                                            onSelectConversation={handleSelectConversation}
                                            selectedConversacionId={selectedConversacion?.id}
                                        />
                                    </div>
                                </div>

                                {/* Ventana de chat */}
                                <div className="flex-1">
                                    <ChatWindow conversacion={selectedConversacion} />
                                </div>
                            </>
                        )}

                        {/* Vista móvil */}
                        {isMobile && (
                            <div className="w-full">
                                {!selectedConversacion ? (
                                    <div>
                                        <div className="p-4 border-b border-secondary-light dark:border-secondary-dark">
                                            <h2 className="text-lg font-semibold text-text-dark dark:text-text-light">
                                                Conversaciones
                                            </h2>
                                        </div>
                                        <div className="overflow-y-auto h-full p-4">
                                            <ConversationsList
                                                onSelectConversation={handleSelectConversation}
                                                selectedConversacionId={selectedConversacion?.id}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="p-4 border-b border-secondary-light dark:border-secondary-dark flex items-center">
                                            <button
                                                onClick={handleBackToList}
                                                className="text-primary hover:text-primary-dark mr-3"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <h2 className="text-lg font-semibold text-text-dark dark:text-text-light">
                                                Conversación
                                            </h2>
                                        </div>
                                        <ChatWindow conversacion={selectedConversacion} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Messages;