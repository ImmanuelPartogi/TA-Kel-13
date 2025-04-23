<?php

return [
    'server_key' => env('MIDTRANS_SERVER_KEY', 'SB-Mid-server-jv_rZEY1OoQzsxdhc0GVb-uW'),
    'client_key' => env('MIDTRANS_CLIENT_KEY', 'SB-Mid-client-8csuXJ7DmFhqmkMX'),
    'merchant_id' => env('MIDTRANS_MERCHANT_ID', 'G815000693'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'api_url' => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://api.midtrans.com'
        : 'https://api.sandbox.midtrans.com',
    'notification_url' => env('APP_URL', 'http://localhost') . '/api/payments/notification',
    'finish_url' => env('APP_URL', 'http://localhost') . '/payment/finish',
    'expiry_duration' => env('MIDTRANS_EXPIRY_DURATION', 24),
    'is_3ds' => true,
    'is_sanitized' => true,

    // Tambahkan konfigurasi polling
    'polling' => [
        'enabled' => env('MIDTRANS_POLLING_ENABLED', true),
        'interval' => env('MIDTRANS_POLLING_INTERVAL', 5), // dalam menit
        'max_attempts' => env('MIDTRANS_POLLING_MAX_ATTEMPTS', 12), // 1 jam (5 menit x 12)
    ],
];
