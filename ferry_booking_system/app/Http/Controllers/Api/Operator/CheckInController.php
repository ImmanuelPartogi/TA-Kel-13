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
        try {
            // Ambil data operator dan assigned routes
            $operator = Auth::user();
            $assignedRouteIds = $this->getAssignedRoutes($operator);

            // Log aktivitas operator
            Log::info('Operator check-in attempt', [
                'operator_id' => $operator->id,
                'operator_name' => $operator->name,
                'assigned_routes' => $assignedRouteIds,
                'search_params' => $request->only(['ticket_code', 'passenger_name', 'passenger_id'])
            ]);

            // Validasi akses operator ke rute
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

            // Cari tiket berdasarkan parameter yang diberikan
            $ticket = $this->findTicket($request, $assignedRouteIds);

            if (!$ticket) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tiket tidak ditemukan',
                ], 404);
            }

            // Validasi tanggal keberangkatan
            $validationResult = $this->validateDepartureDate($ticket);
            if ($validationResult !== true) {
                return response()->json([
                    'status' => 'error',
                    'message' => $validationResult,
                ], 400);
            }

            // Log aktivitas pencarian tiket berhasil
            Log::info('Ticket validation successful', [
                'operator' => $operator->name,
                'ticket_code' => $ticket->ticket_code,
                'passenger' => $ticket->passenger_name
            ]);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'ticket' => $ticket,
                ],
                'message' => 'Tiket berhasil ditemukan'
            ]);
        } catch (\Exception $e) {
            Log::error('Error validating ticket: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

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
        try {
            // Ambil data operator dan assigned routes
            $operator = Auth::user();
            $assignedRouteIds = $this->getAssignedRoutes($operator);

            // Validasi akses operator ke rute
            if (empty($assignedRouteIds)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Operator tidak memiliki akses ke rute manapun',
                ], 403);
            }

            // Validasi input
            $validator = Validator::make($request->all(), [
                'ticket_code' => 'required|string',
                'location' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

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

            // Validasi status tiket dan booking
            $statusValidation = $this->validateTicketStatus($ticket);
            if ($statusValidation !== true) {
                return response()->json([
                    'status' => 'error',
                    'message' => $statusValidation
                ], 400);
            }

            // Proses check-in
            $checkInResult = $this->performCheckIn($ticket, $operator, $request);

            // Cek apakah semua tiket dalam booking sudah check-in
            $this->updateBookingIfAllCheckedIn($ticket->booking_id);

            DB::commit();

            // Ambil data tiket yang sudah diperbarui
            $updatedTicket = Ticket::with([
                'booking.schedule.route',
                'booking.schedule.ferry',
                'booking.user',
                'vehicle'
            ])->find($ticket->id);

            return response()->json([
                'status' => 'success',
                'message' => 'Check-in berhasil dilakukan',
                'data' => [
                    'ticket' => $updatedTicket,
                    'check_in_time' => $ticket->boarding_time->format('Y-m-d H:i:s'),
                    'operator' => $operator->name,
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing check-in: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

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
        try {
            // Ambil data operator dan assigned routes
            $operator = Auth::user();
            $assignedRouteIds = $this->getAssignedRoutes($operator);

            // Validasi akses operator ke rute
            if (empty($assignedRouteIds)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Operator tidak memiliki akses ke rute manapun',
                ], 403);
            }

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
                        'check_in_data' => json_decode($ticket->watermark_data), // Gunakan watermark_data
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
            Log::error('Error getting recent check-ins: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

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
        try {
            // Ambil data operator dan assigned routes
            $operator = Auth::user();
            $assignedRouteIds = $this->getAssignedRoutes($operator);

            // Validasi akses operator ke rute
            if (empty($assignedRouteIds)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Operator tidak memiliki akses ke rute manapun',
                ], 403);
            }

            // Dapatkan tanggal hari ini
            $today = Carbon::now()->startOfDay();

            // Ambil statistik untuk hari ini
            $todayStats = $this->getTodayCheckInStats($assignedRouteIds, $today);

            // Ambil statistik untuk 7 hari terakhir
            $weeklyStats = $this->getWeeklyCheckInStats($assignedRouteIds);

            // Statistik berdasarkan rute
            $routeStats = $this->getRouteCheckInStats($assignedRouteIds, $today);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'today' => $todayStats,
                    'weekly' => $weeklyStats,
                    'routes' => $routeStats
                ],
                'message' => 'Berhasil mendapatkan statistik check-in'
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting check-in stats: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mendapatkan statistik check-in: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method untuk mendapatkan assigned routes dari operator
     *
     * @param mixed $operator
     * @return array
     */
    private function getAssignedRoutes($operator)
    {
        $rawAssignedRoutes = $operator->assigned_routes;
        $assignedRouteIds = [];

        // Parse assigned_routes dengan benar
        if (!empty($rawAssignedRoutes)) {
            if (is_string($rawAssignedRoutes)) {
                // Jika string JSON, parse menjadi array
                $decoded = json_decode($rawAssignedRoutes, true);
                $assignedRouteIds = $decoded !== null ? $decoded : [];
            } elseif (is_array($rawAssignedRoutes)) {
                // Jika sudah array, gunakan langsung
                $assignedRouteIds = $rawAssignedRoutes;
            }
        }

        // Pastikan semua nilai dalam array adalah integer
        return array_map('intval', (array)$assignedRouteIds);
    }

    /**
     * Helper method untuk mencari tiket berdasarkan parameter
     *
     * @param Request $request
     * @param array $assignedRouteIds
     * @return Ticket|null
     */
    private function findTicket(Request $request, array $assignedRouteIds)
    {
        $ticket = null;
        $query = Ticket::whereHas('booking.schedule', function ($query) use ($assignedRouteIds) {
            $query->whereIn('route_id', $assignedRouteIds);
        })->with([
            'booking.schedule.route',
            'booking.schedule.ferry',
            'booking.user',
            'booking.vehicles',
            'vehicle'
        ]);

        // Cari berdasarkan kode tiket
        if ($request->has('ticket_code')) {
            $ticket = $query->where('ticket_code', $request->ticket_code)->first();
        }
        // Cari berdasarkan nama penumpang
        else if ($request->has('passenger_name')) {
            $ticket = $query->where('passenger_name', 'like', '%' . $request->passenger_name . '%')->first();
        }
        // Cari berdasarkan ID penumpang
        else if ($request->has('passenger_id')) {
            $ticket = $query->where('passenger_id_number', $request->passenger_id)->first();
        }

        return $ticket;
    }

    /**
     * Helper method untuk validasi tanggal keberangkatan
     *
     * @param Ticket $ticket
     * @return bool|string
     */
    private function validateDepartureDate(Ticket $ticket)
    {
        $departureDate = Carbon::parse($ticket->booking->departure_date)->startOfDay();
        $currentDate = Carbon::now()->startOfDay();
        $diffInDays = $departureDate->diffInDays($currentDate, false);

        // Tiket tidak valid jika tanggal keberangkatan sudah lewat
        if ($diffInDays > 0) {
            return 'Tiket sudah tidak valid, tanggal keberangkatan telah lewat';
        }

        // Tiket hanya valid di hari H atau H-1
        if ($diffInDays < -1) {
            return 'Check-in hanya dapat dilakukan H-1 atau hari keberangkatan';
        }

        return true;
    }

    /**
     * Helper method untuk validasi status tiket
     *
     * @param Ticket $ticket
     * @return bool|string
     */
    private function validateTicketStatus(Ticket $ticket)
    {
        // Periksa status tiket
        if ($ticket->status !== 'ACTIVE') {
            return 'Tiket tidak aktif, status saat ini: ' . $ticket->status;
        }

        // Periksa status booking
        if ($ticket->booking->status !== 'CONFIRMED') {
            return 'Booking belum dikonfirmasi, status saat ini: ' . $ticket->booking->status;
        }

        // Periksa apakah sudah check-in
        if ($ticket->checked_in) {
            return 'Penumpang sudah melakukan check-in sebelumnya pada: ' .
                Carbon::parse($ticket->boarding_time)->format('d M Y H:i');
        }

        return true;
    }

    /**
     * Helper method untuk melakukan check-in
     *
     * @param Ticket $ticket
     * @param mixed $operator
     * @param Request $request
     * @return bool
     */
    private function performCheckIn(Ticket $ticket, $operator, Request $request)
    {
        // Update status check-in
        $ticket->checked_in = true;
        $ticket->boarding_time = Carbon::now();

        // Simpan informasi check-in
        $checkInData = [
            'location' => $request->location ?? 'Check-in Counter',
            'operator_id' => $operator->id,
            'operator_name' => $operator->name,
            'timestamp' => Carbon::now()->toIso8601String(),
            'ip_address' => $request->ip()
        ];

        $ticket->watermark_data = json_encode($checkInData); // Gunakan kolom watermark_data yang sudah ada
        $ticket->timestamps = false; // Hindari update timestamps
        $ticket->save();

        // Log aktivitas check-in
        Log::info('Check-in processed', [
            'operator' => $operator->name,
            'ticket_code' => $ticket->ticket_code,
            'passenger' => $ticket->passenger_name,
            'location' => $request->location ?? 'Check-in Counter'
        ]);

        return true;
    }

    /**
     * Helper method untuk update booking jika semua tiket sudah check-in
     *
     * @param int $bookingId
     * @return void
     */
    private function updateBookingIfAllCheckedIn($bookingId)
    {
        // Cek apakah semua tiket sudah check-in
        $allTicketsCheckedIn = Ticket::where('booking_id', $bookingId)
            ->where('checked_in', false)
            ->doesntExist();

        // Jika semua tiket sudah check-in, update status booking jadi COMPLETED
        if ($allTicketsCheckedIn) {
            $booking = Booking::find($bookingId);
            $previousStatus = $booking->status;

            // Update booking status
            $booking->timestamps = false;
            $booking->status = 'COMPLETED';
            $booking->save();

            // Log perubahan status booking
            $bookingLog = new BookingLog([
                'booking_id' => $bookingId,
                'previous_status' => $previousStatus,
                'new_status' => 'COMPLETED',
                'changed_by_type' => 'OPERATOR',
                'changed_by_id' => Auth::id(),
                'notes' => 'Semua penumpang telah melakukan check-in, status booking diubah menjadi COMPLETED',
                'ip_address' => request()->ip(),
            ]);
            $bookingLog->save();

            Log::info('Booking status updated to COMPLETED', [
                'booking_id' => $bookingId,
                'previous_status' => $previousStatus
            ]);
        }
    }

    /**
     * Helper method untuk mendapatkan statistik check-in hari ini
     *
     * @param array $assignedRouteIds
     * @param Carbon $today
     * @return array
     */
    private function getTodayCheckInStats(array $assignedRouteIds, Carbon $today)
    {
        // Ambil statistik untuk hari ini
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

        return [
            'checked_in' => $todayStats,
            'total' => $totalTodayTickets,
            'percentage' => $totalTodayTickets > 0 ? round(($todayStats / $totalTodayTickets) * 100, 1) : 0
        ];
    }

    /**
     * Helper method untuk mendapatkan statistik check-in mingguan
     *
     * @param array $assignedRouteIds
     * @return int
     */
    private function getWeeklyCheckInStats(array $assignedRouteIds)
    {
        // Ambil statistik untuk 7 hari terakhir
        $lastWeek = Carbon::now()->subDays(7)->startOfDay();
        return Ticket::where('boarding_time', '>=', $lastWeek)
            ->where('checked_in', true)
            ->whereHas('booking.schedule', function ($query) use ($assignedRouteIds) {
                $query->whereIn('route_id', $assignedRouteIds);
            })
            ->count();
    }

    /**
     * Helper method untuk mendapatkan statistik check-in per rute
     *
     * @param array $assignedRouteIds
     * @param Carbon $today
     * @return \Illuminate\Support\Collection
     */
    private function getRouteCheckInStats(array $assignedRouteIds, Carbon $today)
    {
        return DB::table('tickets')
            ->join('bookings', 'tickets.booking_id', '=', 'bookings.id')
            ->join('schedules', 'bookings.schedule_id', '=', 'schedules.id')
            ->join('routes', 'schedules.route_id', '=', 'routes.id')
            ->whereIn('routes.id', $assignedRouteIds)
            ->where('tickets.checked_in', true)
            ->whereDate('tickets.boarding_time', $today)
            ->select('routes.id', 'routes.origin', 'routes.destination', DB::raw('count(*) as total'))
            ->groupBy('routes.id', 'routes.origin', 'routes.destination')
            ->get();
    }
}
