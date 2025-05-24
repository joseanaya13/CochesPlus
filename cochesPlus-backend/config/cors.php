<?php
// config/cors.php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'broadcasting/auth',
        'api/broadcasting/auth'  // Agregado para asegurar CORS
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://josefa25.iesmontenaranco.com',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        '*',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Requested-With',
        'X-Socket-Id',
        'X-CSRF-TOKEN'
    ],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
