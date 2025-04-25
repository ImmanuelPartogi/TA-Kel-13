<?php

// app/Services/ScheduleService.php
namespace App\Services;

use App\Models\Schedule;
use App\Models\ScheduleDate;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ScheduleService
{
    /**
     * Update schedule status
     *
     * @param Schedule $schedule
     * @param string $newStatus
     * @param string|null $reason
     * @param Carbon|null $expiryDate
     * @return Schedule
     */
    public function updateScheduleStatus(Schedule $schedule, string $newStatus, ?string $reason = null, ?Carbon $expiryDate = null)
    {
        DB::beginTransaction();

        try {
            $schedule->status = $newStatus;
            $schedule->status_reason = $reason;
            $schedule->status_updated_at = Carbon::now();

            if ($expiryDate && in_array($newStatus, ['DELAYED', 'CANCELLED'])) {
                $schedule->status_expiry_date = $expiryDate;
            } else {
                $schedule->status_expiry_date = null;
            }

            $schedule->save();

            // Update schedule dates status based on new schedule status
            if (in_array($newStatus, ['CANCELLED', 'DELAYED'])) {
                $statusMap = [
                    'CANCELLED' => 'CANCELLED',
                    'DELAYED' => 'UNAVAILABLE',
                ];

                $minDate = Carbon::today();
                $maxDate = null;

                if ($expiryDate) {
                    $maxDate = $expiryDate;
                }

                $query = ScheduleDate::where('schedule_id', $schedule->id)
                    ->where('date', '>=', $minDate->format('Y-m-d'));

                if ($maxDate) {
                    $query->where('date', '<=', $maxDate->format('Y-m-d'));
                }

                $query->update([
                    'status' => $statusMap[$newStatus],
                    'status_reason' => $reason,
                    'modified_by_schedule' => true,
                ]);
            }

            DB::commit();

            return $schedule->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update schedule date status
     *
     * @param ScheduleDate $scheduleDate
     * @param string $newStatus
     * @param string|null $reason
     * @param Carbon|null $expiryDate
     * @return ScheduleDate
     */
    public function updateScheduleDateStatus(ScheduleDate $scheduleDate, string $newStatus, ?string $reason = null, ?Carbon $expiryDate = null)
    {
        $scheduleDate->status = $newStatus;
        $scheduleDate->status_reason = $reason;
        $scheduleDate->modified_by_schedule = false;

        if ($expiryDate && $newStatus === 'WEATHER_ISSUE') {
            $scheduleDate->status_expiry_date = $expiryDate;
        } else {
            $scheduleDate->status_expiry_date = null;
        }

        $scheduleDate->save();

        return $scheduleDate;
    }

    /**
     * Generate schedule dates for a given period
     *
     * @param Schedule $schedule
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    public function generateScheduleDates(Schedule $schedule, Carbon $startDate, Carbon $endDate)
    {
        $days = explode(',', $schedule->days);
        $currentDate = $startDate->copy();
        $createdDates = [];

        while ($currentDate->lte($endDate)) {
            $dayOfWeek = $currentDate->dayOfWeek + 1; // Convert to 1-7 (Monday-Sunday)

            if (in_array($dayOfWeek, $days)) {
                $scheduleDate = ScheduleDate::firstOrCreate(
                    [
                        'schedule_id' => $schedule->id,
                        'date' => $currentDate->format('Y-m-d'),
                    ],
                    [
                        'passenger_count' => 0,
                        'motorcycle_count' => 0,
                        'car_count' => 0,
                        'bus_count' => 0,
                        'truck_count' => 0,
                        'status' => 'AVAILABLE',
                    ]
                );

                $createdDates[] = $scheduleDate;
            }

            $currentDate->addDay();
        }

        return $createdDates;
    }

    /**
     * Check schedule availability for a given date
     *
     * @param Schedule $schedule
     * @param Carbon $date
     * @return array
     */
    public function checkScheduleAvailability(Schedule $schedule, Carbon $date)
    {
        // Check if schedule runs on this day of week
        $dayOfWeek = $date->dayOfWeek + 1; // Convert to 1-7 (Monday-Sunday)
        $days = explode(',', $schedule->days);

        if (!in_array($dayOfWeek, $days)) {
            Log::info('Schedule not available for day of week', [
                'schedule_id' => $schedule->id,
                'day_requested' => $dayOfWeek,
                'available_days' => $schedule->days
            ]);

            return [
                'available' => false,
                'reason' => 'Jadwal tidak tersedia untuk hari ini',
                'scheduleDate' => null,
            ];
        }

        // Cek apakah schedule date sudah ada
        $scheduleDate = ScheduleDate::where('schedule_id', $schedule->id)
            ->where('date', $date->format('Y-m-d'))
            ->first();

        // PERBAIKAN: Buat ScheduleDate jika belum ada untuk konsistensi dengan ScheduleController
        if (!$scheduleDate) {
            Log::info('Creating new ScheduleDate for consistency', [
                'schedule_id' => $schedule->id,
                'date' => $date->format('Y-m-d')
            ]);

            $scheduleDate = ScheduleDate::create([
                'schedule_id' => $schedule->id,
                'date' => $date->format('Y-m-d'),
                'passenger_count' => 0,
                'motorcycle_count' => 0,
                'car_count' => 0,
                'bus_count' => 0,
                'truck_count' => 0,
                'status' => 'AVAILABLE',
            ]);
        }

        // Periksa status jadwal
        if ($scheduleDate->status !== 'AVAILABLE') {
            return [
                'available' => false,
                'reason' => $scheduleDate->status_reason ?? 'Jadwal tidak tersedia',
                'scheduleDate' => $scheduleDate,
            ];
        }

        // Calculate available capacity
        $availablePassenger = $schedule->ferry->capacity_passenger - $scheduleDate->passenger_count;
        $availableMotorcycle = $schedule->ferry->capacity_vehicle_motorcycle - $scheduleDate->motorcycle_count;
        $availableCar = $schedule->ferry->capacity_vehicle_car - $scheduleDate->car_count;
        $availableBus = $schedule->ferry->capacity_vehicle_bus - $scheduleDate->bus_count;
        $availableTruck = $schedule->ferry->capacity_vehicle_truck - $scheduleDate->truck_count;

        return [
            'available' => true,
            'scheduleDate' => $scheduleDate,
            'availability' => [
                'passenger' => $availablePassenger,
                'motorcycle' => $availableMotorcycle,
                'car' => $availableCar,
                'bus' => $availableBus,
                'truck' => $availableTruck,
            ],
        ];
    }
}
