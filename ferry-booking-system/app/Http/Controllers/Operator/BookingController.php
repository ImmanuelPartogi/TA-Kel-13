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
use Illuminate\Support\Facades\Log;
use App\Models\Route;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $operator = Auth::guard('operator')->user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        // Log untuk debugging
        Log::info("Operator ID: " . $operator->id . " assigned routes: " . json_encode($assignedRouteIds));

        $query = Booking::query();

        // Filter berdasarkan assigned routes
        if (!empty($assignedRouteIds)) {
            $query->whereHas('schedule', function ($q) use ($assignedRouteIds) {
                $q->whereIn('route_id', $assignedRouteIds);
            });
        } else {
            // Jika operator tidak memiliki rute yang ditugaskan, buat query yang tidak mengembalikan hasil
            Log::warning("Operator tidak memiliki assigned routes. Operator ID: " . $operator->id);
            $query->whereRaw('1 = 0'); // Kondisi selalu false untuk memastikan tidak ada hasil
        }

        // Load relasi yang dibutuhkan
        $query->with(['user', 'schedule.route', 'schedule.ferry', 'payments', 'tickets']);

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
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan tanggal booking
        if ($request->has('departure_date_from') && $request->departure_date_from) {
            $query->where('departure_date', '>=', $request->departure_date_from);
        }

        if ($request->has('departure_date_to') && $request->departure_date_to) {
            $query->where('departure_date', '<=', $request->departure_date_to);
        }

        // Urutkan dan paginate hasil
        $bookings = $query->orderBy('created_at', 'desc')->paginate(10);

        // Get data rute untuk filter dropdown
        $routes = [];
        if (!empty($assignedRouteIds)) {
            $routes = Route::whereIn('id', $assignedRouteIds)->get(['id', 'origin', 'destination'])
                ->pluck('origin_destination', 'id')
                ->toArray();
        }

        // Tambahkan pesan jika operator tidak memiliki rute yang ditugaskan
        $noRouteAssigned = empty($assignedRouteIds);

        return view('operator.bookings.index', compact('bookings', 'routes', 'noRouteAssigned'));
    }

    public function show($id)
    {
        $operator = Auth::guard('operator')->user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        try {
            // Jika operator tidak memiliki rute yang ditugaskan, kembalikan error
            if (empty($assignedRouteIds)) {
                Log::warning("Operator ID: " . $operator->id . " mencoba mengakses booking tanpa rute yang ditugaskan");
                return redirect()->route('operator.bookings.index')
                    ->with('error', 'Anda tidak memiliki akses ke booking ini karena belum ada rute yang ditugaskan');
            }

            // Langsung filter berdasarkan rute
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
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error("Booking tidak ditemukan atau operator tidak memiliki akses: " . $id);
            return redirect()->route('operator.bookings.index')
                ->with('error', 'Booking tidak ditemukan atau Anda tidak memiliki akses ke booking ini');
        }
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
                    ->where('date', $booking->departure_date)
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

        Log::info("Operator ID: " . $operator->id . " assigned routes: " . json_encode($assignedRouteIds));

        $ticket = null;
        $inputCode = $request->ticket_code;

        if ($request->has('ticket_code')) {
            // Cek apakah input adalah kode tiket
            $ticketByCode = Ticket::where('ticket_code', $inputCode)->first();

            // Jika tidak ditemukan, coba cari dengan kode booking
            if (!$ticketByCode) {
                $bookingByCode = Booking::where('booking_code', $inputCode)->first();

                if ($bookingByCode) {
                    Log::info("Booking ditemukan: " . $bookingByCode->booking_code . ", mencari tiket terkait");
                    // Ambil tiket pertama dari booking tersebut
                    $ticketByCode = Ticket::where('booking_id', $bookingByCode->id)->first();
                }
            }

            if ($ticketByCode) {
                Log::info("Tiket ditemukan: " . $ticketByCode->ticket_code . ", Booking ID: " . $ticketByCode->booking_id);

                // Terapkan filter assigned routes jika perlu
                $ticketQuery = Ticket::where('id', $ticketByCode->id);

                if (!empty($assignedRouteIds)) {
                    $ticketQuery->whereHas('booking', function ($q) use ($assignedRouteIds) {
                        $q->whereHas('schedule', function ($sq) use ($assignedRouteIds) {
                            $sq->whereIn('route_id', $assignedRouteIds);
                        });
                    });
                }

                $ticket = $ticketQuery->with(['booking.user', 'booking.schedule.route', 'vehicle'])->first();

                if (!$ticket && Booking::where('booking_code', $inputCode)->exists()) {
                    // Jika tiket tidak ditemukan karena masalah assigned routes
                    Log::warning("Operator tidak memiliki akses ke rute tiket dengan kode booking: " . $inputCode);
                }
            } else {
                Log::warning("Tidak ditemukan tiket atau booking dengan kode: " . $inputCode);
            }
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

        Log::info("Processing check-in for ticket: " . $request->ticket_code);

        // Cek tiket tanpa filter dulu
        $rawTicket = Ticket::where('ticket_code', $request->ticket_code)->first();

        if (!$rawTicket) {
            Log::warning("Tiket tidak ditemukan: " . $request->ticket_code);
            return redirect()->route('operator.bookings.check-in')
                ->withInput()
                ->withErrors(['ticket_code' => 'Tiket tidak ditemukan']);
        }

        // Baru terapkan filter assigned routes jika ada dan tidak kosong
        $ticketQuery = Ticket::where('ticket_code', $request->ticket_code);

        if (!empty($assignedRouteIds)) {
            $ticketQuery->whereHas('booking', function ($q) use ($assignedRouteIds) {
                $q->whereHas('schedule', function ($sq) use ($assignedRouteIds) {
                    $sq->whereIn('route_id', $assignedRouteIds);
                });
            });
        }

        $ticket = $ticketQuery->with(['booking.user', 'booking.schedule.route'])->first();

        if (!$ticket) {
            Log::warning("Tiket tidak ditemukan dengan filter rute: " . $request->ticket_code);
            if (!empty($assignedRouteIds)) {
                Log::warning("Operator ID: " . $operator->id . " tidak memiliki akses ke rute tiket ini");
            }
            return redirect()->route('operator.bookings.check-in')
                ->withInput()
                ->withErrors(['ticket_code' => 'Tiket tidak ditemukan atau operator tidak memiliki akses ke rute ini']);
        }

        // Verify booking is confirmed
        if ($ticket->booking->status !== 'CONFIRMED') {
            return redirect()->route('operator.bookings.check-in')
                ->withInput()
                ->withErrors(['ticket_code' => 'Booking belum dikonfirmasi']);
        }

        // Verify date matches - PERBAIKAN DI SINI
        $today = Carbon::today()->format('Y-m-d');
        $bookingDate = Carbon::parse($ticket->booking->departure_date)->format('Y-m-d');

        Log::info("Comparing dates - Today: " . $today . " vs Booking Date: " . $bookingDate);

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

    /**
     * Sinkronisasi status booking berdasarkan status tiket dan tanggal keberangkatan
     */
    public function syncBookingStatus($id = null)
    {
        try {
            $query = Booking::query();

            // Jika ID diberikan, hanya sync booking tersebut
            if ($id) {
                $query->where('id', $id);
            } else {
                // Hanya sync booking dengan status CONFIRMED
                $query->where('status', 'CONFIRMED');
            }

            $bookings = $query->with('tickets')->get();
            $count = 0;

            foreach ($bookings as $booking) {
                $allTicketsExpired = $booking->tickets->isNotEmpty() &&
                    $booking->tickets->every(function ($ticket) {
                        return $ticket->status === 'EXPIRED';
                    });

                $departureDate = Carbon::parse($booking->departure_date);
                $isDatePassed = $departureDate->endOfDay()->isPast();

                // Jika semua tiket expired atau tanggal keberangkatan sudah lewat
                if ($allTicketsExpired || $isDatePassed) {
                    // Update status booking jika masih CONFIRMED
                    if ($booking->status === 'CONFIRMED') {
                        $booking->status = 'EXPIRED';
                        $booking->save();
                        $count++;

                        // Log perubahan
                        Log::info('Booking status updated to EXPIRED', [
                            'booking_id' => $booking->id,
                            'booking_code' => $booking->booking_code,
                            'reason' => $allTicketsExpired ? 'All tickets expired' : 'Departure date passed'
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Sinkronisasi status booking berhasil. $count booking diperbarui.",
                'updated_count' => $count
            ]);
        } catch (\Exception $e) {
            Log::error('Error syncing booking status', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyinkronkan status booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update status tiket menjadi EXPIRED saat tanggal keberangkatan lewat
     */
    public function expireTickets()
    {
        try {
            // Cari booking dengan tanggal keberangkatan lewat dan status CONFIRMED
            $bookings = Booking::where('status', 'CONFIRMED')
                ->whereDate('departure_date', '<', Carbon::today())
                ->with('tickets')
                ->get();

            $ticketCount = 0;
            $bookingCount = 0;

            foreach ($bookings as $booking) {
                // Update semua tiket menjadi EXPIRED
                $updated = Ticket::where('booking_id', $booking->id)
                    ->where('status', '!=', 'EXPIRED')
                    ->update(['status' => 'EXPIRED']);

                if ($updated > 0) {
                    $ticketCount += $updated;
                    $bookingCount++;

                    Log::info('Tickets expired automatically', [
                        'booking_id' => $booking->id,
                        'ticket_count' => $updated
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => "$ticketCount tiket dari $bookingCount booking diupdate menjadi EXPIRED",
                'expired_tickets' => $ticketCount,
                'affected_bookings' => $bookingCount
            ]);
        } catch (\Exception $e) {
            Log::error('Error expiring tickets', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengupdate status tiket',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
