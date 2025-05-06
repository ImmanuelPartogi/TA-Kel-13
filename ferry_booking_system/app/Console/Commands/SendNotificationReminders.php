<?php

namespace App\Console\Commands;

use App\Helpers\NotificationHelper;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendNotificationReminders extends Command
{
    protected $signature = 'notifications:send-reminders {--type=all : Tipe reminder (checkin/boarding/payment/all)}';
    protected $description = 'Kirim notifikasi pengingat untuk check-in, boarding, dan pembayaran';

    public function handle()
    {
        $type = $this->option('type');
        $count = 0;

        $this->info('Mulai mengirim notifikasi pengingat...');

        try {
            if ($type === 'all' || $type === 'checkin') {
                $checkinCount = NotificationHelper::sendCheckinReminders();
                $this->info("Berhasil mengirim {$checkinCount} notifikasi pengingat check-in.");
                $count += $checkinCount;
            }

            if ($type === 'all' || $type === 'boarding') {
                $boardingCount = NotificationHelper::sendBoardingReminders();
                $this->info("Berhasil mengirim {$boardingCount} notifikasi pengingat boarding.");
                $count += $boardingCount;
            }

            if ($type === 'all' || $type === 'payment') {
                $paymentCount = NotificationHelper::sendPaymentReminders();
                $this->info("Berhasil mengirim {$paymentCount} notifikasi pengingat pembayaran.");
                $count += $paymentCount;
            }

            $this->info("Total {$count} notifikasi berhasil dikirim.");

            return 0;
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            Log::error('Error mengirim notifikasi pengingat', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return 1;
        }
    }
}
