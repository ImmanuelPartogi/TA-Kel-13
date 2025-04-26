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
            'answer' => 'Keuntungan menggunakan Ferry Booking App: 1) Pemesanan tiket lebih cepat dan mudah, 2) Tidak perlu antre di loket, 3) Pemberitahuan perubahan jadwal secara langsung, 4) Program loyalitas dan promo khusus pengguna aplikasi, 5) Riwayat perjalanan tersimpan, dan 6) Akses ke layanan pelanggan 24/7.',
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
            'answer' => 'Rute feri paling populer kami meliputi: 1) Merak-Bakauheni, 2) Ketapang-Gilimanuk, 3) Padangbai-Lembar, 4) Batam-Singapura, 5) Benoa-Nusa Penida, dan 6) Sorong-Raja Ampat. Semua rute ini memiliki jadwal keberangkatan rutin setiap hari dengan berbagai pilihan waktu.',
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
            'answer' => 'Untuk mengubah jadwal tiket yang sudah dipesan: 1) Buka menu "Tiket Saya", 2) Pilih tiket yang ingin diubah, 3) Klik tombol "Ubah Jadwal", 4) Pilih jadwal baru yang tersedia, 5) Bayar selisih harga jika ada. Perubahan jadwal hanya dapat dilakukan paling lambat 24 jam sebelum keberangkatan asli.',
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
            'answer' => 'Kebijakan refund kami: 1) Pembatalan 7+ hari sebelum keberangkatan: refund 90%, 2) 3-6 hari sebelum keberangkatan: refund 75%, 3) 1-2 hari sebelum keberangkatan: refund 50%, 4) Hari H: tidak ada refund. Biaya administrasi sebesar Rp25.000 akan dikenakan untuk setiap refund. Proses refund membutuhkan waktu 7-14 hari kerja.',
            'keywords' => 'refund,uang kembali,batal,cancel,kebijakan,policy',
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
            'answer' => 'Hewan peliharaan diperbolehkan di sebagian rute dengan syarat: 1) Ditempatkan dalam kandang yang aman, 2) Memiliki sertifikat vaksin yang valid, 3) Membayar biaya tambahan mulai dari Rp100.000 tergantung ukuran hewan. Harap memberi tahu saat pemesanan dengan memilih opsi "Dengan Hewan Peliharaan" dan mengisi detail yang diperlukan.',
            'keywords' => 'hewan,peliharaan,pet,anjing,kucing,dog,cat,animal',
            'priority' => 6
        ]);

        // Template untuk layanan pelanggan
        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'kontak layanan pelanggan',
            'answer' => 'Anda dapat menghubungi layanan pelanggan kami melalui: 1) Telepon: 0800-123-4567 (24/7), 2) Email: cs@ferryapp.id, 3) Live chat di aplikasi (08.00-22.00), 4) Whatsapp: 0812-3456-7890, atau 5) Media sosial kami @ferryapp.id.',
            'keywords' => 'kontak,hubungi,contact,cs,layanan pelanggan,customer service,bantuan',
            'priority' => 9
        ]);

        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'kehilangan barang',
            'answer' => 'Jika Anda kehilangan barang di kapal atau terminal: 1) Segera laporkan ke petugas terdekat, 2) Hubungi layanan pelanggan kami di 0800-123-4567, 3) Berikan deskripsi detail barang yang hilang, waktu dan lokasi perkiraan kehilangan. Kami akan berusaha membantu menemukan barang Anda. Untuk klaim asuransi, laporan kehilangan harus dibuat dalam 24 jam.',
            'keywords' => 'hilang,lost,kehilangan,barang,luggage,bagasi,found',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $customerService->id,
            'question_pattern' => 'pengaduan layanan',
            'answer' => 'Kami sangat menghargai umpan balik Anda. Untuk menyampaikan keluhan atau saran, silakan: 1) Gunakan fitur "Umpan Balik" di aplikasi, 2) Email ke feedback@ferryapp.id, atau 3) Hubungi layanan pelanggan kami di 0800-123-4567. Setiap pengaduan akan ditindaklanjuti dalam waktu maksimal 2x24 jam kerja.',
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
            'answer' => 'Dokumen yang diperlukan untuk perjalanan feri: 1) Tiket elektronik, 2) KTP/Paspor/SIM asli untuk setiap penumpang dewasa, 3) Akta kelahiran/Kartu Pelajar untuk anak-anak, 4) STNK asli untuk penumpang dengan kendaraan. Untuk rute internasional, pastikan Anda memiliki paspor dan visa yang valid.',
            'keywords' => 'dokumen,document,identitas,id,ktp,persyaratan,requirement',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $policies->id,
            'question_pattern' => 'anak-anak dan bayi',
            'answer' => 'Kebijakan untuk anak-anak dan bayi: 1) Bayi (0-2 tahun): gratis, tanpa kursi terpisah, 2) Anak-anak (3-11 tahun): tarif khusus anak (75% dari harga dewasa), 3) Usia 12+ tahun: tarif dewasa. Semua anak, termasuk bayi, harus didaftarkan saat pemesanan. Anak di bawah 15 tahun harus didampingi orang dewasa.',
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
            'answer' => 'Jika perjalanan dibatalkan oleh perusahaan karena kondisi cuaca buruk atau alasan teknis, Anda berhak mendapatkan: 1) Pengembalian dana penuh, atau 2) Penjadwalan ulang ke keberangkatan berikutnya tanpa biaya tambahan. Pembaruan status akan dikirim melalui SMS, email, dan notifikasi aplikasi.',
            'keywords' => 'cuaca,batal,pembatalan,weather,cancel,reschedule,buruk,hujan,badai',
            'priority' => 8
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
            'answer' => 'Jangan khawatir jika e-ticket Anda hilang. Anda dapat mengakses kembali tiket elektronik melalui: 1) Aplikasi Ferry Booking di menu "Tiket Saya", 2) Email yang dikirimkan saat pemesanan, atau 3) Mencetak ulang di konter layanan pelanggan di terminal dengan menunjukkan identitas dan bukti pemesanan.',
            'keywords' => 'tiket,hilang,lost,ticket,tidak ada,lupa,cetak,print',
            'priority' => 7
        ]);

        ChatTemplate::create([
            'category_id' => $faq->id,
            'question_pattern' => 'mabuk laut',
            'answer' => 'Untuk mencegah mabuk laut: 1) Pilih tempat duduk di tengah kapal dimana guncangan minimal, 2) Hindari membaca atau melihat layar terlalu lama, 3) Pandang horison yang stabil, 4) Konsumsi makanan ringan sebelum perjalanan, 5) Pertimbangkan obat anti mabuk laut. Beberapa kapal kami pada rute tertentu dilengkapi dengan stabilizer untuk mengurangi guncangan.',
            'keywords' => 'mabuk,laut,seasick,motion sickness,mual,muntah,pusing',
            'priority' => 6
        ]);
    }
}
