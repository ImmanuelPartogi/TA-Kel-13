<?php

// app/Http/Controllers/Admin/DashboardController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Ferry;
use App\Models\Route;
use App\Models\Schedule;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Menghitung total pengguna
        $totalUsers = User::count();

        // Menghitung total feri
        $totalFerries = Ferry::count();

        // Menghitung total rute
        $totalRoutes = Route::count();

        // Menghitung total jadwal aktif
        $totalActiveSchedules = Schedule::where('status', 'ACTIVE')->count();

        // Mendapatkan data booking berdasarkan status
        $bookingsByStatus = Booking::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status')
            ->toArray();

        // Mendapatkan data booking bulan ini
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $bookingsThisMonth = Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();

        // Mendapatkan total pendapatan bulan ini
        $revenueThisMonth = Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->whereIn('status', ['CONFIRMED', 'COMPLETED'])
            ->sum('total_amount');

        // Mendapatkan data booking per hari dalam seminggu terakhir
        $lastWeekBookings = Booking::select(
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

        return view('admin.dashboard', compact(
            'totalUsers',
            'totalFerries',
            'totalRoutes',
            'totalActiveSchedules',
            'bookingsByStatus',
            'bookingsThisMonth',
            'revenueThisMonth',
            'bookingChartData'
        ));
    }
}
