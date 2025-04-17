<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $routeId = $request->route_id;
        $date = $request->date ? Carbon::parse($request->date) : Carbon::today();
        $dayOfWeek = $date->dayOfWeek + 1; // Konversi ke format 1-7 (Senin-Minggu)

        $schedules = Schedule::where('route_id', $routeId)
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
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar jadwal berhasil diambil',
            'data' => $result
        ], 200);
    }

    public function show($id)
    {
        $schedule = Schedule::with(['ferry', 'route'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail jadwal berhasil diambil',
            'data' => $schedule
        ], 200);
    }
}
