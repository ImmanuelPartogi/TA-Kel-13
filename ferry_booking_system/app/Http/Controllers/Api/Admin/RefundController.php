<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\BookingLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class RefundController extends Controller
{
    public function index(Request $request)
    {
        $query = Refund::with(['booking.user', 'payment']);

        // Filter berdasarkan status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan kode booking
        if ($request->has('booking_code') && $request->booking_code) {
            $query->whereHas('booking', function ($q) use ($request) {
                $q->where('booking_code', 'like', '%' . $request->booking_code . '%');
            });
        }

        // Filter berdasarkan tanggal
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $refunds = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 10));

        // Restructure response untuk frontend
        return response()->json([
            'success' => true,
            'message' => 'Data refund berhasil diambil',
            'data' => $refunds->items(), // Array data refund
            'meta' => [
                'current_page' => $refunds->currentPage(),
                'last_page' => $refunds->lastPage(),
                'per_page' => $refunds->perPage(),
                'total' => $refunds->total(),
                'from' => $refunds->firstItem(),
                'to' => $refunds->lastItem(),
                'has_more_pages' => $refunds->hasMorePages()
            ]
        ], 200);
    }

    public function show($id)
    {
        try {
            $refund = Refund::with([
                'booking.user',
                'booking.schedule.route',
                'booking.schedule.ferry',
                'payment'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Detail refund berhasil diambil',
                'data' => $refund
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching refund details', [
                'refund_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Refund tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Method untuk route GET /admin-panel/refunds/create/{bookingId}
     */
    public function create($bookingId)
    {
        try {
            $booking = Booking::with([
                'user',
                'schedule.route',
                'schedule.ferry',
                'payments' => function($query) {
                    $query->where('status', 'SUCCESS');
                },
                'vehicles'
            ])->findOrFail($bookingId);

            // Validasi booking yang bisa direfund
            if (!in_array($booking->status, ['CONFIRMED', 'COMPLETED'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya booking dengan status CONFIRMED atau COMPLETED yang dapat direfund'
                ], 422);
            }

            // Cek apakah sudah ada refund untuk booking ini
            $existingRefund = Refund::where('booking_id', $bookingId)
                ->whereIn('status', ['PENDING', 'APPROVED', 'COMPLETED'])
                ->first();

            if ($existingRefund) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sudah ada permintaan refund untuk booking ini',
                    'existing_refund' => $existingRefund
                ], 422);
            }

            $payment = $booking->payments()->where('status', 'SUCCESS')->first();
            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ditemukan pembayaran yang berhasil untuk booking ini'
                ], 422);
            }

            // Hitung kebijakan refund berdasarkan tanggal keberangkatan
            $departureDate = Carbon::parse($booking->departure_date);
            $today = Carbon::today();
            $daysUntilDeparture = $today->diffInDays($departureDate, false);

            $refundPercentage = 0;
            $refundPolicy = '';

            if ($daysUntilDeparture >= 7) {
                $refundPercentage = 100;
                $refundPolicy = 'Refund penuh (H-7 atau lebih)';
            } elseif ($daysUntilDeparture >= 3) {
                $refundPercentage = 75;
                $refundPolicy = 'Refund 75% (H-3 sampai H-6)';
            } elseif ($daysUntilDeparture >= 1) {
                $refundPercentage = 50;
                $refundPolicy = 'Refund 50% (H-1 sampai H-2)';
            } else {
                // Untuk admin, tetap bisa melakukan refund walaupun H-0
                $refundPercentage = 25;
                $refundPolicy = 'Refund darurat (H-0, kebijakan khusus admin)';
            }

            $suggestedRefundAmount = ($payment->amount * $refundPercentage) / 100;

            return response()->json([
                'success' => true,
                'message' => 'Data booking berhasil diambil',
                'data' => [
                    'booking' => $booking,
                    'payment' => $payment,
                    'refund_percentage' => $refundPercentage,
                    'suggested_refund_amount' => $suggestedRefundAmount,
                    'refund_policy' => $refundPolicy,
                    'days_until_departure' => $daysUntilDeparture
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error in AdminRefundController@create', [
                'booking_id' => $bookingId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data booking'
            ], 500);
        }
    }

    /**
     * Alias untuk create method (untuk backward compatibility)
     */
    public function getRefundForm($bookingId)
    {
        return $this->create($bookingId);
    }

    /**
     * Method untuk route POST /admin-panel/refunds/store/{bookingId}
     */
    public function store(Request $request, $bookingId)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0',
            'reason' => 'required|string|max:255',
            'refund_method' => 'required|in:ORIGINAL_PAYMENT_METHOD,BANK_TRANSFER,CASH',
            'bank_name' => 'required_if:refund_method,BANK_TRANSFER|nullable|string|max:50',
            'bank_account_number' => 'required_if:refund_method,BANK_TRANSFER|nullable|string|max:30',
            'bank_account_name' => 'required_if:refund_method,BANK_TRANSFER|nullable|string|max:100',
            'notes' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $booking = Booking::findOrFail($bookingId);
            $payment = $booking->payments()->where('status', 'SUCCESS')->first();

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pembayaran tidak ditemukan'
                ], 422);
            }

            // Validasi jumlah refund
            if ($request->amount > $booking->total_amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jumlah refund tidak boleh melebihi total pembayaran'
                ], 422);
            }

            DB::beginTransaction();

            // Buat refund
            $refund = new Refund([
                'booking_id' => $booking->id,
                'payment_id' => $payment->id,
                'amount' => $request->amount,
                'reason' => $request->reason,
                'status' => 'PENDING',
                'refunded_by' => Auth::id(),
                'refund_method' => $request->refund_method,
                'notes' => $request->notes
            ]);

            // Tambahkan info bank jika metode refund adalah transfer bank
            if ($request->refund_method === 'BANK_TRANSFER') {
                $refund->bank_name = $request->bank_name;
                $refund->bank_account_number = $request->bank_account_number;
                $refund->bank_account_name = $request->bank_account_name;
            }

            $refund->save();

            // Update status booking
            $booking->status = 'REFUND_PENDING';
            $booking->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Permohonan refund berhasil dibuat',
                'data' => $refund->fresh(['booking', 'payment'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error creating refund', [
                'booking_id' => $bookingId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function approve(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $refund = Refund::findOrFail($id);

            if ($refund->status !== 'PENDING') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya refund dengan status PENDING yang bisa diproses'
                ], 422);
            }

            DB::beginTransaction();

            // Update status refund
            $refund->status = 'APPROVED';
            if ($request->notes) {
                $refund->notes = $refund->notes . "\nAdmin Notes: " . $request->notes;
            }
            $refund->save();

            // Update status booking menjadi REFUNDED
            $booking = $refund->booking;
            $previousStatus = $booking->status;
            $booking->status = 'REFUNDED';
            $booking->save();

            // Create booking log
            $bookingLog = new BookingLog([
                'booking_id' => $booking->id,
                'previous_status' => $previousStatus,
                'new_status' => 'REFUNDED',
                'changed_by_type' => 'ADMIN',
                'changed_by_id' => Auth::id(),
                'notes' => 'Refund disetujui: ' . $refund->reason,
                'ip_address' => $request->ip(),
            ]);
            $bookingLog->save();

            // Update payment status dan jumlah refund
            $payment = $refund->payment;
            $payment->status = 'REFUNDED';
            $payment->refund_amount = $refund->amount;
            $payment->refund_date = now();
            $payment->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Refund berhasil disetujui',
                'data' => $refund->fresh(['booking', 'payment'])
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error approving refund', [
                'refund_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $refund = Refund::findOrFail($id);

            if ($refund->status !== 'PENDING') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya refund dengan status PENDING yang bisa diproses'
                ], 422);
            }

            DB::beginTransaction();

            // Update status refund
            $refund->status = 'REJECTED';
            $refund->reason .= ' | Ditolak: ' . $request->rejection_reason;
            $refund->save();

            // Kembalikan status booking ke CONFIRMED
            $booking = $refund->booking;
            $booking->status = 'CONFIRMED';
            $booking->save();

            // Create booking log
            $bookingLog = new BookingLog([
                'booking_id' => $refund->booking_id,
                'previous_status' => 'REFUND_PENDING',
                'new_status' => 'CONFIRMED',
                'changed_by_type' => 'ADMIN',
                'changed_by_id' => Auth::id(),
                'notes' => 'Refund ditolak: ' . $request->rejection_reason,
                'ip_address' => $request->ip(),
            ]);
            $bookingLog->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Refund berhasil ditolak',
                'data' => $refund->fresh()
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error rejecting refund', [
                'refund_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function complete(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'transaction_id' => 'required|string|max:100',
            'notes' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $refund = Refund::findOrFail($id);

            if ($refund->status !== 'APPROVED') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya refund dengan status APPROVED yang bisa diselesaikan'
                ], 422);
            }

            DB::beginTransaction();

            // Update status refund
            $refund->status = 'COMPLETED';
            $refund->transaction_id = $request->transaction_id;
            if ($request->notes) {
                $refund->notes = $refund->notes . "\nCompletion Notes: " . $request->notes;
            }
            $refund->save();

            // Create booking log
            $bookingLog = new BookingLog([
                'booking_id' => $refund->booking_id,
                'previous_status' => 'REFUNDED',
                'new_status' => 'REFUNDED',
                'changed_by_type' => 'ADMIN',
                'changed_by_id' => Auth::id(),
                'notes' => 'Refund selesai dengan ID transaksi: ' . $request->transaction_id,
                'ip_address' => $request->ip(),
            ]);
            $bookingLog->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Refund berhasil diselesaikan',
                'data' => $refund->fresh()
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error completing refund', [
                'refund_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}
