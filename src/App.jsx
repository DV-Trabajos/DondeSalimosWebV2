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
import BarManagement from './pages/BarManagement';
import Profile from './pages/Profile';
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
                      <div className="min-h-screen bg-gray-50 p-8">
                        <div className="max-w-7xl mx-auto">
                          <div className="bg-white rounded-lg shadow-md p-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                              Panel de Administración
                            </h1>
                            <p className="text-gray-600">
                              🚧 Esta página se completará en la Parte 6
                            </p>
                          </div>
                        </div>
                      </div>
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

              {/* Ruta de reservas */}
              <Route
                path="/reservas"
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen bg-gray-50 p-8">
                      <div className="max-w-7xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-8">
                          <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            Mis Reservas
                          </h1>
                          <p className="text-gray-600">
                            🚧 Esta página se completará en la Parte 7
                          </p>
                        </div>
                      </div>
                    </div>
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
