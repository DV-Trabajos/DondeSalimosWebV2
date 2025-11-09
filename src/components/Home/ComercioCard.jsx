// ComercioCard.jsx - Tarjeta de comercio para gestión

import { Edit, Trash2, Eye, Clock, MapPin, Phone } from 'lucide-react';
import { convertBase64ToImage } from '../../utils/formatters';
import { TIPOS_COMERCIO_DESCRIPCION } from '../../utils/constants';

const ComercioCard = ({ comercio, onEdit, onDelete, onView }) => {
  const imageUrl = comercio.foto 
    ? convertBase64ToImage(comercio.foto)
    : 'https://via.placeholder.com/400x200?text=Sin+Imagen';

  const tipoComercio = TIPOS_COMERCIO_DESCRIPCION[comercio.iD_TipoComercio] || 'Otro';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Imagen */}
      <div className="h-48 bg-gray-200 relative">
        <img
          src={imageUrl}
          alt={comercio.nombre}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200?text=Sin+Imagen';
          }}
        />
        
        {/* Badge de estado */}
        <div className="absolute top-2 right-2">
          {comercio.estado === true ? (
            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
              Aprobado
            </span>
          ) : (
            <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-semibold">
              Pendiente
            </span>
          )}
        </div>

        {/* Badge de tipo */}
        <div className="absolute top-2 left-2">
          <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-semibold">
            {tipoComercio}
          </span>
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

          {comercio.telefono && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{comercio.telefono}</span>
            </div>
          )}

          {comercio.horario && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{comercio.horario}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <button
            onClick={() => onView && onView(comercio)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
          >
            <Eye className="w-4 h-4" />
            Ver
          </button>
          <button
            onClick={() => onEdit && onEdit(comercio)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={() => onDelete && onDelete(comercio)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComercioCard;