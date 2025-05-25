<?php

namespace Database\Seeders;

use App\Models\VehicleCategory;
use Illuminate\Database\Seeder;

class VehicleCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'code' => 'Gol I',
                'name' => 'Golongan I',
                'description' => 'Sepeda',
                'vehicle_type' => 'MOTORCYCLE',
                'base_price' => 12300.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol II',
                'name' => 'Golongan II',
                'description' => 'Sepeda Motor s/d 500 CC',
                'vehicle_type' => 'MOTORCYCLE',
                'base_price' => 21800.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol III',
                'name' => 'Golongan III',
                'description' => 'Sepeda Motor diatas 500 CC / Roda 3',
                'vehicle_type' => 'MOTORCYCLE',
                'base_price' => 41000.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol IV-a',
                'name' => 'Golongan IV-a',
                'description' => 'Jeep, Sedan, Mini Bus',
                'vehicle_type' => 'CAR',
                'base_price' => 149300.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol IV-b',
                'name' => 'Golongan IV-b',
                'description' => 'Pick-Up, Box, Double Kabin',
                'vehicle_type' => 'PICKUP',
                'base_price' => 150560.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol V-a',
                'name' => 'Golongan V-a',
                'description' => 'Bus 3/4, Hiace, Elf',
                'vehicle_type' => 'BUS',
                'base_price' => 249600.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol V-b',
                'name' => 'Golongan V-b',
                'description' => 'Truck/Tangki, Colt Diesel',
                'vehicle_type' => 'TRUCK',
                'base_price' => 270240.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol VI-a',
                'name' => 'Golongan VI-a',
                'description' => 'Bus Besar Pariwisata',
                'vehicle_type' => 'BUS',
                'base_price' => 411200.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol VI-b',
                'name' => 'Golongan VI-b',
                'description' => 'Truck Besar, Fuso, Tangki',
                'vehicle_type' => 'TRUCK',
                'base_price' => 447480.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol VII',
                'name' => 'Golongan VII',
                'description' => 'Truck Tronton/Tangki',
                'vehicle_type' => 'TRONTON',
                'base_price' => 627800.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol VIII',
                'name' => 'Golongan VIII',
                'description' => 'Truck Trailer/Trinton',
                'vehicle_type' => 'TRONTON',
                'base_price' => 853400.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol IX',
                'name' => 'Golongan IX',
                'description' => 'Roda Karet, Alat Berat, Truk Gandeng',
                'vehicle_type' => 'TRONTON',
                'base_price' => 1227600.00,
                'is_active' => true,
            ],
        ];
    }
}
