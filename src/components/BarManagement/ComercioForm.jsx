// ComercioForm.jsx - Formulario completo de comercio
// Fase 6: Gestión de Comercios - Versión mejorada

import { useState, useEffect } from 'react';
import { X, Save, Loader2, MapPin, Clock, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { TIPOS_COMERCIO_DESCRIPCION } from '../../utils/constants';
import { formatCUITOnType, validateCUIT } from '../../utils/cuitValidator';
import { convertImageToBase64 } from '../../utils/formatters';
import { createComercio, updateComercio, geocodeAddress } from '../../services/comerciosService';
import Header from '../Shared/Header';

/**
 * Formulario completo para crear/editar comercios
 * Incluye: datos básicos, horarios, ubicación, imagen, descripción
 */
const ComercioForm = ({ comercio, onClose, onSuccess }) => {
  const { user } = useAuth();
  const isEditing = !!comercio;

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    correo: '',
    nroDocumento: '',
    tipoDocumento: 'CUIT',
    iD_TipoComercio: 1,
    capacidad: '',
    mesas: '',
    generoMusical: '',
    horaIngreso: '',
    horaCierre: '',
    descripcion: '',
    foto: null,
    latitud: null,
    longitud: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Cargar datos si es edición
  useEffect(() => {
    if (comercio) {
      setFormData({
        nombre: comercio.nombre || '',
        direccion: comercio.direccion || '',
        telefono: comercio.telefono || '',
        correo: comercio.correo || '',
        nroDocumento: comercio.nroDocumento || '',
        tipoDocumento: comercio.tipoDocumento || 'CUIT',
        iD_TipoComercio: comercio.iD_TipoComercio || 1,
        capacidad: comercio.capacidad?.toString() || '',
        mesas: comercio.mesas?.toString() || '',
        generoMusical: comercio.generoMusical || '',
        horaIngreso: formatTimeForInput(comercio.horaIngreso) || '',
        horaCierre: formatTimeForInput(comercio.horaCierre) || '',
        descripcion: comercio.descripcion || '',
        foto: comercio.foto || null,
        latitud: comercio.latitud || null,
        longitud: comercio.longitud || null,
      });

      if (comercio.foto) {
        setImagePreview(comercio.foto);
      }
    }
  }, [comercio]);

  // Formatear hora para input (HH:MM:SS -> HH:MM)
  const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  };

  // Formatear hora para enviar (HH:MM -> HH:MM:SS)
  const formatTimeForSubmit = (timeString) => {
    if (!timeString) return null;
    const parts = timeString.split(':');
    if (parts.length === 2) {
      return `${parts[0]}:${parts[1]}:00`;
    }
    return timeString;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Formateo especial para CUIT
    if (name === 'nroDocumento') {
      newValue = formatCUITOnType(value);
    }

    // Validar números para capacidad y mesas
    if ((name === 'capacidad' || name === 'mesas') && value && !/^\d+$/.test(value)) {
      return;
    }

    // Validar teléfono (solo números, max 10 dígitos)
    if (name === 'telefono') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, foto: 'Solo se permiten archivos de imagen' }));
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, foto: 'La imagen no debe superar 5MB' }));
      return;
    }

    try {
      // Convertir a base64
      const base64 = await convertImageToBase64(file);
      setFormData(prev => ({ ...prev, foto: base64 }));
      setImagePreview(base64);
      setErrors(prev => ({ ...prev, foto: null }));
    } catch (error) {
      console.error('Error procesando imagen:', error);
      setErrors(prev => ({ ...prev, foto: 'Error al procesar la imagen' }));
    }
  };

  const handleGeocode = async () => {
    if (!formData.direccion.trim()) {
      setErrors(prev => ({ ...prev, direccion: 'Ingresa una dirección primero' }));
      return;
    }

    try {
      setIsGeocoding(true);
      setErrors(prev => ({ ...prev, direccion: null }));

      const coords = await geocodeAddress(formData.direccion);
      
      if (coords && coords.lat && coords.lng) {
        setFormData(prev => ({
          ...prev,
          latitud: coords.lat,
          longitud: coords.lng
        }));
        alert('✅ Dirección geocodificada exitosamente');
      } else {
        setErrors(prev => ({ 
          ...prev, 
          direccion: 'No se pudieron obtener las coordenadas. Verifica la dirección.' 
        }));
      }
    } catch (error) {
      console.error('Error geocodificando:', error);
      setErrors(prev => ({ 
        ...prev, 
        direccion: 'Error al geocodificar la dirección' 
      }));
    } finally {
      setIsGeocoding(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones obligatorias
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    }

    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (formData.telefono.length !== 10) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Correo electrónico inválido';
    }

    if (!formData.nroDocumento.trim()) {
      newErrors.nroDocumento = 'El CUIT/CUIL es obligatorio';
    } else if (formData.tipoDocumento === 'CUIT') {
      const cuitValidation = validateCUIT(formData.nroDocumento.replace(/-/g, ''));
      if (!cuitValidation.valid) {
        newErrors.nroDocumento = cuitValidation.message;
      }
    }

    // Validar horarios si se ingresaron
    if (formData.horaIngreso && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.horaIngreso)) {
      newErrors.horaIngreso = 'Formato inválido (HH:MM)';
    }

    if (formData.horaCierre && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.horaCierre)) {
      newErrors.horaCierre = 'Formato inválido (HH:MM)';
    }

    // Validar que tenga coordenadas
    if (!formData.latitud || !formData.longitud) {
      newErrors.direccion = 'Debes geocodificar la dirección para obtener las coordenadas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Por favor corrige los errores del formulario');
      return;
    }

    try {
      setIsLoading(true);

      const dataToSend = {
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        telefono: formData.telefono,
        correo: formData.correo.trim(),
        nroDocumento: formData.nroDocumento.replace(/-/g, ''),
        tipoDocumento: formData.tipoDocumento,
        iD_TipoComercio: parseInt(formData.iD_TipoComercio),
        capacidad: parseInt(formData.capacidad) || 0,
        mesas: parseInt(formData.mesas) || 0,
        generoMusical: formData.generoMusical.trim(),
        horaIngreso: formatTimeForSubmit(formData.horaIngreso),
        horaCierre: formatTimeForSubmit(formData.horaCierre),
        descripcion: formData.descripcion.trim(),
        foto: formData.foto || '',
        latitud: formData.latitud,
        longitud: formData.longitud,
        iD_Usuario: user.iD_Usuario,
        estado: isEditing ? comercio.estado : false, // Nuevos comercios van pendientes
        fechaCreacion: isEditing ? comercio.fechaCreacion : new Date().toISOString(),
      };

      if (isEditing) {
        dataToSend.iD_Comercio = comercio.iD_Comercio;
        await updateComercio(comercio.iD_Comercio, dataToSend);
        alert('✅ Comercio actualizado exitosamente');
      } else {
        await createComercio(dataToSend);
        alert('✅ Comercio creado exitosamente\n\nEstá pendiente de aprobación por el administrador.');
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();

    } catch (error) {
      console.error('Error guardando comercio:', error);
      
      let errorMessage = 'No se pudo guardar el comercio.';
      
      if (error.response?.data?.errors?.Correo) {
        errorMessage = 'El correo electrónico es inválido';
      } else if (error.message?.includes('CUIT')) {
        errorMessage = 'Ya existe un comercio con este CUIT';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert('❌ ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />

      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Header del formulario */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Comercio' : 'Nuevo Comercio'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                disabled={isLoading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Información Básica */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Información Básica
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre del Comercio *
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.nombre ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ej: La Esquina Bar & Restaurant"
                        disabled={isLoading}
                      />
                      {errors.nombre && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.nombre}
                        </p>
                      )}
                    </div>

                    {/* Tipo de Comercio */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo de Comercio *
                      </label>
                      <select
                        name="iD_TipoComercio"
                        value={formData.iD_TipoComercio}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                      >
                        {Object.entries(TIPOS_COMERCIO_DESCRIPCION).map(([id, label]) => (
                          <option key={id} value={id}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CUIT */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CUIT/CUIL *
                      </label>
                      <input
                        type="text"
                        name="nroDocumento"
                        value={formData.nroDocumento}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.nroDocumento ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="20-12345678-9"
                        disabled={isLoading}
                      />
                      {errors.nroDocumento && (
                        <p className="text-red-500 text-sm mt-1">{errors.nroDocumento}</p>
                      )}
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.telefono ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="1132419131"
                        maxLength={10}
                        disabled={isLoading}
                      />
                      {errors.telefono && (
                        <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">10 dígitos sin espacios</p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.correo ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="contacto@mibar.com"
                        disabled={isLoading}
                      />
                      {errors.correo && (
                        <p className="text-red-500 text-sm mt-1">{errors.correo}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Ubicación
                  </h3>

                  <div className="space-y-4">
                    {/* Dirección con botón de geocoding */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dirección *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleChange}
                          className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.direccion ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Av. Corrientes 1234, Buenos Aires"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={handleGeocode}
                          disabled={isLoading || isGeocoding}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 flex items-center gap-2"
                        >
                          {isGeocoding ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Geocodificando...
                            </>
                          ) : (
                            <>
                              <MapPin className="w-5 h-5" />
                              Geocodificar
                            </>
                          )}
                        </button>
                      </div>
                      {errors.direccion && (
                        <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>
                      )}
                      {formData.latitud && formData.longitud && (
                        <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                          ✓ Coordenadas: {formData.latitud.toFixed(6)}, {formData.longitud.toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Capacidad y Detalles */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Detalles del Comercio
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Capacidad */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Capacidad (personas)
                      </label>
                      <input
                        type="number"
                        name="capacidad"
                        value={formData.capacidad}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="100"
                        min="0"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Mesas */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cantidad de Mesas
                      </label>
                      <input
                        type="number"
                        name="mesas"
                        value={formData.mesas}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="20"
                        min="0"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Género Musical */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Género Musical / Ambiente
                      </label>
                      <input
                        type="text"
                        name="generoMusical"
                        value={formData.generoMusical}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Rock, Electrónica, Salsa, etc."
                        disabled={isLoading}
                      />
                    </div>

                    {/* Hora Ingreso */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Horario de Apertura
                      </label>
                      <input
                        type="time"
                        name="horaIngreso"
                        value={formData.horaIngreso}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.horaIngreso ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                      />
                      {errors.horaIngreso && (
                        <p className="text-red-500 text-sm mt-1">{errors.horaIngreso}</p>
                      )}
                    </div>

                    {/* Hora Cierre */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Horario de Cierre
                      </label>
                      <input
                        type="time"
                        name="horaCierre"
                        value={formData.horaCierre}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.horaCierre ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                      />
                      {errors.horaCierre && (
                        <p className="text-red-500 text-sm mt-1">{errors.horaCierre}</p>
                      )}
                    </div>

                    {/* Descripción */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Describe tu comercio: ambiente, especialidades, eventos, etc."
                        maxLength={500}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.descripcion.length}/500 caracteres
                      </p>
                    </div>
                  </div>
                </div>

                {/* Imagen */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Imagen del Comercio
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Foto del Local
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                      />
                      {errors.foto && (
                        <p className="text-red-500 text-sm mt-1">{errors.foto}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
                      </p>
                    </div>

                    {/* Preview de imagen */}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview.startsWith('data:') ? imagePreview : `data:image/jpeg;base64,${imagePreview}`}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, foto: null }));
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                          disabled={isLoading}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {isEditing ? 'Actualizar Comercio' : 'Crear Comercio'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComercioForm;