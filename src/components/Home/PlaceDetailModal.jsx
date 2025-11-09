// PlaceDetailModal.jsx - Modal con detalles del lugar

import { X, MapPin, Phone, Clock, Star, Calendar } from 'lucide-react';
import { convertBase64ToImage } from '../../utils/formatters';

const PlaceDetailModal = ({ place, isOpen, onClose, onReserve }) => {
  if (!isOpen || !place) return null;

  const imageUrl = place.foto 
    ? convertBase64ToImage(place.foto)
    : place.fotoReferencia || 'https://via.placeholder.com/800x400?text=No+Image';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image */}
          <div className="h-64 bg-gray-200">
            <img
              src={imageUrl}
              alt={place.nombre || place.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
              }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {place.nombre || place.name}
            </h2>

            <div className="space-y-4">
              {/* Rating */}
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-lg font-semibold">{place.rating || 'N/A'}</span>
              </div>

              {/* Dirección */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">Dirección</p>
                  <p className="text-gray-600">
                    {place.direccion || place.vicinity || place.formatted_address || 'No disponible'}
                  </p>
                </div>
              </div>

              {/* Teléfono */}
              {place.telefono && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-600" />
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

              {/* Horario */}
              {place.horario && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Horario</p>
                    <p className="text-gray-600">{place.horario}</p>
                  </div>
                </div>
              )}

              {/* Descripción */}
              {place.descripcion && (
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Descripción</p>
                  <p className="text-gray-600">{place.descripcion}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => onReserve && onReserve(place)}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Hacer Reserva
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailModal;
