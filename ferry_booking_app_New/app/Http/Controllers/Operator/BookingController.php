<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingLog;
use App\Models\Payment;
use App\Models\ScheduleDate;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\ActivityLog;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $operator = Auth::guard('operator')->user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        $query = Booking::whereHas('schedule', function ($q) use ($assignedRouteIds) {
            $q->whereIn('route_id', $assignedRouteIds);
        })
            ->with(['user', 'schedule.route', 'schedule.ferry']);

        // Filter berdasarkan kode booking
        if ($request->has('booking_code') && $request->booking_code) {
            $query->where('booking_code', 'like', '%' . $request->booking_code . '%');
        }

        // Filter berdasarkan nama pengguna
        if ($request->has('user_name') && $request->user_name) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->user_name . '%');
            });
        }

        // Filter berdasarkan rute
        if ($request->has('route_id') && $request->route_id) {
            $query->whereHas('schedule', function ($q) use ($request) {
                $q->where('route_id', $request->route_id);
            });
        }

        // Filter berdasarkan status booking
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan tanggal booking
        if ($request->has('booking_date_from') && $request->booking_date_from) {
            $query->where('booking_date', '>=', $request->booking_date_from);
        }

        if ($request->has('booking_date_to') && $request->booking_date_to) {
            $query->where('booking_date', '<=', $request->booking_date_to);
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(10);

        return view('operator.bookings.index', compact('bookings'));
    }

    public function show($id)
    {
        $operator = Auth::guard('operator')->user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        $booking = Booking::whereHas('schedule', function ($q) use ($assignedRouteIds) {
            $q->whereIn('route_id', $assignedRouteIds);
        })
            ->where('id', $id)
            ->with([
                'user',
                'schedule.route',
                'schedule.ferry',
                'payments',
                'tickets',
                'vehicles',
                'bookingLogs',
            ])
            ->firstOrFail();

        return view('operator.bookings.show', compact('booking'));
    }

    public function updateStatus(Request $request, $id)
    {
        $operator = Auth::guard('operator')->user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        $booking = Booking::whereHas('schedule', function ($q) use ($assignedRouteIds) {
            $q->whereIn('route_id', $assignedRouteIds);
        })
            ->where('id', $id)
            ->firstOrFail();

        $request->validate([
            'status' => 'required|in:CONFIRMED,CANCELLED,COMPLETED',
            'cancellation_reason' => 'required_if:status,CANCELLED',
        ]);

        $previousStatus = $booking->status;

        // Validate status transition
        $allowedTransitions = [
            'PENDING' => ['CONFIRMED', 'CANCELLED'],
            'CONFIRMED' => ['COMPLETED', 'CANCELLED'],
        ];

        if (!isset($allowedTransitions[$booking->status]) || !in_array($request->status, $allowedTransitions[$booking->status])) {
            return redirect()->back()
                ->withErrors(['status' => 'Perubahan status tidak diizinkan']);
        }

        try {
            DB::beginTransaction();

            $booking->status = $request->status;

            if ($request->status === 'CANCELLED') {
                $booking->cancellation_reason = $request->cancellation_reason;

                // Update ticket status
                Ticket::where('booking_id', $booking->id)
                    ->update(['status' => 'CANCELLED']);

                // Free up space in schedule date
                $scheduleDate = ScheduleDate::where('schedule_id', $booking->schedule_id)
                    ->where('date', $booking->booking_date)
                    ->first();

                if ($scheduleDate) {
                    $scheduleDate->passenger_count -= $booking->passenger_count;

                    // Count vehicles by type
                    $vehicleCounts = [
                        'MOTORCYCLE' => 0,
                        'CAR' => 0,
                        'BUS' => 0,
                        'TRUCK' => 0
                    ];

                    foreach ($booking->vehicles as $vehicle) {
                        $vehicleCounts[$vehicle->type]++;
                    }

                    $scheduleDate->motorcycle_count -= $vehicleCounts['MOTORCYCLE'];
                    $scheduleDate->car_count -= $vehicleCounts['CAR'];
                    $scheduleDate->bus_count -= $vehicleCounts['BUS'];
                    $scheduleDate->truck_count -= $vehicleCounts['TRUCK'];

                    $scheduleDate->save();
                }
            } elseif ($request->status === 'COMPLETED') {
                // Update ticket status
                Ticket::where('booking_id', $booking->id)
                    ->update(['status' => 'USED']);
            }

            $booking->save();

            // Create booking log
            $bookingLog = new BookingLog([
                'booking_id' => $booking->id,
                'previous_status' => $previousStatus,
                'new_status' => $booking->status,
                'changed_by_type' => 'OPERATOR',
                'changed_by_id' => Auth::guard('operator')->id(),
                'notes' => $request->notes ?? 'Status diubah oleh operator',
                'ip_address' => $request->ip(),
            ]);

            $bookingLog->save();

            // Update payment status if needed
            if ($request->status === 'CONFIRMED' && $previousStatus === 'PENDING') {
                $payment = Payment::where('booking_id', $booking->id)
                    ->where('status', 'PENDING')
                    ->first();

                if ($payment) {
                    $payment->status = 'SUCCESS';
                    $payment->payment_date = now();
                    $payment->save();
                }
            } elseif ($request->status === 'CANCELLED') {
                $payment = Payment::where('booking_id', $booking->id)
                    ->where('status', 'PENDING')
                    ->first();

                if ($payment) {
                    $payment->status = 'FAILED';
                    $payment->save();
                }
            }

            DB::commit();

            return redirect()->route('operator.bookings.show', $id)
                ->with('success', 'Status booking berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat mengubah status booking: ' . $e->getMessage()]);
        }
    }

    public function checkInForm(Request $request)
    {
        $operator = Auth::guard('operator')->user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        $ticket = null;

        if ($request->has('ticket_code')) {
            $ticket = Ticket::where('ticket_code', $request->ticket_code)
                ->whereHas('booking', function ($q) use ($assignedRouteIds) {
                    $q->whereHas('schedule', function ($sq) use ($assignedRouteIds) {
                        $sq->whereIn('route_id', $assignedRouteIds);
                    });
                })
                ->with(['booking.user', 'booking.schedule.route', 'vehicle'])
                ->first();
        }

        return view('operator.bookings.check-in', compact('ticket'));
    }

    public function checkIn($bookingId)
    {
        $booking = Booking::findOrFail($bookingId);

        // Proses check-in
        $booking->status = 'CHECKED_IN';
        $booking->save();

        // Catat aktivitas
        ActivityLog::create([
            'user_id' => Auth::id(),
            'activity_type' => 'Check-in Penumpang',
            'description' => "Proses check-in tiket #{$booking->ticket_number} berhasil dilakukan",
            'status' => 'SUCCESS',
            'reference_id' => $booking->id,
            'reference_type' => 'booking'
        ]);

        return redirect()->back()->with('success', 'Check-in berhasil dilakukan');
    }

    public function processCheckIn(Request $request)
    {
        $request->validate([
            'ticket_code' => 'required|string',
        ]);

        $operator = Auth::guard('operator')->user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        $ticket = Ticket::where('ticket_code', $request->ticket_code)
            ->whereHas('booking', function ($q) use ($assignedRouteIds) {
                $q->whereHas('schedule', function ($sq) use ($assignedRouteIds) {
                    $sq->whereIn('route_id', $assignedRouteIds);
                });
            })
            ->with(['booking.user', 'booking.schedule.route'])
            ->first();

        if (!$ticket) {
            return redirect()->route('operator.bookings.check-in')
                ->withInput()
                ->withErrors(['ticket_code' => 'Tiket tidak ditemukan']);
        }

        // Verify booking is confirmed
        if ($ticket->booking->status !== 'CONFIRMED') {
            return redirect()->route('operator.bookings.check-in')
                ->withInput()
                ->withErrors(['ticket_code' => 'Booking belum dikonfirmasi']);
        }

        // Verify date matches
        $today = Carbon::today()->format('Y-m-d');
        $bookingDate = $ticket->booking->booking_date;

        if ($today !== $bookingDate) {
            return redirect()->route('operator.bookings.check-in')
                ->withInput()
                ->withErrors(['ticket_code' => 'Tiket tidak untuk hari ini. Tanggal tiket: ' . $bookingDate]);
        }

        // Process check-in
        $ticket->checked_in = true;
        $ticket->boarding_status = 'BOARDED';
        $ticket->boarding_time = now();
        $ticket->save();

        // Check if all tickets for the booking are checked in
        $allTicketsCheckedIn = Ticket::where('booking_id', $ticket->booking_id)
            ->where('checked_in', false)
            ->doesntExist();

        if ($allTicketsCheckedIn) {
            $ticket->booking->status = 'COMPLETED';
            $ticket->booking->save();

            // Create booking log
            $bookingLog = new BookingLog([
                'booking_id' => $ticket->booking_id,
                'previous_status' => 'CONFIRMED',
                'new_status' => 'COMPLETED',
                'changed_by_type' => 'OPERATOR',
                'changed_by_id' => Auth::guard('operator')->id(),
                'notes' => 'Semua penumpang telah check-in',
                'ip_address' => $request->ip(),
            ]);

            $bookingLog->save();
        }

        return redirect()->route('operator.bookings.check-in')
            ->with('success', 'Check-in berhasil untuk tiket ' . $ticket->ticket_code);
    }
}
