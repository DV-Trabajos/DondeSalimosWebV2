// ReviewModal.jsx - Modal para crear reseñas

import { useState } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { createResenia } from '../../services/reseniasService';

/**
 * Modal para crear una nueva reseña
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado del modal
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Object} props.comercio - Comercio a reseñar
 * @param {Function} props.onSuccess - Callback al crear exitosamente
 */
const ReviewModal = ({ isOpen, onClose, comercio, onSuccess }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    if (!comment.trim()) {
      setError('Por favor escribe un comentario');
      return;
    }

    if (comment.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres');
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
        fechaCreacion: new Date().toISOString(),
      };

      await createResenia(reseniaData);
      
      // Limpiar y cerrar
      setRating(0);
      setComment('');
      alert('¡Gracias por tu reseña! Ha sido publicada exitosamente.');
      
      if (onSuccess) onSuccess();
      onClose();

    } catch (err) {
      console.error('Error creando reseña:', err);
      setError(err.message || 'Error al publicar la reseña. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-secondary rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-purple-500/30 max-h-[90vh] overflow-y-auto">
        {/* Cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          disabled={isSubmitting}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Deja tu reseña
          </h2>
          <p className="text-purple-300">{comercio?.nombre}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Estrellas */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">
              Calificación *
            </label>
            <div className="flex gap-3 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-125 focus:outline-none"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600 hover:text-gray-400'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center mt-2 text-gray-400 text-sm">
              {rating > 0 ? (
                <span className="text-yellow-400 font-semibold">
                  {rating === 1 ? '⭐ Malo' : 
                   rating === 2 ? '⭐⭐ Regular' : 
                   rating === 3 ? '⭐⭐⭐ Bueno' : 
                   rating === 4 ? '⭐⭐⭐⭐ Muy bueno' : 
                   '⭐⭐⭐⭐⭐ ¡Excelente!'}
                </span>
              ) : (
                'Selecciona tu calificación'
              )}
            </p>
          </div>

          {/* Comentario */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Tu opinión *
            </label>
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError('');
              }}
              placeholder="Cuéntanos sobre tu experiencia... ¿Qué te gustó? ¿Qué mejorarías?"
              rows={5}
              maxLength={500}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border-2 border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-400">
                Mínimo 10 caracteres
              </p>
              <p className={`text-xs ${comment.length > 450 ? 'text-orange-400' : 'text-gray-400'}`}>
                {comment.length}/500
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-600 text-white rounded-lg hover:bg-gray-800 transition font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Publicando...
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  Publicar Reseña
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
