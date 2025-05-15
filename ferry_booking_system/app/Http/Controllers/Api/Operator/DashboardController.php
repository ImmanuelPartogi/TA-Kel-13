<?php

namespace App\Http\Controllers\Api\Operator;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Schedule;
use App\Models\Route;
use App\Models\ActivityLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Get dashboard stats
     */
    public function getStats()
    {
        $operator = Auth::user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        // Logging untuk debugging
        Log::info("Dashboard: Operator ID: " . $operator->id . " assigned routes: " . json_encode($assignedRouteIds));

        // Default values jika tidak ada rute yang ditugaskan
        $stats = [
            'totalSchedules' => 0,
            'totalBookings' => 0,
            'bookingsThisMonth' => 0,
            'revenueThisMonth' => 0,
            'noRoutesAssigned' => empty($assignedRouteIds)
        ];

        // Hanya proses data jika operator memiliki rute yang ditugaskan
        if (!empty($assignedRouteIds)) {
            // Menghitung total jadwal yang dikelola operator
            $stats['totalSchedules'] = Schedule::whereIn('route_id', $assignedRouteIds)
                ->where('status', 'ACTIVE')
                ->count();

            // Mendapatkan data booking berdasarkan rute yang dikelola
            $stats['totalBookings'] = Booking::whereHas('schedule', function ($query) use ($assignedRouteIds) {
                $query->whereIn('route_id', $assignedRouteIds);
            })->count();

            // Mendapatkan data booking bulan ini
            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();

            $stats['bookingsThisMonth'] = Booking::whereHas('schedule', function ($query) use ($assignedRouteIds) {
                $query->whereIn('route_id', $assignedRouteIds);
            })
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count();

            // Mendapatkan total pendapatan bulan ini
            $stats['revenueThisMonth'] = Booking::whereHas('schedule', function ($query) use ($assignedRouteIds) {
                $query->whereIn('route_id', $assignedRouteIds);
            })
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->whereIn('status', ['CONFIRMED', 'COMPLETED'])
                ->sum('total_amount');
        }

        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }

    /**
     * Get dashboard summary
     */
    public function getSummary()
    {
        $operator = Auth::user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        // Default values
        $summary = [
            'bookingChartData' => [],
            'todaySchedules' => [],
            'recentActivities' => [],
            'routes' => [],
            'noRoutesAssigned' => empty($assignedRouteIds)
        ];

        // Hanya proses data jika operator memiliki rute yang ditugaskan
        if (!empty($assignedRouteIds)) {
            // Mendapatkan data booking per hari dalam seminggu terakhir
            $startDate = Carbon::now()->subDays(6)->startOfDay();
            $endDate = Carbon::now()->endOfDay();

            // Buat array tanggal untuk 7 hari terakhir
            $dateRange = [];
            for ($date = clone $startDate; $date <= $endDate; $date->addDay()) {
                $dateFormatted = $date->format('Y-m-d');
                $dateRange[$dateFormatted] = 0; // Default ke 0 booking
            }

            // Ambil data booking berdasarkan rute yang ditugaskan
            $lastWeekBookings = Booking::whereHas('schedule', function ($query) use ($assignedRouteIds) {
                $query->whereIn('route_id', $assignedRouteIds);
            })
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('count(*) as total')
                )
                ->where('created_at', '>=', $startDate)
                ->where('created_at', '<=', $endDate)
                ->groupBy('date')
                ->get();

            // Masukkan data booking ke array tanggal
            foreach ($lastWeekBookings as $item) {
                if (isset($dateRange[$item->date])) {
                    $dateRange[$item->date] = $item->total;
                }
            }

            // Format data untuk chart
            foreach ($dateRange as $date => $total) {
                $summary['bookingChartData'][] = [
                    'date' => Carbon::parse($date)->format('d M'),
                    'total' => $total
                ];
            }

            // Mendapatkan jadwal hari ini
            $summary['todaySchedules'] = Schedule::whereIn('route_id', $assignedRouteIds)
                ->where('status', 'ACTIVE')
                ->whereRaw("FIND_IN_SET(?, days)", [Carbon::now()->dayOfWeek == 0 ? 7 : Carbon::now()->dayOfWeek])
                ->with(['route', 'ferry'])
                ->get();

            // Mendapatkan aktivitas terkini dari database
            $summary['recentActivities'] = ActivityLog::where(function ($query) use ($assignedRouteIds) {
                $query->whereHas('booking', function($q) use ($assignedRouteIds) {
                    $q->whereHas('schedule', function($sq) use ($assignedRouteIds) {
                        $sq->whereIn('route_id', $assignedRouteIds);
                    });
                })
                ->orWhere(function($q) use ($assignedRouteIds) {
                    $q->where('reference_type', 'schedule')
                        ->whereIn('reference_id', Schedule::whereIn('route_id', $assignedRouteIds)->pluck('id'));
                });
            })
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            // Data rute untuk ditampilkan di dashboard
            $summary['routes'] = Route::whereIn('id', $assignedRouteIds)->get(['id', 'origin', 'destination']);
        }

        return response()->json([
            'status' => 'success',
            'data' => $summary
        ]);
    }
}
