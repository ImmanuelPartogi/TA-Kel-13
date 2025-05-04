<?php

namespace App\Console\Commands;

use App\Helpers\NotificationHelper;
use App\Models\Booking;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TestBoardingNotifications extends Command
{
    protected $signature = 'notifications:test-boarding {booking_id?} {--hours=1} {--force}';
    protected $description = 'Tes pengiriman notifikasi boarding untuk booking tertentu';

    /**
     * Handle the console command.
     *
     * @return int
     */
    public function handle()
    {
        $bookingId = $this->argument('booking_id');
        $hours = $this->option('hours');
        $force = $this->option('force');

        $this->info("Memulai pengujian notifikasi boarding...");
        Log::info("Menjalankan pengujian notifikasi boarding via command");

        try {
            $notificationService = app(NotificationService::class);

            if ($bookingId) {
                // Jika ID booking diberikan, hanya proses booking tersebut
                $booking = Booking::with(['user', 'schedule.route'])->find($bookingId);

                if (!$booking) {
                    $this->error("Booking dengan ID {$bookingId} tidak ditemukan");
                    return 1;
                }

                $this->info("Memproses booking: {$booking->booking_code}");

                // Cek apakah ada user terkait
                if (!$booking->user) {
                    $this->error("Booking {$bookingId} tidak memiliki user terkait");
                    return 1;
                }

                // Cek apakah ada schedule terkait
                if (!$booking->schedule) {
                    $this->error("Booking {$bookingId} tidak memiliki schedule terkait");
                    return 1;
                }

                // Cek apakah ada route terkait
                if (!$booking->schedule->route) {
                    $this->warn("Booking {$bookingId} tidak memiliki informasi rute lengkap");
                    $routeName = "Rute tidak diketahui";
                } else {
                    $routeName = $booking->schedule->route->name ??
                        "{$booking->schedule->route->origin} - {$booking->schedule->route->destination}";
                }

                // Ambil departure_time dari schedule
                $departureTime = $booking->schedule->departure_time;
                $departureDate = $booking->departure_date;

                $this->info("Rute: {$routeName}");
                $this->info("Waktu keberangkatan: {$departureTime}");

                // Debug
                $this->info("Format tanggal pada database: {$departureDate}");
                $this->info("Format waktu pada database: {$departureTime}");

                // Persiapkan waktu keberangkatan untuk kalkulasi
                try {
                    // Gunakan Carbon::parse yang lebih fleksibel untuk berbagai format
                    if (strpos($departureTime, ':') !== false) {
                        // Jika departureTime hanya berisi waktu (HH:MM:SS)
                        if (strpos($departureTime, ' ') === false) {
                            // Ekstrak tanggal murni jika ada timestamp
                            if (strpos($departureDate, ' ') !== false) {
                                $departureDate = explode(' ', $departureDate)[0];
                            }
                            $dateTimeString = "{$departureDate} {$departureTime}";
                        } else {
                            // departureTime sudah termasuk tanggal dan waktu
                            $dateTimeString = $departureTime;
                        }
                    } else {
                        $this->error("Format waktu tidak valid: {$departureTime}");
                        return 1;
                    }

                    $this->info("String datetime yang diproses: {$dateTimeString}");
                    $departureDateTime = Carbon::parse($dateTimeString);
                    $now = Carbon::now();
                    $hoursDiff = $now->diffInHours($departureDateTime, false);

                    $this->info("Waktu keberangkatan (parsed): {$departureDateTime->format('Y-m-d H:i:s')}");
                    $this->info("Waktu sekarang: {$now->format('Y-m-d H:i:s')}");
                    $this->info("Selisih waktu: {$hoursDiff} jam");

                    if ($hoursDiff <= $hours && $hoursDiff > 0) {
                        $this->info("Booking berada dalam rentang {$hours} jam sebelum keberangkatan.");
                    } else {
                        $this->warn("Booking TIDAK berada dalam rentang {$hours} jam sebelum keberangkatan.");

                        if (!$force) {
                            if (!$this->confirm("Kirim notifikasi meskipun di luar rentang waktu?")) {
                                $this->info("Operasi dibatalkan oleh user");
                                return 0;
                            }
                        } else {
                            $this->info("Mengabaikan pengecekan waktu karena flag --force aktif");
                        }
                    }

                    // Format waktu untuk notifikasi
                    // Gunakan format waktu yang lebih sederhana untuk notifikasi (HH:MM)
                    $timeForNotification = $departureDateTime->format('H:i');

                    // Kirim notifikasi
                    $notification = $notificationService->sendBoardingReminderNotification(
                        $booking->user,
                        $booking->booking_code,
                        $routeName,
                        $timeForNotification,
                        $hours
                    );

                    if ($notification) {
                        $this->info("Notifikasi berhasil dikirim!");
                        $this->info("ID Notifikasi: {$notification->id}");
                        $this->info("Judul: {$notification->title}");
                        $this->info("Pesan: {$notification->message}");

                        // Buat log notifikasi
                        try {
                            \App\Models\NotificationLog::create([
                                'booking_id' => $booking->id,
                                'notification_id' => $notification->id,
                                'type' => 'BOARDING',
                                'scheduled_at' => now(),
                                'sent_at' => now(),
                                'is_sent' => true,
                                'status' => 'SENT'
                            ]);
                        } catch (\Exception $e) {
                            $this->warn("Gagal mencatat log notifikasi: " . $e->getMessage());
                        }

                        return 0;
                    } else {
                        $this->error("Gagal mengirim notifikasi");
                        return 1;
                    }

                } catch (\Exception $e) {
                    $this->error("Error memproses waktu keberangkatan: " . $e->getMessage());
                    return 1;
                }

            } else {
                // Jika tidak ada ID booking, gunakan fungsi helper reguler
                $this->info("Tidak ada ID booking yang diberikan, memproses semua booking yang akan berangkat hari ini");

                $count = NotificationHelper::sendBoardingReminders($hours);

                $this->info("Total {$count} notifikasi boarding berhasil dikirim");
                return 0;
            }

        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            Log::error("Error pada command test-boarding: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}
