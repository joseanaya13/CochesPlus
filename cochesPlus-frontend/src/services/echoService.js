const createEchoInstance = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.warn('No hay token disponible para Echo');
        return null;
    }

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
        enableStats: false,
        enableLogging: true,
    };

    console.log('Configurando Echo con:', {
        key: echoConfig.key,
        cluster: echoConfig.cluster,
        authEndpoint: echoConfig.authEndpoint,
        hasToken: !!token
    });

    return new Echo(echoConfig);
};