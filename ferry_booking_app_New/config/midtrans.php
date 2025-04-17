<?php

return [
    'server_key' => env('MIDTRANS_SERVER_KEY', ''),
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'snap_url' => env('MIDTRANS_SNAP_URL', 'https://app.sandbox.midtrans.com/snap/v2/'),
    'notification_url' => env('MIDTRANS_NOTIFICATION_URL', '/api/payments/notification'),
    'finish_url' => env('MIDTRANS_FINISH_URL', '/payment/finish'),
    'unfinish_url' => env('MIDTRANS_UNFINISH_URL', '/payment/unfinish'),
    'error_url' => env('MIDTRANS_ERROR_URL', '/payment/error'),
];
