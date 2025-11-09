// SearchBar.jsx - Barra de búsqueda de lugares

import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { TIPOS_COMERCIO_DESCRIPCION } from '../../utils/constants';

/**
 * Componente de búsqueda con filtros
 * @param {Object} props
 * @param {function} props.onSearch - Callback cuando se busca
 * @param {function} props.onFilterChange - Callback cuando cambia el filtro
 * @param {boolean} props.isLoading - Estado de carga
 */
const SearchBar = ({ onSearch, onFilterChange, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce para evitar muchas búsquedas mientras escribe
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Ejecutar búsqueda cuando cambia el término debounced
  useState(() => {
    if (onSearch && debouncedSearchTerm !== undefined) {
      onSearch(debouncedSearchTerm, selectedType);
    }
  }, [debouncedSearchTerm, selectedType]);

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('', selectedType);
    }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    if (onFilterChange) {
      onFilterChange(type);
    }
    if (onSearch) {
      onSearch(searchTerm, type);
    }
  };

  const tiposComercio = [
    { id: 'all', label: 'Todos' },
    ...Object.entries(TIPOS_COMERCIO_DESCRIPCION).map(([id, label]) => ({
      id,
      label,
    })),
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Barra de búsqueda principal */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar bares, restaurantes, cafés..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 border rounded-lg transition flex items-center gap-2 ${
            showFilters
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">Filtros</span>
        </button>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Tipo de Lugar
          </h3>
          <div className="flex flex-wrap gap-2">
            {tiposComercio.map((tipo) => (
              <button
                key={tipo.id}
                onClick={() => handleTypeChange(tipo.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedType === tipo.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tipo.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Indicador de carga */}
      {isLoading && (
        <div className="mt-3 flex items-center gap-2 text-gray-600 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Buscando...</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
