// ReviewModal.jsx - Modal mejorado para crear reseñas con validaciones
// Versión completa para Fase 4

import { useState, useEffect } from 'react';
import { Star, X, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { createResenia, canUserReview } from '../../services/reseniasService';
import { getReservasByUser } from '../../services/reservasService';

/**
 * Modal para crear una nueva reseña con validación de reservas
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado del modal
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Object} props.comercio - Comercio a reseñar
 * @param {Function} props.onSuccess - Callback al crear exitosamente
 */
const ReviewModal = ({ isOpen, onClose, comercio, onSuccess }) => {
  const { user } = useAuth();
  
  // Estados del formulario
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  
  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estados de validación
  const [canReview, setCanReview] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [hasApprovedReservation, setHasApprovedReservation] = useState(false);

  // Validar si el usuario puede dejar reseña
  useEffect(() => {
    if (isOpen && comercio && user) {
      validateUserCanReview();
    } else {
      // Reset al cerrar
      resetForm();
    }
  }, [isOpen, comercio, user]);

  const validateUserCanReview = async () => {
    try {
      setIsValidating(true);
      setError('');
      
      // Verificar si el usuario tiene reservas aprobadas en este comercio
      const userReservas = await getReservasByUser(user.iD_Usuario);
      
      const approvedReservasInComercio = userReservas.filter(
        r => r.iD_Comercio === comercio.iD_Comercio && r.aprobada && r.estado
      );

      if (approvedReservasInComercio.length === 0) {
        setCanReview(false);
        setValidationMessage(
          '❌ Necesitas tener al menos una reserva aprobada en este comercio para poder dejar una reseña.'
        );
        setHasApprovedReservation(false);
        setIsValidating(false);
        return;
      }

      setHasApprovedReservation(true);

      // Verificar si puede dejar reseña (cooldown de 7 días)
      const reviewCheck = await canUserReview(user.iD_Usuario, comercio.iD_Comercio);
      
      if (reviewCheck.canReview) {
        setCanReview(true);
        setValidationMessage('✅ Puedes dejar una reseña para este comercio.');
      } else {
        setCanReview(false);
        setValidationMessage(
          `⏳ Ya dejaste una reseña recientemente. Podrás dejar otra en ${reviewCheck.daysRemaining} día(s).`
        );
      }
      
    } catch (error) {
      console.error('❌ Error validando permisos:', error);
      setCanReview(false);
      setValidationMessage('❌ Error al validar permisos. Intenta nuevamente.');
    } finally {
      setIsValidating(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    setError('');
    setSuccessMessage('');
    setIsValidating(true);
    setCanReview(false);
    setValidationMessage('');
    setHasApprovedReservation(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones del formulario
    if (rating === 0) {
      setError('Por favor selecciona una calificación (estrellas)');
      return;
    }

    if (!comment.trim()) {
      setError('Por favor escribe un comentario sobre tu experiencia');
      return;
    }

    if (comment.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres');
      return;
    }

    if (comment.trim().length > 500) {
      setError('El comentario no puede superar los 500 caracteres');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const reseniaData = {
        iD_Usuario: user.iD_Usuario,
        iD_Comercio: comercio.iD_Comercio,
        calificacion: rating,
        comentario: comment.trim(),
        puntuacion: rating, // Algunos backends usan 'puntuacion' en lugar de 'calificacion'
        estado: true,
        fechaCreacion: new Date().toISOString(),
      };

      console.log('📤 Enviando reseña:', reseniaData);

      await createResenia(reseniaData);
      
      setSuccessMessage('¡Gracias por tu reseña! Ha sido publicada exitosamente.');
      
      // Esperar 2 segundos antes de cerrar para mostrar el mensaje
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        resetForm();
      }, 2000);

    } catch (err) {
      console.error('❌ Error creando reseña:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Error al publicar la reseña. Por favor intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Función para renderizar las estrellas interactivas
  const renderStarRating = () => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Calificación *
        </label>
        <div className="flex gap-2 justify-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              disabled={isSubmitting || !canReview}
              className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-center text-sm font-medium text-gray-600">
            {rating === 1 && '😞 Muy malo'}
            {rating === 2 && '😕 Malo'}
            {rating === 3 && '😐 Regular'}
            {rating === 4 && '😊 Bueno'}
            {rating === 5 && '😍 Excelente'}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Dejar Reseña
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {comercio?.nombre || 'Comercio'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Validación en progreso */}
            {isValidating && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-gray-600 text-center">
                  Validando permisos...
                </p>
              </div>
            )}

            {/* Mensaje de validación */}
            {!isValidating && validationMessage && (
              <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${
                canReview 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                {canReview ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : hasApprovedReservation ? (
                  <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                <p className={`text-sm ${
                  canReview ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {validationMessage}
                </p>
              </div>
            )}

            {/* Formulario */}
            {!isValidating && canReview && !successMessage && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating de estrellas */}
                {renderStarRating()}

                {/* Campo de comentario */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tu experiencia *
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Cuéntanos sobre tu experiencia en este lugar..."
                    rows={5}
                    maxLength={500}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Mínimo 10 caracteres
                    </p>
                    <p className={`text-xs ${
                      comment.length > 450 ? 'text-red-500 font-semibold' : 'text-gray-500'
                    }`}>
                      {comment.length}/500
                    </p>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Nota informativa */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Nota:</strong> Tu reseña será visible públicamente y ayudará a otros usuarios a decidir.
                  </p>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      <>
                        <Star className="w-5 h-5" />
                        Publicar reseña
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Mensaje de éxito */}
            {successMessage && (
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  ¡Reseña Publicada!
                </h4>
                <p className="text-gray-600">
                  {successMessage}
                </p>
              </div>
            )}

            {/* No puede dejar reseña - Sin reserva */}
            {!isValidating && !canReview && !hasApprovedReservation && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-yellow-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Reserva Requerida
                </h4>
                <p className="text-gray-600 mb-6">
                  Para dejar una reseña, primero necesitas hacer una reserva en este comercio.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  Entendido
                </button>
              </div>
            )}

            {/* No puede dejar reseña - Cooldown */}
            {!isValidating && !canReview && hasApprovedReservation && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Período de Espera
                </h4>
                <p className="text-gray-600 mb-6">
                  Puedes dejar otra reseña después de que pasen 7 días desde tu última reseña en este comercio.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;