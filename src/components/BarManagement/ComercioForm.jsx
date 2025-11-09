// ComercioForm.jsx - Formulario de comercio

import { useState, useEffect } from 'react';
import { X, Save, Upload, Loader } from 'lucide-react';
import Header from '../Shared/Header';
import { createComercio, updateComercio } from '../../services/comerciosService';
import { TIPOS_COMERCIO_DESCRIPCION } from '../../utils/constants';
import { validateCUIT, formatCUITOnType, getErrorCUIT } from '../../utils/cuitValidator';

const ComercioForm = ({ comercio, onClose, userId }) => {
  const isEditing = !!comercio;
  
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    nroDocumento: '',
    telefono: '',
    horario: '',
    descripcion: '',
    latitud: '',
    longitud: '',
    iD_TipoComercio: 1,
    iD_Usuario: userId,
    estado: false,
    foto: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (comercio) {
      setFormData({
        ...comercio,
        iD_Usuario: userId,
      });
      if (comercio.foto) {
        setImagePreview(comercio.foto.startsWith('data:') ? comercio.foto : `data:image/jpeg;base64,${comercio.foto}`);
      }
    }
  }, [comercio, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'nroDocumento') {
      const formatted = formatCUITOnType(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setImagePreview(base64String);
      setFormData(prev => ({ 
        ...prev, 
        foto: base64String.split(',')[1] // Solo la parte base64
      }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida';
    if (!formData.nroDocumento.trim()) {
      newErrors.nroDocumento = 'El CUIT es requerido';
    } else {
      const cuitError = getErrorCUIT(formData.nroDocumento);
      if (cuitError) newErrors.nroDocumento = cuitError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      alert('Por favor corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);

    try {
      const dataToSend = {
        ...formData,
        latitud: parseFloat(formData.latitud) || 0,
        longitud: parseFloat(formData.longitud) || 0,
        iD_TipoComercio: parseInt(formData.iD_TipoComercio),
      };

      if (isEditing) {
        await updateComercio(comercio.iD_Comercio, dataToSend);
        alert('Comercio actualizado exitosamente');
      } else {
        await createComercio(dataToSend);
        alert('Comercio creado exitosamente. Estará visible una vez que sea aprobado por un administrador.');
      }

      onClose();
    } catch (error) {
      console.error('Error guardando comercio:', error);
      alert(error.response?.data || 'Error al guardar el comercio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Editar Comercio' : 'Nuevo Comercio'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Imagen */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Imagen del Comercio
              </label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  <span>Subir Imagen</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>
            </div>

            {/* Nombre */}
            <div>
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
                disabled={isLoading}
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
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
                placeholder="20-12345678-9"
                maxLength="13"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.nroDocumento ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.nroDocumento && <p className="text-red-500 text-sm mt-1">{errors.nroDocumento}</p>}
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
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>

            {/* Dirección */}
            <div>
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
                disabled={isLoading}
              />
              {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>}
            </div>

            {/* Coordenadas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitud
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitud"
                  value={formData.latitud}
                  onChange={handleChange}
                  placeholder="-34.603722"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitud
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitud"
                  value={formData.longitud}
                  onChange={handleChange}
                  placeholder="-58.381592"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+54 11 1234-5678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>

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
                placeholder="Lun-Vie 18:00-2:00, Sáb-Dom 20:00-4:00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <><Loader className="w-5 h-5 animate-spin" /> Guardando...</>
                ) : (
                  <><Save className="w-5 h-5" /> Guardar</>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ComercioForm;
