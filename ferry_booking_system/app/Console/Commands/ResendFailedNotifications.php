<?php

namespace App\Console\Commands;

use App\Helpers\NotificationHelper;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ResendFailedNotifications extends Command
{
    protected $signature = 'notifications:resend-failed {--max-retries=3} {--max-age=24}';
    protected $description = 'Mengirim ulang notifikasi yang gagal terkirim';

    /**
     * Handle the console command.
     *
     * @return int
     */
    public function handle()
    {
        $maxRetries = $this->option('max-retries');
        $maxAgeHours = $this->option('max-age');

        $this->info("Memulai proses pengiriman ulang notifikasi yang gagal...");
        $this->info("Max retries: {$maxRetries}, Max age: {$maxAgeHours} jam");

        try {
            $count = NotificationHelper::resendFailedNotifications($maxRetries, $maxAgeHours);

            $this->info("Berhasil mengirim ulang {$count} notifikasi");
            return 0;
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            Log::error("Error pada command resend-failed: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}
