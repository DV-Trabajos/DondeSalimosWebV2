// Header.jsx - Componente de navegación superior
// Versión actualizada con "Mis Reseñas" en el menú

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Beer, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  Calendar,
  Store,
  Shield,
  MessageSquare
} from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, isBarOwner, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { label: 'Inicio', path: '/', icon: Home, show: true },
    { label: 'Mis Reservas', path: '/reservations', icon: Calendar, show: isAuthenticated },
    { label: 'Mis Comercios', path: '/bar-management', icon: Store, show: isBarOwner },
    { label: 'Mis Reseñas', path: '/mis-resenias', icon: MessageSquare, show: isBarOwner },
    { label: 'Admin Panel', path: '/admin', icon: Shield, show: isAdmin },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Beer className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-primary hidden sm:block">
              Donde Salimos
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.filter(item => item.show).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2 text-gray-700 hover:text-primary transition font-medium"
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu / Login Button */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-700 hover:text-primary transition"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">{user?.nombreUsuario}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-primary transition"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-3">
              {menuItems.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    <User className="w-5 h-5" />
                    Mi Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mx-4 bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold text-center"
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

export default Header;