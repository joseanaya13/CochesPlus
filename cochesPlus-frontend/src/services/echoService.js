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

    return new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'eu',
        forceTLS: true,
        encrypted: true,
        enabledTransports: ['ws', 'wss'],
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        },
        authEndpoint: import.meta.env.PROD
            ? 'https://josefa25.iesmontenaranco.com:8000/api/broadcasting/auth'
            : 'http://localhost:8000/api/broadcasting/auth',
    });
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