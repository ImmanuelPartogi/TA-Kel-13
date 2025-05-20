<?php

namespace App\Console\Commands;

use App\Helpers\NotificationHelper;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ManageNotifications extends Command
{
    protected $signature = 'notifications:manage
                            {--action=all : Tindakan yang akan dilakukan (all/send/resend/cleanup)}
                            {--type=all : Tipe notifikasi untuk dikirim (all/checkin/boarding/payment)}
                            {--max-retries=3 : Maksimum percobaan kirim ulang untuk notifikasi gagal}
                            {--max-age=24 : Maksimum umur notifikasi gagal dalam jam}
                            {--read=30 : Hari untuk menyimpan notifikasi yang sudah dibaca}
                            {--unread=90 : Hari untuk menyimpan notifikasi yang belum dibaca}';

    protected $description = 'Command terpadu untuk mengelola semua aspek notifikasi';

    public function handle()
    {
        $startTime = microtime(true);
        $this->info('Memulai pengelolaan notifikasi: ' . now()->format('Y-m-d H:i:s'));

        try {
            $action = $this->option('action');
            $success = true;

            // Eksekusi berdasarkan tindakan yang dipilih
            if ($action === 'all' || $action === 'send') {
                $success = $this->sendNotifications() && $success;
            }

            if ($action === 'all' || $action === 'resend') {
                $success = $this->resendFailedNotifications() && $success;
            }

            if ($action === 'all' || $action === 'cleanup') {
                $success = $this->cleanupOldNotifications() && $success;
            }

            $executionTime = round(microtime(true) - $startTime, 2);
            $this->info("Pengelolaan notifikasi selesai dalam {$executionTime} detik");

            return $success ? 0 : 1;
        } catch (\Exception $e) {
            $this->error('Pengelolaan notifikasi gagal: ' . $e->getMessage());
            Log::error('Error dalam pengelolaan notifikasi', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return 1;
        }
    }

    /**
     * Mengirimkan notifikasi pengingat berdasarkan tipe
     */
    private function sendNotifications()
    {
        $type = $this->option('type');
        $count = 0;
        $success = true;

        $this->info('1. Mengirim notifikasi pengingat...');

        try {
            if ($type === 'all' || $type === 'checkin') {
                $checkinCount = NotificationHelper::sendCheckinReminders();
                $this->info("   - {$checkinCount} notifikasi pengingat check-in berhasil dikirim");
                $count += $checkinCount;
            }

            if ($type === 'all' || $type === 'boarding') {
                $boardingCount = NotificationHelper::sendBoardingReminders();
                $this->info("   - {$boardingCount} notifikasi pengingat boarding berhasil dikirim");
                $count += $boardingCount;
            }

            if ($type === 'all' || $type === 'payment') {
                $paymentCount = NotificationHelper::sendPaymentReminders();
                $this->info("   - {$paymentCount} notifikasi pengingat pembayaran berhasil dikirim");
                $count += $paymentCount;
            }

            $this->info("   Total {$count} notifikasi berhasil dikirim.");
            return true;
        } catch (\Exception $e) {
            $this->error("   Error mengirim notifikasi: " . $e->getMessage());
            Log::error('Error mengirim notifikasi pengingat', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Mengirim ulang notifikasi yang gagal
     */
    private function resendFailedNotifications()
    {
        $maxRetries = $this->option('max-retries');
        $maxAgeHours = $this->option('max-age');

        $this->info('2. Mengirim ulang notifikasi yang gagal terkirim...');
        $this->info("   - Max retries: {$maxRetries}, Max age: {$maxAgeHours} jam");

        try {
            $count = NotificationHelper::resendFailedNotifications($maxRetries, $maxAgeHours);

            $this->info("   - {$count} notifikasi berhasil dikirim ulang");
            return true;
        } catch (\Exception $e) {
            $this->error("   Error mengirim ulang notifikasi: " . $e->getMessage());
            Log::error("Error mengirim ulang notifikasi gagal", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Membersihkan notifikasi lama
     */
    private function cleanupOldNotifications()
    {
        $daysToKeepRead = (int)$this->option('read');
        $daysToKeepUnread = (int)$this->option('unread');

        $this->info('3. Membersihkan notifikasi lama...');
        $this->info("   - Menyimpan notifikasi dibaca: {$daysToKeepRead} hari, belum dibaca: {$daysToKeepUnread} hari");

        try {
            $count = NotificationHelper::cleanupOldNotifications($daysToKeepRead, $daysToKeepUnread);

            $this->info("   - {$count} notifikasi lama berhasil dihapus");
            return true;
        } catch (\Exception $e) {
            $this->error("   Error membersihkan notifikasi: " . $e->getMessage());
            Log::error('Error membersihkan notifikasi lama', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }
}
