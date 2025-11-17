// App.jsx - Configuración completa de rutas
// Ruta: src/App.jsx
// Incluye todas las rutas de Fases 1-8

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { useAuth } from './hooks/useAuth';

// Páginas públicas
import Login from './pages/Login';
import Home from './pages/Home';

// Páginas de usuario autenticado
import Profile from './pages/Profile';
import MisReservas from './pages/MisReservas';

// Páginas de dueño de comercio (rol 3)
import BarManagement from './pages/BarManagement';
import ReservasRecibidas from './pages/ReservasRecibidas';
import MisPublicidades from './pages/MisPublicidades';

// Páginas de administrador (rol 2)
import AdminPanel from './pages/AdminPanel';
import AdminComercios from './pages/admin/AdminComercios';
import AdminPublicidades from './pages/admin/AdminPublicidades';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminResenias from './pages/admin/AdminResenias';

// ============================================
// COMPONENTES DE PROTECCIÓN DE RUTAS
// ============================================

/**
 * Ruta protegida - requiere autenticación
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

/**
 * Ruta para dueños de comercio (rol 3)
 */
const ComercioRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Rol 3 = Usuario Comercio, Rol 2 = Admin (también puede acceder)
  if (user?.iD_RolUsuario !== 3 && user?.iD_RolUsuario !== 2) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

/**
 * Ruta para administradores (rol 2)
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.iD_RolUsuario !== 2) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

/**
 * Ruta pública - redirige si ya está autenticado
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// ============================================
// APP PRINCIPAL
// ============================================

const AppRoutes = () => {
  return (
    <Routes>
      {/* ========== RUTAS PÚBLICAS ========== */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Home - accesible para todos pero con auth opcional */}
      <Route path="/" element={<Home />} />
      
      {/* ========== RUTAS DE USUARIO AUTENTICADO ========== */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/mis-reservas" 
        element={
          <ProtectedRoute>
            <MisReservas />
          </ProtectedRoute>
        } 
      />
      
      {/* ========== RUTAS DE DUEÑO DE COMERCIO ========== */}
      <Route 
        path="/mis-comercios" 
        element={
          <ComercioRoute>
            <BarManagement />
          </ComercioRoute>
        } 
      />
      
      <Route 
        path="/reservas-recibidas" 
        element={
          <ComercioRoute>
            <ReservasRecibidas />
          </ComercioRoute>
        } 
      />
      
      <Route 
        path="/reservas-recibidas/:comercioId" 
        element={
          <ComercioRoute>
            <ReservasRecibidas />
          </ComercioRoute>
        } 
      />
      
      <Route 
        path="/mis-publicidades" 
        element={
          <ComercioRoute>
            <MisPublicidades />
          </ComercioRoute>
        } 
      />
      
      {/* ========== RUTAS DE ADMINISTRADOR ========== */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/comercios" 
        element={
          <AdminRoute>
            <AdminComercios />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/publicidades" 
        element={
          <AdminRoute>
            <AdminPublicidades />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/usuarios" 
        element={
          <AdminRoute>
            <AdminUsuarios />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/resenias" 
        element={
          <AdminRoute>
            <AdminResenias />
          </AdminRoute>
        } 
      />
      
      {/* ========== RUTA 404 ========== */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-6">Página no encontrada</p>
              <a 
                href="/" 
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <LocationProvider>
          <AppRoutes />
        </LocationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
