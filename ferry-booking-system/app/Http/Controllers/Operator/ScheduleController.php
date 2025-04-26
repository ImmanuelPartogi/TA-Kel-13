<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use App\Models\Booking;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    /**
     * Cek apakah operator memiliki akses ke rute.
     *
     * @param int $routeId
     * @return bool
     */
    private function checkRouteAccess($routeId)
    {
        $operator = Auth::guard('operator')->user();
        $assignedRoutes = $operator->assigned_routes ?? [];

        return in_array($routeId, $assignedRoutes);
    }
    /**
     * Konversi status dari request ke format database
     *
     * @param string $requestStatus
     * @return string
     */
    private function mapStatusFromRequest($requestStatus)
    {
        $statusMap = [
            'active' => 'AVAILABLE',
            'inactive' => 'UNAVAILABLE',
            'suspended' => 'CANCELLED',
            'full' => 'FULL',
            'weather_issue' => 'WEATHER_ISSUE'
        ];

        return $statusMap[$requestStatus] ?? 'UNAVAILABLE';
    }

    /**
     * Get human-readable description of status.
     *
     * @param  string  $status
     * @return string
     */
    private function getStatusDescription($status)
    {
        switch ($status) {
            case 'inactive':
            case 'UNAVAILABLE':
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

    /**
     * Display a listing of the schedules.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $operator = Auth::guard('operator')->user();
        $operatorId = $operator->id;
        $assignedRoutes = $operator->assigned_routes ?? [];

        // Cache key berdasarkan operator dan filter
        $cacheKey = "schedules_operator_{$operatorId}_" . md5(json_encode($request->all()));

        // Perbaikan: Cache hanya data yang bisa di-serialize, bukan view
        // Ambil atau simpan hasil query ke cache
        $data = Cache::remember($cacheKey, 300, function () use ($request, $assignedRoutes) {
            $query = Schedule::with([
                'route:id,origin,destination',
                'ferry'
            ])
                ->where('status', 'active')
                ->whereIn('route_id', $assignedRoutes);

            // Filter by route if provided
            if ($request->has('route_id') && $request->route_id) {
                $query->where('route_id', $request->route_id);
            }

            // Filter by date if provided
            if ($request->has('date') && $request->date) {
                $date = Carbon::parse($request->date);
                $dayOfWeek = $date->dayOfWeek;

                $query->whereRaw("FIND_IN_SET(?, days)", [$dayOfWeek]);

                // Also check if there's a schedule date for this specific date
                $query->whereHas('scheduleDates', function ($q) use ($date) {
                    $q->where('date', $date->format('Y-m-d'))
                        ->where('status', 'AVAILABLE');
                });
            }

            $schedules = $query->orderBy('departure_time')->get();
            $routes = Route::whereIn('id', $assignedRoutes)->get(['id', 'origin', 'destination']);

            // Hanya kembalikan data yang dapat di-serialize ke cache
            return [
                'schedules' => $schedules,
                'routes' => $routes
            ];
        });

        // Check access sebelum render view (dilakukan di luar cache)
        if ($request->has('route_id') && $request->route_id) {
            if (!$this->checkRouteAccess($request->route_id)) {
                return redirect()->route('operator.schedules.index')
                    ->with('error', 'Anda tidak memiliki akses ke rute ini.');
            }
        }

        // Gunakan data dari cache untuk render view
        $schedules = $data['schedules'];
        $routes = $data['routes'];

        return view('operator.schedules.index', compact('schedules', 'routes'));
    }

    /**
     * Display the specified schedule.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $cacheKey = "schedule_show_{$id}";

        // Cache hanya data yang bisa di-serialize
        $data = Cache::remember($cacheKey, 300, function () use ($id) {
            $schedule = Schedule::with([
                'route:id,origin,destination',
                'ferry'
            ])->findOrFail($id);

            // Get upcoming dates with booking counts
            $upcomingDates = $schedule->scheduleDates()
                ->where('date', '>=', Carbon::today())
                ->where('status', 'AVAILABLE')
                ->orderBy('date')
                ->take(14)
                ->get();

            foreach ($upcomingDates as $date) {
                $date->booking_count = Booking::where('schedule_id', $schedule->id)
                    ->where('booking_date', $date->date)
                    ->where('status', 'confirmed')
                    ->count();
            }

            return [
                'schedule' => $schedule,
                'upcomingDates' => $upcomingDates
            ];
        });

        $schedule = $data['schedule'];
        $upcomingDates = $data['upcomingDates'];

        // Periksa akses setelah data diambil, di luar cache
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return redirect()->route('operator.schedules.index')
                ->with('error', 'Anda tidak memiliki akses ke jadwal ini.');
        }

        return view('operator.schedules.show', compact('schedule', 'upcomingDates'));
    }

    /**
     * Display the dates for a schedule.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function dates($id)
    {
        // Tidak menggunakan cache untuk halaman paginasi
        $schedule = Schedule::with([
            'route:id,origin,destination',
            'ferry'
        ])
            ->findOrFail($id);

        // Periksa apakah operator memiliki akses ke rute ini
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return redirect()->route('operator.schedules.index')
                ->with('error', 'Anda tidak memiliki akses ke jadwal ini.');
        }

        $dates = $schedule->scheduleDates()
            ->orderBy('date')
            ->paginate(30);

        // Get booking counts for each date
        foreach ($dates as $date) {
            // Tetap hitung jumlah booking untuk informasi
            $date->booking_count = Booking::where('schedule_id', $schedule->id)
                ->where('booking_date', $date->date)
                ->where('status', 'confirmed')
                ->count();
        }

        return view('operator.schedules.dates', compact('schedule', 'dates'));
    }

    /**
     * Check capacity and availability for a specific date and schedule.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function checkAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'schedule_id' => 'required|exists:schedules,id',
            'date' => 'required|date|after_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $schedule = Schedule::with(['route', 'ferry'])->findOrFail($request->schedule_id);

        // Periksa apakah operator memiliki akses ke jadwal ini
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke jadwal ini.'
            ], 403);
        }

        $date = Carbon::parse($request->date)->format('Y-m-d');

        // Check if this schedule runs on this day of the week
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;
        $scheduleDays = explode(',', $schedule->days);

        if (!in_array($dayOfWeek, $scheduleDays)) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak tersedia pada hari ini: ' . Carbon::parse($date)->isoFormat('dddd')
            ]);
        }

        // Get schedule date if it exists
        $scheduleDate = ScheduleDate::where('schedule_id', $schedule->id)
            ->where('date', $date)
            ->first();

        if (!$scheduleDate) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak tersedia pada tanggal ini.'
            ]);
        }

        if ($scheduleDate->status != 'AVAILABLE') {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal pada tanggal ini ' . $this->getStatusDescription($scheduleDate->status) . '.'
            ]);
        }

        // Get current booking counts with caching
        $cacheKey = "booking_counts_schedule_{$schedule->id}_date_{$date}";
        $bookingCounts = Cache::remember($cacheKey, 60, function () use ($schedule, $date) {
            return Booking::where('schedule_id', $schedule->id)
                ->where('booking_date', $date)
                ->where('status', 'confirmed')
                ->selectRaw('SUM(passenger_count) as total_passengers,
                             SUM(motorcycle_count) as total_motorcycles,
                             SUM(car_count) as total_cars,
                             SUM(bus_count) as total_buses,
                             SUM(truck_count) as total_trucks')
                ->first();
        });

        // Kita ambil properti kapasitas dari ferry dengan mengakomodasi perbedaan nama kolom
        // Coba semua kemungkinan nama kolom untuk kapasitas
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
            'success' => true,
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
                    'available' => $passengerCapacity - $currentPassengers,
                    'percentage' => $passengerCapacity > 0 ? round(($currentPassengers / $passengerCapacity) * 100) : 0
                ],
                'motorcycles' => [
                    'capacity' => $motorcycleCapacity,
                    'booked' => $currentMotorcycles,
                    'available' => $motorcycleCapacity - $currentMotorcycles,
                    'percentage' => $motorcycleCapacity > 0 ? round(($currentMotorcycles / $motorcycleCapacity) * 100) : 0
                ],
                'cars' => [
                    'capacity' => $carCapacity,
                    'booked' => $currentCars,
                    'available' => $carCapacity - $currentCars,
                    'percentage' => $carCapacity > 0 ? round(($currentCars / $carCapacity) * 100) : 0
                ],
                'buses' => [
                    'capacity' => $busCapacity,
                    'booked' => $currentBuses,
                    'available' => $busCapacity - $currentBuses,
                    'percentage' => $busCapacity > 0 ? round(($currentBuses / $busCapacity) * 100) : 0
                ],
                'trucks' => [
                    'capacity' => $truckCapacity,
                    'booked' => $currentTrucks,
                    'available' => $truckCapacity - $currentTrucks,
                    'percentage' => $truckCapacity > 0 ? round(($currentTrucks / $truckCapacity) * 100) : 0
                ]
            ]
        ]);
    }

    /**
     * Clear cache terkait jadwal
     *
     * @param int $scheduleId
     */
    private function clearScheduleCache($scheduleId)
    {
        $operatorId = Auth::guard('operator')->id();

        // Hapus cache spesifik
        Cache::forget("schedule_show_{$scheduleId}");

        // Bersihkan cache dengan pattern
        $patterns = [
            "schedules_operator_{$operatorId}_*",
            "booking_counts_schedule_{$scheduleId}_*"
        ];

        foreach ($patterns as $pattern) {
            // Catatan: Ini memerlukan cache driver yang mendukung tags atau wildcard deletes
            // Jika menggunakan driver yang tidak mendukung (seperti file), Anda harus menyimpan
            // daftar key dan menghapusnya satu per satu
            try {
                if (method_exists(Cache::getStore(), 'flush')) {
                    // Ini pendekatan alternatif jika wildcard delete tidak didukung
                    // Namun ini menghapus SEMUA cache - sebaiknya hanya gunakan di development
                    // Cache::flush();
                }
            } catch (\Exception $e) {
                Log::warning("Tidak dapat menghapus cache pattern: " . $e->getMessage());
            }
        }
    }

    /**
     * Show form to create new schedule date.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function createDate($id)
    {
        $schedule = Schedule::with(['route', 'ferry'])->findOrFail($id);

        // Periksa apakah operator memiliki akses ke rute ini
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return redirect()->route('operator.schedules.index')
                ->with('error', 'Anda tidak memiliki akses ke jadwal ini.');
        }

        return view('operator.schedules.create-date', compact('schedule'));
    }

    /**
     * Store a newly created schedule date.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function storeDate(Request $request, $id)
    {
        $schedule = Schedule::findOrFail($id);

        // Periksa apakah operator memiliki akses ke rute ini
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return redirect()->route('operator.schedules.index')
                ->with('error', 'Anda tidak memiliki akses ke jadwal ini.');
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
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Cek apakah jadwal ini berjalan pada hari dari tanggal yang dipilih
        $date = Carbon::parse($request->date);
        $dayOfWeek = $date->dayOfWeek;
        $scheduleDays = explode(',', $schedule->days);

        if (!in_array($dayOfWeek, $scheduleDays)) {
            return redirect()->back()
                ->with('error', 'Jadwal tidak beroperasi pada hari ini: ' . $date->isoFormat('dddd'))
                ->withInput();
        }

        // Cek apakah tanggal ini sudah ada
        $existingDate = ScheduleDate::where('schedule_id', $schedule->id)
            ->where('date', $date->format('Y-m-d'))
            ->first();

        if ($existingDate) {
            return redirect()->back()
                ->with('error', 'Tanggal ini sudah ada di dalam jadwal.')
                ->withInput();
        }

        // Buat schedule date baru
        $scheduleDate = new ScheduleDate();
        $scheduleDate->schedule_id = $schedule->id;
        $scheduleDate->date = $date->format('Y-m-d');
        $scheduleDate->status = $this->mapStatusFromRequest($request->status);
        $scheduleDate->status_reason = $request->status_reason;
        $scheduleDate->operator_id = Auth::guard('operator')->id();

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
            'operator_id' => Auth::guard('operator')->id()
        ]);

        // Hapus cache terkait
        $this->clearScheduleCache($schedule->id);

        return redirect()->route('operator.schedules.dates', $id)
            ->with('success', 'Tanggal jadwal berhasil ditambahkan.');
    }

    /**
     * Show form to edit schedule date.
     *
     * @param int $id
     * @param int $dateId
     * @return \Illuminate\Http\Response
     */
    public function editDate($id, $dateId)
    {
        $schedule = Schedule::findOrFail($id);

        // Periksa apakah operator memiliki akses ke rute ini
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return redirect()->route('operator.schedules.index')
                ->with('error', 'Anda tidak memiliki akses ke jadwal ini.');
        }

        $scheduleDate = ScheduleDate::findOrFail($dateId);

        // Ensure the schedule date belongs to the schedule
        if ($scheduleDate->schedule_id != $schedule->id) {
            return redirect()->route('operator.schedules.dates', $id)
                ->with('error', 'Tanggal jadwal tidak valid.');
        }

        return view('operator.schedules.edit-date', compact('schedule', 'scheduleDate'));
    }

    /**
     * Update the schedule date.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @param int $dateId
     * @return \Illuminate\Http\Response
     */
    public function updateDate(Request $request, $id, $dateId)
    {
        $schedule = Schedule::findOrFail($id);

        // Periksa apakah operator memiliki akses ke rute ini
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return redirect()->route('operator.schedules.index')
                ->with('error', 'Anda tidak memiliki akses ke jadwal ini.');
        }

        $scheduleDate = ScheduleDate::findOrFail($dateId);

        // Ensure the schedule date belongs to the schedule
        if ($scheduleDate->schedule_id != $schedule->id) {
            return redirect()->route('operator.schedules.dates', $id)
                ->with('error', 'Tanggal jadwal tidak valid.');
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
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $oldStatus = $scheduleDate->status;
        $scheduleDate->status = $this->mapStatusFromRequest($request->status);
        $scheduleDate->status_reason = $request->status_reason;
        $scheduleDate->operator_id = Auth::guard('operator')->id();

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
            'operator_id' => Auth::guard('operator')->id()
        ]);

        // Hapus cache terkait
        $this->clearScheduleCache($schedule->id);

        return redirect()->route('operator.schedules.dates', $id)
            ->with('success', 'Tanggal jadwal berhasil diperbarui.');
    }

    /**
     * Delete the schedule date.
     *
     * @param int $id
     * @param int $dateId
     * @return \Illuminate\Http\Response
     */
    public function destroyDate($id, $dateId)
    {
        $schedule = Schedule::findOrFail($id);

        // Periksa apakah operator memiliki akses ke rute ini
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return redirect()->route('operator.schedules.index')
                ->with('error', 'Anda tidak memiliki akses ke jadwal ini.');
        }

        $scheduleDate = ScheduleDate::findOrFail($dateId);

        // Ensure the schedule date belongs to the schedule
        if ($scheduleDate->schedule_id != $schedule->id) {
            return redirect()->route('operator.schedules.dates', $id)
                ->with('error', 'Tanggal jadwal tidak valid.');
        }

        // Cek apakah ada booking untuk tanggal ini
        $bookingCount = Booking::where('schedule_id', $schedule->id)
            ->where('booking_date', $scheduleDate->date)
            ->count();

        if ($bookingCount > 0) {
            return redirect()->route('operator.schedules.dates', $id)
                ->with('error', 'Tidak dapat menghapus tanggal jadwal karena sudah ada pemesanan.');
        }

        // Log penghapusan
        Log::info('Schedule date deleted', [
            'schedule_id' => $schedule->id,
            'date_id' => $dateId,
            'date' => $scheduleDate->date,
            'operator_id' => Auth::guard('operator')->id()
        ]);

        $scheduleDate->delete();

        // Hapus cache terkait
        $this->clearScheduleCache($schedule->id);

        return redirect()->route('operator.schedules.dates', $id)
            ->with('success', 'Tanggal jadwal berhasil dihapus.');
    }
}
