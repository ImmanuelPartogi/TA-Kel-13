<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ChatMessage;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ManageChatbot extends Command
{
    /**
     * Nama dan tanda command
     *
     * @var string
     */
    protected $signature = 'chatbot:manage 
                            {--days=7 : Jumlah hari untuk menghapus pesan lama}
                            {--action=cleanup : Aksi yang akan dilakukan (cleanup)}';

    /**
     * Deskripsi command
     *
     * @var string
     */
    protected $description = 'Mengelola chatbot - menghapus pesan yang sudah lebih dari N hari';

    /**
     * Eksekusi command
     */
    public function handle()
    {
        // Ambil parameter aksi dari opsi command
        $action = $this->option('action');
        
        if ($action === 'cleanup') {
            $this->cleanupOldMessages();
        } else {
            $this->error("Aksi '{$action}' tidak valid. Gunakan 'cleanup'.");
            return 1; // Kode error
        }
        
        return 0; // Kode sukses
    }
    
    /**
     * Membersihkan pesan lama
     */
    protected function cleanupOldMessages()
    {
        // Ambil parameter hari dari opsi command, default 7 hari
        $days = $this->option('days');
        
        // Hitung tanggal cutoff (7 hari yang lalu)
        $cutoffDate = Carbon::now()->subDays($days);
        
        // Hitung jumlah pesan yang akan dihapus untuk logging
        $messageCount = ChatMessage::where('created_at', '<', $cutoffDate)->count();
        
        // Hapus pesan yang lebih tua dari cutoff date
        $deleted = ChatMessage::where('created_at', '<', $cutoffDate)->delete();
        
        // Log hasil
        Log::info("Chatbot management: {$deleted} pesan yang lebih dari {$days} hari telah dihapus.");
        
        // Tampilkan output di console
        $this->info("Berhasil menghapus {$deleted} pesan yang berusia lebih dari {$days} hari.");
    }
}