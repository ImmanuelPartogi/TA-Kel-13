<?php

// database/seeders/OperatorSeeder.php
namespace Database\Seeders;

use App\Models\Operator;
use App\Models\Route;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OperatorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create operators after routes have been seeded
        $routes = Route::all();

        if ($routes->isEmpty()) {
            // If there are no routes yet, seed with null assigned_routes
            // The assigned_routes can be updated later
            Operator::create([
                'email' => 'operator1@ferrybooking.com',
                'company_name' => 'Ferry Line Operator 1',
                'phone_number' => '081234567890',
                'license_number' => 'FL-2023-001',
                'fleet_size' => 5,
                'company_address' => 'Jl. Pelabuhan No. 123, Jakarta',
                'password' => Hash::make('password'),
                'role' => 'OPERATOR',
                'assigned_routes' => null,
            ]);

            Operator::create([
                'email' => 'operator2@ferrybooking.com',
                'company_name' => 'Ferry Line Operator 2',
                'phone_number' => '081234567891',
                'license_number' => 'FL-2023-002',
                'fleet_size' => 3,
                'company_address' => 'Jl. Pelabuhan No. 456, Surabaya',
                'password' => Hash::make('password'),
                'role' => 'OPERATOR',
                'assigned_routes' => null,
            ]);
        } else {
            // Assign specific routes to operators
            $routeIds = $routes->pluck('id')->toArray();
            $halfCount = ceil(count($routeIds) / 2);

            $operator1Routes = array_slice($routeIds, 0, $halfCount);
            $operator2Routes = array_slice($routeIds, $halfCount);

            Operator::create([
                'email' => 'operator1@ferrybooking.com',
                'company_name' => 'Ferry Line Operator 1',
                'phone_number' => '081234567890',
                'license_number' => 'FL-2023-001',
                'fleet_size' => 5,
                'company_address' => 'Jl. Pelabuhan No. 123, Jakarta',
                'password' => Hash::make('password'),
                'role' => 'OPERATOR',
                'assigned_routes' => json_encode($operator1Routes),
            ]);

            Operator::create([
                'email' => 'operator2@ferrybooking.com',
                'company_name' => 'Ferry Line Operator 2',
                'phone_number' => '081234567891',
                'license_number' => 'FL-2023-002',
                'fleet_size' => 3,
                'company_address' => 'Jl. Pelabuhan No. 456, Surabaya',
                'password' => Hash::make('password'),
                'role' => 'OPERATOR',
                'assigned_routes' => json_encode($operator2Routes),
            ]);
        }
    }
}
