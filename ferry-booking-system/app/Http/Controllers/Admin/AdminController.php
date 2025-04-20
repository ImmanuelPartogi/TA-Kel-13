<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Ferry;
use App\Models\Route;
use App\Models\Schedule;
use App\Models\Booking;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function dashboard()
    {
        // Statistik dasar
        $users_count = User::count();
        $ferries_count = Ferry::count();
        $routes_count = Route::count();
        $active_schedules = Schedule::where('status', 'ACTIVE')->count();

        // Booking bulan ini dan pendapatan
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $monthly_bookings = Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $monthly_income = Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->whereIn('status', ['CONFIRMED', 'COMPLETED'])
            ->sum('total_amount');

        // Perbandingan dengan bulan lalu
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        $lastMonthBookings = Booking::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
        $lastMonthIncome = Booking::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->whereIn('status', ['CONFIRMED', 'COMPLETED'])
            ->sum('total_amount');

        $bookingGrowth = $lastMonthBookings > 0
            ? round((($monthly_bookings - $lastMonthBookings) / $lastMonthBookings) * 100, 1)
            : 0;
        $incomeGrowth = $lastMonthIncome > 0
            ? round((($monthly_income - $lastMonthIncome) / $lastMonthIncome) * 100, 1)
            : 0;

        // Data booking 7 hari terakhir untuk grafik
        $startDate = Carbon::now()->subDays(6);
        $weekly_booking_data = [];
        $weekly_booking_labels = [];

        for ($i = 0; $i <= 6; $i++) {
            $date = $startDate->copy()->addDays($i);
            $count = Booking::whereDate('created_at', $date)->count();

            $weekly_booking_data[] = $count;
            // Translasi ke bahasa Indonesia
            $dayNames = [
                'Mon' => 'Sen',
                'Tue' => 'Sel',
                'Wed' => 'Rab',
                'Thu' => 'Kam',
                'Fri' => 'Jum',
                'Sat' => 'Sab',
                'Sun' => 'Min'
            ];
            $weekly_booking_labels[] = $dayNames[$date->format('D')];
        }

        // Status booking
        $pending_payment_count = Booking::where('status', 'PENDING')->count();
        $not_checked_in_count = Booking::where('status', 'CONFIRMED')
            ->whereDate('booking_date', '>=', Carbon::today())
            ->count();
        $checked_in_count = Booking::where('status', 'COMPLETED')->count();
        $cancelled_count = Booking::where('status', 'CANCELLED')->count();

        // Booking terbaru
        $latest_bookings = Booking::with('user', 'schedule.route')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Pertumbuhan jumlah user
        $lastMonthUsers = User::whereDate('created_at', '<', $startOfMonth)->count();
        $userGrowth = $lastMonthUsers > 0
            ? round((($users_count - $lastMonthUsers) / $lastMonthUsers) * 100, 1)
            : 0;

        return view('admin.dashboard', compact(
            'users_count',
            'ferries_count',
            'routes_count',
            'active_schedules',
            'monthly_bookings',
            'monthly_income',
            'bookingGrowth',
            'incomeGrowth',
            'userGrowth',
            'weekly_booking_data',
            'weekly_booking_labels',
            'pending_payment_count',
            'not_checked_in_count',
            'checked_in_count',
            'cancelled_count',
            'latest_bookings'
        ));
    }
}
