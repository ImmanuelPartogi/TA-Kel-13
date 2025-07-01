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

        // Tanggal untuk perbandingan
        $currentMonth = Carbon::now();
        $startOfMonth = $currentMonth->copy()->startOfMonth();
        $endOfMonth = $currentMonth->copy()->endOfMonth();
        $lastMonth = $currentMonth->copy()->subMonth();
        $startOfLastMonth = $lastMonth->copy()->startOfMonth();
        $endOfLastMonth = $lastMonth->copy()->endOfMonth();

        // Booking bulan ini - gunakan whereMonth dan whereYear untuk konsistensi
        $monthly_bookings = Booking::whereMonth('departure_date', $currentMonth->month)
            ->whereYear('departure_date', $currentMonth->year)
            ->count();

        // Pendapatan bulan ini - gunakan whereMonth dan whereYear untuk konsistensi
        $monthly_income = Booking::whereMonth('departure_date', $currentMonth->month)
            ->whereYear('departure_date', $currentMonth->year)
            ->whereIn('status', ['CONFIRMED', 'COMPLETED'])
            ->sum('total_amount');

        // Booking bulan lalu - gunakan whereMonth dan whereYear untuk konsistensi
        $lastMonthBookings = Booking::whereMonth('departure_date', $lastMonth->month)
            ->whereYear('departure_date', $lastMonth->year)
            ->count();

        // Pendapatan bulan lalu - gunakan whereMonth dan whereYear untuk konsistensi
        $lastMonthIncome = Booking::whereMonth('departure_date', $lastMonth->month)
            ->whereYear('departure_date', $lastMonth->year)
            ->whereIn('status', ['CONFIRMED', 'COMPLETED'])
            ->sum('total_amount');

        // Perhitungan persentase pertumbuhan yang lebih baik
        if ($lastMonthBookings > 0) {
            // Kasus normal - ada booking bulan lalu
            $bookingGrowth = round((($monthly_bookings - $lastMonthBookings) / $lastMonthBookings) * 100, 1);
        } elseif ($monthly_bookings > 0) {
            // Kasus pertumbuhan dari nol
            $bookingGrowth = 100.0; // Tetapkan sebagai 100% untuk menunjukkan pertumbuhan baru
        } else {
            // Kasus tidak ada booking sama sekali
            $bookingGrowth = 0.0; // Tetapkan 0.0 untuk memastikan tipe data adalah float
        }

        if ($lastMonthIncome > 0) {
            // Kasus normal - ada pendapatan bulan lalu
            $incomeGrowth = round((($monthly_income - $lastMonthIncome) / $lastMonthIncome) * 100, 1);
        } elseif ($monthly_income > 0) {
            // Kasus pertumbuhan dari nol
            $incomeGrowth = 100.0; // Tetapkan sebagai 100% untuk menunjukkan pertumbuhan baru
        } else {
            // Kasus tidak ada pendapatan sama sekali
            $incomeGrowth = 0.0; // Tetapkan 0.0 untuk memastikan tipe data adalah float
        }

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
                    'booking_growth' => $bookingGrowth,  // Dikirim sebagai float
                    'income_growth' => $incomeGrowth,    // Dikirim sebagai float
                    // Tambahkan detail periode untuk referensi
                    'current_month' => [
                        'start' => $startOfMonth->format('Y-m-d'),
                        'end' => $endOfMonth->format('Y-m-d'),
                    ],
                    'last_month' => [
                        'start' => $startOfLastMonth->format('Y-m-d'),
                        'end' => $endOfLastMonth->format('Y-m-d'),
                    ],
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
                ],
                // Tambahkan data mentah untuk debugging
                'debug' => [
                    'last_month_bookings' => $lastMonthBookings,
                    'last_month_income' => $lastMonthIncome,
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

        // Ambil data untuk setiap hari dalam bulan ini
        $daysInMonth = $startOfMonth->daysInMonth;
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $date = Carbon::createFromDate(now()->year, now()->month, $i);
            $count = Booking::whereDate('created_at', $date)->count();

            $monthly_booking_data[] = $count;
            $monthly_booking_labels[] = $i; // Hanya menampilkan tanggal
        }

        // Pertumbuhan jumlah user
        $users_count = User::count();
        $lastMonthDate = Carbon::now()->subMonth()->endOfMonth();
        $lastMonthUsers = User::whereDate('created_at', '<=', $lastMonthDate)->count();

        // Perhitungan persentase pertumbuhan user yang lebih baik
        if ($lastMonthUsers > 0) {
            $userGrowth = round((($users_count - $lastMonthUsers) / $lastMonthUsers) * 100, 1);
        } elseif ($users_count > 0) {
            $userGrowth = 100.0;
        } else {
            $userGrowth = 0.0;
        }

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
                'user_growth' => $userGrowth,
                // Tambahkan data mentah untuk debugging
                'debug' => [
                    'users_count' => $users_count,
                    'last_month_users' => $lastMonthUsers,
                ]
            ]
        ]);
    }
}
