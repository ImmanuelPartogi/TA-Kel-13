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
        try {
            Log::info('Memulai proses pengiriman notifikasi boarding...');

            // Panggil helper dengan parameter default (1 jam)
            $count = NotificationHelper::sendBoardingReminders();

            $this->info("Berhasil mengirim {$count} notifikasi pengingat boarding");
            Log::info("Berhasil mengirim {$count} notifikasi pengingat boarding");
            return 0;
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            Log::error('Error mengirim notifikasi boarding', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}
