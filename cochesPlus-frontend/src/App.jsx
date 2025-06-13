import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

// Importar el componente de protección mejorado
import ProtectedRoute from './components/routes/ProtectedRoute';

// Páginas
import Home from './pages/Home';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
// import ForgotPassword from './pages/auth/ForgotPassword';
// import ResetPassword from './pages/auth/ResetPassword';

import ProfilePage from './pages/profile/ProfilePage'
import Favorites from './pages/buyer/Favorites';

import ExploreCars from './pages/cars/ExploreCars';
import CarDetail from './pages/cars/CarDetail';

import Dashboard from './pages/dashboard/Dashboard';
// import About from './pages/public/About';
// import Contact from './pages/public/Contact';
// import FAQ from './pages/public/FAQ';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsOfService from './pages/public/TermsOfService';
// import UserManagement from './pages/dashboard/UserManagement';
// import CarApprovals from './pages/dashboard/CarApprovals';
import Messages from './pages/messages/Messages';

import EditCar from './pages/seller/EditCar';
import NewCar from './pages/seller/NewCar';
import MyCars from './pages/seller/MyCars';

// Nueva página de valoraciones
import ValoracionesPage from './pages/ratings/ValoracionesPage';
// Nueva página de compras
import ComprasPage from './pages/compras/ComprasPage';

// Páginas de administración
import VerifyDocuments from './pages/admin/VerifyDocuments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAds from './pages/admin/AdminAds';
import AdminMessages from './pages/admin/AdminMessages';

// Componente de carga mejorado
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Verificando permisos...</p>
    </div>
  </div>
);

// Componente para rutas que requieren autenticación básica
const AuthenticatedRoute = ({ children }) => (
  <ProtectedRoute>
    {children}
  </ProtectedRoute>
);

// Componente para rutas que requieren rol de comprador o vendedor
const UserRoute = ({ children }) => (
  <ProtectedRoute
    requiredRole={['comprador', 'vendedor']}
  >
    {children}
  </ProtectedRoute>
);

// Componente para rutas que requieren rol de vendedor
const SellerRoute = ({ children }) => (
  <ProtectedRoute
    requiredRole="vendedor"
    
  >
    {children}
  </ProtectedRoute>
);

// Componente para rutas que requieren rol de administrador
const AdminRoute = ({ children }) => (
  <ProtectedRoute
    requiredRole="admin"
  >
    {children}
  </ProtectedRoute>
);

// Componente para redirigir usuarios autenticados lejos del login/register
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();


  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Página de inicio como ruta principal */}
            <Route path="/" element={<Home />} />

            {/* Rutas públicas - Solo para usuarios no autenticados */}
            <Route path="/login" element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            } />
            <Route path="/register" element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            } />
            {/* <Route path="/forgot-password" element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            } /> */}
            {/* <Route path="/reset-password" element={
              <GuestRoute>
                <ResetPassword />
              </GuestRoute>
            } /> */}

            {/* Rutas de perfil - Requieren autenticación básica */}
            <Route path="/profile" element={
              <AuthenticatedRoute>
                <ProfilePage />
              </AuthenticatedRoute>
            } />

            {/* Rutas que requieren rol de comprador o vendedor */}
            <Route path="/favoritos" element={
              <UserRoute>
                <Favorites />
              </UserRoute>
            } />

            <Route path="/mensajes" element={
              <UserRoute>
                <Messages />
              </UserRoute>
            } />

            <Route path="/valoraciones" element={
              <UserRoute>
                <ValoracionesPage />
              </UserRoute>
            } />

            <Route path="/compras" element={
              <UserRoute>
                <ComprasPage />
              </UserRoute>
            } />

            {/* Exploración de coches - Públicas */}
            <Route path="/coches" element={<ExploreCars />} />
            <Route path="/coches/:id" element={<CarDetail />} />

            {/* Páginas informativas - Públicas */}
            {/* <Route path="/about" element={<About />} /> */}
            {/* <Route path="/contacto" element={<Contact />} /> */}
            {/* <Route path="/faq" element={<FAQ />} /> */}
            <Route path="/privacidad" element={<PrivacyPolicy />} />
            <Route path="/terminos" element={<TermsOfService />} />
            <Route path="/cookies" element={<PrivacyPolicy />} />

            {/* Rutas de administración - Solo para administradores */}
            <Route path="/dashboard" element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } />

            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            } />

            <Route path="/admin/ads" element={
              <AdminRoute>
                <AdminAds />
              </AdminRoute>
            } />

            <Route path="/admin/messages" element={
              <AdminRoute>
                <AdminMessages />
              </AdminRoute>
            } />

            <Route path="/admin/verificar-documentos" element={
              <AdminRoute>
                <VerifyDocuments />
              </AdminRoute>
            } />

            {/* Rutas para vendedores - Solo para usuarios con rol vendedor */}
            <Route path="/vendedor/coches" element={
              <SellerRoute>
                <MyCars />
              </SellerRoute>
            } />

            <Route path="/vendedor/publicar" element={
              <SellerRoute>
                <NewCar />
              </SellerRoute>
            } />

            <Route path="/vendedor/editar/:id" element={
              <SellerRoute>
                <EditCar />
              </SellerRoute>
            } />

            {/* Ruta de fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}