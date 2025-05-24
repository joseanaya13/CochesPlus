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

    console.log('Creating Echo instance with token:', token.substring(0, 20) + '...');

    try {
        const echoConfig = {
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
                    'Content-Type': 'application/json',
                },
            },
            authEndpoint: import.meta.env.PROD
                ? 'https://josefa25.iesmontenaranco.com:8000/api/broadcasting/auth'
                : 'http://localhost:8000/api/broadcasting/auth',
        };

        console.log('Echo config:', {
            ...echoConfig,
            auth: { ...echoConfig.auth, headers: { ...echoConfig.auth.headers, Authorization: 'Bearer [REDACTED]' } }
        });

        const echo = new Echo(echoConfig);

        // Configurar manejadores de eventos de conexión
        if (window.Pusher && echo.connector && echo.connector.pusher) {
            echo.connector.pusher.connection.bind('connected', () => {
                console.log('Pusher connected successfully');
            });

            echo.connector.pusher.connection.bind('disconnected', () => {
                console.log('Pusher disconnected');
            });

            echo.connector.pusher.connection.bind('error', (error) => {
                console.error('Pusher connection error:', error);
            });

            echo.connector.pusher.connection.bind('failed', (error) => {
                console.error('Pusher connection failed:', error);
            });
        }

        return echo;
    } catch (error) {
        console.error('Error creating Echo instance:', error);
        return null;
    }
};

// Función para obtener la instancia de Echo
export const getEcho = () => {
    if (!echoInstance) {
        echoInstance = createEchoInstance();
        if (echoInstance) {
            console.log('Echo instance created successfully');
        } else {
            console.warn('Failed to create Echo instance');
        }
    }
    return echoInstance;
};

// Función para reconectar Echo (útil después del login)
export const reconnectEcho = () => {
    if (echoInstance) {
        echoInstance.disconnect();
    }
    echoInstance = createEchoInstance();
    return echoInstance;
};

// Función para desconectar Echo
export const disconnectEcho = () => {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
};

// Métodos de conveniencia
export const privateChannel = (channel) => getEcho()?.private(channel);
export const leaveChannel = (channel) => getEcho()?.leave(channel);
export const publicChannel = (channel) => getEcho()?.channel(channel);

// Export por defecto como objeto (para compatibilidad si alguien lo necesita)
const echoService = {
    getEcho,
    reconnectEcho,
    disconnectEcho,
    privateChannel,
    leaveChannel,
    publicChannel,
};

export default echoService;