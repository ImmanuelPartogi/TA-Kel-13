<?php

// app/Http/Controllers/Admin/ScheduleController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ferry;
use App\Models\Route;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $this->checkExpiredSchedules();
        $this->checkExpiredStatuses();

        $query = Schedule::with(['route', 'ferry']);

        // Filter berdasarkan rute
        if ($request->has('route_id') && $request->route_id) {
            $query->where('route_id', $request->route_id);
        }

        // Filter berdasarkan feri
        if ($request->has('ferry_id') && $request->ferry_id) {
            $query->where('ferry_id', $request->ferry_id);
        }

        // Filter berdasarkan status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $schedules = $query->paginate(10);
        $routes = Route::where('status', 'ACTIVE')->get();
        $ferries = Ferry::where('status', 'ACTIVE')->get();

        return view('admin.schedules.index', compact('schedules', 'routes', 'ferries'));
    }

    public function create()
    {
        $routes = Route::where('status', 'ACTIVE')->get();
        $ferries = Ferry::where('status', 'ACTIVE')->get();
        return view('admin.schedules.create', compact('routes', 'ferries'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'route_id' => 'required|exists:routes,id',
            'ferry_id' => 'required|exists:ferries,id',
            'departure_time' => 'required|date_format:H:i',
            'arrival_time' => 'required|date_format:H:i|after:departure_time',
            'days' => 'required|array|min:1',
            'days.*' => 'integer|between:1,7',
            'status' => 'required|in:ACTIVE,INACTIVE', // Perubahan di sini
            'status_expiry_date' => 'nullable|date|after:now', // Tambahkan validasi expiry date
        ]);

        // Validasi jadwal duplikat untuk feri yang sama
        $existingSchedule = Schedule::where('ferry_id', $request->ferry_id)
            ->where(function ($query) use ($request) {
                $query->whereRaw("STR_TO_DATE(?, '%H:%i') BETWEEN departure_time AND arrival_time", [$request->departure_time])
                    ->orWhereRaw("STR_TO_DATE(?, '%H:%i') BETWEEN departure_time AND arrival_time", [$request->arrival_time]);
            })
            ->whereRaw("FIND_IN_SET(?, days)", [implode(',', $request->days)])
            ->first();

        if ($existingSchedule) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['departure_time' => 'Jadwal bertabrakan dengan jadwal yang sudah ada untuk feri yang sama']);
        }

        $schedule = new Schedule([
            'route_id' => $request->route_id,
            'ferry_id' => $request->ferry_id,
            'departure_time' => $request->departure_time,
            'arrival_time' => $request->arrival_time,
            'days' => implode(',', $request->days),
            'status' => $request->status,
            'status_reason' => $request->status_reason,
        ]);

        // Set admin yang membuat jadwal
        $schedule->created_by = Auth::id();

        if ($request->status === 'INACTIVE') {
            $schedule->status_updated_at = Carbon::now();

            // Tambahkan expiry date jika ada
            if ($request->has('status_expiry_date') && $request->status_expiry_date) {
                $schedule->status_expiry_date = Carbon::parse($request->status_expiry_date);
            }
        }

        $schedule->save();

        return redirect()->route('admin.schedules.index')
            ->with('success', 'Jadwal berhasil ditambahkan');
    }


    public function edit($id)
    {
        $schedule = Schedule::findOrFail($id);
        $routes = Route::where('status', 'ACTIVE')->get();
        $ferries = Ferry::where('status', 'ACTIVE')->get();
        $days = explode(',', $schedule->days);

        return view('admin.schedules.edit', compact('schedule', 'routes', 'ferries', 'days'));
    }


    public function update(Request $request, $id)
    {
        $schedule = Schedule::findOrFail($id);

        $request->validate([
            'route_id' => 'required|exists:routes,id',
            'ferry_id' => 'required|exists:ferries,id',
            'departure_time' => 'required|date_format:H:i',
            'arrival_time' => 'required|date_format:H:i|after:departure_time',
            'days' => 'required|array|min:1',
            'days.*' => 'integer|between:1,7',
            'status' => 'required|in:ACTIVE,INACTIVE', // Perubahan di sini
            'status_expiry_date' => 'nullable|date|after:now', // Tambahkan validasi expiry date
        ]);

        // Validasi jadwal duplikat untuk feri yang sama kecuali jadwal ini sendiri
        $existingSchedule = Schedule::where('ferry_id', $request->ferry_id)
            ->where('id', '!=', $id)
            ->where(function ($query) use ($request) {
                $query->whereRaw("STR_TO_DATE(?, '%H:%i') BETWEEN departure_time AND arrival_time", [$request->departure_time])
                    ->orWhereRaw("STR_TO_DATE(?, '%H:%i') BETWEEN departure_time AND arrival_time", [$request->arrival_time]);
            })
            ->whereRaw("FIND_IN_SET(?, days)", [implode(',', $request->days)])
            ->first();

        if ($existingSchedule) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['departure_time' => 'Jadwal bertabrakan dengan jadwal yang sudah ada untuk feri yang sama']);
        }

        // Check if status changed
        $statusChanged = $schedule->status !== $request->status;

        $schedule->route_id = $request->route_id;
        $schedule->ferry_id = $request->ferry_id;
        $schedule->departure_time = $request->departure_time;
        $schedule->arrival_time = $request->arrival_time;
        $schedule->days = implode(',', $request->days);
        $schedule->status = $request->status;
        $schedule->status_reason = $request->status_reason;

        if ($statusChanged || $request->has('status_expiry_date')) {
            $schedule->status_updated_at = Carbon::now();

            // Update expiry date
            if ($request->status === 'INACTIVE' && $request->has('status_expiry_date') && $request->status_expiry_date) {
                $schedule->status_expiry_date = Carbon::parse($request->status_expiry_date);
            } else {
                $schedule->status_expiry_date = null;
            }

            // Update schedule dates status based on new schedule status
            if ($request->status === 'INACTIVE') {
                // Jika jadwal menjadi tidak aktif, semua tanggal jadwal yang tidak memiliki status khusus juga menjadi tidak aktif
                ScheduleDate::where('schedule_id', $schedule->id)
                    ->where('date', '>=', Carbon::today())
                    ->whereNotIn('status', ['FULL', 'CANCELLED', 'DEPARTED', 'WEATHER_ISSUE'])
                    ->update([
                        'status' => 'INACTIVE',
                        'status_reason' => $request->status_reason,
                        'modified_by_schedule' => true,
                    ]);
            } else {
                // Jika jadwal menjadi aktif, semua tanggal jadwal yang sebelumnya diubah oleh jadwal menjadi aktif
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

        return redirect()->route('admin.schedules.index')
            ->with('success', 'Jadwal berhasil diperbarui');
    }

    public function destroy($id)
    {
        $schedule = Schedule::findOrFail($id);

        // Periksa apakah jadwal memiliki booking
        $hasBookings = $schedule->bookings()->exists();

        if ($hasBookings) {
            return redirect()->route('admin.schedules.index')
                ->with('error', 'Jadwal tidak dapat dihapus karena memiliki booking terkait');
        }

        // Hapus tanggal-tanggal jadwal
        ScheduleDate::where('schedule_id', $id)->delete();

        $schedule->delete();

        return redirect()->route('admin.schedules.index')
            ->with('success', 'Jadwal berhasil dihapus');
    }

    public function dates($id, $dateId = null)
    {
        $schedule = Schedule::with(['route', 'ferry'])->findOrFail($id);

        if ($dateId) {
            $scheduleDates = ScheduleDate::where('schedule_id', $id)
                ->where('id', $dateId)
                ->paginate(10);
        } else {
            $scheduleDates = ScheduleDate::where('schedule_id', $id)
                ->orderBy('date')
                ->paginate(10);
        }

        return view('admin.schedules.dates', compact('schedule', 'scheduleDates'));
    }

    public function showDate($scheduleId, $dateId)
    {
        $schedule = Schedule::findOrFail($scheduleId);
        $scheduleDate = ScheduleDate::where('schedule_id', $scheduleId)
            ->where('id', $dateId)
            ->firstOrFail();

        return view('admin.schedules.show-date', compact('schedule', 'scheduleDate'));
    }

    public function updateDate(Request $request, $id, $dateId)
    {
        $scheduleDate = ScheduleDate::where('schedule_id', $id)
            ->where('id', $dateId)
            ->firstOrFail();

        $request->validate([
            'status' => 'required|in:ACTIVE,INACTIVE,FULL,CANCELLED,DEPARTED,WEATHER_ISSUE', // Perubahan disini
            'status_reason' => 'nullable|string|max:191',
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

        return redirect()->route('admin.schedules.dates', $id)
            ->with('success', 'Status tanggal jadwal berhasil diperbarui');
    }

    public function storeDate(Request $request, $id)
    {
        $schedule = Schedule::findOrFail($id);

        $request->validate([
            'date_type' => 'required|in:single,range',
            'date' => 'required|date|after_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:date',
            'status' => 'required|in:ACTIVE,INACTIVE,CANCELLED,WEATHER_ISSUE',
            'status_reason' => 'nullable|string|max:191',
        ]);

        // Single date
        if ($request->date_type === 'single') {
            // Validasi jika tanggal tunggal sesuai dengan hari operasi
            $selectedDate = Carbon::parse($request->date);

            // PERBAIKAN: Carbon menggunakan 0 untuk Minggu, tapi kita gunakan 1-7
            // Konversi yang benar untuk Carbon: 0=Minggu → 7, 1=Senin → 1, dst.
            $dayOfWeek = $selectedDate->dayOfWeek;
            if ($dayOfWeek == 0) $dayOfWeek = 7;

            $scheduleDays = explode(',', $schedule->days);

            if (!in_array((string)$dayOfWeek, $scheduleDays)) {
                return redirect()->back()
                    ->withInput()
                    ->withErrors(['date' => 'Tanggal yang dipilih tidak sesuai dengan hari operasi jadwal']);
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

            return redirect()->route('admin.schedules.dates', $id)
                ->with('success', 'Tanggal jadwal berhasil ditambahkan');
        }

        // Range dates
        if ($request->date_type === 'range' && $request->has('end_date')) {
            // Get schedule days
            $scheduleDays = explode(',', $schedule->days);
            $startDate = Carbon::parse($request->date);
            $endDate = Carbon::parse($request->end_date);
            $currentDate = $startDate->copy();
            $createdDates = 0;

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
                        $createdDates++;
                    }
                }

                $currentDate->addDay();
            }

            if ($createdDates == 0) {
                return redirect()->back()
                    ->withInput()
                    ->withErrors(['date' => 'Tidak ada tanggal yang sesuai dengan hari operasi jadwal dalam rentang tanggal yang dipilih']);
            }

            return redirect()->route('admin.schedules.dates', $id)
                ->with('success', $createdDates . ' tanggal jadwal berhasil ditambahkan sesuai dengan hari operasi jadwal');
        }

        return redirect()->route('admin.schedules.dates', $id)
            ->with('error', 'Terjadi kesalahan saat menambahkan tanggal jadwal');
    }

    /**
     * Menghapus tanggal jadwal tertentu
     */
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
            return redirect()->route('admin.schedules.dates', $id)
                ->with('error', 'Tanggal jadwal tidak dapat dihapus karena memiliki booking terkait');
        }

        $scheduleDate->delete();

        return redirect()->route('admin.schedules.dates', $id)
            ->with('success', 'Tanggal jadwal berhasil dihapus');
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
