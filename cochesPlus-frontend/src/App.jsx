import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

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

// Páginas de administración
import VerifyDocuments from './pages/admin/VerifyDocuments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAds from './pages/admin/AdminAds';
import AdminMessages from './pages/admin/AdminMessages';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (!isAuthenticated || !hasRole('admin')) {
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

            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
            {/* <Route path="/reset-password" element={<ResetPassword />} /> */}

            {/* Rutas de perfil */}
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/favoritos" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />

            {/* Rutas de mensajes */}
            <Route path="/mensajes" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

            {/* Rutas de valoraciones */}
            <Route path="/valoraciones" element={<ProtectedRoute><ValoracionesPage /></ProtectedRoute>} />

            {/* Exploración de coches */}
            <Route path="/coches" element={<ExploreCars />} />
            <Route path="/coches/:id" element={<CarDetail />} />

            {/* Páginas informativas */}
            {/* <Route path="/about" element={<About />} /> */}
            {/* <Route path="/contacto" element={<Contact />} /> */}
            {/* <Route path="/faq" element={<FAQ />} /> */}
            <Route path="/privacidad" element={<PrivacyPolicy />} />
            <Route path="/terminos" element={<TermsOfService />} />
            <Route path="/cookies" element={<PrivacyPolicy />} />

            {/* Rutas de administración */}
            <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />

            {/* RF4: Gestionar Usuarios (Administrador) */}
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

            {/* RF8: Gestionar Anuncios (Administrador) */}
            <Route path="/admin/ads" element={<AdminRoute><AdminAds /></AdminRoute>} />

            {/* RF15: Gestionar Mensajes (Administrador) */}
            <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />

            {/* Verificación de documentos (ya existente) */}
            <Route path="/admin/verificar-documentos" element={<AdminRoute><VerifyDocuments /></AdminRoute>} />

            {/* Rutas para vendedores */}
            <Route path="/vendedor/coches" element={<ProtectedRoute><MyCars /></ProtectedRoute>} />
            <Route path="/vendedor/publicar" element={<ProtectedRoute><NewCar /></ProtectedRoute>} />
            <Route path="/vendedor/editar/:id" element={<ProtectedRoute><EditCar /></ProtectedRoute>} />

            {/* Ruta de fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
