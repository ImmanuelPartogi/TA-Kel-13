<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChatCategory;
use App\Models\ChatTemplate;

class ChatbotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kategori Informasi Umum
        $infoCategory = ChatCategory::create([
            'name' => 'Informasi Umum',
            'description' => 'Pertanyaan umum tentang layanan feri'
        ]);

        // Kategori Pemesanan
        $bookingCategory = ChatCategory::create([
            'name' => 'Pemesanan Tiket',
            'description' => 'Pertanyaan terkait pemesanan tiket'
        ]);

        // Kategori Pembayaran
        $paymentCategory = ChatCategory::create([
            'name' => 'Pembayaran',
            'description' => 'Pertanyaan terkait pembayaran tiket'
        ]);

        // Kategori Refund & Pembatalan
        $refundCategory = ChatCategory::create([
            'name' => 'Refund & Pembatalan',
            'description' => 'Pertanyaan terkait refund dan pembatalan tiket'
        ]);

        // Template untuk Informasi Umum
        ChatTemplate::create([
            'category_id' => $infoCategory->id,
            'question_pattern' => 'jadwal',
            'answer' => 'Jadwal keberangkatan feri dapat Anda lihat di menu "Jadwal" pada aplikasi atau website kami. Anda juga bisa mencari jadwal spesifik dengan memilih rute keberangkatan dan tanggal pada menu pencarian.',
            'keywords' => 'jadwal,keberangkatan,schedule,jam,waktu',
            'priority' => 10
        ]);

        // Tambahkan template lainnya seperti yang sudah ada di contoh sebelumnya
    }
}
