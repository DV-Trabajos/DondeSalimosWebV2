// ReservaModal.jsx - Modal para crear una nueva reserva

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { createReserva } from '../../services/reservasService';

/**
 * Modal para crear una nueva reserva
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado del modal
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Object} props.comercio - Comercio seleccionado
 * @param {Function} props.onSuccess - Callback al crear exitosamente
 */
const ReservaModal = ({ isOpen, onClose, comercio, onSuccess }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    cantidadPersonas: 1,
    comentarios: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Reset form cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      fecha: '',
      hora: '',
      cantidadPersonas: 1,
      comentarios: '',
    });
    setErrors({});
    setSuccessMessage('');
  };

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Obtener fecha máxima (30 días)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }

    if (!formData.hora) {
      newErrors.hora = 'La hora es requerida';
    }

    if (!formData.cantidadPersonas || formData.cantidadPersonas < 1) {
      newErrors.cantidadPersonas = 'Debe haber al menos 1 persona';
    }

    // Validar capacidad del comercio
    if (comercio.capacidad && formData.cantidadPersonas > comercio.capacidad) {
      newErrors.cantidadPersonas = `La capacidad máxima es ${comercio.capacidad} personas`;
    }

    // Validar que no sea una fecha pasada
    const selectedDate = new Date(`${formData.fecha}T${formData.hora}`);
    const now = new Date();
    if (selectedDate < now) {
      newErrors.fecha = 'No puedes reservar en fechas pasadas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Combinar fecha y hora
      const fechaReserva = new Date(`${formData.fecha}T${formData.hora}`);

      const reservaData = {
        iD_Usuario: user.iD_Usuario,
        iD_Comercio: comercio.iD_Comercio,
        fechaReserva: fechaReserva.toISOString(),
        comenzales: parseInt(formData.cantidadPersonas),
        comentarios: formData.comentarios || null,
        estado: false, // Pendiente de aprobación
        tiempoTolerancia: '00:15:00', // 15 minutos de tolerancia
        fechaCreacion: new Date().toISOString(),
      };

      await createReserva(reservaData);

      setSuccessMessage('¡Reserva creada exitosamente! Está pendiente de aprobación.');
      
      setTimeout(() => {
        onSuccess && onSuccess();
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error al crear reserva:', error);
      setErrors({
        submit: error.response?.data?.message || 'Error al crear la reserva. Intenta nuevamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Nueva Reserva</h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-white hover:bg-purple-600 p-2 rounded-full transition disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-purple-100 mt-2">{comercio.nombre}</p>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {successMessage ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-green-700 font-semibold text-lg">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha de la reserva
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleChange('fecha', e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 ${
                    errors.fecha ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fecha && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fecha}
                  </p>
                )}
              </div>

              {/* Hora */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Hora de la reserva
                </label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => handleChange('hora', e.target.value)}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 ${
                    errors.hora ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.hora && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.hora}
                  </p>
                )}
                {comercio.horaIngreso && comercio.horaCierre && (
                  <p className="text-gray-500 text-xs mt-1">
                    Horario del local: {comercio.horaIngreso} - {comercio.horaCierre}
                  </p>
                )}
              </div>

              {/* Cantidad de personas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Cantidad de personas
                </label>
                <input
                  type="number"
                  min="1"
                  max={comercio.capacidad || 100}
                  value={formData.cantidadPersonas}
                  onChange={(e) => handleChange('cantidadPersonas', e.target.value)}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 ${
                    errors.cantidadPersonas ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.cantidadPersonas && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.cantidadPersonas}
                  </p>
                )}
                {comercio.capacidad && (
                  <p className="text-gray-500 text-xs mt-1">
                    Capacidad máxima: {comercio.capacidad} personas
                  </p>
                )}
              </div>

              {/* Comentarios */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comentarios adicionales (opcional)
                </label>
                <textarea
                  value={formData.comentarios}
                  onChange={(e) => handleChange('comentarios', e.target.value)}
                  disabled={isLoading}
                  rows="3"
                  maxLength="200"
                  placeholder="Ej: Mesa cerca de la ventana, celebración especial..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 resize-none"
                />
                <p className="text-gray-500 text-xs mt-1">
                  {formData.comentarios.length}/200 caracteres
                </p>
              </div>

              {/* Error general */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Información importante */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700 text-sm">
                  <strong>Importante:</strong> Tu reserva estará pendiente de aprobación por el comercio.
                  Recibirás una notificación cuando sea confirmada.
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      Crear Reserva
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservaModal;