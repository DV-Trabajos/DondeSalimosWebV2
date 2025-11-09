// useDebounce.js - Hook para debounce de valores

import { useState, useEffect } from 'react';

/**
 * Hook personalizado para hacer debounce de un valor
 * Útil para búsquedas en tiempo real y evitar demasiadas peticiones
 * 
 * @param {any} value - Valor a hacer debounce
 * @param {number} delay - Delay en milisegundos (default: 500)
 * @returns {any} Valor con debounce aplicado
 * 
 * @example
 * const SearchComponent = () => {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // Hacer búsqueda solo cuando el usuario deja de escribir
 *       searchAPI(debouncedSearchTerm);
 *     }
 *   }, [debouncedSearchTerm]);
 * 
 *   return (
 *     <input 
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *     />
 *   );
 * };
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Establecer timeout para actualizar el valor
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timeout si el valor cambia antes de que se cumpla el delay
    // o cuando el componente se desmonte
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
