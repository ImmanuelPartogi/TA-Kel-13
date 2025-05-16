<?php

namespace App\Http\Controllers\Api\Operator;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingLog;
use App\Models\Payment;
use App\Models\ScheduleDate;
use App\Models\Ticket;
use App\Models\Route;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CheckInController extends Controller
{
    /**
     * Validasi ticket/booking untuk check-in
     */
    public function validateCheckIn(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ticket_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $operator = Auth::user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        // Check if it's a ticket code or booking code
        $code = $request->ticket_code;
        $ticket = null;
        $booking = null;

        if (strpos($code, 'TKT-') === 0) {
            // It's a ticket code
            $ticket = Ticket::where('ticket_code', $code)
                ->with(['booking.schedule.route', 'booking.vehicles', 'vehicle'])
                ->first();

            if (!$ticket) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tiket tidak ditemukan'
                ], 404);
            }

            $booking = $ticket->booking;
        } else {
            // It's a booking code
            $booking = Booking::where('booking_code', $code)
                ->with(['tickets', 'vehicles', 'schedule.route'])
                ->first();

            if (!$booking) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Booking tidak ditemukan'
                ], 404);
            }
        }

        // Check if operator has access to this route
        if (!in_array($booking->schedule->route_id, $assignedRouteIds)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke rute ini'
            ], 403);
        }

        // Verify booking is confirmed
        if ($booking->status !== 'CONFIRMED') {
            return response()->json([
                'status' => 'error',
                'message' => 'Booking belum dikonfirmasi',
                'booking_status' => $booking->status
            ], 400);
        }

        // Verify date is today
        $today = Carbon::today()->format('Y-m-d');
        $bookingDate = Carbon::parse($booking->departure_date)->format('Y-m-d');

        if ($today !== $bookingDate) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tiket tidak untuk hari ini. Tanggal tiket: ' . $bookingDate,
                'booking_date' => $bookingDate,
                'today' => $today
            ], 400);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Valid untuk check-in',
            'data' => [
                'ticket' => $ticket,
                'booking' => $booking
            ]
        ]);
    }

    /**
     * Proses check-in
     */
    public function process(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ticket_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $operator = Auth::user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        // Get the ticket
        $code = $request->ticket_code;
        $ticket = null;
        $booking = null;

        if (strpos($code, 'TKT-') === 0) {
            // It's a ticket code
            $ticket = Ticket::where('ticket_code', $code)->with('booking')->first();

            if (!$ticket) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tiket tidak ditemukan'
                ], 404);
            }

            $booking = $ticket->booking;
        } else {
            // It's a booking code - check in all tickets
            $booking = Booking::where('booking_code', $code)->with('tickets')->first();

            if (!$booking) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Booking tidak ditemukan'
                ], 404);
            }
        }

        // Check if operator has access to this route
        if (!in_array($booking->schedule->route_id, $assignedRouteIds)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke rute ini'
            ], 403);
        }

        try {
            DB::beginTransaction();

            if ($ticket) {
                // Check in single ticket
                if ($ticket->checked_in) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Tiket sudah melakukan check-in'
                    ], 400);
                }

                $ticket->checked_in = true;
                $ticket->boarding_status = 'BOARDED';
                $ticket->boarding_time = now();
                $ticket->save();

                // Check if all tickets are checked in
                $allCheckedIn = Ticket::where('booking_id', $booking->id)
                    ->where('checked_in', false)
                    ->count() === 0;

                if ($allCheckedIn) {
                    $booking->status = 'COMPLETED';
                    $booking->save();
                }
            } else {
                // Check in all tickets in the booking
                foreach ($booking->tickets as $ticket) {
                    if (!$ticket->checked_in) {
                        $ticket->checked_in = true;
                        $ticket->boarding_status = 'BOARDED';
                        $ticket->boarding_time = now();
                        $ticket->save();
                    }
                }

                $booking->status = 'COMPLETED';
                $booking->save();
            }

            // Create booking log
            $bookingLog = new BookingLog([
                'booking_id' => $booking->id,
                'previous_status' => $booking->status === 'COMPLETED' ? 'CONFIRMED' : $booking->status,
                'new_status' => $booking->status,
                'changed_by_type' => 'OPERATOR',
                'changed_by_id' => Auth::id(),
                'notes' => 'Check-in oleh operator',
                'ip_address' => $request->ip(),
            ]);

            $bookingLog->save();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Check-in berhasil',
                'data' => [
                    'ticket' => $ticket,
                    'booking' => $booking
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat melakukan check-in: ' . $e->getMessage()
            ], 500);
        }
    }
}
