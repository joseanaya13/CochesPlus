// cochesPlus-frontend/src/pages/admin/AdminMessages.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import AdminTable from '../../components/admin/AdminTable';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import InputField from '../../components/common/InputField';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

const AdminMessages = () => {
    const [activeTab, setActiveTab] = useState('messages');
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Paginación y filtros
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Modales
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showConversationModal, setShowConversationModal] = useState(false);
    const [showCloseConversationModal, setShowCloseConversationModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [conversationMessages, setConversationMessages] = useState([]);
    const [closeReason, setCloseReason] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'messages') {
            loadMessages();
        } else {
            loadConversations();
        }
    }, [activeTab, currentPage, searchTerm]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                per_page: 20,
                ...(searchTerm && { search: searchTerm }),
            };

            const response = await adminService.getMessages(params);
            setMessages(response.data || []);
            setCurrentPage(response.current_page || 1);
            setTotalPages(response.last_page || 1);
            setError(null);
        } catch (err) {
            setError('Error al cargar mensajes');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadConversations = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                per_page: 15,
                active_only: false
            };

            const response = await adminService.getConversations(params);
            setConversations(response.data || []);
            setCurrentPage(response.current_page || 1);
            setTotalPages(response.last_page || 1);
            setError(null);
        } catch (err) {
            setError('Error al cargar conversaciones');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleViewMessage = async (message) => {
        try {
            setModalLoading(true);
            const fullMessage = await adminService.getMessage(message.id);
            setSelectedItem(fullMessage);
            setShowMessageModal(true);
        } catch (err) {
            setError('Error al cargar detalles del mensaje');
        } finally {
            setModalLoading(false);
        }
    };

    const handleDeleteMessage = (message) => {
        setSelectedItem(message);
        setShowDeleteModal(true);
    };

    const handleViewConversation = async (conversation) => {
        try {
            setModalLoading(true);
            const messages = await adminService.getConversationMessages(conversation.id);
            setConversationMessages(messages.mensajes || []);
            setSelectedItem(messages.conversacion);
            setShowConversationModal(true);
        } catch (err) {
            setError('Error al cargar mensajes de la conversación');
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseConversation = (conversation) => {
        setSelectedItem(conversation);
        setCloseReason('');
        setShowCloseConversationModal(true);
    };

    const submitDeleteMessage = async () => {
        try {
            setModalLoading(true);
            await adminService.deleteMessage(selectedItem.id);
            setShowDeleteModal(false);
            setSuccessMessage('Mensaje eliminado exitosamente');
            loadMessages();
        } catch (err) {
            setError(err.message || 'Error al eliminar mensaje');
        } finally {
            setModalLoading(false);
        }
    };

    const submitCloseConversation = async () => {
        try {
            setModalLoading(true);
            await adminService.closeConversation(selectedItem.id, closeReason);
            setShowCloseConversationModal(false);
            setSuccessMessage('Conversación cerrada exitosamente');
            loadConversations();
        } catch (err) {
            setError(err.message || 'Error al cerrar conversación');
        } finally {
            setModalLoading(false);
        }
    };

    const messageColumns = [
        {
            key: 'id',
            header: 'ID'
        },
        {
            key: 'contenido',
            header: 'Contenido',
            render: (content) => (
                <div className="max-w-xs truncate">
                    {content.substring(0, 50)}...
                </div>
            )
        },
        {
            key: 'remitente',
            header: 'Remitente',
            render: (remitente) => (
                <div>
                    <div className="font-medium">{remitente.nombre}</div>
                    <div className="text-xs text-text-secondary">{remitente.email}</div>
                </div>
            )
        },
        {
            key: 'conversacion',
            header: 'Coche',
            render: (conversacion) => (
                <div className="text-sm">
                    {conversacion.coche.marca} {conversacion.coche.modelo}
                    <div className="text-xs text-success">{conversacion.coche.precio}€</div>
                </div>
            )
        },
        {
            key: 'leido',
            header: 'Estado',
            render: (leido) => (
                <span className={`px-2 py-1 rounded text-xs ${leido ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {leido ? 'Leído' : 'No leído'}
                </span>
            )
        },
        {
            key: 'creado_en',
            header: 'Fecha',
            render: (date) => formatDate(date)
        }
    ];

    const conversationColumns = [
        {
            key: 'id',
            header: 'ID'
        },
        {
            key: 'comprador',
            header: 'Comprador',
            render: (comprador) => (
                <div>
                    <div className="font-medium">{comprador.nombre}</div>
                    <div className="text-xs text-text-secondary">{comprador.email}</div>
                </div>
            )
        },
        {
            key: 'vendedor',
            header: 'Vendedor',
            render: (vendedor) => (
                <div>
                    <div className="font-medium">{vendedor.nombre}</div>
                    <div className="text-xs text-text-secondary">{vendedor.email}</div>
                </div>
            )
        },
        {
            key: 'coche',
            header: 'Coche',
            render: (coche) => (
                <div>
                    <div className="font-medium">{coche.marca} {coche.modelo}</div>
                    <div className="text-xs text-success">{coche.precio}€</div>
                </div>
            )
        },
        {
            key: 'cantidad_mensajes',
            header: 'Mensajes'
        },
        {
            key: 'ultimo_mensaje',
            header: 'Último mensaje',
            render: (ultimoMensaje) => ultimoMensaje ? (
                <div className="max-w-xs">
                    <div className="text-sm truncate">{ultimoMensaje.contenido}</div>
                    <div className="text-xs text-text-secondary">{ultimoMensaje.remitente}</div>
                </div>
            ) : 'Sin mensajes'
        },
        {
            key: 'actualizado_en',
            header: 'Última actividad',
            render: (date) => formatDate(date)
        }
    ];

    const messageActions = [
        {
            label: 'Ver',
            onClick: handleViewMessage,
            variant: 'primary',
            icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        },
        {
            label: 'Eliminar',
            onClick: handleDeleteMessage,
            variant: 'error',
            icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        }
    ];

    const conversationActions = [
        {
            label: 'Ver mensajes',
            onClick: handleViewConversation,
            variant: 'primary',
            icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        },
        {
            label: 'Cerrar',
            onClick: handleCloseConversation,
            variant: 'warning',
            icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
        }
    ];

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold !text-text-dark">
                        Gestión de Mensajes y Conversaciones
                    </h1>
                </div>

                {/* Alertas */}
                {error && (
                    <Alert
                        type="error"
                        message={error}
                        onClose={() => setError(null)}
                        className="mb-4"
                    />
                )}

                {successMessage && (
                    <Alert
                        type="success"
                        message={successMessage}
                        onClose={() => setSuccessMessage('')}
                        className="mb-4"
                    />
                )}

                {/* Tabs */}
                <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md mb-6">
                    <div className="border-b border-secondary-light dark:border-secondary-dark">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('messages')}
                                className={`py-4 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${activeTab === 'messages'
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-text-dark dark:text-text-light hover:text-primary'
                                    }`}
                            >
                                Mensajes
                            </button>
                            <button
                                onClick={() => setActiveTab('conversations')}
                                className={`py-4 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${activeTab === 'conversations'
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-text-dark dark:text-text-light hover:text-primary'
                                    }`}
                            >
                                Conversaciones
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Filtros para mensajes */}
                        {activeTab === 'messages' && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <InputField
                                    label="Buscar en contenido"
                                    placeholder="Texto del mensaje..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                                <div className="flex items-center">
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setCurrentPage(1);
                                        }}
                                        className="w-full"
                                    >
                                        Limpiar filtro
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Tabla de mensajes */}
                        {activeTab === 'messages' ? (
                            <AdminTable
                                columns={messageColumns}
                                data={messages}
                                loading={loading}
                                pagination={{
                                    currentPage,
                                    totalPages,
                                    total: messages.length
                                }}
                                onPageChange={handlePageChange}
                                actions={messageActions}
                                emptyMessage="No se encontraron mensajes"
                            />
                        ) : (
                            <AdminTable
                                columns={conversationColumns}
                                data={conversations}
                                loading={loading}
                                pagination={{
                                    currentPage,
                                    totalPages,
                                    total: conversations.length
                                }}
                                onPageChange={handlePageChange}
                                actions={conversationActions}
                                emptyMessage="No se encontraron conversaciones"
                            />
                        )}
                    </div>
                </div>

                {/* Modal Ver Mensaje */}
                <Modal
                    isOpen={showMessageModal}
                    onClose={() => setShowMessageModal(false)}
                    title="Detalles del Mensaje"
                    confirmAction={() => setShowMessageModal(false)}
                    confirmText="Cerrar"
                    cancelText=""
                >
                    {selectedItem && (
                        <div className="space-y-4">
                            <div>
                                <strong>ID:</strong> {selectedItem.id}
                            </div>
                            <div>
                                <strong>Remitente:</strong> {selectedItem.remitente?.nombre} ({selectedItem.remitente?.email})
                            </div>
                            <div>
                                <strong>Coche:</strong> {selectedItem.conversacion?.coche?.marca} {selectedItem.conversacion?.coche?.modelo}
                            </div>
                            <div>
                                <strong>Contenido:</strong>
                                <div className="mt-2 p-3 bg-secondary-light/20 dark:bg-secondary-dark/20 rounded">
                                    {selectedItem.contenido}
                                </div>
                            </div>
                            <div>
                                <strong>Estado:</strong> {selectedItem.leido ? 'Leído' : 'No leído'}
                            </div>
                            <div>
                                <strong>Fecha:</strong> {formatDate(selectedItem.creado_en)}
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Modal Ver Conversación */}
                <Modal
                    isOpen={showConversationModal}
                    onClose={() => setShowConversationModal(false)}
                    title="Mensajes de la Conversación"
                    confirmAction={() => setShowConversationModal(false)}
                    confirmText="Cerrar"
                    cancelText=""
                >
                    {selectedItem && (
                        <div className="space-y-4">
                            <div className="border-b pb-4">
                                <div><strong>Comprador:</strong> {selectedItem.comprador?.nombre}</div>
                                <div><strong>Vendedor:</strong> {selectedItem.vendedor?.nombre}</div>
                                <div><strong>Coche:</strong> {selectedItem.coche?.marca} {selectedItem.coche?.modelo}</div>
                            </div>

                            <div className="max-h-96 overflow-y-auto space-y-3">
                                {conversationMessages.map((msg, index) => (
                                    <div key={index} className="p-3 bg-secondary-light/20 dark:bg-secondary-dark/20 rounded">
                                        <div className="flex justify-between items-start mb-2">
                                            <strong>{msg.remitente.nombre}</strong>
                                            <span className="text-xs text-text-secondary">{formatDate(msg.creado_en)}</span>
                                        </div>
                                        <div>{msg.contenido}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Modal Eliminar Mensaje */}
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Confirmar Eliminación"
                    confirmAction={submitDeleteMessage}
                    confirmText={modalLoading ? "Eliminando..." : "Eliminar"}
                    cancelText="Cancelar"
                >
                    <p className="mb-4">
                        ¿Estás seguro de que quieres eliminar este mensaje?
                    </p>
                    <p className="text-sm text-text-secondary dark:text-text-secondary">
                        Esta acción no se puede deshacer.
                    </p>
                </Modal>

                {/* Modal Cerrar Conversación */}
                <Modal
                    isOpen={showCloseConversationModal}
                    onClose={() => setShowCloseConversationModal(false)}
                    title="Cerrar Conversación"
                    confirmAction={submitCloseConversation}
                    confirmText={modalLoading ? "Cerrando..." : "Cerrar Conversación"}
                    cancelText="Cancelar"
                >
                    <div className="space-y-4">
                        <p>
                            ¿Estás seguro de que quieres cerrar esta conversación?
                        </p>
                        <InputField
                            label="Razón (opcional)"
                            placeholder="Motivo del cierre..."
                            value={closeReason}
                            onChange={(e) => setCloseReason(e.target.value)}
                        />
                    </div>
                </Modal>
            </div>
        </Layout>
    );
};

export default AdminMessages;