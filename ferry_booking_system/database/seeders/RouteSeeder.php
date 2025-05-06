<?php

namespace Database\Seeders;

use App\Models\Route;
use Illuminate\Database\Seeder;

class RouteSeeder extends Seeder
{
    public function run(): void
    {
        $routes = [
            [
                'origin' => 'Balige',
                'destination' => 'Onan Runggu',
                'route_code' => 'BLG-ONG',
                'distance' => 18.0, // Perkiraan jarak dalam km
                'duration' => 90, // 1.5 jam
                'base_price' => 24500, // Penumpang dewasa
                'motorcycle_price' => 24500,
                'car_price' => 174500,
                'bus_price' => 366000,
                'truck_price' => 408500,
                'status' => 'ACTIVE',
            ],
            [
                'origin' => 'Onan Runggu',
                'destination' => 'Balige',
                'route_code' => 'ONG-BLG',
                'distance' => 18.0,
                'duration' => 90,
                'base_price' => 24500,
                'motorcycle_price' => 24500,
                'car_price' => 174500,
                'bus_price' => 366000,
                'truck_price' => 408500,
                'status' => 'ACTIVE',
            ],
            [
                'origin' => 'Balige',
                'destination' => 'Nainggolan',
                'route_code' => 'BLG-NGL',
                'distance' => 20.0,
                'duration' => 90,
                'base_price' => 20000, // Estimasi tarif penumpang kapal rakyat
                'motorcycle_price' => 0,
                'car_price' => 0,
                'bus_price' => 0,
                'truck_price' => 0,
                'status' => 'ACTIVE',
            ],
            [
                'origin' => 'Balige',
                'destination' => 'Mogang',
                'route_code' => 'BLG-MGG',
                'distance' => 22.0,
                'duration' => 100,
                'base_price' => 20000,
                'motorcycle_price' => 0,
                'car_price' => 0,
                'bus_price' => 0,
                'truck_price' => 0,
                'status' => 'ACTIVE',
            ],
            [
                'origin' => 'Balige',
                'destination' => 'Bakkara',
                'route_code' => 'BLG-BKR',
                'distance' => 35.0,
                'duration' => 120,
                'base_price' => 25000,
                'motorcycle_price' => 0,
                'car_price' => 0,
                'bus_price' => 0,
                'truck_price' => 0,
                'status' => 'ACTIVE',
            ],
            [
                'origin' => 'Balige',
                'destination' => 'Muara',
                'route_code' => 'BLG-MRA',
                'distance' => 30.0,
                'duration' => 110,
                'base_price' => 25000,
                'motorcycle_price' => 0,
                'car_price' => 0,
                'bus_price' => 0,
                'truck_price' => 0,
                'status' => 'ACTIVE',
            ],
            [
                'origin' => 'Balige',
                'destination' => 'Onan Baru',
                'route_code' => 'BLG-ONB',
                'distance' => 12.0,
                'duration' => 70,
                'base_price' => 20000,
                'motorcycle_price' => 0,
                'car_price' => 0,
                'bus_price' => 0,
                'truck_price' => 0,
                'status' => 'ACTIVE',
            ],
        ];

        foreach ($routes as $route) {
            Route::create($route);
        }
    }
}
