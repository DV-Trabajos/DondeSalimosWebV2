// Header.jsx - Header con navegación completa y notificaciones
// Ruta: src/components/Shared/Header.jsx
// ✅ PARTE 2: Versión mejorada con navegación unificada de reservas

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Calendar, User, LogOut, Menu, X, Store, 
  Megaphone, LayoutDashboard, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import NotificationPanel from '../Notifications/NotificationPanel';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Determinar el rol del usuario
  const isAdmin = user?.iD_RolUsuario === 2;
  const isComercio = user?.iD_RolUsuario === 3;

  // Obtener nombre para mostrar
  const displayName = user?.nombreUsuario || user?.nombre || 'Usuario';
  const initials = displayName.charAt(0).toUpperCase();

  // ✅ NUEVO: Función para navegar a "Reservas Recibidas"
  const handleReservasRecibidasClick = (e) => {
    e.preventDefault();
    navigate('/mis-reservas', { 
      state: { activeTab: 'reservas-recibidas' } 
    });
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Donde Salimos</span>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Inicio - Todos */}
            <NavLink to="/" active={isActive('/')} icon={<Home className="w-4 h-4" />}>
              Inicio
            </NavLink>

            {isAuthenticated && (
              <>
                {/* Mis Reservas - Todos los autenticados */}
                <NavLink 
                  to="/mis-reservas" 
                  active={isActive('/mis-reservas')} 
                  icon={<Calendar className="w-4 h-4" />}
                >
                  Mis Reservas
                </NavLink>

                {/* Opciones de Comercio */}
                {(isComercio || isAdmin) && (
                  <>
                    <NavLink 
                      to="/mis-comercios" 
                      active={isActive('/mis-comercios')} 
                      icon={<Store className="w-4 h-4" />}
                    >
                      Mis Comercios
                    </NavLink>

                    {/* ✅ NUEVO: Link directo a Reservas Recibidas */}
                    <NavLink 
                      to="/mis-reservas"
                      active={isActive('/mis-reservas')} 
                      icon={<Calendar className="w-4 h-4" />}
                      onClick={handleReservasRecibidasClick}
                    >
                      Reservas Recibidas
                    </NavLink>

                    <NavLink 
                      to="/mis-publicidades" 
                      active={isActive('/mis-publicidades')} 
                      icon={<Megaphone className="w-4 h-4" />}
                    >
                      Publicidades
                    </NavLink>
                  </>
                )}

                {/* Panel Admin */}
                {isAdmin && (
                  <NavLink 
                    to="/admin" 
                    active={location.pathname.startsWith('/admin')} 
                    icon={<LayoutDashboard className="w-4 h-4" />}
                    highlight
                  >
                    Admin
                  </NavLink>
                )}
              </>
            )}
          </nav>

          {/* Usuario / Login / Notificaciones */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* 🔔 CAMPANITA DE NOTIFICACIONES */}
                <NotificationPanel />

                {/* Menú de usuario */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{initials}</span>
                    </div>
                    <span className="font-medium text-gray-700">{displayName}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                        <p className="text-xs text-gray-500">{user?.correo}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
                          {isAdmin ? 'Administrador' : isComercio ? 'Comercio' : 'Usuario'}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <User className="w-4 h-4" />
                        Mi Perfil
                      </Link>

                      {/* Opciones adicionales de comercio en dropdown */}
                      {(isComercio || isAdmin) && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Gestión</p>
                          <Link
                            to="/mis-comercios"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                          >
                            <Store className="w-4 h-4" />
                            Mis Comercios
                          </Link>
                          <Link
                            to="/mis-publicidades"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                          >
                            <Megaphone className="w-4 h-4" />
                            Publicidades
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 transition"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Panel de Admin
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú Móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="space-y-2">
              <MobileNavLink to="/" icon={<Home className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                Inicio
              </MobileNavLink>

              {isAuthenticated && (
                <>
                  <MobileNavLink to="/profile" icon={<User className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                    Mi Perfil
                  </MobileNavLink>
                  <MobileNavLink to="/mis-reservas" icon={<Calendar className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                    Mis Reservas
                  </MobileNavLink>

                  {(isComercio || isAdmin) && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      <p className="px-4 text-xs font-semibold text-gray-500 uppercase">Comercio</p>
                      <MobileNavLink to="/mis-comercios" icon={<Store className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                        Mis Comercios
                      </MobileNavLink>

                      {/* ✅ NUEVO: Link móvil a Reservas Recibidas */}
                      <MobileNavLink 
                        to="/mis-reservas" 
                        icon={<Calendar className="w-5 h-5" />} 
                        onClick={handleReservasRecibidasClick}
                      >
                        Reservas Recibidas
                      </MobileNavLink>

                      <MobileNavLink to="/mis-publicidades" icon={<Megaphone className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                        Publicidades
                      </MobileNavLink>
                    </>
                  )}

                  {isAdmin && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      <p className="px-4 text-xs font-semibold text-gray-500 uppercase">Administración</p>
                      <MobileNavLink to="/admin" icon={<LayoutDashboard className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                        Panel Admin
                      </MobileNavLink>
                    </>
                  )}

                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-primary text-white text-center px-4 py-3 rounded-lg font-semibold mx-4"
                >
                  Iniciar Sesión
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// ✅ MEJORADO: Componente de enlace de navegación desktop con soporte para onClick
const NavLink = ({ to, active, icon, children, highlight, onClick }) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
          active
            ? highlight
              ? 'bg-purple-100 text-purple-700'
              : 'bg-primary/10 text-primary'
            : highlight
            ? 'text-purple-600 hover:bg-purple-50'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {icon}
        {children}
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
        active
          ? highlight
            ? 'bg-purple-100 text-purple-700'
            : 'bg-primary/10 text-primary'
          : highlight
          ? 'text-purple-600 hover:bg-purple-50'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
};

// ✅ MEJORADO: Componente de enlace móvil con soporte para onClick
const MobileNavLink = ({ to, icon, children, onClick }) => {
  if (onClick && onClick.toString().includes('handleReservasRecibidasClick')) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg w-full text-left"
      >
        {icon}
        {children}
      </button>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
    >
      {icon}
      {children}
    </Link>
  );
};

export default Header;
