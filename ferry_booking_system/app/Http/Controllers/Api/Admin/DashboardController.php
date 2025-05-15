<?php

namespace App\Http\Controllers\Api\Admin;

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
    public function getStats()
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
           ->whereDate('departure_date', '>=', Carbon::today())
           ->count();
       $checked_in_count = Booking::where('status', 'COMPLETED')->count();
       $cancelled_count = Booking::where('status', 'CANCELLED')->count();

       return response()->json([
           'success' => true,
           'data' => [
               'stats' => [
                   'users_count' => $users_count,
                   'ferries_count' => $ferries_count,
                   'routes_count' => $routes_count,
                   'active_schedules' => $active_schedules,
                   'monthly_bookings' => $monthly_bookings,
                   'monthly_income' => $monthly_income,
                   'booking_growth' => $bookingGrowth,
                   'income_growth' => $incomeGrowth,
               ],
               'charts' => [
                   'weekly' => [
                       'data' => $weekly_booking_data,
                       'labels' => $weekly_booking_labels,
                   ]
               ],
               'booking_status' => [
                   'pending_payment' => $pending_payment_count,
                   'not_checked_in' => $not_checked_in_count,
                   'checked_in' => $checked_in_count,
                   'cancelled' => $cancelled_count,
               ]
           ]
       ]);
    }

    public function getSummary()
    {
        // Booking terbaru
        $latest_bookings = Booking::with('user', 'schedule.route')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Data booking bulanan untuk grafik
        $startOfMonth = Carbon::now()->startOfMonth();
        $monthly_booking_data = [];
        $monthly_booking_labels = [];

        // Ambil data 30 hari terakhir dari bulan ini
        $daysInMonth = $startOfMonth->daysInMonth;
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $date = Carbon::createFromDate(now()->year, now()->month, $i);
            $count = Booking::whereDate('created_at', $date)->count();

            $monthly_booking_data[] = $count;
            $monthly_booking_labels[] = $i; // Hanya menampilkan tanggal
        }

        // Pertumbuhan jumlah user
        $users_count = User::count();
        $lastMonthUsers = User::whereDate('created_at', '<', $startOfMonth)->count();
        $userGrowth = $lastMonthUsers > 0
            ? round((($users_count - $lastMonthUsers) / $lastMonthUsers) * 100, 1)
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'latest_bookings' => $latest_bookings,
                'charts' => [
                    'monthly' => [
                        'data' => $monthly_booking_data,
                        'labels' => $monthly_booking_labels,
                    ]
                ],
                'user_growth' => $userGrowth
            ]
        ]);
    }
}
