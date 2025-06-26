<?php

namespace App\Helpers;

use App\Models\Notification;
use App\Models\NotificationLog;
use App\Models\User;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class NotificationHelper
{
    /**
     * Kirim notifikasi pengingat check-in untuk semua booking yang akan berangkat besok
     *
     * @return int Jumlah notifikasi yang dikirim
     */
    public static function sendCheckinReminders()
    {
        $count = 0;
        $notificationService = app(NotificationService::class);
        $tomorrow = Carbon::tomorrow()->format('Y-m-d');

        try {
            // Ambil semua booking yang akan berangkat besok
            $bookings = \App\Models\Booking::with(['user', 'schedule.route'])
                ->where('departure_date', $tomorrow)
                ->where('status', 'CONFIRMED')
                ->get();

            foreach ($bookings as $booking) {
                try {
                    // Skip jika tidak ada schedule atau route
                    if (!$booking->schedule || !$booking->schedule->route) {
                        Log::warning("Booking {$booking->booking_code} tidak memiliki schedule atau route yang valid");
                        continue;
                    }

                    // Tentukan nama rute dengan fallback jika name tidak tersedia
                    $routeName = $booking->schedule->route->name ??
                        "{$booking->schedule->route->origin} - {$booking->schedule->route->destination}";

                    // Pastikan routeName tidak null
                    if (empty($routeName)) {
                        $routeName = "Rute Ferry"; // Default fallback
                    }

                    // Kirim notifikasi ke pengguna
                    $notificationService->sendCheckinReminderNotification(
                        $booking->user,
                        $booking->booking_code,
                        $routeName,
                        $tomorrow
                    );

                    $count++;

                    // Log untuk debugging
                    Log::info("Notifikasi check-in dikirim untuk booking {$booking->booking_code}, rute: {$routeName}");
                } catch (\Exception $e) {
                    Log::error("Gagal mengirim notifikasi check-in untuk booking {$booking->booking_code}: " . $e->getMessage());
                    // Lanjutkan ke booking berikutnya
                }
            }

            return $count;
        } catch (\Exception $e) {
            Log::error("Error dalam sendCheckinReminders: " . $e->getMessage());
            return 0; // Return 0 jika terjadi error keseluruhan
        }
    }

    /**
     * Kirim notifikasi pengingat boarding untuk semua booking yang akan berangkat dalam X jam
     *
     * @param int $hours Jumlah jam sebelum keberangkatan
     * @return int Jumlah notifikasi yang dikirim
     */
    public static function sendBoardingReminders($hours = 1)
    {
        $count = 0;
        $notificationService = app(NotificationService::class);

        // Log untuk debugging
        Log::info("Menjalankan fungsi sendBoardingReminders pada " . now());

        try {
            // Gunakan zona waktu yang benar
            $now = now();
            $today = $now->format('Y-m-d');

            // Ambil semua booking yang akan berangkat hari ini dan berstatus CONFIRMED
            $bookings = \App\Models\Booking::with(['user', 'schedule.route'])
                ->whereDate('departure_date', $today)
                ->where('status', 'CONFIRMED')
                ->get();

            Log::info("Menemukan {$bookings->count()} booking untuk hari ini");

            foreach ($bookings as $booking) {
                try {
                    // Format waktu dan tanggal dengan benar
                    if (!$booking->schedule) {
                        Log::warning("Booking {$booking->id} tidak memiliki schedule terkait");
                        continue;
                    }

                    $departureTime = $booking->schedule->departure_time;
                    $departureDate = $booking->departure_date;

                    // Debug
                    Log::info("Booking {$booking->id}: Format tanggal pada database: {$departureDate}");
                    Log::info("Booking {$booking->id}: Format waktu pada database: {$departureTime}");

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
                            Log::warning("Format waktu tidak valid untuk booking {$booking->id}: {$departureTime}");
                            continue;
                        }

                        Log::info("Booking {$booking->id}: String datetime yang diproses: {$dateTimeString}");
                        $departureDateTime = Carbon::parse($dateTimeString);
                        $hoursDiff = $now->diffInHours($departureDateTime, false);

                        Log::info("Booking {$booking->booking_code}: Keberangkatan (parsed): {$departureDateTime->format('Y-m-d H:i:s')}, Sekarang: {$now->format('Y-m-d H:i:s')}, Selisih: {$hoursDiff} jam");

                        // Kirim notifikasi jika keberangkatan dalam X jam
                        if ($hoursDiff <= $hours && $hoursDiff > 0) {
                            Log::info("Mengirim notifikasi boarding untuk booking {$booking->booking_code}, {$hoursDiff} jam tersisa");

                            // Pastikan user tersedia
                            if (!$booking->user) {
                                Log::warning("Booking {$booking->id} tidak memiliki user terkait");
                                continue;
                            }

                            // Cek apakah rute tersedia
                            if (!$booking->schedule->route) {
                                Log::warning("Booking {$booking->id} tidak memiliki informasi rute");
                                continue;
                            }

                            $routeName = $booking->schedule->route->name ??
                                "{$booking->schedule->route->origin} - {$booking->schedule->route->destination}";

                            // Pastikan tidak ada notifikasi yang sama sudah dikirim
                            $existingNotification = Notification::where('user_id', $booking->user->id)
                                ->where('type', 'BOARDING')
                                ->where('created_at', '>=', now()->subHours(2))
                                ->whereRaw("JSON_CONTAINS(data, '{\"booking_code\":\"{$booking->booking_code}\"}', '$')")
                                ->first();

                            if ($existingNotification) {
                                Log::info("Notifikasi untuk booking {$booking->booking_code} sudah ada, tidak mengirim ulang");
                                continue;
                            }

                            // Format waktu untuk notifikasi (HH:MM)
                            $timeForNotification = $departureDateTime->format('H:i');

                            // Kirim notifikasi
                            $notification = $notificationService->sendBoardingReminderNotification(
                                $booking->user,
                                $booking->booking_code,
                                $routeName,
                                $timeForNotification,
                                $hoursDiff
                            );

                            if ($notification) {
                                $count++;

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
                                    Log::warning("Gagal mencatat log notifikasi: " . $e->getMessage());
                                }
                            }
                        }
                    } catch (\Exception $e) {
                        Log::error("Error saat pemrosesan waktu untuk booking {$booking->id}: " . $e->getMessage());
                        continue;
                    }
                } catch (\Exception $e) {
                    Log::error("Error memproses notifikasi untuk booking {$booking->id}: " . $e->getMessage());
                    continue; // Lanjutkan ke booking berikutnya
                }
            }

            Log::info("Total {$count} notifikasi boarding berhasil dikirim");
            return $count;
        } catch (\Exception $e) {
            Log::error("Error dalam sendBoardingReminders: " . $e->getMessage());
            throw $e; // Lempar exception untuk ditangkap di command
        }
    }

    /**
     * Kirim notifikasi pengingat pembayaran untuk booking yang belum dibayar
     *
     * @param int $hoursBeforeExpiry Jumlah jam sebelum kadaluarsa
     * @return int Jumlah notifikasi yang dikirim
     */
    public static function sendPaymentReminders($hoursBeforeExpiry = 3)
    {
        $count = 0;
        $notificationService = app(NotificationService::class);
        $now = Carbon::now();

        // Ambil semua payment yang belum dibayar dan akan segera kadaluarsa
        $payments = \App\Models\Payment::with(['booking.user'])
            ->where('status', 'PENDING')
            ->whereNotNull('expiry_date')
            ->get();

        foreach ($payments as $payment) {
            // Hitung waktu kadaluarsa
            $expiryDate = Carbon::parse($payment->expiry_date);

            // Jika waktu kadaluarsa dalam X jam
            $hoursDiff = $now->diffInHours($expiryDate, false);
            if ($hoursDiff <= $hoursBeforeExpiry && $hoursDiff > 0) {
                // Kirim notifikasi ke pengguna
                $notificationService->sendPaymentReminderNotification(
                    $payment->booking->user,
                    $payment->booking->booking_code,
                    number_format($payment->amount, 0, ',', '.'),
                    $expiryDate->format('d M Y H:i')
                );

                $count++;
            }
        }

        return $count;
    }

    /**
     * Hapus notifikasi lama berdasarkan kebijakan retensi
     *
     * @param int $daysToKeepRead Jumlah hari untuk menyimpan notifikasi yang sudah dibaca
     * @param int $daysToKeepUnread Jumlah hari untuk menyimpan notifikasi yang belum dibaca
     * @return int Jumlah notifikasi yang dihapus
     */
    public static function cleanupOldNotifications($daysToKeepRead = 30, $daysToKeepUnread = 90)
    {
        $count = 0;

        // Hapus notifikasi yang sudah dibaca dan lebih lama dari X hari
        $count += Notification::where('is_read', true)
            ->where('created_at', '<', now()->subDays($daysToKeepRead))
            ->delete();

        // Hapus notifikasi yang belum dibaca dan lebih lama dari Y hari
        $count += Notification::where('is_read', false)
            ->where('created_at', '<', now()->subDays($daysToKeepUnread))
            ->delete();

        return $count;
    }

    /**
     * Mengelompokkan notifikasi berdasarkan tanggal
     *
     * @param \Illuminate\Database\Eloquent\Collection $notifications
     * @return array
     */
    public static function groupByDate($notifications)
    {
        $grouped = [];
        $now = Carbon::now();

        foreach ($notifications as $notification) {
            $date = $notification->created_at->format('Y-m-d');
            $formattedDate = '';

            // Format tanggal untuk tampilan
            if ($notification->created_at->isToday()) {
                $formattedDate = 'Hari Ini';
            } elseif ($notification->created_at->isYesterday()) {
                $formattedDate = 'Kemarin';
            } elseif ($notification->created_at->isSameWeek($now)) {
                $formattedDate = $notification->created_at->translatedFormat('l'); // Nama hari
            } else {
                $formattedDate = $notification->created_at->translatedFormat('d F Y'); // Format tanggal lengkap
            }

            if (!isset($grouped[$date])) {
                $grouped[$date] = [
                    'date' => $date,
                    'formatted_date' => $formattedDate,
                    'items' => []
                ];
            }

            $grouped[$date]['items'][] = $notification;
        }

        // Urutkan berdasarkan tanggal terbaru
        krsort($grouped);

        return array_values($grouped);
    }

    /**
     * Mencari dan mengirim ulang notifikasi yang gagal
     *
     * @param int $maxRetries Batas maksimum percobaan pengiriman ulang
     * @param int $maxAgeHours Batas usia notifikasi gagal dalam jam
     * @return int Jumlah notifikasi yang berhasil dikirim ulang
     */
    public static function resendFailedNotifications($maxRetries = 3, $maxAgeHours = 24)
    {
        $count = 0;
        $notificationService = app(NotificationService::class);

        Log::info("Memulai proses pengiriman ulang notifikasi yang gagal...");

        try {
            // Cari notifikasi yang gagal dan belum melewati batas percobaan
            $failedLogs = NotificationLog::where('status', 'FAILED')
                ->where('created_at', '>=', now()->subHours($maxAgeHours))
                ->whereRaw('(SELECT COUNT(*) FROM notification_logs WHERE booking_id = notification_logs.booking_id AND type = notification_logs.type AND status = "FAILED") < ?', [$maxRetries])
                ->get();

            Log::info("Menemukan {$failedLogs->count()} notifikasi gagal yang perlu dikirim ulang");

            foreach ($failedLogs as $log) {
                try {
                    // Ambil data booking terkait
                    $booking = \App\Models\Booking::with(['user', 'schedule.route'])
                        ->find($log->booking_id);

                    if (!$booking || !$booking->user || !$booking->schedule || !$booking->schedule->route) {
                        Log::warning("Data booking tidak lengkap untuk NotificationLog ID: {$log->id}");
                        $log->status = 'INVALID';
                        $log->error_message = 'Data booking tidak lengkap';
                        $log->save();
                        continue; // Ini OK karena kita dalam loop foreach
                    }

                    // Kirim ulang notifikasi berdasarkan tipe
                    $notification = null;
                    $typeHandled = true;

                    // Gunakan if-elseif daripada switch untuk menghindari masalah dengan continue
                    if ($log->type === 'BOARDING') {
                        $routeName = $booking->schedule->route->name ??
                            "{$booking->schedule->route->origin} - {$booking->schedule->route->destination}";

                        $notification = $notificationService->sendBoardingReminderNotification(
                            $booking->user,
                            $booking->booking_code,
                            $routeName,
                            $booking->schedule->departure_time,
                            1 // Default 1 jam sebagai fallback
                        );
                    } elseif ($log->type === 'CHECKIN') {
                        $routeName = $booking->schedule->route->name ??
                            "{$booking->schedule->route->origin} - {$booking->schedule->route->destination}";

                        $notification = $notificationService->sendCheckinReminderNotification(
                            $booking->user,
                            $booking->booking_code,
                            $routeName,
                            $booking->departure_date
                        );
                    } elseif ($log->type === 'PAYMENT') {
                        // Ambil payment dari booking
                        $payment = \App\Models\Payment::where('booking_id', $booking->id)
                            ->orderBy('created_at', 'desc')
                            ->first();

                        if (!$payment) {
                            Log::warning("Data payment tidak ditemukan untuk NotificationLog ID: {$log->id}");
                            $log->status = 'INVALID';
                            $log->error_message = 'Data payment tidak ditemukan';
                            $log->save();
                            continue; // Ini OK karena kita dalam loop foreach
                        }

                        $notification = $notificationService->sendPaymentReminderNotification(
                            $booking->user,
                            $booking->booking_code,
                            number_format($payment->amount, 0, ',', '.'),
                            Carbon::parse($payment->expiry_date)->format('d M Y H:i')
                        );
                    } else {
                        Log::warning("Tipe notifikasi tidak dikenal: {$log->type} untuk NotificationLog ID: {$log->id}");
                        $log->status = 'UNKNOWN_TYPE';
                        $log->error_message = 'Tipe notifikasi tidak dikenal';
                        $log->save();
                        $typeHandled = false;
                    }

                    // Hanya proses jika tipe telah ditangani dan notifikasi berhasil dibuat
                    if ($typeHandled && $notification) {
                        // Update log dengan notifikasi yang berhasil
                        $log->notification_id = $notification->id;
                        $log->is_sent = true;
                        $log->sent_at = now();
                        $log->status = 'SENT';
                        $log->error_message = null;
                        $log->save();

                        $count++;

                        Log::info("Berhasil mengirim ulang notifikasi {$log->type} untuk booking {$booking->booking_code}");
                    }
                } catch (\Exception $e) {
                    Log::error("Gagal mengirim ulang notifikasi ID: {$log->id}, Error: " . $e->getMessage());

                    // Buat log baru untuk mencatat kegagalan baru
                    NotificationLog::create([
                        'booking_id' => $log->booking_id,
                        'type' => $log->type,
                        'scheduled_at' => now(),
                        'is_sent' => false,
                        'status' => 'FAILED',
                        'error_message' => $e->getMessage()
                    ]);
                }
            }

            Log::info("Total {$count} notifikasi berhasil dikirim ulang");
            return $count;
        } catch (\Exception $e) {
            Log::error("Error dalam resendFailedNotifications: " . $e->getMessage());
            throw $e;
        }
    }
}
