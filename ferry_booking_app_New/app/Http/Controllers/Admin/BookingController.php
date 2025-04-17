<?php

namespace App\Http\Controllers\Admin;

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
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'schedule.route', 'schedule.ferry']);

        // Filter berdasarkan kode booking
        if ($request->has('booking_code') && $request->booking_code) {
            $query->where('booking_code', 'like', '%' . $request->booking_code . '%');
        }

        // Filter berdasarkan nama pengguna
        if ($request->has('user_name') && $request->user_name) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->user_name . '%');
            });
        }

        // Filter berdasarkan rute
        if ($request->has('route_id') && $request->route_id) {
            $query->whereHas('schedule', function($q) use ($request) {
                $q->where('route_id', $request->route_id);
            });
        }

        // Filter berdasarkan status booking
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan tanggal booking
        if ($request->has('booking_date_from') && $request->booking_date_from) {
            $query->where('booking_date', '>=', $request->booking_date_from);
        }

        if ($request->has('booking_date_to') && $request->booking_date_to) {
            $query->where('booking_date', '<=', $request->booking_date_to);
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(10);
        $routes = Route::where('status', 'ACTIVE')->get();

        return view('admin.bookings.index', compact('bookings', 'routes'));
    }

    public function show($id)
    {
        $booking = Booking::with([
            'user',
            'schedule.route',
            'schedule.ferry',
            'payments',
            'tickets',
            'vehicles',
            'bookingLogs',
        ])->findOrFail($id);

        return view('admin.bookings.show', compact('booking'));
    }

    public function create()
    {
        $routes = Route::where('status', 'ACTIVE')->get();
        return view('admin.bookings.create', compact('routes'));
    }

    public function getSchedules(Request $request)
    {
        $request->validate([
            'route_id' => 'required|exists:routes,id',
            'date' => 'required|date|after_or_equal:today',
        ]);

        $date = Carbon::parse($request->date);
        $dayOfWeek = $date->dayOfWeek + 1; // Konversi ke format 1-7 (Senin-Minggu)

        $schedules = Schedule::where('route_id', $request->route_id)
            ->where('status', 'ACTIVE')
            ->whereRaw("FIND_IN_SET('$dayOfWeek', days)")
            ->with(['ferry', 'route'])
            ->get();

        $scheduleIds = $schedules->pluck('id');

        // Ambil ketersediaan untuk tanggal yang dipilih
        $scheduleDates = ScheduleDate::whereIn('schedule_id', $scheduleIds)
            ->where('date', $date->format('Y-m-d'))
            ->get()
            ->keyBy('schedule_id');

        $result = $schedules->map(function ($schedule) use ($scheduleDates, $date) {
            $scheduleDate = $scheduleDates->get($schedule->id);

            // Kalau tidak ada data specifik untuk tanggal tersebut,
            // tambahkan data default
            if (!$scheduleDate) {
                $scheduleDate = new ScheduleDate([
                    'schedule_id' => $schedule->id,
                    'date' => $date->format('Y-m-d'),
                    'passenger_count' => 0,
                    'motorcycle_count' => 0,
                    'car_count' => 0,
                    'bus_count' => 0,
                    'truck_count' => 0,
                    'status' => 'AVAILABLE'
                ]);
            }

            // Gabungkan data jadwal dengan ketersediaan
            $schedule->available_passenger = $schedule->ferry->capacity_passenger - $scheduleDate->passenger_count;
            $schedule->available_motorcycle = $schedule->ferry->capacity_vehicle_motorcycle - $scheduleDate->motorcycle_count;
            $schedule->available_car = $schedule->ferry->capacity_vehicle_car - $scheduleDate->car_count;
            $schedule->available_bus = $schedule->ferry->capacity_vehicle_bus - $scheduleDate->bus_count;
            $schedule->available_truck = $schedule->ferry->capacity_vehicle_truck - $scheduleDate->truck_count;
            $schedule->schedule_date_status = $scheduleDate->status;

            return $schedule;
        })->filter(function ($schedule) {
            // Filter jadwal yang tidak tersedia
            return $schedule->schedule_date_status === 'AVAILABLE';
        });

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    public function searchUsers(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:3',
        ]);

        $users = User::where('name', 'like', '%' . $request->query . '%')
            ->orWhere('email', 'like', '%' . $request->query . '%')
            ->orWhere('phone', 'like', '%' . $request->query . '%')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'schedule_id' => 'required|exists:schedules,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'passenger_count' => 'required|integer|min:1',
            'vehicle_count' => 'required|integer|min:0',
            'vehicles' => 'required_if:vehicle_count,>,0|array',
            'vehicles.*.type' => 'required_with:vehicles|in:MOTORCYCLE,CAR,BUS,TRUCK',
            'vehicles.*.license_plate' => 'required_with:vehicles|string|max:20',
            'passengers' => 'required|array|min:1',
            'passengers.*.name' => 'required|string|max:191',
            'passengers.*.id_number' => 'required|string|max:30',
            'passengers.*.id_type' => 'required|in:KTP,SIM,PASPOR',
            'payment_method' => 'required|in:BANK_TRANSFER,VIRTUAL_ACCOUNT,E_WALLET,CREDIT_CARD,CASH',
            'payment_channel' => 'required|string|max:50',
        ]);

        // Get schedule
        $schedule = Schedule::with(['route', 'ferry'])->findOrFail($request->schedule_id);
        $bookingDate = $request->booking_date;

        // Verify schedule is available for the date
        $dayOfWeek = date('N', strtotime($bookingDate)); // 1-7 for Monday-Sunday
        if (!in_array($dayOfWeek, explode(',', $schedule->days))) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['schedule_id' => 'Jadwal tidak tersedia untuk tanggal yang dipilih']);
        }

        // Check seat availability
        $scheduleDate = ScheduleDate::firstOrCreate(
            ['schedule_id' => $schedule->id, 'date' => $bookingDate],
            [
                'passenger_count' => 0,
                'motorcycle_count' => 0,
                'car_count' => 0,
                'bus_count' => 0,
                'truck_count' => 0,
                'status' => 'AVAILABLE'
            ]
        );

        if ($scheduleDate->status !== 'AVAILABLE') {
            return redirect()->back()
                ->withInput()
                ->withErrors(['schedule_id' => 'Jadwal tidak tersedia untuk tanggal yang dipilih']);
        }

        if ($scheduleDate->passenger_count + $request->passenger_count > $schedule->ferry->capacity_passenger) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['passenger_count' => 'Maaf, kursi penumpang tidak mencukupi']);
        }

        // Count vehicles by type
        $vehicleCounts = [
            'MOTORCYCLE' => 0,
            'CAR' => 0,
            'BUS' => 0,
            'TRUCK' => 0
        ];

        if ($request->vehicle_count > 0) {
            foreach ($request->vehicles as $vehicle) {
                $vehicleCounts[$vehicle['type']]++;
            }

            // Check availability for each vehicle type
            if ($scheduleDate->motorcycle_count + $vehicleCounts['MOTORCYCLE'] > $schedule->ferry->capacity_vehicle_motorcycle) {
                return redirect()->back()
                    ->withInput()
                    ->withErrors(['vehicles' => 'Maaf, kapasitas motor tidak mencukupi']);
            }

            if ($scheduleDate->car_count + $vehicleCounts['CAR'] > $schedule->ferry->capacity_vehicle_car) {
                return redirect()->back()
                    ->withInput()
                    ->withErrors(['vehicles' => 'Maaf, kapasitas mobil tidak mencukupi']);
            }

            if ($scheduleDate->bus_count + $vehicleCounts['BUS'] > $schedule->ferry->capacity_vehicle_bus) {
                return redirect()->back()
                    ->withInput()
                    ->withErrors(['vehicles' => 'Maaf, kapasitas bus tidak mencukupi']);
            }

            if ($scheduleDate->truck_count + $vehicleCounts['TRUCK'] > $schedule->ferry->capacity_vehicle_truck) {
                return redirect()->back()
                    ->withInput()
                    ->withErrors(['vehicles' => 'Maaf, kapasitas truk tidak mencukupi']);
            }
        }

        // Calculate total price
        $basePrice = $schedule->route->base_price * $request->passenger_count;
        $vehiclePrice = 0;

        if ($request->vehicle_count > 0) {
            foreach ($request->vehicles as $vehicle) {
                switch ($vehicle['type']) {
                    case 'MOTORCYCLE':
                        $vehiclePrice += $schedule->route->motorcycle_price;
                        break;
                    case 'CAR':
                        $vehiclePrice += $schedule->route->car_price;
                        break;
                    case 'BUS':
                        $vehiclePrice += $schedule->route->bus_price;
                        break;
                    case 'TRUCK':
                        $vehiclePrice += $schedule->route->truck_price;
                        break;
                }
            }
        }

        $totalAmount = $basePrice + $vehiclePrice;

        // Begin database transaction
        try {
            DB::beginTransaction();

            // Create booking
            $user = User::findOrFail($request->user_id);
            $booking = new Booking([
                'booking_code' => 'FBS-' . strtoupper(Str::random(8)),
                'user_id' => $user->id,
                'schedule_id' => $request->schedule_id,
                'booking_date' => $request->booking_date,
                'passenger_count' => $request->passenger_count,
                'vehicle_count' => $request->vehicle_count,
                'total_amount' => $totalAmount,
                'status' => $request->payment_method === 'CASH' ? 'CONFIRMED' : 'PENDING',
                'booked_by' => 'COUNTER',
                'booking_channel' => 'ADMIN',
                'notes' => $request->notes,
            ]);

            $booking->save();

            // Create tickets for each passenger
            foreach ($request->passengers as $passenger) {
                $ticket = new Ticket([
                    'ticket_code' => 'TKT-' . strtoupper(Str::random(8)),
                    'booking_id' => $booking->id,
                    'qr_code' => 'QR-' . strtoupper(Str::random(12)),
                    'passenger_id' => $user->id,
                    'boarding_status' => 'NOT_BOARDED',
                    'status' => 'ACTIVE',
                    'checked_in' => false,
                    'ticket_type' => 'STANDARD'
                ]);

                $ticket->save();
            }

            // Create vehicles
            if ($request->vehicle_count > 0) {
                foreach ($request->vehicles as $vehicleData) {
                    $vehicle = new Vehicle([
                        'booking_id' => $booking->id,
                        'user_id' => $user->id,
                        'type' => $vehicleData['type'],
                        'license_plate' => $vehicleData['license_plate'],
                        'brand' => $vehicleData['brand'] ?? null,
                        'model' => $vehicleData['model'] ?? null,
                    ]);

                    $vehicle->save();
                }
            }

            // Update schedule date
            $scheduleDate->passenger_count += $request->passenger_count;
            $scheduleDate->motorcycle_count += $vehicleCounts['MOTORCYCLE'];
            $scheduleDate->car_count += $vehicleCounts['CAR'];
            $scheduleDate->bus_count += $vehicleCounts['BUS'];
            $scheduleDate->truck_count += $vehicleCounts['TRUCK'];
            $scheduleDate->save();

            // Create payment
            $payment = new Payment([
                'booking_id' => $booking->id,
                'amount' => $totalAmount,
                'payment_method' => $request->payment_method,
                'payment_channel' => $request->payment_channel,
                'status' => $request->payment_method === 'CASH' ? 'SUCCESS' : 'PENDING',
                'payment_date' => $request->payment_method === 'CASH' ? now() : null,
                'expiry_date' => $request->payment_method === 'CASH' ? null : now()->addHours(24),
            ]);

            $payment->save();

            // Create booking log
            $bookingLog = new BookingLog([
                'booking_id' => $booking->id,
                'previous_status' => 'NEW',
                'new_status' => $booking->status,
                'changed_by_type' => 'ADMIN',
                'changed_by_id' => Auth::id(),
                'notes' => 'Booking dibuat oleh admin',
                'ip_address' => $request->ip(),
            ]);

            $bookingLog->save();

            // Update user stats
            $user->total_bookings += 1;
            $user->last_booking_date = now();
            $user->save();

            DB::commit();

            return redirect()->route('admin.bookings.show', $booking->id)
                ->with('success', 'Booking berhasil dibuat');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Terjadi kesalahan saat membuat booking: ' . $e->getMessage()]);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $request->validate([
            'status' => 'required|in:PENDING,CONFIRMED,CANCELLED,COMPLETED,REFUNDED,RESCHEDULED',
            'cancellation_reason' => 'required_if:status,CANCELLED',
        ]);

        $previousStatus = $booking->status;

        // Validate status transition
        $allowedTransitions = [
            'PENDING' => ['CONFIRMED', 'CANCELLED'],
            'CONFIRMED' => ['COMPLETED', 'CANCELLED'],
            'CANCELLED' => ['REFUNDED'],
            'COMPLETED' => ['REFUNDED'],
        ];

        if (!isset($allowedTransitions[$booking->status]) || !in_array($request->status, $allowedTransitions[$booking->status])) {
            return redirect()->back()
                ->withErrors(['status' => 'Perubahan status tidak diizinkan']);
        }

        try {
            DB::beginTransaction();

            $booking->status = $request->status;

            if ($request->status === 'CANCELLED') {
                $booking->cancellation_reason = $request->cancellation_reason;

                // Update ticket status
                Ticket::where('booking_id', $booking->id)
                    ->update(['status' => 'CANCELLED']);

                // Free up space in schedule date
                $scheduleDate = ScheduleDate::where('schedule_id', $booking->schedule_id)
                    ->where('date', $booking->booking_date)
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
            } elseif ($request->status === 'COMPLETED') {
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
                'notes' => $request->notes ?? 'Status diubah oleh admin',
                'ip_address' => $request->ip(),
            ]);

            $bookingLog->save();

            // Update payment status if needed
            if ($request->status === 'CONFIRMED' && $previousStatus === 'PENDING') {
                $payment = Payment::where('booking_id', $booking->id)
                    ->where('status', 'PENDING')
                    ->first();

                if ($payment) {
                    $payment->status = 'SUCCESS';
                    $payment->payment_date = now();
                    $payment->save();
                }
            } elseif ($request->status === 'CANCELLED') {
                $payment = Payment::where('booking_id', $booking->id)
                    ->where('status', 'PENDING')
                    ->first();

                if ($payment) {
                    $payment->status = 'FAILED';
                    $payment->save();
                }
            }

            DB::commit();

            return redirect()->route('admin.bookings.show', $id)
                ->with('success', 'Status booking berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat mengubah status booking: ' . $e->getMessage()]);
        }
    }
}
