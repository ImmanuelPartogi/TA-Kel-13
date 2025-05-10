<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Refund;
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

        $refunds = $query->orderBy('created_at', 'desc')->paginate(10);

        return view('admin.refunds.index', compact('refunds'));
    }

    public function show($id)
    {
        $refund = Refund::with(['booking.user', 'booking.schedule.route', 'booking.schedule.ferry', 'payment'])->findOrFail($id);
        return view('admin.refunds.show', compact('refund'));
    }

    public function create($bookingId)
    {
        $booking = Booking::with(['user', 'schedule.route', 'schedule.ferry', 'payments', 'vehicles'])
            ->findOrFail($bookingId);

        // Validasi booking yang bisa direfund
        if (!in_array($booking->status, ['CONFIRMED', 'COMPLETED'])) {
            return redirect()->route('admin.bookings.show', $bookingId)
                ->with('error', 'Hanya booking dengan status CONFIRMED atau COMPLETED yang dapat direfund');
        }

        $payment = $booking->payments()->where('status', 'SUCCESS')->first();
        if (!$payment) {
            return redirect()->route('admin.bookings.show', $bookingId)
                ->with('error', 'Tidak ditemukan pembayaran yang berhasil untuk booking ini');
        }

        return view('admin.refunds.create', compact('booking', 'payment'));
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
            return redirect()->back()->with('error', 'Pembayaran tidak ditemukan');
        }

        // Validasi jumlah refund
        if ($request->amount > $booking->total_amount) {
            return redirect()->back()->with('error', 'Jumlah refund tidak boleh melebihi total pembayaran');
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

            return redirect()->route('admin.refunds.show', $refund->id)
                ->with('success', 'Permohonan refund berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function approve(Request $request, $id)
    {
        $refund = Refund::findOrFail($id);

        if ($refund->status !== 'PENDING') {
            return redirect()->back()->with('error', 'Hanya refund dengan status PENDING yang bisa diproses');
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
            $bookingLog = new \App\Models\BookingLog([
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

            return redirect()->route('admin.refunds.show', $id)
                ->with('success', 'Refund berhasil disetujui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:255',
        ]);

        $refund = Refund::findOrFail($id);

        if ($refund->status !== 'PENDING') {
            return redirect()->back()->with('error', 'Hanya refund dengan status PENDING yang bisa diproses');
        }

        DB::beginTransaction();

        try {
            // Update status refund
            $refund->status = 'REJECTED';
            $refund->reason .= ' | Ditolak: ' . $request->rejection_reason;
            $refund->save();

            // Create booking log
            $bookingLog = new \App\Models\BookingLog([
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

            return redirect()->route('admin.refunds.show', $id)
                ->with('success', 'Refund berhasil ditolak');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function complete(Request $request, $id)
    {
        $request->validate([
            'transaction_id' => 'required|string|max:100',
        ]);

        $refund = Refund::findOrFail($id);

        if ($refund->status !== 'APPROVED') {
            return redirect()->back()->with('error', 'Hanya refund dengan status APPROVED yang bisa diselesaikan');
        }

        DB::beginTransaction();

        try {
            // Update status refund
            $refund->status = 'COMPLETED';
            $refund->transaction_id = $request->transaction_id;
            $refund->save();

            // Create booking log
            $bookingLog = new \App\Models\BookingLog([
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

            return redirect()->route('admin.refunds.show', $id)
                ->with('success', 'Refund berhasil diselesaikan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
