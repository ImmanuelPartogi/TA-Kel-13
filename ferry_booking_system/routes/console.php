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

Schedule::command('tickets:manage-statuses')
    ->everyMinute()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/ticket-status-management.log'));

// Command terpadu untuk notifikasi
Schedule::command('notifications:manage')
    ->everyMinute()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/notification-management.log'));

// Command terpadu untuk jadwal
Schedule::command('schedules:manage-statuses')
    ->everyMinute()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/schedule-status-management.log'));

Schedule::command('payments:check-expiry')
    ->everyMinute()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/payment-expiry.log'));

Schedule::command('chatbot:manage --action=cleanup')
    ->daily()
    ->appendOutputTo(storage_path('logs/chatbot-cleanup.log'));

// Schedule untuk pembersihan notifikasi (perlu dijalankan terpisah dan jarang)
Schedule::command('notifications:manage --action=cleanup')
    ->daily()
    ->appendOutputTo(storage_path('logs/notification-cleanup.log'));
