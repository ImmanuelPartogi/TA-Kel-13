<?php

namespace Database\Seeders;

use App\Models\Ferry;
use App\Models\Route;
use App\Models\Schedule;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $routes = Route::all();
        $ferries = Ferry::all();

        if ($routes->isEmpty() || $ferries->isEmpty()) {
            return;
        }

        foreach ($routes as $route) {
            // Pemetaan kapal berdasarkan rute
            $routeFerries = $ferries->filter(function ($ferry) use ($route) {
                if (str_contains($route->route_code, 'BLG')) {
                    return str_contains($ferry->name, 'Balige') ||
                           str_contains($ferry->name, 'Toba') ||
                           str_contains($ferry->name, 'Sumatra');
                }

                // Tambahkan kondisi lain jika ada rute lain
                return false;
            });

            if ($routeFerries->isEmpty()) {
                continue;
            }

            $departureTimes = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

            foreach ($routeFerries as $index => $ferry) {
                $departureTime = $departureTimes[$index % count($departureTimes)];
                $durationMinutes = $route->duration;
                $arrivalTime = date('H:i', strtotime($departureTime) + ($durationMinutes * 60));

                Schedule::create([
                    'route_id' => $route->id,
                    'ferry_id' => $ferry->id,
                    'departure_time' => $departureTime,
                    'arrival_time' => $arrivalTime,
                    'days' => '1,2,3,4,5,6,7',
                    'status' => 'ACTIVE',
                ]);
            }
        }
    }
}
