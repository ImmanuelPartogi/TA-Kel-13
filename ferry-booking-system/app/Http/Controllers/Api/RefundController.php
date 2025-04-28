<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Refund;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class RefundController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Request a refund for a booking
     */
    public function requestRefund(Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|exists:bookings,id',
            'reason' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:30',
            'bank_account_name' => 'required|string|max:100',
            'bank_name' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Mulai transaksi database
            DB::beginTransaction();

            // Ambil data booking
            $user = $request->user();
            $booking = Booking::where('id', $request->booking_id)
                ->where('user_id', $user->id)
                ->with(['payments'])
                ->firstOrFail();

            // Cek apakah booking memenuhi syarat untuk refund
            if (!in_array($booking->status, ['CONFIRMED', 'PENDING'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking tidak memenuhi syarat untuk refund'
                ], 400);
            }

            // Cek apakah sudah ada refund untuk booking ini
            $existingRefund = Refund::where('booking_id', $booking->id)->first();
            if ($existingRefund) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permintaan refund sudah pernah dibuat'
                ], 400);
            }

            // Ambil payment terakhir yang sukses
            $payment = $booking->payments()
                ->where('status', 'SUCCESS')
                ->latest()
                ->first();

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada pembayaran berhasil yang ditemukan'
                ], 400);
            }

            // Buat permintaan refund ke Midtrans
            $refundResponse = $this->midtransService->requestRefund(
                $payment->payment_code,
                $payment->amount,
                $request->reason
            );

            // Buat record refund
            $refund = new Refund([
                'booking_id' => $booking->id,
                'payment_id' => $payment->id,
                'amount' => $payment->amount,
                'reason' => $request->reason,
                'status' => 'PENDING', // Status awal
                'refund_method' => 'BANK_TRANSFER',
                'transaction_id' => $refundResponse['refund_key'] ?? null,
                'bank_account_number' => $request->bank_account_number,
                'bank_account_name' => $request->bank_account_name,
                'bank_name' => $request->bank_name,
            ]);

            $refund->save();

            // Update status booking
            $booking->status = 'REFUND_PENDING';
            $booking->save();

            DB::commit();

            // Log refund request
            Log::info('Refund requested', [
                'user_id' => $user->id,
                'booking_id' => $booking->id,
                'amount' => $payment->amount,
                'refund_id' => $refund->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Permintaan refund berhasil dibuat',
                'data' => $refund
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error creating refund request', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat membuat permintaan refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get refund details for a booking
     */
    public function getRefundDetails($bookingId)
    {
        $user = request()->user();
        $refund = Refund::where('booking_id', $bookingId)
            ->whereHas('booking', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['booking', 'payment'])
            ->first();

        if (!$refund) {
            return response()->json([
                'success' => false,
                'message' => 'Data refund tidak ditemukan'
            ], 404);
        }

        // Jika status refund masih PENDING, periksa status di Midtrans
        if ($refund->status === 'PENDING' && $refund->transaction_id) {
            try {
                $refundStatus = $this->midtransService->checkRefundStatus($refund->transaction_id);

                // Update status refund jika ada perubahan
                if ($refundStatus && $refundStatus['status_code'] != $refund->status) {
                    $refund->status = $this->mapMidtransRefundStatus($refundStatus['status_code']);
                    $refund->save();

                    // Jika refund berhasil, update status booking
                    if ($refund->status === 'SUCCESS') {
                        $booking = $refund->booking;
                        $booking->status = 'REFUNDED';
                        $booking->save();
                    }
                }
            } catch (\Exception $e) {
                Log::error('Error checking refund status', [
                    'refund_id' => $refund->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail refund berhasil diambil',
            'data' => $refund
        ], 200);
    }

    /**
     * Cancel a pending refund request
     */
    public function cancelRefund($refundId)
    {
        $user = request()->user();
        $refund = Refund::where('id', $refundId)
            ->whereHas('booking', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();

        if (!$refund) {
            return response()->json([
                'success' => false,
                'message' => 'Data refund tidak ditemukan'
            ], 404);
        }

        if ($refund->status !== 'PENDING') {
            return response()->json([
                'success' => false,
                'message' => 'Refund tidak dapat dibatalkan karena status sudah ' . $refund->status
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Cancel refund di Midtrans jika ada transaction_id
            if ($refund->transaction_id) {
                $this->midtransService->cancelRefund($refund->transaction_id);
            }

            // Update status refund
            $refund->status = 'CANCELLED';
            $refund->save();

            // Kembalikan status booking
            $booking = $refund->booking;
            $booking->status = 'CONFIRMED';
            $booking->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Permintaan refund berhasil dibatalkan',
                'data' => $refund
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error cancelling refund request', [
                'refund_id' => $refund->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat membatalkan permintaan refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Map Midtrans status code to our status
     */
    private function mapMidtransRefundStatus($statusCode)
    {
        switch ($statusCode) {
            case '200':
                return 'SUCCESS';
            case '202':
                return 'PENDING';
            case '412':
            case '500':
                return 'FAILED';
            default:
                return 'PENDING';
        }
    }
}
