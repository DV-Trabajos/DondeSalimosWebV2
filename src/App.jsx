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
import ReservasMisReservas from './pages/ReservasMisReservas';
import ReservasComercio from './pages/ReservasComercio';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

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

              {/* Nueva: Mis Reservas (Usuario Normal) */}
              <Route 
                path="/mis-reservas" 
                element={
                  <ProtectedRoute>
                    <ReservasMisReservas />
                  </ProtectedRoute>
                } 
              />

              {/* Nueva: Reservas del Comercio (Dueño) */}
              <Route 
                path="/reservas-comercio" 
                element={
                  <ProtectedRoute>
                    <ReservasComercio />
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