# 🍺 Donde Salimos - Web Application

Aplicación web para descubrir y reservar lugares (bares, restaurantes, eventos) desarrollada con React + Vite.

## 📁 Estructura del Proyecto

```
donde-salimos-web/
├── public/                      # Archivos estáticos
├── src/
│   ├── components/             # Componentes reutilizables
│   │   ├── Home/              # Componentes de la página principal
│   │   │   ├── GoogleMapView.jsx          # Mapa con Google Maps
│   │   │   ├── PlaceCard.jsx              # Tarjeta de comercio
│   │   │   ├── PlaceDetailModal.jsx       # Modal con detalles
│   │   │   ├── SearchBar.jsx              # Barra de búsqueda
│   │   │   └── PlaceList.jsx              # Lista de lugares
│   │   │
│   │   ├── Auth/              # Componentes de autenticación
│   │   │   ├── GoogleLoginButton.jsx     # Botón login Google
│   │   │   ├── ProtectedRoute.jsx        # Rutas protegidas
│   │   │   └── RoleGuard.jsx             # Guard por roles
│   │   │
│   │   ├── Shared/            # Componentes compartidos
│   │   │   ├── Header.jsx                # Encabezado
│   │   │   ├── Footer.jsx                # Pie de página
│   │   │   ├── Loader.jsx                # Spinner de carga
│   │   │   └── Modal.jsx                 # Modal genérico
│   │   │
│   │   └── Admin/             # Componentes de administración
│   │       ├── ComerciosList.jsx         # Lista de comercios
│   │       ├── UsuariosList.jsx          # Lista de usuarios
│   │       └── ReseniasList.jsx          # Lista de reseñas
│   │
│   ├── pages/                  # Páginas principales
│   │   ├── Home.jsx                      # Página principal
│   │   ├── Login.jsx                     # Página de login
│   │   ├── Profile.jsx                   # Perfil de usuario
│   │   ├── BarManagement.jsx             # Gestión de comercios
│   │   ├── AdminPanel.jsx                # Panel de admin
│   │   ├── Reservas.jsx                  # Mis reservas
│   │   └── NotFound.jsx                  # Página 404
│   │
│   ├── context/               # Contextos de React
│   │   ├── AuthContext.jsx               # Autenticación
│   │   └── LocationContext.jsx           # Ubicación del usuario
│   │
│   ├── services/              # Servicios de API
│   │   ├── api.js                        # Cliente Axios configurado
│   │   ├── authService.js                # Auth endpoints
│   │   ├── comerciosService.js           # Comercios endpoints
│   │   ├── usuariosService.js            # Usuarios endpoints
│   │   ├── reservasService.js            # Reservas endpoints
│   │   ├── reseniasService.js            # Reseñas endpoints
│   │   ├── pagosService.js               # Pagos endpoints
│   │   └── googleMapsService.js          # Google Maps API
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.js                    # Hook de autenticación
│   │   ├── useLocation.js                # Hook de ubicación
│   │   └── useDebounce.js                # Hook para debounce
│   │
│   ├── utils/                 # Utilidades
│   │   ├── constants.js                  # Constantes
│   │   ├── roleHelper.js                 # Helper de roles
│   │   ├── cuitValidator.js              # Validador de CUIT
│   │   └── formatters.js                 # Formateadores
│   │
│   ├── App.jsx                # Componente principal
│   ├── main.jsx               # Punto de entrada
│   └── index.css              # Estilos globales
│
├── .env                       # Variables de entorno
├── package.json              # Dependencias
├── vite.config.js            # Configuración de Vite
├── tailwind.config.js        # Configuración de Tailwind
└── README.md                 # Este archivo
```

## 🚀 Tecnologías

- **React 18** - Biblioteca de UI
- **Vite** - Build tool ultra rápido
- **React Router** - Navegación
- **TailwindCSS** - Framework de estilos
- **Axios** - Cliente HTTP
- **@react-oauth/google** - Autenticación con Google
- **Lucide React** - Iconos
- **Google Maps API** - Mapas y ubicación

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Editar .env con tus credenciales

# Iniciar servidor de desarrollo
npm run dev
```

## 🔑 Variables de Entorno

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=tu_client_id_de_google
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
```

## 🎯 Flujo de Autenticación

1. Usuario hace clic en "Iniciar sesión con Google"
2. Google OAuth devuelve un `idToken`
3. Frontend envía `idToken` a `POST /api/usuarios/iniciarSesionConGoogle`
4. Backend valida el token con Firebase
5. Backend retorna: `{ usuario, jwtToken }`
6. Frontend guarda `jwtToken` en localStorage
7. Frontend incluye JWT en header `Authorization: Bearer {token}` en todas las peticiones

## 📱 Roles de Usuario

- **Usuario Común (ID: 1)**: Puede ver lugares y hacer reservas
- **Usuario Comercio (ID: 2)**: Puede gestionar sus comercios
- **Administrador (ID: 3)**: Acceso completo al panel de administración

## 🗂️ Desarrollo por Partes

### Parte 1: Base del Proyecto ✅
- [x] Configuración inicial
- [x] Estructura de carpetas
- [x] TailwindCSS
- [x] Variables de entorno

### Parte 2: Servicios y Context (Siguiente)
- [ ] Configurar Axios con interceptores
- [ ] Crear servicios de API
- [ ] AuthContext
- [ ] LocationContext

### Parte 3: Autenticación
- [ ] GoogleLoginButton
- [ ] Página de Login
- [ ] ProtectedRoute
- [ ] RoleGuard

### Parte 4: Página Principal
- [ ] Header y Footer
- [ ] GoogleMapView
- [ ] SearchBar
- [ ] PlaceCard y PlaceList
- [ ] PlaceDetailModal

### Parte 5: Gestión de Comercios
- [ ] BarManagement
- [ ] Formularios de comercio
- [ ] Subida de imágenes

### Parte 6: Panel de Admin
- [ ] AdminPanel
- [ ] Gestión de comercios
- [ ] Gestión de usuarios
- [ ] Gestión de reseñas

### Parte 7: Reservas y Perfil
- [ ] Sistema de reservas
- [ ] Página de perfil
- [ ] Favoritos

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
```

## 📝 Notas

- El backend debe estar corriendo (configurar URL en .env)
- Necesitas credenciales de Google OAuth para login
- Necesitas API Key de Google Maps para el mapa

---

**Creado con ❤️ para Donde Salimos**
