// Home.jsx - Página principal completa

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../hooks/useLocation';
import Header from '../components/Shared/Header';
import SearchBar from '../components/Home/SearchBar';
import PlaceList from '../components/Home/PlaceList';
import PlaceDetailModal from '../components/Home/PlaceDetailModal';
import { getAllComercios, searchComerciosByName } from '../services/comerciosService';
import { MapPin, Loader, AlertCircle } from 'lucide-react';

const Home = () => {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const { location, isLoading: locationLoading, error: locationError, requestLocation } = useLocation();
  const navigate = useNavigate();

  // Cargar comercios al montar
  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const comercios = await getAllComercios();
      
      // Filtrar solo comercios aprobados
      const aprobados = comercios.filter(c => c.estado === true);
      setPlaces(aprobados);
    } catch (err) {
      console.error('Error cargando lugares:', err);
      setError('Error al cargar los lugares');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (searchTerm, type) => {
    try {
      setIsLoading(true);
      setError(null);

      let results;
      
      if (searchTerm) {
        // Buscar por nombre
        results = await searchComerciosByName(searchTerm);
      } else {
        // Cargar todos
        results = await getAllComercios();
      }

      // Filtrar aprobados y por tipo
      let filtered = results.filter(c => c.estado === true);
      
      if (type && type !== 'all') {
        filtered = filtered.filter(c => c.iD_TipoComercio === parseInt(type));
      }

      setPlaces(filtered);
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Error en la búsqueda');
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleReserve = (place) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Aquí iría la lógica de reserva (Parte 7)
    console.log('Reservar:', place);
    alert('Funcionalidad de reservas disponible en la Parte 7');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Info de ubicación */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Tu Ubicación
                </h3>
                {locationLoading ? (
                  <div className="flex items-center gap-2 text-blue-700">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Obteniendo ubicación...</span>
                  </div>
                ) : locationError ? (
                  <div className="text-red-600 text-sm">
                    <p>{locationError}</p>
                    <button
                      onClick={requestLocation}
                      className="text-blue-600 hover:underline mt-1"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                ) : location ? (
                  <p className="text-blue-700 text-sm">
                    Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-gray-600 text-sm">No disponible</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <SearchBar
            onSearch={handleSearch}
            isLoading={isLoading}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Lista de lugares */}
        <PlaceList
          places={places}
          onPlaceClick={handlePlaceClick}
          isLoading={isLoading}
          userLocation={location}
        />
      </main>

      {/* Modal de detalles */}
      <PlaceDetailModal
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReserve={handleReserve}
      />
    </div>
  );
};

export default Home;
