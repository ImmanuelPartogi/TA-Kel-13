<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Jalankan command setiap 5 menit
        $schedule->command('payments:check-pending')
            ->everyMinute() // Polling setiap menit (bukan setiap 5 menit)
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/payment-polling.log'));
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');
    }
}
