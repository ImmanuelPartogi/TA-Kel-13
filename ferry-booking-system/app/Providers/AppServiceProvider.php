<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Console\Scheduling\Schedule;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Daftarkan command
        if ($this->app->runningInConsole()) {
            $this->commands([
                \App\Console\Commands\CheckPendingPayments::class,
                \App\Console\Commands\UpdateExpiredTickets::class,
            ]);
        }
    }
}
