<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        try {
            $routeId = $request->route_id;
            $date = $request->date ? Carbon::parse($request->date) : Carbon::today();
            $dayOfWeek = $date->dayOfWeek + 1; // Konversi ke format 1-7 (Senin-Minggu)
            $currentTime = Carbon::now(); // Ambil waktu sekarang

            Log::info('Mencari jadwal', [
                'route_id' => $routeId,
                'date' => $date->format('Y-m-d'),
                'day_of_week' => $dayOfWeek,
                'current_time' => $currentTime->format('H:i:s')
            ]);

            $schedules = Schedule::where('route_id', $routeId)
                ->where('status', 'ACTIVE')
                ->whereRaw("FIND_IN_SET('$dayOfWeek', days)")
                ->with(['ferry', 'route'])
                ->get();

            $scheduleIds = $schedules->pluck('id');

            // PERUBAHAN PENTING: Hanya ambil yang sudah ada, JANGAN membuat baru
            $scheduleDates = ScheduleDate::whereIn('schedule_id', $scheduleIds)
                ->where('date', $date->format('Y-m-d'))
                ->get()
                ->keyBy('schedule_id');

            Log::info('Schedule dates ditemukan', ['count' => $scheduleDates->count()]);

            $result = $schedules->map(function ($schedule) use ($scheduleDates, $date) {
                $scheduleDate = $scheduleDates->get($schedule->id);

                // PERUBAHAN PENTING: Jika tidak ada schedule_date, tandai sebagai NOT_AVAILABLE
                if (!$scheduleDate) {
                    Log::info('Schedule date tidak ditemukan untuk jadwal', [
                        'schedule_id' => $schedule->id
                    ]);

                    // Isi dengan data dummy tapi tidak simpan ke database
                    $schedule->available_passenger = 0;
                    $schedule->available_motorcycle = 0;
                    $schedule->available_car = 0;
                    $schedule->available_bus = 0;
                    $schedule->available_truck = 0;
                    $schedule->schedule_date_status = 'NOT_AVAILABLE';

                    return $schedule;
                }

                // Jika ada, proses seperti biasa
                $schedule->available_passenger = $schedule->ferry->capacity_passenger - $scheduleDate->passenger_count;
                $schedule->available_motorcycle = $schedule->ferry->capacity_vehicle_motorcycle - $scheduleDate->motorcycle_count;
                $schedule->available_car = $schedule->ferry->capacity_vehicle_car - $scheduleDate->car_count;
                $schedule->available_bus = $schedule->ferry->capacity_vehicle_bus - $scheduleDate->bus_count;
                $schedule->available_truck = $schedule->ferry->capacity_vehicle_truck - $scheduleDate->truck_count;
                $schedule->schedule_date_status = $scheduleDate->status;

                return $schedule;
            });

            // PERUBAHAN PENTING: Filter jadwal yang tersedia DAN waktu keberangkatan belum lewat
            $currentTime = Carbon::now();
            $availableSchedules = $result->filter(function ($schedule) use ($currentTime, $date) {
                // Pastikan jadwal tersedia
                if ($schedule->schedule_date_status !== 'AVAILABLE') {
                    return false;
                }

                // Cek waktu keberangkatan untuk hari ini
                if ($date->isToday()) {
                    $departureDateTime = Carbon::parse($date->format('Y-m-d') . ' ' . $schedule->departure_time);

                    // Log untuk debugging
                    Log::info('Cek waktu keberangkatan', [
                        'schedule_id' => $schedule->id,
                        'departure_time' => $schedule->departure_time,
                        'departure_datetime' => $departureDateTime->format('Y-m-d H:i:s'),
                        'current_time' => $currentTime->format('Y-m-d H:i:s'),
                        'is_after' => $departureDateTime->isAfter($currentTime)
                    ]);

                    // Jadwal hanya ditampilkan jika waktu keberangkatan belum lewat
                    return $departureDateTime->isAfter($currentTime);
                }

                // Untuk tanggal di masa depan, tampilkan semua jadwal yang tersedia
                return true;
            })->values();

            return response()->json([
                'success' => true,
                'message' => 'Daftar jadwal berhasil diambil',
                'data' => $availableSchedules
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error mengambil jadwal', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil jadwal',
                'error' => $e->getMessage()
            ], 500);
        }
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
