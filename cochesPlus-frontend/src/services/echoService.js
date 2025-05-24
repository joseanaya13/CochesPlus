// cochesPlus-frontend/src/services/echoService.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configurar Pusher
window.Pusher = Pusher;

let echoInstance = null;

const createEchoInstance = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.warn('No hay token disponible para Echo');
        return null;
    }

    // URL base de la API
    const apiUrl = import.meta.env.PROD
        ? 'https://josefa25.iesmontenaranco.com:8000'
        : 'http://localhost:8000';

    const echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'eu',
        forceTLS: true,
        encrypted: true,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${apiUrl}/api/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        },
    });

    // Escuchar eventos de conexión
    echo.connector.pusher.connection.bind('connected', () => {
        console.log('Pusher connected successfully');
    });

    echo.connector.pusher.connection.bind('error', (error) => {
        console.error('Pusher connection error:', error);
    });

    return echo;
};

// Función para obtener la instancia de Echo
const getEcho = () => {
    if (!echoInstance) {
        echoInstance = createEchoInstance();
    }
    return echoInstance;
};

// Función para reconectar Echo (útil después del login)
const reconnectEcho = () => {
    if (echoInstance) {
        echoInstance.disconnect();
    }
    echoInstance = createEchoInstance();
    return echoInstance;
};

// Función para desconectar Echo
const disconnectEcho = () => {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
};

export { getEcho, reconnectEcho, disconnectEcho };
export default {
    getEcho,
    reconnectEcho,
    disconnectEcho,
    // Métodos de conveniencia para mantener compatibilidad
    private: (channel) => getEcho()?.private(channel),
    leave: (channel) => getEcho()?.leave(channel),
    channel: (channel) => getEcho()?.channel(channel),
};