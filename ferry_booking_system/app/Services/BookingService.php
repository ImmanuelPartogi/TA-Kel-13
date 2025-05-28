<?php

// app/Services/BookingService.php
namespace App\Services;

use App\Models\Booking;
use App\Models\BookingLog;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingService
{
    /**
     * Create a new booking
     *
     * @param array $data
     * @param User $user
     * @param string $bookingSource
     * @return Booking
     */
    public function createBooking(array $data, User $user, string $bookingSource = 'MOBILE_APP')
    {
        // Get schedule
        $schedule = Schedule::with(['route', 'ferry'])->findOrFail($data['schedule_id']);
        $bookingDate = $data['booking_date'];

        // Verify schedule is available for the date
        $dayOfWeek = date('N', strtotime($bookingDate)); // 1-7 for Monday-Sunday
        if (!in_array($dayOfWeek, explode(',', $schedule->days))) {
            throw new \Exception('Jadwal tidak tersedia untuk tanggal yang dipilih');
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
            throw new \Exception('Jadwal tidak tersedia untuk tanggal yang dipilih');
        }

        if ($scheduleDate->passenger_count + $data['passenger_count'] > $schedule->ferry->capacity_passenger) {
            throw new \Exception('Maaf, kursi penumpang tidak mencukupi');
        }

        // Count vehicles by type
        $vehicleCounts = [
            'MOTORCYCLE' => 0,
            'CAR' => 0,
            'BUS' => 0,
            'TRUCK' => 0
        ];

        if (isset($data['vehicles']) && count($data['vehicles']) > 0) {
            foreach ($data['vehicles'] as $vehicle) {
                $vehicleCounts[$vehicle['type']]++;
            }

            // Check availability for each vehicle type
            if ($scheduleDate->motorcycle_count + $vehicleCounts['MOTORCYCLE'] > $schedule->ferry->capacity_vehicle_motorcycle) {
                throw new \Exception('Maaf, kapasitas motor tidak mencukupi');
            }

            if ($scheduleDate->car_count + $vehicleCounts['CAR'] > $schedule->ferry->capacity_vehicle_car) {
                throw new \Exception('Maaf, kapasitas mobil tidak mencukupi');
            }

            if ($scheduleDate->bus_count + $vehicleCounts['BUS'] > $schedule->ferry->capacity_vehicle_bus) {
                throw new \Exception('Maaf, kapasitas bus tidak mencukupi');
            }

            if ($scheduleDate->truck_count + $vehicleCounts['TRUCK'] > $schedule->ferry->capacity_vehicle_truck) {
                throw new \Exception('Maaf, kapasitas truk tidak mencukupi');
            }
        }

        // Calculate total price
        $basePrice = $schedule->route->base_price * $data['passenger_count'];
        $vehiclePrice = 0;

        if (isset($data['vehicles']) && count($data['vehicles']) > 0) {
            foreach ($data['vehicles'] as $vehicle) {
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
        DB::beginTransaction();

        try {
            // Create booking
            $booking = new Booking([
                'booking_code' => 'FBS-' . strtoupper(Str::random(8)),
                'user_id' => $user->id,
                'schedule_id' => $data['schedule_id'],
                'booking_date' => $data['booking_date'],
                'passenger_count' => $data['passenger_count'],
                'vehicle_count' => isset($data['vehicles']) ? count($data['vehicles']) : 0,
                'total_amount' => $totalAmount,
                'status' => 'PENDING',
                'booked_by' => $bookingSource,
                'booking_channel' => $bookingSource === 'COUNTER' ? 'ADMIN' : 'MOBILE',
                'notes' => $data['notes'] ?? null,
            ]);

            $booking->save();

            // Create tickets for each passenger
            if (isset($data['passengers']) && count($data['passengers']) > 0) {
                foreach ($data['passengers'] as $passenger) {
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
            }

            // Create vehicles
            if (isset($data['vehicles']) && count($data['vehicles']) > 0) {
                foreach ($data['vehicles'] as $vehicleData) {
                    $vehicle = new Vehicle([
                        'booking_id' => $booking->id,
                        'user_id' => $user->id,
                        'type' => $vehicleData['type'],
                        'vehicle_category_id' => $vehicleData['vehicle_category_id'], // Tambahkan ini
                        'license_plate' => $vehicleData['license_plate'],
                        'brand' => $vehicleData['brand'] ?? null,
                        'model' => $vehicleData['model'] ?? null,
                        'weight' => $vehicleData['weight'] ?? null,
                    ]);

                    $vehicle->save();
                }
            }

            // Update schedule date
            $scheduleDate->passenger_count += $data['passenger_count'];
            $scheduleDate->motorcycle_count += $vehicleCounts['MOTORCYCLE'];
            $scheduleDate->car_count += $vehicleCounts['CAR'];
            $scheduleDate->bus_count += $vehicleCounts['BUS'];
            $scheduleDate->truck_count += $vehicleCounts['TRUCK'];
            $scheduleDate->save();

            // Create booking log
            $bookingLog = new BookingLog([
                'booking_id' => $booking->id,
                'previous_status' => 'NEW',
                'new_status' => $booking->status,
                'changed_by_type' => $bookingSource === 'COUNTER' ? 'ADMIN' : 'USER',
                'changed_by_id' => $user->id,
                'notes' => 'Booking dibuat',
                'ip_address' => request()->ip(),
            ]);

            $bookingLog->save();

            // Update user stats
            $user->total_bookings += 1;
            $user->last_booking_date = now();
            $user->save();

            DB::commit();

            return $booking->fresh(['tickets', 'vehicles']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Cancel a booking
     *
     * @param Booking $booking
     * @param string $reason
     * @param string $cancelledBy
     * @param int|null $userId
     * @return Booking
     */
    public function cancelBooking(Booking $booking, string $reason, string $cancelledBy = 'USER', ?int $userId = null)
    {
        if (!in_array($booking->status, ['PENDING', 'CONFIRMED'])) {
            throw new \Exception('Booking tidak dapat dibatalkan');
        }

        // If too close to departure date (e.g. less than 1 day), reject cancellation
        $bookingDate = Carbon::parse($booking->booking_date);
        $today = Carbon::today();
        $daysUntilDeparture = $today->diffInDays($bookingDate, false);

        if ($daysUntilDeparture < 1) {
            throw new \Exception('Pembatalan hanya dapat dilakukan maksimal H-1 sebelum keberangkatan');
        }

        DB::beginTransaction();

        try {
            $previousStatus = $booking->status;

            // Update booking status
            $booking->status = 'CANCELLED';
            $booking->cancellation_reason = $reason;
            $booking->save();

            // Update ticket status
            Ticket::where('booking_id', $booking->id)
                ->update(['status' => 'CANCELLED']);

            // Update schedule availability
            $scheduleDate = ScheduleDate::where('schedule_id', $booking->schedule_id)
                ->where('date', $booking->booking_date)
                ->first();

            if ($scheduleDate) {
                $scheduleDate->passenger_count -= $booking->passenger_count;

                // Reduce vehicle counts
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

            // Create booking log
            $bookingLog = new BookingLog([
                'booking_id' => $booking->id,
                'previous_status' => $previousStatus,
                'new_status' => 'CANCELLED',
                'changed_by_type' => $cancelledBy,
                'changed_by_id' => $userId,
                'notes' => 'Booking dibatalkan: ' . $reason,
                'ip_address' => request()->ip(),
            ]);

            $bookingLog->save();

            DB::commit();

            return $booking->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update booking status
     *
     * @param Booking $booking
     * @param string $newStatus
     * @param array $additionalData
     * @param string $changedBy
     * @param int|null $changedById
     * @return Booking
     */
    public function updateBookingStatus(Booking $booking, string $newStatus, array $additionalData = [], string $changedBy = 'SYSTEM', ?int $changedById = null)
    {
        // Validate status transition
        $allowedTransitions = [
            'PENDING' => ['CONFIRMED', 'CANCELLED'],
            'CONFIRMED' => ['COMPLETED', 'CANCELLED'],
            'COMPLETED' => ['REFUNDED'],
            'CANCELLED' => ['REFUNDED'],
        ];

        if (!isset($allowedTransitions[$booking->status]) || !in_array($newStatus, $allowedTransitions[$booking->status])) {
            throw new \Exception('Perubahan status tidak diizinkan');
        }

        DB::beginTransaction();

        try {
            $previousStatus = $booking->status;

            // Update booking status
            $booking->status = $newStatus;

            if ($newStatus === 'CANCELLED' && isset($additionalData['cancellation_reason'])) {
                $booking->cancellation_reason = $additionalData['cancellation_reason'];
            }

            $booking->save();

            // Update tickets
            if ($newStatus === 'CANCELLED') {
                Ticket::where('booking_id', $booking->id)
                    ->update(['status' => 'CANCELLED']);

                // Update schedule availability
                $scheduleDate = ScheduleDate::where('schedule_id', $booking->schedule_id)
                    ->where('date', $booking->booking_date)
                    ->first();

                if ($scheduleDate) {
                    $scheduleDate->passenger_count -= $booking->passenger_count;

                    // Reduce vehicle counts
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
            } elseif ($newStatus === 'COMPLETED') {
                Ticket::where('booking_id', $booking->id)
                    ->update(['status' => 'USED']);
            }

            // Create booking log
            $notes = $additionalData['notes'] ?? 'Status diubah menjadi ' . $newStatus;

            $bookingLog = new BookingLog([
                'booking_id' => $booking->id,
                'previous_status' => $previousStatus,
                'new_status' => $newStatus,
                'changed_by_type' => $changedBy,
                'changed_by_id' => $changedById,
                'notes' => $notes,
                'ip_address' => request()->ip(),
                'device_info' => $additionalData['device_info'] ?? null,
                'location' => $additionalData['location'] ?? null,
            ]);

            $bookingLog->save();

            DB::commit();

            return $booking->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function validateDepartureDate($scheduleId, $bookingDate)
    {
        $schedule = Schedule::findOrFail($scheduleId);
        $today = Carbon::today();
        $dateToCheck = Carbon::parse($bookingDate);

        // Jika tanggal di masa lalu, tolak
        if ($dateToCheck->isBefore($today)) {
            throw new \Exception('Tanggal keberangkatan tidak boleh di masa lalu');
        }

        // Jika hari ini, pastikan jam keberangkatan belum lewat
        if ($dateToCheck->isSameDay($today)) {
            $departureTime = Carbon::parse($bookingDate . ' ' . $schedule->departure_time);
            if ($departureTime->isPast()) {
                throw new \Exception('Waktu keberangkatan sudah lewat');
            }
        }

        return true;
    }
}
