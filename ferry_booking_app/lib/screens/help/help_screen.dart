import 'package:flutter/material.dart';
import 'package:ferry_booking_app/config/theme.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bantuan'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Header
          Center(
            child: Column(
              children: [
                Icon(
                  Icons.support_agent,
                  size: 64,
                  color: AppTheme.primaryColor,
                ),
                const SizedBox(height: 16),
                const Text(
                  'Pusat Bantuan',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Jika Anda memiliki pertanyaan, temukan jawaban di sini',
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 16,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),

          // FAQ Section
          const Text(
            'Pertanyaan Umum',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          _buildFaqItem(
            context,
            'Bagaimana cara memesan tiket?',
            'Untuk memesan tiket, Anda perlu: \n\n'
                '1. Pergi ke tab Beranda atau tab Tiket\n'
                '2. Tekan tombol "Pesan Tiket" atau "+" \n'
                '3. Pilih rute perjalanan\n'
                '4. Pilih jadwal dan tanggal keberangkatan\n'
                '5. Isi data penumpang dan kendaraan (jika ada)\n'
                '6. Lakukan pembayaran dengan metode yang tersedia\n\n'
                'Setelah pembayaran berhasil, tiket akan tampil di tab Tiket.',
          ),

          _buildFaqItem(
            context,
            'Bagaimana cara membatalkan tiket?',
            'Untuk membatalkan tiket: \n\n'
                '1. Pergi ke tab Tiket\n'
                '2. Pilih tiket yang ingin dibatalkan\n'
                '3. Scroll ke bawah dan tekan tombol "Batalkan Pemesanan"\n'
                '4. Konfirmasi pembatalan\n\n'
                'Perhatikan bahwa pembatalan hanya dapat dilakukan maksimal 24 jam sebelum keberangkatan. Kebijakan pengembalian dana berbeda-beda tergantung waktu pembatalan.',
          ),

          _buildFaqItem(
            context,
            'Metode pembayaran apa saja yang tersedia?',
            'Kami menerima berbagai metode pembayaran, antara lain:\n\n'
                '- Transfer bank (Virtual Account)\n'
                '- E-Wallet (GoPay, ShopeePay)\n'
                '- Kartu kredit\n'
                '- Minimarket (Alfamart, Indomaret)\n\n'
                'Setelah memesan tiket, Anda akan diarahkan ke halaman pembayaran dengan petunjuk lengkap.',
          ),

          _buildFaqItem(
            context,
            'Apa yang harus saya lakukan saat hari keberangkatan?',
            'Pada hari keberangkatan: \n\n'
                '1. Datanglah ke pelabuhan minimal 30 menit sebelum jadwal keberangkatan\n'
                '2. Tunjukkan tiket digital (QR Code) di aplikasi kepada petugas\n'
                '3. Jika membawa kendaraan, ikuti petunjuk petugas untuk menaiki kapal\n\n'
                'Pastikan Anda telah menyiapkan dokumen identitas asli yang sesuai dengan data saat pemesanan.',
          ),

          _buildFaqItem(
            context,
            'Bagaimana jika kapal terlambat atau dibatalkan?',
            'Jika terjadi keterlambatan atau pembatalan: \n\n'
                '1. Anda akan mendapatkan notifikasi melalui aplikasi dan email\n'
                '2. Untuk keterlambatan, Anda dapat tetap menggunakan tiket pada jadwal baru\n'
                '3. Untuk pembatalan oleh kami, Anda berhak mendapatkan pengembalian dana penuh atau penggantian jadwal\n\n'
                'Silakan hubungi layanan pelanggan untuk informasi lebih lanjut.',
          ),

          const SizedBox(height: 24),

          // Contact Section
          const Text(
            'Hubungi Kami',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  ListTile(
                    leading: Icon(Icons.phone, color: AppTheme.primaryColor),
                    title: const Text('Call Center'),
                    subtitle: const Text('0800-123-4567'),
                    onTap: () {
                      // Action to make phone call
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: Icon(Icons.email, color: AppTheme.primaryColor),
                    title: const Text('Email'),
                    subtitle: const Text('support@ferryapp.com'),
                    onTap: () {
                      // Action to send email
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: Icon(Icons.chat, color: AppTheme.primaryColor),
                    title: const Text('Live Chat'),
                    subtitle: const Text('Jam operasional: 08.00 - 20.00 WIB'),
                    onTap: () {
                      // Action to open live chat
                    },
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildFaqItem(BuildContext context, String question, String answer) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12.0),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        title: Text(
          question,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              answer,
              style: TextStyle(
                color: Colors.grey[800],
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}