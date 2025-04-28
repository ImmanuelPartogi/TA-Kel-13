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
            $requestDate = $request->date;
            $currentTime = Carbon::now('Asia/Jakarta');

            // PERBAIKAN: Parsing tanggal dengan lebih jelas
            if ($requestDate) {
                if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $requestDate)) {
                    $date = Carbon::createFromFormat('Y-m-d', $requestDate, 'Asia/Jakarta');
                } else {
                    // Jika format bukan Y-m-d, coba parse dengan lebih fleksibel
                    $date = Carbon::parse($requestDate)->setTimezone('Asia/Jakarta');
                }
            } else {
                $date = Carbon::today('Asia/Jakarta');
            }

            // Hitung hari dalam minggu
            $dayOfWeek = $date->dayOfWeek + 1; // Konversi ke format 1-7 (Senin-Minggu)

            // Logging untuk debugging
            Log::info('Mencari jadwal', [
                'request_date_raw' => $requestDate,
                'parsed_date' => $date->format('Y-m-d'),
                'day_of_week' => $dayOfWeek,
                'route_id' => $routeId,
                'timezone' => config('app.timezone'),
                'server_time' => Carbon::now()->format('Y-m-d H:i:s')
            ]);

            // PERBAIKAN: Cek jadwal berdasarkan hari dalam minggu terlebih dahulu
            $schedules = Schedule::where('route_id', $routeId)
                ->where('status', 'ACTIVE')
                ->whereRaw("FIND_IN_SET(?, days)", [$dayOfWeek])
                ->with(['ferry', 'route'])
                ->get();

            Log::info('Jadwal setelah filter hari', [
                'count' => $schedules->count(),
                'hari' => $dayOfWeek,
                'schedule_ids' => $schedules->pluck('id')->toArray()
            ]);

            // Jika tidak ada jadwal pada hari tersebut, return array kosong
            if ($schedules->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tidak ada jadwal tersedia untuk hari ini',
                    'data' => []
                ], 200);
            }

            $scheduleIds = $schedules->pluck('id');

            // PERBAIKAN: Cek terlebih dahulu apakah ada ScheduleDate untuk tanggal tersebut
            $scheduleDatesCount = ScheduleDate::whereIn('schedule_id', $scheduleIds)
                ->where('date', $date->format('Y-m-d'))
                ->count();

            Log::info('Schedule dates count before processing', [
                'date' => $date->format('Y-m-d'),
                'count' => $scheduleDatesCount
            ]);

            // PERBAIKAN: Auto-create ScheduleDate jika belum ada
            if ($scheduleDatesCount === 0) {
                Log::info('Tidak ada ScheduleDate, tanggal tidak tersedia', [
                    'schedule_ids' => $scheduleIds->toArray(),
                    'date' => $date->format('Y-m-d')
                ]);

                // SOLUSI UTAMA: JANGAN membuat jadwal secara otomatis
                // Kembalikan array kosong jika tidak ada jadwal
                return response()->json([
                    'success' => true,
                    'message' => 'Tidak ada jadwal tersedia untuk tanggal ini',
                    'data' => []
                ], 200);
            }

            // Ambil ScheduleDate setelah mungkin dibuat
            $scheduleDates = ScheduleDate::whereIn('schedule_id', $scheduleIds)
                ->where('date', $date->format('Y-m-d'))
                ->get()
                ->keyBy('schedule_id');

            Log::info('Schedule dates berhasil diambil', [
                'count' => $scheduleDates->count(),
                'schedule_date_ids' => $scheduleDates->pluck('id')->toArray(),
                'date' => $date->format('Y-m-d')
            ]);

            $result = $schedules->map(function ($schedule) use ($scheduleDates, $date) {
                $scheduleDate = $scheduleDates->get($schedule->id);

                if (!$scheduleDate) {
                    Log::info('Schedule date tidak ditemukan untuk jadwal', [
                        'schedule_id' => $schedule->id,
                        'date' => $date->format('Y-m-d')
                    ]);

                    // Isi dengan data dummy
                    $schedule->available_passenger = 0;
                    $schedule->available_motorcycle = 0;
                    $schedule->available_car = 0;
                    $schedule->available_bus = 0;
                    $schedule->available_truck = 0;
                    $schedule->schedule_date_status = 'NOT_AVAILABLE';

                    return $schedule;
                }

                // Process with real schedule date
                $schedule->available_passenger = $schedule->ferry->capacity_passenger - $scheduleDate->passenger_count;
                $schedule->available_motorcycle = $schedule->ferry->capacity_vehicle_motorcycle - $scheduleDate->motorcycle_count;
                $schedule->available_car = $schedule->ferry->capacity_vehicle_car - $scheduleDate->car_count;
                $schedule->available_bus = $schedule->ferry->capacity_vehicle_bus - $scheduleDate->bus_count;
                $schedule->available_truck = $schedule->ferry->capacity_vehicle_truck - $scheduleDate->truck_count;
                $schedule->schedule_date_status = $scheduleDate->status;

                Log::info('Schedule processed with data', [
                    'schedule_id' => $schedule->id,
                    'status' => $scheduleDate->status,
                    'available_passenger' => $schedule->available_passenger
                ]);

                return $schedule;
            });

            // Filter jadwal yang tersedia
            $availableSchedules = $result->filter(function ($schedule) use ($currentTime, $date) {
                // Periksa status jadwal
                $status = $schedule->schedule_date_status;
                $isAvailable = $status === 'AVAILABLE';

                if (!$isAvailable) {
                    return false;
                }

                // PERBAIKAN: Ekstrasi waktu dari departure_time jika sudah berisi tanggal
                $departureTime = $schedule->departure_time;
                if (strpos($departureTime, ' ') !== false) {
                    // Ambil bagian waktu saja jika formatnya "YYYY-MM-DD HH:MM:SS"
                    $parts = explode(' ', $departureTime);
                    $departureTime = end($parts);
                }

                // Gabungkan tanggal yang dipilih dengan waktu keberangkatan
                $departureDateTime = Carbon::parse($date->format('Y-m-d') . ' ' . $departureTime, 'Asia/Jakarta');

                // Untuk hari ini, filter berdasarkan waktu saat ini
                if ($date->isToday()) {
                    $isAfterCurrentTime = $departureDateTime->isAfter($currentTime);
                    return $isAfterCurrentTime;
                }

                // Untuk tanggal lain, jadwal tersedia
                return true;
            })->values();

            Log::info('Final available schedules', [
                'count' => $availableSchedules->count()
            ]);

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
