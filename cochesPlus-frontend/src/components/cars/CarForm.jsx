import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import Button from '../../components/common/Button';
import Alert from '../common/Alert';
import Spinner from '../common/Spinner';
import TextArea from '../common/TextArea';
import cocheService from '../../services/CocheService';

const CarForm = ({
    onSubmit,
    initialData = {},
    loading = false,
    error = null,
    success = false,
    isEditing = false
}) => {

    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [provincias, setProvincias] = useState([]);

    const [imagenPrincipal, setImagenPrincipal] = useState(null);
    const [imagenPrincipalPreview, setImagenPrincipalPreview] = useState(initialData.imagen_principal || null);
    const [imagenesAdicionales, setImagenesAdicionales] = useState([]);
    const [imagenesAdicionalesPreview, setImagenesAdicionalesPreview] = useState([]);

    const [imagenesExistentes, setImagenesExistentes] = useState(initialData.imagenes || []);

    const [documentos, setDocumentos] = useState([]);
    const [documentosNombres, setDocumentosNombres] = useState([]);

    const [documentosExistentes, setDocumentosExistentes] = useState(initialData.documentos || []);

    // Estado para errores de validación específicos
    const [fieldErrors, setFieldErrors] = useState({});
    const [generalError, setGeneralError] = useState(null);

    const [formData, setFormData] = useState({
        id_usuario: initialData.id_usuario || '',
        id_marca: initialData.id_marca || '',
        id_modelo: initialData.id_modelo || '',
        anio: initialData.anio || '',
        kilometraje: initialData.kilometraje || '',
        id_categoria: initialData.id_categoria || '',
        combustible: initialData.combustible || '',
        transmision: initialData.transmision || '',
        plazas: initialData.plazas || '',
        potencia: initialData.potencia || '',
        color: initialData.color || '',
        puertas: initialData.puertas || '',
        id_provincia: initialData.id_provincia || '',
        precio: initialData.precio || '',
        descripcion: initialData.descripcion || ''
    });

    // Guardar en localStorage para persistencia
    useEffect(() => {
        if (!isEditing) {
            const savedFormData = localStorage.getItem('carFormData');
            if (savedFormData) {
                try {
                    const parsed = JSON.parse(savedFormData);
                    setFormData(parsed);
                } catch (e) {
                    console.error('Error al recuperar datos del formulario:', e);
                }
            }
        }
    }, [isEditing]);

    // Guardar cambios en localStorage
    useEffect(() => {
        if (!isEditing && !success) {
            localStorage.setItem('carFormData', JSON.stringify(formData));
        }
    }, [formData, isEditing, success]);

    // Limpiar localStorage cuando se envía correctamente
    useEffect(() => {
        if (success) {
            localStorage.removeItem('carFormData');
        }
    }, [success]);

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData({
                id_usuario: initialData.id_usuario || '',
                id_marca: initialData.id_marca || '',
                id_modelo: initialData.id_modelo || '',
                anio: initialData.anio || '',
                kilometraje: initialData.kilometraje || '',
                id_categoria: initialData.id_categoria || '',
                combustible: initialData.combustible || '',
                transmision: initialData.transmision || '',
                plazas: initialData.plazas || '',
                potencia: initialData.potencia || '',
                color: initialData.color || '',
                puertas: initialData.puertas || '',
                id_provincia: initialData.id_provincia || '',
                precio: initialData.precio || '',
                descripcion: initialData.descripcion || ''
            });

            if (isEditing && initialData.imagenes) {
                setImagenesExistentes(initialData.imagenes || []);
                if (initialData.imagen_principal) {
                    setImagenPrincipalPreview(initialData.imagen_principal);
                }
            }

            if (isEditing && initialData.documentos) {
                setDocumentosExistentes(initialData.documentos || []);
            }
        }
    }, [initialData, isEditing]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const marcasRes = await cocheService.getMarcas();
                if (Array.isArray(marcasRes)) {
                    setMarcas(marcasRes);
                } else {
                    console.error('La respuesta no es un array:', marcasRes);
                    setMarcas([]);
                }

                const categoriasRes = await cocheService.getCategorias();
                if (Array.isArray(categoriasRes)) {
                    setCategorias(categoriasRes);
                } else {
                    console.error('Respuesta de categorías no es un array:', categoriasRes);
                    setCategorias([]);
                }

                const provinciasRes = await cocheService.getProvincias();
                if (Array.isArray(provinciasRes)) {
                    setProvincias(provinciasRes);
                } else {
                    console.error('Respuesta de provincias no es un array:', provinciasRes);
                    setProvincias([]);
                }
            } catch (err) {
                console.error('Error al cargar datos iniciales:', err);
                setGeneralError('Error al cargar los datos necesarios para el formulario. Por favor, recarga la página.');
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchModelos = async () => {
            if (formData.id_marca) {
                try {
                    const modelosRes = await cocheService.getModelosByMarca(formData.id_marca);
                    if (Array.isArray(modelosRes)) {
                        setModelos(modelosRes);
                    } else if (modelosRes && modelosRes.data) {
                        setModelos(modelosRes.data);
                    } else {
                        console.error('Formato de respuesta inesperado para modelos:', modelosRes);
                        setModelos([]);
                    }
                } catch (err) {
                    console.error('Error al cargar modelos:', err);
                    setModelos([]);
                }
            } else {
                setModelos([]);
            }
        };

        fetchModelos();
    }, [formData.id_marca]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Limpiar error del campo cuando el usuario empieza a escribir
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleImagenPrincipal = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                setFieldErrors(prev => ({
                    ...prev,
                    imagenPrincipal: 'Por favor, selecciona una imagen válida'
                }));
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setFieldErrors(prev => ({
                    ...prev,
                    imagenPrincipal: 'La imagen es demasiado grande. El tamaño máximo es 5MB.'
                }));
                return;
            }

            setImagenPrincipal(file);
            setFieldErrors(prev => ({
                ...prev,
                imagenPrincipal: null
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenPrincipalPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImagenesAdicionales = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const validFiles = files.filter(file => {
                if (!file.type.match('image.*')) {
                    console.warn(`El archivo ${file.name} no es una imagen válida`);
                    return false;
                }

                if (file.size > 5 * 1024 * 1024) {
                    console.warn(`La imagen ${file.name} es demasiado grande (>5MB)`);
                    return false;
                }

                return true;
            });

            if (validFiles.length === 0) {
                setFieldErrors(prev => ({
                    ...prev,
                    imagenesAdicionales: 'Ninguno de los archivos seleccionados es válido. Por favor, selecciona imágenes (máx. 5MB cada una).'
                }));
                return;
            }

            const totalImages = imagenesAdicionales.length + validFiles.length + imagenesExistentes.length;
            if (totalImages > 10) {
                setFieldErrors(prev => ({
                    ...prev,
                    imagenesAdicionales: 'Solo puedes tener un máximo de 10 imágenes adicionales en total.'
                }));
                return;
            }

            setImagenesAdicionales(prevImages => [...prevImages, ...validFiles]);
            setFieldErrors(prev => ({
                ...prev,
                imagenesAdicionales: null
            }));

            validFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagenesAdicionalesPreview(prevPreviews => [...prevPreviews, reader.result]);
                };
                reader.readAsDataURL(file);
            });

            if (validFiles.length < files.length) {
                setFieldErrors(prev => ({
                    ...prev,
                    imagenesAdicionales: `${files.length - validFiles.length} archivos fueron ignorados por no ser imágenes válidas o exceder el tamaño máximo.`
                }));
            }
        }
    };

    const handleEliminarImagenExistente = async (id, index) => {
        if (!isEditing || !initialData.id) return;

        if (window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
            try {
                await cocheService.removeImage(initialData.id, id);
                const nuevasImagenesExistentes = [...imagenesExistentes];
                nuevasImagenesExistentes.splice(index, 1);
                setImagenesExistentes(nuevasImagenesExistentes);
            } catch (err) {
                console.error('Error al eliminar imagen:', err);
                setGeneralError('No se pudo eliminar la imagen. Por favor, intenta de nuevo.');
            }
        }
    };

    const handleDocumentos = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setDocumentos(prevDocs => [...prevDocs, ...files]);
            setDocumentosNombres(prevNombres => [...prevNombres, ...files.map(f => f.name)]);
        }
    };

    const handleEliminarDocumentoExistente = async (id, index) => {
        if (!isEditing || !initialData.id) return;

        if (window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
            try {
                await cocheService.removeDocument(initialData.id, id);
                const nuevosDocumentosExistentes = [...documentosExistentes];
                nuevosDocumentosExistentes.splice(index, 1);
                setDocumentosExistentes(nuevosDocumentosExistentes);
            } catch (err) {
                console.error('Error al eliminar documento:', err);
                setGeneralError('No se pudo eliminar el documento. Por favor, intenta de nuevo.');
            }
        }
    };

    // Validación del formulario
    const validateForm = () => {
        const errors = {};

        // Validaciones de campos requeridos
        if (!formData.id_marca) errors.id_marca = 'La marca es obligatoria';
        if (!formData.id_modelo) errors.id_modelo = 'El modelo es obligatorio';
        if (!formData.anio) errors.anio = 'El año es obligatorio';
        if (!formData.kilometraje) errors.kilometraje = 'El kilometraje es obligatorio';
        if (!formData.id_categoria) errors.id_categoria = 'La categoría es obligatoria';
        if (!formData.combustible) errors.combustible = 'El combustible es obligatorio';
        if (!formData.transmision) errors.transmision = 'La transmisión es obligatoria';
        if (!formData.plazas) errors.plazas = 'El número de plazas es obligatorio';
        if (!formData.puertas) errors.puertas = 'El número de puertas es obligatorio';
        if (!formData.id_provincia) errors.id_provincia = 'La provincia es obligatoria';
        if (!formData.precio) errors.precio = 'El precio es obligatorio';

        // Validaciones de rangos
        const currentYear = new Date().getFullYear();
        if (formData.anio && (formData.anio < 1900 || formData.anio > currentYear + 1)) {
            errors.anio = `El año debe estar entre 1900 y ${currentYear + 1}`;
        }

        if (formData.kilometraje && formData.kilometraje < 0) {
            errors.kilometraje = 'El kilometraje no puede ser negativo';
        }

        if (formData.precio && formData.precio <= 0) {
            errors.precio = 'El precio debe ser mayor que 0';
        }

        if (formData.plazas && (formData.plazas < 1 || formData.plazas > 9)) {
            errors.plazas = 'El número de plazas debe estar entre 1 y 9';
        }

        if (formData.puertas && (formData.puertas < 1 || formData.puertas > 5)) {
            errors.puertas = 'El número de puertas debe estar entre 1 y 5';
        }

        if (formData.potencia && formData.potencia <= 0) {
            errors.potencia = 'La potencia debe ser mayor que 0';
        }

        // Validación de imágenes para nuevos anuncios
        if (!isEditing && !imagenPrincipal && !imagenesExistentes.length) {
            errors.imagenPrincipal = 'Debe incluir al menos una imagen principal';
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Limpiar errores previos
        setFieldErrors({});
        setGeneralError(null);

        // Validar formulario
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setGeneralError('Por favor, corrige los errores en el formulario antes de continuar.');

            // Scroll al primer error
            const firstErrorField = Object.keys(errors)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const todasLasImagenes = [imagenPrincipal, ...imagenesAdicionales].filter(Boolean);
        onSubmit(formData, todasLasImagenes, documentos);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Errores generales */}
            {(generalError || error) && (
                <Alert
                    type="error"
                    message={generalError || error}
                    onClose={() => {
                        setGeneralError(null);
                    }}
                />
            )}

            {success && (
                <Alert type="success" message={isEditing ?
                    "¡Anuncio actualizado correctamente! Redirigiendo..." :
                    "¡Anuncio publicado correctamente! Redirigiendo..."}
                />
            )}

            {/* Información básica */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Información básica</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField
                        id="id_marca"
                        name="id_marca"
                        value={formData.id_marca}
                        onChange={handleChange}
                        required
                        label="Marca"
                        placeholder="Seleccionar marca"
                        options={[
                            { value: '', label: 'Seleccionar marca' },
                            ...marcas.map(marca => ({
                                value: marca.id,
                                label: marca.nombre
                            }))
                        ]}
                        error={fieldErrors.id_marca}
                    />

                    <SelectField
                        id="id_modelo"
                        name="id_modelo"
                        value={formData.id_modelo}
                        onChange={handleChange}
                        required
                        label="Modelo"
                        placeholder="Seleccionar modelo"
                        options={[
                            { value: '', label: formData.id_marca ? 'Seleccionar modelo' : 'Primero selecciona una marca' },
                            ...modelos.map(modelo => ({
                                value: modelo.id,
                                label: modelo.nombre
                            }))
                        ]}
                        disabled={!formData.id_marca}
                        error={fieldErrors.id_modelo}
                    />

                    <InputField
                        label="Año"
                        type="number"
                        name="anio"
                        value={formData.anio}
                        onChange={handleChange}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                        error={fieldErrors.anio}
                    />

                    <InputField
                        label="Kilometraje"
                        type="number"
                        name="kilometraje"
                        value={formData.kilometraje}
                        onChange={handleChange}
                        min="0"
                        required
                        error={fieldErrors.kilometraje}
                    />
                </div>
            </div>

            {/* Detalles técnicos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detalles técnicos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField
                        id="id_categoria"
                        name="id_categoria"
                        value={formData.id_categoria}
                        onChange={handleChange}
                        required
                        label="Categoría"
                        placeholder="Seleccionar categoría"
                        options={[
                            { value: '', label: 'Seleccionar categoría' },
                            ...categorias.map(cat => ({
                                value: cat.id,
                                label: cat.nombre
                            }))
                        ]}
                        error={fieldErrors.id_categoria}
                    />

                    <SelectField
                        id="combustible"
                        name="combustible"
                        value={formData.combustible}
                        onChange={handleChange}
                        required
                        label="Combustible"
                        placeholder="Seleccionar combustible"
                        options={[
                            { value: '', label: 'Seleccionar combustible' },
                            { value: "Gasolina", label: "Gasolina" },
                            { value: "Diesel", label: "Diésel" },
                            { value: "Híbrido", label: "Híbrido" },
                            { value: "Eléctrico", label: "Eléctrico" }
                        ]}
                        error={fieldErrors.combustible}
                    />

                    <SelectField
                        id="transmision"
                        name="transmision"
                        value={formData.transmision}
                        onChange={handleChange}
                        required
                        label="Transmisión"
                        placeholder="Seleccionar transmisión"
                        options={[
                            { value: '', label: 'Seleccionar transmisión' },
                            { value: "Manual", label: "Manual" },
                            { value: "Automático", label: "Automático" }
                        ]}
                        error={fieldErrors.transmision}
                    />

                    <InputField
                        label="Plazas"
                        type="number"
                        name="plazas"
                        value={formData.plazas}
                        onChange={handleChange}
                        min="1"
                        max="9"
                        required
                        error={fieldErrors.plazas}
                    />

                    <InputField
                        label="Potencia (CV)"
                        type="number"
                        name="potencia"
                        value={formData.potencia}
                        onChange={handleChange}
                        min="1"
                        error={fieldErrors.potencia}
                    />

                    <InputField
                        label="Color"
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        error={fieldErrors.color}
                    />

                    <InputField
                        label="Puertas"
                        type="number"
                        name="puertas"
                        value={formData.puertas}
                        onChange={handleChange}
                        min="1"
                        max="5"
                        required
                        error={fieldErrors.puertas}
                    />
                </div>
            </div>

            {/* Ubicación y precio */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ubicación y precio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField
                        id="id_provincia"
                        name="id_provincia"
                        value={formData.id_provincia}
                        onChange={handleChange}
                        required
                        label="Provincia"
                        placeholder="Seleccionar provincia"
                        options={[
                            { value: '', label: 'Seleccionar provincia' },
                            ...provincias.map(provincia => ({
                                value: provincia.id,
                                label: provincia.nombre
                            }))
                        ]}
                        error={fieldErrors.id_provincia}
                    />

                    <InputField
                        label="Precio (€)"
                        type="number"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        min="0"
                        step="100"
                        required
                        error={fieldErrors.precio}
                    />
                </div>
            </div>

            {/* Fotos del vehículo */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Fotos del vehículo</h2>

                {/* Información sobre requisitos de imágenes */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md text-sm text-blue-800 dark:text-blue-200">
                    <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Las fotos ayudan a vender tu coche más rápido. Requisitos:
                    </p>
                    <ul className="ml-7 mt-1 list-disc space-y-1">
                        <li>Formato: JPG, PNG o WEBP</li>
                        <li>Tamaño máximo: 5MB por imagen</li>
                        <li>La foto principal es obligatoria</li>
                        <li>Puedes añadir hasta 10 fotos adicionales</li>
                        <li>Recomendación: Incluye fotos del exterior, interior y detalles técnicos</li>
                    </ul>
                </div>

                {/* Imágenes existentes en modo edición */}
                {isEditing && imagenesExistentes.length > 0 && (
                    <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Imágenes actuales</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {imagenesExistentes.map((imagen, index) => (
                                <div key={imagen.id || index} className="relative group">
                                    <img
                                        src={`${import.meta.env.PROD
                                            ? 'https://josefa25.iesmontenaranco.com:8000'
                                            : 'http://localhost:8000'}/${imagen.ruta}`}
                                        alt={`Imagen ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleEliminarImagenExistente(imagen.id, index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-70 hover:opacity-100 transition-opacity"
                                        title="Eliminar imagen"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    {imagen.es_principal && (
                                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                            Principal
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            *Para cambiar la imagen principal, elimina la actual y sube una nueva.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {isEditing ? 'Nueva foto principal' : 'Foto principal'}
                            {!isEditing && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative mt-1 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-2 h-48 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                            {imagenPrincipalPreview ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img
                                        src={imagenPrincipalPreview}
                                        alt="Vista previa"
                                        className="max-h-full max-w-full object-contain rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagenPrincipal(null);
                                            setImagenPrincipalPreview(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                        title="Eliminar imagen"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center w-full">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4h-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Haz clic para subir una foto principal</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Esta foto aparecerá como portada del anuncio</p>
                                    <label className="block w-full h-full cursor-pointer absolute inset-0">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleImagenPrincipal}
                                            className="hidden"
                                            aria-label="Subir foto principal"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                        {fieldErrors.imagenPrincipal && (
                            <p className="mt-1 text-sm text-error">{fieldErrors.imagenPrincipal}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {isEditing ? 'Nuevas fotos adicionales' : 'Fotos adicionales'} <span className="text-xs text-gray-500">(Opcional, máx. 10)</span>
                        </label>
                        <div className="relative mt-1 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 h-48 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                            <div className="text-center w-full">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4h-8m-4-4v-8m0 0V8m0 0h-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Haz clic para subir más fotos</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {imagenesAdicionales.length > 0
                                        ? `${imagenesAdicionales.length} de 10 fotos seleccionadas`
                                        : 'Muestra diferentes ángulos del vehículo'}
                                </p>
                                <label className="block w-full h-full cursor-pointer absolute inset-0">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        onChange={handleImagenesAdicionales}
                                        className="hidden"
                                        aria-label="Subir fotos adicionales"
                                        disabled={imagenesAdicionales.length + imagenesExistentes.length >= 10}
                                    />
                                </label>
                            </div>
                        </div>
                        {fieldErrors.imagenesAdicionales && (
                            <p className="mt-1 text-sm text-error">{fieldErrors.imagenesAdicionales}</p>
                        )}

                        {/* Vista previa de imágenes adicionales */}
                        {imagenesAdicionalesPreview.length > 0 && (
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Vista previa de fotos adicionales</h3>
                                    {imagenesAdicionales.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagenesAdicionales([]);
                                                setImagenesAdicionalesPreview([]);
                                            }}
                                            className="text-xs text-red-500 hover:text-red-700"
                                        >
                                            Eliminar todas
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {imagenesAdicionalesPreview.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Imagen ${index + 1}`}
                                                className="h-20 w-full object-cover rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImagenes = [...imagenesAdicionales];
                                                    newImagenes.splice(index, 1);
                                                    setImagenesAdicionales(newImagenes);

                                                    const newPreviews = [...imagenesAdicionalesPreview];
                                                    newPreviews.splice(index, 1);
                                                    setImagenesAdicionalesPreview(newPreviews);
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Eliminar imagen"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Documentación (opcional) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Documentación (opcional)</h2>

                {/* Documentos existentes en modo edición */}
                {isEditing && documentosExistentes.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Documentos actuales</h3>
                        <ul className="space-y-2">
                            {documentosExistentes.map((doc, index) => (
                                <li key={doc.id || index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                    <span className="flex items-center">
                                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        {doc.nombre || doc.descripcion || `Documento ${index + 1}`}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleEliminarDocumentoExistente(doc.id, index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Sube archivos como el informe de la ITV, historial de mantenimiento, etc.</p>
                        <div className="mt-3">
                            <label className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Subir archivos</span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleDocumentos}
                                    className="sr-only"
                                />
                            </label>
                        </div>
                    </div>
                </div>
                {/* Lista de documentos */}
                {documentosNombres.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Archivos seleccionados:</h3>
                        <ul className="space-y-1">
                            {documentosNombres.map((nombre, index) => (
                                <li key={index} className="flex items-center justify-between py-1 px-2 rounded-md bg-gray-100 dark:bg-gray-700">
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-grow">
                                        {nombre}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDocumentos(documentos.filter((_, i) => i !== index));
                                            setDocumentosNombres(documentosNombres.filter((_, i) => i !== index));
                                        }}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Descripción */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Descripción</h2>
                <div>
                    <TextArea
                        id="descripcion"
                        name="descripcion"
                        rows="5"
                        placeholder="Describe el estado y características destacadas del vehículo..."
                        value={formData.descripcion}
                        onChange={handleChange}
                        error={fieldErrors.descripcion}
                    />
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                        if (!isEditing) {
                            if (window.confirm('¿Estás seguro de que deseas cancelar? Los datos del formulario se perderán.')) {
                                localStorage.removeItem('carFormData');
                                window.history.back();
                            }
                        } else {
                            window.history.back();
                        }
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    isLoading={loading}
                >
                    {loading ? (isEditing ? 'Actualizando...' : 'Publicando...') : (isEditing ? 'Actualizar anuncio' : 'Publicar anuncio')}
                </Button>
            </div>
        </form>
    );
};

CarForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    loading: PropTypes.bool,
    error: PropTypes.string,
    success: PropTypes.bool,
    isEditing: PropTypes.bool
};

export default CarForm;