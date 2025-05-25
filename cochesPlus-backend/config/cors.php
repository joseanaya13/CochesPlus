<?php
// config/cors.php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'broadcasting/auth',
        'api/broadcasting/auth'
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://josefa25.iesmontenaranco.com',
        // Agregar dominio para Pusher si es necesario
        'https://ws-eu.pusher.com',
    ],

    'allowed_origins_patterns' => [
        // Permitir subdominios de pusher
        '/^https:\/\/.*\.pusher\.com$/',
        '/^https:\/\/.*\.pusherapp\.com$/',
    ],

    'allowed_headers' => [
        '*',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Requested-With',
        'X-Socket-Id',
        'X-CSRF-TOKEN',
        'X-Pusher-Key'
    ],

    'exposed_headers' => [],

    'max_age' => 86400, // 24 horas

    'supports_credentials' => true,
];
