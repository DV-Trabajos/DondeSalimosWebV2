// AdminUsuarios.jsx - Gestión de usuarios con opción de desactivar
// Ruta: src/pages/admin/AdminUsuarios.jsx
// ACTUALIZADO: Agregada funcionalidad de desactivar usuarios

import { useState, useEffect } from 'react';
import { 
  Users, ArrowLeft, Search, Shield, Store as StoreIcon, 
  User, Trash2, Edit, Mail, Calendar, Ban, CheckCircle, 
  AlertCircle, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/Shared/Header';
import { formatDate } from '../../utils/formatters';
import { ROLE_DESCRIPTIONS } from '../../utils/constants';
import {
  getAllUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  desactivarUsuario, // ⭐ NUEVO
} from '../../services/usuariosService';

const AdminUsuarios = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  
  // Modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({ iD_RolUsuario: 1 });
  
  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    porRol: {},
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [usuarios, searchTerm, filterRole, filterEstado]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getAllUsuarios();
      setUsuarios(data);
      calcularStats(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const calcularStats = (data) => {
    const total = data.length;
    const activos = data.filter(u => u.estado === true).length;
    const inactivos = data.filter(u => u.estado === false).length;
    
    const porRol = data.reduce((acc, u) => {
      const rolId = u.iD_RolUsuario;
      acc[rolId] = (acc[rolId] || 0) + 1;
      return acc;
    }, {});

    setStats({ total, activos, inactivos, porRol });
  };

  const applyFilters = () => {
    let filtered = [...usuarios];

    // Filtro por rol
    if (filterRole !== 'todos') {
      const roleId = parseInt(filterRole);
      filtered = filtered.filter(u => u.iD_RolUsuario === roleId);
    }

    // Filtro por estado
    if (filterEstado === 'activos') {
      filtered = filtered.filter(u => u.estado === true);
    } else if (filterEstado === 'inactivos') {
      filtered = filtered.filter(u => u.estado === false);
    }

    // Búsqueda por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.nombreUsuario?.toLowerCase().includes(term) ||
        u.correo?.toLowerCase().includes(term)
      );
    }

    setFilteredUsuarios(filtered);
  };

  // ============================================
  // ACCIONES DE USUARIOS
  // ============================================

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditData({ iD_RolUsuario: user.iD_RolUsuario });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedUser = {
        ...selectedUser,
        iD_RolUsuario: parseInt(editData.iD_RolUsuario),
      };
      
      await actualizarUsuario(selectedUser.iD_Usuario, updatedUser);
      alert('✅ Usuario actualizado correctamente');
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsuarios();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      alert('❌ Error al actualizar usuario');
    }
  };

  /**
   * ⭐ NUEVA FUNCIÓN: Desactivar usuario
   * Cambia el estado a false sin eliminar el usuario
   */
  const handleDesactivar = async (usuario) => {
    // Validaciones
    if (usuario.iD_Usuario === currentUser?.iD_Usuario) {
      alert('⚠️ No puedes desactivar tu propia cuenta');
      return;
    }

    if (usuario.estado === false) {
      alert('ℹ️ Este usuario ya está desactivado');
      return;
    }

    const confirmMsg = `¿Desactivar al usuario "${usuario.nombreUsuario}"?\n\n` +
                      `El usuario NO será eliminado, pero:\n` +
                      `• No podrá iniciar sesión\n` +
                      `• Sus datos se mantendrán en el sistema\n` +
                      `• Puedes reactivarlo más tarde actualizando su estado`;

    if (!confirm(confirmMsg)) return;

    try {
      await desactivarUsuario(usuario.iD_Usuario);
      alert('✅ Usuario desactivado correctamente');
      loadUsuarios();
    } catch (error) {
      console.error('Error desactivando usuario:', error);
      alert('❌ Error al desactivar usuario: ' + (error.response?.data?.message || error.message));
    }
  };

  /**
   * Reactivar usuario (cambiar estado a true mediante actualización)
   */
  const handleReactivar = async (usuario) => {
    const confirmMsg = `¿Reactivar al usuario "${usuario.nombreUsuario}"?\n\n` +
                      `El usuario podrá volver a iniciar sesión`;

    if (!confirm(confirmMsg)) return;

    try {
      const updatedUser = { ...usuario, estado: true };
      await actualizarUsuario(usuario.iD_Usuario, updatedUser);
      alert('✅ Usuario reactivado correctamente');
      loadUsuarios();
    } catch (error) {
      console.error('Error reactivando usuario:', error);
      alert('❌ Error al reactivar usuario');
    }
  };

  /**
   * Eliminar permanentemente un usuario
   */
  const handleDelete = async (usuario) => {
    // Validaciones
    if (usuario.iD_Usuario === currentUser?.iD_Usuario) {
      alert('⚠️ No puedes eliminar tu propia cuenta');
      return;
    }

    const confirmMsg = `⚠️ ¿ELIMINAR PERMANENTEMENTE a "${usuario.nombreUsuario}"?\n\n` +
                      `ESTA ACCIÓN NO SE PUEDE DESHACER.\n\n` +
                      `Se eliminarán:\n` +
                      `• El usuario de Firebase\n` +
                      `• El usuario de la base de datos\n` +
                      `• Todas sus reseñas\n` +
                      `• Todas sus reservas\n` +
                      `• Todos sus comercios (si tiene)\n` +
                      `• Todas las publicidades de sus comercios\n\n` +
                      `💡 Recomendación: Si solo quieres impedir que inicie sesión,\n` +
                      `es mejor usar "Desactivar" en lugar de eliminar.`;

    if (!confirm(confirmMsg)) return;

    // Segunda confirmación para acción crítica
    const segundaConfirmacion = prompt(
      `Para confirmar la eliminación permanente, escribe el nombre del usuario: "${usuario.nombreUsuario}"`
    );

    if (segundaConfirmacion !== usuario.nombreUsuario) {
      alert('❌ Eliminación cancelada: El nombre no coincide');
      return;
    }

    try {
      await eliminarUsuario(usuario.iD_Usuario);
      alert('✅ Usuario eliminado permanentemente');
      loadUsuarios();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('❌ Error al eliminar usuario: ' + (error.response?.data?.message || error.message));
    }
  };

  // ============================================
  // UTILIDADES DE RENDERIZADO
  // ============================================

  const getRoleBadge = (rolId) => {
    const roles = {
      16: { 
        label: 'Usuario', 
        color: 'bg-blue-100 text-blue-800', 
        icon: <User className="w-3 h-3" /> 
      },
      2: { 
        label: 'Admin', 
        color: 'bg-purple-100 text-purple-800', 
        icon: <Shield className="w-3 h-3" /> 
      },
      3: { 
        label: 'Comercio', 
        color: 'bg-green-100 text-green-800', 
        icon: <StoreIcon className="w-3 h-3" /> 
      },
    };
    const role = roles[rolId] || roles[16];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${role.color}`}>
        {role.icon}
        {role.label}
      </span>
    );
  };

  const getEstadoBadge = (estado) => {
    if (estado) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Activo
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1">
        <Ban className="w-3 h-3" />
        Inactivo
      </span>
    );
  };

  // ============================================
  // RENDERIZADO
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  const counts = {
    todos: usuarios.length,
    16: usuarios.filter(u => u.iD_RolUsuario === 16).length,
    2: usuarios.filter(u => u.iD_RolUsuario === 2).length,
    3: usuarios.filter(u => u.iD_RolUsuario === 3).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/admin')} 
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600">
              {stats.total} usuarios • {stats.activos} activos • {stats.inactivos} inactivos
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="space-y-4">
            {/* Filtros por rol */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Filtrar por Rol:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterRole('todos')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filterRole === 'todos' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Todos ({counts.todos})
                </button>
                <button
                  onClick={() => setFilterRole('16')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filterRole === '16' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Usuarios ({counts[16]})
                </button>
                <button
                  onClick={() => setFilterRole('3')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filterRole === '3' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Comercios ({counts[3]})
                </button>
                <button
                  onClick={() => setFilterRole('2')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filterRole === '2' ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Admins ({counts[2]})
                </button>
              </div>
            </div>

            {/* Filtros por estado */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Filtrar por Estado:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterEstado('todos')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filterEstado === 'todos' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterEstado('activos')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filterEstado === 'activos' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Activos ({stats.activos})
                </button>
                <button
                  onClick={() => setFilterEstado('inactivos')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filterEstado === 'inactivos' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Inactivos ({stats.inactivos})
                </button>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        {filteredUsuarios.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron usuarios con los filtros aplicados</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Fecha Creación
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsuarios.map(usuario => (
                    <tr key={usuario.iD_Usuario} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {usuario.nombreUsuario}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {usuario.correo}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(usuario.iD_RolUsuario)}
                      </td>
                      <td className="px-6 py-4">
                        {getEstadoBadge(usuario.estado)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(usuario.fechaCreacion)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Botón Editar */}
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Editar rol"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Botón Desactivar/Reactivar */}
                          {usuario.estado ? (
                            <button
                              onClick={() => handleDesactivar(usuario)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                              title="Desactivar usuario"
                              disabled={usuario.iD_Usuario === currentUser?.iD_Usuario}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivar(usuario)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Reactivar usuario"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Botón Eliminar */}
                          <button
                            onClick={() => handleDelete(usuario)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar permanentemente"
                            disabled={usuario.iD_Usuario === currentUser?.iD_Usuario}
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
          </div>
        )}

        {/* Modal de Edición */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Editar Usuario
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Usuario:
                  </label>
                  <p className="text-gray-900">{selectedUser.nombreUsuario}</p>
                  <p className="text-sm text-gray-600">{selectedUser.correo}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cambiar Rol:
                  </label>
                  <select
                    value={editData.iD_RolUsuario}
                    onChange={(e) => setEditData({ iD_RolUsuario: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value={16}>Usuario Común</option>
                    <option value={3}>Usuario Comercio</option>
                    <option value={2}>Administrador</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">💡 Diferencia entre Desactivar y Eliminar:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li><strong>Desactivar:</strong> El usuario no puede iniciar sesión pero sus datos se mantienen. Puede reactivarse más tarde.</li>
                <li><strong>Eliminar:</strong> Se borra permanentemente el usuario y TODOS sus datos (comercios, reservas, reseñas). No se puede deshacer.</li>
              </ul>
              <p className="mt-2">
                <strong>Recomendación:</strong> Usa "Desactivar" para suspender temporalmente un usuario. Solo usa "Eliminar" si estás seguro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsuarios;