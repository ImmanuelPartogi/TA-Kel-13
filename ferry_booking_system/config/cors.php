<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173', // React Vite dev server
        'http://localhost:5174', // React Vite dev server
        'http://localhost:3000', // Alternative React port
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://192.168.1.8:8000',
        'http://127.0.0.1:8000',
        'http://localhost:63268'
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // Penting untuk authentication
];
