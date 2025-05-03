<?php

// database/seeders/DatabaseSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            OperatorSeeder::class,
            RouteSeeder::class,
            FerrySeeder::class,
            // ScheduleSeeder::class,
            UserSeeder::class,
            ChatbotSeeder::class
        ]);
    }
}
