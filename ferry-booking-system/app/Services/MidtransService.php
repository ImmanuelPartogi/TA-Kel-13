<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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

        // Callback URL adalah krusial untuk e-wallet
        $this->callbackUrl = env('APP_MIDTRANS_CALLBACK_URL', config('app.url') . '/api/payments/notification');
    }

    /**
     * Membuat transaksi dengan retry dan penanganan error yang lebih baik
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

        // Parameter dasar
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
            'expiry' => [
                'unit' => 'hour',
                'duration' => (int)config('midtrans.expiry_duration', 24),
            ],
        ];

        // Konfigurasi pembayaran berdasarkan tipe
        if ($paymentType == 'virtual_account') {
            $params['payment_type'] = 'bank_transfer';
            $params['bank_transfer'] = [
                'bank' => $paymentMethod
            ];
        } elseif ($paymentType == 'e_wallet') {
            // Perbaikan untuk E-wallet: tambahkan parameter yang diperlukan
            if ($paymentMethod == 'gopay') {
                $params['payment_type'] = 'gopay';
                $params['gopay'] = [
                    'enable_callback' => true,
                    'callback_url' => $this->callbackUrl
                ];
            } elseif ($paymentMethod == 'shopeepay') {
                $params['payment_type'] = 'shopeepay';
                $params['shopeepay'] = [
                    'callback_url' => $this->callbackUrl
                ];
            }
            // Catatan: DANA dan OVO tidak didukung di Sandbox saat ini
        } elseif ($paymentType == 'credit_card') {
            $params['payment_type'] = 'credit_card';
            $params['credit_card'] = [
                'secure' => true,
                'channel' => 'migs',
                'bank' => 'bca',
                'installment_term' => $options['installment_term'] ?? 0,
                'bins' => $options['bins'] ?? [],
            ];
        } elseif ($paymentType == 'qris') {
            $params['payment_type'] = 'qris';
            $params['qris'] = [
                'acquirer' => 'gopay'
            ];
        }

        // Log payload lengkap untuk debugging
        Log::debug('Midtrans request payload', ['payload' => $params]);

        // Implementasi retry dengan backoff
        $maxRetries = 3;
        $backoff = 1; // detik awal

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
                    // Jika semua percobaan gagal, coba gunakan fallback
                    return $this->createFallbackTransaction($booking, $paymentType, $paymentMethod);
                }
            }
        }

        return null;
    }

    /**
     * Metode fallback untuk membuat transaksi saat API Midtrans gagal
     */
    // Di MidtransService.php
    protected function createFallbackTransaction(Booking $booking, $paymentType, $paymentMethod)
    {
        Log::info('Creating fallback transaction', [
            'booking_code' => $booking->booking_code,
            'payment_type' => $paymentType,
            'payment_method' => $paymentMethod
        ]);

        // Menggunakan prefix dari konfigurasi
        $bankPrefix = config('midtrans.fallback.bank_prefix.' . strtolower($paymentMethod), '99');
        $vaNumber = $bankPrefix . substr(str_pad($booking->id, 8, '0', STR_PAD_LEFT), 0, 8) . mt_rand(1000, 9999);

        $payment = Payment::where('booking_id', $booking->id)->latest()->first();

        if ($payment) {
            $payment->virtual_account_number = $vaNumber;
            $payment->external_reference = $paymentMethod . ' ' . $vaNumber;
            $payment->save();

            Log::info('Fallback VA number created', [
                'booking_code' => $booking->booking_code,
                'va_number' => $vaNumber
            ]);

            return [
                'status_code' => '201',
                'transaction_status' => 'pending',
                'va_numbers' => [
                    ['bank' => $paymentMethod, 'va_number' => $vaNumber]
                ],
                'is_fallback' => true
            ];
        }

        return null;
    }

    /**
     * Metode yang ditingkatkan untuk API request dengan HTTP client
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
            ])->timeout(30); // Tingkatkan timeout untuk mengatasi masalah jaringan

            if ($method === 'GET') {
                $response = $httpClient->get($url);
            } else {
                $response = $httpClient->post($url, $data);
            }

            // Logging response secara mendetail untuk debugging
            Log::debug('Midtrans API raw response', [
                'url' => $url,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            // Log error secara lebih detail
            Log::error('Midtrans API error response', [
                'url' => $url,
                'status' => $response->status(),
                'body' => $response->body(),
                'headers' => $response->headers(),
                'response' => $response->json()
            ]);

            throw new \Exception('Midtrans API error: ' . ($response->json()['status_message'] ?? 'Unknown error'));
        } catch (\Exception $e) {
            Log::error('Midtrans API exception', [
                'url' => $url,
                'method' => $method,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
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
        $maxRetries = 3;
        $backoff = 1;

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
     * Verifikasi notifikasi
     */
    public function verifyNotification($notification)
    {
        Log::info('Verifying notification from Midtrans', [
            'order_id' => $notification['order_id'] ?? 'unknown',
            'transaction_status' => $notification['transaction_status'] ?? 'unknown'
        ]);

        try {
            // Midtrans terkadang tidak menyertakan signature_key di sandbox mode
            // Jika signature_key tidak ada, anggap valid untuk sandbox
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
     * Set detail pembayaran dari respons Midtrans
     */
    public function setPaymentDetails(Payment $payment, $data)
    {
        // Log data yang diterima
        Log::debug('Setting payment details', [
            'payment_id' => $payment->id,
            'data_keys' => array_keys($data)
        ]);

        // Untuk Virtual Account
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
            $payment->virtual_account_number = $data['permata_va_number'];
            $payment->external_reference = 'permata ' . $data['permata_va_number'];
        }

        // Untuk E-Wallet
        if (isset($data['actions']) && is_array($data['actions'])) {
            foreach ($data['actions'] as $action) {
                if (isset($action['name']) && $action['name'] === 'generate-qr-code' && isset($action['url'])) {
                    $payment->qr_code_url = $action['url'];
                    Log::info('QR code URL set', ['url' => $action['url']]);
                } elseif (isset($action['name']) && $action['name'] === 'deeplink-redirect' && isset($action['url'])) {
                    $payment->deep_link_url = $action['url'];
                    Log::info('Deep link URL set', ['url' => $action['url']]);
                }
            }
        }

        // Tambahan: Set transaction_id jika ada
        if (isset($data['transaction_id'])) {
            $payment->transaction_id = $data['transaction_id'];
        }

        return $payment;
    }

    /**
     * Update status pembayaran dan booking
     */
    public function updatePaymentStatus(Payment $payment, array $notification)
    {
        Log::info('Updating payment status', [
            'payment_id' => $payment->id,
            'transaction_status' => $notification['transaction_status'] ?? 'unknown'
        ]);

        $transactionStatus = $notification['transaction_status'] ?? '';
        $booking = $payment->booking;

        // Simpan data notifikasi lengkap
        $payment->payload = json_encode($notification);

        // Update transaction ID
        if (!$payment->transaction_id && isset($notification['transaction_id'])) {
            $payment->transaction_id = $notification['transaction_id'];
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

                // Update booking status
                if ($booking && $booking->status === 'PENDING') {
                    $booking->status = 'CONFIRMED';
                    $booking->save();

                    Log::info('Booking status updated to CONFIRMED', [
                        'booking_id' => $booking->id
                    ]);

                    // Kirim notifikasi ke user bahwa booking telah dikonfirmasi
                    try {
                        // Implementasi notifikasi (email/SMS) bisa ditambahkan di sini
                    } catch (\Exception $e) {
                        Log::error('Failed to send confirmation notification', [
                            'booking_id' => $booking->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
                break;

            case 'pending':
                $payment->status = 'PENDING';
                break;

            case 'deny':
            case 'cancel':
            case 'expire':
                $payment->status = 'FAILED';

                if ($booking && $booking->status === 'PENDING') {
                    $booking->status = 'CANCELLED';
                    $booking->cancellation_reason = 'Pembayaran ' .
                        ($transactionStatus === 'expire' ? 'kedaluwarsa' : 'dibatalkan');
                    $booking->save();

                    // Kirim notifikasi ke user bahwa booking telah dibatalkan
                    try {
                        // Implementasi notifikasi (email/SMS) bisa ditambahkan di sini
                    } catch (\Exception $e) {
                        Log::error('Failed to send cancellation notification', [
                            'booking_id' => $booking->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
                break;

            case 'refund':
                $payment->status = 'REFUNDED';
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
        $maxRetries = 3;
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
                case 'mandiri':
                    return [
                        'title' => 'Mandiri Bill Payment',
                        'steps' => [
                            'Buka aplikasi Mandiri Online',
                            'Pilih menu "Pembayaran"',
                            'Pilih "Multi Payment"',
                            'Pilih penyedia jasa "Midtrans"',
                            'Masukkan kode pembayaran',
                            'Pastikan nama dan jumlah pembayaran sudah sesuai',
                            'Masukkan MPIN atau OTP',
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
        else if ($paymentType == 'e_wallet') {
            switch ($paymentMethod) {
                case 'gopay':
                    return [
                        'title' => 'GoPay',
                        'steps' => [
                            'Buka aplikasi Gojek',
                            'Tap tombol "Scan QR"',
                            'Scan QR Code yang ditampilkan di halaman pembayaran',
                            'Pastikan nominal pembayaran sudah sesuai',
                            'Tap tombol "Bayar"',
                            'Masukkan PIN GoPay',
                            'Transaksi selesai'
                        ]
                    ];
                case 'shopeepay':
                    return [
                        'title' => 'ShopeePay',
                        'steps' => [
                            'Buka aplikasi Shopee',
                            'Tap ikon "Saya"',
                            'Tap "ShopeePay"',
                            'Tap "Scan"',
                            'Scan QR Code yang ditampilkan di halaman pembayaran',
                            'Pastikan nominal pembayaran sudah sesuai',
                            'Tap tombol "Bayar"',
                            'Masukkan PIN ShopeePay',
                            'Transaksi selesai'
                        ]
                    ];
                case 'dana':
                    return [
                        'title' => 'DANA',
                        'steps' => [
                            'Buka aplikasi DANA',
                            'Tap "Scan"',
                            'Scan QR Code yang ditampilkan di halaman pembayaran',
                            'Pastikan nominal pembayaran sudah sesuai',
                            'Tap tombol "Bayar"',
                            'Masukkan PIN DANA',
                            'Transaksi selesai'
                        ]
                    ];
                case 'ovo':
                    return [
                        'title' => 'OVO',
                        'steps' => [
                            'Buka aplikasi OVO',
                            'Tap "Scan"',
                            'Scan QR Code yang ditampilkan di halaman pembayaran',
                            'Pastikan nominal pembayaran sudah sesuai',
                            'Tap tombol "Bayar"',
                            'Masukkan PIN OVO',
                            'Transaksi selesai'
                        ]
                    ];
                default:
                    return [
                        'title' => 'E-Wallet Payment',
                        'steps' => [
                            'Buka aplikasi e-wallet',
                            'Gunakan fitur scan QR',
                            'Scan QR code yang ditampilkan',
                            'Verifikasi jumlah pembayaran',
                            'Konfirmasi pembayaran',
                            'Masukkan PIN atau verifikasi lainnya',
                            'Transaksi selesai'
                        ]
                    ];
            }
        }
        // Instruksi pembayaran untuk Credit Card
        else if ($paymentType == 'credit_card') {
            return [
                'title' => 'Credit Card Payment',
                'steps' => [
                    'Isi data kartu kredit pada form yang disediakan',
                    'Pastikan data yang dimasukkan valid',
                    'Jika diminta, ikuti proses 3D Secure untuk verifikasi tambahan',
                    'Tunggu hingga proses verifikasi selesai',
                    'Anda akan diarahkan kembali ke halaman status pembayaran'
                ]
            ];
        }
        // QRIS
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

        // Default instruksi jika tipe pembayaran tidak dikenali
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
     * Request refund to Midtrans
     */
    public function requestRefund($transactionId, $amount, $reason)
    {
        try {
            // Cek metode pembayaran dari transaction ID
            $transaction = $this->getStatus($transactionId);
            $paymentType = $transaction['payment_type'] ?? '';

            // List metode pembayaran yang didukung refund otomatis
            $supportedRefundMethods = [
                'credit_card',
                'gopay',
                'shopeepay',
                'qris',
                'kredivo',
                'akulaku'
            ];

            // Jika metode pembayaran tidak didukung refund otomatis
            if (!in_array($paymentType, $supportedRefundMethods)) {
                // Catat sebagai refund manual dan kembalikan response sukses simulasi
                Log::info('Refund request recorded for manual processing', [
                    'transaction_id' => $transactionId,
                    'amount' => $amount,
                    'reason' => $reason,
                    'payment_type' => $paymentType
                ]);

                return [
                    'status_code' => '200',
                    'status_message' => 'Success, manual refund request is recorded',
                    'transaction_id' => $transactionId,
                    'payment_type' => $paymentType,
                    'transaction_time' => now()->format('Y-m-d H:i:s'),
                    'transaction_status' => 'pending_refund',
                    'refund_amount' => $amount,
                    'refund_key' => 'manual-' . Str::random(10),
                    'requires_manual_process' => true
                ];
            }

            // Jika metode pembayaran didukung, lakukan refund otomatis via Midtrans
            $url = $this->getBaseUrl() . "/{$transactionId}/refund";
            $payload = [
                'refund_key' => 'ref-' . Str::random(10),
                'amount' => $amount,
                'reason' => $reason
            ];

            $response = Http::withHeaders($this->getHeaders())
                ->post($url, $payload);

            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('Midtrans refund failed', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Midtrans refund failed: ' . $e->getMessage());
        }
    }

    /**
     * Check refund status
     */
    public function checkRefundStatus($refundKey)
    {
        $url = $this->getBaseUrl() . '/refund/' . $refundKey;

        $response = Http::withHeaders($this->getHeaders())
            ->get($url);

        $responseData = $response->json();

        Log::info('Midtrans refund status check', [
            'refund_key' => $refundKey,
            'response' => $responseData
        ]);

        if ($response->successful()) {
            return $responseData;
        } else {
            throw new \Exception('Midtrans refund status check failed: ' . ($responseData['status_message'] ?? 'Unknown error'));
        }
    }

    /**
     * Cancel a pending refund
     */
    public function cancelRefund($refundKey)
    {
        $url = $this->getBaseUrl() . '/refund/' . $refundKey . '/cancel';

        $response = Http::withHeaders($this->getHeaders())
            ->post($url);

        $responseData = $response->json();

        Log::info('Midtrans refund cancellation', [
            'refund_key' => $refundKey,
            'response' => $responseData
        ]);

        if ($response->successful()) {
            return $responseData;
        } else {
            throw new \Exception('Midtrans refund cancellation failed: ' . ($responseData['status_message'] ?? 'Unknown error'));
        }
    }

    /**
     * Get Midtrans API base URL based on environment
     */
    private function getBaseUrl()
    {
        $isProduction = env('MIDTRANS_PRODUCTION', false);

        if ($isProduction) {
            return 'https://api.midtrans.com/v2';
        } else {
            return 'https://api.sandbox.midtrans.com/v2';
        }
    }

    /**
     * Get headers for Midtrans API
     */
    private function getHeaders()
    {
        $serverKey = env('MIDTRANS_SERVER_KEY', '');
        $auth = base64_encode($serverKey . ':');

        return [
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            'Authorization' => 'Basic ' . $auth
        ];
    }
}
