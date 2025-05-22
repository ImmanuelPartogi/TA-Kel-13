<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Refund;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

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
            DB::beginTransaction();

            // Ambil data booking dan payment
            $booking = Booking::findOrFail($request->booking_id);
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

            // Validasi metode pembayaran dapat di-refund
            if (!$this->midtransService->isRefundable($payment->payment_method, $payment->payment_channel)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Metode pembayaran ini tidak mendukung refund otomatis. Silakan hubungi customer service.'
                ], 400);
            }

            // Validasi periode refund
            $refundPeriod = $this->midtransService->getRefundPeriod(
                $payment->payment_method,
                $payment->payment_channel,
                $payment->payment_date
            );

            if ($refundPeriod === false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Periode refund untuk transaksi ini telah berakhir'
                ], 400);
            }

            // Coba buat refund via Midtrans
            $refundResponse = $this->midtransService->requestRefund(
                $payment->transaction_id,
                $payment->amount,
                $request->reason
            );

            // Cek apakah perlu proses manual (untuk virtual account dll)
            $requiresManualProcess = $refundResponse['requires_manual_process'] ?? false;
            $refundStatus = $requiresManualProcess ? 'PENDING' : 'PROCESSING';

            // Buat record refund
            $refund = new Refund([
                'booking_id' => $booking->id,
                'payment_id' => $payment->id,
                'amount' => $payment->amount,
                'reason' => $request->reason,
                'status' => $refundStatus,
                'refund_method' => 'BANK_TRANSFER', // Sesuai enum di database
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

            // Ambil perkiraan SLA untuk respons
            $slaPeriod = $this->midtransService->getRefundSLA(
                $payment->payment_method,
                $payment->payment_channel
            );

            // Pesan yang informatif berdasarkan jenis proses refund
            $message = $requiresManualProcess
                ? "Permintaan refund berhasil dibuat dan akan diproses secara manual dalam $slaPeriod"
                : "Permintaan refund berhasil dibuat dan sedang diproses. Dana akan dikembalikan dalam $slaPeriod";

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $refund,
                'sla_period' => $slaPeriod,
                'requires_manual_process' => $requiresManualProcess
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

        // Jika status refund masih PENDING atau PROCESSING, periksa status di Midtrans
        if (in_array($refund->status, ['PENDING', 'PROCESSING']) && $refund->transaction_id) {
            try {
                $refundStatus = $this->midtransService->checkRefundStatus($refund->transaction_id);

                // Update status refund jika ada perubahan
                if ($refundStatus && isset($refundStatus['status_code'])) {
                    $newStatus = $this->mapMidtransRefundStatus($refundStatus['status_code']);

                    if ($refund->status != $newStatus) {
                        $refund->status = $newStatus;
                        $refund->save();

                        // Jika refund berhasil, update status booking
                        if ($refund->status === 'SUCCESS') {
                            $booking = $refund->booking;
                            $booking->status = 'REFUNDED';
                            $booking->save();

                            // Update payment status
                            $payment = $refund->payment;
                            if ($payment) {
                                $payment->status = 'REFUNDED';
                                $payment->refund_amount = $refund->amount;
                                $payment->refund_date = now();
                                $payment->save();
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::error('Error checking refund status', [
                    'refund_id' => $refund->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Tambahkan SLA informasi
        $payment = $refund->payment;
        $slaPeriod = null;

        if ($payment) {
            $slaPeriod = $this->midtransService->getRefundSLA(
                $payment->payment_method,
                $payment->payment_channel
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail refund berhasil diambil',
            'data' => $refund,
            'sla_period' => $slaPeriod
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
            case '201':
            case '202':
                return 'PROCESSING';
            case '412':
            case '500':
                return 'FAILED';
            default:
                return 'PENDING';
        }
    }
}
