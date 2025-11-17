// AdminResenias.jsx - Moderación de reseñas para admin
// Ruta: src/pages/admin/AdminResenias.jsx
// Fase 8: Panel de Administración

import { useState, useEffect } from 'react';
import { 
  Star, ArrowLeft, Search, Trash2, AlertTriangle, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Shared/Header';
import { getAllResenias, deleteResenia } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

const AdminResenias = () => {
  const navigate = useNavigate();
  const [resenias, setResenias] = useState([]);
  const [filteredResenias, setFilteredResenias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('todas');

  useEffect(() => {
    loadResenias();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [resenias, searchTerm, filterRating]);

  const loadResenias = async () => {
    try {
      const data = await getAllResenias();
      // Ordenar por fecha más reciente
      const sorted = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setResenias(sorted);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...resenias];

    if (filterRating !== 'todas') {
      if (filterRating === 'bajas') {
        filtered = filtered.filter(r => r.puntuacion <= 2);
      } else if (filterRating === 'medias') {
        filtered = filtered.filter(r => r.puntuacion === 3);
      } else if (filterRating === 'altas') {
        filtered = filtered.filter(r => r.puntuacion >= 4);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.comentario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.comercio?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.usuario?.nombreUsuario?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredResenias(filtered);
  };

  const handleDelete = async (resenia) => {
    if (!confirm('¿Eliminar esta reseña? Esta acción no se puede deshacer.')) return;
    
    try {
      await deleteResenia(resenia.iD_Resenia);
      alert('Reseña eliminada');
      loadResenias();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const getRatingColor = (rating) => {
    if (rating <= 2) return 'bg-red-100 text-red-800';
    if (rating === 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const counts = {
    todas: resenias.length,
    bajas: resenias.filter(r => r.puntuacion <= 2).length,
    medias: resenias.filter(r => r.puntuacion === 3).length,
    altas: resenias.filter(r => r.puntuacion >= 4).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-7 h-7 text-primary" />
              Moderación de Reseñas
            </h1>
            <p className="text-gray-600">Revisa y modera las reseñas de usuarios</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterRating('todas')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterRating === 'todas' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Todas ({counts.todas})
              </button>
              <button
                onClick={() => setFilterRating('bajas')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterRating === 'bajas' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                ⭐ 1-2 ({counts.bajas})
              </button>
              <button
                onClick={() => setFilterRating('medias')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterRating === 'medias' ? 'bg-yellow-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                ⭐⭐⭐ ({counts.medias})
              </button>
              <button
                onClick={() => setFilterRating('altas')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterRating === 'altas' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                ⭐⭐⭐⭐+ ({counts.altas})
              </button>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por comentario, comercio o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Aviso */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Moderación responsable</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Solo elimina reseñas que contengan contenido inapropiado, spam o información falsa.
          </p>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredResenias.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron reseñas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResenias.map(resenia => (
              <div key={resenia.iD_Resenia} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Header de la reseña */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {resenia.usuario?.nombreUsuario?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {resenia.usuario?.nombreUsuario || 'Usuario'}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {resenia.iD_Usuario}
                          </p>
                        </div>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div>
                        <p className="font-semibold text-primary">
                          {resenia.comercio?.nombre || 'Comercio'}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {resenia.iD_Comercio}
                        </p>
                      </div>
                    </div>

                    {/* Rating y fecha */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(resenia.puntuacion)}`}>
                        {resenia.puntuacion}/5
                      </div>
                      {renderStars(resenia.puntuacion)}
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {resenia.fecha ? formatDate(resenia.fecha) : 'Sin fecha'}
                      </span>
                    </div>

                    {/* Comentario */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">
                        {resenia.comentario || <em className="text-gray-400">Sin comentario</em>}
                      </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="ml-4">
                    <button
                      onClick={() => handleDelete(resenia)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResenias;
