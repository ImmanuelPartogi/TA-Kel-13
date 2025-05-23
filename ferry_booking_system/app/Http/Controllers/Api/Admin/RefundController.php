<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Refund;
use App\Models\RefundPolicy;
use App\Models\Payment;
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
     * Get refund policy settings
     */
    public function getPolicySettings()
    {
        try {
            // FIXED: Ambil SEMUA kebijakan (aktif dan non-aktif)
            $policies = RefundPolicy::orderBy('days_before_departure', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Kebijakan refund berhasil diambil',
                'data' => $policies
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching refund policies', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil kebijakan refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update refund policy settings
     */
    public function updatePolicySettings(Request $request)
    {
        // FIXED: Validasi dengan deleted_policies
        $validator = Validator::make($request->all(), [
            'policies' => 'required|array',
            'policies.*.id' => 'nullable|exists:refund_policies,id',
            'policies.*.days_before_departure' => 'required|integer|min:0',
            'policies.*.refund_percentage' => 'required|numeric|min:0|max:100',
            'policies.*.min_fee' => 'nullable|numeric|min:0',
            'policies.*.max_fee' => 'nullable|numeric|min:0',
            'policies.*.description' => 'nullable|string|max:255',
            'policies.*.is_active' => 'required|boolean',
            'deleted_policies' => 'nullable|array',
            'deleted_policies.*' => 'exists:refund_policies,id'
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

            // FIXED: Hapus kebijakan yang benar-benar dihapus
            if ($request->has('deleted_policies') && !empty($request->deleted_policies)) {
                RefundPolicy::whereIn('id', $request->deleted_policies)->delete();
            }

            // FIXED: Simpan ID yang ada di request
            $requestPolicyIds = collect($request->policies)
                ->pluck('id')
                ->filter()
                ->toArray();

            // Update atau buat kebijakan baru
            foreach ($request->policies as $policyData) {
                if (isset($policyData['id']) && !empty($policyData['id'])) {
                    // Update existing
                    $policy = RefundPolicy::find($policyData['id']);
                    if ($policy) {
                        $policy->update([
                            'days_before_departure' => $policyData['days_before_departure'],
                            'refund_percentage' => $policyData['refund_percentage'],
                            'min_fee' => $policyData['min_fee'],
                            'max_fee' => $policyData['max_fee'],
                            'description' => $policyData['description'],
                            'is_active' => $policyData['is_active']
                        ]);
                    }
                } else {
                    // Create new
                    RefundPolicy::create([
                        'days_before_departure' => $policyData['days_before_departure'],
                        'refund_percentage' => $policyData['refund_percentage'],
                        'min_fee' => $policyData['min_fee'],
                        'max_fee' => $policyData['max_fee'],
                        'description' => $policyData['description'],
                        'is_active' => $policyData['is_active']
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Kebijakan refund berhasil diperbarui'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error updating refund policies', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui kebijakan refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get list of refunds with filters
     */
    public function index(Request $request)
    {
        try {
            $query = Refund::with([
                'booking' => function ($q) {
                    $q->with(['user', 'schedule.route']);
                },
                'payment',
                'refundedBy'
            ]);

            // Apply filters
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            if ($request->has('booking_code') && $request->booking_code) {
                $query->whereHas('booking', function ($q) use ($request) {
                    $q->where('booking_code', 'like', '%' . $request->booking_code . '%');
                });
            }

            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $refunds = $query->orderBy('created_at', 'desc')
                ->paginate($request->per_page ?? 15);

            return response()->json([
                'success' => true,
                'message' => 'Daftar refund berhasil diambil',
                'data' => $refunds
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching refunds list', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil daftar refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get refund details
     */
    public function show($id)
    {
        try {
            $refund = Refund::with([
                'booking' => function ($q) {
                    $q->with(['user', 'schedule.route', 'schedule.ferry']);
                },
                'payment',
                'refundedBy'
            ])->findOrFail($id);

            // Check refund status with payment gateway if applicable
            if (in_array($refund->status, ['PENDING', 'PROCESSING']) && $refund->transaction_id) {
                $this->checkAndUpdateRefundStatus($refund);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail refund berhasil diambil',
                'data' => $refund
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching refund details', [
                'error' => $e->getMessage(),
                'refund_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get refund creation form data
     */
    public function create($bookingId)
    {
        try {
            $booking = Booking::with([
                'user',
                'schedule' => function ($q) {
                    $q->with(['route', 'ferry']);
                },
                'payments' => function ($q) {
                    $q->where('status', 'SUCCESS')->latest();
                }
            ])->findOrFail($bookingId);

            $payment = $booking->payments->first();

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada pembayaran berhasil untuk booking ini'
                ], 400);
            }

            // Check if refund already exists
            $existingRefund = Refund::where('booking_id', $bookingId)
                ->whereIn('status', ['PENDING', 'PROCESSING', 'SUCCESS', 'COMPLETED'])
                ->first();

            if ($existingRefund) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sudah ada refund aktif untuk booking ini'
                ], 400);
            }

            // Calculate refund policy
            $departureDate = Carbon::parse($booking->departure_date);
            $daysBeforeDeparture = now()->diffInDays($departureDate, false);

            $policy = RefundPolicy::getApplicablePolicy($daysBeforeDeparture);
            $refundPolicy = 'Tidak ada kebijakan refund yang berlaku';
            $suggestedAmount = 0;
            $refundPercentage = 0;

            if ($policy) {
                $refundCalculation = $policy->calculateRefundAmount($payment->amount);
                $suggestedAmount = $refundCalculation['refund_amount'];
                $refundPercentage = $policy->refund_percentage;
                $refundPolicy = $policy->description;
            }

            return response()->json([
                'success' => true,
                'message' => 'Data form refund berhasil diambil',
                'data' => [
                    'booking' => $booking,
                    'payment' => $payment,
                    'suggested_refund_amount' => $suggestedAmount,
                    'refund_percentage' => $refundPercentage,
                    'refund_policy' => $refundPolicy,
                    'days_until_departure' => max(0, $daysBeforeDeparture)
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error getting refund form data', [
                'error' => $e->getMessage(),
                'booking_id' => $bookingId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data form refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store new refund
     */
    public function store(Request $request, $bookingId)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0',
            'reason' => 'required|string|max:255',
            'refund_method' => 'required|in:ORIGINAL_PAYMENT_METHOD,BANK_TRANSFER,CASH',
            'bank_name' => 'required_if:refund_method,BANK_TRANSFER',
            'bank_account_number' => 'required_if:refund_method,BANK_TRANSFER',
            'bank_account_name' => 'required_if:refund_method,BANK_TRANSFER',
            'notes' => 'nullable|string'
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

            $booking = Booking::findOrFail($bookingId);
            $payment = $booking->payments()
                ->where('status', 'SUCCESS')
                ->latest()
                ->first();

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada pembayaran berhasil untuk booking ini'
                ], 400);
            }

            // Check if refund already exists
            $existingRefund = Refund::where('booking_id', $bookingId)
                ->whereIn('status', ['PENDING', 'PROCESSING', 'SUCCESS', 'COMPLETED'])
                ->first();

            if ($existingRefund) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sudah ada refund aktif untuk booking ini'
                ], 400);
            }

            // Calculate refund fee
            $originalAmount = $payment->amount;
            $refundAmount = $request->amount;
            $refundFee = $originalAmount - $refundAmount;
            $refundPercentage = ($refundAmount / $originalAmount) * 100;

            // Create refund
            $refund = new Refund([
                'booking_id' => $bookingId,
                'payment_id' => $payment->id,
                'original_amount' => $originalAmount,
                'refund_fee' => $refundFee,
                'refund_percentage' => $refundPercentage,
                'amount' => $refundAmount,
                'reason' => $request->reason,
                'status' => 'PENDING',
                'refund_method' => $request->refund_method,
                'bank_account_number' => $request->bank_account_number,
                'bank_account_name' => $request->bank_account_name,
                'bank_name' => $request->bank_name,
                'notes' => $request->notes,
                'refunded_by' => optional(auth())->id()
            ]);

            $refund->save();

            // Update booking status
            $booking->status = 'REFUND_PENDING';
            $booking->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Refund berhasil dibuat',
                'data' => $refund->load(['booking.user', 'payment'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error creating refund', [
                'error' => $e->getMessage(),
                'booking_id' => $bookingId,
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve refund
     */
    public function approve(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string'
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

            $refund = Refund::with(['booking', 'payment'])->findOrFail($id);

            if ($refund->status !== 'PENDING') {
                return response()->json([
                    'success' => false,
                    'message' => 'Refund hanya dapat disetujui jika status PENDING'
                ], 400);
            }

            // Check if can process automatic refund
            $canAutoRefund = $this->midtransService->isRefundable(
                $refund->payment->payment_method,
                $refund->payment->payment_channel
            );

            if ($canAutoRefund) {
                try {
                    $refundResponse = $this->midtransService->requestRefund(
                        $refund->payment->transaction_id,
                        $refund->amount,
                        $refund->reason
                    );

                    $refund->transaction_id = $refundResponse['refund_key'] ?? null;
                    $refund->status = 'PROCESSING';
                } catch (\Exception $e) {
                    Log::warning('Midtrans refund failed, marked as approved for manual process', [
                        'refund_id' => $refund->id,
                        'error' => $e->getMessage()
                    ]);
                    $refund->status = 'APPROVED';
                }
            } else {
                $refund->status = 'APPROVED';
            }

            if ($request->notes) {
                $refund->notes = ($refund->notes ? $refund->notes . "\n" : '') .
                    "[APPROVED] " . $request->notes;
            }

            $refund->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Refund berhasil disetujui',
                'data' => $refund
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error approving refund', [
                'error' => $e->getMessage(),
                'refund_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyetujui refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject refund
     */
    public function reject(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string|max:255'
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

            $refund = Refund::with('booking')->findOrFail($id);

            if ($refund->status !== 'PENDING') {
                return response()->json([
                    'success' => false,
                    'message' => 'Refund hanya dapat ditolak jika status PENDING'
                ], 400);
            }

            $refund->status = 'REJECTED';
            $refund->rejection_reason = $request->rejection_reason;
            $refund->save();

            // Update booking status back to confirmed
            $booking = $refund->booking;
            $booking->status = 'CONFIRMED';
            $booking->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Refund berhasil ditolak',
                'data' => $refund
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error rejecting refund', [
                'error' => $e->getMessage(),
                'refund_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menolak refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete refund
     */
    public function complete(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'transaction_id' => 'required|string',
            'notes' => 'nullable|string'
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

            $refund = Refund::with(['booking', 'payment'])->findOrFail($id);

            if (!in_array($refund->status, ['APPROVED', 'PROCESSING'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Refund hanya dapat diselesaikan jika status APPROVED atau PROCESSING'
                ], 400);
            }

            $refund->status = 'COMPLETED';
            $refund->transaction_id = $request->transaction_id;

            if ($request->notes) {
                $refund->notes = ($refund->notes ? $refund->notes . "\n" : '') .
                    "[COMPLETED] " . $request->notes;
            }

            $refund->save();

            // Update booking status
            $booking = $refund->booking;
            $booking->status = 'REFUNDED';
            $booking->save();

            // Update payment
            $payment = $refund->payment;
            $payment->status = 'REFUNDED';
            $payment->refund_amount = $refund->amount;
            $payment->refund_date = now();
            $payment->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Refund berhasil diselesaikan',
                'data' => $refund
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error completing refund', [
                'error' => $e->getMessage(),
                'refund_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyelesaikan refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check and update refund status from payment gateway
     */
    private function checkAndUpdateRefundStatus($refund)
    {
        try {
            $refundStatus = $this->midtransService->checkRefundStatus($refund->transaction_id);

            if ($refundStatus && isset($refundStatus['status_code'])) {
                $newStatus = $this->mapMidtransRefundStatus($refundStatus['status_code']);

                if ($refund->status != $newStatus) {
                    $refund->status = $newStatus;
                    $refund->save();

                    if ($refund->status === 'SUCCESS' || $refund->status === 'COMPLETED') {
                        $booking = $refund->booking;
                        $booking->status = 'REFUNDED';
                        $booking->save();

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
