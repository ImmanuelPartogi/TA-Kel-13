<?php

// database/seeders/RouteSeeder.php
namespace Database\Seeders;

use App\Models\Route;
use Illuminate\Database\Seeder;

class RouteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Common ferry routes in Indonesia
        $routes = [
            [
                'origin' => 'Merak',
                'destination' => 'Bakauheni',
                'route_code' => 'MRK-BKH',
                'distance' => 42.0,
                'duration' => 120, // 2 hours in minutes
                'base_price' => 50000, // Rp 50.000 per passenger
                'motorcycle_price' => 150000, // Rp 150.000 per motorcycle
                'car_price' => 300000, // Rp 300.000 per car
                'bus_price' => 450000, // Rp 450.000 per bus
                'truck_price' => 500000, // Rp 500.000 per truck
                'status' => 'ACTIVE',
            ],
            [
                'origin' => 'Bakauheni',
                'destination' => 'Merak',
                'route_code' => 'BKH-MRK',
                'distance' => 42.0,
                'duration' => 120, // 2 hours in minutes
                'base_price' => 50000, // Rp 50.000 per passenger
                'motorcycle_price' => 150000, // Rp 150.000 per motorcycle
                'car_price' => 300000, // Rp 300.000 per car
                'bus_price' => 450000, // Rp 450.000 per bus
                'truck_price' => 500000, // Rp 500.000 per truck
                'status' => 'ACTIVE',
            ],
            [
                'origin' => 'Ketapang',
                'destination' => 'Gilimanuk',
                'route_code' => 'KTP-GLM',
                'distance' => 5.0,
                'duration' => 45, // 45 minutes
                'base_price' => 35000,
                'motorcycle_price' => 100000,
                'car_price' => 250000,
                'bus_price' => 350000,
                'truck_price' => 400000,
                'status' => 'ACTIVE',
            ],
            [
                'origin' => 'Gilimanuk',
                'destination' => 'Ketapang',
                'route_code' => 'GLM-KTP',
                'distance' => 5.0,
                'duration' => 45, // 45 minutes
                'base_price' => 35000,
                'motorcycle_price' => 100000,
                'car_price' => 250000,
                'bus_price' => 350000,
                'truck_price' => 400000,
                'status' => 'ACTIVE',
            ],
            [
                'origin' => 'Padang Bai',
                'destination' => 'Lembar',
                'route_code' => 'PDB-LMB',
                'distance' => 86.0,
                'duration' => 240, // 4 hours
                'base_price' => 60000,
                'motorcycle_price' => 175000,
                'car_price' => 350000,
                'bus_price' => 500000,
                'truck_price' => 550000,
                'status' => 'ACTIVE',
            ],
            [
                'origin' => 'Lembar',
                'destination' => 'Padang Bai',
                'route_code' => 'LMB-PDB',
                'distance' => 86.0,
                'duration' => 240, // 4 hours
                'base_price' => 60000,
                'motorcycle_price' => 175000,
                'car_price' => 350000,
                'bus_price' => 500000,
                'truck_price' => 550000,
                'status' => 'ACTIVE',
            ],
            [
                'origin' => 'Tanjung Priok',
                'destination' => 'Tanjung Perak',
                'route_code' => 'TJP-TJK',
                'distance' => 796.0,
                'duration' => 1440, // 24 hours
                'base_price' => 200000,
                'motorcycle_price' => 300000,
                'car_price' => 600000,
                'bus_price' => 800000,
                'truck_price' => 900000,
                'status' => 'ACTIVE',
            ],
            [
                'origin' => 'Tanjung Perak',
                'destination' => 'Tanjung Priok',
                'route_code' => 'TJK-TJP',
                'distance' => 796.0,
                'duration' => 1440, // 24 hours
                'base_price' => 200000,
                'motorcycle_price' => 300000,
                'car_price' => 600000,
                'bus_price' => 800000,
                'truck_price' => 900000,
                'status' => 'ACTIVE',
            ],
        ];

        foreach ($routes as $route) {
            Route::create($route);
        }
    }
}
