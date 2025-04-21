<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;
use Midtrans\Notification;

class MidtransService
{
    public function __construct()
    {
        // Set konfigurasi Midtrans menggunakan namespace yang sudah diimpor
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;

        // Logging konfigurasi untuk membantu debugging
        Log::info('Midtrans configuration initialized', [
            'is_production' => Config::$isProduction,
            'server_key_exists' => !empty(Config::$serverKey),
            'app_url' => config('app.url'),
            'notification_url' => config('midtrans.notification_url'),
        ]);
    }

    /**
     * Membuat transaksi baru di Midtrans
     *
     * @param Booking $booking
     * @return string|null Snap token
     */
    public function createTransaction(Booking $booking)
    {
        // PENTING: Menggunakan order_id yang unik (booking_code) untuk identifikasi transaksi
        $orderId = $booking->booking_code;

        // Log awal pembuatan transaksi
        Log::info('Creating Midtrans transaction', [
            'order_id' => $orderId,
            'gross_amount' => $booking->total_amount,
            'customer_name' => $booking->user->name,
        ]);

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) $booking->total_amount,
            ],
            'customer_details' => [
                'first_name' => $booking->user->name,
                'email' => $booking->user->email,
                'phone' => $booking->user->phone,
            ],
            'item_details' => [
                [
                    'id' => $booking->schedule->id,
                    'price' => (int) $booking->total_amount,
                    'quantity' => 1,
                    'name' => 'Tiket Ferry ' . $booking->schedule->route->origin . ' - ' . $booking->schedule->route->destination,
                ]
            ],
            'expiry' => [
                'unit' => 'hour',
                'duration' => (int) config('midtrans.expiry_duration', 24),
            ],
        ];

        if (!app()->environment('local') || !empty(config('midtrans.notification_url'))) {
            $params['callbacks'] = [
                'finish' => url(config('midtrans.finish_url')),
                'unfinish' => url(config('midtrans.unfinish_url')),
                'error' => url(config('midtrans.error_url')),
            ];
        }

        // Log parameter transaksi untuk debugging
        Log::debug('Midtrans transaction parameters', [
            'params' => $params,
            'notification_url' => Config::$isProduction ?
                config('midtrans.notification_url') :
                str_replace('localhost', 'your-public-domain.com', config('midtrans.notification_url'))
        ]);

        try {
            // Membuat Snap Token
            $snapToken = Snap::getSnapToken($params);

            // PERBAIKAN: Log response lengkap untuk debugging
            Log::info('Midtrans transaction created successfully', [
                'order_id' => $orderId,
                'snap_token' => $snapToken,
                'amount' => $booking->total_amount
            ]);

            return $snapToken;
        } catch (\Exception $e) {
            Log::error('Error creating Midtrans transaction', [
                'order_id' => $orderId,
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'trace' => $e->getTraceAsString()
            ]);

            return null;
        }
    }

    /**
     * Mendapatkan status transaksi dari Midtrans
     *
     * @param string $orderIdOrTransactionId - Bisa order_id (booking_code) atau transaction_id
     * @return object|null
     */
    public function getTransactionStatus($orderIdOrTransactionId)
    {
        try {
            Log::info('Fetching Midtrans transaction status', [
                'id' => $orderIdOrTransactionId
            ]);

            $status = Transaction::status($orderIdOrTransactionId);

            // Log status transaksi untuk debugging
            Log::info('Midtrans transaction status fetched', [
                'id' => $orderIdOrTransactionId,
                'transaction_status' => $status->transaction_status ?? 'unknown',
                'fraud_status' => $status->fraud_status ?? 'unknown',
                'payment_type' => $status->payment_type ?? 'unknown',
                'full_response' => json_encode($status)
            ]);

            return $status;
        } catch (\Exception $e) {
            Log::error('Error getting Midtrans transaction status', [
                'id' => $orderIdOrTransactionId,
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode()
            ]);

            return null;
        }
    }

    /**
     * Memverifikasi notifikasi dari Midtrans menggunakan pendekatan yang lebih aman
     *
     * @param array $notification Data notifikasi dari Midtrans
     * @return bool
     */
    public function verifyNotification($notification)
    {
        try {
            Log::info('Verifying Midtrans notification', [
                'order_id' => $notification['order_id'] ?? 'unknown',
                'transaction_status' => $notification['transaction_status'] ?? 'unknown'
            ]);

            // PERBAIKAN: Simpan JSON notifikasi mentah untuk debugging
            Log::debug('Raw notification data', [
                'notification' => $notification
            ]);

            // Metode 1: Verifikasi menggunakan kelas Notification
            if (isset($notification['order_id']) && isset($notification['status_code']) && isset($notification['gross_amount'])) {
                try {
                    // Simulasi objek notifikasi dengan mengatur properti yang diperlukan
                    $_SERVER['HTTP_X_SIGNATURE_KEY'] = $notification['signature_key'] ?? '';

                    // Coba buat instance Notification (akan throw exception jika tidak valid)
                    $notificationObj = new Notification();
                    Log::info('Notification verified using Notification class');
                    return true;
                } catch (\Exception $e) {
                    Log::warning('Failed to verify using Notification class, falling back to manual verification', [
                        'error' => $e->getMessage()
                    ]);
                    // Lanjut ke metode verifikasi manual jika gagal
                }
            }

            // Metode 2: Verifikasi manual signature
            if (isset($notification['order_id']) && isset($notification['status_code']) && isset($notification['gross_amount']) && isset($notification['signature_key'])) {
                $orderId = $notification['order_id'];
                $statusCode = $notification['status_code'];
                $grossAmount = $notification['gross_amount'];
                $serverKey = config('midtrans.server_key');
                $signature = $notification['signature_key'];

                // Buat signature yang diharapkan
                $input = $orderId . $statusCode . $grossAmount . $serverKey;
                $expectedSignature = hash('sha512', $input);

                $isValid = ($signature === $expectedSignature);

                Log::info('Manual signature verification result', [
                    'is_valid' => $isValid,
                    'order_id' => $orderId
                ]);

                return $isValid;
            }

            Log::warning('Cannot verify notification - missing required fields', [
                'has_order_id' => isset($notification['order_id']),
                'has_status_code' => isset($notification['status_code']),
                'has_gross_amount' => isset($notification['gross_amount']),
                'has_signature' => isset($notification['signature_key'])
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Error verifying Midtrans notification', [
                'order_id' => $notification['order_id'] ?? 'unknown',
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Memperbarui status pembayaran berdasarkan notifikasi dari Midtrans
     *
     * @param Payment $payment
     * @param array $notification
     * @return void
     */
    public function updatePaymentStatus(Payment $payment, $notification)
    {
        $booking = $payment->booking;
        $transactionStatus = $notification['transaction_status'];
        $fraudStatus = $notification['fraud_status'] ?? null;

        // Log untuk debugging
        Log::info('Updating payment status from Midtrans notification', [
            'booking_code' => $booking->booking_code,
            'payment_id' => $payment->id,
            'transaction_status' => $transactionStatus,
            'fraud_status' => $fraudStatus,
            'current_payment_status' => $payment->status,
            'current_booking_status' => $booking->status
        ]);

        // Simpan data notifikasi lengkap
        $payment->payload = json_encode($notification);

        // PERBAIKAN: Update transaction_id dengan transaction_id dari Midtrans (bukan snap token)
        if (!$payment->transaction_id && isset($notification['transaction_id'])) {
            $payment->transaction_id = $notification['transaction_id'];
            Log::info('Updated transaction ID', [
                'payment_id' => $payment->id,
                'transaction_id' => $notification['transaction_id']
            ]);
        }

        // Update metode pembayaran berdasarkan notifikasi
        if (isset($notification['payment_type'])) {
            $payment->payment_method = $this->mapPaymentMethod($notification['payment_type']);
            $payment->payment_channel = $notification['payment_type'];

            // Simpan informasi referensi eksternal
            $this->setExternalReference($payment, $notification);

            Log::info('Updated payment method', [
                'payment_id' => $payment->id,
                'payment_method' => $payment->payment_method,
                'payment_channel' => $payment->payment_channel
            ]);
        }

        // Update status pembayaran berdasarkan status Midtrans
        $previousStatus = $payment->status;

        switch ($transactionStatus) {
            case 'capture':
                // Capture hanya untuk kartu kredit - periksa fraud status
                if ($fraudStatus == 'challenge') {
                    $payment->status = 'CHALLENGE';
                } else if ($fraudStatus == 'accept') {
                    $payment->status = 'SUCCESS';
                    $payment->payment_date = now();
                    $booking->status = 'CONFIRMED';
                }
                break;
            case 'settlement':
                $payment->status = 'SUCCESS';
                $payment->payment_date = isset($notification['settlement_time'])
                    ? date('Y-m-d H:i:s', strtotime($notification['settlement_time']))
                    : now();
                $booking->status = 'CONFIRMED';
                break;
            case 'deny':
                $payment->status = 'FAILED';
                if ($booking->status == 'PENDING') {
                    $booking->status = 'CANCELLED';
                    $booking->cancellation_reason = 'Pembayaran ditolak';
                }
                break;
            case 'cancel':
                $payment->status = 'FAILED';
                if ($booking->status == 'PENDING') {
                    $booking->status = 'CANCELLED';
                    $booking->cancellation_reason = 'Pembayaran dibatalkan';
                }
                break;
            case 'expire':
                $payment->status = 'FAILED';
                if ($booking->status == 'PENDING') {
                    $booking->status = 'CANCELLED';
                    $booking->cancellation_reason = 'Pembayaran kedaluwarsa';
                }
                break;
            case 'pending':
                $payment->status = 'PENDING';

                // Set expire date if available
                if (isset($notification['expiry_time'])) {
                    $payment->expiry_date = date('Y-m-d H:i:s', strtotime($notification['expiry_time']));
                }
                break;
            case 'refund':
                $payment->status = 'REFUNDED';
                $payment->refund_amount = $notification['refund_amount'] ?? $payment->amount;
                $payment->refund_date = now();
                break;
        }

        // Log perubahan status
        Log::info('Payment status updated', [
            'booking_code' => $booking->booking_code,
            'payment_id' => $payment->id,
            'previous_status' => $previousStatus,
            'new_status' => $payment->status,
            'booking_status' => $booking->status
        ]);

        // Simpan perubahan
        $payment->save();
        $booking->save();
    }

    /**
     * Mengatur referensi eksternal berdasarkan tipe pembayaran
     *
     * @param Payment $payment
     * @param array $notification
     * @return void
     */
    private function setExternalReference(Payment $payment, $notification)
    {
        $paymentType = $notification['payment_type'];

        switch ($paymentType) {
            case 'bank_transfer':
                // Virtual Account
                if (isset($notification['va_numbers']) && !empty($notification['va_numbers'])) {
                    $vaInfo = $notification['va_numbers'][0];
                    $payment->external_reference = $vaInfo['bank'] . ' ' . $vaInfo['va_number'];

                    // PERBAIKAN: Simpan nomor VA sebagai virtual_account_number jika kolom tersedia
                    if (isset($payment->virtual_account_number)) {
                        $payment->virtual_account_number = $vaInfo['va_number'];
                    }
                } elseif (isset($notification['permata_va_number'])) {
                    // Khusus untuk Permata Bank
                    $payment->external_reference = 'permata ' . $notification['permata_va_number'];

                    // PERBAIKAN: Simpan nomor VA sebagai virtual_account_number
                    if (isset($payment->virtual_account_number)) {
                        $payment->virtual_account_number = $notification['permata_va_number'];
                    }
                }
                break;

            case 'echannel':
                // Mandiri Bill Payment
                if (isset($notification['bill_key']) && isset($notification['biller_code'])) {
                    $payment->external_reference = 'mandiri ' . $notification['biller_code'] . ' ' . $notification['bill_key'];
                }
                break;

            case 'gopay':
            case 'shopeepay':
                // E-wallet - simpan ID transaksi
                if (isset($notification['transaction_id'])) {
                    $payment->external_reference = $paymentType . ' ' . $notification['transaction_id'];
                }

                // PERBAIKAN: Simpan QR Code dan deep link URL jika tersedia
                if (isset($notification['qr_code_url']) && isset($payment->qr_code_url)) {
                    $payment->qr_code_url = $notification['qr_code_url'];
                }

                if (isset($notification['deep_link_url']) && isset($payment->deep_link_url)) {
                    $payment->deep_link_url = $notification['deep_link_url'];
                }
                break;

            case 'cstore':
                // Convenience Store
                if (isset($notification['payment_code'])) {
                    $payment->external_reference = $notification['store'] . ' ' . $notification['payment_code'];
                }
                break;

            case 'credit_card':
                // Kartu Kredit
                if (isset($notification['masked_card'])) {
                    $payment->external_reference = $notification['bank'] . ' ' . $notification['masked_card'];
                }
                break;
        }

        // Log referensi eksternal untuk debugging
        Log::info('External reference set', [
            'payment_id' => $payment->id,
            'payment_type' => $paymentType,
            'external_reference' => $payment->external_reference
        ]);
    }

    /**
     * Memetakan tipe pembayaran Midtrans ke format internal aplikasi
     *
     * @param string $paymentType
     * @return string
     */
    private function mapPaymentMethod($paymentType)
    {
        $mapping = [
            'credit_card' => 'CREDIT_CARD',
            'bank_transfer' => 'VIRTUAL_ACCOUNT',
            'echannel' => 'VIRTUAL_ACCOUNT',
            'gopay' => 'E_WALLET',
            'shopeepay' => 'E_WALLET',
            'cstore' => 'CASH',
            'qris' => 'E_WALLET',
            'bca_klikpay' => 'DIRECT_DEBIT',
            'bca_klikbca' => 'DIRECT_DEBIT',
            'cimb_clicks' => 'DIRECT_DEBIT',
            'danamon_online' => 'DIRECT_DEBIT',
            'akulaku' => 'CREDIT',
        ];

        return $mapping[$paymentType] ?? 'VIRTUAL_ACCOUNT';
    }

    /**
     * Mendapatkan instruksi pembayaran berdasarkan metode pembayaran
     *
     * @param string $paymentMethod BCA, BNI, MANDIRI, dll
     * @param string $paymentType virtual_account, e_wallet, dll
     * @return array
     */
    public function getPaymentInstructions($paymentMethod, $paymentType)
    {
        // Default instruksi
        $instructions = [
            'title' => 'Cara Pembayaran ' . strtoupper($paymentMethod),
            'steps' => []
        ];

        // Instruksi berdasarkan metode pembayaran
        if ($paymentType == 'virtual_account') {
            switch (strtolower($paymentMethod)) {
                case 'bca':
                    $instructions['steps'] = [
                        'Buka aplikasi BCA Mobile atau m-BCA',
                        'Pilih menu "m-Transfer" atau "Transfer"',
                        'Pilih "BCA Virtual Account"',
                        'Masukkan nomor Virtual Account',
                        'Pastikan nama dan jumlah pembayaran sudah sesuai',
                        'Masukkan PIN m-BCA atau password',
                        'Transaksi selesai'
                    ];
                    break;
                case 'bni':
                    $instructions['steps'] = [
                        'Buka aplikasi BNI Mobile Banking',
                        'Pilih menu "Transfer"',
                        'Pilih "Virtual Account Billing"',
                        'Masukkan nomor Virtual Account',
                        'Pastikan detail pembayaran sudah benar',
                        'Masukkan PIN Mobile Banking',
                        'Transaksi selesai'
                    ];
                    break;
                case 'mandiri':
                    $instructions['steps'] = [
                        'Buka aplikasi Livin by Mandiri',
                        'Pilih menu "Bayar"',
                        'Pilih "Multipayment"',
                        'Masukkan kode perusahaan (biller code)',
                        'Masukkan nomor Virtual Account',
                        'Pastikan detail pembayaran sudah benar',
                        'Masukkan PIN',
                        'Transaksi selesai'
                    ];
                    break;
                default:
                    $instructions['steps'] = [
                        'Buka aplikasi Mobile Banking',
                        'Pilih menu Transfer',
                        'Pilih Virtual Account',
                        'Masukkan nomor Virtual Account',
                        'Pastikan detail pembayaran sudah benar',
                        'Masukkan PIN',
                        'Transaksi selesai'
                    ];
            }
        } elseif ($paymentType == 'e_wallet') {
            switch (strtolower($paymentMethod)) {
                case 'gopay':
                    $instructions['steps'] = [
                        'Buka aplikasi Gojek',
                        'Pilih menu "Bayar"',
                        'Scan QR Code atau klik "Bayar dari link"',
                        'Masukkan PIN GoPay',
                        'Transaksi selesai'
                    ];
                    break;
                case 'shopeepay':
                    $instructions['steps'] = [
                        'Buka aplikasi Shopee',
                        'Pilih menu "ShopeePay"',
                        'Scan QR Code atau klik tombol "Bayar"',
                        'Konfirmasi pembayaran',
                        'Masukkan PIN ShopeePay',
                        'Transaksi selesai'
                    ];
                    break;
                default:
                    $instructions['steps'] = [
                        'Buka aplikasi e-wallet Anda',
                        'Pilih menu pembayaran',
                        'Scan QR Code atau klik tombol bayar',
                        'Konfirmasi pembayaran',
                        'Masukkan PIN',
                        'Transaksi selesai'
                    ];
            }
        }

        return $instructions;
    }
}
