<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Route;
use App\Models\ScheduleDate;
use Carbon\Carbon;
use Illuminate\Routing\Controller;

class LandingPageController extends Controller
{
    public function index()
    {
        // Ambil rute aktif
        $routes = Route::where('status', 'ACTIVE')->get();

        // Ambil jadwal mendatang
        $upcomingSchedules = ScheduleDate::with(['schedule', 'schedule.route', 'schedule.ferry'])
            ->where('date', '>=', Carbon::today())
            ->orderBy('date')
            ->limit(5)
            ->get();

        return view('welcome', compact('routes', 'upcomingSchedules'));
    }

    public function schedules()
    {
        $routes = Route::where('status', 'ACTIVE')->get();
        return view('schedules', compact('routes'));
    }

    public function contact()
    {
        return view('contact');
    }

    public function searchSchedule(Request $request)
    {
        $routes = Route::where('status', 'ACTIVE')->get();

        $schedules = [];
        if ($request->has('route_id') && $request->has('departure_date')) {
            $schedules = ScheduleDate::with(['schedule', 'schedule.route', 'schedule.ferry'])
                ->whereHas('schedule', function ($query) use ($request) {
                    $query->where('route_id', $request->route_id);
                })
                ->whereDate('date', $request->departure_date)
                ->get();
        }

        return view('search-results', compact('schedules', 'routes', 'request'));
    }

    public function bookingForm($scheduleDate_id)
    {
        $scheduleDate = ScheduleDate::with(['schedule', 'schedule.route', 'schedule.ferry'])
            ->findOrFail($scheduleDate_id);

        return view('booking-form', compact('scheduleDate'));
    }
}
