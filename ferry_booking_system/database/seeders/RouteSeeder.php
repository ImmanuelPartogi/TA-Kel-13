<?php

namespace Database\Seeders;

use App\Models\Route;
use Illuminate\Database\Seeder;

class RouteSeeder extends Seeder
{
    public function run(): void
    {
        $routes = [
            // [
            //     'origin' => 'Balige',
            //     'destination' => 'Onan Runggu',
            //     'route_code' => 'BLG-ONG',
            //     'distance' => 18.0, // Perkiraan jarak dalam km
            //     'duration' => 90, // 1.5 jam
            //     'base_price' => 24500, // Penumpang dewasa
            //     'status' => 'ACTIVE',
            // ],
            // [
            //     'origin' => 'Onan Runggu',
            //     'destination' => 'Balige',
            //     'route_code' => 'ONG-BLG',
            //     'distance' => 18.0,
            //     'duration' => 90,
            //     'base_price' => 24500,
            //     'status' => 'ACTIVE',
            // ],
            // [
            //     'origin' => 'Balige',
            //     'destination' => 'Nainggolan',
            //     'route_code' => 'BLG-NGL',
            //     'distance' => 20.0,
            //     'duration' => 90,
            //     'base_price' => 20000, // Estimasi tarif penumpang kapal rakyat
            //     'status' => 'ACTIVE',
            // ],
        ];

        foreach ($routes as $route) {
            Route::create($route);
        }
    }
}
