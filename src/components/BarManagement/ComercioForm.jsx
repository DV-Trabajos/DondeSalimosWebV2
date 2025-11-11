// ComercioForm.jsx - Formulario completo con GEOCODING AUTOMÁTICO

import { useState, useEffect } from 'react';
import { X, Navigation, MapPin, Loader2 } from 'lucide-react';
import ImageUpload from '../Shared/ImageUpload';
import { TIPOS_COMERCIO_DESCRIPCION } from '../../utils/constants';
import { formatCUITOnType, getErrorCUIT } from '../../utils/cuitValidator';
import { geocodeAddress, validateCoordinates } from '../../services/comerciosService';

const ComercioForm = ({ comercio, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    nroDocumento: '',
    iD_TipoComercio: 1,
    latitud: null,
    longitud: null,
    horario: '',
    descripcion: '',
    foto: null,
  });

  const [errors, setErrors] = useState({});
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Si es edición, cargar datos del comercio
  useEffect(() => {
    if (comercio) {
      setFormData({
        nombre: comercio.nombre || '',
        direccion: comercio.direccion || '',
        telefono: comercio.telefono || '',
        email: comercio.email || '',
        nroDocumento: comercio.nroDocumento || '',
        iD_TipoComercio: comercio.iD_TipoComercio || 1,
        latitud: comercio.latitud || null,
        longitud: comercio.longitud || null,
        horario: comercio.horario || '',
        descripcion: comercio.descripcion || '',
        foto: comercio.foto || null,
      });
    }
  }, [comercio]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let newValue = value;

    // Formateo especial para CUIT
    if (name === 'nroDocumento') {
      newValue = formatCUITOnType(value);
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

    // Limpiar error de geocoding si cambia la dirección
    if (name === 'direccion' && geoError) {
      setGeoError('');
    }
  };

  const handleImageChange = (base64) => {
    setFormData(prev => ({
      ...prev,
      foto: base64
    }));
  };

  // 🆕 FUNCIÓN DE GEOCODING
  const handleGeocodeAddress = async () => {
    if (!formData.direccion.trim()) {
      setGeoError('Por favor ingresa una dirección primero');
      return;
    }

    setIsGeocoding(true);
    setGeoError('');

    try {
      const result = await geocodeAddress(formData.direccion);
      
      setFormData(prev => ({
        ...prev,
        latitud: result.lat,
        longitud: result.lng,
      }));

      // Opcional: actualizar la dirección con la formateada por Google
      if (result.formatted_address) {
        setFormData(prev => ({
          ...prev,
          direccion: result.formatted_address,
        }));
      }

      // Mostrar mensaje de éxito
      alert(`✅ Coordenadas obtenidas correctamente:\nLatitud: ${result.lat}\nLongitud: ${result.lng}`);
    } catch (error) {
      console.error('Error en geocoding:', error);
      setGeoError(error.message || 'No se pudo obtener las coordenadas. Verifica la dirección.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    const cuitError = getErrorCUIT(formData.nroDocumento);
    if (cuitError) {
      newErrors.nroDocumento = cuitError;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Advertencia si no hay coordenadas (no error, pero aviso)
    if (!formData.latitud || !formData.longitud) {
      newErrors.coordenadas = 'Se recomienda agregar coordenadas usando el botón de geocoding';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Preparar datos para enviar
    const dataToSubmit = {
      ...formData,
      latitud: formData.latitud ? parseFloat(formData.latitud) : null,
      longitud: formData.longitud ? parseFloat(formData.longitud) : null,
    };

    onSubmit(dataToSubmit);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onCancel} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-800">
              {comercio ? 'Editar Comercio' : 'Nuevo Comercio'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: La Esquina Bar"
                  disabled={isLoading}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                  CUIT *
                </label>
                <input
                  type="text"
                  name="nroDocumento"
                  value={formData.nroDocumento}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.nroDocumento ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="20-12345678-9"
                  maxLength={13}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.telefono ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="11-1234-5678"
                  disabled={isLoading}
                />
                {errors.telefono && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="contacto@ejemplo.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Dirección + Botón Geocoding */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección * 
                  <span className="text-xs text-gray-500 ml-2">(Ej: Av. Corrientes 1234, Buenos Aires)</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.direccion ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Av. Corrientes 1234, Buenos Aires, Argentina"
                    disabled={isLoading}
                  />
                  
                  {/* 🆕 BOTÓN DE GEOCODING */}
                  <button
                    type="button"
                    onClick={handleGeocodeAddress}
                    disabled={isGeocoding || isLoading || !formData.direccion}
                    className="flex items-center gap-2 text-sm text-primary hover:text-purple-700 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed transition"
                  >
                    {isGeocoding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Obteniendo coordenadas...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4" />
                        Obtener coordenadas automáticamente (recomendado)
                      </>
                    )}
                  </button>

                  {errors.direccion && (
                    <p className="text-red-500 text-sm">{errors.direccion}</p>
                  )}
                  {geoError && (
                    <p className="text-orange-600 text-sm flex items-start gap-1">
                      <span>⚠️</span>
                      <span>{geoError}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Mostrar coordenadas obtenidas */}
              {(formData.latitud && formData.longitud) && (
                <div className="md:col-span-2">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-800 mb-1">
                          ✅ Coordenadas GPS obtenidas
                        </p>
                        <p className="text-sm text-green-700">
                          <strong>Latitud:</strong> {formData.latitud.toFixed(6)} | 
                          <strong className="ml-2">Longitud:</strong> {formData.longitud.toFixed(6)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Tu comercio aparecerá correctamente en el mapa
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Coordenadas manuales (opcional) */}
              <details className="md:col-span-2">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2 hover:text-primary">
                  ⚙️ Coordenadas manuales (avanzado)
                </summary>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Latitud
                    </label>
                    <input
                      type="number"
                      name="latitud"
                      value={formData.latitud || ''}
                      onChange={handleChange}
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="-34.603722"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Longitud
                    </label>
                    <input
                      type="number"
                      name="longitud"
                      value={formData.longitud || ''}
                      onChange={handleChange}
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="-58.381592"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </details>

              {/* Horario */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Horario
                </label>
                <input
                  type="text"
                  name="horario"
                  value={formData.horario}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ej: Lun-Dom 20:00-04:00"
                  disabled={isLoading}
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Describe tu comercio..."
                  disabled={isLoading}
                />
              </div>

              {/* Imagen */}
              <div className="md:col-span-2">
                <ImageUpload
                  value={formData.foto}
                  onChange={handleImageChange}
                  label="Imagen del Comercio"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Advertencia coordenadas */}
            {errors.coordenadas && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <span className="flex-shrink-0">⚠️</span>
                  <span>{errors.coordenadas}</span>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3 justify-end border-t pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || isGeocoding}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    {comercio ? 'Actualizar Comercio' : 'Crear Comercio'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComercioForm;
