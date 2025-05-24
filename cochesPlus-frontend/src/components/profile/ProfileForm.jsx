import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import InputField from '../common/InputField';
import TextArea from '../common/TextArea';

const ProfileForm = ({ userData, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        direccion: ''
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                nombre: userData.nombre || '',
                email: userData.email || '',
                telefono: userData.telefono || '',
                direccion: userData.direccion || ''
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade">
            <InputField
                label="Nombre completo"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                disabled={loading}
                required
            />

            <InputField
                label="Correo electrónico"
                type="email"
                name="email"
                value={formData.email}
                disabled={true}
                readOnly
                className=""
                helperText="El correo electrónico no se puede cambiar."
            />

            <InputField
                label="Teléfono"
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                disabled={loading}
                placeholder="Ej. 612345678"
            />

            <div className="mb-4">
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dirección
                </label>
                <TextArea
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className=""
                    disabled={loading}
                    placeholder="Tu dirección completa"
                    rows="3"
                ></TextArea>
            </div>

            <div>
                <Button
                    type="submit"
                    isLoading={loading}
                    className="mt-2"
                >
                    Guardar cambios
                </Button>
            </div>
        </form>
    );
};

ProfileForm.propTypes = {
    userData: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool
};

export default ProfileForm;
