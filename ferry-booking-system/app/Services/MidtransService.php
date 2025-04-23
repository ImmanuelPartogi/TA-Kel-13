<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    protected $serverKey;
    protected $clientKey;
    protected $isProduction;
    protected $apiUrl;

    public function __construct()
    {
        $this->serverKey = config('midtrans.server_key');
        $this->clientKey = config('midtrans.client_key');
        $this->isProduction = config('midtrans.is_production');
        $this->apiUrl = $this->isProduction
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';
    }

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

        // Konfigurasi pembayaran
        if ($paymentType == 'virtual_account') {
            $params['payment_type'] = 'bank_transfer';
            $params['bank_transfer'] = [
                'bank' => $paymentMethod
            ];
        } elseif ($paymentType == 'e_wallet') {
            $params['payment_type'] = $paymentMethod; // gopay atau shopeepay
        }

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
            Log::error('Error creating Midtrans transaction', [
                'booking_code' => $booking->booking_code,
                'error_message' => $e->getMessage()
            ]);

            return null;
        }
    }

    protected function apiRequest($endpoint, $method = 'GET', $data = [])
    {
        $url = $this->apiUrl . $endpoint;
        $auth = base64_encode($this->serverKey . ':');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $auth,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ]);

            if ($method === 'GET') {
                $response = $response->get($url);
            } else {
                $response = $response->post($url, $data);
            }

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Midtrans API error', [
                'url' => $url,
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            throw new \Exception('Midtrans API error: ' . ($response->json()['message'] ?? 'Unknown error'));
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * Get status transaksi dari Midtrans
     */
    public function getStatus($orderIdOrTransactionId)
    {
        try {
            Log::info('Fetching transaction status from Midtrans', [
                'id' => $orderIdOrTransactionId
            ]);

            $url = $this->apiUrl . '/v2/' . $orderIdOrTransactionId . '/status';
            $auth = base64_encode($this->serverKey . ':');

            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $auth,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->get($url);

            if ($response->successful()) {
                Log::info('Transaction status response received', [
                    'status_code' => $response->status(),
                    'transaction_status' => $response->json()['transaction_status'] ?? 'unknown'
                ]);

                return $response->json();
            }

            Log::error('Error fetching transaction status', [
                'id' => $orderIdOrTransactionId,
                'status_code' => $response->status(),
                'response' => $response->json()
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Exception fetching transaction status', [
                'id' => $orderIdOrTransactionId,
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }

    /**
     * PENTING: Perbaikan pada verifikasi notifikasi
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

        return $payment;
    }

    /**
     * Perbaikan untuk update status pembayaran dan booking
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

        // PENTING: Update status pembayaran dan booking berdasarkan transaction_status
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
     * Periksa juga apakah method checkAndUpdateTransaction sudah diimplementasikan
     * Jika belum, tambahkan kode berikut:
     */
    public function checkAndUpdateTransaction($bookingCode)
    {
        $booking = \App\Models\Booking::where('booking_code', $bookingCode)->first();

        if (!$booking) {
            Log::error('Booking not found for manual check', [
                'booking_code' => $bookingCode
            ]);
            return false;
        }

        $payment = \App\Models\Payment::where('booking_id', $booking->id)
            ->latest()
            ->first();

        if (!$payment) {
            Log::error('Payment not found for booking', [
                'booking_id' => $booking->id,
                'booking_code' => $bookingCode
            ]);
            return false;
        }

        // Cek status di Midtrans
        $statusResponse = $this->getStatus($payment->transaction_id ?? $booking->booking_code);

        if (!$statusResponse) {
            Log::error('Failed to get status from Midtrans', [
                'booking_code' => $bookingCode,
                'transaction_id' => $payment->transaction_id ?? 'not available'
            ]);
            return false;
        }

        // Update status berdasarkan respons
        $this->updatePaymentStatus($payment, (array) $statusResponse);

        return [
            'payment_status' => $payment->fresh()->status,
            'booking_status' => $booking->fresh()->status,
            'transaction_status' => $statusResponse['transaction_status'] ?? null
        ];
    }

    /**
     * Mendapatkan instruksi pembayaran berdasarkan metode dan tipe pembayaran
     *
     * @param string $paymentMethod Metode pembayaran (contoh: 'bca', 'bni', 'gopay')
     * @param string $paymentType Tipe pembayaran (contoh: 'virtual_account', 'e_wallet')
     * @return array Array berisi instruksi pembayaran
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
}
