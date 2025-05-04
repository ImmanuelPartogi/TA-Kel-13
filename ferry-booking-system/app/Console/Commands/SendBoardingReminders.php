<?php

namespace App\Console\Commands;

use App\Helpers\NotificationHelper;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendBoardingReminders extends Command
{
    protected $signature = 'notifications:send-boarding-reminders';
    protected $description = 'Kirim notifikasi pengingat boarding untuk keberangkatan dalam 1 jam';

    public function handle()
    {
        $this->info('Mulai mengirim notifikasi pengingat boarding...');
        Log::info('Starting boarding reminder notifications');

        try {
            // Panggil helper untuk mengirim notifikasi boarding (1 jam)
            $count = NotificationHelper::sendBoardingReminders(1);

            $this->info("Berhasil mengirim {$count} notifikasi pengingat boarding.");
            Log::info("Successfully sent {$count} boarding reminders");

            return 0;
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            Log::error('Error sending boarding reminder notifications', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return 1;
        }
    }
}
