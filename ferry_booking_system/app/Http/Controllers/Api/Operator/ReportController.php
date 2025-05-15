<?php

namespace App\Http\Controllers\Api\Operator;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Route;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    /**
     * Get report index data
     */
    public function index()
    {
        $operator = Auth::user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        $routes = Route::whereIn('id', $assignedRouteIds)->get(['id', 'origin', 'destination']);

        return response()->json([
            'status' => 'success',
            'data' => [
                'routes' => $routes
            ]
        ]);
    }

    /**
     * Get daily report data
     */
    public function dailyReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
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

        $date = Carbon::parse($request->date);
        $dayOfWeek = $date->dayOfWeek + 1; // 1-7 for Monday-Sunday

        $schedules = Schedule::whereIn('route_id', $assignedRouteIds)
            ->whereRaw("FIND_IN_SET('$dayOfWeek', days)")
            ->with(['route', 'ferry'])
            ->get();

        $scheduleIds = $schedules->pluck('id');

        // Get schedule dates
        $scheduleDates = ScheduleDate::whereIn('schedule_id', $scheduleIds)
            ->where('date', $date->format('Y-m-d'))
            ->get()
            ->keyBy('schedule_id');

        // Get bookings
        $bookings = Booking::whereIn('schedule_id', $scheduleIds)
            ->where('departure_date', $date->format('Y-m-d'))
            ->with(['user', 'tickets', 'vehicles'])
            ->orderBy('created_at')
            ->get()
            ->groupBy('schedule_id');

        // Process data
        $reportData = $schedules->map(function($schedule) use ($scheduleDates, $bookings) {
            $scheduleDate = $scheduleDates->get($schedule->id);
            $scheduleBookings = $bookings->get($schedule->id, collect());

            $passengerCount = $scheduleDate ? $scheduleDate->passenger_count : 0;
            $vehicleCount = 0;

            if ($scheduleDate) {
                $vehicleCount = $scheduleDate->motorcycle_count + $scheduleDate->car_count +
                                $scheduleDate->bus_count + $scheduleDate->truck_count;
            }

            $confirmedBookings = $scheduleBookings->where('status', 'CONFIRMED')->count();
            $completedBookings = $scheduleBookings->where('status', 'COMPLETED')->count();
            $cancelledBookings = $scheduleBookings->where('status', 'CANCELLED')->count();

            $checkedInPassengers = 0;
            foreach ($scheduleBookings as $booking) {
                $checkedInPassengers += $booking->tickets->where('checked_in', true)->count();
            }

            return [
                'schedule' => $schedule,
                'passengers' => $passengerCount,
                'vehicles' => $vehicleCount,
                'motorcycle_count' => $scheduleDate ? $scheduleDate->motorcycle_count : 0,
                'car_count' => $scheduleDate ? $scheduleDate->car_count : 0,
                'bus_count' => $scheduleDate ? $scheduleDate->bus_count : 0,
                'truck_count' => $scheduleDate ? $scheduleDate->truck_count : 0,
                'total_bookings' => $scheduleBookings->count(),
                'confirmed_bookings' => $confirmedBookings,
                'completed_bookings' => $completedBookings,
                'cancelled_bookings' => $cancelledBookings,
                'checked_in_passengers' => $checkedInPassengers,
                'occupancy_rate' => $schedule->ferry->capacity_passenger > 0
                    ? ($passengerCount / $schedule->ferry->capacity_passenger) * 100
                    : 0,
                'bookings' => $scheduleBookings,
            ];
        });

        if ($request->has('export') && $request->export === 'csv') {
            // Generate CSV
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="daily_report_' . $date->format('Y-m-d') . '.csv"',
            ];

            $callback = function() use ($reportData, $date) {
                $file = fopen('php://output', 'w');

                // Header row
                fputcsv($file, [
                    'Laporan Harian Tanggal: ' . $date->format('d F Y'),
                ]);

                fputcsv($file, [
                    'Rute',
                    'Kapal',
                    'Jadwal',
                    'Total Penumpang',
                    'Penumpang Check-In',
                    'Total Kendaraan',
                    'Motor',
                    'Mobil',
                    'Bus',
                    'Truk',
                    'Okupansi (%)',
                    'Total Booking',
                    'Booking Dikonfirmasi',
                    'Booking Selesai',
                    'Booking Dibatalkan',
                ]);

                // Data rows
                foreach ($reportData as $data) {
                    fputcsv($file, [
                        $data['schedule']->route->origin . ' - ' . $data['schedule']->route->destination,
                        $data['schedule']->ferry->name,
                        $data['schedule']->departure_time . ' - ' . $data['schedule']->arrival_time,
                        $data['passengers'],
                        $data['checked_in_passengers'],
                        $data['vehicles'],
                        $data['motorcycle_count'],
                        $data['car_count'],
                        $data['bus_count'],
                        $data['truck_count'],
                        number_format($data['occupancy_rate'], 2),
                        $data['total_bookings'],
                        $data['confirmed_bookings'],
                        $data['completed_bookings'],
                        $data['cancelled_bookings'],
                    ]);
                }

                fclose($file);
            };

            return Response::stream($callback, 200, $headers);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'report' => $reportData,
                'date' => $date->format('Y-m-d')
            ]
        ]);
    }

    /**
     * Get monthly report data
     */
    public function monthlyReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'month' => 'required|date_format:Y-m',
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

        $month = Carbon::createFromFormat('Y-m', $request->month);
        $startDate = $month->copy()->startOfMonth();
        $endDate = $month->copy()->endOfMonth();

        // Get bookings for the month
        $bookings = Booking::whereHas('schedule', function($q) use ($assignedRouteIds) {
                $q->whereIn('route_id', $assignedRouteIds);
            })
            ->whereBetween('departure_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->with(['schedule.route', 'schedule.ferry'])
            ->get();

        // Group by route and date
        $routeData = [];
        foreach ($bookings as $booking) {
            $routeId = $booking->schedule->route_id;
            $date = Carbon::parse($booking->departure_date)->format('Y-m-d');

            if (!isset($routeData[$routeId])) {
                $routeData[$routeId] = [
                    'route' => $booking->schedule->route,
                    'dates' => [],
                    'total_passengers' => 0,
                    'total_vehicles' => 0,
                    'total_amount' => 0
                ];
            }

            if (!isset($routeData[$routeId]['dates'][$date])) {
                $routeData[$routeId]['dates'][$date] = [
                    'passengers' => 0,
                    'vehicles' => 0,
                    'amount' => 0
                ];
            }

            // Only count confirmed and completed bookings
            if (in_array($booking->status, ['CONFIRMED', 'COMPLETED'])) {
                $routeData[$routeId]['dates'][$date]['passengers'] += $booking->passenger_count;
                $routeData[$routeId]['dates'][$date]['vehicles'] += $booking->vehicle_count;
                $routeData[$routeId]['dates'][$date]['amount'] += $booking->total_amount;

                $routeData[$routeId]['total_passengers'] += $booking->passenger_count;
                $routeData[$routeId]['total_vehicles'] += $booking->vehicle_count;
                $routeData[$routeId]['total_amount'] += $booking->total_amount;
            }
        }

        if ($request->has('export') && $request->export === 'csv') {
            // Generate CSV
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="monthly_report_' . $month->format('Y-m') . '.csv"',
            ];

            $callback = function() use ($routeData, $month) {
                $file = fopen('php://output', 'w');

                // Header row
                fputcsv($file, [
                    'Laporan Bulanan: ' . $month->format('F Y'),
                ]);

                foreach ($routeData as $routeId => $data) {
                    fputcsv($file, [
                        'Rute: ' . $data['route']->origin . ' - ' . $data['route']->destination,
                    ]);

                    fputcsv($file, [
                        'Tanggal',
                        'Total Penumpang',
                        'Total Kendaraan',
                        'Total Pendapatan',
                    ]);

                    // Sort dates
                    ksort($data['dates']);

                    foreach ($data['dates'] as $date => $dateData) {
                        fputcsv($file, [
                            Carbon::parse($date)->format('d F Y'),
                            $dateData['passengers'],
                            $dateData['vehicles'],
                            $dateData['amount'],
                        ]);
                    }

                    fputcsv($file, [
                        'Total',
                        $data['total_passengers'],
                        $data['total_vehicles'],
                        $data['total_amount'],
                    ]);

                    // Add empty row between routes
                    fputcsv($file, []);
                }

                fclose($file);
            };

            return Response::stream($callback, 200, $headers);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'routeData' => $routeData,
                'month' => $month->format('Y-m')
            ]
        ]);
    }

    /**
     * Export daily report as CSV
     */
    public function exportDailyReport(Request $request)
    {
        return $this->dailyReport($request);
    }

    /**
     * Export monthly report as CSV
     */
    public function exportMonthlyReport(Request $request)
    {
        return $this->monthlyReport($request);
    }
}
