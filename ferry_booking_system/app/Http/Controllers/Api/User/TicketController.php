<?php

// app/Http/Controllers/Api/TicketController.php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class TicketController extends Controller
{
    // Helper function untuk mengecek dan mengupdate status tiket
    private function checkAndUpdateTicketStatus($ticket)
    {
        // Jika tiket masih aktif dan belum di-check in
        if ($ticket->status === 'ACTIVE') {
            // Pastikan booking dan schedule sudah di-load
            if (!$ticket->relationLoaded('booking') || !$ticket->booking->relationLoaded('schedule')) {
                $ticket->load(['booking.schedule']);
            }

            // Ambil tanggal booking sebagai tanggal keberangkatan
            $bookingDate = Carbon::parse($ticket->booking->booking_date);
            $departureTime = $ticket->booking->schedule->departure_time;

            // Pastikan format waktu konsisten
            if ($departureTime instanceof \Carbon\Carbon) {
                $departureTimeString = $departureTime->format('H:i:s');
            } else {
                $departureTimeString = $departureTime;
            }

            // Gabungkan tanggal dan waktu keberangkatan
            $departureDateTime = Carbon::parse($bookingDate->format('Y-m-d') . ' ' . $departureTimeString);
            $currentTime = Carbon::now();

            // PERUBAHAN: Periksa jika tanggal keberangkatan sudah lewat
            // atau jika hari ini dan waktu keberangkatan sudah lewat
            if ($bookingDate->isPast() ||
                ($bookingDate->isSameDay(Carbon::today()) && $departureDateTime->isPast())) {
                // Update status menjadi EXPIRED
                $ticket->status = 'EXPIRED';
                $ticket->boarding_status = 'MISSED';
                $ticket->save();

                Log::info('Tiket status diubah menjadi EXPIRED (dari controller)', [
                    'ticket_id' => $ticket->id,
                    'ticket_code' => $ticket->ticket_code,
                    'booking_date' => $bookingDate->format('Y-m-d'),
                    'departure_datetime' => $departureDateTime->format('Y-m-d H:i:s'),
                    'current_time' => $currentTime->format('Y-m-d H:i:s')
                ]);
            }
        }

        return $ticket;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $tickets = Ticket::whereHas('booking', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->with(['booking.schedule.route', 'booking.schedule.ferry'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Periksa dan update status tiket yang sudah lewat waktu keberangkatan
        $updatedTickets = $tickets->map(function ($ticket) {
            return $this->checkAndUpdateTicketStatus($ticket);
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar tiket berhasil diambil',
            'data' => $updatedTickets
        ], 200);
    }

    public function show($id)
    {
        $user = request()->user();
        $ticket = Ticket::whereHas('booking', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->with(['booking.schedule.route', 'booking.schedule.ferry', 'vehicle'])
            ->findOrFail($id);

        // Periksa dan update status tiket jika perlu
        $ticket = $this->checkAndUpdateTicketStatus($ticket);

        return response()->json([
            'success' => true,
            'message' => 'Detail tiket berhasil diambil',
            'data' => $ticket
        ], 200);
    }

    public function checkIn($ticketCode)
    {
        $user = request()->user();
        $ticket = Ticket::where('ticket_code', $ticketCode)
            ->whereHas('booking', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['booking.schedule']) // Load relasi schedule untuk cek waktu
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Tiket tidak ditemukan'
            ], 404);
        }

        // Cek status tiket terlebih dahulu
        $ticket = $this->checkAndUpdateTicketStatus($ticket);

        if ($ticket->status !== 'ACTIVE') {
            return response()->json([
                'success' => false,
                'message' => $ticket->status === 'EXPIRED' ?
                    'Tiket sudah kadaluarsa (jadwal keberangkatan telah lewat)' :
                    'Tiket tidak aktif'
            ], 400);
        }

        if ($ticket->checked_in) {
            return response()->json([
                'success' => false,
                'message' => 'Tiket sudah di-check in'
            ], 400);
        }

        // Update status tiket
        $ticket->checked_in = true;
        $ticket->save();

        return response()->json([
            'success' => true,
            'message' => 'Check-in berhasil',
            'data' => $ticket
        ], 200);
    }
}
