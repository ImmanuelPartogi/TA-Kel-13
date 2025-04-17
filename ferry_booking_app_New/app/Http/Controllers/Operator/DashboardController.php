<?php

// app/Http/Controllers/Operator/DashboardController.php
namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\ActivityLog; // Tambahkan impor model ActivityLog

class DashboardController extends Controller
{
    public function index()
    {
        $operator = Auth::user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        // Menghitung total jadwal yang dikelola operator
        $totalSchedules = Schedule::whereIn('route_id', $assignedRouteIds)
            ->where('status', 'ACTIVE')
            ->count();

        // Mendapatkan data booking berdasarkan rute yang dikelola
        $totalBookings = Booking::whereHas('schedule', function ($query) use ($assignedRouteIds) {
            $query->whereIn('route_id', $assignedRouteIds);
        })
            ->count();

        // Mendapatkan data booking bulan ini
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $bookingsThisMonth = Booking::whereHas('schedule', function ($query) use ($assignedRouteIds) {
            $query->whereIn('route_id', $assignedRouteIds);
        })
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();

        // Mendapatkan total pendapatan bulan ini
        $revenueThisMonth = Booking::whereHas('schedule', function ($query) use ($assignedRouteIds) {
            $query->whereIn('route_id', $assignedRouteIds);
        })
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->whereIn('status', ['CONFIRMED', 'COMPLETED'])
            ->sum('total_amount');

        // Mendapatkan data booking per hari dalam seminggu terakhir
        $lastWeekBookings = Booking::whereHas('schedule', function ($query) use ($assignedRouteIds) {
            $query->whereIn('route_id', $assignedRouteIds);
        })
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as total')
            )
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $bookingChartData = [];
        foreach ($lastWeekBookings as $item) {
            $bookingChartData[] = [
                'date' => Carbon::parse($item->date)->format('d M'),
                'total' => $item->total
            ];
        }

        // Mendapatkan jadwal hari ini
        $todaySchedules = Schedule::whereIn('route_id', $assignedRouteIds)
            ->where('status', 'ACTIVE')
            ->whereRaw("FIND_IN_SET(?, days)", [Carbon::now()->dayOfWeek + 1])
            ->with(['route', 'ferry'])
            ->get();

        // Mendapatkan aktivitas terkini dari database
        $recentActivities = ActivityLog::where(function ($query) use ($assignedRouteIds) {
            $query->whereHas('schedule', function ($q) use ($assignedRouteIds) {
                $q->whereIn('route_id', $assignedRouteIds);
            })
                ->orWhereHas('booking.schedule', function ($q) use ($assignedRouteIds) {
                    $q->whereIn('route_id', $assignedRouteIds);
                });
        })
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('operator.dashboard', compact(
            'totalSchedules',
            'totalBookings',
            'bookingsThisMonth',
            'revenueThisMonth',
            'bookingChartData',
            'todaySchedules',
            'recentActivities'
        ));
    }
}
