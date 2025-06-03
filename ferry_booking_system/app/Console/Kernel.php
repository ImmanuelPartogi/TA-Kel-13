<?php
// app/Console/Kernel.php
namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\Log;

class Kernel extends ConsoleKernel
{
    // File: app/Console/Kernel.php

    protected function schedule(Schedule $schedule)
    {
        // Command yang sudah ada
        $schedule->command('tickets:manage-statuses')
            ->everyMinute()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/ticket-status-management.log'));

        $schedule->command('notifications:manage')
            ->everyMinute()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/notification-management.log'));

        $schedule->command('schedules:manage-statuses')
            ->everyMinute()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/schedule-status-management.log'));

        // Tambahkan command baru untuk payment expiry
        $schedule->command('payments:check-expiry')
            ->everyMinute()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/payment-expiry.log'));

        $schedule->command('chatbot:manage --action=cleanup')
            ->daily()
            ->appendOutputTo(storage_path('logs/chatbot-cleanup.log'));

        // Command lainnya
        $schedule->command('notifications:manage --action=cleanup')
            ->daily()
            ->appendOutputTo(storage_path('logs/notification-cleanup.log'));
    }

    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');
        require base_path('routes/console.php');
    }
}
