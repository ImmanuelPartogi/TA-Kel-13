<?php

namespace App\Http\Controllers\Api\Admin;

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
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ReportController extends Controller
{
    /**
     * Mendapatkan data dashboard
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $routes = Route::where('status', 'ACTIVE')
                ->select('id', 'origin', 'destination', 'status')
                ->get();

            // Gunakan cache untuk data statistik yang sering diakses
            $stats = Cache::remember('dashboard_quick_stats', 300, function () {
                return $this->getQuickStats();
            });

            // Gunakan cache untuk data rute populer yang sering diakses
            $popularRoutes = Cache::remember('dashboard_popular_routes', 600, function () {
                return $this->getPopularRoutes();
            });

            return response()->json([
                'success' => true,
                'message' => 'Data dashboard berhasil diambil',
                'data' => [
                    'routes' => $routes,
                    'stats' => $stats,
                    'popularRoutes' => $popularRoutes
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dashboard: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan statistik cepat untuk dashboard
     *
     * @return array
     */
    private function getQuickStats(): array
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

    /**
     * Mendapatkan rute populer
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
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

    /**
     * Mendapatkan laporan booking
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function bookingReport(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'route_id' => 'nullable|exists:routes,id',
                'status' => 'nullable|in:PENDING,CONFIRMED,CANCELLED,COMPLETED,REFUNDED,RESCHEDULED',
                'sort_field' => 'nullable|in:booking_code,created_at,departure_date,total_amount,status',
                'sort_order' => 'nullable|in:asc,desc',
                'export' => 'nullable|in:csv,json',
            ]);

            $timezone = config('app.timezone', 'Asia/Jakarta');
            $startDate = Carbon::parse($validated['start_date'], $timezone)->startOfDay();
            $endDate = Carbon::parse($validated['end_date'], $timezone)->endOfDay();

            // Gunakan eager loading untuk meningkatkan performa
            $query = Booking::with([
                'user:id,name,email',
                'schedule.route',
                'schedule.ferry',
                'payments' => function ($q) {
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

            // Hitung statistik
            $totalBookings = $bookings->count();
            $totalPassengers = $bookings->sum('passenger_count');
            $totalVehicles = $bookings->sum('vehicle_count');
            $totalRevenue = $bookings->whereIn('status', ['CONFIRMED', 'COMPLETED'])->sum('total_amount');

            // Tambahkan statistik payment actual dari relasi payments
            $actualRevenue = $bookings->sum(function ($booking) {
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
            $bookingTrend = $bookings->groupBy(function ($booking) {
                return Carbon::parse($booking->created_at)->format('Y-m-d');
            })
                ->map(function ($items, $date) {
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
                    fputcsv($file, ['Periode: ' . $startDate->format('d F Y') . ' - ' . $endDate->format('d F Y')]);
                    fputcsv($file, ['Total Booking: ' . $totalBookings]);
                    fputcsv($file, ['Total Penumpang: ' . $totalPassengers]);
                    fputcsv($file, ['Total Kendaraan: ' . $totalVehicles]);
                    fputcsv($file, ['Total Pendapatan: Rp ' . number_format($totalRevenue, 0, ',', '.')]);
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
                            $booking->departure_date,
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

                return response()->json([
                    'success' => true,
                    'message' => 'Laporan berhasil diekspor',
                    'download_url' => route('download.report', ['type' => 'csv']) // Replace with your actual route
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Laporan booking berhasil diambil',
                'data' => [
                    'bookings' => $bookings,
                    'startDate' => $startDate->format('Y-m-d'),
                    'endDate' => $endDate->format('Y-m-d'),
                    'totalBookings' => $totalBookings,
                    'totalPassengers' => $totalPassengers,
                    'totalVehicles' => $totalVehicles,
                    'totalRevenue' => $totalRevenue,
                    'actualRevenue' => $actualRevenue,
                    'statusCount' => $statusCount,
                    'bookingTrend' => $bookingTrend
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil laporan booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan laporan pendapatan
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function revenueReport(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'route_id' => 'nullable|exists:routes,id',
                'group_by' => 'required|in:daily,weekly,monthly',
                'export' => 'nullable|in:csv,json',
            ]);

            $timezone = config('app.timezone', 'Asia/Jakarta');
            $startDate = Carbon::parse($validated['start_date'], $timezone)->startOfDay();
            $endDate = Carbon::parse($validated['end_date'], $timezone)->endOfDay();

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
            $formatStr = match ($validated['group_by']) {
                'daily' => '%Y-%m-%d',
                'weekly' => '%x-W%v',
                'monthly' => '%Y-%m',
            };

            $labelFormat = match ($validated['group_by']) {
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
                if ($validated['group_by'] === 'daily') {
                    $revenue->formatted_period = Carbon::parse($revenue->period)->format($labelFormat);
                } elseif ($validated['group_by'] === 'weekly') {
                    $startOfWeek = Carbon::parse($revenue->start_date)->startOfWeek()->format('d M');
                    $endOfWeek = Carbon::parse($revenue->end_date)->endOfWeek()->format('d M Y');
                    $revenue->formatted_period = $startOfWeek . ' - ' . $endOfWeek;
                } elseif ($validated['group_by'] === 'monthly') {
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

                return response()->json([
                    'success' => true,
                    'message' => 'Laporan berhasil diekspor',
                    'download_url' => route('download.report', ['type' => 'csv']) // Replace with your actual route
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Laporan pendapatan berhasil diambil',
                'data' => [
                    'revenues' => $revenues,
                    'startDate' => $startDate->format('Y-m-d'),
                    'endDate' => $endDate->format('Y-m-d'),
                    'totalRevenue' => $totalRevenue,
                    'totalTransactions' => $totalTransactions,
                    'averageTransaction' => $averageTransaction,
                    'revenueGrowth' => $revenueGrowth,
                    'group_by' => $validated['group_by']
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil laporan pendapatan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan laporan jadwal
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function scheduleReport(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'route_id' => 'nullable|exists:routes,id',
                'export' => 'nullable|in:csv,json',
            ]);

            $timezone = config('app.timezone', 'Asia/Jakarta');
            $startDate = Carbon::parse($validated['start_date'], $timezone);
            $endDate = Carbon::parse($validated['end_date'], $timezone);

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

                return response()->json([
                    'success' => true,
                    'message' => 'Laporan berhasil diekspor',
                    'download_url' => route('download.report', ['type' => 'csv']) // Replace with your actual route
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Laporan jadwal berhasil diambil',
                'data' => [
                    'scheduleStats' => $scheduleStats,
                    'startDate' => $startDate->format('Y-m-d'),
                    'endDate' => $endDate->format('Y-m-d'),
                    'overallOccupancyRate' => $overallOccupancyRate,
                    'totalPassengers' => $totalPassengers,
                    'totalVehicles' => $totalVehicles,
                    'vehicleDistribution' => [
                        'motorcycle' => [
                            'count' => $totalMotorcycles,
                            'percentage' => $motorcyclePercentage
                        ],
                        'car' => [
                            'count' => $totalCars,
                            'percentage' => $carPercentage
                        ],
                        'bus' => [
                            'count' => $totalBuses,
                            'percentage' => $busPercentage
                        ],
                        'truck' => [
                            'count' => $totalTrucks,
                            'percentage' => $truckPercentage
                        ]
                    ]
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil laporan jadwal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ekspor laporan booking dalam format JSON
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function exportBookingReport(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'route_id' => 'nullable|exists:routes,id',
                'status' => 'nullable|in:PENDING,CONFIRMED,CANCELLED,COMPLETED,REFUNDED,RESCHEDULED',
                'sort_field' => 'nullable|in:booking_code,created_at,departure_date,total_amount,status',
                'sort_order' => 'nullable|in:asc,desc',
            ]);

            $timezone = config('app.timezone', 'Asia/Jakarta');
            $startDate = Carbon::parse($validated['start_date'], $timezone)->startOfDay();
            $endDate = Carbon::parse($validated['end_date'], $timezone)->endOfDay();

            $query = Booking::with([
                'user:id,name,email',
                'schedule.route',
                'schedule.ferry',
                'payments' => function ($q) {
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

            $sortField = $request->input('sort_field', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');

            $allowedSortFields = ['booking_code', 'created_at', 'departure_date', 'total_amount', 'status'];
            if (!in_array($sortField, $allowedSortFields)) {
                $sortField = 'created_at';
            }

            $query->orderBy($sortField, $sortOrder);
            $bookings = $query->get();

            // Mengubah format data untuk diunduh
            $exportData = $bookings->map(function ($booking) {
                return [
                    'booking_code' => $booking->booking_code,
                    'created_at' => $booking->created_at->format('Y-m-d H:i:s'),
                    'user_name' => $booking->user->name,
                    'route' => $booking->schedule->route->origin . ' - ' . $booking->schedule->route->destination,
                    'schedule' => $booking->schedule->departure_time . ' - ' . $booking->schedule->arrival_time,
                    'departure_date' => $booking->departure_date,
                    'passenger_count' => $booking->passenger_count,
                    'vehicle_count' => $booking->vehicle_count,
                    'total_amount' => $booking->total_amount,
                    'status' => $booking->status,
                    'payment_method' => $booking->payments->first() ? $booking->payments->first()->payment_method : 'N/A',
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Data ekspor laporan booking berhasil diambil',
                'data' => $exportData,
                'meta' => [
                    'report_name' => 'Booking Report',
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'total_bookings' => $bookings->count(),
                    'total_passengers' => $bookings->sum('passenger_count'),
                    'total_vehicles' => $bookings->sum('vehicle_count'),
                    'total_revenue' => $bookings->whereIn('status', ['CONFIRMED', 'COMPLETED'])->sum('total_amount')
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengekspor laporan booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ekspor laporan pendapatan dalam format JSON
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function exportRevenueReport(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'route_id' => 'nullable|exists:routes,id',
                'group_by' => 'required|in:daily,weekly,monthly',
            ]);

            $timezone = config('app.timezone', 'Asia/Jakarta');
            $startDate = Carbon::parse($validated['start_date'], $timezone)->startOfDay();
            $endDate = Carbon::parse($validated['end_date'], $timezone)->endOfDay();

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

            $formatStr = match ($validated['group_by']) {
                'daily' => '%Y-%m-%d',
                'weekly' => '%x-W%v',
                'monthly' => '%Y-%m',
            };

            $labelFormat = match ($validated['group_by']) {
                'daily' => 'd M Y',
                'weekly' => '\M\i\n\g\g\u W Y',
                'monthly' => 'F Y',
            };

            $revenues = $query
                ->select(
                    DB::raw("DATE_FORMAT(payment_date, '$formatStr') as period"),
                    DB::raw('SUM(amount) as total_amount'),
                    DB::raw('COUNT(*) as transaction_count'),
                    DB::raw('MIN(payment_date) as start_date'),
                    DB::raw('MAX(payment_date) as end_date')
                )
                ->groupBy('period')
                ->orderBy('period')
                ->get();

            foreach ($revenues as $revenue) {
                if ($validated['group_by'] === 'daily') {
                    $revenue->formatted_period = Carbon::parse($revenue->period)->format($labelFormat);
                } elseif ($validated['group_by'] === 'weekly') {
                    $startOfWeek = Carbon::parse($revenue->start_date)->startOfWeek()->format('d M');
                    $endOfWeek = Carbon::parse($revenue->end_date)->endOfWeek()->format('d M Y');
                    $revenue->formatted_period = $startOfWeek . ' - ' . $endOfWeek;
                } elseif ($validated['group_by'] === 'monthly') {
                    $revenue->formatted_period = Carbon::createFromFormat('Y-m', $revenue->period)->format($labelFormat);
                }

                $revenue->average_amount = $revenue->transaction_count > 0 ? $revenue->total_amount / $revenue->transaction_count : 0;
            }

            $totalRevenue = $revenues->sum('total_amount');
            $totalTransactions = $revenues->sum('transaction_count');
            $averageTransaction = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

            // Format data untuk export
            $exportData = $revenues->map(function ($revenue) {
                return [
                    'period' => $revenue->formatted_period,
                    'transaction_count' => $revenue->transaction_count,
                    'total_amount' => $revenue->total_amount,
                    'average_amount' => $revenue->average_amount,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Data ekspor laporan pendapatan berhasil diambil',
                'data' => $exportData,
                'meta' => [
                    'report_name' => 'Revenue Report',
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'group_by' => $validated['group_by'],
                    'total_revenue' => $totalRevenue,
                    'total_transactions' => $totalTransactions,
                    'average_transaction' => $averageTransaction
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengekspor laporan pendapatan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ekspor laporan jadwal dalam format JSON
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function exportScheduleReport(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'route_id' => 'nullable|exists:routes,id',
            ]);

            $timezone = config('app.timezone', 'Asia/Jakarta');
            $startDate = Carbon::parse($validated['start_date'], $timezone);
            $endDate = Carbon::parse($validated['end_date'], $timezone);

            $query = ScheduleDate::with(['schedule.route', 'schedule.ferry'])
                ->whereBetween('date', [$startDate, $endDate]);

            if ($request->has('route_id') && $request->route_id) {
                $query->whereHas('schedule', function ($q) use ($request) {
                    $q->where('route_id', $request->route_id);
                });
            }

            $scheduleDates = $query->orderBy('date')->get();

            // Dapatkan statistik jadwal
            $scheduleStats = $scheduleDates->groupBy('schedule_id')
                ->map(function ($items, $scheduleId) {
                    // Gunakan logika yang sama dengan scheduleReport
                    $schedule = $items->first()->schedule;
                    $ferry = $schedule->ferry;

                    $totalDates = $items->count();
                    $maxPassengerCapacity = $ferry->capacity_passenger * $totalDates;
                    $maxMotorcycleCapacity = $ferry->capacity_vehicle_motorcycle * $totalDates;
                    $maxCarCapacity = $ferry->capacity_vehicle_car * $totalDates;
                    $maxBusCapacity = $ferry->capacity_vehicle_bus * $totalDates;
                    $maxTruckCapacity = $ferry->capacity_vehicle_truck * $totalDates;

                    $totalPassenger = $items->sum('passenger_count');
                    $totalMotorcycle = $items->sum('motorcycle_count');
                    $totalCar = $items->sum('car_count');
                    $totalBus = $items->sum('bus_count');
                    $totalTruck = $items->sum('truck_count');
                    $totalVehicle = $totalMotorcycle + $totalCar + $totalBus + $totalTruck;

                    $passengerOccupancyRate = $maxPassengerCapacity > 0 ? ($totalPassenger / $maxPassengerCapacity) * 100 : 0;
                    $motorcycleOccupancyRate = $maxMotorcycleCapacity > 0 ? ($totalMotorcycle / $maxMotorcycleCapacity) * 100 : 0;
                    $carOccupancyRate = $maxCarCapacity > 0 ? ($totalCar / $maxCarCapacity) * 100 : 0;
                    $busOccupancyRate = $maxBusCapacity > 0 ? ($totalBus / $maxBusCapacity) * 100 : 0;
                    $truckOccupancyRate = $maxTruckCapacity > 0 ? ($totalTruck / $maxTruckCapacity) * 100 : 0;

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
                    ];
                })
                ->values();

            $totalPassengerCapacity = $scheduleStats->sum('max_passenger_capacity');
            $totalPassengers = $scheduleStats->sum('passenger_count');
            $overallOccupancyRate = $totalPassengerCapacity > 0 ? ($totalPassengers / $totalPassengerCapacity) * 100 : 0;
            $totalVehicles = $scheduleStats->sum('vehicle_count');

            return response()->json([
                'success' => true,
                'message' => 'Data ekspor laporan jadwal berhasil diambil',
                'data' => $scheduleStats,
                'meta' => [
                    'report_name' => 'Schedule Report',
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'overall_occupancy_rate' => $overallOccupancyRate,
                    'total_passengers' => $totalPassengers,
                    'total_vehicles' => $totalVehicles
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengekspor laporan jadwal: ' . $e->getMessage()
            ], 500);
        }
    }
}
