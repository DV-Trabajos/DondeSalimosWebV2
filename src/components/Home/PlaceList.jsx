// PlaceList.jsx - Lista de lugares

import PlaceCard from './PlaceCard';
import { Loader } from 'lucide-react';

const PlaceList = ({ places = [], onPlaceClick, isLoading = false, userLocation }) => {
  // Calcular distancia si hay ubicación
  const calculateDistance = (placeLat, placeLng) => {
    if (!userLocation) return null;
    
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = userLocation.latitude * Math.PI / 180;
    const φ2 = placeLat * Math.PI / 180;
    const Δφ = (placeLat - userLocation.latitude) * Math.PI / 180;
    const Δλ = (placeLng - userLocation.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando lugares...</p>
        </div>
      </div>
    );
  }

  if (!places || places.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No se encontraron lugares</p>
        <p className="text-gray-500 text-sm mt-2">
          Intenta buscar con otros términos o filtros
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {places.length} {places.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place, index) => {
          const lat = place.latitud || place.geometry?.location?.lat;
          const lng = place.longitud || place.geometry?.location?.lng;
          const distance = lat && lng ? calculateDistance(lat, lng) : null;

          return (
            <PlaceCard
              key={place.iD_Comercio || place.place_id || index}
              place={place}
              onClick={onPlaceClick}
              distance={distance}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PlaceList;
