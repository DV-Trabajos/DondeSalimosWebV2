// MisResenias.jsx - Página para que dueños de comercios vean sus reseñas
// Versión completa para Fase 4

import { useState, useEffect } from 'react';
import { Star, TrendingUp, MessageSquare, Filter, Search, Calendar, User, Store } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import { getComerciosByUsuario } from '../services/comerciosService';
import { getReseniasByComercio, getAllResenias } from '../services/reseniasService';

/**
 * Página para que dueños de comercios gestionen sus reseñas recibidas
 */
const MisResenias = () => {
  const { user } = useAuth();
  
  // Estados de datos
  const [comercios, setComercios] = useState([]);
  const [resenias, setResenias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros
  const [filtroComercio, setFiltroComercio] = useState('all');
  const [filtroCalificacion, setFiltroCalificacion] = useState('all');
  const [busqueda, setBusqueda] = useState('');
  
  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    promedio: 0,
    porCalificacion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  useEffect(() => {
    if (user?.iD_Usuario) {
      cargarDatos();
    }
  }, [user]);

  useEffect(() => {
    calcularEstadisticas();
  }, [resenias]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar comercios del usuario
      const comerciosData = await getComerciosByUsuario(user.iD_Usuario);
      setComercios(comerciosData);

      if (comerciosData.length === 0) {
        setResenias([]);
        setLoading(false);
        return;
      }

      // Cargar todas las reseñas
      const allResenias = await getAllResenias();
      
      // Filtrar reseñas de los comercios del usuario
      const comercioIds = comerciosData.map(c => c.iD_Comercio);
      const reseniasUsuario = allResenias.filter(
        resenia => comercioIds.includes(resenia.iD_Comercio) && resenia.estado
      );

      // Ordenar por fecha (más recientes primero)
      const reseniasOrdenadas = reseniasUsuario.sort((a, b) => 
        new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
      );

      setResenias(reseniasOrdenadas);
      
      console.log('✅ Reseñas cargadas:', reseniasOrdenadas.length);
    } catch (err) {
      console.error('❌ Error al cargar datos:', err);
      setError('No se pudieron cargar las reseñas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = () => {
    const stats = {
      total: resenias.length,
      promedio: 0,
      porCalificacion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    if (resenias.length > 0) {
      const suma = resenias.reduce((acc, r) => acc + (r.calificacion || r.puntuacion || 0), 0);
      stats.promedio = suma / resenias.length;

      resenias.forEach(r => {
        const cal = r.calificacion || r.puntuacion || 0;
        if (cal >= 1 && cal <= 5) {
          stats.porCalificacion[cal]++;
        }
      });
    }

    setEstadisticas(stats);
  };

  // Filtrar reseñas
  const reseniasFiltradas = resenias.filter(resenia => {
    // Filtro por comercio
    if (filtroComercio !== 'all' && resenia.iD_Comercio !== parseInt(filtroComercio)) {
      return false;
    }

    // Filtro por calificación
    const calificacion = resenia.calificacion || resenia.puntuacion || 0;
    if (filtroCalificacion !== 'all' && calificacion !== parseInt(filtroCalificacion)) {
      return false;
    }

    // Búsqueda por texto
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      const comentario = (resenia.comentario || '').toLowerCase();
      const usuario = (resenia.usuario?.nombreUsuario || '').toLowerCase();
      
      return comentario.includes(searchLower) || usuario.includes(searchLower);
    }

    return true;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora - date;
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`;
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getNombreComercio = (idComercio) => {
    const comercio = comercios.find(c => c.iD_Comercio === idComercio);
    return comercio?.nombre || 'Comercio';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reseñas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header de navegación */}
      <Header />
      
      <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <MessageSquare className="w-10 h-10 text-primary" />
            Mis Reseñas
          </h1>
          <p className="text-gray-600">
            Gestiona y responde a las reseñas de tus comercios
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total de reseñas */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Total</h3>
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{estadisticas.total}</p>
            <p className="text-xs text-gray-500 mt-1">Reseñas recibidas</p>
          </div>

          {/* Promedio */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Promedio</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-900">
                {estadisticas.promedio.toFixed(1)}
              </p>
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">De 5 estrellas</p>
          </div>

          {/* Calificaciones 5 estrellas */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Excelentes</h3>
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{estadisticas.porCalificacion[5]}</p>
            <p className="text-xs text-gray-500 mt-1">5 estrellas</p>
          </div>

          {/* Comercios */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Comercios</h3>
              <Store className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{comercios.length}</p>
            <p className="text-xs text-gray-500 mt-1">Con reseñas</p>
          </div>
        </div>

        {/* Distribución de calificaciones */}
        {estadisticas.total > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de Calificaciones</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = estadisticas.porCalificacion[rating];
                const percentage = estadisticas.total > 0 ? (count / estadisticas.total) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-24">
                      <span className="text-sm font-semibold text-gray-700">{rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-16 text-right">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-gray-900">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por comercio */}
            <select
              value={filtroComercio}
              onChange={(e) => setFiltroComercio(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos los comercios</option>
              {comercios.map(comercio => (
                <option key={comercio.iD_Comercio} value={comercio.iD_Comercio}>
                  {comercio.nombre}
                </option>
              ))}
            </select>

            {/* Filtro por calificación */}
            <select
              value={filtroCalificacion}
              onChange={(e) => setFiltroCalificacion(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todas las calificaciones</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 estrellas)</option>
              <option value="4">⭐⭐⭐⭐ (4 estrellas)</option>
              <option value="3">⭐⭐⭐ (3 estrellas)</option>
              <option value="2">⭐⭐ (2 estrellas)</option>
              <option value="1">⭐ (1 estrella)</option>
            </select>

            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por texto o usuario..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista de reseñas */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {reseniasFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No hay reseñas
            </h3>
            <p className="text-gray-600">
              {resenias.length === 0 
                ? 'Aún no has recibido reseñas en tus comercios.'
                : 'No hay reseñas que coincidan con los filtros seleccionados.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reseniasFiltradas.map((resenia) => {
              const calificacion = resenia.calificacion || resenia.puntuacion || 0;
              
              return (
                <div
                  key={resenia.iD_Resenia}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  {/* Header de la reseña */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {resenia.usuario?.nombreUsuario || 'Usuario Anónimo'}
                          </p>
                          <div className="flex items-center gap-2">
                            {renderStars(calificacion)}
                            <span className="text-sm text-gray-500">
                              · {formatearFecha(resenia.fechaCreacion)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Nombre del comercio */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 ml-13">
                        <Store className="w-4 h-4" />
                        <span className="font-semibold">{getNombreComercio(resenia.iD_Comercio)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comentario */}
                  <div className="ml-13 pl-0.5">
                    <p className="text-gray-700 leading-relaxed">
                      {resenia.comentario || 'Sin comentario'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Resultados count */}
        {reseniasFiltradas.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Mostrando {reseniasFiltradas.length} de {resenias.length} reseñas
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default MisResenias;