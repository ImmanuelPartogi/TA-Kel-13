<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Route;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;

class ReportController extends Controller
{
    public function index()
    {
        $routes = Route::where('status', 'ACTIVE')->get();

        // Get quick stats for dashboard
        $stats = $this->getQuickStats();

        // Get popular routes
        $popularRoutes = $this->getPopularRoutes();

        return view('admin.reports.index', compact('routes', 'stats', 'popularRoutes'));
    }

    private function getQuickStats()
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        $today = Carbon::today();

        $bookingsThisMonth = Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();

        $revenueThisMonth = Payment::where('status', 'SUCCESS')
            ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $bookingsThisWeek = Booking::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count();

        $bookingsToday = Booking::whereDate('created_at', $today)->count();

        return [
            'bookings_this_month' => $bookingsThisMonth,
            'revenue_this_month' => $revenueThisMonth,
            'bookings_this_week' => $bookingsThisWeek,
            'bookings_today' => $bookingsToday
        ];
    }

    private function getPopularRoutes()
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $popularRoutes = Route::select(
                'routes.id',
                'routes.origin',
                'routes.destination',
                DB::raw('COUNT(bookings.id) as booking_count'),
                DB::raw('SUM(bookings.total_amount) as total_revenue')
            )
            ->join('schedules', 'routes.id', '=', 'schedules.route_id')
            ->join('bookings', 'schedules.id', '=', 'bookings.schedule_id')
            ->whereBetween('bookings.created_at', [$startOfMonth, $endOfMonth])
            ->whereIn('bookings.status', ['CONFIRMED', 'COMPLETED'])
            ->groupBy('routes.id', 'routes.origin', 'routes.destination')
            ->orderBy('booking_count', 'desc')
            ->limit(5)
            ->get();

        return $popularRoutes;
    }

    public function bookingReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'route_id' => 'nullable|exists:routes,id',
            'status' => 'nullable|in:PENDING,CONFIRMED,CANCELLED,COMPLETED,REFUNDED,RESCHEDULED',
        ]);

        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate = Carbon::parse($request->end_date)->endOfDay();

        $query = Booking::with(['user', 'schedule.route', 'schedule.ferry'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($request->has('route_id') && $request->route_id) {
            $query->whereHas('schedule', function ($q) use ($request) {
                $q->where('route_id', $request->route_id);
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        // Summary statistics
        $totalBookings = $bookings->count();
        $totalPassengers = $bookings->sum('passenger_count');
        $totalVehicles = $bookings->sum('vehicle_count');
        $totalRevenue = $bookings->whereIn('status', ['CONFIRMED', 'COMPLETED'])->sum('total_amount');

        $statusCount = $bookings->groupBy('status')
            ->map(function ($items, $key) {
                return [
                    'status' => $key,
                    'count' => $items->count(),
                    'amount' => $items->sum('total_amount')
                ];
            })
            ->values();

        if ($request->has('export') && $request->export === 'csv') {
            // Generate CSV
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="booking_report_' . $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d') . '.csv"',
            ];

            $callback = function () use ($bookings) {
                $file = fopen('php://output', 'w');

                // Header row
                fputcsv($file, [
                    'Booking Code',
                    'Tanggal Booking',
                    'Pengguna',
                    'Rute',
                    'Jadwal',
                    'Tanggal Keberangkatan',
                    'Jumlah Penumpang',
                    'Jumlah Kendaraan',
                    'Total Harga',
                    'Status',
                    'Dibuat Pada',
                ]);

                // Data rows
                foreach ($bookings as $booking) {
                    fputcsv($file, [
                        $booking->booking_code,
                        $booking->created_at->format('Y-m-d H:i:s'),
                        $booking->user->name,
                        $booking->schedule->route->origin . ' - ' . $booking->schedule->route->destination,
                        $booking->schedule->departure_time . ' - ' . $booking->schedule->arrival_time,
                        $booking->booking_date,
                        $booking->passenger_count,
                        $booking->vehicle_count,
                        $booking->total_amount,
                        $booking->status,
                        $booking->created_at->format('Y-m-d H:i:s'),
                    ]);
                }

                fclose($file);
            };

            return Response::stream($callback, 200, $headers);
        }

        return view('admin.reports.booking', compact(
            'bookings',
            'startDate',
            'endDate',
            'totalBookings',
            'totalPassengers',
            'totalVehicles',
            'totalRevenue',
            'statusCount'
        ));
    }

    public function revenueReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'route_id' => 'nullable|exists:routes,id',
            'group_by' => 'required|in:daily,weekly,monthly',
        ]);

        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate = Carbon::parse($request->end_date)->endOfDay();

        $query = Payment::with(['booking.schedule.route'])
            ->whereHas('booking', function ($q) {
                $q->whereIn('status', ['CONFIRMED', 'COMPLETED']);
            })
            ->where('status', 'SUCCESS')
            ->whereBetween('payment_date', [$startDate, $endDate]);

        if ($request->has('route_id') && $request->route_id) {
            $query->whereHas('booking.schedule', function ($q) use ($request) {
                $q->where('route_id', $request->route_id);
            });
        }

        $formatStr = match ($request->group_by) {
            'daily' => '%Y-%m-%d',
            'weekly' => '%x-W%v',
            'monthly' => '%Y-%m',
        };

        $revenues = $query
            ->select(
                DB::raw("DATE_FORMAT(payment_date, '$formatStr') as period"),
                DB::raw('SUM(amount) as total_amount'),
                DB::raw('COUNT(*) as transaction_count')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $totalRevenue = $revenues->sum('total_amount');
        $totalTransactions = $revenues->sum('transaction_count');

        if ($request->has('export') && $request->export === 'csv') {
            // Generate CSV
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="revenue_report_' . $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d') . '.csv"',
            ];

            $callback = function () use ($revenues, $request) {
                $file = fopen('php://output', 'w');

                // Format period label based on grouping
                $periodLabel = match ($request->group_by) {
                    'daily' => 'Tanggal',
                    'weekly' => 'Minggu',
                    'monthly' => 'Bulan',
                };

                // Header row
                fputcsv($file, [
                    $periodLabel,
                    'Jumlah Transaksi',
                    'Total Pendapatan',
                ]);

                // Data rows
                foreach ($revenues as $revenue) {
                    fputcsv($file, [
                        $revenue->period,
                        $revenue->transaction_count,
                        $revenue->total_amount,
                    ]);
                }

                fclose($file);
            };

            return Response::stream($callback, 200, $headers);
        }

        return view('admin.reports.revenue', compact(
            'revenues',
            'startDate',
            'endDate',
            'totalRevenue',
            'totalTransactions',
            'request'
        ));
    }

    public function scheduleReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'route_id' => 'nullable|exists:routes,id',
        ]);

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);

        $query = ScheduleDate::with(['schedule.route', 'schedule.ferry'])
            ->whereBetween('date', [$startDate, $endDate]);

        if ($request->has('route_id') && $request->route_id) {
            $query->whereHas('schedule', function ($q) use ($request) {
                $q->where('route_id', $request->route_id);
            });
        }

        $scheduleDates = $query->orderBy('date')->get();

        // Group by schedule
        $scheduleStats = $scheduleDates->groupBy('schedule_id')
            ->map(function ($items, $scheduleId) {
                $schedule = $items->first()->schedule;

                return [
                    'schedule_id' => $scheduleId,
                    'route' => $schedule->route->origin . ' - ' . $schedule->route->destination,
                    'ferry' => $schedule->ferry->name,
                    'time' => $schedule->departure_time . ' - ' . $schedule->arrival_time,
                    'days' => $schedule->days,
                    'dates_count' => $items->count(),
                    'passenger_count' => $items->sum('passenger_count'),
                    'vehicle_count' => $items->sum('motorcycle_count') + $items->sum('car_count') + $items->sum('bus_count') + $items->sum('truck_count'),
                    'motorcycle_count' => $items->sum('motorcycle_count'),
                    'car_count' => $items->sum('car_count'),
                    'bus_count' => $items->sum('bus_count'),
                    'truck_count' => $items->sum('truck_count'),
                    'average_occupancy_rate' => $items->avg(function ($item) {
                        $passengerCapacity = $item->schedule->ferry->capacity_passenger;
                        return $passengerCapacity > 0 ? ($item->passenger_count / $passengerCapacity) * 100 : 0;
                    }),
                ];
            })
            ->values();

        if ($request->has('export') && $request->export === 'csv') {
            // Generate CSV
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="schedule_report_' . $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d') . '.csv"',
            ];

            $callback = function () use ($scheduleStats) {
                $file = fopen('php://output', 'w');

                // Header row
                fputcsv($file, [
                    'ID Jadwal',
                    'Rute',
                    'Kapal',
                    'Waktu',
                    'Hari',
                    'Jumlah Tanggal',
                    'Jumlah Penumpang',
                    'Jumlah Kendaraan',
                    'Motor',
                    'Mobil',
                    'Bus',
                    'Truk',
                    'Rata-rata Okupansi (%)',
                ]);

                // Data rows
                foreach ($scheduleStats as $stat) {
                    fputcsv($file, [
                        $stat['schedule_id'],
                        $stat['route'],
                        $stat['ferry'],
                        $stat['time'],
                        $stat['days'],
                        $stat['dates_count'],
                        $stat['passenger_count'],
                        $stat['vehicle_count'],
                        $stat['motorcycle_count'],
                        $stat['car_count'],
                        $stat['bus_count'],
                        $stat['truck_count'],
                        number_format($stat['average_occupancy_rate'], 2),
                    ]);
                }

                fclose($file);
            };

            return Response::stream($callback, 200, $headers);
        }

        return view('admin.reports.schedule', compact(
            'scheduleStats',
            'startDate',
            'endDate'
        ));
    }
}
