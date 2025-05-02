<?php
// app/Console/Kernel.php
namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\Log;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('tickets:update-expired')
            ->everyMinute()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/ticket-updates.log'));

        $schedule->command('payments:check-pending')
            ->everyMinute()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/payment-polling.log'));

        $schedule->command('notifications:send-boarding-reminders')
            ->everyMinute()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/payment-polling.log'));

        $schedule->command('schedules:update-expired')->everyMinute();
        $schedule->command('schedules:update-expired-statuses')->everyMinute();
    }

    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');
    }
}
