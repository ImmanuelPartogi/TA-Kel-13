<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $operator = Auth::guard('operator')->user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        $query = Schedule::whereIn('route_id', $assignedRouteIds)
            ->with(['route', 'ferry']);

        // Filter berdasarkan rute
        if ($request->has('route_id') && $request->route_id) {
            $query->where('route_id', $request->route_id);
        }

        // Filter berdasarkan status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $schedules = $query->paginate(10);

        return view('operator.schedules.index', compact('schedules'));
    }

    public function show($id)
    {
        $operator = Auth::guard('operator')->user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        $schedule = Schedule::whereIn('route_id', $assignedRouteIds)
            ->where('id', $id)
            ->with(['route', 'ferry'])
            ->firstOrFail();

        return view('operator.schedules.show', compact('schedule'));
    }

    public function dates($id)
    {
        $operator = Auth::guard('operator')->user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        $schedule = Schedule::whereIn('route_id', $assignedRouteIds)
            ->where('id', $id)
            ->with(['route', 'ferry'])
            ->firstOrFail();

        $scheduleDates = ScheduleDate::where('schedule_id', $id)
            ->orderBy('date')
            ->paginate(10);

        return view('operator.schedules.dates', compact('schedule', 'scheduleDates'));
    }

    public function updateDateStatus(Request $request, $id, $dateId)
    {
        $operator = Auth::guard('operator')->user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        $schedule = Schedule::whereIn('route_id', $assignedRouteIds)
            ->where('id', $id)
            ->firstOrFail();

        $scheduleDate = ScheduleDate::where('schedule_id', $id)
            ->where('id', $dateId)
            ->firstOrFail();

        $request->validate([
            'status' => 'required|in:AVAILABLE,UNAVAILABLE,FULL,CANCELLED,WEATHER_ISSUE',
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

        return redirect()->route('operator.schedules.dates', $id)
            ->with('success', 'Status tanggal jadwal berhasil diperbarui');
    }
}
