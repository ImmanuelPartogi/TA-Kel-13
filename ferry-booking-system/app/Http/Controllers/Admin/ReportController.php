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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Response;

class ReportController extends Controller
{
    public function index()
    {
        $routes = Route::where('status', 'ACTIVE')->get();

        // Gunakan cache untuk data statistik yang sering diakses
        $stats = Cache::remember('dashboard_quick_stats', 300, function () {
            return $this->getQuickStats();
        });

        // Gunakan cache untuk data rute populer yang sering diakses
        $popularRoutes = Cache::remember('dashboard_popular_routes', 600, function () {
            return $this->getPopularRoutes();
        });

        return view('admin.reports.index', compact('routes', 'stats', 'popularRoutes'));
    }

    private function getQuickStats()
    {
        // Gunakan timezone yang sesuai dengan lokasi
        $timezone = config('app.timezone', 'Asia/Jakarta');

        $startOfMonth = Carbon::now($timezone)->startOfMonth();
        $endOfMonth = Carbon::now($timezone)->endOfMonth();
        $startOfWeek = Carbon::now($timezone)->startOfWeek();
        $endOfWeek = Carbon::now($timezone)->endOfWeek();
        $today = Carbon::today($timezone);

        // Gunakan query yang dioptimalkan dengan indexing
        $bookingsThisMonth = Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();

        // Hanya hitung pembayaran sukses dan gunakan index pada status dan payment_date
        $revenueThisMonth = Payment::where('status', 'SUCCESS')
            ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $bookingsThisWeek = Booking::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count();

        $bookingsToday = Booking::whereDate('created_at', $today)->count();

        // Tambahkan data tambahan yang relevan
        $confirmedBookingsThisMonth = Booking::where('status', 'CONFIRMED')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();

        $cancelledBookingsThisMonth = Booking::where('status', 'CANCELLED')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();

        return [
            'bookings_this_month' => $bookingsThisMonth,
            'revenue_this_month' => $revenueThisMonth,
            'bookings_this_week' => $bookingsThisWeek,
            'bookings_today' => $bookingsToday,
            'confirmed_bookings_this_month' => $confirmedBookingsThisMonth,
            'cancelled_bookings_this_month' => $cancelledBookingsThisMonth,
            'last_updated' => Carbon::now($timezone)->format('Y-m-d H:i:s')
        ];
    }

    private function getPopularRoutes()
    {
        $timezone = config('app.timezone', 'Asia/Jakarta');
        $startOfMonth = Carbon::now($timezone)->startOfMonth();
        $endOfMonth = Carbon::now($timezone)->endOfMonth();

        // Tambahkan indeks pada tanggal untuk meningkatkan performa
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

        // Tambahkan persentase okupansi untuk setiap rute
        foreach ($popularRoutes as $route) {
            $route->available_capacity = Schedule::join('ferries', 'schedules.ferry_id', '=', 'ferries.id')
                ->where('schedules.route_id', $route->id)
                ->where('schedules.status', 'ACTIVE')
                ->sum('ferries.capacity_passenger');

            // Hitung okupansi jika kapasitas tersedia
            if ($route->available_capacity > 0) {
                $route->occupancy_rate = ($route->booking_count / $route->available_capacity) * 100;
            } else {
                $route->occupancy_rate = 0;
            }
        }

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

        $timezone = config('app.timezone', 'Asia/Jakarta');
        $startDate = Carbon::parse($request->start_date, $timezone)->startOfDay();
        $endDate = Carbon::parse($request->end_date, $timezone)->endOfDay();

        // Gunakan eager loading untuk meningkatkan performa
        $query = Booking::with([
                'user',
                'schedule.route',
                'schedule.ferry',
                'payments' => function($q) {
                    $q->where('status', 'SUCCESS');
                }
            ])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($request->has('route_id') && $request->route_id) {
            $query->whereHas('schedule', function ($q) use ($request) {
                $q->where('route_id', $request->route_id);
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Tambahkan opsi pengurutan
        $sortField = $request->input('sort_field', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');

        $allowedSortFields = ['booking_code', 'created_at', 'departure_date', 'total_amount', 'status'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        $query->orderBy($sortField, $sortOrder);

        $bookings = $query->get();

        // Hitung statistik dengan lebih akurat
        $totalBookings = $bookings->count();
        $totalPassengers = $bookings->sum('passenger_count');
        $totalVehicles = $bookings->sum('vehicle_count');
        $totalRevenue = $bookings->whereIn('status', ['CONFIRMED', 'COMPLETED'])->sum('total_amount');

        // Tambahkan statistik payment actual dari relasi payments
        $actualRevenue = $bookings->sum(function($booking) {
            return $booking->payments->sum('amount');
        });

        $statusCount = $bookings->groupBy('status')
            ->map(function ($items, $key) {
                return [
                    'status' => $key,
                    'count' => $items->count(),
                    'amount' => $items->sum('total_amount'),
                    'percentage' => 0 // Akan diisi nanti
                ];
            })
            ->values();

        // Hitung persentase untuk setiap status
        if ($totalBookings > 0) {
            $statusCount->transform(function ($item) use ($totalBookings) {
                $item['percentage'] = ($item['count'] / $totalBookings) * 100;
                return $item;
            });
        }

        // Tambahkan data tren booking per hari
        $bookingTrend = $bookings->groupBy(function($booking) {
                return Carbon::parse($booking->created_at)->format('Y-m-d');
            })
            ->map(function($items, $date) {
                return [
                    'date' => $date,
                    'count' => $items->count(),
                    'amount' => $items->sum('total_amount')
                ];
            })
            ->values();

        if ($request->has('export') && $request->export === 'csv') {
            // Ekspor ke CSV dengan tambahan informasi
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="booking_report_' . $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d') . '.csv"',
            ];

            $callback = function () use ($bookings, $startDate, $endDate, $totalBookings, $totalPassengers, $totalVehicles, $totalRevenue) {
                $file = fopen('php://output', 'w');

                // Tambahkan informasi laporan
                fputcsv($file, ['Laporan Booking']);
                fputcsv($file, ['Periode: ' . $startDate->format('d F Y') . ' - ' . $endDate->format('Y-m-d')]);
                fputcsv($file, ['Total Booking: ' . $totalBookings]);
                fputcsv($file, ['Total Penumpang: ' . $totalPassengers]);
                fputcsv($file, ['Total Kendaraan: ' . $totalVehicles]);
                fputcsv($file, ['Total Pendapatan: Rp ' . number_format($totalRevenue, 0, ',', '.')]);
                fputcsv($file, []); // Baris kosong
                fputcsv($file, []); // Baris kosong

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
                    'Metode Pembayaran',
                    'Dibuat Pada',
                    'Diperbarui Pada',
                ]);

                // Data rows
                foreach ($bookings as $booking) {
                    $paymentMethod = $booking->payments->first() ? $booking->payments->first()->payment_method : 'N/A';

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
                        $paymentMethod,
                        $booking->created_at->format('Y-m-d H:i:s'),
                        $booking->updated_at->format('Y-m-d H:i:s'),
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
            'actualRevenue',
            'statusCount',
            'bookingTrend'
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

        $timezone = config('app.timezone', 'Asia/Jakarta');
        $startDate = Carbon::parse($request->start_date, $timezone)->startOfDay();
        $endDate = Carbon::parse($request->end_date, $timezone)->endOfDay();

        // Gunakan eager loading dan indexing untuk meningkatkan performa
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

        // Gunakan format yang sesuai berdasarkan pengelompokan
        $formatStr = match ($request->group_by) {
            'daily' => '%Y-%m-%d',
            'weekly' => '%x-W%v',
            'monthly' => '%Y-%m',
        };

        $labelFormat = match ($request->group_by) {
            'daily' => 'd M Y',
            'weekly' => '\M\i\n\g\g\u W Y',
            'monthly' => 'F Y',
        };

        $revenues = $query
            ->select(
                DB::raw("DATE_FORMAT(payment_date, '$formatStr') as period"),
                DB::raw('SUM(amount) as total_amount'),
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('MIN(payment_date) as start_date'), // Untuk label yang lebih baik
                DB::raw('MAX(payment_date) as end_date')    // Untuk label yang lebih baik
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        // Tambahkan format label yang lebih baik
        foreach ($revenues as $revenue) {
            if ($request->group_by === 'daily') {
                $revenue->formatted_period = Carbon::parse($revenue->period)->format($labelFormat);
            } elseif ($request->group_by === 'weekly') {
                $startOfWeek = Carbon::parse($revenue->start_date)->startOfWeek()->format('d M');
                $endOfWeek = Carbon::parse($revenue->end_date)->endOfWeek()->format('d M Y');
                $revenue->formatted_period = $startOfWeek . ' - ' . $endOfWeek;
            } elseif ($request->group_by === 'monthly') {
                $revenue->formatted_period = Carbon::createFromFormat('Y-m', $revenue->period)->format($labelFormat);
            }

            // Tambahkan rata-rata per transaksi
            $revenue->average_amount = $revenue->transaction_count > 0 ? $revenue->total_amount / $revenue->transaction_count : 0;
        }

        $totalRevenue = $revenues->sum('total_amount');
        $totalTransactions = $revenues->sum('transaction_count');

        // Tambahkan statistik tambahan
        $averageTransaction = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

        // Tambahkan perbandingan dengan periode sebelumnya
        $previousStartDate = (clone $startDate)->subDays($endDate->diffInDays($startDate) + 1);
        $previousEndDate = (clone $startDate)->subDay();

        $previousRevenue = Payment::whereHas('booking', function ($q) {
                $q->whereIn('status', ['CONFIRMED', 'COMPLETED']);
            })
            ->where('status', 'SUCCESS')
            ->whereBetween('payment_date', [$previousStartDate, $previousEndDate])
            ->sum('amount');

        $revenueGrowth = $previousRevenue > 0 ? (($totalRevenue - $previousRevenue) / $previousRevenue) * 100 : 0;

        if ($request->has('export') && $request->export === 'csv') {
            // Ekspor ke CSV dengan tambahan informasi
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="revenue_report_' . $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d') . '.csv"',
            ];

            $callback = function () use ($revenues, $request, $startDate, $endDate, $totalRevenue, $totalTransactions, $averageTransaction, $revenueGrowth) {
                $file = fopen('php://output', 'w');

                // Tambahkan informasi laporan
                fputcsv($file, ['Laporan Pendapatan']);
                fputcsv($file, ['Periode: ' . $startDate->format('d F Y') . ' - ' . $endDate->format('d F Y')]);
                fputcsv($file, ['Pengelompokan: ' . ($request->group_by == 'daily' ? 'Harian' : ($request->group_by == 'weekly' ? 'Mingguan' : 'Bulanan'))]);
                fputcsv($file, ['Total Pendapatan: Rp ' . number_format($totalRevenue, 0, ',', '.')]);
                fputcsv($file, ['Total Transaksi: ' . $totalTransactions]);
                fputcsv($file, ['Rata-rata per Transaksi: Rp ' . number_format($averageTransaction, 0, ',', '.')]);
                fputcsv($file, ['Pertumbuhan dari Periode Sebelumnya: ' . number_format($revenueGrowth, 2) . '%']);
                fputcsv($file, []); // Baris kosong

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
                    'Rata-rata per Transaksi',
                ]);

                // Data rows
                foreach ($revenues as $revenue) {
                    fputcsv($file, [
                        $revenue->formatted_period,
                        $revenue->transaction_count,
                        $revenue->total_amount,
                        $revenue->average_amount,
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
            'averageTransaction',
            'revenueGrowth',
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

        $timezone = config('app.timezone', 'Asia/Jakarta');
        $startDate = Carbon::parse($request->start_date, $timezone);
        $endDate = Carbon::parse($request->end_date, $timezone);

        $query = ScheduleDate::with(['schedule.route', 'schedule.ferry'])
            ->whereBetween('date', [$startDate, $endDate]);

        if ($request->has('route_id') && $request->route_id) {
            $query->whereHas('schedule', function ($q) use ($request) {
                $q->where('route_id', $request->route_id);
            });
        }

        $scheduleDates = $query->orderBy('date')->get();

        // Group by schedule dengan perhitungan detail
        $scheduleStats = $scheduleDates->groupBy('schedule_id')
            ->map(function ($items, $scheduleId) {
                $schedule = $items->first()->schedule;
                $ferry = $schedule->ferry;

                // Hitung kapasitas maksimum untuk periode ini
                $totalDates = $items->count();
                $maxPassengerCapacity = $ferry->capacity_passenger * $totalDates;
                $maxMotorcycleCapacity = $ferry->capacity_vehicle_motorcycle * $totalDates;
                $maxCarCapacity = $ferry->capacity_vehicle_car * $totalDates;
                $maxBusCapacity = $ferry->capacity_vehicle_bus * $totalDates;
                $maxTruckCapacity = $ferry->capacity_vehicle_truck * $totalDates;

                // Hitung total penumpang dan kendaraan
                $totalPassenger = $items->sum('passenger_count');
                $totalMotorcycle = $items->sum('motorcycle_count');
                $totalCar = $items->sum('car_count');
                $totalBus = $items->sum('bus_count');
                $totalTruck = $items->sum('truck_count');
                $totalVehicle = $totalMotorcycle + $totalCar + $totalBus + $totalTruck;

                // Hitung persentase okupansi yang lebih akurat
                $passengerOccupancyRate = $maxPassengerCapacity > 0 ? ($totalPassenger / $maxPassengerCapacity) * 100 : 0;
                $motorcycleOccupancyRate = $maxMotorcycleCapacity > 0 ? ($totalMotorcycle / $maxMotorcycleCapacity) * 100 : 0;
                $carOccupancyRate = $maxCarCapacity > 0 ? ($totalCar / $maxCarCapacity) * 100 : 0;
                $busOccupancyRate = $maxBusCapacity > 0 ? ($totalBus / $maxBusCapacity) * 100 : 0;
                $truckOccupancyRate = $maxTruckCapacity > 0 ? ($totalTruck / $maxTruckCapacity) * 100 : 0;

                // Tambahkan tren okupansi harian
                $dailyOccupancy = $items->groupBy(function ($item) {
                    return Carbon::parse($item->date)->format('Y-m-d');
                })->map(function ($dayItems) {
                    $date = Carbon::parse($dayItems->first()->date)->format('Y-m-d');
                    $passengerCapacity = $dayItems->first()->schedule->ferry->capacity_passenger;
                    $occupancyRate = $passengerCapacity > 0 ? ($dayItems->sum('passenger_count') / $passengerCapacity) * 100 : 0;

                    return [
                        'date' => $date,
                        'occupancy_rate' => $occupancyRate,
                        'passenger_count' => $dayItems->sum('passenger_count'),
                    ];
                })->values();

                return [
                    'schedule_id' => $scheduleId,
                    'route' => $schedule->route->origin . ' - ' . $schedule->route->destination,
                    'ferry' => $ferry->name,
                    'time' => $schedule->departure_time . ' - ' . $schedule->arrival_time,
                    'days' => $schedule->days,
                    'dates_count' => $totalDates,
                    'passenger_count' => $totalPassenger,
                    'vehicle_count' => $totalVehicle,
                    'motorcycle_count' => $totalMotorcycle,
                    'car_count' => $totalCar,
                    'bus_count' => $totalBus,
                    'truck_count' => $totalTruck,
                    'max_passenger_capacity' => $maxPassengerCapacity,
                    'passenger_occupancy_rate' => $passengerOccupancyRate,
                    'motorcycle_occupancy_rate' => $motorcycleOccupancyRate,
                    'car_occupancy_rate' => $carOccupancyRate,
                    'bus_occupancy_rate' => $busOccupancyRate,
                    'truck_occupancy_rate' => $truckOccupancyRate,
                    'daily_occupancy' => $dailyOccupancy,
                ];
            })
            ->values();

        // Hitung statistik keseluruhan
        $totalPassengerCapacity = $scheduleStats->sum('max_passenger_capacity');
        $totalPassengers = $scheduleStats->sum('passenger_count');
        $overallOccupancyRate = $totalPassengerCapacity > 0 ? ($totalPassengers / $totalPassengerCapacity) * 100 : 0;

        // Hitung distribusi kendaraan
        $totalMotorcycles = $scheduleStats->sum('motorcycle_count');
        $totalCars = $scheduleStats->sum('car_count');
        $totalBuses = $scheduleStats->sum('bus_count');
        $totalTrucks = $scheduleStats->sum('truck_count');
        $totalVehicles = $totalMotorcycles + $totalCars + $totalBuses + $totalTrucks;

        // Persentase distribusi jenis kendaraan
        $motorcyclePercentage = $totalVehicles > 0 ? ($totalMotorcycles / $totalVehicles) * 100 : 0;
        $carPercentage = $totalVehicles > 0 ? ($totalCars / $totalVehicles) * 100 : 0;
        $busPercentage = $totalVehicles > 0 ? ($totalBuses / $totalVehicles) * 100 : 0;
        $truckPercentage = $totalVehicles > 0 ? ($totalTrucks / $totalVehicles) * 100 : 0;

        if ($request->has('export') && $request->export === 'csv') {
            // Ekspor ke CSV dengan tambahan informasi
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="schedule_report_' . $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d') . '.csv"',
            ];

            $callback = function () use ($scheduleStats, $startDate, $endDate, $overallOccupancyRate, $totalPassengers, $totalVehicles) {
                $file = fopen('php://output', 'w');

                // Tambahkan informasi laporan
                fputcsv($file, ['Laporan Jadwal']);
                fputcsv($file, ['Periode: ' . $startDate->format('d F Y') . ' - ' . $endDate->format('d F Y')]);
                fputcsv($file, ['Tingkat Okupansi Keseluruhan: ' . number_format($overallOccupancyRate, 2) . '%']);
                fputcsv($file, ['Total Penumpang: ' . $totalPassengers]);
                fputcsv($file, ['Total Kendaraan: ' . $totalVehicles]);
                fputcsv($file, []); // Baris kosong

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
                    'Kapasitas Penumpang Max',
                    'Okupansi Penumpang (%)',
                    'Okupansi Motor (%)',
                    'Okupansi Mobil (%)',
                    'Okupansi Bus (%)',
                    'Okupansi Truk (%)',
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
                        $stat['max_passenger_capacity'],
                        number_format($stat['passenger_occupancy_rate'], 2),
                        number_format($stat['motorcycle_occupancy_rate'], 2),
                        number_format($stat['car_occupancy_rate'], 2),
                        number_format($stat['bus_occupancy_rate'], 2),
                        number_format($stat['truck_occupancy_rate'], 2),
                    ]);
                }

                fclose($file);
            };

            return Response::stream($callback, 200, $headers);
        }

        return view('admin.reports.schedule', compact(
            'scheduleStats',
            'startDate',
            'endDate',
            'overallOccupancyRate',
            'totalPassengers',
            'totalVehicles',
            'motorcyclePercentage',
            'carPercentage',
            'busPercentage',
            'truckPercentage'
        ));
    }
}
