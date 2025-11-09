// Home.jsx - Página principal COMPLETA con mapa y búsqueda

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../hooks/useLocation';
import Header from '../components/Shared/Header';
import SearchBar from '../components/Home/SearchBar';
import GoogleMapView from '../components/Home/GoogleMapView';
import PlaceList from '../components/Home/PlaceList';
import PlaceDetailModal from '../components/Home/PlaceDetailModal';
import {
  getAllComercios,
  searchComerciosByName,
  filterApprovedComercios,
  filterComerciosByType,
  sortComerciosByDistance,
} from '../services/comerciosService';
import ReservaModal from '../components/Reservations/ReservaModal';
import { MapPin, List, Loader, AlertCircle } from 'lucide-react';

const Home = () => {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' o 'list'
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [selectedComercioForReserva, setSelectedComercioForReserva] = useState(null);
  
  const { isAuthenticated } = useAuth();
  const { 
    location, 
    isLoading: locationLoading, 
    error: locationError, 
    requestLocation 
  } = useLocation();
  const navigate = useNavigate();

  // Cargar comercios al montar
  useEffect(() => {
    loadPlaces();
  }, []);

  // Aplicar ordenamiento cuando cambia la ubicación
  useEffect(() => {
    if (location && places.length > 0) {
      applyFiltersAndSort('', { type: 'all', sortBy: 'distance' });
    }
  }, [location]);

  const loadPlaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const comercios = await getAllComercios();
      
      // Filtrar solo comercios aprobados
      const aprobados = filterApprovedComercios(comercios);
      setPlaces(aprobados);
      setFilteredPlaces(aprobados);
    } catch (err) {
      console.error('Error cargando lugares:', err);
      setError('Error al cargar los lugares. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = (searchTerm, filters) => {
    let results = [...places];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(place =>
        place.nombre.toLowerCase().includes(term) ||
        place.direccion.toLowerCase().includes(term) ||
        place.ciudad?.toLowerCase().includes(term)
      );
    }

    // Filtrar por tipo
    results = filterComerciosByType(results, filters.type);

    // Ordenar
    switch (filters.sortBy) {
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'distance':
        if (location) {
          results = sortComerciosByDistance(results, location);
        }
        break;
      case 'name':
      default:
        results.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
    }

    setFilteredPlaces(results);
  };

  const handleSearch = async (searchTerm, filters) => {
    try {
      setIsLoading(true);
      setError(null);

      let results;
      
      if (searchTerm) {
        // Buscar por nombre en el backend
        try {
          results = await searchComerciosByName(searchTerm);
          results = filterApprovedComercios(results);
        } catch (err) {
          // Si falla la búsqueda, usar filtrado local
          results = places.filter(p => 
            p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      } else {
        // Usar todos los lugares
        results = [...places];
      }

      // Aplicar filtros y ordenamiento localmente
      let filtered = filterComerciosByType(results, filters.type);

      // Ordenar
      switch (filters.sortBy) {
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'distance':
          if (location) {
            filtered = sortComerciosByDistance(filtered, location);
          }
          break;
        case 'name':
        default:
          filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
          break;
      }

      setFilteredPlaces(filtered);
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Error al buscar lugares');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPlace(null);
    setIsModalOpen(false);
  };

  const handleReserve = (place) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/' } });
      return;
    }
    setSelectedComercioForReserva(place);
    setShowReservaModal(true);
  };

  const handleReview = (place) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/' } });
      return;
    }
    // Abrir modal de reseña (se implementará en Fase 4)
    console.log('Dejar reseña en:', place);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Info de ubicación */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Descubre lugares cerca de ti
              </h1>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {locationLoading ? (
                  <p className="text-gray-600 text-sm">Obteniendo ubicación...</p>
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
                  <p className="text-gray-600 text-sm">
                    Ubicación detectada: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                ) : (
                  <button
                    onClick={requestLocation}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Activar ubicación
                  </button>
                )}
              </div>
            </div>

            {/* Toggle vista */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md transition flex items-center gap-2 ${
                  viewMode === 'map'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Mapa</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md transition flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Lista</span>
              </button>
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

        {/* Contenido: Mapa o Lista */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando lugares...</p>
            </div>
          </div>
        ) : viewMode === 'map' ? (
          <GoogleMapView
            places={filteredPlaces}
            userLocation={location}
            selectedPlace={selectedPlace}
            onPlaceClick={handlePlaceClick}
            onMapClick={() => setSelectedPlace(null)}
          />
        ) : (
          <PlaceList
            places={filteredPlaces}
            onPlaceClick={handlePlaceClick}
            isLoading={isLoading}
            userLocation={location}
          />
        )}

        {/* Contador de resultados */}
        {!isLoading && (
          <div className="mt-4 text-center text-gray-600">
            <p>
              Mostrando <strong>{filteredPlaces.length}</strong> de{' '}
              <strong>{places.length}</strong> lugares
            </p>
          </div>
        )}
      </main>

      {/* Modal de detalles */}
      <PlaceDetailModal
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onReserve={handleReserve}
        onReview={handleReview}
      />

      // En el JSX (antes del cierre del componente)
      <ReservaModal
        isOpen={showReservaModal}
        onClose={() => {
          setShowReservaModal(false);
          setSelectedComercioForReserva(null);
        }}
        comercio={selectedComercioForReserva}
        onSuccess={() => {
          navigate('/reservas');
        }}
      />
    </div>
  );
};

export default Home;