// PlaceCard.jsx - Tarjeta individual de lugar

import { MapPin, Star, Phone, Clock } from 'lucide-react';
import { convertBase64ToImage } from '../../utils/formatters';

const PlaceCard = ({ place, onClick, distance }) => {
  const imageUrl = place.foto 
    ? convertBase64ToImage(place.foto)
    : place.fotoReferencia || 'https://via.placeholder.com/400x200?text=No+Image';

  return (
    <div
      onClick={() => onClick && onClick(place)}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
    >
      {/* Imagen */}
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={place.nombre || place.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
          }}
        />
        {place.estado === false && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Pendiente
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
          {place.nombre || place.name}
        </h3>

        {/* Dirección */}
        <div className="flex items-start gap-2 text-gray-600 text-sm mb-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">
            {place.direccion || place.vicinity || place.formatted_address || 'Dirección no disponible'}
          </span>
        </div>

        {/* Rating y distancia */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-semibold text-gray-700">
              {place.rating || 'N/A'}
            </span>
          </div>
          {distance && (
            <span className="text-sm text-gray-600">
              {distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`}
            </span>
          )}
        </div>

        {/* Info adicional */}
        {(place.telefono || place.horario) && (
          <div className="mt-3 pt-3 border-t space-y-1">
            {place.telefono && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone className="w-4 h-4" />
                <span>{place.telefono}</span>
              </div>
            )}
            {place.horario && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Clock className="w-4 h-4" />
                <span>{place.horario}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
