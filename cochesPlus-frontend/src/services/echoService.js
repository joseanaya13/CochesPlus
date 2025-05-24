import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configurar Pusher
window.Pusher = Pusher;

// Función para obtener el token de autenticación
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
};

// Configuración de Echo
const echoConfig = {
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'eu',
    forceTLS: true,
    encrypted: true,
    enabledTransports: ['ws', 'wss'],
    auth: {
        headers: {
            Authorization: getAuthToken(),
            Accept: 'application/json',
        },
    },
    authEndpoint: import.meta.env.PROD
        ? 'https://josefa25.iesmontenaranco.com:8000/api/broadcasting/auth'
        : 'http://localhost:8000/api/broadcasting/auth',
    // Configuración adicional para manejo de errores
    enableStats: false,
    enableLogging: import.meta.env.DEV,
};

// Crear instancia de Echo con manejo de errores
let echo;

try {
    echo = new Echo(echoConfig);

    // Manejo de eventos de conexión para debugging
    if (import.meta.env.DEV) {
        // Eventos de Pusher para debugging
        echo.connector.pusher.connection.bind('connected', () => {
            console.log('Echo: Conectado a Pusher');
        });

        echo.connector.pusher.connection.bind('disconnected', () => {
            console.log('Echo: Desconectado de Pusher');
        });

        echo.connector.pusher.connection.bind('error', (error) => {
            console.error('Echo: Error de conexión:', error);
        });

        echo.connector.pusher.connection.bind('failed', () => {
            console.error('Echo: Falló la conexión a Pusher');
        });
    }

    // Función para actualizar el token de autorización
    echo.updateAuthToken = () => {
        const newToken = getAuthToken();
        if (newToken) {
            echo.options.auth.headers.Authorization = newToken;
        }
    };

} catch (error) {
    console.error('Error al inicializar Echo:', error);

    // Crear un objeto mock de Echo para evitar errores en el resto de la aplicación
    echo = {
        private: () => ({
            listen: () => ({}),
            leave: () => ({})
        }),
        leave: () => ({}),
        updateAuthToken: () => ({})
    };
}

// Interceptar cambios en el token de localStorage para actualizar Echo
const originalSetItem = localStorage.setItem;
localStorage.setItem = function (key, value) {
    originalSetItem.apply(this, arguments);

    // Si se actualiza el token, actualizar también en Echo
    if (key === 'token' && echo.updateAuthToken) {
        echo.updateAuthToken();
    }
};

export default echo;