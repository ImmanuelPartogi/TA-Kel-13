<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\BookingLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

        return response()->json($refunds);
    }

    public function show($id)
    {
        $refund = Refund::with(['booking.user', 'booking.schedule.route', 'booking.schedule.ferry', 'payment'])->findOrFail($id);

        return response()->json($refund);
    }

    public function getRefundForm($bookingId)
    {
        $booking = Booking::with(['user', 'schedule.route', 'schedule.ferry', 'payments', 'vehicles'])
            ->findOrFail($bookingId);

        // Validasi booking yang bisa direfund
        if (!in_array($booking->status, ['CONFIRMED', 'COMPLETED'])) {
            return response()->json([
                'message' => 'Hanya booking dengan status CONFIRMED atau COMPLETED yang dapat direfund'
            ], 422);
        }

        $payment = $booking->payments()->where('status', 'SUCCESS')->first();
        if (!$payment) {
            return response()->json([
                'message' => 'Tidak ditemukan pembayaran yang berhasil untuk booking ini'
            ], 422);
        }

        return response()->json([
            'booking' => $booking,
            'payment' => $payment
        ]);
    }

    public function store(Request $request, $bookingId)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'reason' => 'required|string',
            'refund_method' => 'required|in:ORIGINAL_PAYMENT_METHOD,BANK_TRANSFER,CASH',
            'bank_name' => 'required_if:refund_method,BANK_TRANSFER',
            'bank_account_number' => 'required_if:refund_method,BANK_TRANSFER',
            'bank_account_name' => 'required_if:refund_method,BANK_TRANSFER',
        ]);

        $booking = Booking::findOrFail($bookingId);
        $payment = $booking->payments()->where('status', 'SUCCESS')->first();

        if (!$payment) {
            return response()->json([
                'message' => 'Pembayaran tidak ditemukan'
            ], 422);
        }

        // Validasi jumlah refund
        if ($request->amount > $booking->total_amount) {
            return response()->json([
                'message' => 'Jumlah refund tidak boleh melebihi total pembayaran'
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Buat refund
            $refund = new Refund([
                'booking_id' => $booking->id,
                'payment_id' => $payment->id,
                'amount' => $request->amount,
                'reason' => $request->reason,
                'status' => 'PENDING',
                'refunded_by' => Auth::id(),
                'refund_method' => $request->refund_method,
            ]);

            // Tambahkan info bank jika metode refund adalah transfer bank
            if ($request->refund_method === 'BANK_TRANSFER') {
                $refund->bank_name = $request->bank_name;
                $refund->bank_account_number = $request->bank_account_number;
                $refund->bank_account_name = $request->bank_account_name;
            }

            $refund->save();

            DB::commit();

            return response()->json([
                'message' => 'Permohonan refund berhasil dibuat',
                'refund' => $refund
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function approve(Request $request, $id)
    {
        $refund = Refund::findOrFail($id);

        if ($refund->status !== 'PENDING') {
            return response()->json([
                'message' => 'Hanya refund dengan status PENDING yang bisa diproses'
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Update status refund
            $refund->status = 'APPROVED';
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
                'message' => 'Refund berhasil disetujui',
                'refund' => $refund->fresh(['booking', 'payment'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:255',
        ]);

        $refund = Refund::findOrFail($id);

        if ($refund->status !== 'PENDING') {
            return response()->json([
                'message' => 'Hanya refund dengan status PENDING yang bisa diproses'
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Update status refund
            $refund->status = 'REJECTED';
            $refund->reason .= ' | Ditolak: ' . $request->rejection_reason;
            $refund->save();

            // Create booking log
            $bookingLog = new BookingLog([
                'booking_id' => $refund->booking_id,
                'previous_status' => $refund->booking->status,
                'new_status' => $refund->booking->status,
                'changed_by_type' => 'ADMIN',
                'changed_by_id' => Auth::id(),
                'notes' => 'Refund ditolak: ' . $request->rejection_reason,
                'ip_address' => $request->ip(),
            ]);
            $bookingLog->save();

            DB::commit();

            return response()->json([
                'message' => 'Refund berhasil ditolak',
                'refund' => $refund->fresh()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function complete(Request $request, $id)
    {
        $request->validate([
            'transaction_id' => 'required|string|max:100',
        ]);

        $refund = Refund::findOrFail($id);

        if ($refund->status !== 'APPROVED') {
            return response()->json([
                'message' => 'Hanya refund dengan status APPROVED yang bisa diselesaikan'
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Update status refund
            $refund->status = 'COMPLETED';
            $refund->transaction_id = $request->transaction_id;
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
                'message' => 'Refund berhasil diselesaikan',
                'refund' => $refund->fresh()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}
