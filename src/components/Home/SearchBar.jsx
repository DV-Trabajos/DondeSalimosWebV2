// SearchBar.jsx - Barra de búsqueda con filtros CORREGIDA

import { useState, useEffect } from 'react';
import { Search, Filter, X, MapPin } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { TIPOS_COMERCIO_FILTER } from '../../utils/constants'; // ✅ AGREGADO

/**
 * Componente de barra de búsqueda con filtros
 * @param {Object} props
 * @param {Function} props.onSearch - Callback con (searchTerm, filters)
 * @param {boolean} props.isLoading - Estado de carga
 */
const SearchBar = ({ onSearch, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'rating', 'distance'
  
  // ✅ Usar constantes compartidas
  const TIPOS_COMERCIO = TIPOS_COMERCIO_FILTER;
  
  // Debounce del término de búsqueda (500ms)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Ejecutar búsqueda cuando cambie el término con debounce o los filtros
  useEffect(() => {
    handleSearch();
  }, [debouncedSearchTerm, selectedType, sortBy]);

  // ✅ FUNCIÓN CORREGIDA que envía TERM y FILTERS
  const handleSearch = () => {
    const filters = {
      type: selectedType,
      sortBy,
    };

    console.log('🔍 SearchBar enviando:', { term: debouncedSearchTerm, filters });
    
    // ✅ AHORA SÍ envía ambos parámetros correctamente
    onSearch(debouncedSearchTerm, filters);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSortBy('name');
    onSearch('', { type: 'all', sortBy: 'name' });
  };

  const hasActiveFilters = selectedType !== 'all' || sortBy !== 'name';

  return (
    <div className="w-full">
      {/* Barra principal de búsqueda */}
      <div className="flex gap-2">
        {/* Input de búsqueda */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o dirección..."
              disabled={isLoading}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Botón de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 border rounded-lg flex items-center gap-2 transition ${
            showFilters || hasActiveFilters
              ? 'bg-primary text-white border-primary'
              : 'bg-white border-gray-300 hover:bg-gray-50'
          }`}
          aria-label="Mostrar filtros"
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <span className="bg-white text-primary rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
              {(selectedType !== 'all' ? 1 : 0) + (sortBy !== 'name' ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Botón de limpiar */}
        {(searchTerm || hasActiveFilters) && (
          <button
            onClick={handleClear}
            className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
            aria-label="Limpiar filtros"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        )}
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro de tipo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de comercio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS_COMERCIO.map((tipo) => (
                  <button
                    key={tipo.id}
                    onClick={() => {
                      console.log('🏷️ Tipo seleccionado:', tipo.id);
                      setSelectedType(tipo.id);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                      selectedType === tipo.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{tipo.icon}</span>
                    <span>{tipo.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  console.log('📊 Ordenamiento seleccionado:', e.target.value);
                  setSortBy(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="name">Nombre (A-Z)</option>
                <option value="rating">Mejor calificación</option>
                <option value="distance">Más cercano</option>
              </select>
            </div>
          </div>

          {/* Resumen de filtros activos */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Filtros activos:</p>
              <div className="flex flex-wrap gap-2">
                {selectedType !== 'all' && (
                  <span className="px-3 py-1 bg-primary text-white text-sm rounded-full flex items-center gap-1">
                    {TIPOS_COMERCIO.find(t => t.id === selectedType)?.label}
                    <button
                      onClick={() => setSelectedType('all')}
                      className="hover:bg-purple-600 rounded-full p-0.5"
                      aria-label="Quitar filtro de tipo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {sortBy !== 'name' && (
                  <span className="px-3 py-1 bg-primary text-white text-sm rounded-full flex items-center gap-1">
                    Orden: {sortBy === 'rating' ? 'Calificación' : 'Distancia'}
                    <button
                      onClick={() => setSortBy('name')}
                      className="hover:bg-purple-600 rounded-full p-0.5"
                      aria-label="Quitar ordenamiento"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Indicador de búsqueda activa */}
      {searchTerm && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>
            Buscando: <strong>{searchTerm}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;