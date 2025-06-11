// cochesPlus-frontend/src/pages/admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import AdminTable from '../../components/admin/AdminTable';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import InputField from '../../components/common/InputField';
import SelectField from '../../components/common/SelectField';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Paginación y filtros
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Modales
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Formulario
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        telefono: '',
        direccion: '',
        roles: []
    });

    const roleOptions = [
        { value: 'admin', label: 'Administrador' },
        { value: 'vendedor', label: 'Vendedor' },
        { value: 'comprador', label: 'Comprador' }
    ];

    useEffect(() => {
        loadUsers();
    }, [currentPage, searchTerm, roleFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                per_page: 15,
                ...(searchTerm && { search: searchTerm }),
                ...(roleFilter && { role: roleFilter })
            };

            const response = await adminService.getUsers(params);
            setUsers(response.data || []);
            setCurrentPage(response.current_page || 1);
            setTotalPages(response.last_page || 1);
            setError(null);
        } catch (err) {
            setError('Error al cargar usuarios');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleRoleFilter = (e) => {
        setRoleFilter(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            email: '',
            password: '',
            telefono: '',
            direccion: '',
            roles: []
        });
    };

    const handleCreateUser = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setFormData({
            nombre: user.nombre,
            email: user.email,
            password: '',
            telefono: user.telefono || '',
            direccion: user.direccion || '',
            roles: user.roles || []
        });
        setShowEditModal(true);
    };

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        // Mapear nombres de campos del modal a propiedades del formData
        const fieldName = name === 'user_email' ? 'email' : name;
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleRolesChange = (e) => {
        const value = e.target.value;
        setFormData(prev => {
            let newRoles = [...prev.roles];

            if (prev.roles.includes(value)) {
                // Si está marcado, lo desmarcamos
                newRoles = newRoles.filter(role => role !== value);

                // Si desmarcamos vendedor o comprador, también desmarcamos el otro
                if (value === 'vendedor' || value === 'comprador') {
                    newRoles = newRoles.filter(role => role !== 'vendedor' && role !== 'comprador');
                }
            } else {
                // Si no está marcado, lo marcamos
                newRoles.push(value);

                // Si marcamos vendedor o comprador, automáticamente marcamos ambos
                if (value === 'vendedor' || value === 'comprador') {
                    if (!newRoles.includes('vendedor')) newRoles.push('vendedor');
                    if (!newRoles.includes('comprador')) newRoles.push('comprador');
                }
            }

            return {
                ...prev,
                roles: newRoles
            };
        });
    };

    const submitCreateUser = async () => {
        try {
            setModalLoading(true);
            await adminService.createUser(formData);
            setShowCreateModal(false);
            setSuccessMessage('Usuario creado exitosamente');
            loadUsers();
            resetForm();
        } catch (err) {
            setError(err.message || 'Error al crear usuario');
        } finally {
            setModalLoading(false);
        }
    };

    const submitEditUser = async () => {
        try {
            setModalLoading(true);
            const updateData = { ...formData };
            if (!updateData.password) {
                delete updateData.password;
            }
            await adminService.updateUser(selectedUser.id, updateData);
            setShowEditModal(false);
            setSuccessMessage('Usuario actualizado exitosamente');
            loadUsers();
            resetForm();
        } catch (err) {
            setError(err.message || 'Error al actualizar usuario');
        } finally {
            setModalLoading(false);
        }
    };

    const submitDeleteUser = async () => {
        try {
            setModalLoading(true);
            await adminService.deleteUser(selectedUser.id);
            setShowDeleteModal(false);
            setSuccessMessage('Usuario eliminado exitosamente');
            loadUsers();
        } catch (err) {
            setError(err.message || 'Error al eliminar usuario');
        } finally {
            setModalLoading(false);
        }
    };

    const columns = [
        {
            key: 'id',
            header: 'ID'
        },
        {
            key: 'nombre',
            header: 'Nombre'
        },
        {
            key: 'email',
            header: 'Email'
        },
        {
            key: 'roles',
            header: 'Roles',
            render: (roles) => (
                <div className="flex flex-wrap gap-1">
                    {roles?.map(role => (
                        <span key={role} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                            {role}
                        </span>
                    ))}
                </div>
            )
        },
        {
            key: 'cantidad_anuncios',
            header: 'Anuncios'
        },
        {
            key: 'creado_en',
            header: 'Fecha Registro',
            render: (date) => formatDate(date)
        },
        {
            key: 'email_verificado_en',
            header: 'Verificado',
            render: (date) => date ? (
                <span className="text-success">✓</span>
            ) : (
                <span className="text-warning">Pendiente</span>
            )
        }
    ];

    const actions = [
        {
            label: 'Editar',
            onClick: handleEditUser,
            variant: 'primary',
            icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        },
        {
            label: 'Eliminar',
            onClick: handleDeleteUser,
            variant: 'error',
            icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        }
    ];

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold !text-text-dark">
                        Gestión de Usuarios
                    </h1>
                    <Button onClick={handleCreateUser} className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Crear Usuario
                    </Button>
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

                {/* Filtros */}
                <div className="bg-primary-light dark:bg-primary-dark rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField
                            label="Buscar usuarios"
                            placeholder="Nombre o email..."
                            value={searchTerm}
                            onChange={handleSearch}
                            autoComplete="off"
                            name="search-users"
                        />
                        <SelectField
                            label="Filtrar por rol"
                            value={roleFilter}
                            onChange={handleRoleFilter}
                            options={[
                                { value: '', label: 'Todos los roles' },
                                ...roleOptions
                            ]}
                        />
                        <div className="flex items-center">
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setSearchTerm('');
                                    setRoleFilter('');
                                    setCurrentPage(1);
                                }}
                                className="w-full"
                            >
                                Limpiar filtros
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                <AdminTable
                    columns={columns}
                    data={users}
                    loading={loading}
                    pagination={{
                        currentPage,
                        totalPages,
                        total: users.length
                    }}
                    onPageChange={handlePageChange}
                    actions={actions}
                    emptyMessage="No se encontraron usuarios"
                />

                {/* Modal Crear Usuario */}
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Crear Nuevo Usuario"
                    confirmAction={submitCreateUser}
                    confirmText={modalLoading ? "Creando..." : "Crear Usuario"}
                    cancelText="Cancelar"
                >
                    <div className="space-y-4">
                        <InputField
                            label="Nombre completo"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleFormChange}
                            autoComplete="off"
                            required
                        />
                        <InputField
                            label="Email"
                            name="user_email"
                            type="email"
                            value={formData.email}
                            onChange={handleFormChange}
                            autoComplete="off"
                            required
                        />
                        <InputField
                            label="Contraseña"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleFormChange}
                            autoComplete="new-password"
                            required
                        />
                        <InputField
                            label="Teléfono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleFormChange}
                        />
                        <InputField
                            label="Dirección"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleFormChange}
                        />
                        <div>
                            <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-2">
                                Roles
                            </label>
                            <div className="space-y-2">
                                {roleOptions.map(role => (
                                    <label key={role.value} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            value={role.value}
                                            checked={formData.roles.includes(role.value)}
                                            onChange={handleRolesChange}
                                            className="mr-2"
                                        />
                                        {role.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal>

                {/* Modal Editar Usuario */}
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title="Editar Usuario"
                    confirmAction={submitEditUser}
                    confirmText={modalLoading ? "Guardando..." : "Guardar Cambios"}
                    cancelText="Cancelar"
                >
                    <div className="space-y-4">
                        <InputField
                            label="Nombre completo"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleFormChange}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            required
                        />
                        <InputField
                            label="Email"
                            name="user_email"
                            type="email"
                            value={formData.email}
                            onChange={handleFormChange}
                            autoComplete="off"
                            required
                        />
                        <InputField
                            label="Nueva contraseña (opcional)"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleFormChange}
                            placeholder="Dejar vacío para mantener actual"
                            autoComplete="new-password"
                        />
                        <InputField
                            label="Teléfono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleFormChange}
                        />
                        <InputField
                            label="Dirección"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleFormChange}
                        />
                        <div>
                            <label className="block text-sm font-medium text-text-dark dark:text-text-light mb-2">
                                Roles
                            </label>
                            <div className="space-y-2">
                                {roleOptions.map(role => (
                                    <label key={role.value} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            value={role.value}
                                            checked={formData.roles.includes(role.value)}
                                            onChange={handleRolesChange}
                                            className="mr-2"
                                        />
                                        {role.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal>

                {/* Modal Eliminar Usuario */}
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Confirmar Eliminación"
                    confirmAction={submitDeleteUser}
                    confirmText={modalLoading ? "Eliminando..." : "Eliminar"}
                    cancelText="Cancelar"
                >
                    <p className="mb-4">
                        ¿Estás seguro de que quieres eliminar el usuario <strong>{selectedUser?.nombre}</strong>?
                    </p>
                    <p className="text-sm text-text-secondary dark:text-text-secondary">
                        Esta acción no se puede deshacer y eliminará todos los datos asociados al usuario.
                    </p>
                </Modal>
            </div>
        </Layout>
    );
};

export default AdminUsers;