<?php

namespace App\Http\Controllers\Api\Operator;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingLog;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CheckInController extends Controller
{
    /**
     * Validasi tiket sebelum proses check-in
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validateTicket(Request $request)
    {
        $operator = Auth::user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        if (empty($assignedRouteIds)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Operator tidak memiliki akses ke rute manapun',
            ], 403);
        }

        // Validasi input parameter
        $validator = Validator::make($request->all(), [
            'ticket_code' => 'required_without_all:passenger_name,passenger_id|string',
            'passenger_name' => 'required_without_all:ticket_code,passenger_id|string',
            'passenger_id' => 'required_without_all:ticket_code,passenger_name|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $ticket = null;

            // Cari berdasarkan kode tiket
            if ($request->has('ticket_code')) {
                $ticket = Ticket::where('ticket_code', $request->ticket_code)
                    ->whereHas('booking.schedule', function ($query) use ($assignedRouteIds) {
                        $query->whereIn('route_id', $assignedRouteIds);
                    })
                    ->with([
                        'booking.schedule.route',
                        'booking.schedule.ferry',
                        'booking.user',
                        'booking.vehicles',
                        'vehicle'
                    ])
                    ->first();
            }
            // Cari berdasarkan nama penumpang
            else if ($request->has('passenger_name')) {
                $ticket = Ticket::where('passenger_name', 'like', '%' . $request->passenger_name . '%')
                    ->whereHas('booking.schedule', function ($query) use ($assignedRouteIds) {
                        $query->whereIn('route_id', $assignedRouteIds);
                    })
                    ->with([
                        'booking.schedule.route',
                        'booking.schedule.ferry',
                        'booking.user',
                        'booking.vehicles',
                        'vehicle'
                    ])
                    ->first();
            }
            // Cari berdasarkan ID penumpang
            else if ($request->has('passenger_id')) {
                $ticket = Ticket::where('passenger_id_number', $request->passenger_id)
                    ->whereHas('booking.schedule', function ($query) use ($assignedRouteIds) {
                        $query->whereIn('route_id', $assignedRouteIds);
                    })
                    ->with([
                        'booking.schedule.route',
                        'booking.schedule.ferry',
                        'booking.user',
                        'booking.vehicles',
                        'vehicle'
                    ])
                    ->first();
            }

            if (!$ticket) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tiket tidak ditemukan',
                ], 404);
            }

            // Validasi tanggal keberangkatan
            $departureDate = Carbon::parse($ticket->booking->departure_date)->startOfDay();
            $currentDate = Carbon::now()->startOfDay();

            // Tiket hanya valid di tanggal keberangkatan atau satu hari sebelumnya
            if ($departureDate->diffInDays($currentDate, false) > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tiket sudah tidak valid, tanggal keberangkatan telah lewat',
                ], 400);
            }

            if ($departureDate->diffInDays($currentDate, false) < -1) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Check-in hanya dapat dilakukan H-1 atau hari keberangkatan',
                ], 400);
            }

            // Log aktivitas pencarian tiket
            Log::info('Operator ' . $operator->name . ' melakukan validasi tiket: ' . ($request->ticket_code ?? $request->passenger_name ?? $request->passenger_id));

            return response()->json([
                'status' => 'success',
                'data' => [
                    'ticket' => $ticket,
                ],
                'message' => 'Tiket berhasil ditemukan'
            ]);
        } catch (\Exception $e) {
            Log::error('Error validating ticket: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat memvalidasi tiket: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Proses check-in penumpang
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function process(Request $request)
    {
        $operator = Auth::user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        if (empty($assignedRouteIds)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Operator tidak memiliki akses ke rute manapun',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'ticket_code' => 'required|string',
            'signature' => 'nullable|string',
            'location' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Cari tiket yang akan di-check-in
            $ticket = Ticket::where('ticket_code', $request->ticket_code)
                ->whereHas('booking.schedule', function ($query) use ($assignedRouteIds) {
                    $query->whereIn('route_id', $assignedRouteIds);
                })
                ->with('booking')
                ->first();

            if (!$ticket) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tiket tidak ditemukan'
                ], 404);
            }

            // Periksa status tiket dan booking
            if ($ticket->status !== 'ACTIVE') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tiket tidak aktif, status saat ini: ' . $ticket->status
                ], 400);
            }

            if ($ticket->booking->status !== 'CONFIRMED') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Booking belum dikonfirmasi, status saat ini: ' . $ticket->booking->status
                ], 400);
            }

            if ($ticket->checked_in) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Penumpang sudah melakukan check-in sebelumnya pada: ' .
                        Carbon::parse($ticket->boarding_time)->format('d M Y H:i')
                ], 400);
            }

            // Proses check-in
            $now = Carbon::now();
            $ticket->checked_in = true;
            $ticket->boarding_time = $now;

            // Simpan data tambahan check-in
            $checkInData = [
                'location' => $request->location ?? 'Check-in Counter',
                'operator_id' => $operator->id,
                'operator_name' => $operator->name,
            ];

            // Simpan tanda tangan jika ada
            if ($request->has('signature') && !empty($request->signature)) {
                // Simpan tanda tangan sebagai file
                $signatureData = $request->signature;
                $signatureImage = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $signatureData));

                $signaturePath = 'signatures/ticket_' . $ticket->id . '_' . Str::random(8) . '.png';
                Storage::disk('public')->put($signaturePath, $signatureImage);

                $checkInData['signature_path'] = $signaturePath;
            }

            $ticket->check_in_data = json_encode($checkInData);
            $ticket->save();

            // Periksa apakah semua tiket dalam booking sudah check-in
            $allTicketsCheckedIn = Ticket::where('booking_id', $ticket->booking_id)
                ->where('checked_in', false)
                ->doesntExist();

            // Jika semua tiket sudah check-in, update status booking jadi COMPLETED
            if ($allTicketsCheckedIn) {
                $booking = Booking::find($ticket->booking_id);
                $previousStatus = $booking->status;
                $booking->status = 'COMPLETED';
                $booking->save();

                // Log perubahan status booking
                $bookingLog = new BookingLog([
                    'booking_id' => $booking->id,
                    'previous_status' => $previousStatus,
                    'new_status' => 'COMPLETED',
                    'changed_by_type' => 'OPERATOR',
                    'changed_by_id' => $operator->id,
                    'notes' => 'Semua penumpang telah melakukan check-in, status booking diubah menjadi COMPLETED',
                    'ip_address' => $request->ip(),
                ]);
                $bookingLog->save();
            }

            // Log aktivitas check-in
            Log::info('Operator ' . $operator->name . ' melakukan check-in tiket: ' . $request->ticket_code);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Check-in berhasil dilakukan',
                'data' => [
                    'ticket' => $ticket,
                    'check_in_time' => $now->format('Y-m-d H:i:s'),
                    'operator' => $operator->name,
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing check-in: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat proses check-in: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan riwayat check-in terbaru
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRecentCheckIns(Request $request)
    {
        $operator = Auth::user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        if (empty($assignedRouteIds)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Operator tidak memiliki akses ke rute manapun',
            ], 403);
        }

        try {
            // Ambil check-in terbaru di rute yang ditugaskan ke operator
            $recentCheckIns = Ticket::whereNotNull('boarding_time')
                ->where('checked_in', true)
                ->whereHas('booking.schedule', function ($query) use ($assignedRouteIds) {
                    $query->whereIn('route_id', $assignedRouteIds);
                })
                ->with(['booking.schedule.route', 'booking.schedule.ferry'])
                ->orderBy('boarding_time', 'desc')
                ->take(10)
                ->get()
                ->map(function ($ticket) {
                    return [
                        'ticket_code' => $ticket->ticket_code,
                        'passenger_name' => $ticket->passenger_name,
                        'route' => $ticket->booking->schedule->route->origin . ' → ' . $ticket->booking->schedule->route->destination,
                        'ferry' => $ticket->booking->schedule->ferry->name,
                        'departure_date' => $ticket->booking->departure_date,
                        'boarding_time' => $ticket->boarding_time,
                        'check_in_data' => json_decode($ticket->check_in_data),
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'recent_check_ins' => $recentCheckIns,
                ],
                'message' => 'Berhasil mendapatkan riwayat check-in terbaru'
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting recent check-ins: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mendapatkan riwayat check-in: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan statistik check-in
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCheckInStats(Request $request)
    {
        $operator = Auth::user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        if (empty($assignedRouteIds)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Operator tidak memiliki akses ke rute manapun',
            ], 403);
        }

        try {
            // Ambil statistik untuk hari ini
            $today = Carbon::now()->startOfDay();
            $todayStats = Ticket::whereDate('boarding_time', $today)
                ->where('checked_in', true)
                ->whereHas('booking.schedule', function ($query) use ($assignedRouteIds) {
                    $query->whereIn('route_id', $assignedRouteIds);
                })
                ->count();

            // Ambil total tiket untuk hari ini
            $totalTodayTickets = Ticket::whereHas('booking', function ($query) use ($today) {
                $query->whereDate('departure_date', $today);
            })
                ->whereHas('booking.schedule', function ($query) use ($assignedRouteIds) {
                    $query->whereIn('route_id', $assignedRouteIds);
                })
                ->count();

            // Ambil statistik untuk 7 hari terakhir
            $lastWeek = Carbon::now()->subDays(7)->startOfDay();
            $weeklyStats = Ticket::where('boarding_time', '>=', $lastWeek)
                ->where('checked_in', true)
                ->whereHas('booking.schedule', function ($query) use ($assignedRouteIds) {
                    $query->whereIn('route_id', $assignedRouteIds);
                })
                ->count();

            // Statistik berdasarkan rute
            $routeStats = DB::table('tickets')
                ->join('bookings', 'tickets.booking_id', '=', 'bookings.id')
                ->join('schedules', 'bookings.schedule_id', '=', 'schedules.id')
                ->join('routes', 'schedules.route_id', '=', 'routes.id')
                ->whereIn('routes.id', $assignedRouteIds)
                ->where('tickets.checked_in', true)
                ->whereDate('tickets.boarding_time', $today)
                ->select('routes.id', 'routes.origin', 'routes.destination', DB::raw('count(*) as total'))
                ->groupBy('routes.id', 'routes.origin', 'routes.destination')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'today' => [
                        'checked_in' => $todayStats,
                        'total' => $totalTodayTickets,
                        'percentage' => $totalTodayTickets > 0 ? round(($todayStats / $totalTodayTickets) * 100, 1) : 0
                    ],
                    'weekly' => $weeklyStats,
                    'routes' => $routeStats
                ],
                'message' => 'Berhasil mendapatkan statistik check-in'
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting check-in stats: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mendapatkan statistik check-in: ' . $e->getMessage()
            ], 500);
        }
    }
}
