// ComercioCard.jsx - Tarjeta de comercio para el dueño

import { Edit, Trash2, Calendar, Eye, MapPin } from 'lucide-react';
import { convertBase64ToImage } from '../../utils/formatters';
import { deleteComercio } from '../../services/comerciosService';
import { TIPOS_COMERCIO_DESCRIPCION } from '../../utils/constants';

const ComercioCard = ({ comercio, onEdit, onReload }) => {
  const imageUrl = comercio.foto 
    ? convertBase64ToImage(comercio.foto)
    : 'https://via.placeholder.com/400x200?text=No+Image';

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este comercio?')) return;

    try {
      await deleteComercio(comercio.iD_Comercio);
      alert('Comercio eliminado exitosamente');
      onReload();
    } catch (error) {
      console.error('Error eliminando comercio:', error);
      alert('Error al eliminar el comercio');
    }
  };

  const getEstadoBadge = () => {
    if (comercio.estado === true) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
          Aprobado
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
          Pendiente
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
      {/* Imagen */}
      <div className="h-48 bg-gray-200 relative">
        <img
          src={imageUrl}
          alt={comercio.nombre}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
          }}
        />
        <div className="absolute top-2 right-2">
          {getEstadoBadge()}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {comercio.nombre}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{comercio.direccion}</span>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-semibold">Tipo:</span>{' '}
            {TIPOS_COMERCIO_DESCRIPCION[comercio.iD_TipoComercio] || 'No especificado'}
          </div>

          {comercio.telefono && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Tel:</span> {comercio.telefono}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComercioCard;
