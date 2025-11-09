// UsuariosAdmin.jsx - Gestión de usuarios por administrador

import { useState, useEffect } from 'react';
import { getAllUsuarios, updateUsuario, deleteUsuario } from '../../services/usuariosService';
import { User, Mail, Shield, Trash2, Loader, Ban, CheckCircle } from 'lucide-react';
import { getRoleDescriptionById } from '../../utils/roleHelper';

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setIsLoading(true);
      const data = await getAllUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEstado = async (usuario) => {
    const nuevoEstado = !usuario.estado;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} al usuario "${usuario.nombreUsuario}"?`)) return;

    try {
      await updateUsuario(usuario.iD_Usuario, { ...usuario, estado: nuevoEstado });
      alert(`Usuario ${accion}do exitosamente`);
      loadUsuarios();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      alert('Error al actualizar el usuario');
    }
  };

  const handleDelete = async (usuario) => {
    if (!confirm(`¿ELIMINAR permanentemente a "${usuario.nombreUsuario}"? Esta acción no se puede deshacer.`)) return;

    try {
      await deleteUsuario(usuario.iD_Usuario);
      alert('Usuario eliminado');
      loadUsuarios();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error al eliminar el usuario');
    }
  };

  const filteredUsuarios = usuarios.filter(u => {
    if (filter === 'all') return true;
    if (filter === 'active') return u.estado === true;
    if (filter === 'inactive') return u.estado === false;
    return u.iD_RolUsuario === parseInt(filter);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Usuarios
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === 'inactive' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Inactivos
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rol</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsuarios.map((usuario) => (
              <tr key={usuario.iD_Usuario} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-800">{usuario.nombreUsuario}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{usuario.correo}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                    {getRoleDescriptionById(usuario.iD_RolUsuario)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      usuario.estado
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {usuario.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleToggleEstado(usuario)}
                      className={`p-2 rounded hover:bg-opacity-80 transition ${
                        usuario.estado
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                      title={usuario.estado ? 'Desactivar' : 'Activar'}
                    >
                      {usuario.estado ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(usuario)}
                      className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsuarios.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay usuarios para mostrar
        </div>
      )}
    </div>
  );
};

export default UsuariosAdmin;
