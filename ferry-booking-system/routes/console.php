<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

// Definisi command biasa
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Konfigurasi scheduler
Schedule::command('payments:check-pending')
    ->everyMinute() // Setiap menit untuk memastikan cepat terdeteksi
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/payment-polling.log'));

// Command untuk testing manual
Artisan::command('test:payment-polling', function () {
    $this->info('Testing payment polling...');
    $this->call('payments:check-pending');
})->purpose('Test the payment polling system');
