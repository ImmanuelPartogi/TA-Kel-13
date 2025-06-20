<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MidtransService
{
    protected $serverKey;
    protected $clientKey;
    protected $isProduction;
    protected $apiUrl;
    protected $callbackUrl;

    public function __construct()
    {
        $this->serverKey = config('midtrans.server_key');
        $this->clientKey = config('midtrans.client_key');
        $this->isProduction = config('midtrans.is_production');
        $this->apiUrl = $this->isProduction
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';

        // Callback URL untuk e-wallet
        $this->callbackUrl = env('APP_MIDTRANS_CALLBACK_URL', config('app.url') . '/api/payments/notification');
    }

    /**
     * Membuat transaksi dengan implementasi yang sesuai dokumentasi Midtrans
     */
    public function createTransaction(Booking $booking, array $options = [])
    {
        $paymentType = strtolower($options['payment_type'] ?? 'virtual_account');
        $paymentMethod = strtolower($options['payment_method'] ?? 'bca');

        // Log permintaan untuk debugging
        Log::info('Creating Midtrans transaction', [
            'booking_code' => $booking->booking_code,
            'payment_method' => $paymentMethod,
            'payment_type' => $paymentType,
            'amount' => $booking->total_amount
        ]);

        // Parameter dasar sesuai dokumentasi
        $params = [
            'transaction_details' => [
                'order_id' => $booking->booking_code,
                'gross_amount' => (int)$booking->total_amount,
            ],
            'customer_details' => [
                'first_name' => $booking->user->name ?? 'Customer',
                'email' => $booking->user->email ?? 'customer@example.com',
                'phone' => $booking->user->phone ?? '',
            ],
            'item_details' => [
                [
                    'id' => 'FERRY-' . $booking->schedule_id,
                    'price' => (int)$booking->total_amount,
                    'quantity' => 1,
                    'name' => 'Tiket Ferry ' .
                        ($booking->schedule->route->origin ?? 'Origin') . ' - ' .
                        ($booking->schedule->route->destination ?? 'Destination'),
                ]
            ],
            // Konfigurasi custom expiry - 5 menit untuk semua jenis pembayaran
            'custom_expiry' => [
                'order_time' => date('Y-m-d H:i:s O'),  // Format: YYYY-MM-DD HH:MM:SS +0700
                'expiry_duration' => 5,
                'unit' => 'minute'
            ]
        ];

        // Konfigurasi berdasarkan tipe pembayaran sesuai dokumentasi Midtrans
        if ($paymentType == 'virtual_account') {
            // Implementasi VA sesuai dokumentasi Midtrans
            $params['payment_type'] = 'bank_transfer';
            $params['bank_transfer'] = [
                'bank' => $paymentMethod
            ];

            // Konfigurasi khusus per bank sesuai dokumentasi
            switch ($paymentMethod) {
                case 'bca':
                    // Tambahkan VA number custom jika ada
                    if (!empty($options['va_number'])) {
                        $params['bank_transfer']['va_number'] = $options['va_number'];
                    }

                    // Free text untuk BCA VA
                    $params['bank_transfer']['free_text'] = [
                        'inquiry' => [
                            [
                                'id' => 'Pembayaran Tiket Ferry',
                                'en' => 'Ferry Ticket Payment'
                            ]
                        ],
                        'payment' => [
                            [
                                'id' => 'Pembayaran Tiket Ferry',
                                'en' => 'Ferry Ticket Payment'
                            ]
                        ]
                    ];

                    // Sub company code untuk BCA jika ada
                    if (!empty($options['sub_company_code'])) {
                        $params['bank_transfer']['bca'] = [
                            'sub_company_code' => $options['sub_company_code']
                        ];
                    }
                    break;

                case 'permata':
                    // Permata memerlukan recipient_name sesuai dokumentasi
                    $params['bank_transfer']['permata'] = [
                        'recipient_name' => strtoupper($booking->user->name ?? 'CUSTOMER')
                    ];
                    // Custom VA untuk Permata jika ada
                    if (!empty($options['va_number'])) {
                        $params['bank_transfer']['va_number'] = $options['va_number'];
                    }
                    break;

                case 'bni':
                case 'bri':
                case 'cimb':
                    // Custom VA number sesuai dokumentasi
                    if (!empty($options['va_number'])) {
                        $params['bank_transfer']['va_number'] = $options['va_number'];
                    }
                    break;

                case 'mandiri':
                    // Mandiri Bill Payment memerlukan parameter berbeda
                    $params['payment_type'] = 'echannel';
                    unset($params['bank_transfer']);
                    $params['echannel'] = [
                        'bill_info1' => 'Pembayaran Tiket Ferry',
                        'bill_info2' => 'Ferry Online'
                    ];

                    // Mandiri bill_key (opsional)
                    if (!empty($options['bill_key'])) {
                        $params['echannel']['bill_key'] = $options['bill_key'];
                    }
                    break;
            }
        } elseif ($paymentType == 'qris') {
            // Implementasi QRIS sesuai dokumentasi
            $params['payment_type'] = 'qris';
            $params['qris'] = [
                'acquirer' => 'gopay' // Menggunakan default acquirer
            ];
        }

        // Log payload lengkap untuk debugging
        Log::debug('Midtrans request payload', ['payload' => $params]);

        // Implementasi retry dengan backoff
        $maxRetries = config('midtrans.retries.max_retries', 3);
        $backoff = config('midtrans.retries.retry_delay', 1); // detik awal

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                $response = $this->apiRequest('/v2/charge', 'POST', $params);

                // Log respons untuk debugging
                Log::info('Midtrans API response', [
                    'order_id' => $booking->booking_code,
                    'transaction_id' => $response['transaction_id'] ?? null,
                    'status_code' => $response['status_code'] ?? null
                ]);

                return $response;
            } catch (\Exception $e) {
                Log::error("Midtrans API attempt {$attempt} failed", [
                    'booking_code' => $booking->booking_code,
                    'error_message' => $e->getMessage(),
                    'retry_in' => ($attempt < $maxRetries) ? "{$backoff}s" : "giving up"
                ]);

                if ($attempt < $maxRetries) {
                    sleep($backoff);
                    $backoff *= 2; // Eksponensial backoff
                } else {
                    // Jika semua percobaan gagal, gunakan fallback
                    return $this->createFallbackTransaction($booking, $paymentType, $paymentMethod);
                }
            }
        }

        return null;
    }

    /**
     * Metode fallback untuk membuat transaksi saat API Midtrans gagal
     */
    protected function createFallbackTransaction(Booking $booking, $paymentType, $paymentMethod)
    {
        Log::warning('Using fallback transaction method', [
            'booking_code' => $booking->booking_code,
            'payment_type' => $paymentType,
            'payment_method' => $paymentMethod
        ]);

        $payment = Payment::where('booking_id', $booking->id)->latest()->first();

        if (!$payment) {
            return null;
        }

        // Tetapkan waktu kedaluwarsa 5 menit dari sekarang
        $payment->expiry_date = now()->addMinutes(5);
        $payment->save();

        // Buat data fallback berdasarkan tipe pembayaran
        if ($paymentType == 'virtual_account') {
            // Buat nomor VA dummy untuk testing
            $vaPrefix = config('midtrans.fallback.bank_prefix.' . $paymentMethod, '99');
            $vaNumber = $vaPrefix . substr(str_pad($booking->id, 8, '0', STR_PAD_LEFT), 0, 8) . mt_rand(1000, 9999);

            $payment->virtual_account_number = $vaNumber;
            $payment->external_reference = $paymentMethod . ' ' . $vaNumber;
            $payment->save();

            // Format respons sesuai format Midtrans untuk VA
            if ($paymentMethod == 'permata') {
                return [
                    'status_code' => '201',
                    'transaction_status' => 'pending',
                    'permata_va_number' => $vaNumber,
                    'expiry_time' => $payment->expiry_date->format('Y-m-d H:i:s O'),
                    'is_fallback' => true
                ];
            } else {
                return [
                    'status_code' => '201',
                    'transaction_status' => 'pending',
                    'va_numbers' => [
                        ['bank' => $paymentMethod, 'va_number' => $vaNumber]
                    ],
                    'expiry_time' => $payment->expiry_date->format('Y-m-d H:i:s O'),
                    'is_fallback' => true
                ];
            }
        } elseif ($paymentType == 'qris') {
            // Buat QR code URL dummy
            $qrCodeUrl = 'https://api.sandbox.midtrans.com/v2/qris/simulator/static';
            $payment->qr_code_url = $qrCodeUrl;
            $payment->save();

            // Format actions array sesuai format respons Midtrans
            $actions = [
                [
                    'name' => 'generate-qr-code',
                    'method' => 'GET',
                    'url' => $qrCodeUrl
                ]
            ];

            return [
                'status_code' => '201',
                'transaction_status' => 'pending',
                'actions' => $actions,
                'expiry_time' => $payment->expiry_date->format('Y-m-d H:i:s O'),
                'is_fallback' => true
            ];
        }

        return null;
    }

    /**
     * Metode untuk menentukan apakah perangkat pengguna adalah mobile
     * Penting untuk E-Wallet yang memiliki flow berbeda untuk web dan mobile
     */
    public function isMobileDevice($userAgent)
    {
        return preg_match(
            '/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i',
            $userAgent
        );
    }

    /**
     * Menentukan URL QR Code untuk QRIS
     */
    public function getQrisRedirectUrl(Payment $payment)
    {
        if (!empty($payment->qr_code_url)) {
            return [
                'type' => 'qr_code',
                'url' => $payment->qr_code_url
            ];
        }

        return null;
    }

    /**
     * Metode untuk API request dengan HTTP client
     */
    protected function apiRequest($endpoint, $method = 'GET', $data = [])
    {
        $url = $this->apiUrl . $endpoint;
        $auth = base64_encode($this->serverKey . ':');

        try {
            $httpClient = Http::withHeaders([
                'Authorization' => 'Basic ' . $auth,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->timeout(30); // Timeout ditingkatkan

            if ($method === 'GET') {
                $response = $httpClient->get($url);
            } else {
                $response = $httpClient->post($url, $data);
            }

            // Logging response untuk debugging
            Log::debug('Midtrans API raw response', [
                'url' => $url,
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            // Log error secara detil
            Log::error('Midtrans API error response', [
                'url' => $url,
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);

            throw new \Exception('Midtrans API error: ' . ($response->json()['status_message'] ?? 'Unknown error'));
        } catch (\Exception $e) {
            Log::error('Midtrans API exception', [
                'url' => $url,
                'method' => $method,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Set detail pembayaran dari respons Midtrans
     */
    public function setPaymentDetails(Payment $payment, $data)
    {
        // Log data yang diterima
        Log::debug('Setting payment details', [
            'payment_id' => $payment->id,
            'data_keys' => array_keys($data),
            'payment_type' => $data['payment_type'] ?? 'unknown'
        ]);

        // Untuk QRIS - simpan QR string jika tersedia
        if (isset($data['qr_string'])) {
            $payment->payload = json_encode(array_merge(
                json_decode($payment->payload ?? '{}', true),
                ['qr_string' => $data['qr_string']]
            ));

            Log::info('QR string saved to payment payload', [
                'payment_id' => $payment->id,
                'qr_string_length' => strlen($data['qr_string'])
            ]);
        }

        // Untuk QRIS - simpan QR string jika tersedia
        if (isset($data['payment_type']) && $data['payment_type'] === 'qris' && isset($data['qr_string'])) {
            $payment->external_reference = $data['qr_string'];
            Log::info('QR string saved to payment', [
                'payment_id' => $payment->id,
                'qr_string_length' => strlen($data['qr_string'])
            ]);
        }

        // Untuk Virtual Account - diperbarui sesuai dokumentasi
        if (isset($data['va_numbers']) && !empty($data['va_numbers'])) {
            $vaNumber = $data['va_numbers'][0];
            $payment->virtual_account_number = $vaNumber['va_number'];
            $payment->external_reference = $vaNumber['bank'] . ' ' . $vaNumber['va_number'];

            Log::info('Virtual account details set', [
                'payment_id' => $payment->id,
                'va_number' => $payment->virtual_account_number,
                'bank' => $vaNumber['bank']
            ]);
        } elseif (isset($data['permata_va_number'])) {
            // Khusus format Permata sesuai dokumentasi
            $payment->virtual_account_number = $data['permata_va_number'];
            $payment->external_reference = 'permata ' . $data['permata_va_number'];

            Log::info('Permata VA details set', [
                'payment_id' => $payment->id,
                'va_number' => $payment->virtual_account_number
            ]);
        } elseif (isset($data['bill_key']) && isset($data['biller_code'])) {
            // Khusus format Mandiri Bill sesuai dokumentasi
            $payment->virtual_account_number = $data['bill_key'];
            $payment->external_reference = 'mandiri ' . $data['bill_key'] . ' ' . $data['biller_code'];

            Log::info('Mandiri Bill details set', [
                'payment_id' => $payment->id,
                'bill_key' => $data['bill_key'],
                'biller_code' => $data['biller_code']
            ]);
        }

        // Untuk QRIS dan e-wallet
        if (isset($data['actions']) && is_array($data['actions'])) {
            foreach ($data['actions'] as $action) {
                if (isset($action['name']) && $action['name'] === 'generate-qr-code' && isset($action['url'])) {
                    $payment->qr_code_url = $action['url'];
                }
            }
        }

        // Set transaction_id jika ada
        if (isset($data['transaction_id'])) {
            $payment->transaction_id = $data['transaction_id'];
        }

        // Set expiry_time jika ada
        if (isset($data['expiry_time'])) {
            $payment->expiry_date = date('Y-m-d H:i:s', strtotime($data['expiry_time']));
        }

        // Simpan payload respons lengkap
        $payment->payload = json_encode($data);

        return $payment;
    }

    /**
     * Verifikasi notifikasi yang ditingkatkan
     */
    public function verifyNotification($notification)
    {
        Log::info('Verifying notification from Midtrans', [
            'order_id' => $notification['order_id'] ?? 'unknown',
            'transaction_status' => $notification['transaction_status'] ?? 'unknown',
            'payment_type' => $notification['payment_type'] ?? 'unknown'
        ]);

        try {
            // Midtrans terkadang tidak menyertakan signature_key di sandbox mode
            if (!isset($notification['signature_key']) && !$this->isProduction) {
                Log::info('Signature key not present in sandbox mode, treating as valid');
                return true;
            }

            // Verifikasi signature untuk production mode
            if (
                isset($notification['order_id']) &&
                isset($notification['status_code']) &&
                isset($notification['gross_amount']) &&
                isset($notification['signature_key'])
            ) {
                $orderId = $notification['order_id'];
                $statusCode = $notification['status_code'];
                $grossAmount = $notification['gross_amount'];
                $serverKey = $this->serverKey;
                $hash = $orderId . $statusCode . $grossAmount . $serverKey;
                $calculatedSignature = hash('sha512', $hash);

                // Debug log untuk verifikasi signature
                Log::debug('Signature verification details', [
                    'order_id' => $orderId,
                    'status_code' => $statusCode,
                    'gross_amount' => $grossAmount,
                    'calculated_signature' => $calculatedSignature,
                    'provided_signature' => $notification['signature_key']
                ]);

                return ($calculatedSignature === $notification['signature_key']);
            }

            // Fallback untuk sandbox mode tanpa signature key
            return !$this->isProduction;
        } catch (\Exception $e) {
            Log::error('Error verifying notification', [
                'error' => $e->getMessage(),
                'notification' => $notification
            ]);

            // Fallback ke true untuk sandbox untuk meminimalkan disruption
            return !$this->isProduction;
        }
    }

    /**
     * Update status pembayaran dan booking berdasarkan notifikasi
     * Diperbarui untuk mendukung semua payment type sesuai dokumentasi
     */
    public function updatePaymentStatus(Payment $payment, array $notification)
    {
        Log::info('Updating payment status', [
            'payment_id' => $payment->id,
            'transaction_status' => $notification['transaction_status'] ?? 'unknown',
            'payment_type' => $notification['payment_type'] ?? 'unknown'
        ]);

        $transactionStatus = $notification['transaction_status'] ?? '';
        $booking = $payment->booking;

        // Simpan data notifikasi lengkap
        $payment->payload = json_encode($notification);

        // Update transaction ID
        if (!$payment->transaction_id && isset($notification['transaction_id'])) {
            $payment->transaction_id = $notification['transaction_id'];
        }

        // Perbarui untuk menyimpan payment_type jika QRIS
        if (isset($notification['payment_type']) && $notification['payment_type'] === 'qris') {
            $payment->payment_method = 'E_WALLET';
            $payment->payment_channel = 'qris';
        }

        // Update payment details
        $this->setPaymentDetails($payment, $notification);

        // Update status pembayaran dan booking berdasarkan transaction_status
        switch ($transactionStatus) {
            case 'capture':
            case 'settlement':
                $payment->status = 'SUCCESS';
                $payment->payment_date = isset($notification['settlement_time'])
                    ? date('Y-m-d H:i:s', strtotime($notification['settlement_time']))
                    : now();

                // Tambahkan payment_option_type untuk GoPay jika ada
                if (isset($notification['payment_option_type'])) {
                    $payment->payment_option_type = $notification['payment_option_type'];
                }

                // Update channel response
                if (isset($notification['status_code'])) {
                    $payment->channel_response_code = $notification['status_code'];
                }
                if (isset($notification['status_message'])) {
                    $payment->channel_response_message = $notification['status_message'];
                }

                // Update booking status
                if ($booking && $booking->status === 'PENDING') {
                    $booking->status = 'CONFIRMED';
                    $booking->save();

                    Log::info('Booking status updated to CONFIRMED', [
                        'booking_id' => $booking->id
                    ]);
                }
                break;

            case 'pending':
                $payment->status = 'PENDING';
                break;

            case 'deny':
            case 'cancel':
            case 'expire':
                $payment->status = 'FAILED';
                $payment->channel_response_code = $notification['status_code'] ?? null;
                $payment->channel_response_message = $notification['status_message'] ??
                    ($transactionStatus === 'expire' ? 'Transaction expired' : 'Transaction cancelled/denied');

                if ($booking && $booking->status === 'PENDING') {
                    $booking->status = 'CANCELLED';
                    $booking->cancellation_reason = 'Pembayaran ' .
                        ($transactionStatus === 'expire' ? 'kedaluwarsa' : ($transactionStatus === 'deny' ? 'ditolak' : 'dibatalkan'));
                    $booking->save();
                }
                break;

            case 'refund':
            case 'partial_refund':
                $payment->status = $transactionStatus === 'refund' ? 'REFUNDED' : 'PARTIAL_REFUND';
                if (isset($notification['refund_amount'])) {
                    $payment->refund_amount = $notification['refund_amount'];
                }
                $payment->refund_date = now();
                break;
        }

        // Simpan perubahan
        $payment->save();

        Log::info('Payment status updated successfully', [
            'payment_id' => $payment->id,
            'new_status' => $payment->status,
            'booking_status' => $booking ? $booking->status : null
        ]);

        return true;
    }

    /**
     * Mendapatkan status transaksi dari Midtrans dengan retry
     */
    public function getStatus($orderIdOrTransactionId)
    {
        Log::info('Fetching transaction status from Midtrans', [
            'id' => $orderIdOrTransactionId
        ]);

        // Implementasi retry untuk get status
        $maxRetries = config('midtrans.retries.max_retries', 3);
        $backoff = config('midtrans.retries.retry_delay', 1);

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                $url = $this->apiUrl . '/v2/' . $orderIdOrTransactionId . '/status';
                $auth = base64_encode($this->serverKey . ':');

                $response = Http::withHeaders([
                    'Authorization' => 'Basic ' . $auth,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json'
                ])->timeout(15)->get($url);

                if ($response->successful()) {
                    Log::info('Transaction status response received', [
                        'status_code' => $response->status(),
                        'transaction_status' => $response->json()['transaction_status'] ?? 'unknown'
                    ]);

                    return $response->json();
                }

                Log::error('Error fetching transaction status on attempt ' . $attempt, [
                    'id' => $orderIdOrTransactionId,
                    'status_code' => $response->status(),
                    'response' => $response->json()
                ]);

                if ($attempt < $maxRetries) {
                    sleep($backoff);
                    $backoff *= 2;
                }
            } catch (\Exception $e) {
                Log::error('Exception fetching transaction status on attempt ' . $attempt, [
                    'id' => $orderIdOrTransactionId,
                    'error' => $e->getMessage()
                ]);

                if ($attempt < $maxRetries) {
                    sleep($backoff);
                    $backoff *= 2;
                }
            }
        }

        // Jika semua percobaan gagal, kembalikan null
        return null;
    }

    /**
     * Cek dan update status transaksi
     */
    public function checkAndUpdateTransaction($bookingCode)
    {
        Log::channel('payment')->info('Checking transaction status', ['booking_code' => $bookingCode]);

        $booking = \App\Models\Booking::where('booking_code', $bookingCode)->first();

        if (!$booking) {
            Log::channel('payment')->error('Booking not found for manual check', [
                'booking_code' => $bookingCode
            ]);
            return false;
        }

        $payment = \App\Models\Payment::where('booking_id', $booking->id)
            ->latest()
            ->first();

        if (!$payment) {
            Log::channel('payment')->error('Payment not found for booking', [
                'booking_id' => $booking->id,
                'booking_code' => $bookingCode
            ]);
            return false;
        }

        // Jangan periksa pembayaran yang statusnya sudah tidak PENDING
        if ($payment->status != 'PENDING') {
            Log::channel('payment')->info('Skipping non-pending payment', [
                'payment_id' => $payment->id,
                'status' => $payment->status
            ]);
            return [
                'payment_status' => $payment->status,
                'booking_status' => $booking->status,
                'transaction_status' => $payment->status
            ];
        }

        // Tambahkan retry logic
        $maxRetries = config('midtrans.retries.max_retries', 3);
        $statusResponse = null;

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                // Cek status di Midtrans
                $statusResponse = $this->getStatus($payment->transaction_id ?? $booking->booking_code);

                if ($statusResponse) {
                    break;  // Berhasil mendapatkan response
                }

                Log::channel('payment')->warning("Midtrans status check attempt {$attempt} failed", [
                    'booking_code' => $bookingCode
                ]);

                if ($attempt < $maxRetries) {
                    sleep(2); // Tunggu sebelum mencoba lagi
                }
            } catch (\Exception $e) {
                Log::channel('payment')->error("Error on attempt {$attempt}", [
                    'booking_code' => $bookingCode,
                    'error' => $e->getMessage()
                ]);

                if ($attempt < $maxRetries) {
                    sleep(2);
                }
            }
        }

        // Jika gagal mendapatkan status, coba gunakan data yang ada
        if (!$statusResponse) {
            Log::channel('payment')->warning('Failed to get status from Midtrans, using existing payment data', [
                'booking_code' => $bookingCode
            ]);

            // Jika sudah ada VA number atau QR code, anggap transaksi masih pending
            if ($payment->virtual_account_number || $payment->qr_code_url) {
                return [
                    'payment_status' => 'PENDING',
                    'booking_status' => $booking->status,
                    'transaction_status' => 'pending'
                ];
            }

            return false;
        }

        // Update status berdasarkan respons
        $this->updatePaymentStatus($payment, (array) $statusResponse);

        // Log hasil update
        Log::channel('payment')->info('Transaction status updated', [
            'payment_id' => $payment->id,
            'booking_code' => $bookingCode,
            'payment_status' => $payment->fresh()->status,
            'booking_status' => $booking->fresh()->status
        ]);

        return [
            'payment_status' => $payment->fresh()->status,
            'booking_status' => $booking->fresh()->status,
            'transaction_status' => $statusResponse['transaction_status'] ?? null
        ];
    }

    /**
     * Mendapatkan simulator URL untuk testing di sandbox
     */
    public function getSimulatorUrl($paymentMethod, $paymentType)
    {
        if ($this->isProduction) return null;

        $paymentMethod = strtolower($paymentMethod);
        $paymentType = strtolower($paymentType);

        if ($paymentType == 'virtual_account') {
            switch ($paymentMethod) {
                case 'bca':
                    return 'https://simulator.sandbox.midtrans.com/bca/va/index';
                case 'bni':
                    return 'https://simulator.sandbox.midtrans.com/bni/va/index';
                case 'bri':
                    return 'https://simulator.sandbox.midtrans.com/bri/va/index';
                case 'permata':
                    return 'https://simulator.sandbox.midtrans.com/permata/va/index';
                case 'mandiri':
                    return 'https://simulator.sandbox.midtrans.com/echannel/index';
                case 'cimb':
                    return 'https://simulator.sandbox.midtrans.com/cimb/va/index';
                default:
                    return null;
            }
        } elseif ($paymentType == 'e_wallet') {
            switch ($paymentMethod) {
                case 'gopay':
                    return 'https://simulator.sandbox.midtrans.com/qris/index';
                case 'shopeepay':
                    return 'https://simulator.sandbox.midtrans.com/shopeepay/qr/index';
                default:
                    return null;
            }
        } elseif ($paymentType == 'qris') {
            return 'https://simulator.sandbox.midtrans.com/qris/index';
        }

        return null;
    }

    /**
     * Mendapatkan instruksi pembayaran
     */
    public function getPaymentInstructions($paymentMethod, $paymentType)
    {
        $paymentMethod = strtolower($paymentMethod);
        $paymentType = strtolower($paymentType);

        // Instruksi pembayaran untuk Virtual Account
        if ($paymentType == 'virtual_account') {
            switch ($paymentMethod) {
                case 'bca':
                    return [
                        'title' => 'BCA Virtual Account',
                        'steps' => [
                            'Buka aplikasi BCA Mobile atau m-BCA',
                            'Pilih menu "m-Transfer" atau "Transfer"',
                            'Pilih "BCA Virtual Account"',
                            'Masukkan nomor Virtual Account',
                            'Pastikan nama dan jumlah pembayaran sudah sesuai',
                            'Masukkan PIN m-BCA atau password',
                            'Transaksi selesai'
                        ]
                    ];
                case 'bni':
                    return [
                        'title' => 'BNI Virtual Account',
                        'steps' => [
                            'Buka aplikasi BNI Mobile Banking',
                            'Pilih menu "Transfer"',
                            'Pilih "Virtual Account Billing"',
                            'Masukkan nomor Virtual Account',
                            'Pastikan nama dan jumlah pembayaran sudah sesuai',
                            'Masukkan password transaksi',
                            'Transaksi selesai'
                        ]
                    ];
                case 'bri':
                    return [
                        'title' => 'BRI Virtual Account',
                        'steps' => [
                            'Buka aplikasi BRI Mobile Banking',
                            'Pilih menu "Pembayaran"',
                            'Pilih "BRIVA"',
                            'Masukkan nomor Virtual Account',
                            'Pastikan nama dan jumlah pembayaran sudah sesuai',
                            'Masukkan PIN Mobile Banking',
                            'Transaksi selesai'
                        ]
                    ];
                case 'permata':
                    return [
                        'title' => 'Permata Virtual Account',
                        'steps' => [
                            'Buka aplikasi PermataMobile X',
                            'Pilih menu "Pembayaran"',
                            'Pilih "Virtual Account"',
                            'Masukkan nomor Virtual Account',
                            'Pastikan nama dan jumlah pembayaran sudah sesuai',
                            'Masukkan password transaksi',
                            'Transaksi selesai'
                        ]
                    ];
                case 'mandiri':
                    return [
                        'title' => 'Mandiri Bill Payment',
                        'steps' => [
                            'Buka aplikasi Livin\' by Mandiri',
                            'Pilih menu "Pembayaran"',
                            'Pilih "Multi Payment"',
                            'Pilih penyedia jasa "Midtrans"',
                            'Masukkan Kode Perusahaan dan Nomor Virtual',
                            'Pastikan nama dan jumlah pembayaran sudah sesuai',
                            'Masukkan MPIN',
                            'Transaksi selesai'
                        ]
                    ];
                case 'cimb':
                    return [
                        'title' => 'CIMB Virtual Account',
                        'steps' => [
                            'Buka aplikasi OCTO Mobile',
                            'Pilih menu "Transfer"',
                            'Pilih "Virtual Account"',
                            'Masukkan nomor Virtual Account',
                            'Pastikan nama dan jumlah pembayaran sudah sesuai',
                            'Masukkan password transaksi',
                            'Transaksi selesai'
                        ]
                    ];
                default:
                    return [
                        'title' => 'Virtual Account Payment',
                        'steps' => [
                            'Buka aplikasi mobile banking',
                            'Pilih menu transfer atau pembayaran',
                            'Pilih Virtual Account',
                            'Masukkan nomor Virtual Account',
                            'Verifikasi detail pembayaran',
                            'Konfirmasi dan selesaikan pembayaran'
                        ]
                    ];
            }
        }
        // Instruksi pembayaran untuk E-Wallet
        else if ($paymentType == 'qris') {
            return [
                'title' => 'QRIS Payment',
                'steps' => [
                    'Buka aplikasi e-wallet atau mobile banking yang mendukung QRIS',
                    'Pilih menu Scan QRIS atau QR Code',
                    'Arahkan kamera ke QR Code yang ditampilkan',
                    'Verifikasi nama merchant dan jumlah pembayaran',
                    'Konfirmasi pembayaran',
                    'Masukkan PIN atau password',
                    'Transaksi selesai'
                ]
            ];
        }

        // Default instruksi
        return [
            'title' => 'Payment Instructions',
            'steps' => [
                'Pilih metode pembayaran yang tersedia',
                'Ikuti instruksi pembayaran sesuai metode yang dipilih',
                'Selesaikan pembayaran sebelum batas waktu',
                'Simpan bukti pembayaran sebagai referensi'
            ]
        ];
    }

    /**
     * Request refund ke Midtrans
     *
     * @param string $transactionId ID transaksi di Midtrans
     * @param float $amount Jumlah yang akan di-refund
     * @param string $reason Alasan refund
     * @return array Respons dari Midtrans
     */
    public function requestRefund($transactionId, $amount, $reason)
    {
        Log::info('Requesting refund to Midtrans', [
            'transaction_id' => $transactionId,
            'amount' => $amount,
            'reason' => $reason
        ]);

        try {
            // Endpoint untuk refund sesuai dokumentasi Midtrans
            $endpoint = '/v2/' . $transactionId . '/refund';

            // Parameter untuk refund
            $params = [
                'refund_key' => 'ref_' . uniqid(), // Generate unique refund key
                'amount' => (int)$amount, // Jumlah harus integer
                'reason' => $reason
            ];

            // Request ke Midtrans API
            $response = $this->apiRequest($endpoint, 'POST', $params);

            Log::info('Midtrans refund response', [
                'transaction_id' => $transactionId,
                'response' => $response
            ]);

            // Cek jika metode pembayaran memerlukan proses manual
            $requiresManualProcess = in_array(
                $response['payment_type'] ?? '',
                ['bank_transfer', 'cstore', 'echannel']
            );

            // Tambahkan flag untuk proses manual agar dapat digunakan di controller
            return array_merge($response, [
                'requires_manual_process' => $requiresManualProcess
            ]);
        } catch (\Exception $e) {
            Log::error('Error requesting refund from Midtrans', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage()
            ]);

            // Jika error, kembalikan array dengan informasi error dan flag proses manual
            // untuk metode yang tidak support refund via API
            return [
                'status_code' => '412',
                'status_message' => $e->getMessage(),
                'requires_manual_process' => true
            ];
        }
    }

    /**
     * Cek status refund di Midtrans
     *
     * @param string $refundKey Refund key yang di-generate saat request refund
     * @return array|null Respons dari Midtrans
     */
    public function checkRefundStatus($refundKey)
    {
        try {
            // Endpoint untuk cek status refund
            $endpoint = '/v2/refund/' . $refundKey . '/status';

            // Request ke Midtrans API
            return $this->apiRequest($endpoint, 'GET');
        } catch (\Exception $e) {
            Log::error('Error checking refund status from Midtrans', [
                'refund_key' => $refundKey,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Batalkan permintaan refund di Midtrans
     *
     * @param string $refundKey Refund key yang di-generate saat request refund
     * @return array|null Respons dari Midtrans
     */
    public function cancelRefund($refundKey)
    {
        try {
            // Endpoint untuk cancel refund
            $endpoint = '/v2/refund/' . $refundKey . '/cancel';

            // Request ke Midtrans API
            return $this->apiRequest($endpoint, 'POST');
        } catch (\Exception $e) {
            Log::error('Error cancelling refund from Midtrans', [
                'refund_key' => $refundKey,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Cek apakah metode pembayaran dapat di-refund
     *
     * @param string $paymentMethod Metode pembayaran
     * @return boolean True jika dapat di-refund
     */
    public function isRefundable($paymentMethod, $paymentChannel)
    {
        $paymentMethod = strtolower($paymentMethod);
        $paymentChannel = strtolower($paymentChannel);

        // Metode pembayaran yang dapat di-refund sesuai dokumentasi
        $refundablePaymentMethods = [
            'credit_card' => true,
            'e_wallet' => ['gopay', 'shopeepay'],
            'qris' => true,
            'cardless_credit' => ['akulaku', 'kredivo']
        ];

        if ($paymentMethod === 'credit_card') {
            return true;
        }

        if ($paymentMethod === 'e_wallet') {
            return in_array($paymentChannel, $refundablePaymentMethods['e_wallet']);
        }

        if ($paymentMethod === 'cardless_credit') {
            return in_array($paymentChannel, $refundablePaymentMethods['cardless_credit']);
        }

        if ($paymentMethod === 'qris') {
            return true;
        }

        return false;
    }

    /**
     * Cek apakah transaksi masih dalam periode refund
     *
     * @param string $paymentMethod Metode pembayaran
     * @param string $paymentChannel Channel pembayaran
     * @param \DateTime $paymentDate Tanggal pembayaran
     * @return boolean|int False jika sudah expired, atau jumlah hari maksimal
     */
    public function getRefundPeriod($paymentMethod, $paymentChannel, $paymentDate)
    {
        $paymentMethod = strtolower($paymentMethod);
        $paymentChannel = strtolower($paymentChannel);
        $now = Carbon::now();
        $paymentDateTime = Carbon::parse($paymentDate);

        // Periode refund berdasarkan dokumentasi
        if ($paymentMethod === 'credit_card') {
            // Maksimal 6 bulan (180 hari)
            $maxDays = 180;
            return $now->diffInDays($paymentDateTime) <= $maxDays ? $maxDays : false;
        }

        if ($paymentMethod === 'e_wallet') {
            if ($paymentChannel === 'gopay') {
                // 45 hari setelah settled
                $maxDays = 45;
                return $now->diffInDays($paymentDateTime) <= $maxDays ? $maxDays : false;
            }

            if ($paymentChannel === 'shopeepay') {
                // 365 hari
                $maxDays = 365;
                return $now->diffInDays($paymentDateTime) <= $maxDays ? $maxDays : false;
            }
        }

        if ($paymentMethod === 'qris') {
            // GoPayは45日（on-us）または7日（off-us）
            // ShopeePayは365日
            // Simplify for QRIS - use 7 days as safest option
            $maxDays = 7;
            return $now->diffInDays($paymentDateTime) <= $maxDays ? $maxDays : false;
        }

        if ($paymentMethod === 'cardless_credit') {
            if ($paymentChannel === 'akulaku') {
                // 6 bulan (180 hari)
                $maxDays = 180;
                return $now->diffInDays($paymentDateTime) <= $maxDays ? $maxDays : false;
            }

            if ($paymentChannel === 'kredivo') {
                // 14 hari
                $maxDays = 14;
                return $now->diffInDays($paymentDateTime) <= $maxDays ? $maxDays : false;
            }
        }

        // Tidak dapat di-refund
        return false;
    }

    /**
     * Dapatkan perkiraan waktu SLA untuk refund
     *
     * @param string $paymentMethod Metode pembayaran
     * @param string $paymentChannel Channel pembayaran
     * @return string Perkiraan waktu SLA
     */
    public function getRefundSLA($paymentMethod, $paymentChannel)
    {
        $paymentMethod = strtolower($paymentMethod);
        $paymentChannel = strtolower($paymentChannel);

        if ($paymentMethod === 'credit_card') {
            return '7-14 hari kerja';
        }

        if ($paymentMethod === 'e_wallet') {
            if ($paymentChannel === 'gopay') {
                return '1x24 jam';
            }

            if ($paymentChannel === 'shopeepay') {
                return '20 hari';
            }
        }

        if ($paymentMethod === 'qris') {
            return '1-20 hari kerja';
        }

        if ($paymentMethod === 'cardless_credit') {
            return '1x24 jam';
        }

        return '3-14 hari kerja';
    }
}
