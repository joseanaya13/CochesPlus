// cochesPlus-frontend/src/pages/messages/Messages.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ConversationsList from '../../components/messages/ConversationsList';
import ChatWindow from '../../components/messages/ChatWindow';
import messageService from '../../services/messageService';

const Messages = () => {
    const [searchParams] = useSearchParams();
    const [conversaciones, setConversaciones] = useState([]);
    const [selectedConversacion, setSelectedConversacion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Si hay un parámetro de conversación en la URL, cargar esa conversación
        const conversacionId = searchParams.get('conversacion');
        if (conversacionId) {
            loadSpecificConversacion(parseInt(conversacionId));
        }
    }, [searchParams]);

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
                            </div>
                            <div className="overflow-y-auto h-full p-4">
                                <ConversationsList
                                    onSelectConversation={handleSelectConversation}
                                    selectedConversacionId={selectedConversacion?.id}
                                />
                            </div>
                        </div>

                        {/* Ventana de chat */}
                        <div className="hidden lg:flex lg:w-2/3">
                            <ChatWindow conversacion={selectedConversacion} />
                        </div>
                    </div>

                    {/* Vista móvil del chat */}
                    {selectedConversacion && (
                        <div className="lg:hidden border-t border-secondary-light dark:border-secondary-dark">
                            <div className="h-96">
                                <ChatWindow conversacion={selectedConversacion} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Messages;