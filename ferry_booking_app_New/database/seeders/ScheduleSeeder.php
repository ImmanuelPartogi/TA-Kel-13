<?php

// database/seeders/ScheduleSeeder.php
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
        // Get all routes
        $routes = Route::all();
        $ferries = Ferry::all();

        if ($routes->isEmpty() || $ferries->isEmpty()) {
            return;
        }

        // Create schedules for each route
        foreach ($routes as $route) {
            // Get ferries for this route
            $routeFerries = $ferries->filter(function ($ferry) use ($route) {
                // For simplicity, assign ferries based on route name patterns
                if (str_contains($route->route_code, 'MRK') || str_contains($route->route_code, 'BKH')) {
                    return str_contains($ferry->name, 'Jatra');
                } elseif (str_contains($route->route_code, 'KTP') || str_contains($route->route_code, 'GLM')) {
                    return str_contains($ferry->name, 'Gilimanuk') || str_contains($ferry->name, 'Bali');
                } elseif (str_contains($route->route_code, 'PDB') || str_contains($route->route_code, 'LMB')) {
                    return str_contains($ferry->name, 'Lombok') || str_contains($ferry->name, 'Nusa');
                } elseif (str_contains($route->route_code, 'TJP') || str_contains($route->route_code, 'TJK')) {
                    return str_contains($ferry->name, 'Jakarta') || str_contains($ferry->name, 'Surabaya');
                }
                return false;
            });

            if ($routeFerries->isEmpty()) {
                continue;
            }

            // Create different departure times
            $departureTimes = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

            // Create a schedule for each ferry
            foreach ($routeFerries as $index => $ferry) {
                // Calculate arrival time based on route duration
                $departureTime = $departureTimes[$index % count($departureTimes)];
                $durationMinutes = $route->duration;
                $arrivalTime = date('H:i', strtotime($departureTime) + ($durationMinutes * 60));

                // Create schedules for every day of the week
                Schedule::create([
                    'route_id' => $route->id,
                    'ferry_id' => $ferry->id,
                    'departure_time' => $departureTime,
                    'arrival_time' => $arrivalTime,
                    'days' => '1,2,3,4,5,6,7', // Monday to Sunday
                    'status' => 'ACTIVE',
                ]);
            }
        }
    }
}
