// cochesPlus-frontend/src/services/echoService.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configurar Pusher
window.Pusher = Pusher;

// Crear instancia de Echo
const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    encrypted: true,
    enabledTransports: ['ws', 'wss'],
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            Accept: 'application/json',
        },
    },
    authEndpoint: import.meta.env.PROD
        ? 'https://josefa25.iesmontenaranco.com:8000/api/broadcasting/auth'
        : 'http://localhost:8000/api/broadcasting/auth',
});

export default echo;