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
        'http://localhost:63268',
        // Tambahkan untuk Flutter web development
        'http://localhost:*',  // Flutter web biasanya menggunakan port random
        'http://127.0.0.1:*',
    ],

    'allowed_origins_patterns' => [
        // Alternatif: gunakan pattern untuk semua localhost ports
        '/^http:\/\/localhost:\d+$/',
        '/^http:\/\/127\.0\.0\.1:\d+$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
