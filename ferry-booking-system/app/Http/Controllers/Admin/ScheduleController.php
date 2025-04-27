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
            'status' => 'required|in:ACTIVE,CANCELLED,DELAYED,FULL',
            'status_reason' => 'nullable|string|max:191',
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

        if ($request->status !== 'ACTIVE') {
            $schedule->status_updated_at = Carbon::now();

            if ($request->has('status_expiry_date')) {
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
            'status' => 'required|in:ACTIVE,CANCELLED,DELAYED,FULL',
            'status_reason' => 'nullable|string|max:191',
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

        if ($statusChanged) {
            $schedule->status_updated_at = Carbon::now();

            if ($request->status === 'DELAYED' && $request->has('status_expiry_date')) {
                $schedule->status_expiry_date = Carbon::parse($request->status_expiry_date);
            } else {
                $schedule->status_expiry_date = null;
            }

            // Update schedule dates status based on new schedule status
            if (in_array($request->status, ['CANCELLED', 'DELAYED'])) {
                $statusMap = [
                    'CANCELLED' => 'CANCELLED',
                    'DELAYED' => 'UNAVAILABLE',
                ];

                ScheduleDate::where('schedule_id', $schedule->id)
                    ->where('date', '>=', Carbon::today())
                    ->update([
                        'status' => $statusMap[$request->status],
                        'status_reason' => $request->status_reason,
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

    public function dates($id)
    {
        $schedule = Schedule::with(['route', 'ferry'])->findOrFail($id);
        $scheduleDates = ScheduleDate::where('schedule_id', $id)
            ->orderBy('date')
            ->paginate(10);

        return view('admin.schedules.dates', compact('schedule', 'scheduleDates'));
    }

    public function updateDate(Request $request, $id, $dateId)
    {
        $scheduleDate = ScheduleDate::where('schedule_id', $id)
            ->where('id', $dateId)
            ->firstOrFail();

        $request->validate([
            'status' => 'required|in:AVAILABLE,UNAVAILABLE,FULL,CANCELLED,DEPARTED,WEATHER_ISSUE',
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
            'status' => 'required|in:AVAILABLE,UNAVAILABLE,CANCELLED,WEATHER_ISSUE',
            'status_reason' => 'nullable|string|max:191',
        ]);

        // Single date
        if ($request->date_type === 'single') {
            $scheduleDate = new ScheduleDate([
                'schedule_id' => $schedule->id,
                'date' => Carbon::parse($request->date),
                'status' => $request->status,
                'status_reason' => $request->status_reason,
                'passenger_count' => 0,
                'motorcycle_count' => 0,
                'car_count' => 0,
                'bus_count' => 0,
                'truck_count' => 0,
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

            // Generate dates for the specified range, but only for days of week that match the schedule days
            while ($currentDate->lte($endDate)) {
                $dayOfWeek = $currentDate->dayOfWeek + 1; // Convert to 1-7 (Monday-Sunday)

                if (in_array($dayOfWeek, $scheduleDays)) {
                    // Check if this date already exists
                    $existingDate = ScheduleDate::where('schedule_id', $schedule->id)
                        ->where('date', $currentDate->format('Y-m-d'))
                        ->first();

                    if (!$existingDate) {
                        $scheduleDate = new ScheduleDate([
                            'schedule_id' => $schedule->id,
                            'date' => $currentDate->copy(),
                            'status' => $request->status,
                            'status_reason' => $request->status_reason,
                            'passenger_count' => 0,
                            'motorcycle_count' => 0,
                            'car_count' => 0,
                            'bus_count' => 0,
                            'truck_count' => 0,
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
}
