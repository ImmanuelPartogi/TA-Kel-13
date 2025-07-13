<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingLog;
use App\Models\Payment;
use App\Models\Route;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    /**
     * Mengambil daftar booking dengan filter
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Booking::with(['user:id,name,email', 'schedule.route', 'schedule.ferry']);

            // Filter berdasarkan kode booking
            if ($request->has('booking_code') && $request->booking_code) {
                $query->where('booking_code', 'like', '%' . $request->booking_code . '%');
            }

            // Filter berdasarkan nama pengguna
            if ($request->has('user_name') && $request->user_name) {
                $query->whereHas('user', function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->user_name . '%');
                });
            }

            // Filter berdasarkan rute
            if ($request->has('route_id') && $request->route_id) {
                $query->whereHas('schedule', function ($q) use ($request) {
                    $q->where('route_id', $request->route_id);
                });
            }

            // Filter berdasarkan status booking
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Filter berdasarkan tanggal booking
            if ($request->has('departure_date_from') && $request->departure_date_from) {
                $query->where('departure_date', '>=', $request->departure_date_from);
            }

            if ($request->has('departure_date_to') && $request->departure_date_to) {
                $query->where('departure_date', '<=', $request->departure_date_to);
            }

            // Pagination dengan perpage yang dinamis
            $perPage = $request->input('per_page', 10);
            $bookings = $query->orderBy('created_at', 'desc')->paginate($perPage);

            $routes = Route::where('status', 'ACTIVE')->select('id', 'origin', 'destination', 'status')->get();

            return response()->json([
                'success' => true,
                'message' => 'Data booking berhasil diambil',
                'data' => [
                    'bookings' => $bookings,
                    'routes' => $routes
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menampilkan form create booking
     *
     * @return JsonResponse
     */
    public function create(): JsonResponse
    {
        try {
            // Ambil data untuk dropdown routes
            $routes = Route::where('status', 'ACTIVE')
                ->select('id', 'origin', 'destination', 'route_code', 'base_price')
                ->get();

            // Ambil data vehicle categories
            $vehicleCategories = VehicleCategory::where('is_active', true)
                ->select('id', 'code', 'name', 'vehicle_type', 'base_price')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Data untuk form booking berhasil diambil',
                'data' => [
                    'routes' => $routes,
                    'vehicle_categories' => $vehicleCategories
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data untuk form booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mencari jadwal berdasarkan rute dan tanggal
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getSchedulesForBooking(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'route_id' => 'required|exists:routes,id',
                'date' => 'required|date|after_or_equal:today',
                'passenger_count' => 'required|integer|min:1',
                'vehicle_categories' => 'nullable|json'
            ]);

            $routeId = $validated['route_id'];
            $date = Carbon::parse($validated['date']);
            $dayOfWeek = $date->dayOfWeek + 1; // Konversi ke format 1-7 (Senin-Minggu)
            $passengerCount = $validated['passenger_count'];

            // Parse vehicle_categories jika ada
            $vehicleCategories = [];
            if (isset($validated['vehicle_categories'])) {
                $vehicleCategories = json_decode($validated['vehicle_categories'], true);
            }

            // Ambil jadwal untuk rute dan hari yang dipilih
            $schedules = Schedule::where('route_id', $routeId)
                ->where('status', 'ACTIVE')
                ->whereRaw("FIND_IN_SET(?, days)", [$dayOfWeek])
                ->with(['ferry', 'route'])
                ->get();

            if ($schedules->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada jadwal tersedia untuk rute dan tanggal yang dipilih'
                ], 404);
            }

            // Tambahkan log untuk debugging
            Log::info('Jadwal ditemukan untuk rute dan hari', [
                'route_id' => $routeId,
                'day' => $dayOfWeek,
                'date' => $date->format('Y-m-d'),
                'jadwal_count' => $schedules->count()
            ]);

            // Ambil data tanggal jadwal
            $scheduleIds = $schedules->pluck('id')->toArray();
            $scheduleDates = ScheduleDate::whereIn('schedule_id', $scheduleIds)
                ->where('date', $date->format('Y-m-d'))
                ->where('status', 'ACTIVE')
                ->get()
                ->keyBy('schedule_id');

            // Log untuk debugging
            Log::info('Schedule dates ditemukan', [
                'schedule_dates_count' => $scheduleDates->count()
            ]);

            // Hitung ketersediaan dan total harga untuk setiap jadwal
            $availableSchedules = [];
            foreach ($schedules as $schedule) {
                $scheduleDate = $scheduleDates->get($schedule->id);

                // Jika tidak ada data tanggal, jadwal tidak tersedia
                if (!$scheduleDate) {
                    continue;
                }

                // Cek ketersediaan kapasitas penumpang
                $availablePassenger = $schedule->ferry->capacity_passenger - $scheduleDate->passenger_count;
                if ($availablePassenger < $passengerCount) {
                    continue;
                }

                // Cek ketersediaan kapasitas kendaraan
                $isVehicleAvailable = true;
                $vehicleTotalPrice = 0;

                foreach ($vehicleCategories as $vehicleCategory) {
                    $category = VehicleCategory::find($vehicleCategory['id']);
                    if (!$category) continue;

                    $count = $vehicleCategory['count'];

                    switch ($category->vehicle_type) {
                        case 'MOTORCYCLE':
                            $available = $schedule->ferry->capacity_vehicle_motorcycle - $scheduleDate->motorcycle_count;
                            if ($available < $count) {
                                $isVehicleAvailable = false;
                            }
                            break;
                        case 'CAR':
                            $available = $schedule->ferry->capacity_vehicle_car - $scheduleDate->car_count;
                            if ($available < $count) {
                                $isVehicleAvailable = false;
                            }
                            break;
                        case 'BUS':
                            $available = $schedule->ferry->capacity_vehicle_bus - $scheduleDate->bus_count;
                            if ($available < $count) {
                                $isVehicleAvailable = false;
                            }
                            break;
                        case 'TRUCK':
                        case 'PICKUP':
                        case 'TRONTON':
                            $available = $schedule->ferry->capacity_vehicle_truck - $scheduleDate->truck_count;
                            if ($available < $count) {
                                $isVehicleAvailable = false;
                            }
                            break;
                    }

                    $vehicleTotalPrice += $category->base_price * $count;
                }

                // Jika kendaraan tidak tersedia, lewati jadwal ini
                if (!$isVehicleAvailable) {
                    continue;
                }

                // Hitung total harga
                $basePrice = $schedule->route->base_price;
                $totalPrice = ($basePrice * $passengerCount) + $vehicleTotalPrice;

                // Tambahkan jadwal ke daftar tersedia
                $availableSchedules[] = [
                    'id' => $schedule->id,
                    'route' => [
                        'id' => $schedule->route->id,
                        'origin' => $schedule->route->origin,
                        'destination' => $schedule->route->destination
                    ],
                    'ferry' => [
                        'id' => $schedule->ferry->id,
                        'name' => $schedule->ferry->name
                    ],
                    'departure_time' => $schedule->departure_time,
                    'arrival_time' => $schedule->arrival_time,
                    'available_passenger' => $availablePassenger,
                    'schedule_date_id' => $scheduleDate->id,
                    'passenger_price' => $basePrice,
                    'vehicle_price' => $vehicleTotalPrice,
                    'total_price' => $totalPrice
                ];
            }

            // Log hasil akhir
            Log::info('Jadwal tersedia yang ditemukan', [
                'available_schedules_count' => count($availableSchedules)
            ]);

            if (empty($availableSchedules)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada jadwal tersedia dengan kapasitas yang cukup untuk tanggal yang dipilih'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Jadwal tersedia berhasil diambil',
                'data' => $availableSchedules
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error dalam getSchedulesForBooking', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil jadwal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mencari pengguna berdasarkan nama atau email
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchUsers(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'search' => 'required|string|min:3',
            ]);

            $search = $validated['search'];
            $users = User::where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->select('id', 'name', 'email', 'phone')
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil ditemukan',
                'data' => $users
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
                'message' => 'Gagal mencari pengguna: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan booking baru yang dibuat oleh admin
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'user_id' => 'nullable|exists:users,id',
                'customer_name' => 'required_without:user_id|string|max:255',
                'customer_contact' => 'nullable|string|max:50',
                'schedule_id' => 'required|exists:schedules,id',
                'schedule_date_id' => 'required|exists:schedule_dates,id',
                'departure_date' => 'required|date|after_or_equal:today',
                'passenger_count' => 'required|integer|min:1',
                'vehicles' => 'nullable|array',
                'vehicles.*.type' => 'required|string|in:MOTORCYCLE,CAR,BUS,TRUCK,PICKUP,TRONTON',
                'vehicles.*.category_id' => 'required|exists:vehicle_categories,id',
                'vehicles.*.license_plate' => 'required|string|max:20',
                'vehicles.*.brand' => 'nullable|string|max:50',
                'vehicles.*.model' => 'nullable|string|max:50',
                'payment_method' => 'required|string|in:CASH,TRANSFER,DEBIT,CREDIT',
                'total_amount' => 'required|numeric|min:0',
            ]);

            // Cek ketersediaan jadwal
            $schedule = Schedule::findOrFail($validated['schedule_id']);
            $scheduleDate = ScheduleDate::findOrFail($validated['schedule_date_id']);

            if ($schedule->id != $scheduleDate->schedule_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Schedule date tidak sesuai dengan jadwal yang dipilih',
                    'errors' => ['schedule_date_id' => ['Schedule date tidak sesuai dengan jadwal']]
                ], 422);
            }

            if ($scheduleDate->status !== 'ACTIVE') {
                return response()->json([
                    'success' => false,
                    'message' => 'Jadwal untuk tanggal ini tidak aktif',
                    'errors' => ['departure_date' => ['Jadwal untuk tanggal ini tidak aktif']]
                ], 422);
            }

            // Cek kapasitas penumpang
            if (($scheduleDate->passenger_count + $validated['passenger_count']) > $schedule->ferry->capacity_passenger) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kapasitas penumpang tidak mencukupi',
                    'errors' => ['passenger_count' => ['Kapasitas penumpang tidak mencukupi']]
                ], 422);
            }

            // Cek kapasitas kendaraan
            $vehicleCounts = [
                'MOTORCYCLE' => 0,
                'CAR' => 0,
                'BUS' => 0,
                'TRUCK' => 0  // Termasuk PICKUP dan TRONTON
            ];

            foreach ($validated['vehicles'] ?? [] as $vehicle) {
                $type = $vehicle['type'];
                if (in_array($type, ['TRUCK', 'PICKUP', 'TRONTON'])) {
                    $vehicleCounts['TRUCK']++;
                } else {
                    $vehicleCounts[$type]++;
                }
            }

            if (($scheduleDate->motorcycle_count + $vehicleCounts['MOTORCYCLE']) > $schedule->ferry->capacity_vehicle_motorcycle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kapasitas motor tidak mencukupi',
                    'errors' => ['vehicles' => ['Kapasitas motor tidak mencukupi']]
                ], 422);
            }

            if (($scheduleDate->car_count + $vehicleCounts['CAR']) > $schedule->ferry->capacity_vehicle_car) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kapasitas mobil tidak mencukupi',
                    'errors' => ['vehicles' => ['Kapasitas mobil tidak mencukupi']]
                ], 422);
            }

            if (($scheduleDate->bus_count + $vehicleCounts['BUS']) > $schedule->ferry->capacity_vehicle_bus) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kapasitas bus tidak mencukupi',
                    'errors' => ['vehicles' => ['Kapasitas bus tidak mencukupi']]
                ], 422);
            }

            if (($scheduleDate->truck_count + $vehicleCounts['TRUCK']) > $schedule->ferry->capacity_vehicle_truck) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kapasitas truk tidak mencukupi',
                    'errors' => ['vehicles' => ['Kapasitas truk tidak mencukupi']]
                ], 422);
            }

            DB::beginTransaction();
            try {
                // Buat booking baru
                $booking = new Booking([
                    'booking_code' => 'FBS-' . strtoupper(Str::random(8)),
                    'user_id' => $validated['user_id'] ?? null, // NULL untuk pembelian loket
                    'schedule_id' => $validated['schedule_id'],
                    'departure_date' => $validated['departure_date'],
                    'passenger_count' => $validated['passenger_count'],
                    'vehicle_count' => count($validated['vehicles'] ?? []),
                    'total_amount' => $validated['total_amount'],
                    'status' => 'CONFIRMED', // Langsung konfirmasi karena admin yang membuat
                    'booked_by' => 'COUNTER', // Menandakan bahwa booking dilakukan di counter
                    'booking_channel' => 'ADMIN', // Menandakan bahwa booking dilakukan oleh admin
                    'notes' => isset($validated['user_id']) ? 'Booking dibuat oleh admin untuk pengguna terdaftar' : 'Booking dibuat oleh admin untuk pelanggan loket',
                ]);

                // Tambahkan catatan untuk penumpang offline jika tidak ada user_id
                if (!isset($validated['user_id']) && isset($validated['customer_name'])) {
                    $customerInfo = "Pembelian di loket oleh: " . $validated['customer_name'];
                    if (isset($validated['customer_contact']) && !empty($validated['customer_contact'])) {
                        $customerInfo .= " | Kontak: " . $validated['customer_contact'];
                    }
                    $booking->notes = $customerInfo;

                    // Log untuk pelanggan loket
                    Log::info('Booking dibuat untuk pelanggan loket', [
                        'customer_name' => $validated['customer_name'],
                        'customer_contact' => $validated['customer_contact'] ?? 'Tidak ada',
                        'admin_id' => Auth::id(),
                        'booking_code' => $booking->booking_code
                    ]);
                } else if (isset($validated['user_id'])) {
                    // Log untuk pengguna terdaftar
                    Log::info('Booking dibuat untuk pengguna terdaftar', [
                        'user_id' => $validated['user_id'],
                        'admin_id' => Auth::id(),
                        'booking_code' => $booking->booking_code
                    ]);
                }

                $booking->save();

                // Buat tiket berdasarkan jumlah penumpang
                $ticketCount = $validated['passenger_count'];
                for ($i = 0; $i < $ticketCount; $i++) {
                    // Tentukan nama penumpang berdasarkan informasi yang tersedia
                    $passengerName = '';
                    if (isset($validated['user_id'])) {
                        // Jika booking oleh pengguna terdaftar, gunakan nama pengguna
                        $user = User::find($validated['user_id']);
                        $passengerName = $user ? $user->name : 'Penumpang ' . ($i + 1);
                    } else if (isset($validated['customer_name'])) {
                        // Jika booking di loket, gunakan nama pelanggan
                        $passengerName = $validated['customer_name'];
                    } else {
                        // Fallback
                        $passengerName = 'Penumpang ' . ($i + 1);
                    }

                    $ticket = new Ticket([
                        'ticket_code' => 'TKT-' . strtoupper(Str::random(8)),
                        'booking_id' => $booking->id,
                        'qr_code' => 'QR-' . strtoupper(Str::random(12)),
                        'passenger_name' => $passengerName,
                        'passenger_id_type' => 'KTP', // Default
                        'boarding_status' => 'NOT_BOARDED',
                        'status' => 'ACTIVE',
                        'checked_in' => false,
                        'ticket_type' => 'STANDARD'
                    ]);

                    $ticket->save();
                }

                // Buat data kendaraan jika ada
                foreach ($validated['vehicles'] ?? [] as $vehicleData) {
                    $vehicle = new Vehicle([
                        'booking_id' => $booking->id,
                        'user_id' => $validated['user_id'] ?? null, // NULL untuk pembelian loket
                        'type' => $vehicleData['type'],
                        'vehicle_category_id' => $vehicleData['category_id'],
                        'license_plate' => $vehicleData['license_plate'],
                        'brand' => $vehicleData['brand'] ?? null,
                        'model' => $vehicleData['model'] ?? null
                    ]);

                    $vehicle->save();
                }

                // Buat pembayaran
                $payment = new Payment([
                    'booking_id' => $booking->id,
                    'amount' => $validated['total_amount'],
                    'payment_method' => $validated['payment_method'],
                    'payment_channel' => 'COUNTER',
                    'status' => 'SUCCESS', // Langsung success karena admin yang input
                    'payment_date' => now()
                ]);

                $payment->save();

                // Update kapasitas jadwal
                $scheduleDate->passenger_count += $validated['passenger_count'];
                $scheduleDate->motorcycle_count += $vehicleCounts['MOTORCYCLE'];
                $scheduleDate->car_count += $vehicleCounts['CAR'];
                $scheduleDate->bus_count += $vehicleCounts['BUS'];
                $scheduleDate->truck_count += $vehicleCounts['TRUCK'];
                $scheduleDate->save();

                // Buat log booking
                $bookingLog = new BookingLog([
                    'booking_id' => $booking->id,
                    'previous_status' => 'NEW',
                    'new_status' => 'CONFIRMED',
                    'changed_by_type' => 'ADMIN',
                    'changed_by_id' => Auth::id(),
                    'notes' => 'Booking dibuat oleh admin di counter',
                    'ip_address' => $request->ip()
                ]);

                $bookingLog->save();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Booking berhasil dibuat',
                    'data' => [
                        'booking' => $booking->fresh()->load(['user', 'schedule.route', 'schedule.ferry', 'tickets', 'vehicles', 'payments']),
                    ]
                ], 201);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error creating booking: ' . $e->getMessage());

                return response()->json([
                    'success' => false,
                    'message' => 'Gagal membuat booking: ' . $e->getMessage()
                ], 500);
            }
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in store booking: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menampilkan detail booking
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show($id): JsonResponse
    {
        try {
            $booking = Booking::with([
                'user:id,name,email,phone',
                'schedule.route',
                'schedule.ferry',
                'payments',
                'tickets',
                'vehicles',
                'bookingLogs' => function ($q) {
                    $q->orderBy('created_at', 'desc');
                },
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Detail booking berhasil diambil',
                'data' => $booking
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Memperbarui status booking
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            $booking = Booking::findOrFail($id);

            $validated = $request->validate([
                'status' => 'required|in:PENDING,CONFIRMED,CANCELLED,COMPLETED,REFUNDED,RESCHEDULED',
                'cancellation_reason' => 'required_if:status,CANCELLED',
                'notes' => 'nullable|string',
            ]);

            $previousStatus = $booking->status;

            // Validate status transition
            $allowedTransitions = [
                'PENDING' => ['CONFIRMED', 'CANCELLED'],
                'CONFIRMED' => ['COMPLETED', 'CANCELLED'],
                'CANCELLED' => ['REFUNDED'],
                'COMPLETED' => ['REFUNDED'],
            ];

            if (!isset($allowedTransitions[$booking->status]) || !in_array($validated['status'], $allowedTransitions[$booking->status])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Perubahan status tidak diizinkan',
                    'errors' => ['status' => ['Perubahan status tidak diizinkan']]
                ], 422);
            }

            try {
                DB::beginTransaction();

                $booking->status = $validated['status'];

                if ($validated['status'] === 'CANCELLED') {
                    $booking->cancellation_reason = $validated['cancellation_reason'];

                    // Update ticket status
                    Ticket::where('booking_id', $booking->id)
                        ->update(['status' => 'CANCELLED']);

                    // Free up space in schedule date
                    $scheduleDate = ScheduleDate::where('schedule_id', $booking->schedule_id)
                        ->where('date', $booking->departure_date)
                        ->first();

                    if ($scheduleDate) {
                        $scheduleDate->passenger_count -= $booking->passenger_count;

                        // Count vehicles by type
                        $vehicleCounts = [
                            'MOTORCYCLE' => 0,
                            'CAR' => 0,
                            'BUS' => 0,
                            'TRUCK' => 0
                        ];

                        foreach ($booking->vehicles as $vehicle) {
                            $vehicleCounts[$vehicle->type]++;
                        }

                        $scheduleDate->motorcycle_count -= $vehicleCounts['MOTORCYCLE'];
                        $scheduleDate->car_count -= $vehicleCounts['CAR'];
                        $scheduleDate->bus_count -= $vehicleCounts['BUS'];
                        $scheduleDate->truck_count -= $vehicleCounts['TRUCK'];

                        $scheduleDate->save();
                    }
                } elseif ($validated['status'] === 'COMPLETED') {
                    // Update ticket status
                    Ticket::where('booking_id', $booking->id)
                        ->update(['status' => 'USED']);
                }

                $booking->save();

                // Create booking log
                $bookingLog = new BookingLog([
                    'booking_id' => $booking->id,
                    'previous_status' => $previousStatus,
                    'new_status' => $booking->status,
                    'changed_by_type' => 'ADMIN',
                    'changed_by_id' => Auth::id(),
                    'notes' => $validated['notes'] ?? 'Status diubah oleh admin',
                    'ip_address' => $request->ip(),
                ]);

                $bookingLog->save();

                // Update payment status if needed
                if ($validated['status'] === 'CONFIRMED' && $previousStatus === 'PENDING') {
                    $payment = Payment::where('booking_id', $booking->id)
                        ->where('status', 'PENDING')
                        ->first();

                    if ($payment) {
                        $payment->status = 'SUCCESS';
                        $payment->payment_date = now();
                        $payment->save();
                    }

                    // Kapasitas sudah dikurangi saat booking dibuat dengan status PENDING
                    // Tidak perlu modifikasi kapasitas lagi saat status berubah menjadi CONFIRMED

                } elseif ($validated['status'] === 'CANCELLED') {
                    $payment = Payment::where('booking_id', $booking->id)
                        ->where('status', 'PENDING')
                        ->first();

                    if ($payment) {
                        $payment->status = 'FAILED';
                        $payment->save();
                    }
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Status booking berhasil diperbarui',
                    'data' => $booking->fresh()->load(['user', 'schedule.route', 'schedule.ferry', 'payments', 'tickets', 'vehicles', 'bookingLogs'])
                ]);
            } catch (\Exception $e) {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat mengubah status booking: ' . $e->getMessage()
                ], 500);
            }
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan'
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui status booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menampilkan form reschedule booking
     *
     * @param int $id
     * @return JsonResponse
     */
    public function rescheduleForm($id): JsonResponse
    {
        try {
            $booking = Booking::with(['user', 'schedule.route', 'schedule.ferry', 'tickets', 'vehicles'])
                ->findOrFail($id);

            // Validasi booking yang bisa di-reschedule
            if (!in_array($booking->status, ['CONFIRMED'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya booking dengan status CONFIRMED yang dapat dijadwalkan ulang',
                    'errors' => ['booking' => ['Hanya booking dengan status CONFIRMED yang dapat dijadwalkan ulang']]
                ], 422);
            }

            $routes = Route::where('status', 'ACTIVE')->select('id', 'origin', 'destination', 'status')->get();

            return response()->json([
                'success' => true,
                'message' => 'Data untuk reschedule booking berhasil diambil',
                'data' => [
                    'booking' => $booking,
                    'routes' => $routes
                ]
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil form reschedule: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengambil jadwal yang tersedia untuk reschedule
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getAvailableSchedules(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'route_id' => 'required|exists:routes,id',
                'date' => 'required|date|after_or_equal:today',
                'passenger_count' => 'required|integer|min:1',
                'vehicle_counts' => 'nullable|array',
                'find_nearest' => 'nullable|boolean',
            ]);

            $date = Carbon::parse($validated['date']);
            // Cek apakah ada jadwal untuk hari tersebut
            $dayOfWeek = $date->dayOfWeek + 1; // Konversi ke format 1-7 (Senin-Minggu)

            // Log untuk debugging
            Log::info('Pencarian jadwal tersedia untuk reschedule', [
                'route_id' => $validated['route_id'],
                'tanggal' => $date->format('Y-m-d'),
                'hari' => $dayOfWeek,
                'hari_nama' => $date->format('l')
            ]);

            // Ambil semua jadwal untuk rute yang dipilih pada hari yang sesuai
            $schedules = Schedule::where('route_id', $validated['route_id'])
                ->where('status', 'ACTIVE')
                ->with(['ferry', 'route'])
                ->get();

            // Filter jadwal yang tersedia untuk hari yang dipilih
            $schedules = $schedules->filter(function ($schedule) use ($dayOfWeek) {
                $availableDays = explode(',', $schedule->days);
                $available = in_array((string)$dayOfWeek, $availableDays);

                // Log untuk debugging
                Log::info('Cek ketersediaan jadwal untuk hari', [
                    'schedule_id' => $schedule->id,
                    'hari_dipilih' => $dayOfWeek,
                    'hari_tersedia' => $availableDays,
                    'tersedia' => $available
                ]);

                return $available;
            })->values();

            $scheduleIds = $schedules->pluck('id');

            // Ambil ketersediaan untuk tanggal yang dipilih
            $scheduleDates = ScheduleDate::whereIn('schedule_id', $scheduleIds)
                ->where('date', $date->format('Y-m-d'))
                ->get()
                ->keyBy('schedule_id');

            $vehicleCounts = $request->vehicle_counts ?? [];

            $result = $schedules->map(function ($schedule) use ($scheduleDates, $date, $request, $vehicleCounts) {
                // Cek apakah ada data ScheduleDate untuk jadwal ini
                $scheduleDate = $scheduleDates->get($schedule->id);

                // Jika tidak ada ScheduleDate, jadwal tidak tersedia
                if (!$scheduleDate) {
                    // Jangan tampilkan sebagai tersedia, meskipun hari sesuai
                    return [
                        'id' => $schedule->id,
                        'departure_time' => $schedule->departure_time,
                        'arrival_time' => $schedule->arrival_time,
                        'ferry' => [
                            'name' => $schedule->ferry->name,
                            'capacity_passenger' => $schedule->ferry->capacity_passenger,
                            'capacity_vehicle_motorcycle' => $schedule->ferry->capacity_vehicle_motorcycle,
                            'capacity_vehicle_car' => $schedule->ferry->capacity_vehicle_car,
                            'capacity_vehicle_bus' => $schedule->ferry->capacity_vehicle_bus,
                            'capacity_vehicle_truck' => $schedule->ferry->capacity_vehicle_truck,
                        ],
                        'available_passenger' => 0,
                        'available_motorcycle' => 0,
                        'available_car' => 0,
                        'available_bus' => 0,
                        'available_truck' => 0,
                        'schedule_date_status' => 'NOT_AVAILABLE',
                        'is_available' => false,
                        'reason' => 'Jadwal tidak tersedia untuk tanggal ini'
                    ];
                }

                // Jika status schedule date bukan AVAILABLE
                if ($scheduleDate->status !== 'ACTIVE') {
                    return [
                        'id' => $schedule->id,
                        'departure_time' => $schedule->departure_time,
                        'arrival_time' => $schedule->arrival_time,
                        'ferry' => [
                            'name' => $schedule->ferry->name,
                            'capacity_passenger' => $schedule->ferry->capacity_passenger,
                            'capacity_vehicle_motorcycle' => $schedule->ferry->capacity_vehicle_motorcycle,
                            'capacity_vehicle_car' => $schedule->ferry->capacity_vehicle_car,
                            'capacity_vehicle_bus' => $schedule->ferry->capacity_vehicle_bus,
                            'capacity_vehicle_truck' => $schedule->ferry->capacity_vehicle_truck,
                        ],
                        'available_passenger' => 0,
                        'available_motorcycle' => 0,
                        'available_car' => 0,
                        'available_bus' => 0,
                        'available_truck' => 0,
                        'schedule_date_status' => $scheduleDate->status,
                        'is_available' => false,
                        'reason' => 'Jadwal tidak tersedia untuk tanggal ini'
                    ];
                }

                // Hitung ketersediaan
                $availablePassenger = $schedule->ferry->capacity_passenger - $scheduleDate->passenger_count;
                $availableMotorcycle = $schedule->ferry->capacity_vehicle_motorcycle - $scheduleDate->motorcycle_count;
                $availableCar = $schedule->ferry->capacity_vehicle_car - $scheduleDate->car_count;
                $availableBus = $schedule->ferry->capacity_vehicle_bus - $scheduleDate->bus_count;
                $availableTruck = $schedule->ferry->capacity_vehicle_truck - $scheduleDate->truck_count;

                // Cek ketersediaan
                $passengerAvailable = $availablePassenger >= $request->passenger_count;
                $motorcycleAvailable = true;
                $carAvailable = true;
                $busAvailable = true;
                $truckAvailable = true;
                $reason = '';

                if (!$passengerAvailable) {
                    $reason = 'Kapasitas penumpang tidak mencukupi';
                }

                if (isset($vehicleCounts['MOTORCYCLE']) && $vehicleCounts['MOTORCYCLE'] > 0) {
                    $motorcycleAvailable = $availableMotorcycle >= $vehicleCounts['MOTORCYCLE'];
                    if (!$motorcycleAvailable && empty($reason)) {
                        $reason = 'Kapasitas motor tidak mencukupi';
                    }
                }

                if (isset($vehicleCounts['CAR']) && $vehicleCounts['CAR'] > 0) {
                    $carAvailable = $availableCar >= $vehicleCounts['CAR'];
                    if (!$carAvailable && empty($reason)) {
                        $reason = 'Kapasitas mobil tidak mencukupi';
                    }
                }

                if (isset($vehicleCounts['BUS']) && $vehicleCounts['BUS'] > 0) {
                    $busAvailable = $availableBus >= $vehicleCounts['BUS'];
                    if (!$busAvailable && empty($reason)) {
                        $reason = 'Kapasitas bus tidak mencukupi';
                    }
                }

                if (isset($vehicleCounts['TRUCK']) && $vehicleCounts['TRUCK'] > 0) {
                    $truckAvailable = $availableTruck >= $vehicleCounts['TRUCK'];
                    if (!$truckAvailable && empty($reason)) {
                        $reason = 'Kapasitas truk tidak mencukupi';
                    }
                }

                // Cek ketersediaan
                $isAvailable = $passengerAvailable && $motorcycleAvailable && $carAvailable && $busAvailable && $truckAvailable;

                // Tambahkan logging untuk membantu debugging kapasitas
                Log::info('Pengecekan ketersediaan kapasitas untuk reschedule', [
                    'schedule_id' => $schedule->id,
                    'departure_date' => $date->format('Y-m-d'),
                    'passengerAvailable' => $passengerAvailable,
                    'motorcycleAvailable' => $motorcycleAvailable,
                    'carAvailable' => $carAvailable,
                    'busAvailable' => $busAvailable,
                    'truckAvailable' => $truckAvailable,
                    'isAvailable' => $isAvailable,
                    'reason' => $isAvailable ? '' : $reason
                ]);

                return [
                    'id' => $schedule->id,
                    'departure_time' => $schedule->departure_time,
                    'arrival_time' => $schedule->arrival_time,
                    'ferry' => [
                        'name' => $schedule->ferry->name,
                        'capacity_passenger' => $schedule->ferry->capacity_passenger,
                        'capacity_vehicle_motorcycle' => $schedule->ferry->capacity_vehicle_motorcycle,
                        'capacity_vehicle_car' => $schedule->ferry->capacity_vehicle_car,
                        'capacity_vehicle_bus' => $schedule->ferry->capacity_vehicle_bus,
                        'capacity_vehicle_truck' => $schedule->ferry->capacity_vehicle_truck,
                    ],
                    'available_passenger' => $availablePassenger,
                    'available_motorcycle' => $availableMotorcycle,
                    'available_car' => $availableCar,
                    'available_bus' => $availableBus,
                    'available_truck' => $availableTruck,
                    'schedule_date_status' => $scheduleDate->status,
                    'is_available' => $isAvailable,
                    'reason' => $isAvailable ? '' : $reason
                ];
            });

            // Menambahkan fitur cari jadwal terdekat jika diminta
            if ($request->has('find_nearest') && $request->find_nearest) {
                // Jika tidak ada jadwal tersedia pada tanggal yang dipilih
                $availableSchedule = $result->firstWhere('is_available', true);

                if (!$availableSchedule) {
                    // Cari jadwal terdekat dalam range 7 hari ke depan
                    $nearestDate = null;
                    $nearestSchedules = [];

                    for ($i = 1; $i <= 7; $i++) {
                        $nextDate = $date->copy()->addDays($i);
                        $nextDayOfWeek = $nextDate->dayOfWeek + 1;

                        // Cek apakah ada jadwal untuk hari tersebut
                        $nextSchedules = Schedule::where('route_id', $validated['route_id'])
                            ->where('status', 'ACTIVE')
                            ->whereRaw("FIND_IN_SET('$nextDayOfWeek', days)")
                            ->with(['ferry'])
                            ->get();

                        if ($nextSchedules->isNotEmpty()) {
                            // Cek ketersediaan
                            $nextScheduleIds = $nextSchedules->pluck('id');
                            $nextScheduleDates = ScheduleDate::whereIn('schedule_id', $nextScheduleIds)
                                ->where('date', $nextDate->format('Y-m-d'))
                                ->where('status', 'ACTIVE')
                                ->get();

                            if ($nextScheduleDates->isNotEmpty()) {
                                // Cek kapasitas
                                foreach ($nextScheduleDates as $nextScheduleDate) {
                                    $schedule = $nextSchedules->firstWhere('id', $nextScheduleDate->schedule_id);
                                    if (!$schedule) continue;

                                    $passengerAvailable = ($schedule->ferry->capacity_passenger - $nextScheduleDate->passenger_count) >= $request->passenger_count;

                                    // Cek kendaraan
                                    $vehicleAvailable = true;
                                    foreach ($vehicleCounts as $type => $count) {
                                        if ($count <= 0) continue;

                                        switch ($type) {
                                            case 'MOTORCYCLE':
                                                if (($schedule->ferry->capacity_vehicle_motorcycle - $nextScheduleDate->motorcycle_count) < $count) {
                                                    $vehicleAvailable = false;
                                                }
                                                break;
                                            case 'CAR':
                                                if (($schedule->ferry->capacity_vehicle_car - $nextScheduleDate->car_count) < $count) {
                                                    $vehicleAvailable = false;
                                                }
                                                break;
                                            case 'BUS':
                                                if (($schedule->ferry->capacity_vehicle_bus - $nextScheduleDate->bus_count) < $count) {
                                                    $vehicleAvailable = false;
                                                }
                                                break;
                                            case 'TRUCK':
                                                if (($schedule->ferry->capacity_vehicle_truck - $nextScheduleDate->truck_count) < $count) {
                                                    $vehicleAvailable = false;
                                                }
                                                break;
                                        }

                                        if (!$vehicleAvailable) break;
                                    }

                                    if ($passengerAvailable && $vehicleAvailable) {
                                        $nearestDate = $nextDate;
                                        $nearestSchedules[] = [
                                            'date' => $nextDate->format('Y-m-d'),
                                            'day' => $nextDate->format('l'),
                                            'schedule_id' => $schedule->id,
                                            'departure_time' => $schedule->departure_time,
                                            'arrival_time' => $schedule->arrival_time,
                                            'ferry_name' => $schedule->ferry->name,
                                        ];
                                    }
                                }

                                if (!empty($nearestSchedules)) {
                                    break; // Keluar dari loop jika sudah menemukan jadwal terdekat
                                }
                            }
                            // Jangan rekomendasi jadwal yang tidak memiliki schedule_date
                            else {
                                // Tidak melakukan apa-apa, biarkan pencarian jadwal terdekat lanjut ke tanggal berikutnya
                                continue;
                            }
                        }
                    }

                    return response()->json([
                        'success' => true,
                        'message' => 'Jadwal tersedia berhasil diambil dengan saran tanggal terdekat',
                        'data' => $result,
                        'nearest_date' => $nearestDate ? $nearestDate->format('Y-m-d') : null,
                        'nearest_schedules' => $nearestSchedules
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Jadwal tersedia berhasil diambil',
                'data' => $result
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
                'message' => 'Gagal mengambil jadwal tersedia: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Proses reschedule booking
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function processReschedule(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'schedule_id' => 'required|exists:schedules,id',
                'departure_date' => 'required|date|after_or_equal:today',
                'notes' => 'nullable|string',
            ]);

            $originalBooking = Booking::with(['user', 'schedule.route', 'tickets', 'vehicles'])
                ->findOrFail($id);

            if ($originalBooking->status !== 'CONFIRMED') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya booking dengan status CONFIRMED yang dapat dijadwalkan ulang',
                    'errors' => ['status' => ['Hanya booking dengan status CONFIRMED yang dapat dijadwalkan ulang']]
                ], 422);
            }

            $newSchedule = Schedule::with(['route', 'ferry'])->findOrFail($validated['schedule_id']);
            $bookingDate = $validated['departure_date'];

            // Verify schedule is available for the date - cek jika hari tersedia
            $bookingDateObj = Carbon::parse($bookingDate);
            $dayOfWeek = $bookingDateObj->dayOfWeek + 1; // Convert 0-6 to 1-7 for Monday-Sunday
            $availableDays = explode(',', $newSchedule->days);

            // Log untuk debugging
            Log::info('Validasi hari untuk reschedule', [
                'booking_id' => $id,
                'tanggal_dipilih' => $bookingDate,
                'hari_dipilih' => $dayOfWeek,
                'hari_tersedia' => $availableDays,
                'cocok' => in_array((string)$dayOfWeek, $availableDays)
            ]);

            if (!in_array((string)$dayOfWeek, $availableDays)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jadwal tidak tersedia untuk hari yang dipilih',
                    'errors' => ['schedule_id' => ['Jadwal tidak tersedia untuk hari ' . $bookingDateObj->format('l') . '. Jadwal ini hanya tersedia pada ' . implode(', ', array_map(function ($day) {
                        $dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
                        return $dayNames[(int)$day - 1];
                    }, $availableDays)) . '.']]
                ], 422);
            }

            // Cek status jadwal
            if ($newSchedule->status !== 'ACTIVE') {
                return response()->json([
                    'success' => false,
                    'message' => 'Jadwal tidak aktif',
                    'errors' => ['schedule_id' => ['Jadwal tidak aktif, tidak dapat dijadwalkan ulang']]
                ], 422);
            }

            try {
                DB::beginTransaction();

                // Hanya ambil schedule date yang sudah ada, jangan buat baru
                $scheduleDate = ScheduleDate::where('schedule_id', $newSchedule->id)
                    ->where('date', $bookingDate)
                    ->first();

                // Jika schedule date tidak ditemukan, tolak reschedule
                if (!$scheduleDate) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Jadwal untuk tanggal ini tidak tersedia',
                        'errors' => ['schedule_id' => ['Jadwal untuk tanggal ini tidak tersedia. Silakan pilih jadwal lain.']]
                    ], 422);
                }

                // Jika schedule date ada tapi statusnya tidak aktif
                if ($scheduleDate->status !== 'ACTIVE') {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Jadwal untuk tanggal ini tidak aktif',
                        'errors' => ['schedule_id' => ['Jadwal untuk tanggal ini tidak aktif']]
                    ], 422);
                }

                // Hitung kendaraan berdasarkan tipe
                $vehicleCounts = [
                    'MOTORCYCLE' => 0,
                    'CAR' => 0,
                    'BUS' => 0,
                    'TRUCK' => 0
                ];

                foreach ($originalBooking->vehicles as $vehicle) {
                    if (isset($vehicleCounts[$vehicle->type])) {
                        $vehicleCounts[$vehicle->type]++;
                    }
                }

                // Cek ketersediaan
                if ($scheduleDate->passenger_count + $originalBooking->passenger_count > $newSchedule->ferry->capacity_passenger) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Maaf, kursi penumpang tidak mencukupi',
                        'errors' => ['passenger_count' => ['Maaf, kursi penumpang tidak mencukupi']]
                    ], 422);
                }

                if ($scheduleDate->motorcycle_count + $vehicleCounts['MOTORCYCLE'] > $newSchedule->ferry->capacity_vehicle_motorcycle) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Maaf, kapasitas motor tidak mencukupi',
                        'errors' => ['vehicles' => ['Maaf, kapasitas motor tidak mencukupi']]
                    ], 422);
                }

                if ($scheduleDate->car_count + $vehicleCounts['CAR'] > $newSchedule->ferry->capacity_vehicle_car) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Maaf, kapasitas mobil tidak mencukupi',
                        'errors' => ['vehicles' => ['Maaf, kapasitas mobil tidak mencukupi']]
                    ], 422);
                }

                if ($scheduleDate->bus_count + $vehicleCounts['BUS'] > $newSchedule->ferry->capacity_vehicle_bus) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Maaf, kapasitas bus tidak mencukupi',
                        'errors' => ['vehicles' => ['Maaf, kapasitas bus tidak mencukupi']]
                    ], 422);
                }

                if ($scheduleDate->truck_count + $vehicleCounts['TRUCK'] > $newSchedule->ferry->capacity_vehicle_truck) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Maaf, kapasitas truk tidak mencukupi',
                        'errors' => ['vehicles' => ['Maaf, kapasitas truk tidak mencukupi']]
                    ], 422);
                }

                // Jika semua validasi berhasil, simpan schedule date yang baru dibuat
                if (!$scheduleDate->exists) {
                    $scheduleDate->save();
                }

                $originalScheduleDate = ScheduleDate::where('schedule_id', $originalBooking->schedule_id)
                    ->where('date', $originalBooking->departure_date)
                    ->first();

                if ($originalScheduleDate) {
                    // Kurangi jumlah penumpang dan kendaraan dari jadwal lama
                    // saat booking direschedule, kapasitas dikembalikan pada jadwal lama
                    $originalScheduleDate->passenger_count = max(0, $originalScheduleDate->passenger_count - $originalBooking->passenger_count);
                    $originalScheduleDate->motorcycle_count = max(0, $originalScheduleDate->motorcycle_count - $vehicleCounts['MOTORCYCLE']);
                    $originalScheduleDate->car_count = max(0, $originalScheduleDate->car_count - $vehicleCounts['CAR']);
                    $originalScheduleDate->bus_count = max(0, $originalScheduleDate->bus_count - $vehicleCounts['BUS']);
                    $originalScheduleDate->truck_count = max(0, $originalScheduleDate->truck_count - $vehicleCounts['TRUCK']);
                    $originalScheduleDate->save();

                    Log::info('Kapasitas pada jadwal lama dibebaskan', [
                        'booking_id' => $originalBooking->id,
                        'schedule_date_id' => $originalScheduleDate->id,
                        'passenger_count' => $originalBooking->passenger_count,
                        'motorcycle_count' => $vehicleCounts['MOTORCYCLE'],
                        'car_count' => $vehicleCounts['CAR'],
                        'bus_count' => $vehicleCounts['BUS'],
                        'truck_count' => $vehicleCounts['TRUCK']
                    ]);
                }

                // Update status tiket menjadi CANCELLED
                Ticket::where('booking_id', $originalBooking->id)
                    ->update(['status' => 'CANCELLED']);

                // Update status booking lama
                $previousStatus = $originalBooking->status;
                $originalBooking->status = 'RESCHEDULED';
                $originalBooking->notes = ($originalBooking->notes ? $originalBooking->notes . "\n" : '') .
                    "Dijadwalkan ulang ke " . $bookingDate .
                    " dengan alasan: " . ($validated['notes'] ?? 'Tidak ada alasan');
                $originalBooking->save();

                // Buat booking baru
                $newBooking = new Booking([
                    'booking_code' => 'FBS-' . strtoupper(Str::random(8)),
                    'user_id' => $originalBooking->user_id,
                    'schedule_id' => $newSchedule->id,
                    'departure_date' => $bookingDate,
                    'passenger_count' => $originalBooking->passenger_count,
                    'vehicle_count' => $originalBooking->vehicle_count,
                    'total_amount' => $originalBooking->total_amount,
                    'status' => 'CONFIRMED',
                    'booked_by' => 'COUNTER',
                    'booking_channel' => 'ADMIN',
                    'notes' => "Reschedule dari booking {$originalBooking->booking_code}. " . ($validated['notes'] ?? ''),
                ]);

                $newBooking->save();

                // Create tickets for each passenger
                foreach ($originalBooking->tickets as $oldTicket) {
                    $ticket = new Ticket([
                        'ticket_code' => 'TKT-' . strtoupper(Str::random(8)),
                        'booking_id' => $newBooking->id,
                        'qr_code' => 'QR-' . strtoupper(Str::random(12)),
                        'passenger_id' => $oldTicket->passenger_id,
                        'passenger_name' => $oldTicket->passenger_name ?? null,
                        'passenger_id_number' => $oldTicket->passenger_id_number ?? null,
                        'passenger_id_type' => $oldTicket->passenger_id_type ?? null,
                        'boarding_status' => 'NOT_BOARDED',
                        'status' => 'ACTIVE',
                        'checked_in' => false,
                        'ticket_type' => $oldTicket->ticket_type
                    ]);

                    $ticket->save();
                }

                // Create vehicles
                foreach ($originalBooking->vehicles as $oldVehicle) {
                    // Cari vehicle_category_id berdasarkan tipe kendaraan jika tidak tersedia
                    $vehicleCategoryId = $oldVehicle->vehicle_category_id;

                    // Jika vehicle_category_id tidak ada, coba cari berdasarkan tipe
                    if (!$vehicleCategoryId) {
                        $vehicleCategory = VehicleCategory::where('type', $oldVehicle->type)
                            ->where('status', 'ACTIVE')
                            ->first();

                        $vehicleCategoryId = $vehicleCategory ? $vehicleCategory->id : null;

                        // Log untuk debugging
                        Log::info('Menggunakan vehicle_category_id dari lookup', [
                            'vehicle_type' => $oldVehicle->type,
                            'found_category_id' => $vehicleCategoryId
                        ]);
                    }

                    // Jika masih tidak ada, gunakan try-catch untuk menangani error
                    try {
                        $vehicle = new Vehicle([
                            'booking_id' => $newBooking->id,
                            'user_id' => $oldVehicle->user_id,
                            'type' => $oldVehicle->type,
                            'license_plate' => $oldVehicle->license_plate,
                            'brand' => $oldVehicle->brand,
                            'model' => $oldVehicle->model,
                            'weight' => $oldVehicle->weight,
                            'vehicle_category_id' => $vehicleCategoryId
                        ]);

                        $vehicle->save();
                    } catch (\Exception $e) {
                        // Log error dan lanjutkan proses untuk kendaraan lainnya
                        Log::error('Gagal menyalin data kendaraan: ' . $e->getMessage(), [
                            'vehicle_type' => $oldVehicle->type,
                            'license_plate' => $oldVehicle->license_plate
                        ]);
                    }
                }

                // Update schedule date untuk booking baru
                // Mengalokasikan kapasitas pada jadwal baru sesuai dengan booking yang di-reschedule
                $scheduleDate->passenger_count += $originalBooking->passenger_count;
                $scheduleDate->motorcycle_count += $vehicleCounts['MOTORCYCLE'];
                $scheduleDate->car_count += $vehicleCounts['CAR'];
                $scheduleDate->bus_count += $vehicleCounts['BUS'];
                $scheduleDate->truck_count += $vehicleCounts['TRUCK'];
                $scheduleDate->save();

                Log::info('Kapasitas pada jadwal baru dialokasikan', [
                    'booking_id' => $newBooking->id,
                    'schedule_date_id' => $scheduleDate->id,
                    'passenger_count' => $originalBooking->passenger_count,
                    'motorcycle_count' => $vehicleCounts['MOTORCYCLE'],
                    'car_count' => $vehicleCounts['CAR'],
                    'bus_count' => $vehicleCounts['BUS'],
                    'truck_count' => $vehicleCounts['TRUCK']
                ]);

                // Duplikasi payment untuk booking baru jika perlu
                $originalPayment = Payment::where('booking_id', $originalBooking->id)
                    ->where('status', 'SUCCESS')
                    ->first();

                if ($originalPayment) {
                    // Menggunakan replicate untuk duplikasi model dengan aman
                    $newPayment = $originalPayment->replicate();
                    $newPayment->booking_id = $newBooking->id;
                    $newPayment->payment_date = now();
                    // Hapus baris notes karena tidak ada di model Payment
                    // Kosongkan fields yang tidak boleh diduplikasi
                    $newPayment->id = null;
                    $newPayment->created_at = null;
                    $newPayment->updated_at = null;

                    $newPayment->save();
                }

                // Create booking log untuk booking lama
                $bookingLog = new BookingLog([
                    'booking_id' => $originalBooking->id,
                    'previous_status' => $previousStatus,
                    'new_status' => 'RESCHEDULED',
                    'changed_by_type' => 'ADMIN',
                    'changed_by_id' => Auth::id(),
                    'notes' => 'Booking dijadwalkan ulang ke ' . $bookingDate,
                    'ip_address' => $request->ip(),
                ]);

                $bookingLog->save();

                // Create booking log untuk booking baru
                $bookingLog = new BookingLog([
                    'booking_id' => $newBooking->id,
                    'previous_status' => 'NEW',
                    'new_status' => 'CONFIRMED',
                    'changed_by_type' => 'ADMIN',
                    'changed_by_id' => Auth::id(),
                    'notes' => 'Booking baru dari reschedule booking ' . $originalBooking->booking_code,
                    'ip_address' => $request->ip(),
                ]);

                $bookingLog->save();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Booking berhasil dijadwalkan ulang',
                    'data' => [
                        'original_booking' => $originalBooking->fresh(),
                        'new_booking' => $newBooking->load(['user', 'schedule.route', 'schedule.ferry', 'tickets', 'vehicles', 'bookingLogs'])
                    ]
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                // Log detail error untuk debugging
                Log::error('Reschedule error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());

                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat reschedule: ' . $e->getMessage()
                ], 500);
            }
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan'
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Log detail error untuk debugging
            Log::error('Reschedule error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses reschedule: ' . $e->getMessage()
            ], 500);
        }
    }
}
