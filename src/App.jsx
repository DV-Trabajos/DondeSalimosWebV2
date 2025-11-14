import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { GOOGLE_CLIENT_ID } from './utils/constants';

// Components
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AdminGuard, BarOwnerGuard } from './components/Auth/RoleGuard';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import BarManagement from './pages/BarManagement';
import Reservations from './pages/Reservations';
import ReservasComercio from './pages/ReservasComercio';
import MisResenias from './pages/MisResenias';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

// Importar Reservas desde components (con tabs)
import Reservas from './components/Reservations/Reservas';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <LocationProvider>
          <Router>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              {/* Rutas protegidas (requieren autenticación) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Ruta de reservas con tabs */}
              <Route 
                path="/reservas" 
                element={
                  <ProtectedRoute>
                    <Reservas />
                  </ProtectedRoute>
                } 
              />

              {/* Ruta alternativa de reservations */}
              <Route 
                path="/reservations" 
                element={
                  <ProtectedRoute>
                    <Reservations />
                  </ProtectedRoute>
                } 
              />

              {/* Ruta específica para reservas de comercio */}
              <Route 
                path="/reservas-comercio" 
                element={
                  <ProtectedRoute>
                    <BarOwnerGuard>
                      <ReservasComercio />
                    </BarOwnerGuard>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/mis-resenias" 
                element={
                  <ProtectedRoute>
                    <MisResenias />
                  </ProtectedRoute>
                } 
              />

              {/* Rutas de administrador */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminGuard>
                      <AdminPanel />
                    </AdminGuard>
                  </ProtectedRoute>
                }
              />

              {/* Rutas de dueño de comercio */}
              <Route
                path="/bar-management"
                element={
                  <ProtectedRoute>
                    <BarOwnerGuard>
                      <BarManagement />
                    </BarOwnerGuard>
                  </ProtectedRoute>
                }
              />

              {/* Página 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </LocationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
