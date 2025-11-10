// BarStories.jsx - Historias de comercios destacados estilo Instagram

import { useState, useEffect } from 'react';
import { getAllComercios } from '../../services/comerciosService';
import { convertBase64ToImage } from '../../utils/formatters';

/**
 * Componente de historias de comercios destacados
 * @param {Object} props
 * @param {Function} props.onStoryPress - Callback al hacer click en una historia
 */
const BarStories = ({ onStoryPress }) => {
  const [comercios, setComercios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedComercios();
  }, []);

  const loadFeaturedComercios = async () => {
    try {
      setIsLoading(true);
      const allComercios = await getAllComercios();
      
      // Filtrar solo comercios aprobados
      const featured = allComercios
        .filter(c => c.estado === true)
        .slice(0, 15); // Mostrar máximo 15
      
      setComercios(featured);
    } catch (error) {
      console.error('Error cargando comercios destacados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || comercios.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-0 right-0 z-20 px-4 pointer-events-none">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide pointer-events-auto">
        {comercios.map(comercio => {
          const imageUrl = comercio.foto 
            ? convertBase64ToImage(comercio.foto)
            : '/placeholder.jpg';

          return (
            <button
              key={comercio.iD_Comercio}
              onClick={() => onStoryPress(comercio)}
              className="flex-shrink-0 flex flex-col items-center gap-1 group transition-transform hover:scale-105"
            >
              {/* Círculo con borde gradiente (estilo Instagram) */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 shadow-lg">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <img
                    src={imageUrl}
                    alt={comercio.nombre}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                </div>
              </div>
              
              {/* Nombre del comercio */}
              <span className="text-xs font-semibold max-w-[64px] sm:max-w-[80px] truncate text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {comercio.nombre}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BarStories;
