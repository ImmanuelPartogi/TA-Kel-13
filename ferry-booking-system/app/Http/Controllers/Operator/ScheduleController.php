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
use Carbon\Carbon;

class ScheduleController extends Controller
{
    /**
     * Cek apakah operator memiliki akses ke rute.
     */
    private function checkRouteAccess($routeId)
    {
        $operator = Auth::guard('operator')->user();
        $assignedRoutes = $operator->assigned_routes ?? [];

        return in_array($routeId, $assignedRoutes);
    }

    /**
     * Display a listing of the schedules.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $operator = Auth::guard('operator')->user();
        $assignedRoutes = $operator->assigned_routes ?? [];

        $query = Schedule::with(['route', 'ferry'])
            ->where('status', 'active')
            ->whereIn('route_id', $assignedRoutes); // Filter hanya rute yang ditetapkan

        // Filter by route if provided
        if ($request->has('route_id') && $request->route_id) {
            // Periksa apakah operator memiliki akses ke rute yang diminta
            if (!$this->checkRouteAccess($request->route_id)) {
                return redirect()->route('operator.schedules.index')
                    ->with('error', 'Anda tidak memiliki akses ke rute ini.');
            }

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

        // Ambil rute yang ditetapkan untuk dropdown filter
        $routes = Route::whereIn('id', $assignedRoutes)->get();

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
        $schedule = Schedule::with(['route', 'ferry'])
            ->findOrFail($id);

        // Periksa apakah operator memiliki akses ke rute ini
        if (!$this->checkRouteAccess($schedule->route_id)) {
            return redirect()->route('operator.schedules.index')
                ->with('error', 'Anda tidak memiliki akses ke jadwal ini.');
        }

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
                ->count();
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
        $schedule = Schedule::with(['route', 'ferry'])
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
                ->count();
        }

        return view('operator.schedules.dates', compact('schedule', 'dates'));
    }

    /**
     * Update the status of a schedule date.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @param  int  $dateId
     * @return \Illuminate\Http\Response
     */
    public function updateDateStatus(Request $request, $id, $dateId)
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
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Konversi status ke format yang digunakan di view
        $statusMap = [
            'active' => 'AVAILABLE',
            'inactive' => 'UNAVAILABLE',
            'suspended' => 'CANCELLED',
            'full' => 'FULL',
            'weather_issue' => 'WEATHER_ISSUE'
        ];

        $scheduleDate->status = $statusMap[$request->status];
        $scheduleDate->status_reason = $request->status_reason;
        $scheduleDate->operator_id = Auth::guard('operator')->id(); // Simpan operator_id

        if ($request->status_expiry_date) {
            $scheduleDate->status_expiry_date = Carbon::parse($request->status_expiry_date);
        } else {
            $scheduleDate->status_expiry_date = null;
        }

        $scheduleDate->save();

        return redirect()->route('operator.schedules.dates', $id)
            ->with('success', 'Status tanggal jadwal berhasil diperbarui.');
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
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ]);
        }

        $schedule = Schedule::with('ferry')->findOrFail($request->schedule_id);
        $date = Carbon::parse($request->date)->format('Y-m-d');

        // Check if this schedule runs on this day of the week
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;
        $scheduleDays = explode(',', $schedule->days);

        if (!in_array($dayOfWeek, $scheduleDays)) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak tersedia pada hari ini.'
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

        if ($scheduleDate->status != 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal pada tanggal ini ' . $this->getStatusDescription($scheduleDate->status) . '.'
            ]);
        }

        // Get current booking counts
        $bookingCounts = Booking::where('schedule_id', $schedule->id)
            ->where('booking_date', $date)  // Ubah 'date' menjadi 'booking_date'
            ->where('status', 'confirmed')
            ->selectRaw('SUM(passenger_count) as total_passengers,
                         SUM(motorcycle_count) as total_motorcycles,
                         SUM(car_count) as total_cars,
                         SUM(bus_count) as total_buses,
                         SUM(truck_count) as total_trucks')
            ->first();

        // Check ferry capacity
        $passengerCapacity = $schedule->ferry->passenger_capacity;
        $motorcycleCapacity = $schedule->ferry->motorcycle_capacity;
        $carCapacity = $schedule->ferry->car_capacity;
        $busCapacity = $schedule->ferry->bus_capacity;
        $truckCapacity = $schedule->ferry->truck_capacity;

        $currentPassengers = $bookingCounts->total_passengers ?? 0;
        $currentMotorcycles = $bookingCounts->total_motorcycles ?? 0;
        $currentCars = $bookingCounts->total_cars ?? 0;
        $currentBuses = $bookingCounts->total_buses ?? 0;
        $currentTrucks = $bookingCounts->total_trucks ?? 0;

        return response()->json([
            'success' => true,
            'capacity' => [
                'passengers' => [
                    'capacity' => $passengerCapacity,
                    'booked' => $currentPassengers,
                    'available' => $passengerCapacity - $currentPassengers
                ],
                'motorcycles' => [
                    'capacity' => $motorcycleCapacity,
                    'booked' => $currentMotorcycles,
                    'available' => $motorcycleCapacity - $currentMotorcycles
                ],
                'cars' => [
                    'capacity' => $carCapacity,
                    'booked' => $currentCars,
                    'available' => $carCapacity - $currentCars
                ],
                'buses' => [
                    'capacity' => $busCapacity,
                    'booked' => $currentBuses,
                    'available' => $busCapacity - $currentBuses
                ],
                'trucks' => [
                    'capacity' => $truckCapacity,
                    'booked' => $currentTrucks,
                    'available' => $truckCapacity - $currentTrucks
                ]
            ]
        ]);
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
                return 'tidak aktif';
            case 'suspended':
                return 'ditangguhkan';
            case 'full':
                return 'sudah penuh';
            default:
                return $status;
        }
    }
}
