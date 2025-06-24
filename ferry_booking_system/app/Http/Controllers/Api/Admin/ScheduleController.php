<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ferry;
use App\Models\Route;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        // Perform regular maintenance checks
        $this->checkExpiredSchedules();
        $this->checkExpiredStatuses();

        // Start with base query including related models
        $query = Schedule::with(['route', 'ferry']);

        // Advanced filtering with more comprehensive approach
        $filters = $request->only([
            'route_id',
            'ferry_id',
            'status',
            'date_from',
            'date_to',
            'departure_time_from',
            'departure_time_to'
        ]);

        // Apply filters dynamically
        foreach ($filters as $key => $value) {
            if ($value === null) continue;

            switch ($key) {
                case 'route_id':
                    $query->where('route_id', $value);
                    break;
                case 'ferry_id':
                    $query->where('ferry_id', $value);
                    break;
                case 'status':
                    $query->where('status', $value);
                    break;
                case 'date_from':
                    $query->whereDate('schedule_date', '>=', $value);
                    break;
                case 'date_to':
                    $query->whereDate('schedule_date', '<=', $value);
                    break;
                case 'departure_time_from':
                    $query->whereTime('departure_time', '>=', $value);
                    break;
                case 'departure_time_to':
                    $query->whereTime('departure_time', '<=', $value);
                    break;
            }
        }

        // Optional: Add sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // Pagination with configurable per page
        $perPage = $request->input('per_page', 10);
        $schedules = $query->paginate($perPage);

        // Fetch active routes and ferries
        $routes = Route::where('status', 'ACTIVE')->get();
        $ferries = Ferry::where('status', 'ACTIVE')->get();

        // Logging for debugging (consider removing in production)
        Log::info('Schedules Query', [
            'total_schedules' => $schedules->total(),
            'current_page' => $schedules->currentPage(),
            'filters' => $filters
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'schedules' => $schedules,
                'routes' => $routes,
                'ferries' => $ferries,
                'filters' => $filters
            ]
        ]);
    }

    public function show($id)
    {
        $schedule = Schedule::with(['route', 'ferry'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $schedule
        ]);
    }

    public function store(Request $request)
    {
        // Validasi input dasar
        $validated = $request->validate([
            'route_id' => 'required|exists:routes,id',
            'ferry_id' => 'required|exists:ferries,id',
            'departure_time' => 'required|date_format:H:i',
            'arrival_time' => 'required|date_format:H:i|after:departure_time',
            'days' => 'required|array|min:1',
            'days.*' => 'integer|between:1,7',
            'status' => 'required|in:ACTIVE,INACTIVE',
            'status_expiry_date' => 'nullable|date|after:now',
        ]);

        // 1. Validasi: Satu rute hanya boleh dilayani oleh satu kapal
        $existingRouteSchedule = Schedule::where('route_id', $request->route_id)
            ->where('ferry_id', '!=', $request->ferry_id)
            ->where('status', 'ACTIVE')
            ->first();

        if ($existingRouteSchedule) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rute ini sudah dilayani oleh kapal lain',
                'errors' => [
                    'route_id' => ['Rute ini sudah dilayani oleh kapal ' . Ferry::find($existingRouteSchedule->ferry_id)->name],
                    'ferry_id' => ['Setiap rute hanya boleh dilayani oleh satu kapal']
                ],
                'conflicting_schedule' => [
                    'id' => $existingRouteSchedule->id,
                    'ferry_id' => $existingRouteSchedule->ferry_id,
                    'ferry_name' => Ferry::find($existingRouteSchedule->ferry_id)->name
                ]
            ], 422);
        }

        // 2. Validasi konflik jadwal: jadwal tidak boleh tumpang tindih pada waktu dan hari yang sama
        $conflicts = $this->checkScheduleConflicts(
            $request->ferry_id,
            $request->days,
            $request->departure_time,
            $request->arrival_time
        );

        // Jika ditemukan konflik, kembalikan respons error
        if (!empty($conflicts)) {
            // Kumpulkan detail konflik untuk pesan error
            $conflictDetails = [];
            $conflictDays = [];

            foreach ($conflicts as $conflict) {
                $conflictDetails[] = 'ID ' . $conflict['schedule_id'] . ': ' .
                    'Hari ' . implode(', ', $conflict['overlapping_day_names']) . ' ' .
                    '(' . $conflict['conflict_description'] . ' - ' .
                    $conflict['departure_time'] . ' - ' . $conflict['arrival_time'] . ')';

                $conflictDays = array_merge($conflictDays, $conflict['overlapping_day_names']);
            }

            // Hapus duplikat hari konflik
            $conflictDays = array_unique($conflictDays);

            return response()->json([
                'status' => 'error',
                'message' => 'Jadwal bertabrakan dengan jadwal yang sudah ada',
                'errors' => [
                    'days' => ['Terjadi konflik pada hari: ' . implode(', ', $conflictDays)],
                    'departure_time' => ['Jadwal bertabrakan pada hari dan waktu yang sama dengan jadwal lain'],
                    'general' => array_merge(['Jadwal bertabrakan dengan jadwal yang sudah ada:'], $conflictDetails)
                ],
                'conflicting_schedules' => $conflicts
            ], 422);
        }

        // Jika tidak ada konflik, lanjutkan menyimpan jadwal
        $schedule = new Schedule([
            'route_id' => $request->route_id,
            'ferry_id' => $request->ferry_id,
            'departure_time' => $request->departure_time,
            'arrival_time' => $request->arrival_time,
            'days' => implode(',', $request->days),
            'status' => $request->status,
            'status_reason' => $request->status_reason,
        ]);

        // Log input data untuk debugging
        Log::info('Data input jadwal baru:', [
            'route_id' => $request->route_id,
            'ferry_id' => $request->ferry_id,
            'departure_time' => $request->departure_time,
            'arrival_time' => $request->arrival_time,
            'days' => $request->days,
            'status' => $request->status
        ]);

        $schedule->created_by = Auth::id();

        if ($request->status === 'INACTIVE') {
            $schedule->status_updated_at = Carbon::now();

            if ($request->has('status_expiry_date') && $request->status_expiry_date) {
                $schedule->status_expiry_date = Carbon::parse($request->status_expiry_date);
            }
        }

        $schedule->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Jadwal berhasil ditambahkan',
            'data' => $schedule
        ], 201);
    }

    public function update(Request $request, $id)
    {
        // Cari jadwal yang akan diupdate
        $schedule = Schedule::findOrFail($id);

        // Validasi input dasar
        $validated = $request->validate([
            'route_id' => 'required|exists:routes,id',
            'ferry_id' => 'required|exists:ferries,id',
            'departure_time' => 'required|date_format:H:i',
            'arrival_time' => 'required|date_format:H:i|after:departure_time',
            'days' => 'required|array|min:1',
            'days.*' => 'integer|between:1,7',
            'status' => 'required|in:ACTIVE,INACTIVE',
            'status_expiry_date' => 'nullable|date|after:now',
        ]);

        // 1. Validasi: Satu rute hanya boleh dilayani oleh satu kapal
        if ($schedule->route_id != $request->route_id || $schedule->ferry_id != $request->ferry_id) {
            $existingRouteSchedule = Schedule::where('route_id', $request->route_id)
                ->where('ferry_id', '!=', $request->ferry_id)
                ->where('id', '!=', $id)
                ->where('status', 'ACTIVE')
                ->first();

            if ($existingRouteSchedule) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Rute ini sudah dilayani oleh kapal lain',
                    'errors' => [
                        'route_id' => ['Rute ini sudah dilayani oleh kapal ' . Ferry::find($existingRouteSchedule->ferry_id)->name],
                        'ferry_id' => ['Setiap rute hanya boleh dilayani oleh satu kapal']
                    ],
                    'conflicting_schedule' => [
                        'id' => $existingRouteSchedule->id,
                        'ferry_id' => $existingRouteSchedule->ferry_id,
                        'ferry_name' => Ferry::find($existingRouteSchedule->ferry_id)->name
                    ]
                ], 422);
            }
        }

        // 2. Validasi konflik jadwal: jadwal tidak boleh tumpang tindih pada waktu dan hari yang sama
        $conflicts = $this->checkScheduleConflicts(
            $request->ferry_id,
            $request->days,
            $request->departure_time,
            $request->arrival_time,
            $id // Kecualikan jadwal yang sedang diupdate
        );

        // Jika ditemukan konflik, kembalikan respons error
        if (!empty($conflicts)) {
            // Kumpulkan detail konflik untuk pesan error
            $conflictDetails = [];
            $conflictDays = [];

            foreach ($conflicts as $conflict) {
                $conflictDetails[] = 'ID ' . $conflict['schedule_id'] . ': ' .
                    'Hari ' . implode(', ', $conflict['overlapping_day_names']) . ' ' .
                    '(' . $conflict['conflict_description'] . ' - ' .
                    $conflict['departure_time'] . ' - ' . $conflict['arrival_time'] . ')';

                $conflictDays = array_merge($conflictDays, $conflict['overlapping_day_names']);
            }

            // Hapus duplikat hari konflik
            $conflictDays = array_unique($conflictDays);

            return response()->json([
                'status' => 'error',
                'message' => 'Jadwal bertabrakan dengan jadwal yang sudah ada',
                'errors' => [
                    'days' => ['Terjadi konflik pada hari: ' . implode(', ', $conflictDays)],
                    'departure_time' => ['Jadwal bertabrakan pada hari dan waktu yang sama dengan jadwal lain'],
                    'general' => array_merge(['Jadwal bertabrakan dengan jadwal yang sudah ada:'], $conflictDetails)
                ],
                'conflicting_schedules' => $conflicts
            ], 422);
        }

        // Deteksi perubahan status
        $statusChanged = $schedule->status !== $request->status;

        // Update data jadwal
        $schedule->route_id = $request->route_id;
        $schedule->ferry_id = $request->ferry_id;
        $schedule->departure_time = $request->departure_time;
        $schedule->arrival_time = $request->arrival_time;
        $schedule->days = implode(',', $request->days);
        $schedule->status = $request->status;
        $schedule->status_reason = $request->status_reason;

        // Update waktu dan tanggal kedaluwarsa jika status berubah
        if ($statusChanged || $request->has('status_expiry_date')) {
            $schedule->status_updated_at = Carbon::now();

            if ($request->status === 'INACTIVE' && $request->has('status_expiry_date') && $request->status_expiry_date) {
                $schedule->status_expiry_date = Carbon::parse($request->status_expiry_date);
            } else {
                $schedule->status_expiry_date = null;
            }

            // Update status tanggal jadwal berdasarkan perubahan status jadwal
            if ($request->status === 'INACTIVE') {
                ScheduleDate::where('schedule_id', $schedule->id)
                    ->where('date', '>=', Carbon::today())
                    ->whereNotIn('status', ['FULL', 'CANCELLED', 'DEPARTED', 'WEATHER_ISSUE'])
                    ->update([
                        'status' => 'INACTIVE',
                        'status_reason' => $request->status_reason,
                        'modified_by_schedule' => true,
                    ]);
            } else {
                ScheduleDate::where('schedule_id', $schedule->id)
                    ->where('date', '>=', Carbon::today())
                    ->where('status', 'INACTIVE')
                    ->where('modified_by_schedule', true)
                    ->update([
                        'status' => 'ACTIVE',
                        'status_reason' => 'Diaktifkan karena jadwal telah diaktifkan',
                        'modified_by_schedule' => true,
                    ]);
            }
        }

        $schedule->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Jadwal berhasil diperbarui',
            'data' => $schedule
        ]);
    }

    /**
     * Cek konflik jadwal untuk kapal tertentu
     *
     * @param int $ferryId ID kapal
     * @param array $days Array hari (1-7)
     * @param string $departureTime Waktu keberangkatan (format H:i)
     * @param string $arrivalTime Waktu kedatangan (format H:i)
     * @param int|null $excludeScheduleId ID jadwal yang dikecualikan (untuk kasus update)
     * @return array Array jadwal yang konflik
     */
    private function checkScheduleConflicts($ferryId, $days, $departureTime, $arrivalTime, $excludeScheduleId = null)
    {
        // Pastikan days selalu berupa array integer
        $days = array_map('intval', is_array($days) ? $days : explode(',', $days));

        // Konversi waktu ke menit untuk memudahkan perbandingan
        $depTimeMinutes = $this->timeToMinutes($departureTime);
        $arrTimeMinutes = $this->timeToMinutes($arrivalTime);

        // Log untuk debugging
        Log::info('Memeriksa konflik jadwal', [
            'ferry_id' => $ferryId,
            'days' => $days,
            'departure_time' => $departureTime . ' (' . $depTimeMinutes . ' menit)',
            'arrival_time' => $arrivalTime . ' (' . $arrTimeMinutes . ' menit)',
            'exclude_id' => $excludeScheduleId
        ]);

        // Ambil semua jadwal aktif untuk kapal yang sama
        $query = Schedule::where('ferry_id', $ferryId)
            ->where('status', 'ACTIVE');

        // Kecualikan jadwal yang sedang diupdate
        if ($excludeScheduleId) {
            $query->where('id', '!=', $excludeScheduleId);
        }

        $existingSchedules = $query->get();
        $dayNames = [1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu', 7 => 'Minggu'];
        $conflicts = [];

        foreach ($existingSchedules as $schedule) {
            // Konversi string days ke array integer
            $scheduleDays = array_map('intval', explode(',', $schedule->days));

            // Cari hari yang tumpang tindih
            $overlappingDays = array_intersect($days, $scheduleDays);

            // Jika tidak ada hari yang sama, lanjut ke jadwal berikutnya
            if (empty($overlappingDays)) {
                continue;
            }

            Log::info('Pengecekan jadwal dengan hari sama', [
                'schedule_id' => $schedule->id,
                'days' => $schedule->days,
                'parsed_days' => $scheduleDays,
                'overlapping_days' => $overlappingDays
            ]);

            // Konversi waktu jadwal yang sudah ada ke menit
            $scheduleDepMinutes = $this->timeToMinutes($schedule->departure_time);
            $scheduleArrMinutes = $this->timeToMinutes($schedule->arrival_time);

            Log::info('Waktu jadwal yang sudah ada', [
                'schedule_id' => $schedule->id,
                'departure_time' => $schedule->departure_time . ' (' . $scheduleDepMinutes . ' menit)',
                'arrival_time' => $schedule->arrival_time . ' (' . $scheduleArrMinutes . ' menit)'
            ]);

            // Cek berbagai jenis tumpang tindih waktu
            $exactTimeMatch = ($depTimeMinutes == $scheduleDepMinutes && $arrTimeMinutes == $scheduleArrMinutes);
            $departureDuringExisting = ($depTimeMinutes >= $scheduleDepMinutes && $depTimeMinutes < $scheduleArrMinutes);
            $arrivalDuringExisting = ($arrTimeMinutes > $scheduleDepMinutes && $arrTimeMinutes <= $scheduleArrMinutes);
            $encompassingExisting = ($depTimeMinutes <= $scheduleDepMinutes && $arrTimeMinutes >= $scheduleArrMinutes);
            $containedInExisting = ($depTimeMinutes > $scheduleDepMinutes && $arrTimeMinutes < $scheduleArrMinutes);

            // Jika ada tumpang tindih waktu pada hari yang sama
            if ($exactTimeMatch || $departureDuringExisting || $arrivalDuringExisting || $encompassingExisting || $containedInExisting) {
                // Format nama hari untuk pesan error
                $overlappingDayNames = array_map(function ($day) use ($dayNames) {
                    return $dayNames[$day] ?? $day;
                }, $overlappingDays);

                $conflicts[] = [
                    'schedule_id' => $schedule->id,
                    'route_id' => $schedule->route_id,
                    'route_name' => $schedule->route ? $schedule->route->name : 'Rute #' . $schedule->route_id,
                    'departure_time' => $schedule->departure_time,
                    'arrival_time' => $schedule->arrival_time,
                    'days' => $schedule->days,
                    'overlapping_days' => $overlappingDays,
                    'overlapping_day_names' => $overlappingDayNames,
                    'conflict_type' => $exactTimeMatch ? 'exact' : 'overlap',
                    'conflict_description' => $exactTimeMatch
                        ? 'Waktu persis sama'
                        : ($departureDuringExisting
                            ? 'Waktu keberangkatan tumpang tindih'
                            : ($arrivalDuringExisting
                                ? 'Waktu kedatangan tumpang tindih'
                                : ($encompassingExisting
                                    ? 'Jadwal mencakup jadwal yang sudah ada'
                                    : 'Jadwal berada dalam jadwal yang sudah ada'
                                )
                            )
                        )
                ];

                Log::warning('Konflik jadwal terdeteksi', [
                    'schedule_id' => $schedule->id,
                    'overlapping_days' => $overlappingDays,
                    'conflict_type' => $exactTimeMatch ? 'exact' : 'overlap',
                    'new_departure' => $depTimeMinutes,
                    'new_arrival' => $arrTimeMinutes,
                    'existing_departure' => $scheduleDepMinutes,
                    'existing_arrival' => $scheduleArrMinutes
                ]);
            }
        }

        return $conflicts;
    }

    /**
     * Konversi waktu ke menit, mendukung berbagai format waktu
     *
     * @param string $time Waktu dalam berbagai format
     * @return int Total menit
     */
    private function timeToMinutes($time)
    {
        if (empty($time)) {
            return 0;
        }

        // Strip any seconds
        if (strlen($time) > 5 && strpos($time, ':') !== false) {
            // Handle full datetime format (2025-06-24 20:00:00)
            if (strpos($time, '-') !== false || strpos($time, '/') !== false) {
                // Try to extract time part from datetime
                try {
                    $dateTime = new \DateTime($time);
                    $hours = (int)$dateTime->format('H');
                    $minutes = (int)$dateTime->format('i');
                    return $hours * 60 + $minutes;
                } catch (\Exception $e) {
                    Log::warning('Format datetime tidak valid: ' . $time);
                    return 0;
                }
            }

            // Handle time format with seconds (20:00:00)
            if (preg_match('/^(\d{1,2}):(\d{1,2}):(\d{1,2})$/', $time, $matches)) {
                $hours = (int)$matches[1];
                $minutes = (int)$matches[2];
                return $hours * 60 + $minutes;
            }
        }

        // Handle simple time format (20:00)
        if (preg_match('/^(\d{1,2}):(\d{1,2})$/', $time, $matches)) {
            $hours = (int)$matches[1];
            $minutes = (int)$matches[2];
            return $hours * 60 + $minutes;
        }

        Log::warning('Format waktu tidak dapat diproses: ' . $time);
        return 0;
    }

    public function destroy($id)
    {
        $schedule = Schedule::findOrFail($id);

        // Periksa apakah jadwal memiliki booking
        $hasBookings = $schedule->bookings()->exists();

        if ($hasBookings) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jadwal tidak dapat dihapus karena memiliki booking terkait'
            ], 422);
        }

        // Hapus tanggal-tanggal jadwal
        ScheduleDate::where('schedule_id', $id)->delete();

        $schedule->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Jadwal berhasil dihapus'
        ]);
    }

    /**
     * Validasi jadwal untuk mencegah konflik waktu pada hari yang sama
     *
     * @param int $ferryId ID kapal
     * @param array $days Array hari operasional
     * @param string $departureTime Waktu keberangkatan
     * @param string $arrivalTime Waktu kedatangan
     * @param int|null $scheduleId ID jadwal yang sedang diedit (null untuk jadwal baru)
     * @return array Array jadwal yang konflik atau array kosong jika tidak ada konflik
     */
    private function validateScheduleConflict($ferryId, $days, $departureTime, $arrivalTime, $scheduleId = null)
    {
        // Log data input untuk debugging
        Log::info('Validasi konflik jadwal:', [
            'ferry_id' => $ferryId,
            'days' => $days,
            'departure_time' => $departureTime,
            'arrival_time' => $arrivalTime,
            'schedule_id' => $scheduleId
        ]);

        // Konversi waktu ke menit untuk perbandingan yang lebih mudah
        $depTimeMinutes = $this->timeToMinutes($departureTime);
        $arrTimeMinutes = $this->timeToMinutes($arrivalTime);

        // Pastikan semua nilai hari dalam format integer
        $daysInt = array_map('intval', is_array($days) ? $days : [$days]);

        // Ambil semua jadwal aktif untuk kapal yang sama (kecuali jadwal yang sedang diedit)
        $query = Schedule::where('ferry_id', $ferryId)
            ->where('status', 'ACTIVE');

        if ($scheduleId) {
            $query->where('id', '!=', $scheduleId);
        }

        $existingSchedules = $query->get();

        $conflicts = [];
        $dayNames = [1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu', 7 => 'Minggu'];

        foreach ($existingSchedules as $schedule) {
            // Konversi days dari string menjadi array integer
            $scheduleDays = array_map('intval', explode(',', $schedule->days));

            // Cari hari-hari yang tumpang tindih
            $overlappingDays = array_intersect($daysInt, $scheduleDays);

            if (empty($overlappingDays)) {
                continue; // Tidak ada hari yang sama, lanjut ke jadwal berikutnya
            }

            // Konversi waktu jadwal ke menit
            $scheduleDepMinutes = $this->timeToMinutes($schedule->departure_time);
            $scheduleArrMinutes = $this->timeToMinutes($schedule->arrival_time);

            // Periksa apakah waktu tumpang tindih
            $isExactTime = ($depTimeMinutes == $scheduleDepMinutes && $arrTimeMinutes == $scheduleArrMinutes);
            $isDepartureInRange = ($depTimeMinutes >= $scheduleDepMinutes && $depTimeMinutes < $scheduleArrMinutes);
            $isArrivalInRange = ($arrTimeMinutes > $scheduleDepMinutes && $arrTimeMinutes <= $scheduleArrMinutes);
            $isScheduleInRange = ($depTimeMinutes <= $scheduleDepMinutes && $arrTimeMinutes >= $scheduleArrMinutes);

            // Jika ada tumpang tindih waktu pada hari yang sama
            if ($isExactTime || $isDepartureInRange || $isArrivalInRange || $isScheduleInRange) {
                // Format nama hari yang tumpang tindih
                $overlappingDaysNames = array_map(function ($day) use ($dayNames) {
                    return $dayNames[$day] ?? $day;
                }, $overlappingDays);

                $conflicts[] = [
                    'schedule' => $schedule,
                    'overlapping_days' => $overlappingDays,
                    'overlapping_days_names' => $overlappingDaysNames,
                    'conflict_type' => $isExactTime ? 'exact_time' : 'overlapping_time'
                ];

                Log::warning('Konflik jadwal terdeteksi:', [
                    'existing_schedule_id' => $schedule->id,
                    'overlapping_days' => $overlappingDays,
                    'conflict_type' => $isExactTime ? 'exact_time' : 'overlapping_time'
                ]);
            }
        }

        return $conflicts;
    }

    public function dates(Request $request, $id)
    {
        $schedule = Schedule::with(['route', 'ferry'])->findOrFail($id);
        $perPage = $request->input('per_page', 10);

        $query = ScheduleDate::where('schedule_id', $id);

        // Filter berdasarkan tanggal dari
        if ($request->has('date_from') && $request->date_from) {
            $query->where('date', '>=', $request->date_from);
        }

        // Filter berdasarkan tanggal sampai
        if ($request->has('date_to') && $request->date_to) {
            $query->where('date', '<=', $request->date_to);
        }

        // Filter berdasarkan status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $scheduleDates = $query->orderBy('date')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => [
                'schedule' => $schedule,
                'dates' => $scheduleDates
            ]
        ]);
    }

    public function showDate($scheduleId, $dateId)
    {
        $schedule = Schedule::findOrFail($scheduleId);
        $scheduleDate = ScheduleDate::where('schedule_id', $scheduleId)
            ->where('id', $dateId)
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => [
                'schedule' => $schedule,
                'date' => $scheduleDate
            ]
        ]);
    }

    public function updateDate(Request $request, $id, $dateId)
    {
        $scheduleDate = ScheduleDate::where('schedule_id', $id)
            ->where('id', $dateId)
            ->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:ACTIVE,INACTIVE,FULL,CANCELLED,DEPARTED,WEATHER_ISSUE',
            'status_reason' => 'nullable|string|max:191',
            'status_expiry_date' => 'nullable|date|after:now',
        ]);

        $scheduleDate->status = $request->status;
        $scheduleDate->status_reason = $request->status_reason;
        $scheduleDate->modified_by_schedule = false;

        if ($request->status === 'WEATHER_ISSUE' && $request->has('status_expiry_date')) {
            $scheduleDate->status_expiry_date = Carbon::parse($request->status_expiry_date);
        } else {
            $scheduleDate->status_expiry_date = null;
        }

        $scheduleDate->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Status tanggal jadwal berhasil diperbarui',
            'data' => $scheduleDate
        ]);
    }

    public function storeDate(Request $request, $id)
    {
        $schedule = Schedule::findOrFail($id);

        $validated = $request->validate([
            'date_type' => 'required|in:single,range',
            'date' => 'required|date|after_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:date',
            'status' => 'required|in:ACTIVE,INACTIVE,CANCELLED,WEATHER_ISSUE',
            'status_reason' => 'nullable|string|max:191',
            'status_expiry_date' => 'nullable|date|after:now',
        ]);

        // Validasi untuk tanggal tunggal
        if ($request->date_type === 'single') {
            $selectedDate = Carbon::parse($request->date);

            // Check if date already exists
            $existingDate = ScheduleDate::where('schedule_id', $schedule->id)
                ->where('date', $selectedDate->format('Y-m-d'))
                ->first();

            if ($existingDate) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tanggal jadwal sudah ada',
                    'errors' => [
                        'date' => ['Tanggal ini sudah ada dalam jadwal']
                    ]
                ], 422);
            }

            // PERBAIKAN: Carbon menggunakan 0 untuk Minggu, tapi kita gunakan 1-7
            // Konversi yang benar untuk Carbon: 0=Minggu → 7, 1=Senin → 1, dst.
            $dayOfWeek = $selectedDate->dayOfWeek;
            if ($dayOfWeek == 0) $dayOfWeek = 7;

            $scheduleDays = explode(',', $schedule->days);

            if (!in_array((string)$dayOfWeek, $scheduleDays)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tanggal yang dipilih tidak sesuai dengan hari operasi jadwal',
                    'errors' => [
                        'date' => ['Tanggal yang dipilih tidak sesuai dengan hari operasi jadwal']
                    ]
                ], 422);
            }

            // Status default mengikuti status jadwal jika ACTIVE atau INACTIVE
            $status = $request->status;
            if (($status === 'ACTIVE' || $status === 'INACTIVE') && $schedule->status === 'INACTIVE') {
                $status = 'INACTIVE';
            }

            $scheduleDate = new ScheduleDate([
                'schedule_id' => $schedule->id,
                'date' => $selectedDate,
                'status' => $status,
                'status_reason' => $request->status_reason,
                'passenger_count' => 0,
                'motorcycle_count' => 0,
                'car_count' => 0,
                'bus_count' => 0,
                'truck_count' => 0,
                'modified_by_schedule' => ($status !== $request->status),
            ]);

            if ($request->status === 'WEATHER_ISSUE' && $request->has('status_expiry_date')) {
                $scheduleDate->status_expiry_date = Carbon::parse($request->status_expiry_date);
            }

            $scheduleDate->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Tanggal jadwal berhasil ditambahkan',
                'data' => $scheduleDate
            ], 201);
        }

        // Range dates
        if ($request->date_type === 'range' && $request->has('end_date')) {
            // Get schedule days
            $scheduleDays = explode(',', $schedule->days);
            $startDate = Carbon::parse($request->date);
            $endDate = Carbon::parse($request->end_date);
            $currentDate = $startDate->copy();
            $createdDates = 0;
            $addedDates = [];

            // Status default mengikuti status jadwal jika ACTIVE atau INACTIVE
            $status = $request->status;
            $modified_by_schedule = false;
            if (($status === 'ACTIVE' || $status === 'INACTIVE') && $schedule->status === 'INACTIVE') {
                $status = 'INACTIVE';
                $modified_by_schedule = true;
            }

            // Generate dates for the specified range, but only for days of week that match the schedule days
            while ($currentDate->lte($endDate)) {
                // PERBAIKAN: Konversi yang benar untuk dayOfWeek
                $dayOfWeek = $currentDate->dayOfWeek;
                if ($dayOfWeek == 0) $dayOfWeek = 7; // Mengubah Minggu dari 0 menjadi 7

                if (in_array((string)$dayOfWeek, $scheduleDays)) {
                    // Check if this date already exists
                    $existingDate = ScheduleDate::where('schedule_id', $schedule->id)
                        ->where('date', $currentDate->format('Y-m-d'))
                        ->first();

                    if (!$existingDate) {
                        $scheduleDate = new ScheduleDate([
                            'schedule_id' => $schedule->id,
                            'date' => $currentDate->copy(),
                            'status' => $status,
                            'status_reason' => $request->status_reason,
                            'passenger_count' => 0,
                            'motorcycle_count' => 0,
                            'car_count' => 0,
                            'bus_count' => 0,
                            'truck_count' => 0,
                            'modified_by_schedule' => $modified_by_schedule,
                        ]);

                        if ($request->status === 'WEATHER_ISSUE' && $request->has('status_expiry_date')) {
                            $scheduleDate->status_expiry_date = Carbon::parse($request->status_expiry_date);
                        }

                        $scheduleDate->save();
                        $addedDates[] = $scheduleDate;
                        $createdDates++;
                    }
                }

                $currentDate->addDay();
            }

            if ($createdDates == 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tidak ada tanggal yang sesuai dengan hari operasi jadwal dalam rentang tanggal yang dipilih',
                    'errors' => [
                        'date' => ['Tidak ada tanggal yang sesuai dengan hari operasi jadwal dalam rentang tanggal yang dipilih']
                    ]
                ], 422);
            }

            return response()->json([
                'status' => 'success',
                'message' => $createdDates . ' tanggal jadwal berhasil ditambahkan sesuai dengan hari operasi jadwal',
                'data' => $addedDates
            ], 201);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Terjadi kesalahan saat menambahkan tanggal jadwal'
        ], 400);
    }

    public function destroyDate($id, $dateId)
    {
        $scheduleDate = ScheduleDate::where('schedule_id', $id)
            ->where('id', $dateId)
            ->firstOrFail();

        // Periksa apakah tanggal jadwal memiliki penumpang atau kendaraan
        $hasBookings = $scheduleDate->passenger_count > 0 ||
            $scheduleDate->motorcycle_count > 0 ||
            $scheduleDate->car_count > 0 ||
            $scheduleDate->bus_count > 0 ||
            $scheduleDate->truck_count > 0;

        if ($hasBookings) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tanggal jadwal tidak dapat dihapus karena memiliki booking terkait'
            ], 422);
        }

        $scheduleDate->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Tanggal jadwal berhasil dihapus'
        ]);
    }

    public function addDates(Request $request, $id)
    {
        // Implementasi untuk menambahkan multiple dates
        $schedule = Schedule::findOrFail($id);

        $validated = $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'days' => 'required|array|min:1',
            'days.*' => 'integer|between:1,7',
            'status' => 'required|in:ACTIVE,INACTIVE,CANCELLED,WEATHER_ISSUE',
            'status_reason' => 'nullable|string|max:191',
        ]);

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $currentDate = $startDate->copy();
        $createdDates = 0;
        $addedDates = [];

        // Status default mengikuti status jadwal jika ACTIVE atau INACTIVE
        $status = $request->status;
        $modified_by_schedule = false;
        if (($status === 'ACTIVE' || $status === 'INACTIVE') && $schedule->status === 'INACTIVE') {
            $status = 'INACTIVE';
            $modified_by_schedule = true;
        }

        // Generate dates for the specified range and days
        while ($currentDate->lte($endDate)) {
            $dayOfWeek = $currentDate->dayOfWeek;
            if ($dayOfWeek == 0) $dayOfWeek = 7;

            if (in_array($dayOfWeek, $request->days)) {
                // Check if this date already exists
                $existingDate = ScheduleDate::where('schedule_id', $schedule->id)
                    ->where('date', $currentDate->format('Y-m-d'))
                    ->first();

                if (!$existingDate) {
                    $scheduleDate = new ScheduleDate([
                        'schedule_id' => $schedule->id,
                        'date' => $currentDate->copy(),
                        'status' => $status,
                        'status_reason' => $request->status_reason,
                        'passenger_count' => 0,
                        'motorcycle_count' => 0,
                        'car_count' => 0,
                        'bus_count' => 0,
                        'truck_count' => 0,
                        'modified_by_schedule' => $modified_by_schedule,
                    ]);

                    if ($request->status === 'WEATHER_ISSUE' && $request->has('status_expiry_date')) {
                        $scheduleDate->status_expiry_date = Carbon::parse($request->status_expiry_date);
                    }

                    $scheduleDate->save();
                    $addedDates[] = $scheduleDate;
                    $createdDates++;
                }
            }

            $currentDate->addDay();
        }

        if ($createdDates == 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada tanggal baru yang ditambahkan',
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => $createdDates . ' tanggal jadwal berhasil ditambahkan',
            'data' => $addedDates
        ], 201);
    }

    private function checkExpiredSchedules()
    {
        $now = Carbon::now();

        // Update jadwal INACTIVE yang sudah melewati tanggal kedaluwarsa
        $expiredSchedules = Schedule::where('status', 'INACTIVE')
            ->whereNotNull('status_expiry_date')
            ->where('status_expiry_date', '<', $now)
            ->get();

        foreach ($expiredSchedules as $schedule) {
            $schedule->status = 'ACTIVE';
            $schedule->status_reason = 'Otomatis diaktifkan setelah masa tidak aktif berakhir';
            $schedule->status_updated_at = $now;
            $schedule->status_expiry_date = null;
            $schedule->save();

            // Update juga status tanggal jadwal terkait
            ScheduleDate::where('schedule_id', $schedule->id)
                ->where('date', '>=', Carbon::today())
                ->where('modified_by_schedule', true)
                ->where('status', 'INACTIVE')
                ->update([
                    'status' => 'ACTIVE',
                    'status_reason' => 'Otomatis diaktifkan karena jadwal telah aktif kembali',
                ]);
        }

        // Update jadwal dengan status WEATHER_ISSUE yang sudah kedaluwarsa
        ScheduleDate::where('status', 'WEATHER_ISSUE')
            ->whereNotNull('status_expiry_date')
            ->where('status_expiry_date', '<', $now)
            ->update([
                'status' => 'ACTIVE',
                'status_reason' => 'Otomatis diaktifkan setelah masa masalah cuaca berakhir',
                'status_expiry_date' => null
            ]);
    }

    private function checkExpiredStatuses()
    {
        $now = Carbon::now();

        // Update jadwal INACTIVE yang sudah melewati tanggal kedaluwarsa
        $expiredSchedules = Schedule::where('status', 'INACTIVE')
            ->whereNotNull('status_expiry_date')
            ->where('status_expiry_date', '<', $now)
            ->get();

        foreach ($expiredSchedules as $schedule) {
            $schedule->status = 'ACTIVE';
            $schedule->status_reason = 'Otomatis diaktifkan setelah masa tidak aktif berakhir';
            $schedule->status_updated_at = $now;
            $schedule->status_expiry_date = null;
            $schedule->save();

            // Update juga status tanggal jadwal terkait
            ScheduleDate::where('schedule_id', $schedule->id)
                ->where('date', '>=', Carbon::today())
                ->where('modified_by_schedule', true)
                ->where('status', 'INACTIVE')
                ->update([
                    'status' => 'ACTIVE',
                    'status_reason' => 'Otomatis diaktifkan karena jadwal telah aktif kembali',
                ]);
        }

        // Update tanggal jadwal dengan status WEATHER_ISSUE yang sudah kedaluwarsa
        ScheduleDate::where('status', 'WEATHER_ISSUE')
            ->whereNotNull('status_expiry_date')
            ->where('status_expiry_date', '<', $now)
            ->update([
                'status' => 'ACTIVE',
                'status_reason' => 'Otomatis diaktifkan setelah masa masalah cuaca berakhir',
                'status_expiry_date' => null
            ]);
    }
}
