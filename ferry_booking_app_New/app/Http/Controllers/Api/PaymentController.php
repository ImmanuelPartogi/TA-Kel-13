<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    public function status($bookingCode)
    {
        $user = request()->user();
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

        // Periksa status di Midtrans jika masih PENDING
        if ($payment->status === 'PENDING' && $payment->transaction_id) {
            $midtransStatus = $this->midtransService->getTransactionStatus($payment->transaction_id);

            // Update status pembayaran berdasarkan respon Midtrans
            if ($midtransStatus) {
                $this->midtransService->updatePaymentStatus($payment, $midtransStatus);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pembayaran berhasil diambil',
            'data' => $payment->fresh()
        ], 200);
    }

    // Callback untuk notifikasi dari Midtrans
    public function notification(Request $request)
    {
        $notification = $request->all();

        // Verifikasi notifikasi dari Midtrans
        $isVerified = $this->midtransService->verifyNotification($notification);

        if (!$isVerified) {
            return response()->json([
                'success' => false,
                'message' => 'Signature key tidak valid'
            ], 403);
        }

        // Proses notifikasi
        $transactionStatus = $notification['transaction_status'];
        $fraudStatus = $notification['fraud_status'] ?? null;
        $orderId = $notification['order_id']; // Ini adalah booking_code

        $booking = Booking::where('booking_code', $orderId)->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan'
            ], 404);
        }

        $payment = Payment::where('booking_id', $booking->id)
            ->latest()
            ->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran tidak ditemukan'
            ], 404);
        }

        // Update status pembayaran
        $this->midtransService->updatePaymentStatus($payment, $notification);

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil diproses'
        ], 200);
    }
}
