<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Configuration
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials and configuration settings for
    | the Midtrans payment gateway integration. Make sure to set the corresponding
    | values in your .env file.
    |
    */

    // Kunci API Midtrans
    'server_key' => env('MIDTRANS_SERVER_KEY', ''),
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),
    'merchant_id' => env('MIDTRANS_MERCHANT_ID', ''),

    // Konfigurasi environment
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    // URL Midtrans berdasarkan environment
    'snap_url' => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://app.midtrans.com/snap/v2/'
        : 'https://app.sandbox.midtrans.com/snap/v2/',

    'api_url' => env('MIDTRANS_IS_PRODUCTION', false)
        ? env('MIDTRANS_PRODUCTION_URL', 'https://api.midtrans.com')
        : env('MIDTRANS_SANDBOX_URL', 'https://api.sandbox.midtrans.com'),

    // URL callback yang digunakan oleh Midtrans - PERBAIKAN: pastikan ini URL lengkap yang bisa diakses publik
    'notification_url' => rtrim(env('APP_MIDTRANS_CALLBACK_URL', env('APP_URL')), '/') . env('MIDTRANS_NOTIFICATION_URL', '/api/payments/notification'),
    'finish_url' => rtrim(env('APP_MIDTRANS_CALLBACK_URL', env('APP_URL')), '/') . env('MIDTRANS_FINISH_URL', '/payment/finish'),
    'unfinish_url' => rtrim(env('APP_MIDTRANS_CALLBACK_URL', env('APP_URL')), '/') . env('MIDTRANS_UNFINISH_URL', '/payment/unfinish'),
    'error_url' => rtrim(env('APP_MIDTRANS_CALLBACK_URL', env('APP_URL')), '/') . env('MIDTRANS_ERROR_URL', '/payment/error'),

    // Pengaturan kedaluwarsa pembayaran (dalam jam)
    'expiry_duration' => env('MIDTRANS_EXPIRY_DURATION', 24),

    // Pengaturan 3D Secure
    'is_3ds' => true,

    // Pengaturan sanitasi input
    'is_sanitized' => true,

    // Pengaturan notifikasi
    'append_notif_url' => true, // Tambahkan notifikasi URL ke Snap secara otomatis

    // Pengaturan logging
    'enable_log' => env('MIDTRANS_ENABLE_LOG', true),
    'log_level' => env('MIDTRANS_LOG_LEVEL', 'debug'),
];
