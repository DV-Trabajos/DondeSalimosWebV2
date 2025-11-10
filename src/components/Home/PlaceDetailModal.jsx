// PlaceDetailModal.jsx - Modal con detalles completos del comercio + Reseñas

import { useState, useEffect } from 'react';
import { X, Star, MapPin, Phone, Clock, Mail, Users, Music, Calendar } from 'lucide-react';
import { convertBase64ToImage } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { getReseniasByComercio } from '../../services/reseniasService';
import ReviewModal from '../Reviews/ReviewModal';

/**
 * Modal con información detallada de un comercio + Sistema de reseñas
 */
const PlaceDetailModal = ({
  place,
  isOpen,
  onClose,
  onReserve,
  onReview,
}) => {
  const { isAuthenticated, user } = useAuth();
  
  // Estados para reseñas
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Cargar reseñas cuando se abre el modal
  useEffect(() => {
    if (isOpen && place?.iD_Comercio) {
      loadReviews();
    } else {
      // Resetear cuando se cierra
      setReviews([]);
      setAverageRating(0);
      setShowAllReviews(false);
    }
  }, [isOpen, place]);

  const loadReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const data = await getReseniasByComercio(place.iD_Comercio);
      setReviews(data);
      
      // Calcular promedio
      if (data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.calificacion, 0) / data.length;
        setAverageRating(avg);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleReviewSuccess = () => {
    // Recargar reseñas después de crear una nueva
    loadReviews();
  };

  const handleReview = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para dejar una reseña');
      return;
    }
    setShowReviewModal(true);
  };

  if (!isOpen || !place) return null;

  // Preparar imagen
  const imageUrl = place.foto 
    ? convertBase64ToImage(place.foto)
    : place.fotoReferencia || '/placeholder.jpg';

  // Verificar si es el dueño
  const isOwner = user?.iD_Usuario === place.iD_Usuario;
  
  // Verificar si está pendiente
  const isPending = place.estado === false;

  // Función para renderizar estrellas
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
        }`}
      />
    ));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8">
          {/* Header con imagen */}
          <div className="relative h-64">
            <img
              src={imageUrl}
              alt={place.nombre}
              className="w-full h-full object-cover rounded-t-2xl"
              onError={(e) => {
                e.target.src = '/placeholder.jpg';
              }}
            />
            
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Badge de estado */}
            {isPending && (
              <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Pendiente de aprobación
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="p-6">
            {/* Título y rating */}
            <div className="mb-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {place.nombre}
              </h2>
              
              {/* Rating promedio */}
              {averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(averageRating)}
                  </div>
                  <span className="font-bold text-gray-800">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
                  </span>
                </div>
              )}
            </div>

            {/* Dirección */}
            <div className="flex items-start gap-2 text-gray-600 mb-4">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
              <p>{place.direccion}</p>
            </div>

            {/* Información adicional para comercios locales */}
            {place.iD_Comercio && (
              <div className="bg-purple-50 rounded-lg p-4 mb-4 space-y-2">
                {place.generoMusical && (
                  <div className="flex items-center gap-2 text-purple-700">
                    <Music className="w-5 h-5" />
                    <span className="font-semibold">{place.generoMusical}</span>
                  </div>
                )}
                
                {place.capacidad && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-5 h-5" />
                    <span>Capacidad: {place.capacidad} personas</span>
                  </div>
                )}

                {place.horaIngreso && place.horaCierre && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-5 h-5" />
                    <span>{place.horaIngreso} - {place.horaCierre}</span>
                  </div>
                )}

                {place.telefono && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-5 h-5" />
                    <a href={`tel:${place.telefono}`} className="hover:text-primary">
                      {place.telefono}
                    </a>
                  </div>
                )}

                {place.correo && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-5 h-5" />
                    <a href={`mailto:${place.correo}`} className="hover:text-primary">
                      {place.correo}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN DE RESEÑAS */}
            {place.iD_Comercio && (
              <div className="mt-6 bg-purple-50 rounded-lg p-5 border-l-4 border-purple-500">
                {/* Header de reseñas */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Reseñas
                  </h3>
                  
                  {averageRating > 0 && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                      <div className="flex">
                        {renderStars(Math.round(averageRating))}
                      </div>
                      <span className="font-bold text-gray-800">
                        {averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Lista de reseñas */}
                {isLoadingReviews ? (
                  <div className="text-center py-8 text-gray-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p>Cargando reseñas...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {(showAllReviews ? reviews : reviews.slice(0, 3)).map(review => (
                      <div
                        key={review.iD_Resenia}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                      >
                        {/* Usuario y fecha */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">
                            {review.usuario?.nombreUsuario || 'Usuario'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(review.fechaCreacion).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        {/* Estrellas */}
                        <div className="flex mb-2">
                          {renderStars(review.calificacion)}
                        </div>
                        
                        {/* Comentario */}
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {review.comentario}
                        </p>
                      </div>
                    ))}

                    {/* Botón ver más */}
                    {reviews.length > 3 && (
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="w-full text-center text-purple-600 hover:text-purple-700 font-semibold text-sm py-2 hover:bg-white rounded-lg transition"
                      >
                        {showAllReviews 
                          ? 'Ver menos' 
                          : `Ver todas las reseñas (${reviews.length})`
                        }
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No hay reseñas aún. ¡Sé el primero en dejar una!
                  </p>
                )}
              </div>
            )}

            {/* Botones de acción */}
            <div className="mt-6 space-y-3">
              {/* Botones para usuarios autenticados que no son dueños y el comercio está aprobado */}
              {isAuthenticated && !isOwner && !isPending && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      onReserve && onReserve(place);
                    }}
                    className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Hacer reserva
                  </button>

                  <button
                    onClick={handleReview}
                    className="w-full bg-white border-2 border-primary text-primary px-6 py-3 rounded-lg hover:bg-purple-50 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <Star className="w-5 h-5" />
                    Dejar reseña
                  </button>
                </>
              )}

              {/* Si no está autenticado */}
              {!isAuthenticated && !isPending && (
                <div className="w-full text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-3">
                    Inicia sesión para hacer reservas y dejar reseñas
                  </p>
                  <a
                    href="/login"
                    className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
                  >
                    Iniciar sesión
                  </a>
                </div>
              )}

              {/* Si es el dueño */}
              {isOwner && (
                <div className="w-full text-center py-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 font-semibold">
                    Este es tu comercio
                  </p>
                </div>
              )}

              {/* Si está pendiente */}
              {isPending && (
                <div className="w-full text-center py-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-yellow-700 font-semibold">
                    Este comercio está pendiente de aprobación
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de reseña */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        comercio={place}
        onSuccess={handleReviewSuccess}
      />
    </>
  );
};

export default PlaceDetailModal;
