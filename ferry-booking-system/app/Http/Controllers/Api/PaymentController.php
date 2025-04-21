<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Membuat transaksi pembayaran baru
     *
     * @param Request $request
     * @param string $bookingCode
     * @return \Illuminate\Http\JsonResponse
     */
    public function create(Request $request, $bookingCode)
    {
        Log::info('Payment create request received', [
            'booking_code' => $bookingCode,
            'user_id' => $request->user()->id
        ]);

        $user = $request->user();
        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $user->id)
            ->where('status', 'PENDING')
            ->firstOrFail();

        // Cek apakah sudah ada payment yang aktif
        $activePayment = Payment::where('booking_id', $booking->id)
            ->whereIn('status', ['PENDING'])
            ->first();

        if ($activePayment) {
            Log::info('Active payment already exists', [
                'booking_code' => $bookingCode,
                'payment_id' => $activePayment->id,
                'snap_token' => $activePayment->snap_token
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran sudah dibuat',
                'data' => [
                    'payment' => $activePayment,
                    'snap_token' => $activePayment->snap_token
                ]
            ], 200);
        }

        // Buat transaksi baru
        Log::info('Creating new Midtrans transaction', [
            'booking_code' => $bookingCode,
            'amount' => $booking->total_amount
        ]);

        $snapToken = $this->midtransService->createTransaction($booking);

        if (!$snapToken) {
            Log::error('Failed to create Midtrans transaction', [
                'booking_code' => $bookingCode
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pembayaran'
            ], 500);
        }

        // Simpan data pembayaran
        $payment = new Payment();
        $payment->booking_id = $booking->id;
        $payment->amount = $booking->total_amount;
        $payment->status = 'PENDING';
        $payment->payment_method = 'VIRTUAL_ACCOUNT'; // Default payment method
        $payment->payment_channel = 'MIDTRANS';
        $payment->expiry_date = now()->addHours(config('midtrans.expiry_duration', 24));

        // PERBAIKAN: Simpan Snap Token terpisah dari transaction_id
        $payment->snap_token = $snapToken;
        // transaction_id akan diupdate setelah mendapat callback dari Midtrans

        $payment->save();

        Log::info('Payment created successfully', [
            'booking_code' => $bookingCode,
            'payment_id' => $payment->id,
            'snap_token' => $snapToken
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dibuat',
            'data' => [
                'payment' => $payment,
                'snap_token' => $snapToken
            ]
        ], 201);
    }

    /**
     * Mengambil status pembayaran
     *
     * @param Request $request
     * @param string $bookingCode
     * @return \Illuminate\Http\JsonResponse
     */
    public function status(Request $request, $bookingCode)
    {
        Log::info('Payment status check requested', [
            'booking_code' => $bookingCode,
            'user_id' => $request->user()->id
        ]);

        $user = $request->user();
        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $payment = Payment::where('booking_id', $booking->id)
            ->latest()
            ->first();

        if (!$payment) {
            Log::warning('Payment not found', [
                'booking_code' => $bookingCode
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Pembayaran tidak ditemukan'
            ], 404);
        }

        // PERBAIKAN: Periksa status menggunakan order_id (booking_code), bukan transaction_id
        if ($payment->status === 'PENDING') {
            Log::info('Checking Midtrans for payment status', [
                'booking_code' => $bookingCode,
                'payment_id' => $payment->id,
                'transaction_id' => $payment->transaction_id,
                'current_status' => $payment->status
            ]);

            // Gunakan order_id (booking_code) untuk cek status
            $midtransStatus = $this->midtransService->getTransactionStatus($bookingCode);

            // Update status pembayaran berdasarkan respon Midtrans
            if ($midtransStatus) {
                Log::info('Midtrans status received', [
                    'booking_code' => $bookingCode,
                    'transaction_status' => $midtransStatus->transaction_status ?? 'unknown'
                ]);

                $this->midtransService->updatePaymentStatus($payment, (array) $midtransStatus);
            } else {
                Log::warning('No status from Midtrans', [
                    'booking_code' => $bookingCode
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pembayaran berhasil diambil',
            'data' => $payment->fresh()
        ], 200);
    }

    /**
     * Callback untuk notifikasi dari Midtrans
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function notification(Request $request)
    {
        $notification = $request->all();

        Log::info('Midtrans notification received', [
            'order_id' => $notification['order_id'] ?? 'unknown',
            'transaction_status' => $notification['transaction_status'] ?? 'unknown'
        ]);

        // PERBAIKAN: Log raw data untuk debugging
        Log::debug('Raw notification payload', [
            'headers' => $request->headers->all(),
            'body' => $notification
        ]);

        // Verifikasi notifikasi dari Midtrans
        $isVerified = $this->midtransService->verifyNotification($notification);

        if (!$isVerified) {
            Log::warning('Invalid Midtrans notification signature', [
                'order_id' => $notification['order_id'] ?? 'unknown'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Signature key tidak valid'
            ], 403);
        }

        // Proses notifikasi - Gunakan order_id yang merupakan booking_code
        $orderId = $notification['order_id']; // Ini adalah booking_code

        Log::info('Processing verified notification', [
            'order_id' => $orderId
        ]);

        $booking = Booking::where('booking_code', $orderId)->first();

        if (!$booking) {
            Log::warning('Booking not found for Midtrans notification', [
                'order_id' => $orderId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan'
            ], 404);
        }

        $payment = Payment::where('booking_id', $booking->id)
            ->latest()
            ->first();

        if (!$payment) {
            Log::warning('Payment not found for Midtrans notification', [
                'order_id' => $orderId,
                'booking_id' => $booking->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Pembayaran tidak ditemukan'
            ], 404);
        }

        // Update status pembayaran
        $this->midtransService->updatePaymentStatus($payment, $notification);

        Log::info('Payment status updated from notification', [
            'order_id' => $orderId,
            'new_status' => $payment->fresh()->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil diproses'
        ], 200);
    }

    /**
     * Membatalkan pembayaran
     *
     * @param Request $request
     * @param string $bookingCode
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancel(Request $request, $bookingCode)
    {
        Log::info('Payment cancellation requested', [
            'booking_code' => $bookingCode,
            'user_id' => $request->user()->id
        ]);

        $user = $request->user();
        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $user->id)
            ->where('status', 'PENDING')
            ->firstOrFail();

        $payment = Payment::where('booking_id', $booking->id)
            ->where('status', 'PENDING')
            ->latest()
            ->first();

        if (!$payment) {
            Log::warning('No active payment to cancel', [
                'booking_code' => $bookingCode
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Tidak ada pembayaran aktif untuk dibatalkan'
            ], 404);
        }

        // Update status payment dan booking
        $payment->status = 'FAILED';
        $payment->save();

        $booking->status = 'CANCELLED';
        $booking->cancellation_reason = 'Dibatalkan oleh pengguna';
        $booking->save();

        Log::info('Payment cancelled successfully', [
            'booking_code' => $bookingCode,
            'payment_id' => $payment->id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dibatalkan',
            'data' => $payment->fresh()
        ], 200);
    }

    /**
     * Mengambil instruksi pembayaran
     *
     * @param Request $request
     * @param string $paymentMethod
     * @param string $paymentType
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInstructions(Request $request, $paymentMethod, $paymentType)
    {
        Log::info('Payment instructions requested', [
            'payment_method' => $paymentMethod,
            'payment_type' => $paymentType
        ]);

        $instructions = $this->midtransService->getPaymentInstructions($paymentMethod, $paymentType);

        return response()->json([
            'success' => true,
            'message' => 'Instruksi pembayaran berhasil diambil',
            'data' => $instructions
        ], 200);
    }

    /**
     * Debug untuk membantu troubleshooting transaksi
     *
     * @param string $bookingCode
     * @return \Illuminate\Http\JsonResponse
     */
    public function debug($bookingCode)
    {
        try {
            $booking = Booking::where('booking_code', $bookingCode)->firstOrFail();
            $payment = Payment::where('booking_id', $booking->id)->latest()->first();

            // Get status from Midtrans
            $midtransStatus = $this->midtransService->getTransactionStatus($bookingCode);

            // Get base64 authorization for testing
            $serverKey = config('midtrans.server_key');
            $authString = base64_encode($serverKey . ':');

            // Check curl endpoint
            $checkCommand = "curl -X GET " .
                "https://api.sandbox.midtrans.com/v2/{$bookingCode}/status " .
                "-H 'Accept: application/json' " .
                "-H 'Authorization: Basic {$authString}' " .
                "-H 'Content-Type: application/json'";

            return response()->json([
                'success' => true,
                'booking' => $booking,
                'payment' => $payment,
                'midtrans_status' => $midtransStatus,
                'config' => [
                    'notification_url' => config('midtrans.notification_url'),
                    'server_key_exists' => !empty(config('midtrans.server_key')),
                    'server_key_prefix' => substr(config('midtrans.server_key'), 0, 10) . '...',
                    'is_production' => config('midtrans.is_production'),
                ],
                'test_curl' => $checkCommand
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
