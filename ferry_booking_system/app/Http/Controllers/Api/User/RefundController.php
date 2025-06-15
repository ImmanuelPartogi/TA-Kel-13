<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\RefundPolicy;
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
     * Check refund eligibility for a booking
     * UPDATED: Support for default no-fee refund and minimum days check
     */
    public function checkRefundEligibility($bookingId)
    {
        $user = request()->user();
        $booking = Booking::where('id', $bookingId)
            ->where('user_id', $user->id)
            ->with('payments')
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan'
            ], 404);
        }

        $payment = $booking->payments()
            ->where('status', 'SUCCESS')
            ->latest()
            ->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada pembayaran berhasil yang ditemukan',
                'eligible' => false
            ], 200);
        }

        // Cek apakah sudah ada refund
        $existingRefund = Refund::where('booking_id', $booking->id)
            ->whereIn('status', ['PENDING', 'PROCESSING', 'SUCCESS', 'COMPLETED'])
            ->first();

        if ($existingRefund) {
            return response()->json([
                'success' => true,
                'message' => 'Sudah ada permintaan refund untuk booking ini',
                'eligible' => false,
                'existing_refund' => $existingRefund
            ], 200);
        }

        // Calculate days before departure
        $departureDate = Carbon::parse($booking->departure_date);
        $daysBeforeDeparture = now()->diffInDays($departureDate, false);

        // TAMBAHAN: Cek minimum days (2 hari)
        if ($daysBeforeDeparture < 2) {
            return response()->json([
                'success' => true,
                'message' => 'Refund hanya dapat dilakukan minimal 2 hari sebelum keberangkatan',
                'eligible' => false,
                'days_before_departure' => $daysBeforeDeparture
            ], 200);
        }

        // Get applicable refund policy
        $policy = RefundPolicy::getApplicablePolicy($daysBeforeDeparture);

        // PERUBAHAN: Jika tidak ada policy yang sesuai, gunakan refund penuh
        $refundCalculation = $policy
            ? $policy->calculateRefundAmount($payment->amount)
            : RefundPolicy::getDefaultFullRefund($payment->amount);

        $canAutoRefund = $this->midtransService->isRefundable(
            $payment->payment_method,
            $payment->payment_channel
        );

        $slaPeriod = $this->midtransService->getRefundSLA(
            $payment->payment_method,
            $payment->payment_channel
        );

        return response()->json([
            'success' => true,
            'message' => 'Booking eligible untuk refund',
            'eligible' => true,
            'can_auto_refund' => $canAutoRefund,
            'sla_period' => $slaPeriod,
            'payment_method' => $payment->payment_method,
            'payment_channel' => $payment->payment_channel,
            'payment_date' => $payment->payment_date,
            'days_before_departure' => $daysBeforeDeparture,
            'refund_policy' => [
                'description' => $policy ? $policy->description : 'Refund penuh tanpa potongan',
                'percentage' => $refundCalculation['refund_percentage'],
                'original_amount' => $refundCalculation['original_amount'],
                'refund_fee' => $refundCalculation['refund_fee'],
                'refund_amount' => $refundCalculation['refund_amount'],
                'is_default_policy' => $refundCalculation['is_default_policy'] ?? false
            ]
        ], 200);
    }

    /**
     * Request a refund for a booking
     * UPDATED: Support for default no-fee refund and minimum days check
     */
    public function requestRefund(Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|exists:bookings,id',
            'reason' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:30',
            'bank_account_name' => 'required|string|max:100',
            'bank_name' => 'required|string|in:BCA,BNI,BRI,MANDIRI,CIMB,DANAMON,PERMATA,BTN,OCBC,MAYBANK,PANIN,BUKOPIN,MEGA,SINARMAS,OTHER',
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

            // Cek apakah user memiliki akses ke booking ini
            if ($booking->user_id !== request()->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke booking ini'
                ], 403);
            }

            // Cek apakah sudah ada refund untuk booking ini
            $existingRefund = Refund::where('booking_id', $booking->id)
                ->whereIn('status', ['PENDING', 'PROCESSING', 'SUCCESS', 'COMPLETED'])
                ->first();

            if ($existingRefund) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permintaan refund untuk booking ini sudah ada'
                ], 400);
            }

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

            // Calculate days before departure
            $departureDate = Carbon::parse($booking->departure_date);
            $daysBeforeDeparture = now()->diffInDays($departureDate, false);

            // TAMBAHAN: Cek minimum days (2 hari)
            if ($daysBeforeDeparture < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Refund hanya dapat dilakukan minimal 2 hari sebelum keberangkatan'
                ], 400);
            }

            // Get applicable refund policy
            $policy = RefundPolicy::getApplicablePolicy($daysBeforeDeparture);

            // PERUBAHAN: Jika tidak ada policy yang sesuai, gunakan refund penuh
            $refundCalculation = $policy
                ? $policy->calculateRefundAmount($payment->amount)
                : RefundPolicy::getDefaultFullRefund($payment->amount);

            // Cek apakah metode pembayaran dapat di-refund otomatis
            $canAutoRefund = $this->midtransService->isRefundable(
                $payment->payment_method,
                $payment->payment_channel
            );

            $refundStatus = 'PENDING';
            $requiresManualProcess = true;
            $refundResponse = null;
            $slaPeriod = '3-14 hari kerja'; // Default SLA

            if ($canAutoRefund) {
                // Coba buat refund via Midtrans
                try {
                    $refundResponse = $this->midtransService->requestRefund(
                        $payment->transaction_id,
                        $refundCalculation['refund_amount'], // Use calculated amount
                        $request->reason
                    );

                    $requiresManualProcess = $refundResponse['requires_manual_process'] ?? false;
                    $refundStatus = $requiresManualProcess ? 'PENDING' : 'PROCESSING';
                    $slaPeriod = $this->midtransService->getRefundSLA(
                        $payment->payment_method,
                        $payment->payment_channel
                    );
                } catch (\Exception $e) {
                    Log::warning('Midtrans refund request failed, fallback to manual process', [
                        'payment_id' => $payment->id,
                        'error' => $e->getMessage()
                    ]);
                    // Jika gagal, fallback ke proses manual
                    $requiresManualProcess = true;
                    $refundStatus = 'PENDING';
                }
            }

            // Tambahkan catatan refund untuk kebijakan default
            $policyNotes = '';
            if (isset($refundCalculation['is_default_policy']) && $refundCalculation['is_default_policy']) {
                $policyNotes = 'Refund menggunakan kebijakan default (tidak ada potongan)';
            } elseif ($policy) {
                $policyNotes = $policy->description;
            }

            // Buat record refund
            $refund = new Refund([
                'booking_id' => $booking->id,
                'payment_id' => $payment->id,
                'original_amount' => $refundCalculation['original_amount'],
                'refund_fee' => $refundCalculation['refund_fee'],
                'refund_percentage' => $refundCalculation['refund_percentage'],
                'amount' => $refundCalculation['refund_amount'],
                'reason' => $request->reason,
                'status' => $refundStatus,
                'refund_method' => 'BANK_TRANSFER',
                'transaction_id' => $refundResponse['refund_key'] ?? null,
                'bank_account_number' => $request->bank_account_number,
                'bank_account_name' => $request->bank_account_name,
                'bank_name' => $request->bank_name,
                'notes' => $policyNotes
            ]);

            $refund->save();

            // Update status booking
            $booking->status = 'REFUND_PENDING';
            $booking->save();

            DB::commit();

            // Pesan yang informatif berdasarkan jenis proses refund
            $message = sprintf(
                "Permintaan refund berhasil dibuat. Jumlah yang akan dikembalikan: %s (dari total %s dengan potongan biaya %s atau %s%%). Dana akan diproses dalam %s.",
                formatCurrency($refundCalculation['refund_amount']),
                formatCurrency($refundCalculation['original_amount']),
                formatCurrency($refundCalculation['refund_fee']),
                number_format(100 - $refundCalculation['refund_percentage'], 0),
                $slaPeriod
            );

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => array_merge($refund->toArray(), [
                    'refund_calculation' => $refundCalculation,
                    'policy_description' => $policy ? $policy->description : 'Refund penuh tanpa potongan'
                ]),
                'sla_period' => $slaPeriod,
                'requires_manual_process' => $requiresManualProcess,
                'can_auto_refund' => $canAutoRefund
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error creating refund request', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
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
    public function getRefundDetailsByBookingId($bookingId)
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

        // Tambahkan informasi refund calculation
        $refundData = $refund->toArray();
        $refundData['refund_calculation'] = [
            'original_amount' => $refund->original_amount,
            'refund_fee' => $refund->refund_fee,
            'refund_percentage' => $refund->refund_percentage,
            'refund_amount' => $refund->amount
        ];

        return response()->json([
            'success' => true,
            'message' => 'Detail refund berhasil diambil',
            'data' => $refundData
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
                try {
                    $this->midtransService->cancelRefund($refund->transaction_id);
                } catch (\Exception $e) {
                    Log::warning('Failed to cancel refund in Midtrans', [
                        'refund_id' => $refund->id,
                        'transaction_id' => $refund->transaction_id,
                        'error' => $e->getMessage()
                    ]);
                    // Lanjutkan proses meskipun gagal cancel di Midtrans
                }
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

// Helper function for currency formatting
if (!function_exists('formatCurrency')) {
    function formatCurrency($amount)
    {
        return 'Rp ' . number_format($amount, 0, ',', '.');
    }
}
