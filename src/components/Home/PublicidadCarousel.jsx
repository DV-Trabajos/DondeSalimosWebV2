// PublicidadCarousel.jsx - Carrusel de publicidades activas
// Ruta: src/components/Home/PublicidadCarousel.jsx
// Fase 7: Sistema de Publicidad

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { 
  getAllPublicidades, 
  filterPublicidadesActivas,
  incrementarVisualizacion 
} from '../../services/publicidadesService';
import { convertBase64ToImage } from '../../utils/formatters';

const PublicidadCarousel = () => {
  const [publicidades, setPublicidades] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    loadPublicidades();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    // Auto-scroll cada 5 segundos
    if (publicidades.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % publicidades.length);
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [publicidades.length]);

  const loadPublicidades = async () => {
    try {
      const all = await getAllPublicidades();
      const activas = filterPublicidadesActivas(all);
      setPublicidades(activas);
      
      // Incrementar visualización de la primera
      if (activas.length > 0) {
        incrementarVisualizacion(activas[0].iD_Publicidad).catch(() => {});
      }
    } catch (error) {
      console.error('Error cargando publicidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrev = () => {
    const newIndex = currentIndex === 0 ? publicidades.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    incrementarVisualizacion(publicidades[newIndex].iD_Publicidad).catch(() => {});
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % publicidades.length;
    setCurrentIndex(newIndex);
    incrementarVisualizacion(publicidades[newIndex].iD_Publicidad).catch(() => {});
  };

  if (loading) return null;
  if (publicidades.length === 0) return null;

  const current = publicidades[currentIndex];

  return (
    <div className="relative w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl overflow-hidden shadow-lg mb-6">
      <div className="flex items-center">
        {/* Imagen */}
        {current.imagen && (
          <div className="w-1/3 h-32">
            <img
              src={convertBase64ToImage(current.imagen)}
              alt="Publicidad"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Contenido */}
        <div className={`${current.imagen ? 'w-2/3' : 'w-full'} p-6`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold text-white">
              📢 PUBLICIDAD
            </span>
            {current.comercio && (
              <span className="text-white/80 text-sm font-medium">
                {current.comercio.nombre}
              </span>
            )}
          </div>
          
          <p className="text-white text-sm leading-relaxed line-clamp-2">
            {current.descripcion}
          </p>
          
          <div className="flex items-center gap-2 mt-3 text-white/60 text-xs">
            <Eye className="w-4 h-4" />
            <span>{current.visualizaciones || 0} vistas</span>
          </div>
        </div>
      </div>

      {/* Controles */}
      {publicidades.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
          
          {/* Indicadores */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {publicidades.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PublicidadCarousel;
