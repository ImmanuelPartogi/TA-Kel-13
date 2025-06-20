<?php

namespace App\Http\Controllers\Api\User;

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
            'platform' => 'nullable|string|in:android,ios,web',
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
                $payment->payment_method = $this->mapPaymentMethod($request->payment_method, $request->payment_type);
                $payment->payment_channel = $request->payment_method;
                $payment->save();
            } else {
                // Buat payment record baru
                $payment = new Payment();
                $payment->booking_id = $booking->id;
                $payment->amount = $booking->total_amount;
                $payment->status = 'PENDING';
                $payment->payment_method = $this->mapPaymentMethod($request->payment_method, $request->payment_type);
                $payment->payment_channel = $request->payment_method;

                // Set expiry berdasarkan konfigurasi baru - 5 menit untuk semua metode
                $payment->expiry_date = now()->addMinutes(5);

                $payment->save();
            }

            // Buat transaksi di Midtrans dengan opsi tambahan jika ada
            $additionalOptions = [];

            // Opsi-opsi khusus per payment method
            if ($request->has('va_number')) {
                $additionalOptions['va_number'] = $request->va_number;
            }

            if ($request->has('sub_company_code')) {
                $additionalOptions['sub_company_code'] = $request->sub_company_code;
            }

            if ($request->has('bill_key')) {
                $additionalOptions['bill_key'] = $request->bill_key;
            }

            if ($request->has('acquirer')) {
                $additionalOptions['acquirer'] = $request->acquirer;
            }

            // Gabungkan opsi dasar dengan opsi tambahan
            $options = array_merge([
                'payment_method' => $request->payment_method,
                'payment_type' => $request->payment_type,
                'platform' => $request->platform ?? $request->header('X-Platform', 'web')
            ], $additionalOptions);

            // Buat transaksi di Midtrans
            $response = $this->midtransService->createTransaction($booking, $options);

            // Jika respons null, buat transaksi fallback
            if (!$response) {
                // Gunakan metode fallback yang sudah diimplementasi di midtransService
                $payment = Payment::where('booking_id', $booking->id)->latest()->first();

                // Jika sudah ada info pembayaran dari fallback, gunakan itu
                if ($payment && ($payment->virtual_account_number || $payment->qr_code_url)) {
                    DB::commit();

                    // Buat respons dengan informasi yang ada
                    $responseData = [
                        'payment_id' => $payment->id,
                        'status' => $payment->status,
                        'payment_method' => $payment->payment_method,
                        'payment_channel' => $payment->payment_channel,
                        'virtual_account_number' => $payment->virtual_account_number,
                        'qr_code_url' => $payment->qr_code_url,
                        'deep_link_url' => $payment->deep_link_url,
                        'expiry_date' => $payment->expiry_date->format('Y-m-d H:i:s'),
                        'is_fallback' => true
                    ];

                    return response()->json([
                        'success' => true,
                        'message' => 'Pembayaran dibuat dengan mode fallback',
                        'data' => $responseData
                    ], 200);
                }

                throw new \Exception('Gagal membuat transaksi di Midtrans');
            }

            // Update payment dengan info dari Midtrans
            $payment->transaction_id = $response['transaction_id'] ?? null;

            // Ekstrak detail pembayaran dari respons Midtrans
            $this->midtransService->setPaymentDetails($payment, $response);

            // Pastikan expiry date sesuai dengan konfigurasi 5 menit
            if (!$payment->expiry_date) {
                $payment->expiry_date = now()->addMinutes(5);
            }

            $payment->save();

            DB::commit();

            // Tambahkan URL simulator jika dalam mode sandbox
            $simulatorUrl = null;
            if (!config('midtrans.is_production')) {
                $simulatorUrl = $this->midtransService->getSimulatorUrl($request->payment_method, $request->payment_type);
            }

            // Dapatkan instruksi pembayaran
            $instructions = $this->midtransService->getPaymentInstructions($request->payment_method, $request->payment_type);

            // Buat respons
            $responseData = [
                'payment_id' => $payment->id,
                'status' => $payment->status,
                'payment_method' => $payment->payment_method,
                'payment_channel' => $payment->payment_channel,
                'transaction_id' => $payment->transaction_id,
                'virtual_account_number' => $payment->virtual_account_number,
                'qr_code_url' => $payment->qr_code_url,
                'deep_link_url' => $payment->deep_link_url,
                'expiry_date' => $payment->expiry_date->format('Y-m-d H:i:s'),
                'instructions' => $instructions,
                'simulator_url' => $simulatorUrl
            ];

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran berhasil dibuat',
                'data' => $responseData
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create payment', [
                'booking_code' => $bookingCode,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handler untuk notifikasi callback dari Midtrans
     */
    public function notification(Request $request)
    {
        $notification = $request->all();
        Log::info('Midtrans notification received', [
            'order_id' => $notification['order_id'] ?? 'unknown',
            'transaction_status' => $notification['transaction_status'] ?? 'unknown',
            'payment_type' => $notification['payment_type'] ?? 'unknown'
        ]);

        // Log data lengkap untuk debugging (sesuaikan untuk production)
        Log::debug('Complete notification payload', $notification);

        // Dalam sandbox mode, kita bisa skip verifikasi untuk debugging
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

        // Tambahkan instruksi pembayaran
        $instructions = $this->midtransService->getPaymentInstructions($payment->payment_channel, $this->getPaymentTypeByMethod($payment->payment_method));

        // Tambahkan redirect info untuk e-wallet jika perlu
        $redirectInfo = null;
        if ($payment->payment_method == 'E_WALLET' && $payment->payment_channel == 'qris') {
            $redirectInfo = $this->midtransService->getQrisRedirectUrl($payment);
        }

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
                'booking_status' => $booking->status,
                'instructions' => $instructions,
                'redirect_info' => $redirectInfo
            ]
        ], 200);
    }

    /**
     * Map nilai payment_method ke nilai enum yang valid
     */
    protected function mapPaymentMethod($method, $type = 'virtual_account')
    {
        $methodMap = [
            'bca' => 'VIRTUAL_ACCOUNT',
            'bni' => 'VIRTUAL_ACCOUNT',
            'bri' => 'VIRTUAL_ACCOUNT',
            'mandiri' => 'VIRTUAL_ACCOUNT',
            'permata' => 'VIRTUAL_ACCOUNT',
            'cimb' => 'VIRTUAL_ACCOUNT',
            'qris' => 'E_WALLET',
        ];

        if ($type == 'qris') {
            return 'E_WALLET';
        }

        return $methodMap[strtolower($method)] ?? 'VIRTUAL_ACCOUNT';
    }

    /**
     * Mendapatkan payment_type dari payment_method
     */
    protected function getPaymentTypeByMethod($method)
    {
        $typeMap = [
            'VIRTUAL_ACCOUNT' => 'virtual_account',
            'E_WALLET' => 'qris',
        ];

        return $typeMap[$method] ?? 'virtual_account';
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

    /**
     * Refresh status pembayaran
     */
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
