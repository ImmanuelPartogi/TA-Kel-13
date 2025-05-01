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

        $facilities = ChatCategory::create([
            'name' => 'Fasilitas',
            'description' => 'Informasi tentang fasilitas di terminal dan kapal feri'
        ]);

        $vehicles = ChatCategory::create([
            'name' => 'Kendaraan & Bagasi',
            'description' => 'Informasi tentang kendaraan dan bagasi'
        ]);

        $customerService = ChatCategory::create([
            'name' => 'Layanan Pelanggan',
            'description' => 'Bantuan dan layanan pelanggan'
        ]);

        $policies = ChatCategory::create([
            'name' => 'Kebijakan & Peraturan',
            'description' => 'Kebijakan dan peraturan perusahaan'
        ]);

        $faq = ChatCategory::create([
            'name' => 'FAQ',
            'description' => 'Pertanyaan yang sering diajukan'
        ]);

        $accountInfo = ChatCategory::create([
            'name' => 'Akun Pengguna',
            'description' => 'Pertanyaan terkait akun dan registrasi pengguna'
        ]);

        $refundReschedule = ChatCategory::create([
            'name' => 'Refund & Reschedule',
            'description' => 'Informasi tentang refund dan perubahan jadwal'
        ]);

        $additionalServices = ChatCategory::create([
            'name' => 'Layanan Tambahan',
            'description' => 'Informasi tentang layanan tambahan seperti bagasi, makanan, dan prioritas'
        ]);

        $checkin = ChatCategory::create([
            'name' => 'Check-in',
            'description' => 'Informasi tentang proses check-in di pelabuhan'
        ]);

        $security = ChatCategory::create([
            'name' => 'Keamanan & Data',
            'description' => 'Informasi tentang keamanan dan perlindungan data'
        ]);

        $promos = ChatCategory::create([
            'name' => 'Promo & Diskon',
            'description' => 'Informasi tentang promo, diskon, dan program loyalitas'
        ]);

        $travelTips = ChatCategory::create([
            'name' => 'Tips Perjalanan',
            'description' => 'Tips dan saran untuk perjalanan feri yang menyenangkan'
        ]);

        $specialNeeds = ChatCategory::create([
            'name' => 'Kebutuhan Khusus',
            'description' => 'Informasi untuk penumpang dengan kebutuhan khusus'
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

        ChatTemplate::create([
            'category_id' => $greetings->id,
            'question_pattern' => 'selamat pagi',
            'answer' => 'Selamat pagi! Ada yang bisa saya bantu terkait perjalanan feri Anda hari ini?',
            'keywords' => 'pagi,morning,selamat pagi',
            'priority' => 10
        ]);

        ChatTemplate::create([
            'category_id' => $greetings->id,
            'question_pattern' => 'selamat siang',
            'answer' => 'Selamat siang! Bagaimana saya bisa membantu Anda dengan layanan feri kami?',
            'keywords' => 'siang,afternoon,selamat siang',
            'priority' => 10
        ]);

        ChatTemplate::create([
            'category_id' => $greetings->id,
            'question_pattern' => 'selamat malam',
            'answer' => 'Selamat malam! Apa yang bisa saya bantu terkait perjalanan feri Anda?',
            'keywords' => 'malam,sore,evening,night,selamat malam,selamat sore',
            'priority' => 10
        ]);

        ChatTemplate::create([
            'category_id' => $greetings->id,
            'question_pattern' => 'siapa kamu',
            'answer' => 'Saya adalah asisten virtual Ferry Booking, siap membantu Anda dengan informasi, pemesanan, dan pertanyaan tentang layanan feri kami. Bagaimana saya bisa membantu Anda hari ini?',
            'keywords' => 'siapa,kamu,anda,chatbot,bot,asisten,namamu',
            'priority' => 9
        ]);

        ChatTemplate::create([
            'category_id' => $greetings->id,
            'question_pattern' => 'sampai jumpa',
            'answer' => 'Sampai jumpa! Terima kasih telah menghubungi layanan chatbot Ferry Booking. Semoga perjalanan Anda menyenangkan!',
            'keywords' => 'bye,sampai jumpa,selamat tinggal,dadah,goodbye,dah',
            'priority' => 9
        ]);

        // Template additional untuk salam dan percakapan umum
        ChatTemplate::create([
            'category_id' => $greetings->id,
            'question_pattern' => 'apa kabar',
            'answer' => 'Kabar saya baik, terima kasih telah bertanya! Saya siap membantu Anda dengan layanan feri kami. Apa yang dapat saya bantu hari ini?',
            'keywords' => 'kabar,how are you,gimana,bagaimana kabarmu',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $greetings->id,
            'question_pattern' => 'selamat',
            'answer' => 'Terima kasih! Bagaimana saya bisa membantu Anda dengan layanan feri kami hari ini?',
            'keywords' => 'selamat,congratulations,congrats',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $greetings->id,
            'question_pattern' => 'kamu pintar',
            'answer' => 'Terima kasih atas pujiannya! Saya berusaha memberikan informasi terbaik untuk membantu kebutuhan perjalanan feri Anda. Ada yang bisa saya bantu?',
            'keywords' => 'pintar,cerdas,bagus,hebat,keren,smart,good job',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $greetings->id,
            'question_pattern' => 'senang bertemu denganmu',
            'answer' => 'Senang juga bisa berbicara dengan Anda! Saya siap membantu dengan informasi seputar layanan feri kami.',
            'keywords' => 'senang,bertemu,nice to meet you,ketemu,jumpa',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $greetings->id,
            'question_pattern' => 'bisa bahasa inggris',
            'answer' => 'Yes, I can communicate in English as well. However, I\'m primarily designed to serve our Indonesian customers in Bahasa Indonesia. How can I help you with our ferry services today?',
            'keywords' => 'bahasa inggris,english,speak english,berbicara inggris',
            'priority' => 7
        ]);

        // Template untuk informasi umum
        ChatTemplate::create([
            'category_id' => $generalInfo->id,
            'question_pattern' => 'apa itu ferry booking app',
            'answer' => 'Ferry Booking App adalah aplikasi untuk memesan tiket feri secara online. Anda dapat melihat jadwal, memilih rute, dan melakukan pembayaran langsung melalui aplikasi ini.',
            'keywords' => 'app,aplikasi,ferry booking,tentang,apa',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $generalInfo->id,
            'question_pattern' => 'keuntungan menggunakan aplikasi',
            'answer' => 'Keuntungan menggunakan Ferry Booking App:

1) Pemesanan tiket lebih cepat dan mudah,
2) Tidak perlu antre di loket,
3) Pemberitahuan perubahan jadwal secara langsung,
4) Program loyalitas dan promo khusus pengguna aplikasi,
5) Riwayat perjalanan tersimpan, dan 6) Akses ke layanan pelanggan 24/7.',

            'keywords' => 'keuntungan,benefit,manfaat,mengapa,kenapa,kelebihan',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $generalInfo->id,
            'question_pattern' => 'jam operasional',
            'answer' => 'Aplikasi Ferry Booking dapat diakses 24 jam sehari, 7 hari seminggu. Untuk jam operasional terminal feri bervariasi tergantung lokasi. Sebagian besar terminal beroperasi dari pukul 05.00 hingga 22.00 setiap hari. Silakan cek detail operasional terminal spesifik melalui menu "Informasi Terminal" di aplikasi.',
            'keywords' => 'jam,operasional,buka,tutup,waktu,operational hours',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $generalInfo->id,
            'question_pattern' => 'tentang perusahaan',
            'answer' => 'Ferry Booking adalah perusahaan penyedia layanan transportasi feri yang telah beroperasi sejak 2010. Kami melayani berbagai rute domestik dengan armada modern dan terjamin keamanannya. Visi kami adalah menghubungkan pulau-pulau Indonesia dengan layanan transportasi laut yang nyaman, aman, dan terjangkau.',
            'keywords' => 'perusahaan,company,tentang,about,profil,sejarah,history',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $generalInfo->id,
            'question_pattern' => 'lokasi terminal',
            'answer' => 'Informasi lokasi terminal feri dapat dilihat di menu "Terminal & Pelabuhan" pada aplikasi. Anda bisa melihat alamat lengkap, petunjuk arah, fasilitas yang tersedia, dan transportasi umum yang tersedia di sekitar terminal.',
            'keywords' => 'lokasi,terminal,pelabuhan,alamat,dimana,location,port',
            'priority' => 7
        ]);

        // Template tambahan untuk informasi umum
        ChatTemplate::create([
            'category_id' => $generalInfo->id,
            'question_pattern' => 'berapa lama perusahaan beroperasi',
            'answer' => 'Ferry Booking telah beroperasi sejak tahun 2010, yang berarti kami memiliki pengalaman lebih dari 10 tahun dalam menyediakan layanan transportasi feri yang aman dan nyaman di berbagai rute domestik di Indonesia.',
            'keywords' => 'lama,beroperasi,sejak,berdiri,mulai,pengalaman,history',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $generalInfo->id,
            'question_pattern' => 'jenis armada',
            'answer' => 'Ferry Booking mengoperasikan berbagai jenis kapal feri, mulai dari speedboat kapasitas kecil untuk rute pendek, ferry roll-on/roll-off (Ro-Ro) untuk penumpang dan kendaraan, hingga kapal ferry besar dengan fasilitas lengkap untuk rute jarak jauh. Semua armada kami memenuhi standar keselamatan dan memiliki sertifikasi dari otoritas terkait.',
            'keywords' => 'armada,jenis,kapal,speedboat,ro-ro,ferry,feri,ships,boats',
            'priority' => 7
        ]);

        // Template tambahan untuk informasi umum
        ChatTemplate::create([
            'category_id' => $generalInfo->id,
            'question_pattern' => 'penghargaan perusahaan',
            'answer' => 'Ferry Booking telah menerima beberapa penghargaan, termasuk:

1) "Layanan Transportasi Laut Terbaik" tahun 2019,
2) "Aplikasi Transportasi Terinofatif" tahun 2020,
3) "Perusahaan dengan Pelayanan Pelanggan Terbaik" tahun 2021, dan
4) "Green Transportation Award" tahun 2022 untuk inisiatif ramah lingkungan kami. Penghargaan ini merupakan bukti komitmen kami untuk menyediakan layanan berkualitas tinggi.',

            'keywords' => 'penghargaan,award,prestasi,achievement,reward,recognition',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $generalInfo->id,
            'question_pattern' => 'kantor pusat',
            'answer' => 'Kantor pusat Ferry Booking berlokasi di Gedung Maritime Tower, Jalan Sudirman No. 123, Jakarta Pusat. Kami juga memiliki kantor cabang di Surabaya, Bali, Makassar, Balikpapan, dan Medan untuk melayani kebutuhan pelanggan di seluruh Indonesia.',
            'keywords' => 'kantor,pusat,headquarter,office,hq,alamat kantor',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $generalInfo->id,
            'question_pattern' => 'jumlah karyawan',
            'answer' => 'Ferry Booking saat ini mempekerjakan lebih dari 500 karyawan tetap di seluruh Indonesia, termasuk staf kantor, kru kapal, tim teknis, dan petugas terminal. Kami juga bekerja sama dengan lebih dari 200 mitra untuk memberikan layanan terbaik bagi pelanggan kami.',
            'keywords' => 'karyawan,employee,staff,jumlah,berapa,pekerja',
            'priority' => 5
        ]);

        ChatTemplate::create([
            'category_id' => $generalInfo->id,
            'question_pattern' => 'misi perusahaan',
            'answer' => 'Misi Ferry Booking adalah:

        1) Menyediakan transportasi laut yang aman, nyaman, dan terjangkau,
        2) Menghubungkan pulau-pulau Indonesia dengan layanan berkualitas,
        3) Mendukung pertumbuhan ekonomi dan pariwisata antar pulau,
        4) Mengembangkan teknologi untuk mempermudah akses transportasi laut, dan
        5) Berkontribusi pada pelestarian lingkungan laut Indonesia.',
            'keywords' => 'misi,mission,tujuan,visi,vision,values,nilai',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $generalInfo->id,
            'question_pattern' => 'partnership',
            'answer' => 'Ferry Booking telah menjalin kemitraan strategis dengan berbagai perusahaan dan lembaga, termasuk:

        1) Kementerian Perhubungan,
        2) Perusahaan pengelola pelabuhan,
        3) Operator pariwisata,
        4) Platform booking online,
        5) Bank dan lembaga keuangan, dan
        6) Provider telekomunikasi.

        Kemitraan ini memungkinkan kami untuk menawarkan layanan yang lebih komprehensif dan terintegrasi.',
            'keywords' => 'partnership,partner,kerjasama,mitra,kolaborasi,alliance',
            'priority' => 5
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

        ChatTemplate::create([
            'category_id' => $scheduleInfo->id,
            'question_pattern' => 'rute populer',
            'answer' => 'Rute feri paling populer kami meliputi:

1) Merak-Bakauheni,
2) Ketapang-Gilimanuk,
3) Padangbai-Lembar,
4) Batam-Singapura,
5) Benoa-Nusa Penida, dan
6) Sorong-Raja Ampat. Semua rute ini memiliki jadwal keberangkatan rutin setiap hari dengan berbagai pilihan waktu.',

            'keywords' => 'populer,favorit,terbaik,popular,banyak,top,sering',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $scheduleInfo->id,
            'question_pattern' => 'berapa lama perjalanan',
            'answer' => 'Durasi perjalanan bervariasi tergantung rute yang Anda pilih. Misalnya, Merak-Bakauheni sekitar 2 jam, Ketapang-Gilimanuk sekitar 45 menit, dan Padangbai-Lembar sekitar 4-5 jam. Anda dapat melihat estimasi waktu perjalanan untuk setiap rute di halaman detail rute pada aplikasi.',
            'keywords' => 'lama,durasi,waktu,jam,berapa lama,duration,travel time',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $scheduleInfo->id,
            'question_pattern' => 'perubahan jadwal',
            'answer' => 'Perubahan jadwal dapat terjadi karena kondisi cuaca, perawatan kapal, atau faktor lain. Kami akan memberitahu Anda melalui notifikasi aplikasi, SMS, dan email jika ada perubahan jadwal yang mempengaruhi pemesanan Anda. Anda juga bisa memeriksa status keberangkatan terkini di menu "Status Keberangkatan".',
            'keywords' => 'ubah,perubahan,reschedule,change,tunda,delay,cancel,batal',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $scheduleInfo->id,
            'question_pattern' => 'jadwal musim liburan',
            'answer' => 'Selama musim liburan (seperti Lebaran, Natal, Tahun Baru), kami menambah frekuensi keberangkatan untuk rute-rute populer. Kami sangat menyarankan untuk memesan tiket jauh-jauh hari karena permintaan sangat tinggi. Informasi jadwal khusus liburan akan dipublikasikan di aplikasi 1-2 bulan sebelum periode liburan.',
            'keywords' => 'liburan,holiday,lebaran,natal,tahun baru,peak season,musim ramai',
            'priority' => 7
        ]);

        // Template tambahan untuk jadwal dan rute
        ChatTemplate::create([
            'category_id' => $scheduleInfo->id,
            'question_pattern' => 'rute terbaru',
            'answer' => 'Kami secara berkala menambahkan rute-rute baru sesuai dengan kebutuhan penumpang. Untuk mengetahui rute terbaru, silakan kunjungi menu "Jadwal & Rute" di aplikasi dan cek tab "Rute Baru". Anda juga bisa mengaktifkan notifikasi untuk mendapatkan pemberitahuan saat kami menambahkan rute baru.',
            'keywords' => 'baru,terbaru,new,tambah,update,rute baru,destinasi baru',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $scheduleInfo->id,
            'question_pattern' => 'cek jadwal keberangkatan',
            'answer' => 'Untuk mengecek jadwal keberangkatan, buka aplikasi dan masuk ke menu "Jadwal & Rute". Pilih lokasi keberangkatan, tujuan, dan tanggal perjalanan Anda. Sistem akan menampilkan semua jadwal yang tersedia. Untuk pencarian lebih spesifik, Anda bisa menggunakan filter waktu, jenis kapal, atau fasilitas.',
            'keywords' => 'cek,check,lihat,jadwal,keberangkatan,departure,schedule',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $scheduleInfo->id,
            'question_pattern' => 'rute terpendek',
            'answer' => 'Rute terpendek dalam jaringan layanan kami adalah Ketapang-Gilimanuk (Jawa-Bali) dengan durasi perjalanan sekitar 45 menit, serta Batam Center-Harbor Bay dengan durasi sekitar 20 menit. Untuk informasi rute terpendek lainnya, silakan lihat detail di aplikasi pada menu "Jadwal & Rute" dan urutkan berdasarkan durasi perjalanan.',
            'keywords' => 'pendek,terpendek,cepat,tercepat,singkat,shortest,fastest',
            'priority' => 6
        ]);

        // Template tambahan untuk jadwal dan rute
        ChatTemplate::create([
            'category_id' => $scheduleInfo->id,
            'question_pattern' => 'rute jakarta lombok',
            'answer' => 'Untuk rute Jakarta-Lombok, kami tidak menyediakan layanan feri langsung. Namun, Anda dapat menggunakan kombinasi transportasi berikut: 1) Ferry dari Merak ke Bakauheni, 2) Perjalanan darat menuju Ketapang, 3) Ferry dari Ketapang ke Gilimanuk (Bali), 4) Perjalanan darat ke Padangbai, dan 5) Ferry dari Padangbai ke Lembar (Lombok). Alternatifnya, Anda bisa menggunakan layanan PELNI untuk perjalanan langsung.',
            'keywords' => 'jakarta,lombok,rute jakarta,ke lombok,jakarta-lombok',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $scheduleInfo->id,
            'question_pattern' => 'jadwal feri ke karimunjawa',
            'answer' => 'Untuk rute ke Karimunjawa, kami menyediakan layanan dari Jepara dan Semarang. Dari Jepara, feri Express Bahari berangkat setiap Senin, Rabu, dan Sabtu pukul 10.00 WIB, dengan durasi perjalanan sekitar 2 jam. Dari Semarang, feri Siginjai berangkat setiap Jumat pukul 09.00 WIB dengan durasi sekitar 4 jam. Jadwal dapat berubah sesuai dengan kondisi cuaca, jadi disarankan untuk memeriksa jadwal terbaru di aplikasi.',
            'keywords' => 'karimunjawa,karimun jawa,jepara,semarang,karimun',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $scheduleInfo->id,
            'question_pattern' => 'transit antar rute',
            'answer' => 'Untuk perjalanan yang memerlukan transit antar rute feri, kami menyediakan fitur "Multi-Rute" di aplikasi. Fitur ini akan membantu Anda merencanakan perjalanan dengan beberapa rute feri secara efisien, termasuk memberikan waktu transit yang cukup. Sistem juga akan memberikan rekomendasi transportasi darat antara terminal jika diperlukan, dan memungkinkan Anda membeli semua tiket dalam satu transaksi.',
            'keywords' => 'transit,multi rute,sambung,connecting,banyak rute,transfer',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $scheduleInfo->id,
            'question_pattern' => 'jalur alternatif',
            'answer' => 'Kami menyediakan opsi jalur alternatif pada rute-rute populer. Misalnya, untuk menuju Bali dari Jawa, selain rute Ketapang-Gilimanuk, Anda juga bisa menggunakan rute Banyuwangi-Celukan Bawang atau rute ekspres Surabaya-Benoa. Saat memesan tiket di aplikasi, Anda dapat mengaktifkan opsi "Tampilkan Rute Alternatif" untuk melihat berbagai pilihan perjalanan yang tersedia.',
            'keywords' => 'alternatif,alternative,pilihan,jalur lain,rute lain,opsi',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $scheduleInfo->id,
            'question_pattern' => 'statusu keberangkatan',
            'answer' => 'Untuk memeriksa status keberangkatan terkini, Anda dapat menggunakan fitur "Status Keberangkatan" di aplikasi. Masukkan nomor keberangkatan atau pilih dari tiket yang sudah Anda pesan. Status akan menampilkan informasi apakah keberangkatan sesuai jadwal, tertunda, atau dibatalkan. Untuk kapal yang sedang berlayar, Anda juga dapat melihat estimasi waktu kedatangan yang diperbarui secara real-time.',
            'keywords' => 'status,keberangkatan,departure,telat,tepat waktu,kondisi keberangkatan',
            'priority' => 7
        ]);

        // Template untuk pemesanan
        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'cara pesan tiket',
            'answer' => 'Untuk memesan tiket:

1) Pilih rute dan jadwal yang diinginkan,
2) Isi detail penumpang dan kendaraan (jika ada),
3) Pilih metode pembayaran,
4) Selesaikan pembayaran,
5) Tiket akan dikirim ke email dan terlihat di aplikasi.',

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

        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'bagaimana cara melakukan pemesanan tiket',
            'answer' => 'Untuk memesan tiket feri, Anda dapat mengikuti langkah-langkah berikut:

1. Buka aplikasi Ferry Booking
2. Pilih rute keberangkatan dan tujuan Anda
3. Pilih tanggal dan jam keberangkatan
4. Isi data penumpang dan kendaraan (jika membawa kendaraan)
5. Pilih metode pembayaran
6. Selesaikan pembayaran

Jika Anda mengalami kesulitan, silakan hubungi layanan pelanggan kami di 0800-123-4567.',
            'keywords' => 'pesan,pemesanan,booking,tiket,cara,bagaimana,beli,membeli,order',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'ubah jadwal tiket',
            'answer' => 'Untuk mengubah jadwal tiket yang sudah dipesan:

1) Buka menu "Tiket Saya",
2) Pilih tiket yang ingin diubah,
3) Klik tombol "Ubah Jadwal",
4) Pilih jadwal baru yang tersedia,
5) Bayar selisih harga jika ada.

Perubahan jadwal hanya dapat dilakukan paling lambat 24 jam sebelum keberangkatan asli.',
            'keywords' => 'ubah,ganti,jadwal,reschedule,change,pindah',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'pesan untuk orang lain',
            'answer' => 'Ya, Anda dapat memesan tiket untuk orang lain. Saat mengisi detail penumpang, cukup masukkan data diri orang yang akan melakukan perjalanan. Pastikan data yang dimasukkan sesuai dengan KTP/Paspor penumpang karena akan diperiksa saat check-in.',
            'keywords' => 'orang lain,teman,keluarga,atas nama,book for others',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'tiket grup besar',
            'answer' => 'Untuk pemesanan grup besar (lebih dari 10 orang), kami menyarankan untuk menghubungi layanan pelanggan kami di 0800-123-4567 atau email ke grupbooking@ferryapp.id. Kami dapat menawarkan harga khusus dan layanan asisten pemesanan untuk grup besar.',
            'keywords' => 'grup,group,rombongan,banyak orang,keluarga besar,corporate',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'batas waktu pemesanan',
            'answer' => 'Anda dapat memesan tiket feri hingga 3 bulan di muka untuk rute reguler. Pemesanan dapat dilakukan hingga 2 jam sebelum waktu keberangkatan, tergantung ketersediaan. Untuk musim liburan, kami sarankan memesan minimal 2 minggu sebelumnya untuk memastikan ketersediaan.',
            'keywords' => 'batas,waktu,deadline,kapan,terakhir,last minute,jauh hari',
            'priority' => 6
        ]);

        // Template tambahan untuk pemesanan
        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'pemesanan tiket pulang pergi',
            'answer' => 'Anda dapat memesan tiket pulang-pergi dalam satu transaksi untuk menghemat waktu. Caranya:

1) Pilih menu "Jadwal & Rute",
2) Aktifkan opsi "Pulang-Pergi",
3) Masukkan lokasi keberangkatan, tujuan, tanggal pergi dan tanggal pulang,
4) Pilih jadwal untuk perjalanan pergi dan pulang,
5) Lanjutkan dengan pengisian data penumpang dan pembayaran seperti biasa.

Anda bisa mendapatkan diskon khusus untuk pemesanan pulang-pergi pada rute tertentu.',
            'keywords' => 'pulang,pergi,pulang-pergi,round-trip,return,pp,dua arah',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'cek status pemesanan',
            'answer' => 'Untuk memeriksa status pemesanan tiket Anda:

1) Buka aplikasi Ferry Booking,
2) Masuk ke menu "Tiket Saya",
3) Anda akan melihat daftar semua pemesanan aktif dengan status masing-masing (seperti "Menunggu Pembayaran", "Terkonfirmasi", "Check-in", atau "Selesai").

Anda juga dapat melihat detail tiket dengan mengklik pada pemesanan yang ingin diperiksa.',
            'keywords' => 'status,cek,periksa,pemesanan,booking,tiket,lihat',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'jumlah maksimum penumpang',
            'answer' => 'Dalam satu kali transaksi pemesanan, Anda dapat memesan tiket untuk maksimal 10 penumpang. Jika Anda perlu memesan untuk lebih dari 10 orang, kami sarankan untuk:

1) Membuat beberapa transaksi terpisah, atau
2) Menghubungi layanan grup kami di 0800-123-4567 untuk mendapatkan layanan pemesanan grup dengan harga khusus dan proses yang lebih mudah.',
            'keywords' => 'maksimum,max,maksimal,banyak,jumlah,penumpang,orang,limit',
            'priority' => 6
        ]);

        // Template tambahan untuk pemesanan
        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'nomor booking tidak ditemukan',
            'answer' => 'Jika nomor booking Anda tidak ditemukan, beberapa kemungkinan penyebabnya:

1) Pemesanan belum berhasil diselesaikan,
2) Pembayaran belum dikonfirmasi sistem,
3) Ada kesalahan pengetikan nomor booking, atau
4) Pemesanan telah dibatalkan otomatis karena melewati batas waktu pembayaran.

Silakan periksa email konfirmasi Anda, atau hubungi layanan pelanggan di 0800-123-4567 dengan menyebutkan informasi pemesanan seperti nama, tanggal, dan rute perjalanan.',
            'keywords' => 'nomor booking,tidak ditemukan,hilang,invalid,error,booking number',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'booking di aplikasi vs website',
            'answer' => 'Anda dapat memesan tiket melalui aplikasi mobile atau website kami. Keduanya menawarkan fitur yang sama dan sinkronisasi data. Namun, aplikasi mobile menawarkan beberapa keunggulan:

1) Akses lebih cepat dengan login fingerprint,
2) Notifikasi perubahan jadwal real-time,
3) Boarding pass digital untuk check-in cepat,
4) Akses ke tiket dalam mode offline, dan
5) Promo eksklusif untuk pengguna aplikasi.

Website lebih cocok untuk pemesanan grup besar dan perbandingan jadwal di layar yang lebih luas.',
            'keywords' => 'aplikasi,website,web,mobile,mana,beda,perbedaan,vs',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'dokumen yang dibutuhkan saat memesan',
            'answer' => 'Untuk memesan tiket feri, Anda perlu menyiapkan informasi berikut:

1) Identitas semua penumpang (Nama lengkap, NIK KTP/Paspor/Kartu Pelajar),
2) Untuk kendaraan: Nomor plat dan STNK, jenis kendaraan, dan dimensi untuk kendaraan besar,
3) Alamat email aktif untuk menerima e-ticket,
4) Nomor telepon yang aktif.

Data harus diisi dengan akurat karena akan diperiksa saat check-in dan untuk keperluan keselamatan.',
            'keywords' => 'dokumen,butuh,dibutuhkan,perlu,saat pesan,persyaratan dokumen',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'durasi proses pemesanan',
            'answer' => 'Proses pemesanan tiket di aplikasi kami biasanya hanya memerlukan waktu 3-5 menit dari awal pencarian hingga mendapatkan e-ticket, tergantung pada kompleksitas pemesanan. Untuk memastikan proses berjalan lancar, kami menyarankan untuk menyiapkan terlebih dahulu:

1) Data penumpang lengkap,
2) Informasi kendaraan jika diperlukan, dan
3) Metode pembayaran yang aktif dan mencukupi.

Jika Anda perlu bantuan selama proses pemesanan, layanan pelanggan kami siap membantu 24/7.',
            'keywords' => 'durasi,lama,waktu,proses,pemesanan,berapa lama,cepat',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $bookingInfo->id,
            'question_pattern' => 'error saat pemesanan',
            'answer' => 'Jika Anda mengalami error saat proses pemesanan, silakan coba langkah berikut:

1) Periksa koneksi internet Anda,
2) Keluar dan masuk kembali ke aplikasi,
3) Hapus cache aplikasi,
4) Pastikan menggunakan versi aplikasi terbaru,
5) Coba perangkat atau browser lain.

Jika masalah berlanjut, silakan hubungi layanan pelanggan kami di 0800-123-4567 dengan menyebutkan kode error yang muncul (jika ada), dan langkah yang sedang Anda lakukan saat error terjadi.',
            'keywords' => 'error,gagal,tidak bisa,problem,issue,kesalahan,bug,failed',
            'priority' => 8
        ]);

        // Template untuk pembayaran
        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'metode pembayaran',
            'answer' => 'Kami menerima berbagai metode pembayaran:

1) Transfer bank,
2) E-wallet (OVO, GoPay, Dana, LinkAja),
3) Kartu kredit/debit, dan
4) Virtual account.

Anda dapat memilih metode yang paling nyaman saat checkout.',
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

        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'pembayaran gagal',
            'answer' => 'Jika pembayaran Anda gagal, silakan coba metode pembayaran lain atau pastikan saldo/limit kartu Anda mencukupi. Pemesanan yang belum dibayar akan otomatis dibatalkan setelah 1 jam. Jika dana terpotong tapi status pembayaran gagal, silakan hubungi layanan pelanggan kami dengan menyertakan bukti pembayaran.',
            'keywords' => 'gagal,failed,error,tidak berhasil,masalah,problem,issue',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'bukti pembayaran',
            'answer' => 'Bukti pembayaran akan dikirimkan ke email Anda setelah transaksi berhasil. Anda juga dapat melihat dan mengunduh bukti pembayaran di menu "Tiket Saya" > pilih tiket > tab "Pembayaran" > "Unduh Bukti Pembayaran".',
            'keywords' => 'bukti,receipt,invoice,struk,kuitansi,proof',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'batas waktu pembayaran',
            'answer' => 'Setelah memesan tiket, Anda memiliki waktu 1 jam untuk menyelesaikan pembayaran. Jika tidak, pemesanan akan otomatis dibatalkan dan Anda perlu melakukan pemesanan ulang. Untuk metode pembayaran seperti virtual account dan transfer bank, harap perhatikan batas waktu yang ditampilkan pada halaman pembayaran.',
            'keywords' => 'batas,waktu,deadline,berapa lama,time limit,expired',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'kebijakan refund',
            'answer' => 'Kebijakan refund kami:

1) Pembatalan 7+ hari sebelum keberangkatan: refund 90%,
2) 3-6 hari sebelum keberangkatan: refund 75%,
3) 1-2 hari sebelum keberangkatan: refund 50%,
4) Hari H: tidak ada refund.

Biaya administrasi sebesar Rp25.000 akan dikenakan untuk setiap refund. Proses refund membutuhkan waktu 7-14 hari kerja.',
            'keywords' => 'refund,uang kembali,batal,cancel,kebijakan,policy',
            'priority' => 7
        ]);

        // Template tambahan untuk pembayaran
        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'pembayaran dengan e-wallet',
            'answer' => 'Untuk pembayaran menggunakan e-wallet:

1) Pada halaman pembayaran, pilih metode e-wallet yang ingin digunakan (GoPay, OVO, DANA, atau LinkAja),
2) Klik "Bayar Sekarang",
3) Anda akan diarahkan ke aplikasi e-wallet terkait atau muncul QR code untuk dipindai,
4) Selesaikan pembayaran di aplikasi e-wallet,
5) Setelah berhasil, Anda akan diarahkan kembali ke aplikasi Ferry Booking.

Pastikan saldo e-wallet Anda mencukupi sebelum melakukan transaksi.',
            'keywords' => 'e-wallet,ewallet,gopay,ovo,dana,linkaja,digital,elektronik',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'pembayaran dengan virtual account',
            'answer' => 'Untuk pembayaran melalui Virtual Account:

1) Pilih bank yang diinginkan (BCA, Mandiri, BNI, BRI, dll),
2) Sistem akan membuat nomor Virtual Account unik,
3) Catat atau salin nomor tersebut,
4) Lakukan pembayaran melalui ATM, Mobile Banking, atau Internet Banking ke nomor Virtual Account tersebut,
5) Pembayaran akan diverifikasi otomatis oleh sistem.

Nomor Virtual Account akan aktif hingga batas waktu pembayaran (umumnya 1 jam setelah pemesanan).',
            'keywords' => 'virtual,account,va,bank,transfer,atm,mobile banking',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'biaya tambahan pembayaran',
            'answer' => 'Untuk sebagian besar metode pembayaran, kami tidak mengenakan biaya tambahan. Namun, beberapa metode mungkin dikenakan biaya admin sebagai berikut:

1) Kartu kredit/debit: 2% dari total pembayaran,
2) Beberapa e-wallet: Rp1.500 - Rp2.500 per transaksi.

Biaya admin ini akan ditampilkan secara transparan pada halaman ringkasan pembayaran sebelum Anda menyelesaikan transaksi.',
            'keywords' => 'biaya,admin,tambahan,charge,fee,extra,additional',
            'priority' => 6
        ]);

        // Template tambahan untuk pembayaran
        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'pembayaran cicilan',
            'answer' => 'Untuk pemesanan dengan nilai di atas Rp1.000.000, kami menawarkan opsi pembayaran cicilan menggunakan kartu kredit dari bank tertentu (BCA, Mandiri, BNI, CIMB Niaga) dengan tenor 3, 6, atau 12 bulan. Caranya:

1) Pilih metode pembayaran "Kartu Kredit",
2) Centang opsi "Cicilan",
3) Pilih bank dan tenor yang diinginkan,
4) Bunga cicilan bervariasi tergantung kebijakan bank penerbit kartu.

Pastikan kartu kredit Anda mendukung fitur cicilan sebelum memilih opsi ini.',
            'keywords' => 'cicilan,kredit,installment,tenor,angsuran,credit card,kartu kredit',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'mengubah metode pembayaran',
            'answer' => 'Untuk mengubah metode pembayaran:

1) Jika Anda belum menyelesaikan pembayaran, buka menu "Tiket Saya",
2) Pilih pemesanan dengan status "Menunggu Pembayaran",
3) Klik "Ubah Metode Pembayaran",
4) Pilih metode pembayaran baru,
5) Lanjutkan proses pembayaran.

Anda hanya dapat mengubah metode pembayaran jika belum melakukan pembayaran dan masih dalam batas waktu pembayaran (umumnya 1 jam sejak pemesanan).',
            'keywords' => 'ubah,ganti,metode,pembayaran,change payment,payment method',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'sistem poin dan reward',
            'answer' => 'Ferry Booking memiliki sistem poin dan reward "FerryPoints":

1) Setiap pembelian tiket bernilai Rp10.000 memberikan 1 poin,
2) Poin berlaku selama 12 bulan sejak diperoleh,
3) Poin dapat ditukarkan dengan diskon tiket (minimal 100 poin untuk Rp10.000 diskon), voucher makanan di kapal, atau akses ke lounge premium di terminal,
4) Level keanggotaan: Regular, Silver (min. 500 poin/tahun), Gold (min. 1000 poin/tahun), dan Platinum (min. 2500 poin/tahun),
5) Setiap level memiliki keuntungan tambahan seperti prioritas boarding dan bonus poin.',
            'keywords' => 'poin,point,reward,hadiah,loyalty,member,keanggotaan,ferrypoints',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'voucher pembayaran',
            'answer' => 'Untuk menggunakan voucher pembayaran:

1) Setelah memilih jadwal dan mengisi data penumpang, pada halaman ringkasan pemesanan, klik "Gunakan Voucher/Kode Promo",
2) Masukkan kode voucher Anda,
3) Klik "Terapkan",
4) Diskon akan otomatis diterapkan pada total pembayaran jika kode valid.

Perhatikan bahwa setiap voucher memiliki syarat dan ketentuan, seperti minimal pembelian, rute tertentu, atau periode validitas. Hanya satu voucher yang dapat digunakan per transaksi.',
            'keywords' => 'voucher,kode promo,kupon,diskon,promo code,coupon,discount',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $paymentInfo->id,
            'question_pattern' => 'keterlambatan konfirmasi pembayaran',
            'answer' => 'Jika konfirmasi pembayaran Anda terlambat:

1) Konfirmasi biasanya instan untuk e-wallet dan kartu kredit/debit, sedangkan transfer bank dan virtual account membutuhkan waktu 5-15 menit,
2) Jika setelah 30 menit belum menerima konfirmasi, periksa apakah dana telah terpotong dari rekening/saldo Anda,
3) Cek email atau notifikasi aplikasi untuk pembaruan status,
4) Jika dana terpotong namun tidak ada konfirmasi, hubungi layanan pelanggan di 0800-123-4567 dengan menyertakan bukti pembayaran dan detail pemesanan.

Tim kami akan memproses verifikasi manual dalam waktu 1x24 jam.',
            'keywords' => 'terlambat,konfirmasi,pembayaran,delay,not confirmed,belum terkonfirmasi',
            'priority' => 7
        ]);

        // Template untuk fasilitas
        ChatTemplate::create([
            'category_id' => $facilities->id,
            'question_pattern' => 'fasilitas di kapal',
            'answer' => 'Fasilitas di kapal feri kami bervariasi tergantung rute dan jenis kapal. Umumnya tersedia: toilet, tempat duduk nyaman, area makan, toko kecil, dan deck observasi. Kapal untuk rute jarak jauh dilengkapi dengan kabin tidur, restoran, dan ruang hiburan. Detail fasilitas untuk setiap kapal dapat dilihat pada halaman detail pemesanan.',
            'keywords' => 'fasilitas,facility,kapal,ferry,tersedia,ada,service',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $facilities->id,
            'question_pattern' => 'makanan di kapal',
            'answer' => 'Sebagian besar kapal feri kami menyediakan layanan makanan dan minuman yang dapat dibeli selama perjalanan. Untuk perjalanan jarak jauh (>3 jam), tersedia restoran atau kafetaria dengan berbagai pilihan menu. Anda juga diperbolehkan membawa makanan dan minuman sendiri ke dalam kapal.',
            'keywords' => 'makanan,minuman,makan,food,beverage,restoran,cafe',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $facilities->id,
            'question_pattern' => 'wifi dan colokan',
            'answer' => 'Beberapa kapal feri kami menyediakan WiFi gratis dan colokan listrik di area tertentu. Namun, koneksi WiFi dapat tidak stabil saat berada di tengah laut. Kami sarankan untuk mengunduh hiburan offline dan membawa power bank. Untuk informasi tentang ketersediaan WiFi dan colokan pada rute spesifik, silakan cek halaman detail kapal.',
            'keywords' => 'wifi,internet,colokan,listrik,charging,power,socket',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $facilities->id,
            'question_pattern' => 'toilet',
            'answer' => 'Semua kapal feri kami dilengkapi dengan fasilitas toilet yang memadai. Jumlah toilet bervariasi tergantung ukuran kapal. Kami berupaya menjaga kebersihan toilet secara berkala selama perjalanan.',
            'keywords' => 'toilet,wc,kamar mandi,bathroom,restroom',
            'priority' => 5
        ]);

        ChatTemplate::create([
            'category_id' => $facilities->id,
            'question_pattern' => 'fasilitas terminal',
            'answer' => 'Terminal feri kami dilengkapi dengan berbagai fasilitas, termasuk: ruang tunggu, toilet, tempat parkir, ATM, toko dan restoran, area bermain anak, musholla, dan loket informasi. Fasilitas dapat bervariasi di setiap terminal. Detail fasilitas terminal dapat dilihat di menu "Informasi Terminal" pada aplikasi.',
            'keywords' => 'terminal,pelabuhan,port,fasilitas,facility,terminal feri',
            'priority' => 6
        ]);

        // Template tambahan untuk fasilitas
        ChatTemplate::create([
            'category_id' => $facilities->id,
            'question_pattern' => 'hiburan di kapal',
            'answer' => 'Untuk rute jarak jauh, beberapa kapal kami menyediakan fasilitas hiburan seperti:

1) Layar TV dengan film atau tayangan umum,
2) Sistem audio untuk musik,
3) Spot foto di deck observasi, dan
4) Area permainan untuk anak-anak pada kapal tertentu.

Kami juga menyarankan membawa hiburan pribadi seperti buku atau gadget dengan konten yang sudah diunduh sebelumnya.',
            'keywords' => 'hiburan,entertainment,film,musik,game,televisi,tv',
            'priority' => 5
        ]);

        ChatTemplate::create([
            'category_id' => $facilities->id,
            'question_pattern' => 'kabin VIP',
            'answer' => 'Kami menyediakan kabin VIP pada rute tertentu dengan jarak tempuh lebih dari 3 jam. Fasilitas kabin VIP meliputi:

1) Tempat tidur privat atau sofa bed,
2) AC individual,
3) TV layar datar (pada kapal tertentu),
4) Akses ke lounge khusus,
5) Makanan dan minuman gratis, dan
6) Antrian prioritas saat boarding dan debarkasi.

Untuk memesan kabin VIP, pilih opsi kelas "VIP" saat pemesanan tiket.',
            'keywords' => 'vip,kabin,cabin,kelas,premium,executive,luxury,privat',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $facilities->id,
            'question_pattern' => 'area merokok',
            'answer' => 'Demi kenyamanan semua penumpang, merokok hanya diperbolehkan di area khusus yang telah ditentukan di bagian luar deck kapal. Area dalam ruangan sepenuhnya bebas asap rokok. Mohon perhatikan tanda-tanda area merokok dan ikuti arahan dari kru kapal. Pelanggaran aturan ini dapat dikenakan denda.',
            'keywords' => 'rokok,merokok,smoking,area,smoke,tempat,cigarette',
            'priority' => 5
        ]);

        // Template tambahan untuk fasilitas
        ChatTemplate::create([
            'category_id' => $facilities->id,
            'question_pattern' => 'ruang kesehatan',
            'answer' => 'Kapal-kapal dengan rute jarak jauh (>4 jam) dilengkapi dengan ruang kesehatan dasar yang memiliki:

1) Petugas medis atau kru terlatih dalam pertolongan pertama,
2) Perlengkapan P3K standar,
3) Obat-obatan umum untuk mabuk laut, demam, dan sakit ringan lainnya,
4) Peralatan medis dasar.

Untuk kondisi medis serius, kapal memiliki protokol evakuasi medis dan dapat berkomunikasi dengan fasilitas kesehatan terdekat. Jika Anda memiliki kondisi medis khusus, disarankan untuk memberi tahu kru saat boarding.',
            'keywords' => 'kesehatan,medis,medical,p3k,first aid,klinik,dokter,obat',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $facilities->id,
            'question_pattern' => 'fasilitas untuk disabilitas',
            'answer' => 'Kami berusaha menyediakan fasilitas yang ramah untuk penyandang disabilitas di terminal dan kapal kami, meliputi:

1) Ramp dan akses kursi roda di terminal dan beberapa kapal,
2) Toilet khusus disabilitas,
3) Area tunggu prioritas,
4) Bantuan boarding dari petugas,
5) Kursi prioritas di kapal.

Namun, tidak semua kapal memiliki fasilitas yang sama. Saat memesan, pilih opsi "Butuh Bantuan Khusus" dan berikan detail kebutuhan Anda. Disarankan juga untuk menghubungi layanan pelanggan minimal 48 jam sebelum keberangkatan untuk memastikan persiapan yang memadai.',
            'keywords' => 'disabilitas,difabel,disability,kursi roda,wheelchair,aksesibilitas,accessible',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $facilities->id,
            'question_pattern' => 'tempat tidur',
            'answer' => 'Untuk rute perjalanan jarak jauh (>6 jam), beberapa kapal kami menyediakan tempat tidur dengan beberapa opsi:

1) Kabin ekonomi (4-8 tempat tidur susun per kabin),
2) Kabin bisnis (2-4 tempat tidur per kabin),
3) Kabin VIP (1-2 tempat tidur dengan kamar mandi dalam),
4) Ruang tidur ekonomi (tempat tidur bersama tanpa sekat kabin).

Semua opsi tempat tidur dilengkapi dengan seprai bersih, bantal, selimut, dan akses ke toilet umum (kecuali kabin VIP). Pemesanan tempat tidur harus dilakukan saat membeli tiket dan dikenakan biaya tambahan.',
            'keywords' => 'tidur,bed,sleeping,kabin,cabin,tempat tidur,kasur,mattress',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $facilities->id,
            'question_pattern' => 'fasilitas anak',
            'answer' => 'Beberapa kapal kami menyediakan fasilitas khusus untuk keluarga dengan anak-anak, seperti:

1) Area bermain anak dengan permainan dan buku,
2) Menu makanan khusus anak,
3) Fasilitas penghangat botol susu,
4) Pelayanan pengasuh anak untuk perjalanan jarak jauh (dengan biaya tambahan),
5) Kabin keluarga dengan tempat tidur yang sesuai untuk anak-anak,
6) Changing station untuk bayi di beberapa toilet.

Fasilitas bervariasi tergantung kapal dan rute. Anda dapat memeriksa ketersediaan fasilitas anak pada deskripsi kapal saat pemesanan.',
            'keywords' => 'anak,kid,children,balita,bayi,baby,infant,family,keluarga',
            'priority' => 5
        ]);

        ChatTemplate::create([
            'category_id' => $facilities->id,
            'question_pattern' => 'layanan concierge',
            'answer' => 'Untuk penumpang kelas premium dan platinum member, kami menyediakan layanan concierge yang meliputi:

1) Check-in dan boarding prioritas,
2) Bantuan dengan bagasi,
3) Pengaturan transportasi dari/ke terminal,
4) Reservasi tempat duduk premium,
5) Layanan pemesanan makanan ke tempat duduk,
6) Akses lounge eksekutif di terminal.

Layanan ini tersedia dengan biaya tambahan untuk penumpang reguler, atau gratis untuk Platinum member. Anda dapat menambahkan layanan ini saat pemesanan tiket atau menghubungi layanan pelanggan minimal 24 jam sebelum keberangkatan.',
            'keywords' => 'concierge,premium,vip,layanan khusus,special service,eksekutif,executive',
            'priority' => 5
        ]);

        // Template untuk kendaraan & bagasi
        ChatTemplate::create([
            'category_id' => $vehicles->id,
            'question_pattern' => 'membawa kendaraan',
            'answer' => 'Ya, sebagian besar rute feri kami mengakomodasi kendaraan pribadi. Saat memesan tiket, Anda dapat memilih opsi "Dengan Kendaraan" dan memasukkan detail kendaraan Anda (jenis, plat nomor, dll). Biaya tambahan akan dikenakan berdasarkan jenis dan ukuran kendaraan. Harap datang minimal 90 menit sebelum keberangkatan untuk proses check-in kendaraan.',
            'keywords' => 'kendaraan,mobil,motor,vehicle,car,motorcycle,bawa',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $vehicles->id,
            'question_pattern' => 'tarif kendaraan',
            'answer' => 'Tarif kendaraan bervariasi tergantung rute dan jenis kendaraan. Secara umum, motor dikenakan biaya mulai dari Rp150.000, mobil pribadi mulai dari Rp350.000, dan kendaraan besar seperti bus atau truk memiliki tarif yang lebih tinggi. Tarif pasti akan ditampilkan saat proses pemesanan setelah Anda memilih jenis kendaraan.',
            'keywords' => 'tarif,harga,biaya,kendaraan,price,rate,cost,vehicle',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $vehicles->id,
            'question_pattern' => 'batas bagasi',
            'answer' => 'Setiap penumpang dewasa diperbolehkan membawa bagasi seberat maksimal 20kg dan 1 tas tangan. Bagasi tambahan dikenakan biaya Rp20.000/kg. Untuk barang berharga, harap dibawa sebagai bagasi tangan. Kami tidak bertanggung jawab atas kehilangan barang berharga yang dititipkan sebagai bagasi.',
            'keywords' => 'bagasi,barang,luggage,baggage,bawaan,berat,limit',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $vehicles->id,
            'question_pattern' => 'barang terlarang',
            'answer' => 'Barang yang dilarang dibawa ke kapal feri meliputi: bahan peledak, senjata api, bahan yang mudah terbakar, narkotika, hewan liar dilindungi, dan barang ilegal lainnya. Untuk hewan peliharaan, silakan lihat kebijakan khusus kami tentang transportasi hewan. Semua bagasi akan melalui pemeriksaan keamanan di terminal.',
            'keywords' => 'terlarang,prohibited,dilarang,tidak boleh,forbidden,illegal',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $vehicles->id,
            'question_pattern' => 'membawa hewan peliharaan',
            'answer' => 'Hewan peliharaan diperbolehkan di sebagian rute dengan syarat:

1) Ditempatkan dalam kandang yang aman,
2) Memiliki sertifikat vaksin yang valid,
3) Membayar biaya tambahan mulai dari Rp100.000 tergantung ukuran hewan.

Harap memberi tahu saat pemesanan dengan memilih opsi "Dengan Hewan Peliharaan" dan mengisi detail yang diperlukan.',
            'keywords' => 'hewan,peliharaan,pet,anjing,kucing,dog,cat,animal',
            'priority' => 6
        ]);

        // Template tambahan untuk kendaraan & bagasi
        ChatTemplate::create([
            'category_id' => $vehicles->id,
            'question_pattern' => 'prosedur check-in kendaraan',
            'answer' => 'Prosedur check-in kendaraan:

1) Datang minimal 90 menit sebelum keberangkatan,
2) Menuju loket check-in kendaraan dengan membawa tiket dan STNK asli,
3) Petugas akan memeriksa dokumen dan memberikan stiker/kartu boarding kendaraan,
4) Parkir kendaraan di area tunggu yang ditentukan,
5) Masuk ke kapal sesuai arahan petugas saat boarding dimulai.

Pastikan bahan bakar kendaraan tidak lebih dari setengah tangki untuk alasan keamanan.',
            'keywords' => 'check-in,checkin,kendaraan,prosedur,car,proses,masuk',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $vehicles->id,
            'question_pattern' => 'bagasi khusus',
            'answer' => 'Untuk bagasi khusus seperti peralatan olahraga (sepeda, papan selancar, perlengkapan diving), alat musik berukuran besar, atau peralatan medis, silakan pilih opsi "Bagasi Khusus" saat pemesanan. Biaya tambahan akan diterapkan berdasarkan ukuran dan berat. Kami menyarankan untuk membungkus bagasi khusus Anda dengan pelindung yang memadai. Untuk informasi lebih lanjut, hubungi layanan pelanggan kami di 0800-123-4567.',
            'keywords' => 'khusus,special,bagasi khusus,alat olahraga,sepeda,papan,diving',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $vehicles->id,
            'question_pattern' => 'jenis kendaraan yang diperbolehkan',
            'answer' => 'Jenis kendaraan yang diperbolehkan di kapal feri kami meliputi:

1) Motor dan skuter,
2) Mobil penumpang reguler,
3) SUV dan MPV,
4) Pick-up dan truk kecil,
5) Bus mini.

Untuk kendaraan berat seperti truk besar, bus, atau kendaraan dengan muatan khusus, harap hubungi layanan pelanggan terlebih dahulu. Setiap kapal memiliki batasan tinggi dan berat kendaraan yang berbeda, jadi pastikan untuk memeriksa detail di halaman pemesanan.',
            'keywords' => 'jenis,kendaraan,types,vehicle,allowed,diizinkan,boleh',
            'priority' => 7
        ]);

        // Template tambahan untuk kendaraan & bagasi
        ChatTemplate::create([
            'category_id' => $vehicles->id,
            'question_pattern' => 'parkir di terminal',
            'answer' => 'Kami menyediakan fasilitas parkir di sebagian besar terminal feri bagi penumpang yang tidak membawa kendaraan ke kapal atau dijemput. Tarif parkir bervariasi antar terminal:

1) Parkir motor: Rp5.000-10.000/hari,
2) Parkir mobil: Rp15.000-30.000/hari.

Beberapa terminal memiliki area parkir dengan pengawasan 24 jam dan berlangganan, ideal untuk penumpang yang sering bepergian. Perlu diperhatikan bahwa beberapa terminal memiliki kapasitas parkir terbatas, terutama saat musim liburan. Disarankan untuk datang lebih awal jika Anda berencana meninggalkan kendaraan.',
            'keywords' => 'parkir,parking,terminal,lot,tempat parkir,area parkir',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $vehicles->id,
            'question_pattern' => 'ukuran maksimum kendaraan',
            'answer' => 'Ukuran maksimum kendaraan yang dapat diangkut bervariasi tergantung jenis kapal dan rute. Secara umum, batasan ukurannya adalah:

1) Panjang: maksimal 12 meter,
2) Lebar: maksimal 2,5 meter,
3) Tinggi: maksimal 3,8 meter,
4) Berat: maksimal 10 ton.

Untuk kendaraan yang mendekati atau melebihi batas ini, harap hubungi layanan pelanggan minimal 3 hari sebelum keberangkatan untuk verifikasi dan mungkin diperlukan pengaturan khusus. Beberapa rute dengan kapal kecil memiliki batasan yang lebih ketat, sementara rute utama dengan kapal Ro-Ro besar dapat mengakomodasi kendaraan yang lebih besar.',
            'keywords' => 'ukuran,maksimum,besar,size,max,dimension,dimensi,batas,limit',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $vehicles->id,
            'question_pattern' => 'layanan pengiriman barang',
            'answer' => 'Selain mengangkut penumpang dan kendaraan, kami juga menyediakan layanan pengiriman barang antar pulau:

1) Pengiriman dokumen (1-2 hari),
2) Paket kecil hingga 30kg (1-3 hari),
3) Kargo besar (2-5 hari).

Tarif berdasarkan berat, dimensi, dan jarak. Untuk menggunakan layanan ini, kunjungi counter Ferry Cargo di terminal atau hubungi 0800-789-6543. Barang akan diperiksa dan ditimbang, lalu Anda akan menerima resi pelacakan. Layanan ini tersedia di rute-rute utama kami. Untuk pengiriman reguler, kami menawarkan paket korporat dengan harga khusus.',
            'keywords' => 'kirim,cargo,pengiriman,barang,paket,deliver,delivery,ekspedisi',
            'priority' => 5
        ]);

        ChatTemplate::create([
            'category_id' => $vehicles->id,
            'question_pattern' => 'transportasi kendaraan tanpa penumpang',
            'answer' => 'Kami menyediakan layanan transportasi kendaraan tanpa penumpang (vehicle-only transport) untuk beberapa rute utama. Prosedurnya:

1) Pilih opsi "Kirim Kendaraan Saja" saat pemesanan,
2) Isi detail kendaraan dan dokumen lengkap (STNK dan surat kuasa),
3) Serahkan kendaraan di terminal keberangkatan minimal 3 jam sebelum jadwal,
4) Kendaraan akan diperiksa dan dibuatkan berita acara kondisi,
5) Anda akan menerima kode pengambilan,
6) Kendaraan dapat diambil di terminal tujuan dengan menunjukkan kode dan identitas.

Layanan ini dikenakan biaya tambahan 20% dari tarif kendaraan reguler dan tersedia untuk mobil dan motor (tidak untuk kendaraan berat).',
            'keywords' => 'tanpa penumpang,kirim kendaraan,vehicle only,transport,kirim mobil,kirim motor',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $vehicles->id,
            'question_pattern' => 'barang berharga',
            'answer' => 'Untuk barang berharga seperti perhiasan, elektronik, dokumen penting, atau uang tunai dalam jumlah besar, kami sangat menyarankan untuk:

1) Selalu membawa barang tersebut sebagai bagasi tangan,
2) Jangan meninggalkannya tanpa pengawasan di area umum kapal,
3) Manfaatkan loker yang tersedia di beberapa kapal jarak jauh (dengan biaya tambahan),
4) Pastikan barang berharga diasuransikan sebelum perjalanan,
5) Untuk dokumen sangat penting, simpan salinan digital.

Perlu diketahui bahwa Ferry Booking memiliki tanggung jawab terbatas terhadap barang bawaan penumpang sesuai dengan ketentuan dalam Syarat dan Ketentuan layanan kami.',
            'keywords' => 'berharga,valuable,perhiasan,jewelry,barang mahal,dokumen,uang,elektronik',
            'priority' => 6
        ]);

        // Template untuk layanan pelanggan
        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'kontak layanan pelanggan',
            'answer' => 'Anda dapat menghubungi layanan pelanggan kami melalui:

1) Telepon: 0800-123-4567 (24/7),
2) Email: cs@ferryapp.id,
3) Live chat di aplikasi (08.00-22.00),
4) Whatsapp: 0812-3456-7890, atau
5) Media sosial kami @ferryapp.id.',
            'keywords' => 'kontak,hubungi,contact,cs,layanan pelanggan,customer service,bantuan',
            'priority' => 9
        ]);

        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'kehilangan barang',
            'answer' => 'Jika Anda kehilangan barang di kapal atau terminal:

1) Segera laporkan ke petugas terdekat,
2) Hubungi layanan pelanggan kami di 0800-123-4567,
3) Berikan deskripsi detail barang yang hilang, waktu dan lokasi perkiraan kehilangan.

Kami akan berusaha membantu menemukan barang Anda. Untuk klaim asuransi, laporan kehilangan harus dibuat dalam 24 jam.',
            'keywords' => 'hilang,lost,kehilangan,barang,luggage,bagasi,found',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'pengaduan layanan',
            'answer' => 'Kami sangat menghargai umpan balik Anda. Untuk menyampaikan keluhan atau saran, silakan:

1) Gunakan fitur "Umpan Balik" di aplikasi,
2) Email ke feedback@ferryapp.id, atau
3) Hubungi layanan pelanggan kami di 0800-123-4567.

Setiap pengaduan akan ditindaklanjuti dalam waktu maksimal 2x24 jam kerja.',
            'keywords' => 'komplain,keluhan,pengaduan,complaint,kritik,saran,feedback',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'bantuan khusus',
            'answer' => 'Kami menyediakan bantuan khusus untuk penumpang lansia, ibu hamil, penumpang dengan anak kecil, dan penyandang disabilitas. Layanan meliputi prioritas boarding, bantuan membawa bagasi, dan kursi khusus. Untuk mendapatkan layanan ini, silakan pilih opsi "Membutuhkan Bantuan Khusus" saat pemesanan tiket dan jelaskan kebutuhan spesifik Anda.',
            'keywords' => 'bantuan,khusus,disability,disabilitas,lansia,hamil,special assistance',
            'priority' => 6
        ]);

        // Template tambahan untuk layanan pelanggan
        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'jam operasional customer service',
            'answer' => 'Jam operasional layanan pelanggan kami:

1) Call center 0800-123-4567: 24 jam setiap hari,
2) Live chat di aplikasi: 08.00-22.00 WIB setiap hari,
3) Email: Direspon dalam 1x24 jam kerja,
4) WhatsApp: 08.00-20.00 WIB setiap hari.

Untuk pertanyaan umum, chatbot ini tersedia 24/7 untuk membantu Anda dengan informasi dasar.',
            'keywords' => 'jam,operasional,cs,customer service,layanan pelanggan,hours',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'prosedur pengaduan',
            'answer' => 'Prosedur pengaduan layanan:

1) Sampaikan keluhan melalui salah satu kanal layanan pelanggan kami,
2) Sertakan detail seperti no. tiket, tanggal/waktu kejadian, dan deskripsi masalah,
3) Tim kami akan memberikan nomor tiket pengaduan,
4) Pengaduan Anda akan diproses dalam 2x24 jam kerja,
5) Anda akan mendapatkan notifikasi penyelesaian melalui email/SMS.

Untuk pengaduan serius yang memerlukan penanganan segera, hubungi call center 0800-123-4567.',
            'keywords' => 'pengaduan,aduan,komplain,keluhan,prosedur,cara,complaint',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'umpan balik layanan',
            'answer' => 'Kami selalu berusaha meningkatkan layanan. Anda dapat memberikan umpan balik melalui:

1) Survei kepuasan yang dikirim setelah perjalanan,
2) Menu "Umpan Balik" di aplikasi,
3) Menghubungi layanan pelanggan.

Umpan balik Anda akan ditinjau langsung oleh tim manajemen kami dan digunakan untuk perbaikan layanan. Sebagai apresiasi, Anda mungkin mendapatkan poin loyalty untuk setiap umpan balik yang diberikan.',
            'keywords' => 'umpan balik,feedback,saran,kritik,penilaian,rating,review',
            'priority' => 6
        ]);

        // Template tambahan untuk layanan pelanggan
        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'penanganan keadaan darurat',
            'answer' => 'Dalam keadaan darurat di kapal, protokol kami mencakup:

1) Sistem alarm dan pengumuman akan diaktifkan,
2) Kru kapal yang terlatih akan mengarahkan penumpang ke titik evakuasi,
3) Jaket pelampung tersedia di bawah atau dekat dengan setiap kursi,
4) Sekoci dan rakit penyelamat tersedia di semua sisi kapal,
5) Peralatan pemadam kebakaran tersedia di lokasi strategis.

Kami sangat menyarankan agar Anda memperhatikan briefing keselamatan dan lokasi peralatan darurat saat awal perjalanan. Jika Anda melihat situasi darurat, segera laporkan ke kru kapal terdekat atau gunakan tombol darurat yang tersedia.',
            'keywords' => 'darurat,emergency,bahaya,kecelakaan,tenggelam,kebakaran,accident',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'petugas keamanan',
            'answer' => 'Untuk menjamin keamanan dan kenyamanan, kami menempatkan petugas keamanan di semua terminal dan kapal:

1) Di terminal: petugas berseragam dan tim keamanan CCTV,
2) Di kapal: petugas keamanan dan kru yang terlatih untuk menangani situasi darurat,
3) Pada malam hari, patroli rutin dilakukan di dek penumpang.

Jika Anda memiliki masalah keamanan atau melihat aktivitas mencurigakan, segera laporkan ke petugas keamanan terdekat atau hubungi nomor darurat di kapal yang tertera pada peta evakuasi di sekitar kapal.',
            'keywords' => 'keamanan,security,petugas,pengaman,guard,aman,patrol',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'layanan VIP',
            'answer' => 'Layanan VIP kami menawarkan pengalaman perjalanan yang eksklusif, meliputi:

1) Layanan check-in prioritas di counter khusus,
2) Akses ke lounge VIP di terminal dengan makanan dan minuman gratis,
3) Boarding awal dengan asisten khusus,
4) Tempat duduk premium atau kabin VIP di kapal,
5) Layanan concierge untuk membantu dengan bagasi dan kebutuhan lainnya,
6) Welcome kit dengan amenities,
7) Makanan dan minuman premium selama perjalanan,
8) Debarkasi prioritas.

Layanan VIP tersedia dengan biaya tambahan atau gratis untuk Platinum Member kami. Untuk reservasi, pilih opsi "Layanan VIP" saat pemesanan atau hubungi tim VIP kami di vip@ferryapp.id.',
            'keywords' => 'vip,premium,eksklusif,exclusive,istimewa,spesial,prioritas',
            'priority' => 5
        ]);

        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'penanganan keluhan khusus',
            'answer' => 'Untuk keluhan khusus seperti masalah diskriminasi, pelecehan, atau pelanggaran privasi, kami memiliki prosedur penanganan terpisah:

1) Laporkan segera ke cs_khusus@ferryapp.id atau hubungi hotline khusus 0800-888-9999,
2) Laporan akan ditangani langsung oleh Tim Khusus di bawah supervisi Direktur Operasional,
3) Jaminan kerahasiaan identitas pelapor,
4) Investigasi akan dimulai dalam 24 jam,
5) Anda akan menerima update berkala tentang progress penanganan,
6) Kami berkomitmen menyelesaikan kasus dalam 7 hari kerja.

Kami menganggap serius setiap keluhan khusus dan memiliki kebijakan zero tolerance terhadap diskriminasi, pelecehan, atau pelanggaran privasi.',
            'keywords' => 'diskriminasi,pelecehan,harassment,discrimination,privasi,privacy,keluhan khusus',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'program tanggung jawab sosial',
            'answer' => 'Ferry Booking memiliki beberapa program Tanggung Jawab Sosial Perusahaan (CSR):

1) "Pulau Hijau" - program pelestarian ekosistem laut di sekitar rute feri,
2) "Ferry untuk Semua" - program subsidi transportasi untuk penduduk pulau kecil dan terpencil,
3) "Sekolah Maritim" - pelatihan keterampilan maritim untuk generasi muda di wilayah pesisir,
4) "Bersih Pantai" - kegiatan rutin pembersihan pantai di lokasi terminal.

Anda dapat berpartisipasi dengan menyumbangkan poin loyalty Anda untuk program ini atau bergabung langsung dalam kegiatan melalui menu "CSR Participation" di aplikasi kami.',
            'keywords' => 'csr,sosial,tanggung jawab,social responsibility,charity,program sosial',
            'priority' => 5
        ]);

        // Template untuk kebijakan & peraturan
        ChatTemplate::create([
            'category_id' => $policies->id,
            'question_pattern' => 'check-in',
            'answer' => 'Proses check-in dibuka 2 jam sebelum jadwal keberangkatan dan ditutup 30 menit sebelum keberangkatan. Untuk penumpang dengan kendaraan, check-in harus dilakukan minimal 90 menit sebelum keberangkatan. Harap bawa identitas (KTP/Paspor) asli dan tiket elektronik (e-ticket) saat check-in.',
            'keywords' => 'check-in,checkin,daftar,registrasi,lapor',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $policies->id,
            'question_pattern' => 'dokumen perjalanan',
            'answer' => 'Dokumen yang diperlukan untuk perjalanan feri:

1) Tiket elektronik,
2) KTP/Paspor/SIM asli untuk setiap penumpang dewasa,
3) Akta kelahiran/Kartu Pelajar untuk anak-anak,
4) STNK asli untuk penumpang dengan kendaraan.

Untuk rute internasional, pastikan Anda memiliki paspor dan visa yang valid.',
            'keywords' => 'dokumen,document,identitas,id,ktp,persyaratan,requirement',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $policies->id,
            'question_pattern' => 'anak-anak dan bayi',
            'answer' => 'Kebijakan untuk anak-anak dan bayi:

1) Bayi (0-2 tahun): gratis, tanpa kursi terpisah,
2) Anak-anak (3-11 tahun): tarif khusus anak (75% dari harga dewasa),
3) Usia 12+ tahun: tarif dewasa.

Semua anak, termasuk bayi, harus didaftarkan saat pemesanan. Anak di bawah 15 tahun harus didampingi orang dewasa.',
            'keywords' => 'anak,bayi,infant,child,kid,baby,balita,children',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $policies->id,
            'question_pattern' => 'asuransi perjalanan',
            'answer' => 'Semua tiket feri kami sudah termasuk asuransi dasar yang mencakup kecelakaan selama perjalanan. Untuk perlindungan lebih komprehensif, Anda dapat membeli asuransi tambahan saat proses pemesanan dengan biaya mulai dari Rp25.000 per orang. Asuransi tambahan mencakup pembatalan perjalanan, keterlambatan, dan perlindungan bagasi.',
            'keywords' => 'asuransi,insurance,perlindungan,protection,kecelakaan,accident',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $policies->id,
            'question_pattern' => 'pembatalan karena cuaca',
            'answer' => 'Jika perjalanan dibatalkan oleh perusahaan karena kondisi cuaca buruk atau alasan teknis, Anda berhak mendapatkan:

1) Pengembalian dana penuh, atau
2) Penjadwalan ulang ke keberangkatan berikutnya tanpa biaya tambahan.

Pembaruan status akan dikirim melalui SMS, email, dan notifikasi aplikasi.',
            'keywords' => 'cuaca,batal,pembatalan,weather,cancel,reschedule,buruk,hujan,badai',
            'priority' => 8
        ]);

        // Template tambahan untuk kebijakan & peraturan
        ChatTemplate::create([
            'category_id' => $policies->id,
            'question_pattern' => 'keterlambatan keberangkatan',
            'answer' => 'Jika kapal terlambat berangkat:

1) Keterlambatan 1-2 jam: Anda akan mendapatkan voucher makanan gratis,
2) Keterlambatan 2-4 jam: Anda akan mendapatkan kompensasi 25% dari harga tiket dalam bentuk poin loyalty,
3) Keterlambatan >4 jam: Anda dapat memilih untuk mendapatkan kompensasi 50% atau penjadwalan ulang gratis.

Semua informasi keterlambatan akan disampaikan melalui pengumuman di terminal dan notifikasi aplikasi.',
            'keywords' => 'terlambat,keterlambatan,delay,lambat,telat,tidak tepat waktu',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $policies->id,
            'question_pattern' => 'kebijakan keselamatan',
            'answer' => 'Kebijakan keselamatan kami meliputi:

1) Semua kapal dilengkapi alat keselamatan sesuai standar internasional,
2) Briefing keselamatan dilakukan sebelum keberangkatan,
3) Latihan evakuasi darurat rutin untuk kru,
4) Pemeriksaan teknis kapal secara berkala,
5) Pemantauan cuaca 24/7,
6) Pembatasan operasi saat kondisi cuaca ekstrem.

Semua penumpang wajib mengikuti arahan kru terkait prosedur keselamatan selama di kapal.',
            'keywords' => 'keselamatan,safety,aman,darurat,emergency,prosedur,evakuasi',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $policies->id,
            'question_pattern' => 'kebijakan penundaan keberangkatan',
            'answer' => 'Jika Anda perlu menunda keberangkatan:

1) Pemberitahuan minimal 48 jam sebelum jadwal: dapat diubah tanpa biaya,
2) Pemberitahuan 24-48 jam: dikenakan biaya admin Rp50.000,
3) Pemberitahuan <24 jam: dikenakan biaya 25% dari harga tiket,
4) Tanpa pemberitahuan (no-show): tidak ada pengembalian dana.

Penundaan hanya dapat dilakukan melalui layanan pelanggan kami di 0800-123-4567 atau di aplikasi melalui menu "Tiket Saya".',
            'keywords' => 'tunda,penundaan,postpone,delay,ubah,pindah,ganti,reschedule',
            'priority' => 7
        ]);

        // Template tambahan untuk kebijakan & peraturan
        ChatTemplate::create([
            'category_id' => $policies->id,
            'question_pattern' => 'kebijakan privasi data',
            'answer' => 'Kebijakan privasi data kami menjamin:

1) Data Anda disimpan dengan aman dan dienkripsi,
2) Kami tidak menjual data pribadi ke pihak ketiga,
3) Data hanya digunakan untuk keperluan layanan dan pengembangan,
4) Anda memiliki hak untuk mengakses, mengkoreksi, atau menghapus data,
5) Kami menyimpan data transaksi selama 5 tahun sesuai regulasi,
6) Sistem kami secara rutin diaudit untuk keamanan.

Kebijakan privasi lengkap dapat dilihat di aplikasi pada menu "Pengaturan" > "Privasi & Keamanan".',
            'keywords' => 'privasi,privacy,data,pribadi,personal,kebijakan,gdpr,perlindungan data',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $policies->id,
            'question_pattern' => 'kebijakan makanan dan minuman',
            'answer' => 'Kebijakan makanan dan minuman kami:

1) Anda diperbolehkan membawa makanan dan minuman sendiri ke dalam kapal,
2) Minuman beralkohol dari luar tidak diperbolehkan (tersedia untuk dibeli di kapal pada rute tertentu),
3) Harap buang sampah makanan pada tempat yang disediakan,
4) Makanan dengan aroma menyengat sebaiknya dikonsumsi di area terbuka,
5) Untuk perjalanan jarak jauh, kami menyediakan layanan makanan dan kafetaria.

Menu untuk kebutuhan khusus (vegetarian, halal, alergi) harus dipesan minimal 24 jam sebelum keberangkatan.',
            'keywords' => 'makanan,minuman,food,beverage,makan,bawa makanan,konsumsi',
            'priority' => 5
        ]);

        ChatTemplate::create([
            'category_id' => $policies->id,
            'question_pattern' => 'kebijakan keselamatan covid',
            'answer' => 'Kebijakan keselamatan COVID-19 kami mengikuti pedoman pemerintah terkini dan meliputi:

1) Sanitasi rutin area umum kapal dan terminal,
2) Filter udara khusus di kapal,
3) Disinfeksi kabut pada kabin setelah setiap perjalanan,
4) Protokol kesehatan untuk kru kapal,
5) Ketersediaan hand sanitizer di berbagai titik,
6) Pembatasan kapasitas penumpang pada saat diperlukan.

Protokol bisa berubah sesuai dengan situasi dan pedoman pemerintah terkini. Mohon cek notifikasi aplikasi atau website kami untuk informasi terbaru sebelum perjalanan.',
            'keywords' => 'covid,corona,virus,pandemi,pandemic,protokol,kesehatan,health protocol',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $policies->id,
            'question_pattern' => 'kebijakan batas usia penumpang',
            'answer' => 'Kebijakan batas usia penumpang kami:

1) Tidak ada batas usia maksimum selama penumpang mampu bepergian secara mandiri atau dengan pendamping,
2) Bayi baru lahir diperbolehkan bepergian setelah berusia minimal 14 hari dengan surat dokter,
3) Anak di bawah usia 15 tahun wajib didampingi orang dewasa,
4) Remaja usia 15-17 tahun dapat bepergian tanpa pendamping dengan membawa surat persetujuan orang tua/wali yang telah dilegalisir, identitas pribadi, dan surat keterangan dari sekolah/institusi jika untuk keperluan pendidikan.

Surat izin tersebut harus ditunjukkan saat check-in.',
            'keywords' => 'usia,umur,batas,age,minimum,maksimum,limit,batasan,restriction',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $policies->id,
            'question_pattern' => 'kebijakan untuk ibu hamil',
            'answer' => 'Kebijakan untuk penumpang hamil:

1) Kehamilan normal hingga 36 minggu diperbolehkan bepergian tanpa surat dokter,
2) Kehamilan 36-38 minggu memerlukan surat keterangan medis yang diterbitkan maksimal 7 hari sebelum keberangkatan,
3) Kehamilan di atas 38 minggu atau kehamilan dengan komplikasi tidak disarankan untuk bepergian,
4) Surat keterangan medis harus menyatakan perkiraan usia kehamilan, konfirmasi kehamilan tunggal/ganda, dan pernyataan bahwa ibu hamil aman untuk bepergian dengan feri,
5) Kami menyediakan kursi prioritas dan bantuan boarding untuk ibu hamil.

Silakan informasikan kondisi kehamilan saat pemesanan untuk mendapatkan bantuan optimal.',
            'keywords' => 'hamil,kehamilan,pregnant,pregnancy,bumil,ibu hamil,maternity',
            'priority' => 6
        ]);

        // Template untuk FAQ
        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'feri terlambat',
            'answer' => 'Jika feri Anda terlambat lebih dari 1 jam, Anda berhak mendapatkan kompensasi berupa voucher makanan atau diskon untuk perjalanan berikutnya. Untuk keterlambatan lebih dari 3 jam, Anda dapat memilih untuk membatalkan perjalanan dengan pengembalian dana penuh. Silakan hubungi petugas di terminal atau layanan pelanggan kami untuk mengajukan klaim.',
            'keywords' => 'terlambat,delay,telat,mundur,late,kompensasi',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'penumpang hamil',
            'answer' => 'Ibu hamil dapat melakukan perjalanan dengan feri kami sampai usia kehamilan 36 minggu, dengan surat keterangan sehat dari dokter untuk kehamilan di atas 28 minggu. Kami menyediakan kursi prioritas dan bantuan khusus. Silakan pilih opsi "Membutuhkan Bantuan Khusus" saat pemesanan dan informasikan kepada petugas check-in.',
            'keywords' => 'hamil,pregnant,kehamilan,pregnancy,bumil,ibu hamil',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'penumpang disabilitas',
            'answer' => 'Kami berkomitmen untuk memberikan aksesibilitas bagi semua penumpang. Sebagian besar kapal dan terminal kami memiliki fasilitas ramah difabel. Untuk mendapatkan bantuan khusus, pilih opsi "Membutuhkan Bantuan Khusus" saat pemesanan dan jelaskan kebutuhan spesifik Anda. Staf kami akan membantu selama proses check-in, boarding, dan selama perjalanan.',
            'keywords' => 'disabilitas,disability,difabel,kursi roda,tuna netra,wheelchair,disabled',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'program loyalitas',
            'answer' => 'Program loyalitas FerryPoints memberi Anda 1 poin untuk setiap Rp10.000 yang dibelanjakan. Poin dapat ditukarkan dengan diskon tiket, upgrade kelas, atau voucher makanan. Untuk bergabung, cukup daftar di aplikasi dan aktifkan fitur FerryPoints di menu profil. Lihat status dan riwayat poin Anda di menu "FerryPoints" pada aplikasi.',
            'keywords' => 'loyalitas,loyalty,poin,point,reward,membership,member',
            'priority' => 5
        ]);

        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'tiket hilang',
            'answer' => 'Jangan khawatir jika e-ticket Anda hilang. Anda dapat mengakses kembali tiket elektronik melalui:

1) Aplikasi Ferry Booking di menu "Tiket Saya",
2) Email yang dikirimkan saat pemesanan, atau
3) Mencetak ulang di konter layanan pelanggan di terminal dengan menunjukkan identitas dan bukti pemesanan.',
            'keywords' => 'tiket,hilang,lost,ticket,tidak ada,lupa,cetak,print',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'mabuk laut',
            'answer' => 'Untuk mencegah mabuk laut:

1) Pilih tempat duduk di tengah kapal dimana guncangan minimal,
2) Hindari membaca atau melihat layar terlalu lama,
3) Pandang horison yang stabil,
4) Konsumsi makanan ringan sebelum perjalanan,
5) Pertimbangkan obat anti mabuk laut.

Beberapa kapal kami pada rute tertentu dilengkapi dengan stabilizer untuk mengurangi guncangan.',
            'keywords' => 'mabuk,laut,seasick,motion sickness,mual,muntah,pusing',
            'priority' => 6
        ]);

        // Template tambahan untuk FAQ
        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'apakah bisa beli tiket di pelabuhan',
            'answer' => 'Ya, Anda masih dapat membeli tiket langsung di loket pelabuhan, namun kami sangat menyarankan untuk memesan melalui aplikasi karena:

1) Menghindari antrean,
2) Memastikan ketersediaan kursi,
3) Sering ada promo khusus di aplikasi,
4) Pilihan metode pembayaran lebih banyak.

Loket tiket di pelabuhan biasanya buka 2 jam sebelum keberangkatan dan ditutup 30 menit sebelum kapal berangkat.',
            'keywords' => 'beli,tiket,pelabuhan,loket,counter,langsung,on the spot',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'tarif anak-anak',
            'answer' => 'Kebijakan tarif untuk anak-anak:

1) Bayi 0-2 tahun: gratis (tanpa kursi terpisah, duduk bersama orang tua),
2) Anak-anak 3-11 tahun: 75% dari harga tiket dewasa,
3) Anak di atas 12 tahun: tarif dewasa penuh.

Saat pemesanan, pastikan untuk memilih kategori usia yang benar untuk setiap penumpang. Kami berhak meminta bukti usia saat check-in.',
            'keywords' => 'anak,tarif,harga,child,kid,rate,diskon,potongan,bayi,infant',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'nomor darurat',
            'answer' => 'Nomor darurat yang dapat dihubungi:

1) Layanan Darurat Ferry Booking: 0800-999-7777 (24/7),
2) Call Center: 0800-123-4567,
3) Whatsapp Darurat: 0812-3456-7890.

Untuk keadaan darurat di kapal, segera hubungi kru kapal atau gunakan tombol bantuan darurat yang tersedia di berbagai lokasi di kapal. Semua insiden akan ditangani sesuai dengan protokol keselamatan standar internasional.',
            'keywords' => 'darurat,emergency,nomor,telepon,kontak,kecelakaan,bantuan',
            'priority' => 8
        ]);

        // Template tambahan untuk FAQ
        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'berapa lama sebelum keberangkatan harus tiba',
            'answer' => 'Kami menyarankan Anda tiba di terminal sebelum jadwal keberangkatan sebagai berikut:

1) Penumpang tanpa kendaraan: minimal 60 menit sebelum keberangkatan,
2) Penumpang dengan kendaraan: minimal 90 menit sebelum keberangkatan,
3) Grup besar (10+ orang): minimal 90 menit sebelum keberangkatan,
4) Saat musim liburan atau peak season: minimal 120 menit sebelum keberangkatan.

Check-in ditutup 30 menit sebelum keberangkatan dan boarding biasanya ditutup 15 menit sebelum keberangkatan. Penumpang yang terlambat mungkin tidak diperbolehkan naik kapal.',
            'keywords' => 'tiba,datang,sampai,arrive,early,awal,sebelum,berapa lama',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'rute alternatif saat kapal penuh',
            'answer' => 'Jika kapal pada rute pilihan Anda sudah penuh, berikut opsi yang dapat Anda pertimbangkan:

1) Pilih jadwal keberangkatan sebelum atau sesudah waktu yang diinginkan,
2) Gunakan fitur "Notifikasi Ketersediaan" untuk pemberitahuan jika ada pembatalan,
3) Cek rute alternatif yang melayani tujuan yang sama (dapat dilihat di menu "Rute Alternatif"),
4) Untuk beberapa tujuan, kami menyediakan opsi multi-rute yang menggabungkan beberapa moda transportasi,
5) Pada peak season, beberapa rute memiliki jadwal tambahan yang dibuka 48 jam sebelum keberangkatan jika permintaan tinggi.

Kami sangat menyarankan untuk memesan jauh hari, terutama untuk perjalanan di akhir pekan atau musim liburan.',
            'keywords' => 'penuh,full,booked,habis,alternatif,pilihan lain,sold out',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'ketersediaan wifi',
            'answer' => 'Ketersediaan WiFi di kapal kami bervariasi tergantung rute dan jenis kapal:

1) Kapal eksekutif dan VIP umumnya menyediakan WiFi gratis,
2) Pada kapal ekonomi, WiFi tersedia dengan biaya tambahan (Rp15.000-25.000/perjalanan),
3) Kecepatan dan stabilitas koneksi dapat bervariasi, terutama di tengah laut,
4) Terminal feri utama kami menyediakan WiFi gratis untuk penumpang yang menunggu.

Untuk informasi lebih akurat tentang ketersediaan WiFi pada rute spesifik, silakan lihat detail kapal saat pemesanan atau hubungi layanan pelanggan kami. Kami menyarankan untuk mengunduh konten hiburan sebelum perjalanan sebagai antisipasi.',
            'keywords' => 'wifi,internet,koneksi,connection,online,hotspot,data',
            'priority' => 5
        ]);

        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'bisa upgrade kelas setelah membeli',
            'answer' => 'Ya, Anda dapat mengupgrade kelas tiket setelah membeli, dengan ketentuan:

1) Upgrade harus dilakukan minimal 4 jam sebelum keberangkatan,
2) Kelas yang diinginkan masih tersedia,
3) Anda perlu membayar selisih harga antara kelas awal dan kelas baru,
4) Tidak ada pengembalian dana jika Anda mengganti ke kelas yang lebih rendah.

Untuk melakukan upgrade, buka aplikasi Ferry Booking, pilih "Tiket Saya", pilih tiket yang ingin diupgrade, lalu klik "Upgrade Kelas". Anda juga dapat mengunjungi counter layanan pelanggan di terminal atau menghubungi call center kami di 0800-123-4567.',
            'keywords' => 'upgrade,kelas,tingkatkan,ganti kelas,naik kelas,class,cabin',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'pengalaman pelayaran pertama',
            'answer' => 'Untuk pengalaman pelayaran feri pertama Anda, berikut tips yang bermanfaat:

1) Datang minimal 60-90 menit sebelum keberangkatan,
2) Bawa dokumen identitas asli, e-ticket, dan obat pribadi yang diperlukan,
3) Gunakan pakaian nyaman dan sepatu yang tidak licin,
4) Bawa jaket tipis karena AC di dalam kapal bisa dingin,
5) Siapkan obat anti mabuk laut jika Anda rentan,
6) Bawa power bank atau charger (beberapa kapal menyediakan colokan),
7) Perhatikan briefing keselamatan dan lokasi peralatan darurat,
8) Simpan nomor kontak layanan pelanggan kami,
9) Unduh peta kapal dari aplikasi kami untuk memudahkan navigasi di kapal.

Jangan ragu menghubungi kru kapal jika membutuhkan bantuan selama perjalanan.',
            'keywords' => 'pertama,pemula,newbie,first time,baru,tips,saran,advice',
            'priority' => 6
        ]);

        // Template untuk Akun Pengguna
        ChatTemplate::create([
            'category_id' => $accountInfo->id,
            'question_pattern' => 'akun keluarga',
            'answer' => 'Fitur Akun Keluarga memungkinkan Anda mengelola tiket untuk seluruh keluarga dengan mudah:

1) Buat profil untuk setiap anggota keluarga di menu "Profil Keluarga",
2) Simpan detail identitas dan preferensi perjalanan mereka,
3) Pesan tiket untuk semua anggota keluarga dalam sekali transaksi,
4) Dapatkan rekomendasi tempat duduk berdekatan,
5) Pantau semua tiket keluarga dari satu akun,
6) Kelola poin loyalitas bersama.

Untuk mengaktifkan fitur ini, kunjungi menu "Profil" > "Buat Profil Keluarga". Anda bisa menambahkan hingga 10 anggota keluarga dalam satu akun.',
            'keywords' => 'keluarga,family,akun keluarga,family account,group,member,anggota',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $accountInfo->id,
            'question_pattern' => 'verifikasi email',
            'answer' => 'Untuk memverifikasi email Anda:

1) Setelah mendaftar, cek kotak masuk email yang Anda daftarkan,
2) Temukan email dari Ferry Booking dengan subjek "Verifikasi Email",
3) Klik tombol atau tautan "Verifikasi Email" dalam email tersebut,
4) Anda akan diarahkan ke halaman konfirmasi di browser atau aplikasi.

Jika Anda tidak menerima email verifikasi, periksa folder spam/junk, atau pilih "Kirim Ulang Email Verifikasi" dari menu "Profil" > "Pengaturan Akun". Email harus diverifikasi untuk mengakses semua fitur aplikasi termasuk melakukan pemesanan dan menerima e-ticket.',
            'keywords' => 'verifikasi,email,verification,confirm,konfirmasi,validasi,email',
            'priority' => 7
        ]);

        // Template untuk Refund & Reschedule
        ChatTemplate::create([
            'category_id' => $refundReschedule->id,
            'question_pattern' => 'cara refund tiket',
            'answer' => 'Untuk refund tiket:

1) Buka menu "Tiket Saya",
2) Pilih tiket yang ingin di-refund,
3) Klik tombol "Batalkan & Refund",
4) Pilih alasan pembatalan,
5) Pilih metode pengembalian dana,
6) Konfirmasi permintaan.

Jumlah refund tergantung kebijakan waktu pembatalan. Proses refund membutuhkan waktu 7-14 hari kerja, dana akan dikembalikan ke metode pembayaran asli.',
            'keywords' => 'refund,uang kembali,cara,how to,pembatalan,refund tiket,cancel',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $refundReschedule->id,
            'question_pattern' => 'cara reschedule tiket',
            'answer' => 'Untuk mengubah jadwal (reschedule):

1) Buka menu "Tiket Saya",
2) Pilih tiket yang ingin diubah,
3) Klik "Ubah Jadwal",
4) Pilih tanggal dan jadwal baru,
5) Bayar selisih harga jika ada (atau terima refund parsial jika harga baru lebih murah),
6) Konfirmasi perubahan.

Reschedule hanya dapat dilakukan maksimal 24 jam sebelum keberangkatan awal dan tiket baru akan dikirim melalui email.',
            'keywords' => 'reschedule,ubah jadwal,ganti tanggal,change,pindah,jadwal baru',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $refundReschedule->id,
            'question_pattern' => 'biaya refund',
            'answer' => 'Biaya yang dikenakan untuk refund tergantung waktu pembatalan:

1) >7 hari sebelum keberangkatan: 10% dari harga tiket,
2) 3-7 hari: 25% dari harga tiket,
3) 1-2 hari: 50% dari harga tiket,
4) Hari H: 100% (tidak ada refund).

Semua refund juga dikenakan biaya admin Rp25.000 per transaksi. Untuk pembatalan karena alasan medis dengan bukti, biaya bisa dikurangi.',
            'keywords' => 'biaya,refund,potongan,deduction,fee,charge,cancelation fee',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $refundReschedule->id,
            'question_pattern' => 'biaya reschedule',
            'answer' => 'Biaya reschedule adalah sebagai berikut:

1) >7 hari sebelum keberangkatan: gratis (hanya membayar selisih harga tiket jika ada),
2) 3-7 hari: Rp25.000 per tiket,
3) 1-2 hari: Rp50.000 per tiket.

Perubahan jadwal pada hari keberangkatan tidak diperbolehkan. Jika harga tiket baru lebih tinggi, Anda perlu membayar selisihnya; jika lebih rendah, selisihnya akan dikembalikan dalam bentuk kredit aplikasi.',
            'keywords' => 'biaya,reschedule,ubah jadwal,fee,charge,cost,bayar',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $refundReschedule->id,
            'question_pattern' => 'status refund',
            'answer' => 'Untuk memeriksa status refund:

1) Buka aplikasi Ferry Booking,
2) Masuk ke menu "Riwayat Transaksi",
3) Pilih tab "Refund",
4) Cari transaksi yang ingin diperiksa.

Status akan terlihat (Menunggu Konfirmasi, Diproses, Selesai, atau Ditolak). Proses refund biasanya membutuhkan 7-14 hari kerja tergantung metode pembayaran yang digunakan. Anda juga akan menerima update melalui email.',
            'keywords' => 'status,refund,cek,check,progress,update,uang kembali',
            'priority' => 6
        ]);

        // Template tambahan untuk Refund & Reschedule
        ChatTemplate::create([
            'category_id' => $refundReschedule->id,
            'question_pattern' => 'refund tiket orang lain',
            'answer' => 'Untuk melakukan refund tiket orang lain:

1) Anda harus memiliki akses ke akun yang digunakan untuk memesan, atau
2) Jika tiket dibeli melalui akun Anda untuk orang lain, Anda dapat melakukan refund seperti biasa,
3) Jika tiket dibeli oleh orang lain dan Anda adalah penumpang, Anda perlu menghubungi pembeli untuk memproses refund, atau
4) Dalam kasus khusus, hubungi layanan pelanggan di 0800-123-4567 dengan bukti kepemilikan tiket (kode booking, detail pemesanan) dan surat kuasa dari pembeli asli.

Perhatikan bahwa dana refund akan dikembalikan ke metode pembayaran asli yang digunakan saat pembelian.',
            'keywords' => 'refund,orang lain,bukan saya,tiket orang lain,atas nama,pembeli lain',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $refundReschedule->id,
            'question_pattern' => 'refund otomatis',
            'answer' => 'Refund otomatis akan diproses dalam situasi berikut:

1) Pembatalan jadwal oleh pihak Ferry Booking (100% refund),
2) Keterlambatan kapal lebih dari 4 jam yang Anda tolak untuk menunggu (100% refund),
3) Pembelian ganda yang teridentifikasi sistem (100% refund untuk tiket duplikat),
4) Kegagalan sistem saat booking yang mengakibatkan double-charge (100% refund untuk pembayaran kedua).

Dana akan otomatis dikembalikan ke metode pembayaran asli dalam waktu 3-7 hari kerja. Anda akan menerima notifikasi email saat refund otomatis diproses dengan detail waktu pengembalian dana.',
            'keywords' => 'otomatis,automatic,auto refund,sistem,double charge,pembatalan sistem',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $refundReschedule->id,
            'question_pattern' => 'alasan reschedule valid',
            'answer' => 'Alasan reschedule yang valid untuk pengurangan atau penghapusan biaya:

1) Kondisi medis darurat (dengan bukti surat dokter),
2) Kematian keluarga dekat (dengan bukti surat kematian),
3) Bencana alam yang mempengaruhi area keberangkatan/tujuan,
4) Perubahan jadwal official dari institusi pendidikan/pemerintah (dengan bukti surat resmi),
5) Kerusakan kendaraan dalam perjalanan menuju terminal (dengan bukti laporan bengkel/polisi).

Bukti pendukung harus dikirimkan ke supportrefund@ferryapp.id paling lambat 24 jam setelah mengajukan reschedule. Setiap kasus akan ditinjau secara individual oleh tim kami.',
            'keywords' => 'alasan,valid,reason,biaya,gratis,free,tanpa biaya,pengurangan',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $refundReschedule->id,
            'question_pattern' => 'mengubah nama penumpang',
            'answer' => 'Untuk mengubah nama penumpang pada tiket yang sudah dipesan:

1) Fitur ini tersedia hingga 48 jam sebelum keberangkatan,
2) Buka menu "Tiket Saya" dan pilih tiket yang ingin diubah,
3) Pilih "Ubah Detail Penumpang",
4) Pilih penumpang yang namanya ingin diubah,
5) Masukkan nama baru dan data identitas yang sesuai,
6) Biaya administrasi Rp50.000 per penumpang akan dikenakan,
7) Konfirmasi perubahan dan bayar biaya administrasi.

Perubahan nama hanya diperbolehkan sekali per tiket. Untuk perubahan lebih dari satu penumpang atau kurang dari 48 jam sebelum keberangkatan, silakan hubungi layanan pelanggan kami di 0800-123-4567.',
            'keywords' => 'ubah nama,ganti nama,name change,passenger name,penumpang,different name',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $refundReschedule->id,
            'question_pattern' => 'refund ke metode pembayaran berbeda',
            'answer' => 'Secara default, refund akan dikembalikan ke metode pembayaran asli yang digunakan saat pembelian. Namun, untuk kasus khusus:

1) Jika kartu asli sudah tidak aktif, refund akan ditransfer ke rekening bank yang terdaftar atas nama yang sama,
2) Untuk pembayaran dengan e-wallet yang sudah tidak aktif, refund akan ditransfer ke e-wallet lain atau rekening bank atas nama yang sama,
3) Untuk pembayaran dengan voucher/poin, refund akan diberikan dalam bentuk kredit aplikasi.

Untuk meminta refund ke metode pembayaran berbeda, silakan hubungi layanan pelanggan dengan bukti kepemilikan metode pembayaran baru. Proses ini memerlukan verifikasi tambahan dan dapat membutuhkan waktu 14-21 hari kerja.',
            'keywords' => 'metode berbeda,different method,payment method,lain,beda rekening,kartu lain',
            'priority' => 6
        ]);

        // Template untuk Layanan Tambahan
        ChatTemplate::create([
            'category_id' => $additionalServices->id,
            'question_pattern' => 'layanan bagasi tambahan',
            'answer' => 'Untuk menambah kuota bagasi:

1) Pada proses pemesanan tiket, pilih "Layanan Tambahan",
2) Pilih "Bagasi Tambahan",
3) Tentukan berat tambahan yang diperlukan (maksimal 30kg per orang),
4) Biaya Rp20.000/kg akan ditambahkan ke total pembayaran.

Anda juga dapat menambah layanan bagasi hingga 24 jam sebelum keberangkatan melalui menu "Tiket Saya" > "Tambah Layanan".',
            'keywords' => 'bagasi,tambahan,extra,luggage,baggage,additional,tambah berat',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $additionalServices->id,
            'question_pattern' => 'layanan makanan',
            'answer' => 'Layanan makanan dapat dipesan untuk perjalanan jarak menengah dan jauh (>2 jam):

1) Saat pemesanan tiket, pilih "Layanan Tambahan" > "Makanan",
2) Pilih dari menu yang tersedia (regular, vegetarian, atau anak-anak),
3) Makanan akan disajikan di kapal.

Harga mulai dari Rp45.000 per porsi. Anda juga dapat memesan hingga 12 jam sebelum keberangkatan melalui menu "Tiket Saya" > "Tambah Layanan".',
            'keywords' => 'makanan,pesan,food,meal,makan,catering,snack,minum',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $additionalServices->id,
            'question_pattern' => 'layanan prioritas',
            'answer' => 'Layanan prioritas seharga Rp75.000 per orang meliputi:

1) Check-in dan boarding prioritas (tanpa antre),
2) Kursi premium di area khusus,
3) Welcome drink dan snack,
4) Bagasi prioritas saat tiba,
5) Akses lounge di terminal (jika tersedia).

Layanan ini dapat ditambahkan saat pemesanan atau nanti melalui menu "Tiket Saya" > "Tambah Layanan" hingga 24 jam sebelum keberangkatan.',
            'keywords' => 'prioritas,priority,vip,premium,khusus,special,exclusive',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $additionalServices->id,
            'question_pattern' => 'paket keluarga',
            'answer' => 'Paket Keluarga adalah layanan khusus untuk 4-6 orang yang meliputi:

1) Area duduk keluarga khusus,
2) Bagasi tambahan 10kg per orang,
3) Paket makanan keluarga,
4) Prioritas boarding,
5) Hiburan untuk anak-anak.

Harga paket mulai dari Rp250.000 per keluarga (diluar harga tiket). Untuk memesan, pilih "Layanan Tambahan" > "Paket Keluarga" saat pemesanan tiket atau hubungi layanan pelanggan.',
            'keywords' => 'keluarga,family,paket,package,anak,group,rombongan',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $additionalServices->id,
            'question_pattern' => 'asuransi perjalanan tambahan',
            'answer' => 'Asuransi perjalanan tambahan seharga Rp25.000-Rp50.000 per orang mencakup:

1) Perlindungan pembatalan perjalanan hingga Rp2 juta,
2) Kehilangan bagasi hingga Rp5 juta,
3) Kecelakaan diri hingga Rp50 juta,
4) Penundaan perjalanan Rp500.000,
5) Layanan medis darurat.

Untuk menambahkan asuransi, pilih "Layanan Tambahan" > "Asuransi Perjalanan" saat pemesanan atau melalui menu "Tiket Saya".',
            'keywords' => 'asuransi,insurance,tambahan,extra,protection,perlindungan',
            'priority' => 6
        ]);

        // Template tambahan untuk layanan tambahan
        ChatTemplate::create([
            'category_id' => $additionalServices->id,
            'question_pattern' => 'transportasi dari terminal',
            'answer' => 'Kami menyediakan layanan transportasi lanjutan dari terminal ke tujuan akhir Anda:

1) Taksi resmi dengan tarif tetap,
2) Shuttle bus ke pusat kota/destinasi utama,
3) Rental mobil dengan atau tanpa supir,
4) Ojek atau taksi motor untuk tujuan terdekat.

Untuk memesan: pilih "Layanan Tambahan" > "Transportasi Lanjutan" saat pemesanan tiket, atau pesan melalui aplikasi hingga 4 jam sebelum kedatangan. Untuk terminal utama, tersedia desk transportasi di area kedatangan. Anda juga dapat memesan transportasi melalui aplikasi ride-hailing yang terintegrasi dengan aplikasi kami.',
            'keywords' => 'transportasi,transport,dari terminal,tujuan,taksi,shuttle,rental',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $additionalServices->id,
            'question_pattern' => 'paket liburan',
            'answer' => 'Paket Liburan Ferry Booking menggabungkan tiket feri dengan akomodasi dan aktivitas di tujuan:

1) Paket Dasar: tiket feri PP + hotel 2 malam (mulai Rp950.000/orang),
2) Paket Komplit: tiket feri PP + hotel 3 malam + tur setengah hari (mulai Rp1.500.000/orang),
3) Paket Premium: tiket feri PP kelas VIP + resort 3 malam + tur lengkap + makan (mulai Rp2.500.000/orang).

Untuk destinasi populer seperti Bali, Lombok, dan Belitung, kami menawarkan paket spesial dengan diskon hingga 30% dibanding pembelian terpisah. Untuk melihat dan memesan paket liburan, pilih menu "Paket Liburan" di aplikasi atau hubungi layanan khusus paket di 0800-234-5678.',
            'keywords' => 'paket,liburan,vacation,holiday,package,tour,wisata,travel',
            'priority' => 5
        ]);

        ChatTemplate::create([
            'category_id' => $additionalServices->id,
            'question_pattern' => 'kursi tambahan untuk kenyamanan',
            'answer' => 'Layanan "Kursi Ekstra" memungkinkan Anda membeli kursi tambahan di sebelah kursi Anda untuk kenyamanan lebih:

1) Ideal bagi yang membutuhkan ruang tambahan, musisi dengan alat musik, atau yang ingin privasi lebih,
2) Tersedia dengan biaya 75% dari harga tiket reguler,
3) Kursi ekstra ditandai sebagai "Dibeli untuk Kenyamanan" dan tidak dapat digunakan penumpang lain,
4) Bagasi tambahan 10kg disertakan.

Untuk memesan kursi ekstra, pilih "Layanan Tambahan" > "Kursi Ekstra" saat pemesanan, atau tambahkan melalui "Tiket Saya" hingga 48 jam sebelum keberangkatan, tergantung ketersediaan.',
            'keywords' => 'kursi,tambahan,extra seat,nyaman,kenyamanan,comfort,space,empty',
            'priority' => 5
        ]);

        ChatTemplate::create([
            'category_id' => $additionalServices->id,
            'question_pattern' => 'pengiriman kendaraan tanpa penumpang',
            'answer' => 'Layanan "Kirim Kendaraan" memungkinkan Anda mengirim kendaraan tanpa harus ikut berlayar:

1) Tersedia untuk motor dan mobil pribadi (hingga SUV),
2) Anda perlu menyerahkan STNK asli dan surat kuasa,
3) Kendaraan akan diperiksa dan didokumentasikan kondisinya sebelum pengiriman,
4) Anda akan menerima kode pengambilan unik,
5) Tarif mulai dari Rp300.000 untuk motor dan Rp800.000 untuk mobil, tergantung rute,
6) Waktu pengiriman 1-3 hari tergantung rute.

Untuk menggunakan layanan ini, pilih "Layanan Tambahan" > "Kirim Kendaraan" di aplikasi, atau hubungi 0800-123-4567 untuk informasi lebih lanjut.',
            'keywords' => 'kirim,kendaraan,tanpa penumpang,vehicle delivery,car shipping,send',
            'priority' => 5
        ]);

        ChatTemplate::create([
            'category_id' => $additionalServices->id,
            'question_pattern' => 'jasa pemandu wisata',
            'answer' => 'Kami menyediakan layanan pemandu wisata lokal bersertifikasi di destinasi populer:

1) Pemandu per jam (Rp150.000-250.000/jam),
2) Paket setengah hari (4 jam, Rp500.000-750.000),
3) Paket satu hari penuh (8 jam, Rp800.000-1.200.000).

Semua pemandu kami fasih berbahasa Indonesia dan Inggris, beberapa juga menguasai Mandarin, Jepang, atau bahasa lainnya (dengan biaya tambahan). Pemandu akan menjemput di terminal atau hotel Anda. Untuk memesan, pilih "Layanan Tambahan" > "Pemandu Wisata" saat pemesanan tiket atau hingga 24 jam sebelum kedatangan, tergantung ketersediaan.',
            'keywords' => 'pemandu,guide,wisata,tour guide,local guide,jasa pemandu,wisata',
            'priority' => 5
        ]);

        // Template untuk Check-in
        ChatTemplate::create([
            'category_id' => $checkin->id,
            'question_pattern' => 'cara check in',
            'answer' => 'Ada dua cara check-in:

1) Online: Melalui aplikasi 24 jam hingga 1 jam sebelum keberangkatan, buka menu "Tiket Saya" > pilih tiket > "Check-in Online", lalu tunjukkan boarding pass digital saat boarding;
2) Di terminal: Datang minimal 1 jam sebelum (2 jam untuk kendaraan), tunjukkan e-ticket dan identitas di konter check-in.

Check-in ditutup 30 menit sebelum keberangkatan, jadi pastikan Anda datang tepat waktu.',
            'keywords' => 'check-in,checkin,cara,how to,prosedur,daftar,proses',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $checkin->id,
            'question_pattern' => 'dokumen check in',
            'answer' => 'Dokumen yang diperlukan saat check-in:

1) E-ticket atau kode booking,
2) Identitas asli yang sesuai dengan tiket (KTP/SIM/Paspor untuk dewasa; Kartu Pelajar/Akta Kelahiran untuk anak-anak),
3) Untuk kendaraan: STNK asli yang sesuai dengan data pemesanan,
4) Bukti khusus untuk penumpang dengan diskon (kartu pelajar, kartu lansia, dll).

Sediakan dokumen fisik, meskipun sudah check-in online.',
            'keywords' => 'dokumen,check-in,identitas,document,persyaratan,ktp,requirement',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $checkin->id,
            'question_pattern' => 'check in kendaraan',
            'answer' => 'Prosedur check-in kendaraan:

1) Datang minimal 90 menit sebelum keberangkatan,
2) Bawa STNK asli dan tiket kendaraan,
3) Lapor ke konter check-in kendaraan,
4) Petugas akan memeriksa dokumen dan memberikan stiker/kartu kendaraan,
5) Ikuti arahan untuk parkir di area tunggu,
6) Boarding kendaraan biasanya dimulai 45-60 menit sebelum keberangkatan.

Pastikan bahan bakar tidak lebih dari setengah tangki untuk alasan keamanan.',
            'keywords' => 'check-in,kendaraan,vehicle,mobil,motor,car,motorcycle',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $checkin->id,
            'question_pattern' => 'boarding pass',
            'answer' => 'Boarding pass dapat diakses dengan dua cara:

1) Digital: Setelah check-in online, boarding pass akan tersedia di aplikasi pada menu "Tiket Saya" > pilih tiket > "Lihat Boarding Pass". Anda dapat menyimpannya sebagai PDF atau screenshot,
2) Cetak: Setelah check-in di terminal, Anda akan menerima boarding pass cetak.

Boarding pass berisi informasi nomor kursi, gate, waktu boarding, dan informasi kapal. Simpan boarding pass hingga akhir perjalanan.',
            'keywords' => 'boarding,pass,kartu,naik,tiket,ticket,digital',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $checkin->id,
            'question_pattern' => 'keterlambatan check in',
            'answer' => 'Jika Anda terlambat:

1) Check-in ditutup 30 menit sebelum keberangkatan (60 menit untuk kendaraan),
2) Jika terlambat kurang dari 15 menit dari batas waktu, hubungi petugas untuk kemungkinan akomodasi khusus,
3) Jika terlambat lebih dari itu, tiket dianggap hangus tanpa refund.

Dalam kasus keterlambatan karena keadaan luar biasa (kecelakaan, bencana alam), hubungi layanan pelanggan segera dengan bukti untuk pengecualian kebijakan.',
            'keywords' => 'terlambat,late,telat,miss,ketinggalan,check-in,lewat',
            'priority' => 7
        ]);

        // Template tambahan untuk check-in
        ChatTemplate::create([
            'category_id' => $checkin->id,
            'question_pattern' => 'check in group',
            'answer' => 'Untuk check-in grup (10+ orang):

1) Opsi check-in online tersedia, namun disarankan untuk check-in di terminal melalui konter khusus grup,
2) Pemimpin grup dapat check-in untuk semua anggota dengan membawa semua dokumen identitas atau fotokopi yang jelas,
3) Datang minimal 2 jam sebelum keberangkatan untuk memastikan proses lancar,
4) Booking grup dengan kode grup khusus akan mendapat prioritas dan petugas khusus,
5) Jika grup terbagi dalam beberapa booking, informasikan petugas agar dapat diproses bersama.

Untuk grup besar (30+ orang), hubungi kami 1 hari sebelumnya di 0800-123-4567 untuk pengaturan khusus.',
            'keywords' => 'grup,group,rombongan,banyak orang,kelompok,group check-in,massal',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $checkin->id,
            'question_pattern' => 'pemilihan kursi saat check in',
            'answer' => 'Pemilihan kursi dapat dilakukan:

1) Saat pemesanan tiket dengan biaya Rp15.000-25.000 per kursi (gratis untuk Gold/Platinum member),
2) Saat check-in online (24 jam - 1 jam sebelum keberangkatan) dari kursi yang masih tersedia tanpa biaya tambahan,
3) Saat check-in di terminal, tergantung ketersediaan.

Untuk keluarga/grup yang ingin duduk berdekatan, kami sangat menyarankan pemilihan kursi saat pemesanan. Kursi prioritas di dekat pintu keluar, dengan ruang kaki lebih, atau lokasi premium memiliki biaya tambahan Rp25.000-50.000. Penumpang berkebutuhan khusus, lansia, dan ibu hamil dapat meminta kursi khusus tanpa biaya tambahan.',
            'keywords' => 'kursi,seat,pilih,pemilihan,seat selection,assignment,duduk',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $checkin->id,
            'question_pattern' => 'check in online',
            'answer' => 'Check-in online dapat dilakukan 24 jam hingga 1 jam sebelum keberangkatan. Caranya:

1) Buka aplikasi Ferry Booking,
2) Masuk ke menu "Tiket Saya",
3) Pilih tiket yang ingin di-check-in,
4) Tap "Check-in Online",
5) Verifikasi data penumpang,
6) Pilih kursi (opsional, jika belum dipilih saat pemesanan),
7) Konfirmasi check-in,
8) Boarding pass digital akan tersedia untuk diunduh/disimpan.

Setelah check-in online, Anda tetap perlu menunjukkan identitas asli dan boarding pass digital saat boarding. Untuk penumpang dengan kendaraan, check-in online hanya untuk penumpang, sedangkan kendaraan tetap perlu diproses di konter khusus terminal.',
            'keywords' => 'online,check-in online,digital,mobile,aplikasi,app,web,internet',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $checkin->id,
            'question_pattern' => 'tanda pengenal',
            'answer' => 'Tanda pengenal yang diterima untuk check-in:

1) WNI dewasa: KTP, SIM, atau Paspor,
2) WNA dewasa: Paspor atau KITAS,
3) Anak 0-16 tahun: Akta Kelahiran, Kartu Keluarga, Kartu Pelajar, Paspor, atau KIA (Kartu Identitas Anak),
4) Penumpang dengan harga khusus: Kartu Pelajar (diskon pelajar), Kartu BPJS/Lansia (diskon lansia), Kartu Pegawai (diskon korporat).

Tanda pengenal harus asli (bukan fotokopi), masih berlaku, dan sesuai dengan nama pada tiket. E-KTP yang terdaftar namun belum dicetak dapat digantikan dengan Surat Keterangan dari Disdukcapil yang dilengkapi foto dan cap basah.',
            'keywords' => 'tanda pengenal,identitas,identity,id card,ktp,sim,passport,paspor',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $checkin->id,
            'question_pattern' => 'fast track check in',
            'answer' => 'Layanan Fast Track Check-in memungkinkan Anda melewati antrean regular. Layanan ini:

1) Tersedia secara gratis untuk Platinum/Gold Member dan penumpang kelas VIP,
2) Dapat dibeli dengan harga Rp50.000 per orang untuk penumpang lain,
3) Meliputi konter check-in khusus dan jalur boarding prioritas,
4) Termasuk bantuan bagasi dari petugas,
5) Akses ke lounge (di terminal yang tersedia, untuk waktu tunggu maksimal 1 jam).

Untuk menggunakan layanan ini, pilih opsi "Fast Track" saat pemesanan atau tambahkan melalui menu "Tiket Saya" > "Tambah Layanan" hingga 4 jam sebelum keberangkatan. Saat tiba di terminal, cari tanda "Fast Track" atau "Priority" dan tunjukkan tiket Fast Track Anda.',
            'keywords' => 'fast track,cepat,priority,prioritas,vip,tanpa antri,skip line',
            'priority' => 6
        ]);

        // Template untuk Keamanan & Data
        ChatTemplate::create([
            'category_id' => $security->id,
            'question_pattern' => 'keamanan data pengguna',
            'answer' => 'Keamanan data pengguna adalah prioritas kami. Data Anda dilindungi dengan:

1) Enkripsi end-to-end untuk transaksi dan data sensitif,
2) Standar keamanan PCI DSS untuk pembayaran,
3) Autentikasi multi-faktor untuk akses akun,
4) Server dilindungi firewall canggih,
5) Pemantauan keamanan 24/7,
6) Akses terbatas hanya untuk personel yang berwenang.

Kami tidak pernah menjual data pengguna ke pihak ketiga dan hanya menggunakannya sesuai dengan kebijakan privasi.',
            'keywords' => 'keamanan,data,pribadi,security,privacy,protect,lindung',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $security->id,
            'question_pattern' => 'kebijakan privasi',
            'answer' => 'Kebijakan privasi kami meliputi:

1) Pengumpulan data hanya yang diperlukan untuk layanan,
2) Perlindungan data dengan teknologi enkripsi,
3) Tidak menjual data ke pihak ketiga,
4) Penggunaan data untuk personalisasi layanan,
5) Hak pengguna untuk mengakses dan menghapus data,
6) Penyimpanan data sesuai regulasi.

Kebijakan lengkap dapat dibaca di aplikasi pada menu "Pengaturan" > "Kebijakan Privasi" atau di website kami.',
            'keywords' => 'privasi,privacy,kebijakan,policy,data,perlindungan,protection',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $security->id,
            'question_pattern' => 'pembayaran aman',
            'answer' => 'Sistem pembayaran kami menggunakan teknologi keamanan terkini:

1) Enkripsi SSL/TLS untuk semua transaksi,
2) Kepatuhan standar PCI DSS,
3) Tokenisasi data kartu pembayaran,
4) Gateway pembayaran terpercaya dan terverifikasi,
5) Verifikasi 3D Secure untuk transaksi kartu,
6) Notifikasi real-time untuk semua transaksi.

Kami tidak pernah menyimpan data kartu kredit lengkap dan semua pembayaran melalui e-wallet menggunakan protokol keamanan resmi penyedia masing-masing.',
            'keywords' => 'pembayaran,payment,aman,secure,security,transaksi,transaction',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $security->id,
            'question_pattern' => 'verifikasi akun dua faktor',
            'answer' => 'Verifikasi dua faktor (2FA) memberikan lapisan keamanan tambahan. Cara mengaktifkan:

1) Login ke aplikasi,
2) Buka menu "Profil" > "Keamanan Akun",
3) Aktifkan "Verifikasi Dua Faktor",
4) Pilih metode (SMS atau aplikasi autentikator),
5) Ikuti instruksi untuk menyelesaikan pengaturan.

Setelah diaktifkan, setiap login memerlukan kode verifikasi tambahan. Kami sangat menyarankan penggunaan 2FA untuk melindungi akun Anda.',
            'keywords' => 'verifikasi,dua faktor,2fa,factor,authentication,otp,keamanan',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $security->id,
            'question_pattern' => 'lapor aktivitas mencurigakan',
            'answer' => 'Jika Anda melihat aktivitas mencurigakan di akun:

1) Segera ubah kata sandi,
2) Aktifkan verifikasi dua faktor jika belum,
3) Laporkan ke tim keamanan kami melalui email security@ferryapp.id atau telepon 0800-123-4567 (pilih opsi keamanan),
4) Berikan detail seperti waktu kejadian dan aktivitas yang mencurigakan.

Tim kami akan merespons dalam 24 jam dan membantu menyelidiki serta mengamankan akun Anda.',
            'keywords' => 'mencurigakan,suspicious,hack,retas,aktivitas,lapor,report',
            'priority' => 8
        ]);

        // Template tambahan untuk Keamanan & Data
        ChatTemplate::create([
            'category_id' => $security->id,
            'question_pattern' => 'keamanan di kapal',
            'answer' => 'Kami menerapkan berbagai langkah keamanan di kapal:

1) Pemeriksaan keamanan bagasi dan penumpang sebelum boarding,
2) CCTV di area publik kapal,
3) Petugas keamanan berseragam dan plainclothes di kapal,
4) Pemeriksaan identitas saat boarding,
5) Sistem penguncian keamanan di semua pintu akses penting,
6) Tombol darurat di lokasi strategis,
7) Patroli keamanan reguler selama pelayaran.

Kapal-kapal kami mematuhi standar keamanan maritim internasional dan nasional, dengan simulasi dan pelatihan keamanan rutin untuk semua kru.',
            'keywords' => 'keamanan,kapal,ship,security,keselamatan,aman,safety,perlindungan',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $security->id,
            'question_pattern' => 'pemantauan CCTV',
            'answer' => 'Sistem CCTV kami meliputi:

1) Pemantauan 24/7 di semua area publik terminal dan kapal (kecuali kamar mandi dan kabin pribadi),
2) Rekaman disimpan selama 30 hari sesuai regulasi,
3) Diakses hanya oleh petugas keamanan resmi,
4) Digunakan untuk investigasi insiden dan pencegahan kejahatan,
5) Menggunakan teknologi AI untuk pendeteksian anomali.

Kebijakan CCTV kami mematuhi regulasi privasi data. Jika Anda mengalami insiden keamanan, laporkan segera ke petugas untuk mengakses rekaman relevan sebagai bukti. Kami hanya membagikan rekaman CCTV dengan pihak berwenang atau untuk tujuan hukum dengan surat perintah resmi.',
            'keywords' => 'cctv,kamera,camera,rekam,record,pantau,monitoring,surveillance',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $security->id,
            'question_pattern' => 'keamanan informasi pembayaran',
            'answer' => 'Informasi pembayaran Anda dilindungi dengan:

1) Sertifikasi PCI DSS level 1 (standar tertinggi untuk industri kartu pembayaran),
2) Enkripsi AES-256 untuk data pembayaran,
3) Tokenisasi kartu kredit (kami tidak menyimpan detail lengkap kartu),
4) Pemisahan sistem antara data pengguna dan data pembayaran,
5) Verifikasi 3D Secure wajib untuk semua transaksi kartu kredit,
6) Algoritma deteksi penipuan real-time.

Semua gateway pembayaran kami menggunakan lapisan keamanan tambahan dan diaudit secara reguler oleh pihak ketiga independen. Jika Anda mencurigai ada masalah dengan transaksi, segera hubungi payment_security@ferryapp.id.',
            'keywords' => 'pembayaran,payment,kartu kredit,credit card,informasi,info,data',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $security->id,
            'question_pattern' => 'kepatuhan regulasi data',
            'answer' => 'Ferry Booking mematuhi semua regulasi perlindungan data yang berlaku:

1) UU Perlindungan Data Pribadi Indonesia,
2) Peraturan Menteri Kominfo tentang Perlindungan Data,
3) Standar internasional seperti GDPR sebagai best practice.

Kepatuhan kami meliputi: prinsip minimal data collection, penggunaan data hanya untuk tujuan yang dinyatakan, hak pengguna untuk mengakses, mengoreksi, dan menghapus data, notifikasi pelanggaran data, dan pemrosesan data lintas-batas yang aman. Kami melakukan audit kepatuhan tahunan dan memiliki Data Protection Officer yang dapat dihubungi di dpo@ferryapp.id untuk pertanyaan tentang hak data pribadi Anda.',
            'keywords' => 'regulasi,regulation,compliance,kepatuhan,hukum,legal,gdpr,pdp',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $security->id,
            'question_pattern' => 'pencegahan penipuan',
            'answer' => 'Sistem pencegahan penipuan kami melindungi Anda dengan:

1) Verifikasi transaksi real-time menggunakan AI,
2) Deteksi anomali untuk pola pembelian yang tidak biasa,
3) Verifikasi device fingerprinting,
4) Verifikasi IP geolocation,
5) Notifikasi untuk aktivitas mencurigakan,
6) Tim keamanan 24/7 yang memantau transaksi berisiko tinggi.

Untuk melindungi diri sendiri: hanya beli tiket dari aplikasi atau website resmi kami, jangan bagikan OTP/password, verifikasi email resmi (selalu dari domain @ferryapp.id), dan aktifkan notifikasi transaksi. Jika Anda mencurigai penipuan menggunakan nama kami, laporkan ke fraud@ferryapp.id atau 0800-999-8888.',
            'keywords' => 'penipuan,fraud,scam,tipu,penipu,fake,prevention,protection',
            'priority' => 7
        ]);

        // Template untuk Promo & Diskon
        ChatTemplate::create([
            'category_id' => $promos->id,
            'question_pattern' => 'promo saat ini',
            'answer' => 'Promo yang sedang berlangsung:

1) "Weekday Wonder" - diskon 25% untuk perjalanan Senin-Kamis,
2) "Booking Awal" - diskon 15% untuk pemesanan minimal 14 hari sebelum keberangkatan,
3) "Ferry Pass" - beli 5 perjalanan bayar 4 untuk rute yang sering dilalui,
4) "Family Pack" - diskon 10% untuk pemesanan 4+ orang dalam satu transaksi.

Lihat semua promo terbaru di menu "Promo" pada aplikasi atau website kami. Promo memiliki syarat dan ketentuan, serta tidak dapat digabungkan dengan promo lain.',
            'keywords' => 'promo,diskon,discount,potongan,deal,offer,terbaru,saat ini',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $promos->id,
            'question_pattern' => 'cara menggunakan kode promo',
            'answer' => 'Untuk menggunakan kode promo:

1) Pilih rute dan jadwal keberangkatan seperti biasa,
2) Isi detail penumpang dan layanan tambahan,
3) Pada halaman pembayaran, temukan kolom "Kode Promo" atau "Voucher",
4) Masukkan kode promo yang valid,
5) Klik "Terapkan",
6) Diskon akan otomatis diterapkan pada total pembayaran jika kode valid dan memenuhi syarat.

Pastikan kode promo masih berlaku dan memenuhi syarat minimum pembelian. Satu pesanan hanya dapat menggunakan satu kode promo.',
            'keywords' => 'kode,promo,code,voucher,cara,aplikasi,redeem,tukar,gunakan',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $promos->id,
            'question_pattern' => 'program loyalitas',
            'answer' => 'Program loyalitas FerryPoints memberikan 1 poin untuk setiap Rp10.000 yang dibelanjakan. Level keanggotaan:

1) Classic (0-999 poin/tahun),
2) Silver (1.000-2.499 poin/tahun): bonus 25% poin, check-in prioritas,
3) Gold (2.500-4.999 poin/tahun): bonus 50% poin, free reschedule, pemilihan kursi gratis,
4) Platinum (5.000+ poin/tahun): bonus 100% poin, diskon 10% setiap pemesanan, akses lounge, upgrade kelas sesuai ketersediaan.

Poin dapat ditukarkan dengan diskon tiket, upgrade kelas, atau layanan tambahan. Bergabung gratis melalui menu "FerryPoints" di aplikasi.',
            'keywords' => 'loyalitas,loyalty,poin,point,reward,membership,member,ferrypoints',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $promos->id,
            'question_pattern' => 'promo bundling',
            'answer' => 'Promo bundling kami menawarkan paket hemat:

1) "Ferry + Hotel": diskon hingga 30% untuk tiket feri + kamar hotel,
2) "Ferry + Transport": tiket feri + shuttle ke pusat kota dengan diskon 20%,
3) "Family Bundle": tiket untuk 4 orang + paket makan + asuransi dengan diskon 25%,
4) "Adventure Package": tiket feri + tur setengah hari di destinasi dengan diskon 15%.

Semua promo bundling dapat dilihat di menu "Paket Hemat" di aplikasi. Bundling memiliki periode pemesanan dan periode perjalanan tertentu, serta syarat lain yang perlu diperhatikan.',
            'keywords' => 'bundling,bundle,paket,package,combo,hemat,gabungan',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $promos->id,
            'question_pattern' => 'diskon grup',
            'answer' => 'Diskon grup tersedia untuk pemesanan 10+ penumpang dalam satu transaksi:

1) 10-19 orang: diskon 5%,
2) 20-29 orang: diskon 10%,
3) 30+ orang: diskon 15%.

Keuntungan tambahan grup: check-in konter khusus, boarding prioritas, dan koordinator grup khusus untuk grup 30+ orang. Untuk pemesanan grup besar (50+ orang), hubungi tim khusus kami di group@ferryapp.id atau 0800-234-5678 untuk mendapatkan penawaran spesial termasuk kemungkinan sewa kapal eksklusif untuk grup sangat besar.',
            'keywords' => 'grup,group,rombongan,banyak orang,diskon grup,group discount',
            'priority' => 7
        ]);

        // Template tambahan untuk Promo & Diskon
        ChatTemplate::create([
            'category_id' => $promos->id,
            'question_pattern' => 'diskon hari besar',
            'answer' => 'Untuk momen hari besar nasional, kami menawarkan promo spesial:

1) "Promo Kemerdekaan" - diskon 17% untuk perjalanan 15-19 Agustus,
2) "Year End Sale" - diskon hingga 30% untuk pemesanan di bulan Desember untuk perjalanan Januari-Maret tahun berikutnya,
3) "Lebaran Deals" - diskon 10% untuk pemesanan 45+ hari sebelum Lebaran,
4) "Flash Sale" bulanan pada tanggal 12 setiap bulan dengan diskon hingga 50% untuk rute tertentu (terbatas dan cepat habis).

Promo hari besar biasanya diumumkan 2-4 minggu sebelumnya melalui email, notifikasi aplikasi, dan media sosial kami. Aktifkan notifikasi di aplikasi untuk tidak melewatkan promo-promo ini.',
            'keywords' => 'hari besar,holiday,lebaran,natal,tahun baru,kemerdekaan,idul fitri',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $promos->id,
            'question_pattern' => 'kerjasama kartu kredit',
            'answer' => 'Kami bermitra dengan berbagai bank untuk promo kartu kredit:

1) Bank Mandiri: diskon 10% setiap hari Senin (maks. Rp150.000),
2) BNI: cashback 5% setiap hari Rabu (maks. Rp100.000),
3) BCA: cicilan 0% hingga 6 bulan untuk transaksi min. Rp1.500.000,
4) CIMB Niaga: diskon 15% untuk pengguna baru aplikasi (maks. Rp200.000).

Untuk menggunakan promo, pilih kartu kredit sesuai bank partner saat pembayaran dan sistem akan otomatis menerapkan promo jika memenuhi syarat. Promo bank berubah setiap 3 bulan, cek informasi terbaru di menu "Promo" > "Bank Partner" di aplikasi.',
            'keywords' => 'kartu kredit,credit card,bank,mandiri,bca,bni,partner,cc',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $promos->id,
            'question_pattern' => 'diskon spesial',
            'answer' => 'Diskon spesial tersedia untuk kategori penumpang tertentu:

1) Pelajar/Mahasiswa: diskon 10% dengan kartu pelajar/kartu mahasiswa valid (maks. 2 tiket/bulan),
2) Lansia (60+ tahun): diskon 15% dengan KTP,
3) Penyandang disabilitas: diskon 20% dengan kartu disabilitas,
4) Veteran/Pensiunan TNI-Polri: diskon 15% dengan kartu identitas terkait.

Untuk mengklaim diskon, pilih kategori penumpang yang sesuai saat pemesanan dan tunjukkan dokumen pendukung saat check-in. Diskon khusus ini tidak dapat digabungkan dengan promo lain dan hanya berlaku untuk pemilik kartu identitas yang bersangkutan.',
            'keywords' => 'spesial,khusus,pelajar,lansia,disabilitas,student,senior,khusus',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $promos->id,
            'question_pattern' => 'seasonal pass',
            'answer' => 'Seasonal Pass adalah tiket berlangganan untuk period tertentu:

1) "Commuter Pass": untuk penumpang rutin rute pendek, valid untuk 10 perjalanan dalam 30 hari dengan harga 40% lebih murah dari pembelian satuan,
2) "Island Hopper": valid untuk 5 perjalanan antar pulau dalam 6 bulan dengan diskon 25%,
3) "Business Connect": untuk pelaku bisnis dengan 8 perjalanan dalam 90 hari di rute bisnis utama, hemat 30%.

Seasonal Pass dapat dibeli di menu "Berlangganan" di aplikasi. Setelah membeli, pemesanan lebih mudah dengan pilih "Gunakan Pass" saat booking. Pass bersifat personal dan perlu identifikasi saat check-in.',
            'keywords' => 'pass,seasonal,berlangganan,subscription,commuter,regular,langganan',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $promos->id,
            'question_pattern' => 'promo first time',
            'answer' => 'Untuk pengguna baru aplikasi Ferry Booking, kami menawarkan promo khusus:

1) Diskon 20% untuk pemesanan pertama (maksimal Rp150.000),
2) Bonus 200 FerryPoints setelah menyelesaikan perjalanan pertama,
3) Voucher Rp50.000 untuk pemesanan kedua (minimal transaksi Rp300.000),
4) Gratis Asuransi Perjalanan Premium untuk perjalanan pertama.

Promo otomatis berlaku untuk akun baru yang belum pernah melakukan transaksi. Pastikan menyelesaikan verifikasi akun untuk mendapatkan semua benefit. Promo pengguna baru memiliki masa berlaku 30 hari sejak pendaftaran dan tidak dapat digabung dengan promo lain.',
            'keywords' => 'first time,pertama kali,new user,pengguna baru,welcome,first',
            'priority' => 7
        ]);

        // Template untuk Tips Perjalanan
        ChatTemplate::create([
            'category_id' => $travelTips->id,
            'question_pattern' => 'tips perjalanan pertama',
            'answer' => 'Tips untuk perjalanan feri pertama Anda:

1) Datang minimal 60 menit sebelum keberangkatan (90 menit untuk kendaraan),
2) Bawa ID asli dan tiket yang mudah diakses,
3) Cek prakiraan cuaca dan siapkan obat anti mabuk laut jika perlu,
4) Pilih tempat duduk di tengah kapal untuk meminimalkan guncangan,
5) Bawa powerbank dan hiburan,
6) Kenakan pakaian nyaman dan bawa sweater tipis karena AC bisa dingin,
7) Simpan barang berharga pada tas yang selalu Anda bawa,
8) Unduh peta kapal dari aplikasi untuk navigasi mudah.

Jangan ragu bertanya pada petugas kapal jika butuh bantuan.',
            'keywords' => 'tips,pertama,perjalanan pertama,pemula,first time,newbie,saran',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $travelTips->id,
            'question_pattern' => 'tips musim hujan',
            'answer' => 'Tips perjalanan feri saat musim hujan:

1) Periksa status keberangkatan sebelum berangkat ke terminal,
2) Siapkan jas hujan dan payung untuk perjalanan ke/dari terminal,
3) Lindungi dokumen dan elektronik dalam tas anti air,
4) Tiba lebih awal karena kemungkinan kemacetan,
5) Siapkan obat anti mabuk karena ombak bisa lebih besar,
6) Pilih jadwal pagi jika memungkinkan saat cuaca biasanya lebih baik,
7) Aktifkan notifikasi aplikasi untuk update perubahan jadwal,
8) Pertimbangkan asuransi perjalanan tambahan.

Prioritaskan keselamatan dan waspadai peringatan cuaca buruk dari BMKG.',
            'keywords' => 'hujan,musim hujan,rainy,wet,basah,ombak,cuaca buruk,rainy season',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $travelTips->id,
            'question_pattern' => 'tips bawa anak',
            'answer' => 'Tips bepergian dengan anak kecil:

1) Bawa dokumen identitas anak (akta kelahiran/kartu pelajar),
2) Pesan tempat duduk berdekatan saat reservasi,
3) Datang lebih awal dan manfaatkan boarding prioritas untuk keluarga,
4) Bawa camilan, minuman, dan hiburan untuk anak,
5) Siapkan obat mabuk laut anak jika diperlukan,
6) Kenalkan pada petugas dan lokasi toilet terdekat,
7) Untuk bayi, bawa popok ekstra, tisu basah, dan formula/MPASI cukup,
8) Gunakan baby carrier untuk mobilitas lebih mudah di kapal,
9) Pilih kapal dengan fasilitas anak jika tersedia.

Selalu awasi anak Anda selama perjalanan dan jangan biarkan mereka berkeliaran tanpa pengawasan.',
            'keywords' => 'anak,balita,bayi,infant,child,kid,family,keluarga,kid-friendly',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $travelTips->id,
            'question_pattern' => 'tips antrean pendek',
            'answer' => 'Strategi untuk menghindari antrean panjang:

1) Lakukan check-in online 24 jam sebelum keberangkatan,
2) Datang saat "off-peak hours" (10.00-14.00 di hari kerja),
3) Manfaatkan Fast Track Check-in (gratis untuk Gold/Platinum member atau Rp50.000/orang),
4) Pilih keberangkatan pagi (sebelum 08.00) atau malam (setelah 20.00),
5) Hindari akhir pekan dan tanggal merah,
6) Pilih terminal alternatif yang melayani rute yang sama jika tersedia,
7) Jika dengan kendaraan, datang 2 jam sebelumnya untuk masuk batch pertama.

Untuk musim liburan, sebaiknya pemesanan dilakukan jauh hari dan datang 2-3 jam sebelum keberangkatan.',
            'keywords' => 'antre,antrian,antri,queue,panjang,pendek,tunggu,cepat,fast',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $travelTips->id,
            'question_pattern' => 'tips mabuk laut',
            'answer' => 'Untuk mencegah dan mengatasi mabuk laut:

1) Konsumsi obat anti mabuk 30-60 menit sebelum keberangkatan,
2) Pilih tempat duduk di tengah kapal (paling stabil),
3) Fokus pada horizon atau titik tetap di kejauhan,
4) Hindari membaca atau melihat layar terlalu lama,
5) Konsumsi makanan ringan sebelum dan selama perjalanan,
6) Hindari alkohol dan makanan berlemak,
7) Gunakan gelang akupresur anti mabuk,
8) Hirup minyak peppermint atau jahe untuk meredakan mual,
9) Bernapas perlahan dan teratur.

Jika tetap mual, cari area terbuka dengan udara segar dan beritahu petugas kapal yang dapat membantu dengan obat atau penanganan darurat.',
            'keywords' => 'mabuk,laut,seasick,motion,mual,muntah,pusing,motion sickness',
            'priority' => 7
        ]);

        // Template tambahan untuk Tips Perjalanan
        ChatTemplate::create([
            'category_id' => $travelTips->id,
            'question_pattern' => 'tips bepergian dengan lansia',
            'answer' => 'Tips bepergian dengan lansia:

1) Pesan kursi yang dekat dengan toilet dan akses mudah,
2) Manfaatkan layanan bantuan khusus dan boarding prioritas,
3) Bawa semua obat-obatan rutin dengan dosis ekstra,
4) Pastikan lansia terhidrasi dengan baik selama perjalanan,
5) Bawa bantal leher dan selimut tipis untuk kenyamanan,
6) Lakukan jalan-jalan singkat setiap jam untuk mencegah kaki bengkak dan kram,
7) Tiba lebih awal untuk menghindari terburu-buru,
8) Gunakan kursi roda jika perlu (tersedia di terminal utama),
9) Pilih kapal dengan fasilitas lebih baik dan lebih stabil untuk rute yang sama.

Selalu informasikan kondisi kesehatan khusus saat pemesanan untuk mendapatkan bantuan yang tepat.',
            'keywords' => 'lansia,elderly,senior,tua,orang tua,kakek,nenek,old',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $travelTips->id,
            'question_pattern' => 'tips perjalanan hemat',
            'answer' => 'Tips menghemat biaya perjalanan feri:

1) Pesan jauh hari (minimal 2-3 minggu) untuk harga terbaik,
2) Pilih hari kerja (Selasa-Kamis) dengan tarif hingga 30% lebih murah,
3) Daftar newsletter untuk info promo,
4) Manfaatkan diskon khusus (pelajar, lansia, dll) jika memenuhi syarat,
5) Pilih jadwal pagi atau malam yang sering lebih murah,
6) Bawa makanan/minuman sendiri untuk menghemat,
7) Gunakan transportasi umum ke/dari terminal,
8) Cek promo bundling dengan akomodasi jika perlu menginap,
9) Pertimbangkan rute alternatif yang mungkin lebih ekonomis,
10) Gabung program loyalitas untuk mengumpulkan poin dan diskon masa depan.',
            'keywords' => 'hemat,murah,ekonomis,budget,cheap,affordable,save,frugal',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $travelTips->id,
            'question_pattern' => 'tips perjalanan bisnis',
            'answer' => 'Tips untuk perjalanan bisnis:

1) Pilih keberangkatan pagi atau malam untuk memaksimalkan waktu kerja,
2) Daftar ke program Business Pass untuk diskon 30% untuk perjalanan rutin,
3) Manfaatkan fasilitas Fast Track Check-in untuk efisiensi waktu,
4) Pilih kursi/kabin dengan WiFi dan colokan untuk tetap produktif,
5) Gunakan lounge bisnis (gratis untuk Platinum member) di terminal untuk bekerja sebelum berangkat,
6) Pesan tiket pulang-pergi sekaligus untuk menghemat waktu dan biaya,
7) Simpan semua bukti pembelian untuk klaim pengeluaran bisnis,
8) Atur transportasi dari/ke terminal melalui aplikasi untuk menghindari keterlambatan,
9) Pertimbangkan asuransi perjalanan bisnis yang mencakup ganti rugi dokumen penting.',
            'keywords' => 'bisnis,business,kerja,work,profesional,korporat,corporate,meeting',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $travelTips->id,
            'question_pattern' => 'tips perjalanan berkelompok',
            'answer' => 'Tips untuk perjalanan grup:

1) Tunjuk satu koordinator untuk mengelola pemesanan dan komunikasi,
2) Manfaatkan diskon grup (5% untuk 10+ orang, 10% untuk 20+ orang, 15% untuk 30+ orang),
3) Pesan jauh hari, minimal 1 bulan untuk grup besar,
4) Buat grup chat untuk berbagi info penting,
5) Tentukan tempat kumpul dan waktu yang tepat di terminal,
6) Datang 2 jam sebelum keberangkatan,
7) Bagikan salinan tiket dan itinerary ke semua anggota,
8) Buat sistem buddy agar semua anggota terpantau,
9) Untuk grup 20+ orang, pertimbangkan check-in terpisah dimana koordinator menangani semua dokumen,
10) Bicarakan dengan tim khusus kami di 0800-234-5678 untuk fasilitas khusus grup besar.',
            'keywords' => 'grup,group,rombongan,kelompok,banyak orang,team,tim,berkelompok',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $travelTips->id,
            'question_pattern' => 'tips foto di kapal',
            'answer' => 'Tips fotografi di kapal feri:

1) Waktu terbaik adalah saat golden hour (30 menit setelah sunrise atau sebelum sunset),
2) Lokasi terbaik: deck terbuka dengan panorama laut atau saat kapal mendekati dermaga dengan pemandangan pulau,
3) Mode burst sangat berguna untuk kondisi kapal bergerak,
4) Gunakan shutter speed tinggi (minimal 1/250) untuk mengatasi guncangan,
5) Waspada percikan air, lindungi kamera Anda,
6) Manfaatkan siluet dengan matahari di belakang subjek,
7) Untuk foto interior, cari sudut kapal yang unik atau arsitektur menarik,
8) Hormati privasi penumpang lain dan ikuti aturan pengambilan gambar di kapal,
9) Hindari berfoto di area terlarang dan selalu utamakan keselamatan.',
            'keywords' => 'foto,fotografi,kamera,photo,picture,photography,video,gambar',
            'priority' => 5
        ]);

        // Template untuk Kebutuhan Khusus
        ChatTemplate::create([
            'category_id' => $specialNeeds->id,
            'question_pattern' => 'kursi roda',
            'answer' => 'Layanan untuk pengguna kursi roda:

1) Sebagian besar terminal memiliki ramp dan akses kursi roda,
2) Tersedia bantuan khusus dari staf selama boarding dan debarkasi,
3) Kapal utama memiliki area khusus pengguna kursi roda dengan space lebih luas,
4) Toilet khusus difabel tersedia di terminal utama dan kapal besar,
5) Untuk memastikan layanan terbaik, beritahu saat pemesanan dengan memilih "Membutuhkan Bantuan Khusus" dan spesifikasi "Pengguna Kursi Roda".

Harap datang 90 menit sebelum keberangkatan dan melapor ke counter bantuan khusus di terminal.',
            'keywords' => 'kursi roda,wheelchair,disabilitas,difabel,disability,access',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $specialNeeds->id,
            'question_pattern' => 'ibu hamil',
            'answer' => 'Layanan untuk ibu hamil:

1) Boarding prioritas tanpa antre,
2) Kursi khusus yang lebih nyaman dan dekat toilet,
3) Bantuan dengan bagasi,
4) Akses ke ruang istirahat di terminal utama.

Ibu hamil hingga 36 minggu dapat bepergian tanpa surat dokter. Untuk kehamilan 36-38 minggu, diperlukan surat keterangan dokter bahwa aman untuk bepergian. Kami tidak menyarankan perjalanan untuk kehamilan di atas 38 minggu. Beritahu kondisi kehamilan saat pemesanan dengan memilih "Membutuhkan Bantuan Khusus".',
            'keywords' => 'hamil,pregnant,kehamilan,ibu hamil,bumil,pregnancy',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $specialNeeds->id,
            'question_pattern' => 'tuna netra',
            'answer' => 'Layanan untuk penyandang tuna netra:

1) Pendamping khusus dari terminal hingga ke tempat duduk di kapal,
2) Diperbolehkan membawa anjing penuntun (dengan dokumen resmi),
3) Informasi audio mengenai keberangkatan dan keselamatan,
4) Boarding prioritas tanpa antre,
5) Menu Braille di beberapa kapal utama.

Untuk mendapatkan bantuan optimal, beritahu saat pemesanan dengan memilih "Membutuhkan Bantuan Khusus" dan spesifikasi "Tuna Netra". Penumpang tuna netra disarankan membawa pendamping, namun jika sendiri, staf kami siap membantu.',
            'keywords' => 'tuna netra,blind,buta,visual impairment,netra,visual',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $specialNeeds->id,
            'question_pattern' => 'gangguan pendengaran',
            'answer' => 'Layanan untuk penyandang gangguan pendengaran:

1) Informasi visual di layar untuk pengumuman penting,
2) Staf terlatih dalam komunikasi dasar bahasa isyarat,
3) Kartu informasi visual untuk komunikasi kebutuhan dasar,
4) Sistem getaran notifikasi untuk kondisi darurat di beberapa kapal utama.

Kami menyarankan untuk memberitahu kondisi saat pemesanan dengan memilih "Membutuhkan Bantuan Khusus" dan spesifikasi "Gangguan Pendengaran". Jika memungkinkan, sertakan catatan tentang metode komunikasi yang disukai.',
            'keywords' => 'tuli,gangguan pendengaran,tuna rungu,deaf,hearing,pendengaran',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $specialNeeds->id,
            'question_pattern' => 'kondisi kesehatan khusus',
            'answer' => 'Untuk penumpang dengan kondisi kesehatan khusus (seperti diabetes, epilepsi, atau penyakit jantung):

1) Kami menyediakan penyimpanan obat berpendingin jika diperlukan,
2) Staf kapal utama memiliki pelatihan P3K dan kondisi medis umum,
3) Kapal jarak jauh dilengkapi ruang kesehatan dasar,
4) Makanan khusus diet tersedia jika dipesan 48 jam sebelumnya.

Harap beritahu kondisi saat pemesanan dan bawa surat dokter serta obat-obatan yang mencukupi. Untuk perjalanan jarak jauh, sebaiknya konsultasi dengan dokter sebelum bepergian.',
            'keywords' => 'kesehatan,penyakit,medical,medis,kondisi,sakit,diabetes,jantung',
            'priority' => 6
        ]);

        // Template tambahan untuk Kebutuhan Khusus
        ChatTemplate::create([
            'category_id' => $specialNeeds->id,
            'question_pattern' => 'lansia',
            'answer' => 'Layanan khusus untuk penumpang lansia (60+ tahun):

1) Bantuan dengan bagasi,
2) Boarding prioritas tanpa antre,
3) Kursi khusus yang mudah diakses di area stabil kapal,
4) Area istirahat di terminal utama,
5) Diskon 15% dengan menunjukkan KTP.

Untuk mendapatkan bantuan optimal, beritahu saat pemesanan dengan memilih "Membutuhkan Bantuan Khusus" dan spesifikasi "Lansia". Kami menyarankan lansia dengan mobilitas terbatas untuk bepergian dengan pendamping. Kursi roda tersedia di terminal utama jika diperlukan.',
            'keywords' => 'lansia,elderly,tua,senior,lanjut usia,orangtua,jompo',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $specialNeeds->id,
            'question_pattern' => 'autisme dan kebutuhan sensorik',
            'answer' => 'Untuk penumpang dengan autisme atau kebutuhan sensorik khusus:

1) Kami menyediakan "quiet zone" di beberapa kapal utama (area dengan stimulasi rendah),
2) Boarding prioritas untuk menghindari keramaian,
3) "Social story" visual tentang perjalanan feri dapat diunduh dari website kami,
4) Penumpang boleh membawa comfort item atau headphone noise-cancelling,
5) Staf terlatih dalam interaksi dengan penumpang neurodivergent.

Beritahu kebutuhan khusus saat pemesanan untuk mendapatkan akomodasi yang sesuai. Disarankan untuk mengunjungi terminal sebelum hari perjalanan jika memungkinkan, untuk membiasakan diri dengan lingkungan.',
            'keywords' => 'autisme,autism,sensory,sensorik,neurodivergent,asd,spectrum',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $specialNeeds->id,
            'question_pattern' => 'anjing penuntun',
            'answer' => 'Kebijakan tentang anjing penuntun/anjing pendamping:

1) Anjing penuntun untuk tuna netra dan anjing pendamping untuk disabilitas lain diperbolehkan tanpa biaya tambahan,
2) Harus memiliki sertifikat resmi dan rompi/penanda sebagai anjing pendamping,
3) Tidak perlu dikandangkan dan boleh tetap bersama penumpang,
4) Vaksinasi rabies dan surat kesehatan hewan wajib dibawa,
5) Tersedia area khusus untuk kebutuhan anjing di beberapa kapal utama.

Beritahu keberadaan anjing penuntun saat pemesanan untuk persiapan terbaik. Anjing harus tetap patuh dan dikendalikan sepanjang perjalanan.',
            'keywords' => 'anjing,penuntun,guide dog,service animal,assistance dog,guide,helper',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $specialNeeds->id,
            'question_pattern' => 'berkebutuhan khusus traveling sendiri',
            'answer' => 'Untuk penyandang disabilitas yang bepergian sendiri:

1) Layanan pendampingan khusus dari check-in hingga kapal (gratis),
2) Petugas khusus akan memastikan kebutuhan Anda terpenuhi selama perjalanan,
3) Tombol panggil bantuan tersedia di area penumpang berkebutuhan khusus,
4) Prioritas saat boarding dan debarkasi,
5) Staf dilatih untuk mendukung kemandirian sekaligus memberikan bantuan sesuai kebutuhan.

Untuk memastikan kenyamanan optimal, hubungi kami 48 jam sebelum keberangkatan di special_assistance@ferryapp.id dengan detail kebutuhan spesifik Anda.',
            'keywords' => 'sendiri,solo,independent,alone,mandiri,tanpa pendamping,by myself',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $specialNeeds->id,
            'question_pattern' => 'makanan khusus diet',
            'answer' => 'Pilihan makanan untuk kebutuhan diet khusus:

1) Vegetarian/Vegan tersedia di semua rute panjang,
2) Makanan bebas gluten tersedia dengan pemesanan 48 jam sebelumnya,
3) Pilihan rendah garam/rendah gula untuk kondisi medis,
4) Menu khusus alergen (bebas kacang, susu, telur) dengan pemberitahuan 48 jam sebelumnya.

Untuk memesan makanan khusus, pilih "Layanan Tambahan" > "Makanan Khusus" saat pemesanan tiket, atau hubungi special_meals@ferryapp.id minimal 48 jam sebelum keberangkatan dengan detail kebutuhan diet dan nomor booking Anda.',
            'keywords' => 'makanan,diet,vegetarian,vegan,gluten,alergi,allergy,special diet',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $accountInfo->id,
            'question_pattern' => 'verifikasi akun',
            'answer' => 'Verifikasi akun diperlukan untuk keamanan. Setelah mendaftar, Anda akan menerima kode verifikasi melalui SMS atau email. Masukkan kode tersebut di aplikasi untuk menyelesaikan proses verifikasi. Jika tidak menerima kode dalam 5 menit, gunakan opsi "Kirim Ulang Kode". Pastikan email dan nomor telepon yang Anda daftarkan aktif dan benar.',
            'keywords' => 'verifikasi,verification,otp,kode,code,aktivasi,activate',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $accountInfo->id,
            'question_pattern' => 'lupa kata sandi',
            'answer' => 'Jika lupa kata sandi:

1) Klik "Lupa Kata Sandi" di halaman login,
2) Masukkan email terdaftar,
3) Cek email untuk tautan reset kata sandi,
4) Klik tautan dan buat kata sandi baru,
5) Login dengan kata sandi baru.

Tautan reset kata sandi hanya berlaku selama 1 jam. Jika masih mengalami masalah, hubungi layanan pelanggan kami di 0800-123-4567.',
            'keywords' => 'lupa,password,kata sandi,reset,forgot,ganti password',
            'priority' => 8
        ]);

        ChatTemplate::create([
            'category_id' => $accountInfo->id,
            'question_pattern' => 'ubah data profil',
            'answer' => 'Untuk mengubah data profil:

1) Login ke aplikasi,
2) Buka menu "Profil Saya",
3) Klik "Edit Profil",
4) Perbarui informasi yang ingin diubah,
5) Klik "Simpan".

Beberapa data seperti nama lengkap, tanggal lahir, dan nomor identitas memerlukan verifikasi ulang jika diubah. Alamat email utama tidak dapat diubah tanpa menghubungi layanan pelanggan.',
            'keywords' => 'ubah,profil,edit,perbarui,data diri,profile,update,data',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $accountInfo->id,
            'question_pattern' => 'hapus akun',
            'answer' => 'Untuk menghapus akun:

1) Login ke aplikasi,
2) Buka menu "Profil",
3) Pilih "Pengaturan Akun",
4) Pilih "Hapus Akun",
5) Ikuti proses verifikasi keamanan,
6) Konfirmasi penghapusan.

Harap diperhatikan bahwa semua data dan riwayat transaksi akan dihapus permanen setelah 30 hari. Tiket aktif tidak akan terpengaruh oleh penghapusan akun.',
            'keywords' => 'hapus,delete,tutup,remove,account,akun,hapus akun,hapus data',
            'priority' => 6
        ]);

        // Template tambahan untuk Akun Pengguna
        ChatTemplate::create([
            'category_id' => $accountInfo->id,
            'question_pattern' => 'keamanan akun',
            'answer' => 'Untuk meningkatkan keamanan akun Anda:

1) Aktifkan verifikasi dua faktor di menu "Pengaturan" > "Keamanan Akun",
2) Gunakan kata sandi yang kuat dengan kombinasi huruf, angka, dan simbol,
3) Perbarui kata sandi secara berkala (minimal setiap 3 bulan),
4) Jangan menggunakan WiFi publik saat login,
5) Pastikan untuk selalu logout dari perangkat umum,
6) Periksa aktivitas login di menu "Riwayat Login",
7) Segera laporkan aktivitas mencurigakan ke cs@ferryapp.id.

Kami tidak pernah meminta kata sandi atau OTP Anda melalui telepon atau email.',
            'keywords' => 'keamanan,security,aman,protect,hack,retas,password,kata sandi',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $accountInfo->id,
            'question_pattern' => 'verifikasi identitas',
            'answer' => 'Verifikasi identitas dapat meningkatkan keamanan akun dan membuka fitur tambahan seperti pembayaran cepat dan boarding prioritas. Caranya:

1) Buka menu "Profil Saya" > "Verifikasi Identitas",
2) Pilih jenis identitas (KTP/Paspor/SIM),
3) Unggah foto dokumen identitas (depan dan belakang),
4) Lakukan verifikasi wajah real-time dengan mengikuti instruksi,
5) Tunggu proses verifikasi (biasanya 1-24 jam).

Setelah terverifikasi, Anda mendapatkan badge "Terverifikasi" di profil dan akses ke promo dan fitur khusus. Data identitas Anda dienkripsi dan dilindungi sesuai kebijakan privasi kami.',
            'keywords' => 'verifikasi,identitas,identity,verification,ktp,verification,verify',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $accountInfo->id,
            'question_pattern' => 'pengguna multiperangkat',
            'answer' => 'Anda dapat mengakses akun Ferry Booking di beberapa perangkat sekaligus. Caranya:

1) Download aplikasi di perangkat lain,
2) Login dengan email dan kata sandi yang sama,
3) Verifikasi perangkat baru melalui kode OTP yang dikirim ke email/SMS Anda.

Fitur ini memungkinkan Anda untuk: mengakses tiket dari perangkat mana pun, mendapatkan notifikasi di semua perangkat terdaftar, melihat riwayat pemesanan dari berbagai perangkat. Untuk keamanan, Anda dapat melihat dan mengelola daftar perangkat aktif di menu "Pengaturan" > "Perangkat Saya" dan mengeluarkan perangkat yang tidak dikenali.',
            'keywords' => 'multiperangkat,multi device,beberapa,perangkat,device,handphone,hp',
            'priority' => 6
        ]);

        ChatTemplate::create([
            'category_id' => $accountInfo->id,
            'question_pattern' => 'cara daftar akun',
            'answer' => 'Untuk mendaftar akun di aplikasi Ferry Booking:

1) Unduh aplikasi dari App Store atau Google Play,
2) Buka aplikasi dan klik "Daftar",
3) Masukkan nama, email, dan nomor telepon,
4) Buat kata sandi,
5) Verifikasi akun melalui email atau SMS,
6) Lengkapi data profil dasar.

Proses pendaftaran hanya membutuhkan waktu sekitar 2 menit. Anda juga dapat mendaftar menggunakan akun Google atau Facebook untuk lebih cepat.',
            'keywords' => 'daftar,register,buat akun,signup,sign up,registrasi,akun baru',
            'priority' => 9
        ]);
    }
}
