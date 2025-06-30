<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Route;
use App\Models\ScheduleDate;
use Carbon\Carbon;
use Illuminate\Routing\Controller;

class WelcomeController extends Controller
{
    public function index()
    {
        // Ambil rute aktif
        $allRoutes = Route::where('status', 'ACTIVE')->get();

        // Mengambil setting
        $settings = $this->getSettings();

        return view('welcome', compact('allRoutes', 'settings'));
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

    private function getSettings()
    {
        return [
            'hero_title' => 'Jelajahi Keindahan Danau dengan Layanan Ferry Kami',
            'hero_subtitle' => 'Pesan tiket ferry Anda secara online untuk pengalaman perjalanan yang mulus.',
            'hero_image' => 'https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?q=80&w=2070',

        ];
    }

    public function getRoutes()
    {
        // Ambil rute aktif dan muat relasi schedules
        $allRoutes = Route::with('schedules')
            ->where('status', 'ACTIVE')
            ->get()
            ->map(function ($route) {
                // Tambahkan schedule_description jika tidak ada
                if (!isset($route->schedule_description)) {
                    $route->schedule_description = $route->schedules->count() . ' jadwal tersedia';
                }
                return $route;
            });

        // Kembalikan sebagai JSON dengan header yang tepat
        return response()->json($allRoutes, 200, [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => '*'
        ]);
    }
}
