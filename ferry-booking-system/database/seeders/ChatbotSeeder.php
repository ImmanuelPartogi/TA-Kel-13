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
        // Buat kategori
        $generalInfo = ChatCategory::create([
            'name' => 'Informasi Umum',
            'description' => 'Informasi umum tentang layanan feri'
        ]);

        $scheduleInfo = ChatCategory::create([
            'name' => 'Jadwal & Rute',
            'description' => 'Pertanyaan terkait jadwal dan rute feri'
        ]);

        $bookingInfo = ChatCategory::create([
            'name' => 'Pemesanan',
            'description' => 'Pertanyaan terkait pemesanan tiket'
        ]);

        $paymentInfo = ChatCategory::create([
            'name' => 'Pembayaran',
            'description' => 'Pertanyaan terkait metode pembayaran'
        ]);

        $greetings = ChatCategory::create([
            'name' => 'Salam & Percakapan Umum',
            'description' => 'Salam dan percakapan umum'
        ]);

        // Template untuk salam dan percakapan umum
        ChatTemplate::create([
            'category_id' => $greetings->id,
            'question_pattern' => 'halo',
            'answer' => 'Halo! Selamat datang di layanan chatbot Ferry Booking. Ada yang bisa saya bantu terkait layanan feri kami?',
            'keywords' => 'halo,hai,helo,hi,selamat',
            'priority' => 10
        ]);

        ChatTemplate::create([
            'category_id' => $greetings->id,
            'question_pattern' => 'terimakasih',
            'answer' => 'Sama-sama! Senang bisa membantu Anda. Jika ada pertanyaan lain, jangan ragu untuk bertanya kembali.',
            'keywords' => 'terimakasih,makasih,terima kasih,thank,thanks',
            'priority' => 10
        ]);

        // Template untuk informasi umum
        ChatTemplate::create([
            'category_id' => $generalInfo->id,
            'question_pattern' => 'apa itu ferry booking app',
            'answer' => 'Ferry Booking App adalah aplikasi untuk memesan tiket feri secara online. Anda dapat melihat jadwal, memilih rute, dan melakukan pembayaran langsung melalui aplikasi ini.',
            'keywords' => 'app,aplikasi,ferry booking,tentang,apa',
            'priority' => 8
        ]);

        // Template untuk jadwal dan rute
        ChatTemplate::create([
            'category_id' => $scheduleInfo->id,
            'question_pattern' => 'jadwal feri',
            'answer' => 'Anda dapat melihat jadwal feri terbaru di aplikasi pada menu "Jadwal & Rute". Anda juga bisa mencari jadwal berdasarkan rute yang diinginkan.',
            'keywords' => 'jadwal,schedule,kapan,jam,waktu',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $scheduleInfo->id,
            'question_pattern' => 'rute feri',
            'answer' => 'Aplikasi kami melayani berbagai rute feri. Anda dapat melihat rute yang tersedia di menu "Jadwal & Rute" dan memilih rute yang sesuai dengan tujuan Anda.',
            'keywords' => 'rute,route,jalur,tujuan,dari,ke',
            'priority' => 8
        ]);

        // Template untuk pemesanan
        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'cara pesan tiket',
            'answer' => 'Untuk memesan tiket: 1) Pilih rute dan jadwal yang diinginkan, 2) Isi detail penumpang dan kendaraan (jika ada), 3) Pilih metode pembayaran, 4) Selesaikan pembayaran, 5) Tiket akan dikirim ke email dan terlihat di aplikasi.',
            'keywords' => 'pesan,booking,tiket,ticket,order,cara,bagaimana',
            'priority' => 9
        ]);

        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'batal pesan',
            'answer' => 'Untuk membatalkan pemesanan, silakan buka menu "Tiket Saya", pilih tiket yang ingin dibatalkan, dan klik tombol "Batalkan". Perhatikan bahwa kebijakan pengembalian dana tergantung pada waktu pembatalan.',
            'keywords' => 'batal,cancel,refund,pembatalan,hapus,uang kembali',
            'priority' => 7
        ]);

        // Template untuk pembayaran
        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'metode pembayaran',
            'answer' => 'Kami menerima berbagai metode pembayaran: transfer bank, e-wallet (OVO, GoPay, Dana, LinkAja), kartu kredit/debit, dan virtual account. Anda dapat memilih metode yang paling nyaman saat checkout.',
            'keywords' => 'bayar,payment,metode,cara bayar,pembayaran',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'status pembayaran',
            'answer' => 'Untuk memeriksa status pembayaran, silakan buka menu "Tiket Saya" dan pilih pemesanan yang ingin Anda cek. Status pembayaran akan ditampilkan di halaman detail pemesanan.',
            'keywords' => 'status,bayar,payment,sudah,berhasil,gagal',
            'priority' => 7
        ]);
    }
}
