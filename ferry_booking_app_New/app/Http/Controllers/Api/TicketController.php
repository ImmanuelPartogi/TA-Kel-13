<?php

// app/Http/Controllers/Api/TicketController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $tickets = Ticket::whereHas('booking', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->with(['booking.schedule.route', 'booking.schedule.ferry'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar tiket berhasil diambil',
            'data' => $tickets
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
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Tiket tidak ditemukan'
            ], 404);
        }

        if ($ticket->status !== 'ACTIVE') {
            return response()->json([
                'success' => false,
                'message' => 'Tiket tidak aktif'
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
