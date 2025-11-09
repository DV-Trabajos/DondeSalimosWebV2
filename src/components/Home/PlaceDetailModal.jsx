// PlaceDetailModal.jsx - Modal con detalles completos del comercio

import { X, Star, MapPin, Phone, Clock, Mail, Users, Music, Calendar } from 'lucide-react';
import { convertBase64ToImage } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

/**
 * Modal con información detallada de un comercio
 * @param {Object} props
 * @param {Object} props.place - Comercio seleccionado
 * @param {boolean} props.isOpen - Estado del modal
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Function} props.onReserve - Callback para reservar
 * @param {Function} props.onReview - Callback para dejar reseña
 */
const PlaceDetailModal = ({
  place,
  isOpen,
  onClose,
  onReserve,
  onReview,
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isOpen || !place) return null;

  const imageUrl = place.foto 
    ? convertBase64ToImage(place.foto)
    : 'https://via.placeholder.com/800x400?text=Sin+Imagen';

  const isOwner = user?.iD_Usuario === place.iD_Usuario;
  const isPending = place.estado === false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header con imagen */}
        <div className="relative h-64 md:h-80">
          <img
            src={imageUrl}
            alt={place.nombre}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x400?text=Sin+Imagen';
            }}
          />
          
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          {/* Badge de estado */}
          {isPending && (
            <div className="absolute top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
              Pendiente de aprobación
            </div>
          )}

          {/* Rating */}
          {place.rating && (
            <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="font-bold text-lg">{place.rating}</span>
            </div>
          )}
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto max-h-[calc(90vh-20rem)] p-6">
          {/* Título y tipo */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {place.nombre}
            </h2>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm font-semibold">
                {place.tipoComercio?.nombre || 
                 (place.iD_TipoComercio === 1 ? 'Bar' : 
                  place.iD_TipoComercio === 2 ? 'Boliche' : 'Comercio')}
              </span>
            </div>
          </div>

          {/* Grid de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Dirección */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-800">Dirección</p>
                <p className="text-gray-600">{place.direccion}</p>
                {place.ciudad && (
                  <p className="text-gray-500 text-sm">{place.ciudad}</p>
                )}
              </div>
            </div>

            {/* Teléfono */}
            {place.telefono && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">Teléfono</p>
                  <a 
                    href={`tel:${place.telefono}`}
                    className="text-primary hover:underline"
                  >
                    {place.telefono}
                  </a>
                </div>
              </div>
            )}

            {/* Email */}
            {place.correo && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">Email</p>
                  <a 
                    href={`mailto:${place.correo}`}
                    className="text-primary hover:underline break-all"
                  >
                    {place.correo}
                  </a>
                </div>
              </div>
            )}

            {/* Horario */}
            {(place.horaIngreso || place.horaCierre) && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">Horario</p>
                  <p className="text-gray-600">
                    {place.horaIngreso} - {place.horaCierre}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Información adicional */}
          {(place.capacidad || place.mesas || place.generoMusical) && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Información adicional
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {place.capacidad && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Capacidad</p>
                      <p className="font-semibold">{place.capacidad} personas</p>
                    </div>
                  </div>
                )}
                {place.mesas && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Mesas</p>
                      <p className="font-semibold">{place.mesas}</p>
                    </div>
                  </div>
                )}
                {place.generoMusical && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Music className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Género musical</p>
                      <p className="font-semibold">{place.generoMusical}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información del propietario */}
          {place.usuario && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Información del establecimiento
              </h3>
              <p className="text-gray-600">
                Administrado por: <span className="font-semibold">{place.usuario.nombreUsuario}</span>
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="border-t border-gray-200 pt-6 flex flex-wrap gap-3">
            {/* Mostrar botones solo si el comercio está aprobado y el usuario no es el dueño */}
            {!isPending && !isOwner && isAuthenticated && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onReserve && onReserve(place);
                  }}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Hacer reserva
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onReview && onReview(place);
                  }}
                  className="flex-1 bg-white border-2 border-primary text-primary px-6 py-3 rounded-lg hover:bg-purple-50 transition font-semibold flex items-center justify-center gap-2"
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
              <div className="w-full text-center py-4 bg-blue-50 rounded-lg">
                <p className="text-blue-700 font-semibold">
                  Este es tu comercio
                </p>
              </div>
            )}

            {/* Si está pendiente */}
            {isPending && (
              <div className="w-full text-center py-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-700 font-semibold">
                  Este comercio está pendiente de aprobación
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailModal;