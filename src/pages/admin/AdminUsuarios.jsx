// AdminUsuarios.jsx - Gestión de usuarios para admin
// Ruta: src/pages/admin/AdminUsuarios.jsx
// Fase 8: Panel de Administración

import { useState, useEffect } from 'react';
import { 
  Users, ArrowLeft, Search, Shield, Store as StoreIcon, 
  User, Trash2, Edit, Mail, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Shared/Header';
import { getAllUsuarios, updateUsuario, deleteUsuario } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

const AdminUsuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({ iD_RolUsuario: 1 });

  useEffect(() => {
    loadUsuarios();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [usuarios, searchTerm, filterRole]);

  const loadUsuarios = async () => {
    try {
      const data = await getAllUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...usuarios];

    if (filterRole !== 'todos') {
      const roleId = parseInt(filterRole);
      filtered = filtered.filter(u => u.iD_RolUsuario === roleId);
    }

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.nombreUsuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.correo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsuarios(filtered);
  };

  const getRoleBadge = (rolId) => {
    const roles = {
      1: { label: 'Usuario', color: 'bg-blue-100 text-blue-800', icon: <User className="w-3 h-3" /> },
      2: { label: 'Admin', color: 'bg-purple-100 text-purple-800', icon: <Shield className="w-3 h-3" /> },
      3: { label: 'Comercio', color: 'bg-green-100 text-green-800', icon: <StoreIcon className="w-3 h-3" /> },
    };
    const role = roles[rolId] || roles[1];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${role.color}`}>
        {role.icon}
        {role.label}
      </span>
    );
  };

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
      await updateUsuario(selectedUser.iD_Usuario, updatedUser);
      alert('✅ Usuario actualizado');
      setShowEditModal(false);
      loadUsuarios();
    } catch (error) {
      alert('Error al actualizar');
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`¿Eliminar al usuario "${user.nombreUsuario}"? Esta acción no se puede deshacer.`)) return;
    
    try {
      await deleteUsuario(user.iD_Usuario);
      alert('Usuario eliminado');
      loadUsuarios();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const counts = {
    todos: usuarios.length,
    1: usuarios.filter(u => u.iD_RolUsuario === 1).length,
    2: usuarios.filter(u => u.iD_RolUsuario === 2).length,
    3: usuarios.filter(u => u.iD_RolUsuario === 3).length,
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
              <Users className="w-7 h-7 text-primary" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600">Ver y administrar usuarios del sistema</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterRole('todos')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterRole === 'todos' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Todos ({counts.todos})
              </button>
              <button
                onClick={() => setFilterRole('1')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterRole === '1' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Usuarios ({counts[1]})
              </button>
              <button
                onClick={() => setFilterRole('3')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterRole === '3' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Comercios ({counts[3]})
              </button>
              <button
                onClick={() => setFilterRole('2')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterRole === '2' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Admins ({counts[2]})
              </button>
            </div>
            <div className="flex-1 relative">
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

        {/* Lista */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Registro</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map(user => (
                    <tr key={user.iD_Usuario} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {user.nombreUsuario?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{user.nombreUsuario}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {user.correo}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getRoleBadge(user.iD_RolUsuario)}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {user.fechaCreacion ? formatDate(user.fechaCreacion) : 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Editar rol"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Editar Usuario</h3>
            <p className="text-sm text-gray-600 mb-4">
              Usuario: <strong>{selectedUser.nombreUsuario}</strong>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rol del Usuario
              </label>
              <select
                value={editData.iD_RolUsuario}
                onChange={(e) => setEditData({ iD_RolUsuario: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="1">Usuario Normal</option>
                <option value="3">Usuario Comercio</option>
                <option value="2">Administrador</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
