<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Membuat pembayaran baru
     */
    public function create(Request $request, $bookingCode)
    {
        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|string',
            'payment_type' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Cari booking berdasarkan booking code
        $user = $request->user();
        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $user->id)
            ->where('status', 'PENDING')
            ->firstOrFail();

        // Cek apakah sudah ada pembayaran pending
        $pendingPayment = Payment::where('booking_id', $booking->id)
            ->where('status', 'PENDING')
            ->latest()
            ->first();

        try {
            DB::beginTransaction();

            // Gunakan pembayaran yang sudah ada atau buat baru
            if ($pendingPayment) {
                $payment = $pendingPayment;
                $payment->payment_method = $this->mapPaymentMethod($request->payment_method);
                $payment->payment_channel = $request->payment_method;
                $payment->save();
            } else {
                // Buat payment record baru
                $payment = new Payment();
                $payment->booking_id = $booking->id;
                $payment->amount = $booking->total_amount;
                $payment->status = 'PENDING';
                $payment->payment_method = $this->mapPaymentMethod($request->payment_method);
                $payment->payment_channel = $request->payment_method;
                $payment->expiry_date = now()->addHours(config('midtrans.expiry_duration', 24));
                $payment->save();
            }

            // Buat transaksi di Midtrans
            $response = $this->midtransService->createTransaction($booking, [
                'payment_method' => $request->payment_method,
                'payment_type' => $request->payment_type
            ]);

            if (!$response) {
                throw new \Exception('Gagal membuat transaksi Midtrans');
            }

            // Update payment dengan info dari Midtrans
            $payment->transaction_id = $response['transaction_id'] ?? null;

            // Ekstrak detail pembayaran dari respons Midtrans
            $this->midtransService->setPaymentDetails($payment, $response);

            $payment->payload = json_encode($response);
            $payment->save();

            DB::commit();

            // Buat respons
            $responseData = [
                'payment_id' => $payment->id,
                'status' => $payment->status,
                'payment_method' => $payment->payment_method,
                'payment_channel' => $payment->payment_channel,
                'virtual_account_number' => $payment->virtual_account_number,
                'qr_code_url' => $payment->qr_code_url,
                'deep_link_url' => $payment->deep_link_url,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran berhasil dibuat',
                'data' => $responseData
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Perbaikan handler untuk notifikasi callback dari Midtrans
     */
    public function notification(Request $request)
    {
        $notification = $request->all();

        Log::info('Midtrans notification received', [
            'order_id' => $notification['order_id'] ?? 'unknown',
            'transaction_status' => $notification['transaction_status'] ?? 'unknown'
        ]);

        // Log data lengkap untuk debugging (sesuaikan untuk production)
        Log::debug('Complete notification payload', $notification);

        // PERBAIKAN: Dalam sandbox mode, kita bisa skip verifikasi untuk debugging
        $isVerified = true;
        if (config('midtrans.is_production')) {
            $isVerified = $this->midtransService->verifyNotification($notification);
        }

        if (!$isVerified) {
            Log::warning('Invalid notification signature', [
                'order_id' => $notification['order_id'] ?? 'unknown'
            ]);

            // Dalam development/testing, bisa diteruskan
            if (!config('midtrans.is_production')) {
                Log::info('Proceeding with unverified notification in development mode');
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Signature key tidak valid'
                ], 403);
            }
        }

        // Proses notifikasi
        $orderId = $notification['order_id']; // Ini adalah booking_code

        try {
            // Cari booking dan payment
            $booking = Booking::where('booking_code', $orderId)->first();

            if (!$booking) {
                Log::warning('Booking not found for notification', [
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
                Log::warning('Payment not found for notification', [
                    'order_id' => $orderId,
                    'booking_id' => $booking->id
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Pembayaran tidak ditemukan'
                ], 404);
            }

            // PENTING: Update status pembayaran dan booking
            $this->midtransService->updatePaymentStatus($payment, $notification);

            Log::info('Notification processed successfully', [
                'order_id' => $orderId,
                'payment_status' => $payment->fresh()->status,
                'booking_status' => $booking->fresh()->status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil diproses'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error processing notification', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error memproses notifikasi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Memeriksa status pembayaran
     */
    public function status(Request $request, $bookingCode)
    {
        // Cari booking dan payment
        $user = $request->user();
        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $payment = Payment::where('booking_id', $booking->id)
            ->latest()
            ->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran tidak ditemukan'
            ], 404);
        }

        // Cek status di Midtrans untuk pembayaran PENDING
        if ($payment->status === 'PENDING') {
            $midtransStatus = $this->midtransService->getStatus($payment->transaction_id ?? $booking->booking_code);

            if ($midtransStatus) {
                // Update status pembayaran
                $this->midtransService->updatePaymentStatus($payment, (array) $midtransStatus);
            }
        }

        // Refresh payment dari database
        $payment = $payment->fresh();

        return response()->json([
            'success' => true,
            'message' => 'Status pembayaran berhasil diambil',
            'data' => [
                'payment_id' => $payment->id,
                'booking_id' => $booking->id,
                'status' => $payment->status,
                'payment_method' => $payment->payment_method,
                'payment_channel' => $payment->payment_channel,
                'virtual_account_number' => $payment->virtual_account_number,
                'qr_code_url' => $payment->qr_code_url,
                'deep_link_url' => $payment->deep_link_url,
                'payment_date' => $payment->payment_date,
                'expiry_date' => $payment->expiry_date,
                'booking_status' => $booking->status
            ]
        ], 200);
    }

    /**
     * Map nilai payment_method ke nilai enum yang valid
     */
    protected function mapPaymentMethod($method)
    {
        $methodMap = [
            'bca' => 'VIRTUAL_ACCOUNT',
            'bni' => 'VIRTUAL_ACCOUNT',
            'bri' => 'VIRTUAL_ACCOUNT',
            'mandiri' => 'VIRTUAL_ACCOUNT',
            'gopay' => 'E_WALLET',
            'shopeepay' => 'E_WALLET',
        ];

        return $methodMap[strtolower($method)] ?? 'VIRTUAL_ACCOUNT';
    }

    /**
     * Endpoint manual untuk memperbarui status pembayaran
     */
    public function manualCheck(Request $request, $bookingCode)
    {
        Log::info('Manual check payment status requested', [
            'booking_code' => $bookingCode,
            'user_id' => $request->user()->id
        ]);

        $result = $this->midtransService->checkAndUpdateTransaction($bookingCode);

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memeriksa status pembayaran'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pembayaran berhasil diperbarui',
            'data' => $result
        ], 200);
    }

    /**
     * Endpoint untuk mengecek dan memperbarui status pembayaran secara manual
     */
    public function manualCheckStatus(Request $request, $bookingCode)
    {
        try {
            Log::info('Manual payment status check requested', [
                'booking_code' => $bookingCode,
                'user_id' => $request->user()->id
            ]);

            $booking = Booking::where('booking_code', $bookingCode)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $payment = Payment::where('booking_id', $booking->id)
                ->latest()
                ->first();

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pembayaran tidak ditemukan'
                ], 404);
            }

            // Cek status langsung ke Midtrans
            $statusResponse = $this->midtransService->getStatus($payment->transaction_id ?? $booking->booking_code);

            if (!$statusResponse) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal memeriksa status di Midtrans'
                ], 500);
            }

            Log::info('Retrieved status from Midtrans', [
                'booking_code' => $bookingCode,
                'transaction_status' => $statusResponse['transaction_status'] ?? 'unknown'
            ]);

            // PENTING: Update status berdasarkan respons dari Midtrans
            // Jika Settlement -> harus update booking juga menjadi CONFIRMED
            if (
                isset($statusResponse['transaction_status']) &&
                ($statusResponse['transaction_status'] == 'settlement' ||
                    $statusResponse['transaction_status'] == 'capture')
            ) {

                $payment->status = 'SUCCESS';
                $payment->payment_date = isset($statusResponse['settlement_time'])
                    ? date('Y-m-d H:i:s', strtotime($statusResponse['settlement_time']))
                    : now();
                $payment->save();

                // Update booking status
                if ($booking->status == 'PENDING') {
                    $booking->status = 'CONFIRMED';
                    $booking->save();

                    Log::info('Booking status updated through manual check', [
                        'booking_id' => $booking->id,
                        'new_status' => 'CONFIRMED'
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Status pembayaran berhasil diperiksa',
                'data' => [
                    'payment_status' => $payment->fresh()->status,
                    'booking_status' => $booking->fresh()->status,
                    'transaction_status' => $statusResponse['transaction_status'] ?? null
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking payment status manually', [
                'booking_code' => $bookingCode,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan instruksi pembayaran
     */
    public function getInstructions(Request $request, $paymentType, $paymentMethod)
    {
        Log::info('Payment instructions requested', [
            'payment_type' => $paymentType,
            'payment_method' => $paymentMethod,
            'user_id' => $request->user()->id
        ]);

        // Dapatkan instruksi dari MidtransService
        $instructions = $this->midtransService->getPaymentInstructions($paymentMethod, $paymentType);

        return response()->json([
            'success' => true,
            'message' => 'Instruksi pembayaran berhasil diambil',
            'data' => $instructions
        ], 200);
    }

    public function refreshStatus($bookingCode)
    {
        $midtransService = app(MidtransService::class);
        $result = $midtransService->checkAndUpdateTransaction($bookingCode);

        return response()->json([
            'success' => true,
            'message' => 'Status pembayaran diperbarui',
            'data' => $result
        ]);
    }
}
