// GoogleMapView.jsx - Componente de mapa con Google Maps

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '../../utils/constants';
import { MapPin, Navigation, Loader } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: -34.6037,
  lng: -58.3816, // Buenos Aires
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

/**
 * Componente de mapa con Google Maps
 * @param {Object} props
 * @param {Array} props.places - Lista de comercios a mostrar
 * @param {Object} props.userLocation - Ubicación del usuario { latitude, longitude }
 * @param {Object} props.selectedPlace - Lugar seleccionado
 * @param {Function} props.onPlaceClick - Callback al hacer click en un marcador
 * @param {Function} props.onMapClick - Callback al hacer click en el mapa
 */
const GoogleMapView = ({
  places = [],
  userLocation = null,
  selectedPlace = null,
  onPlaceClick,
  onMapClick,
}) => {
  const [map, setMap] = useState(null);
  const [hoveredPlace, setHoveredPlace] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // Callback cuando el mapa se carga
  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);

    // Si hay lugares, ajustar los límites del mapa
    if (places.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      places.forEach((place) => {
        if (place.latitud && place.longitud) {
          bounds.extend({
            lat: place.latitud,
            lng: place.longitud,
          });
        }
      });
      map.fitBounds(bounds);
    }
  }, [places]);

  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
  }, []);

  // Centrar mapa en ubicación del usuario
  const centerOnUser = useCallback(() => {
    if (map && userLocation) {
      map.panTo({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
      map.setZoom(15);
    }
  }, [map, userLocation]);

  // Centrar mapa en un lugar específico
  const centerOnPlace = useCallback((place) => {
    if (map && place) {
      map.panTo({
        lat: place.latitud,
        lng: place.longitud,
      });
      map.setZoom(16);
    }
  }, [map]);

  // Icono personalizado para marcadores
  const getMarkerIcon = (place, isSelected, isHovered) => {
    if (!window.google) return null;

    const color = isSelected ? '#7C3AED' : isHovered ? '#A78BFA' : '#EC4899';
    
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: isSelected ? 12 : isHovered ? 10 : 8,
    };
  };

  if (loadError) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-red-600">
          <MapPin className="w-12 h-12 mx-auto mb-2" />
          <p className="font-semibold">Error al cargar el mapa</p>
          <p className="text-sm text-gray-600 mt-1">
            Verifica tu conexión a internet y la API key
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  const center = userLocation
    ? { lat: userLocation.latitude, lng: userLocation.longitude }
    : defaultCenter;

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
        onClick={onMapClick}
      >
        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <Marker
            position={{
              lat: userLocation.latitude,
              lng: userLocation.longitude,
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#3B82F6',
              fillOpacity: 0.8,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
              scale: 10,
            }}
            title="Tu ubicación"
            zIndex={1000}
          />
        )}

        {/* Marcadores de comercios */}
        {places.map((place, index) => {
          if (!place.latitud || !place.longitud) return null;

          const isSelected = selectedPlace?.iD_Comercio === place.iD_Comercio;
          const isHovered = hoveredPlace?.iD_Comercio === place.iD_Comercio;

          return (
            <Marker
              key={place.iD_Comercio || index}
              position={{
                lat: place.latitud,
                lng: place.longitud,
              }}
              icon={getMarkerIcon(place, isSelected, isHovered)}
              title={place.nombre}
              onClick={() => {
                onPlaceClick && onPlaceClick(place);
                centerOnPlace(place);
              }}
              onMouseOver={() => setHoveredPlace(place)}
              onMouseOut={() => setHoveredPlace(null)}
              zIndex={isSelected ? 100 : isHovered ? 50 : 1}
            />
          );
        })}

        {/* InfoWindow para el lugar seleccionado */}
        {selectedPlace && selectedPlace.latitud && selectedPlace.longitud && (
          <InfoWindow
            position={{
              lat: selectedPlace.latitud,
              lng: selectedPlace.longitud,
            }}
            onCloseClick={() => onPlaceClick && onPlaceClick(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-bold text-gray-800 mb-1">
                {selectedPlace.nombre}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {selectedPlace.direccion}
              </p>
              {selectedPlace.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold">{selectedPlace.rating}</span>
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Botón para centrar en ubicación del usuario */}
      {userLocation && (
        <button
          onClick={centerOnUser}
          className="absolute bottom-24 right-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition"
          title="Ir a mi ubicación"
        >
          <Navigation className="w-5 h-5 text-blue-600" />
        </button>
      )}

      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md text-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Tu ubicación</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500"></div>
          <span>Comercios</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapView;