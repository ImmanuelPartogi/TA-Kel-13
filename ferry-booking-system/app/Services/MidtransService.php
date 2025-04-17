<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;

class MidtransService
{
    public function __construct()
    {
        // Set konfigurasi Midtrans
        \Midtrans\Config::$serverKey = config('midtrans.server_key');
        \Midtrans\Config::$isProduction = config('midtrans.is_production');
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;
    }

    public function createTransaction(Booking $booking)
    {
        $params = [
            'transaction_details' => [
                'order_id' => $booking->booking_code,
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
            'callbacks' => [
                'finish' => config('midtrans.finish_url'),
                'unfinish' => config('midtrans.unfinish_url'),
                'error' => config('midtrans.error_url'),
            ]
        ];

        try {
            // Membuat Snap Token
            $snapToken = \Midtrans\Snap::getSnapToken($params);
            return $snapToken;
        } catch (\Exception $e) {
            Log::error('Error creating Midtrans transaction: ' . $e->getMessage());
            return null;
        }
    }

    public function getTransactionStatus($transactionId)
    {
        try {
            $status = \Midtrans\Transaction::status($transactionId);
            return $status;
        } catch (\Exception $e) {
            Log::error('Error getting Midtrans transaction status: ' . $e->getMessage());
            return null;
        }
    }

    public function verifyNotification($notification)
    {
        try {
            // Verify signature
            $orderId = $notification['order_id'];
            $statusCode = $notification['status_code'];
            $grossAmount = $notification['gross_amount'];
            $serverKey = config('midtrans.server_key');
            $signature = $notification['signature_key'];

            $input = $orderId . $statusCode . $grossAmount . $serverKey;
            $expectedSignature = hash('sha512', $input);

            return $signature === $expectedSignature;
        } catch (\Exception $e) {
            Log::error('Error verifying Midtrans notification: ' . $e->getMessage());
            return false;
        }
    }

    public function updatePaymentStatus(Payment $payment, $notification)
    {
        $booking = $payment->booking;
        $transactionStatus = $notification['transaction_status'];
        $fraudStatus = $notification['fraud_status'] ?? null;

        // Save notification data
        $payment->payload = json_encode($notification);

        // Update transaction_id if not yet set
        if (!$payment->transaction_id && isset($notification['transaction_id'])) {
            $payment->transaction_id = $notification['transaction_id'];
        }

        if (isset($notification['payment_type'])) {
            $payment->payment_method = $this->mapPaymentMethod($notification['payment_type']);
            $payment->payment_channel = $notification['payment_type'];

            // For VA, store VA number
            if ($notification['payment_type'] == 'bank_transfer' && isset($notification['va_numbers'][0])) {
                $payment->external_reference = $notification['va_numbers'][0]['bank'] . ' ' . $notification['va_numbers'][0]['va_number'];
            }
        }

        // Update payment status based on Midtrans status
        switch ($transactionStatus) {
            case 'capture':
            case 'settlement':
                $payment->status = 'SUCCESS';
                $payment->payment_date = now();
                $booking->status = 'CONFIRMED';
                break;
            case 'deny':
            case 'cancel':
            case 'expire':
                $payment->status = 'FAILED';
                if ($booking->status == 'PENDING') {
                    $booking->status = 'CANCELLED';
                    $booking->cancellation_reason = 'Pembayaran ' . $transactionStatus;
                }
                break;
            case 'pending':
                $payment->status = 'PENDING';
                break;
        }

        $payment->save();
        $booking->save();
    }

    private function mapPaymentMethod($paymentType)
    {
        $mapping = [
            'credit_card' => 'CREDIT_CARD',
            'bank_transfer' => 'VIRTUAL_ACCOUNT',
            'echannel' => 'VIRTUAL_ACCOUNT',
            'gopay' => 'E_WALLET',
            'shopeepay' => 'E_WALLET',
            'cstore' => 'CASH',
        ];

        return $mapping[$paymentType] ?? 'VIRTUAL_ACCOUNT';
    }
}
