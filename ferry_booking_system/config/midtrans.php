<?php

return [
    'server_key' => env('MIDTRANS_SERVER_KEY', 'SB-Mid-server-jv_rZEY1OoQzsxdhc0GVb-uW'),
    'client_key' => env('MIDTRANS_CLIENT_KEY', 'SB-Mid-client-8csuXJ7DmFhqmkMX'),
    'merchant_id' => env('MIDTRANS_MERCHANT_ID', 'G815000693'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'api_url' => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://api.midtrans.com'
        : 'https://api.sandbox.midtrans.com',

    'snap_url' => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.stg.midtrans.com/snap/snap.js',
        
    'notification_url' => env('APP_MIDTRANS_CALLBACK_URL', env('APP_URL', 'http://localhost') . '/api/payments/notification'),
    'finish_url' => env('APP_URL', 'http://localhost') . '/payment/finish',
    'expiry_duration' => env('MIDTRANS_EXPIRY_DURATION', 5),
    'ewallet_expiry_duration' => env('MIDTRANS_EWALLET_EXPIRY_DURATION', 5),
    'is_3ds' => true,
    'is_sanitized' => true,

    // Metode pembayaran yang didukung
    'supported_payment_methods' => [
        'virtual_account' => ['bca', 'bni', 'bri', 'mandiri', 'permata'],
        'e_wallet' => ['gopay', 'shopeepay'],
        'credit_card' => ['visa', 'mastercard', 'jcb', 'amex'],
        'qris' => ['qris'],
    ],

    // Pengaturan fallback
    'fallback' => [
        'enabled' => env('MIDTRANS_FALLBACK_ENABLED', true),
        'bank_prefix' => [
            'bca' => '91',
            'bni' => '88',
            'bri' => '89',
            'mandiri' => '90',
            'permata' => '93',
        ],
    ],

    // Pengaturan polling
    'polling' => [
        'enabled' => env('MIDTRANS_POLLING_ENABLED', true),
        'interval' => env('MIDTRANS_POLLING_INTERVAL', 5), // dalam menit
        'max_attempts' => env('MIDTRANS_POLLING_MAX_ATTEMPTS', 12), // 1 jam (5 menit x 12)
    ],

    // Pengaturan retries
    'retries' => [
        'max_retries' => env('MIDTRANS_MAX_RETRIES', 3),
        'retry_delay' => env('MIDTRANS_RETRY_DELAY', 2),
    ],
];
