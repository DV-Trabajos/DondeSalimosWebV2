// ComercioForm.jsx - Formulario para crear/editar comercios

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ImageUpload from '../Shared/ImageUpload';
import { TIPOS_COMERCIO_DESCRIPCION } from '../../utils/constants';
import { formatCUITOnType, validateCUIT, getErrorCUIT } from '../../utils/cuitValidator';

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
  };

  const handleImageChange = (base64) => {
    setFormData(prev => ({
      ...prev,
      foto: base64
    }));
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
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {comercio ? 'Editar Comercio' : 'Nuevo Comercio'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition"
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
                />
                {errors.nroDocumento && (
                  <p className="text-red-500 text-sm mt-1">{errors.nroDocumento}</p>
                )}
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.direccion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Av. Corrientes 1234, CABA"
                />
                {errors.direccion && (
                  <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>
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
                  placeholder="1112345678"
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
                  placeholder="contacto@comercio.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Horario */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Horario
                </label>
                <input
                  type="text"
                  name="horario"
                  value={formData.horario}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ej: Lun-Vie 18:00-02:00, Sáb-Dom 20:00-04:00"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe tu comercio..."
                />
              </div>

              {/* Coordenadas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitud
                </label>
                <input
                  type="number"
                  name="latitud"
                  value={formData.latitud || ''}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="-34.603722"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitud
                </label>
                <input
                  type="number"
                  name="longitud"
                  value={formData.longitud || ''}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="-58.381592"
                />
              </div>

              {/* Imagen */}
              <div className="md:col-span-2">
                <ImageUpload
                  value={formData.foto}
                  onChange={handleImageChange}
                  label="Imagen del Comercio"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3 justify-end">
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
                disabled={isLoading}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Guardando...' : comercio ? 'Actualizar' : 'Crear Comercio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComercioForm;
