<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Tetapkan timezone default
        date_default_timezone_set('Asia/Jakarta');

        // Atur format default Carbon
        Carbon::setToStringFormat('Y-m-d H:i:s');

        // Daftarkan command
        if ($this->app->runningInConsole()) {
            $this->commands([
            ]);
        }
    }
}
