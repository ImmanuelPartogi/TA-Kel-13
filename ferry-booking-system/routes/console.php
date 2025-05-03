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

// Command untuk testing manual
Artisan::command('test:payment-polling', function () {
    $this->info('Testing payment polling...');
    $this->call('payments:check-pending');
})->purpose('Test the payment polling system');

Schedule::command('tickets:update-expired')
    ->everyMinute()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/ticket-updates.log'));

Schedule::command('payments:check-pending')
    ->everyMinute()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/payment-polling.log'));

Schedule::command('notifications:send-boarding-reminders')
    ->everyMinute()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/payment-polling.log'));

Schedule::command('schedules:update-expired')->everyMinute();
Schedule::command('schedules:update-expired-statuses')->everyMinute();

Schedule::command('payment:check-status')
     ->everyMinute()
     ->withoutOverlapping()
     ->appendOutputTo(storage_path('logs/payment-check.log'));

