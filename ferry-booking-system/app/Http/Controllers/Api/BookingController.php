<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use App\Models\Ticket;
use App\Models\Vehicle;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $bookings = Booking::where('user_id', $user->id)
            ->with(['schedule.route', 'schedule.ferry', 'payments'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar booking berhasil diambil',
            'data' => $bookings
        ], 200);
    }

    public function show($id)
    {
        $user = request()->user();
        $booking = Booking::where('id', $id)
            ->where('user_id', $user->id)
            ->with([
                'schedule.route',
                'schedule.ferry',
                'payments',
                'tickets',
                'vehicles'
            ])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'Detail booking berhasil diambil',
            'data' => $booking
        ], 200);
    }

    public function store(Request $request)
    {
        // Logging informasi awal
        Log::info('Booking store request received', [
            'user_id' => $request->user()->id,
            'schedule_id' => $request->schedule_id,
            'booking_date' => $request->booking_date,
        ]);

        // FIX: Perbaikan aturan validasi untuk field vehicles dan passengers
        $validator = Validator::make($request->all(), [
            'schedule_id' => 'required|exists:schedules,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'passenger_count' => 'required|integer|min:1',
            'vehicle_count' => 'required|integer|min:0',
            // Hanya memerlukan vehicles jika vehicle_count > 0
            'vehicles' => 'array|nullable',
            'vehicles.*.type' => 'required_with:vehicles|in:MOTORCYCLE,CAR,BUS,TRUCK',
            'vehicles.*.license_plate' => 'required_with:vehicles|string|max:20',
            'passengers' => 'required|array|min:1',
            'passengers.*.name' => 'required|string|max:191',
            'passengers.*.id_number' => 'nullable|string|max:30', // PERUBAHAN: required -> nullable
            'passengers.*.id_type' => 'required|in:KTP,SIM,PASPOR',
            'passenger_categories' => 'nullable|array', // TAMBAHAN: validasi untuk passenger_categories
            'passenger_categories.adult' => 'nullable|integer|min:0',
            'passenger_categories.child' => 'nullable|integer|min:0',
            'passenger_categories.infant' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            Log::warning('Booking validation failed', [
                'errors' => $validator->errors()->toArray()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Cek ketersediaan jadwal
        $schedule = Schedule::findOrFail($request->schedule_id);
        $bookingDate = $request->booking_date;

        Log::info('Checking schedule availability', [
            'schedule_id' => $schedule->id,
            'route_id' => $schedule->route_id,
            'booking_date' => $bookingDate
        ]);

        // Cek apakah jadwal tersedia untuk tanggal tersebut
        $dayOfWeek = date('N', strtotime($bookingDate)); // 1-7 for Monday-Sunday
        if (!in_array($dayOfWeek, explode(',', $schedule->days))) {
            Log::warning('Schedule not available for selected day', [
                'schedule_id' => $schedule->id,
                'booking_date' => $bookingDate,
                'day_of_week' => $dayOfWeek,
                'available_days' => $schedule->days
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak tersedia untuk tanggal yang dipilih'
            ], 400);
        }

        // Cek ketersediaan kursi
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

        Log::info('ScheduleDate record', [
            'id' => $scheduleDate->id,
            'schedule_id' => $scheduleDate->schedule_id,
            'date' => $scheduleDate->date,
            'status' => $scheduleDate->status,
            'passenger_count' => $scheduleDate->passenger_count,
            'is_new_record' => $scheduleDate->wasRecentlyCreated
        ]);

        if ($scheduleDate->status !== 'AVAILABLE') {
            Log::warning('Schedule date not available', [
                'schedule_date_id' => $scheduleDate->id,
                'status' => $scheduleDate->status,
                'reason' => $scheduleDate->status_reason
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak tersedia untuk tanggal yang dipilih'
            ], 400);
        }

        if ($scheduleDate->passenger_count + $request->passenger_count > $schedule->ferry->capacity_passenger) {
            Log::warning('Insufficient passenger capacity', [
                'current_count' => $scheduleDate->passenger_count,
                'requested' => $request->passenger_count,
                'capacity' => $schedule->ferry->capacity_passenger
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Maaf, kursi penumpang tidak mencukupi'
            ], 400);
        }

        // Hitung total kendaraan berdasarkan tipe
        $vehicleCounts = [
            'MOTORCYCLE' => 0,
            'CAR' => 0,
            'BUS' => 0,
            'TRUCK' => 0
        ];

        if ($request->vehicle_count > 0 && isset($request->vehicles)) {
            foreach ($request->vehicles as $vehicle) {
                $vehicleCounts[$vehicle['type']]++;
            }

            Log::info('Vehicle counts', $vehicleCounts);

            // Cek ketersediaan tiap jenis kendaraan
            if ($scheduleDate->motorcycle_count + $vehicleCounts['MOTORCYCLE'] > $schedule->ferry->capacity_vehicle_motorcycle) {
                Log::warning('Insufficient motorcycle capacity', [
                    'current' => $scheduleDate->motorcycle_count,
                    'requested' => $vehicleCounts['MOTORCYCLE'],
                    'capacity' => $schedule->ferry->capacity_vehicle_motorcycle
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, kapasitas motor tidak mencukupi'
                ], 400);
            }

            if ($scheduleDate->car_count + $vehicleCounts['CAR'] > $schedule->ferry->capacity_vehicle_car) {
                Log::warning('Insufficient car capacity', [
                    'current' => $scheduleDate->car_count,
                    'requested' => $vehicleCounts['CAR'],
                    'capacity' => $schedule->ferry->capacity_vehicle_car
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, kapasitas mobil tidak mencukupi'
                ], 400);
            }

            if ($scheduleDate->bus_count + $vehicleCounts['BUS'] > $schedule->ferry->capacity_vehicle_bus) {
                Log::warning('Insufficient bus capacity', [
                    'current' => $scheduleDate->bus_count,
                    'requested' => $vehicleCounts['BUS'],
                    'capacity' => $schedule->ferry->capacity_vehicle_bus
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, kapasitas bus tidak mencukupi'
                ], 400);
            }

            if ($scheduleDate->truck_count + $vehicleCounts['TRUCK'] > $schedule->ferry->capacity_vehicle_truck) {
                Log::warning('Insufficient truck capacity', [
                    'current' => $scheduleDate->truck_count,
                    'requested' => $vehicleCounts['TRUCK'],
                    'capacity' => $schedule->ferry->capacity_vehicle_truck
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, kapasitas truk tidak mencukupi'
                ], 400);
            }
        }

        // Hitung total harga
        $basePrice = $schedule->route->base_price * $request->passenger_count;
        $vehiclePrice = 0;

        if ($request->vehicle_count > 0 && isset($request->vehicles)) {
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

        Log::info('Pricing calculation', [
            'base_price' => $basePrice,
            'vehicle_price' => $vehiclePrice,
            'total_amount' => $totalAmount
        ]);

        // Mulai transaksi database
        try {
            DB::beginTransaction();

            // Buat booking
            $user = $request->user();
            $booking = new Booking([
                'booking_code' => 'FBS-' . strtoupper(Str::random(8)),
                'user_id' => $user->id,
                'schedule_id' => $request->schedule_id,
                'booking_date' => $request->booking_date,
                'passenger_count' => $request->passenger_count,
                'vehicle_count' => $request->vehicle_count,
                'total_amount' => $totalAmount,
                'status' => 'PENDING',
                'booked_by' => 'MOBILE_APP',
                'booking_channel' => 'MOBILE',
            ]);

            $booking->save();

            Log::info('Booking created', [
                'booking_id' => $booking->id,
                'booking_code' => $booking->booking_code
            ]);

            // Buat tiket untuk setiap penumpang
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

            Log::info('Tickets created', [
                'booking_id' => $booking->id,
                'ticket_count' => count($request->passengers)
            ]);

            // Buat entri kendaraan jika ada
            if ($request->vehicle_count > 0 && isset($request->vehicles)) {
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

                Log::info('Vehicles created', [
                    'booking_id' => $booking->id,
                    'vehicle_count' => count($request->vehicles)
                ]);
            }

            // Log data ScheduleDate sebelum diupdate
            Log::info('Before updating ScheduleDate', [
                'id' => $scheduleDate->id,
                'schedule_id' => $scheduleDate->schedule_id,
                'date' => $scheduleDate->date,
                'current_passenger_count' => $scheduleDate->passenger_count,
                'adding_passenger_count' => $request->passenger_count,
                'current_motorcycle_count' => $scheduleDate->motorcycle_count,
                'current_car_count' => $scheduleDate->car_count,
                'current_bus_count' => $scheduleDate->bus_count,
                'current_truck_count' => $scheduleDate->truck_count
            ]);

            // Update jumlah penumpang dan kendaraan di jadwal
            $scheduleDate->passenger_count += $request->passenger_count;
            $scheduleDate->motorcycle_count += $vehicleCounts['MOTORCYCLE'];
            $scheduleDate->car_count += $vehicleCounts['CAR'];
            $scheduleDate->bus_count += $vehicleCounts['BUS'];
            $scheduleDate->truck_count += $vehicleCounts['TRUCK'];
            $scheduleDate->save();

            // Log data ScheduleDate setelah diupdate
            Log::info('After updating ScheduleDate', [
                'id' => $scheduleDate->id,
                'schedule_id' => $scheduleDate->schedule_id,
                'date' => $scheduleDate->date,
                'new_passenger_count' => $scheduleDate->passenger_count,
                'new_motorcycle_count' => $scheduleDate->motorcycle_count,
                'new_car_count' => $scheduleDate->car_count,
                'new_bus_count' => $scheduleDate->bus_count,
                'new_truck_count' => $scheduleDate->truck_count
            ]);

            // Buat entri pembayaran
            $payment = new Payment([
                'booking_id' => $booking->id,
                'amount' => $totalAmount,
                'payment_method' => 'VIRTUAL_ACCOUNT',
                'payment_channel' => 'MIDTRANS',
                'status' => 'PENDING',
                'expiry_date' => now()->addHours(24),
            ]);

            $payment->save();

            // Buat Snap Token Midtrans
            // Buat Snap Token Midtrans
            $snapToken = $this->midtransService->createTransaction($booking);
            $payment->snap_token = $snapToken;  // Simpan sebagai snap_token
            // transaction_id akan diupdate setelah mendapat notifikasi dari Midtrans
            $payment->save();

            Log::info('Payment created', [
                'booking_id' => $booking->id,
                'payment_id' => $payment->id,
                'amount' => $totalAmount,
                'snap_token' => $snapToken
            ]);

            DB::commit();

            // Update jumlah booking user
            $user->total_bookings += 1;
            $user->last_booking_date = now();
            $user->save();

            Log::info('Booking process completed successfully', [
                'booking_id' => $booking->id,
                'booking_code' => $booking->booking_code
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking berhasil dibuat',
                'data' => [
                    'booking' => $booking->fresh(['tickets', 'vehicles', 'payments']),
                    'payment' => [
                        'snap_token' => $snapToken
                    ]
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error creating booking', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat membuat booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cancel($id)
    {
        $user = request()->user();
        $booking = Booking::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        Log::info('Cancellation request received', [
            'booking_id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'user_id' => $user->id,
            'current_status' => $booking->status
        ]);

        if (!in_array($booking->status, ['PENDING', 'CONFIRMED'])) {
            Log::warning('Cannot cancel booking with current status', [
                'booking_id' => $booking->id,
                'status' => $booking->status
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Booking tidak dapat dibatalkan'
            ], 400);
        }

        // Jika sudah dekat dengan tanggal keberangkatan (misal H-1), tolak pembatalan
        $bookingDate = \Carbon\Carbon::parse($booking->booking_date);
        $today = \Carbon\Carbon::today();
        $daysUntilDeparture = $today->diffInDays($bookingDate, false);

        Log::info('Checking cancellation window', [
            'booking_date' => $booking->booking_date,
            'days_until_departure' => $daysUntilDeparture
        ]);

        if ($daysUntilDeparture < 1) {
            Log::warning('Cancellation window closed', [
                'booking_id' => $booking->id,
                'days_until_departure' => $daysUntilDeparture
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Pembatalan hanya dapat dilakukan maksimal H-1 sebelum keberangkatan'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Update status booking
            $booking->status = 'CANCELLED';
            $booking->cancellation_reason = 'Dibatalkan oleh penumpang';
            $booking->save();

            Log::info('Booking status updated to CANCELLED', [
                'booking_id' => $booking->id
            ]);

            // Update status tiket
            Ticket::where('booking_id', $booking->id)
                ->update(['status' => 'CANCELLED']);

            Log::info('Tickets status updated to CANCELLED', [
                'booking_id' => $booking->id
            ]);

            // Update ketersediaan tempat di jadwal
            $scheduleDate = ScheduleDate::where('schedule_id', $booking->schedule_id)
                ->where('date', $booking->booking_date)
                ->first();

            if ($scheduleDate) {
                Log::info('Before updating ScheduleDate for cancellation', [
                    'id' => $scheduleDate->id,
                    'schedule_id' => $scheduleDate->schedule_id,
                    'date' => $scheduleDate->date,
                    'current_passenger_count' => $scheduleDate->passenger_count,
                    'reducing_passenger_count' => $booking->passenger_count
                ]);

                $scheduleDate->passenger_count -= $booking->passenger_count;

                // Kurangi jumlah kendaraan
                foreach ($booking->vehicles as $vehicle) {
                    switch ($vehicle->type) {
                        case 'MOTORCYCLE':
                            $scheduleDate->motorcycle_count -= 1;
                            break;
                        case 'CAR':
                            $scheduleDate->car_count -= 1;
                            break;
                        case 'BUS':
                            $scheduleDate->bus_count -= 1;
                            break;
                        case 'TRUCK':
                            $scheduleDate->truck_count -= 1;
                            break;
                    }
                }

                $scheduleDate->save();

                Log::info('After updating ScheduleDate for cancellation', [
                    'id' => $scheduleDate->id,
                    'schedule_id' => $scheduleDate->schedule_id,
                    'date' => $scheduleDate->date,
                    'new_passenger_count' => $scheduleDate->passenger_count,
                    'new_motorcycle_count' => $scheduleDate->motorcycle_count,
                    'new_car_count' => $scheduleDate->car_count,
                    'new_bus_count' => $scheduleDate->bus_count,
                    'new_truck_count' => $scheduleDate->truck_count
                ]);
            } else {
                Log::warning('ScheduleDate not found for cancellation', [
                    'schedule_id' => $booking->schedule_id,
                    'booking_date' => $booking->booking_date
                ]);
            }

            // Update status pembayaran jika masih PENDING
            $payment = Payment::where('booking_id', $booking->id)
                ->where('status', 'PENDING')
                ->first();

            if ($payment) {
                $payment->status = 'FAILED';
                $payment->save();

                Log::info('Payment updated to FAILED', [
                    'payment_id' => $payment->id,
                    'booking_id' => $booking->id
                ]);
            }

            DB::commit();

            Log::info('Booking cancellation completed successfully', [
                'booking_id' => $booking->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking berhasil dibatalkan',
                'data' => $booking->fresh()
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error cancelling booking', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat membatalkan booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
