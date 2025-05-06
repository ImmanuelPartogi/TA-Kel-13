<?php

namespace App\Console\Commands;

use App\Helpers\NotificationHelper;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupNotifications extends Command
{
    protected $signature = 'notifications:cleanup {--read=30 : Hari untuk menyimpan notifikasi yang sudah dibaca} {--unread=90 : Hari untuk menyimpan notifikasi yang belum dibaca}';
    protected $description = 'Membersihkan notifikasi lama berdasarkan kebijakan retensi';

    public function handle()
    {
        $daysToKeepRead = (int)$this->option('read');
        $daysToKeepUnread = (int)$this->option('unread');

        $this->info('Mulai membersihkan notifikasi lama...');

        try {
            $count = NotificationHelper::cleanupOldNotifications($daysToKeepRead, $daysToKeepUnread);

            $this->info("Berhasil menghapus {$count} notifikasi lama.");

            return 0;
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            Log::error('Error membersihkan notifikasi lama', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return 1;
        }
    }
}
