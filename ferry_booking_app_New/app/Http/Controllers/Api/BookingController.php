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
        $validator = Validator::make($request->all(), [
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
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Cek ketersediaan jadwal
        $schedule = Schedule::findOrFail($request->schedule_id);
        $bookingDate = $request->booking_date;

        // Cek apakah jadwal tersedia untuk tanggal tersebut
        $dayOfWeek = date('N', strtotime($bookingDate)); // 1-7 for Monday-Sunday
        if (!in_array($dayOfWeek, explode(',', $schedule->days))) {
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

        if ($scheduleDate->status !== 'AVAILABLE') {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak tersedia untuk tanggal yang dipilih'
            ], 400);
        }

        if ($scheduleDate->passenger_count + $request->passenger_count > $schedule->ferry->capacity_passenger) {
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

        if ($request->vehicle_count > 0) {
            foreach ($request->vehicles as $vehicle) {
                $vehicleCounts[$vehicle['type']]++;
            }

            // Cek ketersediaan tiap jenis kendaraan
            if ($scheduleDate->motorcycle_count + $vehicleCounts['MOTORCYCLE'] > $schedule->ferry->capacity_vehicle_motorcycle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, kapasitas motor tidak mencukupi'
                ], 400);
            }

            if ($scheduleDate->car_count + $vehicleCounts['CAR'] > $schedule->ferry->capacity_vehicle_car) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, kapasitas mobil tidak mencukupi'
                ], 400);
            }

            if ($scheduleDate->bus_count + $vehicleCounts['BUS'] > $schedule->ferry->capacity_vehicle_bus) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, kapasitas bus tidak mencukupi'
                ], 400);
            }

            if ($scheduleDate->truck_count + $vehicleCounts['TRUCK'] > $schedule->ferry->capacity_vehicle_truck) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, kapasitas truk tidak mencukupi'
                ], 400);
            }
        }

        // Hitung total harga
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

            // Buat entri kendaraan
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

            // Update jumlah penumpang dan kendaraan di jadwal
            $scheduleDate->passenger_count += $request->passenger_count;
            $scheduleDate->motorcycle_count += $vehicleCounts['MOTORCYCLE'];
            $scheduleDate->car_count += $vehicleCounts['CAR'];
            $scheduleDate->bus_count += $vehicleCounts['BUS'];
            $scheduleDate->truck_count += $vehicleCounts['TRUCK'];
            $scheduleDate->save();

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
            $snapToken = $this->midtransService->createTransaction($booking);
            $payment->transaction_id = $snapToken;
            $payment->save();

            DB::commit();

            // Update jumlah booking user
            $user->total_bookings += 1;
            $user->last_booking_date = now();
            $user->save();

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

        if (!in_array($booking->status, ['PENDING', 'CONFIRMED'])) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak dapat dibatalkan'
            ], 400);
        }

        // Jika sudah dekat dengan tanggal keberangkatan (misal H-1), tolak pembatalan
        $bookingDate = \Carbon\Carbon::parse($booking->booking_date);
        $today = \Carbon\Carbon::today();
        $daysUntilDeparture = $today->diffInDays($bookingDate, false);

        if ($daysUntilDeparture < 1) {
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

            // Update status tiket
            Ticket::where('booking_id', $booking->id)
                ->update(['status' => 'CANCELLED']);

            // Update ketersediaan tempat di jadwal
            $scheduleDate = ScheduleDate::where('schedule_id', $booking->schedule_id)
                ->where('date', $booking->booking_date)
                ->first();

            if ($scheduleDate) {
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
            }

            // Update status pembayaran jika masih PENDING
            $payment = Payment::where('booking_id', $booking->id)
                ->where('status', 'PENDING')
                ->first();

            if ($payment) {
                $payment->status = 'FAILED';
                $payment->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Booking berhasil dibatalkan',
                'data' => $booking->fresh()
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat membatalkan booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
