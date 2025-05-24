import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileForm from '../../components/profile/ProfileForm';
import PasswordForm from '../../components/profile/PasswordForm';
import profileService from '../../services/profileService';
import authService from '../../services/authService';
import Layout from '../../components/layout/Layout';
import Alert from '../../components/common/Alert';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }

    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setUserData(data.user);
    } catch (err) {
      console.error('Error al cargar el perfil:', err);
      setError('Error al cargar el perfil. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (data) => {
    try {
      setLoading(true);
      await profileService.updateProfile(data);
      setSuccessMessage('Perfil actualizado correctamente');
      loadUserProfile();
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setError('Error al actualizar el perfil. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (data) => {
    try {
      setLoading(true);
      await profileService.updatePassword(data);
      setSuccessMessage('Contraseña actualizada correctamente');
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      setError('Error al actualizar la contraseña. Por favor, verifica tus datos e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')}
            className="mb-6 animate-fade"
          />
        )}

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6 animate-fade"
          />
        )}

        <div className="bg-secondary-light dark:bg-primary-dark rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-primary-light dark:border-primary-dark">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${activeTab === 'profile'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-text-dark dark:text-text-light'
                  }`}
              >
                Información personal
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${activeTab === 'password'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-text-dark dark:text-text-light'
                  }`}
              >
                Cambiar contraseña
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading && !userData ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="max-w-lg">
                {activeTab === 'profile' && userData && (
                  <ProfileForm
                    userData={userData}
                    onSubmit={handleProfileUpdate}
                    loading={loading}
                  />
                )}

                {activeTab === 'password' && (
                  <PasswordForm
                    onSubmit={handlePasswordChange}
                    loading={loading}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
