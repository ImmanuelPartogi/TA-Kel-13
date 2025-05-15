<?php

namespace App\Http\Controllers\Api\Operator;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use App\Models\Booking;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    /**
     * Cek apakah operator memiliki akses ke rute.
     */
    private function checkRouteAccess($routeId)
    {
        $operator = Auth::user();
        $assignedRoutes = $operator->assigned_routes ?? [];

        return in_array($routeId, $assignedRoutes);
    }

    /**
     * Konversi status dari request ke format database
     */
    private function mapStatusFromRequest($requestStatus)
    {
        $statusMap = [
            'active' => 'ACTIVE',
            'inactive' => 'INACTIVE',
            'suspended' => 'CANCELLED',
            'full' => 'FULL',
            'weather_issue' => 'WEATHER_ISSUE'
        ];

        return $statusMap[$requestStatus] ?? 'INACTIVE';
    }

    /**
     * Mendapatkan daftar jadwal.
     */
    public function index(Request $request)
    {
        $this->checkExpiredStatuses();

        $operator = Auth::user();
        $assignedRoutes = $operator->assigned_routes ?? [];

        // Jika operator tidak memiliki rute yang ditugaskan
        if (empty($assignedRoutes)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Operator tidak memiliki rute yang ditugaskan',
                'data' => [
                    'schedules' => [],
                    'routes' => []
                ]
            ], 200);
        }

        $query = Schedule::with([
            'route:id,origin,destination',
            'ferry'
        ])
            ->where('status', 'active')
            ->whereIn('route_id', $assignedRoutes);

        // Filter by route if provided
        if ($request->has('route_id') && $request->route_id) {
            // Pastikan operator memiliki akses ke rute ini
            if (!$this->checkRouteAccess($request->route_id)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki akses ke rute ini'
                ], 403);
            }

            $query->where('route_id', $request->route_id);
        }

        // Filter by date if provided
        if ($request->has('date') && $request->date) {
            $date = Carbon::parse($request->date);
            $dayOfWeek = $date->dayOfWeek;

            $query->whereRaw("FIND_IN_SET(?, days)", [$dayOfWeek]);

            // Periksa juga apakah ada jadwal tanggal untuk tanggal spesifik ini
            $query->whereHas('scheduleDates', function ($q) use ($date) {
                $q->where('date', $date->format('Y-m-d'))
                    ->where('status', 'ACTIVE');
            });
        }

        $schedules = $query->orderBy('departure_time')->get();
        $routes = Route::whereIn('id', $assignedRoutes)->get(['id', 'origin', 'destination']);

        return response()->json([
            'status' => 'success',
            'data' => [
                'schedules' => $schedules,
                'routes' => $routes
            ]
        ]);
    }

    /**
     * Mendapatkan detail jadwal.
     */
    public function show($id)
    {
        $this->checkExpiredStatuses();

        $schedule = Schedule::with([
            'route:id,origin,destination',
            'ferry'
        ])->findOrFail($id);

        // Periksa akses
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke jadwal ini'
            ], 403);
        }

        // Get upcoming dates with booking counts
        $upcomingDates = $schedule->scheduleDates()
            ->where('date', '>=', Carbon::today())
            ->where('status', 'ACTIVE')
            ->orderBy('date')
            ->take(14)
            ->get();

        foreach ($upcomingDates as $date) {
            $date->booking_count = Booking::where('schedule_id', $schedule->id)
                ->where('departure_date', $date->date)
                ->where('status', 'confirmed')
                ->count();
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'schedule' => $schedule,
                'upcomingDates' => $upcomingDates
            ]
        ]);
    }

    /**
     * Mendapatkan tanggal-tanggal jadwal.
     */
    public function dates(Request $request, $id)
    {
        $this->checkExpiredStatuses();

        $schedule = Schedule::with([
            'route:id,origin,destination',
            'ferry'
        ])->findOrFail($id);

        // Periksa akses
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke jadwal ini'
            ], 403);
        }

        $query = $schedule->scheduleDates()->orderBy('date');

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $this->mapStatusFromRequest($request->status));
        }

        // Filter by date range
        if ($request->has('start_date') && $request->start_date) {
            $query->where('date', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->where('date', '<=', $request->end_date);
        }

        // Pagination
        $perPage = $request->per_page ?? 15;
        $dates = $query->paginate($perPage);

        // Get booking counts for each date
        foreach ($dates as $date) {
            $date->booking_count = Booking::where('schedule_id', $schedule->id)
                ->where('departure_date', $date->date)
                ->whereIn('status', ['CONFIRMED', 'COMPLETED'])
                ->count();
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'schedule' => $schedule,
                'dates' => $dates
            ]
        ]);
    }

    /**
     * Membuat tanggal jadwal baru.
     */
    public function storeDate(Request $request, $id)
    {
        $schedule = Schedule::findOrFail($id);

        // Periksa akses
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke jadwal ini'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'date' => 'required|date|after_or_equal:today',
            'status' => 'required|in:active,inactive,suspended,full,weather_issue',
            'status_reason' => 'nullable|string|max:255',
            'status_expiry_date' => 'nullable|date|after:today',
            'passenger_count' => 'nullable|integer|min:0',
            'motorcycle_count' => 'nullable|integer|min:0',
            'car_count' => 'nullable|integer|min:0',
            'bus_count' => 'nullable|integer|min:0',
            'truck_count' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Cek apakah jadwal ini berjalan pada hari dari tanggal yang dipilih
        $date = Carbon::parse($request->date);
        $dayOfWeek = $date->dayOfWeek;
        $scheduleDays = explode(',', $schedule->days);

        if (!in_array($dayOfWeek, $scheduleDays)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jadwal tidak beroperasi pada hari ini: ' . $date->isoFormat('dddd')
            ], 400);
        }

        // Cek apakah tanggal ini sudah ada
        $existingDate = ScheduleDate::where('schedule_id', $schedule->id)
            ->where('date', $date->format('Y-m-d'))
            ->first();

        if ($existingDate) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tanggal ini sudah ada di dalam jadwal'
            ], 400);
        }

        // Buat schedule date baru
        $scheduleDate = new ScheduleDate();
        $scheduleDate->schedule_id = $schedule->id;
        $scheduleDate->date = $date->format('Y-m-d');
        $scheduleDate->status = $this->mapStatusFromRequest($request->status);
        $scheduleDate->status_reason = $request->status_reason;
        $scheduleDate->operator_id = Auth::id();

        // Set kapasitas khusus jika diberikan
        if ($request->has('passenger_count') && $request->passenger_count !== null) {
            $scheduleDate->passenger_count = $request->passenger_count;
        }

        if ($request->has('motorcycle_count') && $request->motorcycle_count !== null) {
            $scheduleDate->motorcycle_count = $request->motorcycle_count;
        }

        if ($request->has('car_count') && $request->car_count !== null) {
            $scheduleDate->car_count = $request->car_count;
        }

        if ($request->has('bus_count') && $request->bus_count !== null) {
            $scheduleDate->bus_count = $request->bus_count;
        }

        if ($request->has('truck_count') && $request->truck_count !== null) {
            $scheduleDate->truck_count = $request->truck_count;
        }

        if ($request->status_expiry_date) {
            $scheduleDate->status_expiry_date = Carbon::parse($request->status_expiry_date);
        }

        $scheduleDate->save();

        // Log pembuatan tanggal jadwal baru
        Log::info('New schedule date created', [
            'schedule_id' => $schedule->id,
            'date' => $date->format('Y-m-d'),
            'status' => $scheduleDate->status,
            'operator_id' => Auth::id()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Tanggal jadwal berhasil ditambahkan',
            'data' => $scheduleDate
        ]);
    }

    /**
     * Mengupdate tanggal jadwal.
     */
    public function updateDate(Request $request, $id, $dateId)
    {
        $schedule = Schedule::findOrFail($id);

        // Periksa akses
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke jadwal ini'
            ], 403);
        }

        $scheduleDate = ScheduleDate::findOrFail($dateId);

        // Pastikan tanggal jadwal termasuk dalam jadwal
        if ($scheduleDate->schedule_id != $schedule->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tanggal jadwal tidak valid'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,inactive,suspended,full,weather_issue',
            'status_reason' => 'nullable|string|max:255',
            'status_expiry_date' => 'nullable|date',
            'passenger_count' => 'nullable|integer|min:0',
            'motorcycle_count' => 'nullable|integer|min:0',
            'car_count' => 'nullable|integer|min:0',
            'bus_count' => 'nullable|integer|min:0',
            'truck_count' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldStatus = $scheduleDate->status;
        $scheduleDate->status = $this->mapStatusFromRequest($request->status);
        $scheduleDate->status_reason = $request->status_reason;
        $scheduleDate->operator_id = Auth::id();

        // Update kapasitas jika diberikan
        if ($request->has('passenger_count')) {
            $scheduleDate->passenger_count = $request->passenger_count;
        }

        if ($request->has('motorcycle_count')) {
            $scheduleDate->motorcycle_count = $request->motorcycle_count;
        }

        if ($request->has('car_count')) {
            $scheduleDate->car_count = $request->car_count;
        }

        if ($request->has('bus_count')) {
            $scheduleDate->bus_count = $request->bus_count;
        }

        if ($request->has('truck_count')) {
            $scheduleDate->truck_count = $request->truck_count;
        }

        if ($request->status_expiry_date) {
            $scheduleDate->status_expiry_date = Carbon::parse($request->status_expiry_date);
        } else {
            $scheduleDate->status_expiry_date = null;
        }

        $scheduleDate->save();

        // Log perubahan
        Log::info('Schedule date updated', [
            'schedule_id' => $schedule->id,
            'date_id' => $dateId,
            'old_status' => $oldStatus,
            'new_status' => $scheduleDate->status,
            'operator_id' => Auth::id()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Tanggal jadwal berhasil diperbarui',
            'data' => $scheduleDate
        ]);
    }

    /**
     * Mengupdate status tanggal jadwal.
     */
    public function updateDateStatus(Request $request, $id, $dateId)
    {
        $schedule = Schedule::findOrFail($id);

        // Periksa akses
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke jadwal ini'
            ], 403);
        }

        $scheduleDate = ScheduleDate::where('schedule_id', $id)
            ->where('id', $dateId)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:ACTIVE,INACTIVE,FULL,CANCELLED,WEATHER_ISSUE',
            'status_reason' => 'nullable|string|max:255',
            'status_expiry_date' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Simpan status lama untuk log
        $oldStatus = $scheduleDate->status;

        // Update status
        $scheduleDate->status = $request->status;
        $scheduleDate->status_reason = $request->status_reason;
        $scheduleDate->operator_id = Auth::id();
        $scheduleDate->modified_by_schedule = false;

        // Update tanggal kedaluwarsa status jika diperlukan
        if ($request->status === 'WEATHER_ISSUE') {
            if ($request->has('status_expiry_date') && !empty($request->status_expiry_date)) {
                try {
                    $scheduleDate->status_expiry_date = Carbon::parse($request->status_expiry_date);
                } catch (\Exception $e) {
                    Log::error('Gagal memparsing tanggal expiry: ' . $e->getMessage(), [
                        'input' => $request->status_expiry_date,
                        'schedule_id' => $id,
                        'date_id' => $dateId
                    ]);
                    $scheduleDate->status_expiry_date = null;
                }
            } else {
                $scheduleDate->status_expiry_date = null;
            }
        } else {
            $scheduleDate->status_expiry_date = null;
        }

        $success = $scheduleDate->save();

        // Log hasil save untuk debugging
        Log::info('Schedule date status update result:', [
            'success' => $success,
            'old_status' => $oldStatus,
            'new_status' => $scheduleDate->status,
            'date_id' => $dateId,
            'expiry_date' => $scheduleDate->status_expiry_date
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Status tanggal jadwal berhasil diperbarui',
            'data' => $scheduleDate
        ]);
    }

    /**
     * Menghapus tanggal jadwal.
     */
    public function destroyDate($id, $dateId)
    {
        $schedule = Schedule::findOrFail($id);

        // Periksa akses
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke jadwal ini'
            ], 403);
        }

        $scheduleDate = ScheduleDate::findOrFail($dateId);

        // Pastikan tanggal jadwal termasuk dalam jadwal
        if ($scheduleDate->schedule_id != $schedule->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tanggal jadwal tidak valid'
            ], 400);
        }

        // Cek apakah ada booking untuk tanggal ini
        $bookingCount = Booking::where('schedule_id', $schedule->id)
            ->where('departure_date', $scheduleDate->date)
            ->count();

        if ($bookingCount > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak dapat menghapus tanggal jadwal karena sudah ada pemesanan'
            ], 400);
        }

        // Log penghapusan
        Log::info('Schedule date deleted', [
            'schedule_id' => $schedule->id,
            'date_id' => $dateId,
            'date' => $scheduleDate->date,
            'operator_id' => Auth::id()
        ]);

        $scheduleDate->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Tanggal jadwal berhasil dihapus'
        ]);
    }

    /**
     * Memeriksa ketersediaan jadwal untuk tanggal tertentu.
     */
    public function checkAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'schedule_id' => 'required|exists:schedules,id',
            'date' => 'required|date|after_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $schedule = Schedule::with(['route', 'ferry'])->findOrFail($request->schedule_id);

        // Periksa akses
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke jadwal ini'
            ], 403);
        }

        $date = Carbon::parse($request->date)->format('Y-m-d');

        // Check if this schedule runs on this day of the week
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;
        $scheduleDays = explode(',', $schedule->days);

        if (!in_array($dayOfWeek, $scheduleDays)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jadwal tidak tersedia pada hari ini: ' . Carbon::parse($date)->isoFormat('dddd')
            ], 400);
        }

        // Get schedule date if it exists
        $scheduleDate = ScheduleDate::where('schedule_id', $schedule->id)
            ->where('date', $date)
            ->first();

        if (!$scheduleDate) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jadwal tidak tersedia pada tanggal ini'
            ], 404);
        }

        if ($scheduleDate->status != 'ACTIVE') {
            return response()->json([
                'status' => 'error',
                'message' => 'Jadwal pada tanggal ini ' . $this->getStatusDescription($scheduleDate->status) . '.'
            ], 400);
        }

        // Get current booking counts
        $bookingCounts = Booking::where('schedule_id', $schedule->id)
            ->where('departure_date', $date)
            ->where('status', 'confirmed')
            ->selectRaw('SUM(passenger_count) as total_passengers,
                         SUM(motorcycle_count) as total_motorcycles,
                         SUM(car_count) as total_cars,
                         SUM(bus_count) as total_buses,
                         SUM(truck_count) as total_trucks')
            ->first();

        // Ambil properti kapasitas dari ferry
        $passengerCapacity = $scheduleDate->passenger_count ??
            ($schedule->ferry->passenger_capacity ??
                ($schedule->ferry->max_passengers ?? 0));

        $motorcycleCapacity = $scheduleDate->motorcycle_count ??
            ($schedule->ferry->motorcycle_capacity ??
                ($schedule->ferry->max_motorcycles ?? 0));

        $carCapacity = $scheduleDate->car_count ??
            ($schedule->ferry->car_capacity ??
                ($schedule->ferry->max_cars ?? 0));

        $busCapacity = $scheduleDate->bus_count ??
            ($schedule->ferry->bus_capacity ??
                ($schedule->ferry->max_buses ?? 0));

        $truckCapacity = $scheduleDate->truck_count ??
            ($schedule->ferry->truck_capacity ??
                ($schedule->ferry->max_trucks ?? 0));

        $currentPassengers = $bookingCounts->total_passengers ?? 0;
        $currentMotorcycles = $bookingCounts->total_motorcycles ?? 0;
        $currentCars = $bookingCounts->total_cars ?? 0;
        $currentBuses = $bookingCounts->total_buses ?? 0;
        $currentTrucks = $bookingCounts->total_trucks ?? 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'schedule' => [
                    'id' => $schedule->id,
                    'route' => [
                        'origin' => $schedule->route->origin,
                        'destination' => $schedule->route->destination
                    ],
                    'date' => $date,
                    'departure_time' => $schedule->departure_time,
                    'status' => $scheduleDate->status
                ],
                'capacity' => [
                    'passengers' => [
                        'capacity' => $passengerCapacity,
                        'booked' => $currentPassengers,
                        'active' => $passengerCapacity - $currentPassengers,
                        'percentage' => $passengerCapacity > 0 ? round(($currentPassengers / $passengerCapacity) * 100) : 0
                    ],
                    'motorcycles' => [
                        'capacity' => $motorcycleCapacity,
                        'booked' => $currentMotorcycles,
                        'active' => $motorcycleCapacity - $currentMotorcycles,
                        'percentage' => $motorcycleCapacity > 0 ? round(($currentMotorcycles / $motorcycleCapacity) * 100) : 0
                    ],
                    'cars' => [
                        'capacity' => $carCapacity,
                        'booked' => $currentCars,
                        'active' => $carCapacity - $currentCars,
                        'percentage' => $carCapacity > 0 ? round(($currentCars / $carCapacity) * 100) : 0
                    ],
                    'buses' => [
                        'capacity' => $busCapacity,
                        'booked' => $currentBuses,
                        'active' => $busCapacity - $currentBuses,
                        'percentage' => $busCapacity > 0 ? round(($currentBuses / $busCapacity) * 100) : 0
                    ],
                    'trucks' => [
                        'capacity' => $truckCapacity,
                        'booked' => $currentTrucks,
                        'active' => $truckCapacity - $currentTrucks,
                        'percentage' => $truckCapacity > 0 ? round(($currentTrucks / $truckCapacity) * 100) : 0
                    ]
                ]
            ]
        ]);
    }

    /**
     * Periksa dan perbarui status jadwal dan tanggal jadwal yang kedaluwarsa
     */
    private function checkExpiredStatuses()
    {
        $now = Carbon::now();

        // Update jadwal INACTIVE yang sudah melewati tanggal kedaluwarsa
        $expiredSchedules = Schedule::whereIn('route_id', Auth::user()->assigned_routes ?? [])
            ->where('status', 'INACTIVE')
            ->whereNotNull('status_expiry_date')
            ->where('status_expiry_date', '<', $now)
            ->get();

        foreach ($expiredSchedules as $schedule) {
            $schedule->status = 'ACTIVE';
            $schedule->status_reason = 'Otomatis diaktifkan setelah masa tidak aktif berakhir';
            $schedule->status_updated_at = $now;
            $schedule->status_expiry_date = null;
            $schedule->save();

            // Update juga status tanggal jadwal terkait
            ScheduleDate::where('schedule_id', $schedule->id)
                ->where('date', '>=', Carbon::today())
                ->where('modified_by_schedule', true)
                ->where('status', 'INACTIVE')
                ->update([
                    'status' => 'ACTIVE',
                    'status_reason' => 'Otomatis diaktifkan karena jadwal telah aktif kembali',
                ]);
        }

        // Update jadwal dengan status WEATHER_ISSUE yang sudah kedaluwarsa
        ScheduleDate::whereIn('schedule_id', Schedule::whereIn('route_id', Auth::user()->assigned_routes ?? [])
            ->pluck('id'))
            ->where('status', 'WEATHER_ISSUE')
            ->whereNotNull('status_expiry_date')
            ->where('status_expiry_date', '<', $now)
            ->update([
                'status' => 'ACTIVE',
                'status_reason' => 'Otomatis diaktifkan setelah masa masalah cuaca berakhir',
                'status_expiry_date' => null
            ]);
    }

    /**
     * Get human-readable description of status.
     */
    private function getStatusDescription($status)
    {
        switch ($status) {
            case 'inactive':
            case 'INACTIVE':
                return 'tidak aktif';
            case 'suspended':
            case 'CANCELLED':
                return 'ditangguhkan';
            case 'full':
            case 'FULL':
                return 'sudah penuh';
            case 'weather_issue':
            case 'WEATHER_ISSUE':
                return 'masalah cuaca';
            default:
                return $status;
        }
    }
}
