// Home.jsx - Página principal COMPLETA con mapa, búsqueda, filtros y todas las funcionalidades

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../hooks/useLocation';
import Header from '../components/Shared/Header';
import SearchBar from '../components/Home/SearchBar';
import GoogleMapView from '../components/Home/GoogleMapView';
import PlaceList from '../components/Home/PlaceList';
import PlaceDetailModal from '../components/Home/PlaceDetailModal';
import BarStories from '../components/Home/BarStories';
import ReservaModal from '../components/Reservations/ReservaModal';
import {
  getAllComercios,
  searchComerciosByName,
  filterApprovedComercios,
  filterComerciosByType,
  sortComerciosByDistance,
} from '../services/comerciosService';
import { MapPin, List, Loader, AlertCircle, Filter } from 'lucide-react';

const Home = () => {
  // Estados principales
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' o 'list'
  
  // Estados para reservas
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [selectedComercioForReserva, setSelectedComercioForReserva] = useState(null);
  
  // Estados para filtros
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const { 
    location, 
    isLoading: locationLoading, 
    error: locationError, 
    requestLocation 
  } = useLocation();
  const navigate = useNavigate();

  // Categorías para el filtro
  const categories = [
    { id: 'all', label: 'Todos', icon: '🏪' },
    { id: '1', label: 'Bares', icon: '🍺' },
    { id: '2', label: 'Restaurantes', icon: '🍽️' },
    { id: '3', label: 'Cafés', icon: '☕' },
    { id: '4', label: 'Discotecas', icon: '🎉' },
    { id: '5', label: 'Pubs', icon: '🍻' },
  ];

  // Cargar comercios al montar
  useEffect(() => {
    loadPlaces();
  }, []);

  // Aplicar filtros cuando cambian los parámetros
  useEffect(() => {
    applyFilters();
  }, [places, selectedCategory, searchTerm, location]);

  const loadPlaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const comercios = await getAllComercios();
      
      // Filtrar solo comercios aprobados
      const aprobados = filterApprovedComercios(comercios);
      setPlaces(aprobados);
    } catch (err) {
      console.error('Error cargando lugares:', err);
      setError('Error al cargar los lugares. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...places];

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filterComerciosByType(filtered, parseInt(selectedCategory));
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.nombre.toLowerCase().includes(term) ||
        c.direccion.toLowerCase().includes(term)
      );
    }

    // Ordenar por distancia si hay ubicación
    if (location) {
      filtered = sortComerciosByDistance(filtered, location);
    }

    setFilteredPlaces(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowFilters(false); // Cerrar el menú de filtros después de seleccionar
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlace(null);
  };

  const handleReserve = (place) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para hacer una reserva');
      navigate('/login');
      return;
    }
    
    setSelectedComercioForReserva(place);
    setShowReservaModal(true);
  };

  const handleReview = (place) => {
    // Esta función se maneja dentro de PlaceDetailModal
    console.log('Review:', place);
  };

  const handleStoryPress = (comercio) => {
    // Buscar el comercio completo en la lista
    const comercioCompleto = places.find(p => p.iD_Comercio === comercio.iD_Comercio);
    
    if (comercioCompleto) {
      setSelectedPlace(comercioCompleto);
      setIsModalOpen(true);
      setViewMode('map'); // Cambiar a vista de mapa
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Info de ubicación y controles */}
        <div className="mb-6">
          {/* Barra de ubicación */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
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

          {/* Título y controles */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              Descubre lugares
            </h1>
            <div className="flex gap-2">
              {/* Toggle Mapa/Lista */}
              <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md transition flex items-center gap-2 ${
                    viewMode === 'map'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">Mapa</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md transition flex items-center gap-2 ${
                    viewMode === 'list'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Lista</span>
                </button>
              </div>

              {/* Botón de filtros */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-sm ${
                    selectedCategory !== 'all'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filtros</span>
                  {selectedCategory !== 'all' && (
                    <span className="hidden sm:inline text-xs">(1)</span>
                  )}
                </button>

                {/* Menú desplegable de filtros */}
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
                    <div className="px-3 py-2 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase">
                        Categorías
                      </p>
                    </div>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition flex items-center gap-3 ${
                          selectedCategory === cat.id
                            ? 'bg-purple-50 text-primary font-semibold'
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span>{cat.label}</span>
                        {selectedCategory === cat.id && (
                          <span className="ml-auto text-primary">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
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

        {/* Contenido: Mapa o Lista */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando lugares...</p>
            </div>
          </div>
        ) : viewMode === 'map' ? (
          <div className="relative">
            <GoogleMapView
              places={filteredPlaces}
              userLocation={location}
              selectedPlace={selectedPlace}
              onPlaceClick={handlePlaceClick}
              onMapClick={() => setSelectedPlace(null)}
            />

            {/* BarStories sobre el mapa - SIN CategoryFilter */}
            <BarStories onStoryPress={handleStoryPress} />
          </div>
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
              {selectedCategory !== 'all' && (
                <span className="ml-2 text-primary font-semibold">
                  (Filtrado por categoría)
                </span>
              )}
              {searchTerm && (
                <span className="ml-2 text-primary font-semibold">
                  (Búsqueda: "{searchTerm}")
                </span>
              )}
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

      {/* Modal de reserva */}
      <ReservaModal
        isOpen={showReservaModal}
        onClose={() => {
          setShowReservaModal(false);
          setSelectedComercioForReserva(null);
        }}
        comercio={selectedComercioForReserva}
        onSuccess={() => {
          setShowReservaModal(false);
          setSelectedComercioForReserva(null);
          navigate('/reservas');
        }}
      />
    </div>
  );
};

export default Home;