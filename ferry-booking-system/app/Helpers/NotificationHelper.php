<?php

namespace App\Helpers;

use App\Models\Notification;
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

        // Ambil semua booking yang akan berangkat besok
        $bookings = \App\Models\Booking::with(['user', 'schedule.route'])
            ->where('departure_date', $tomorrow)
            ->where('status', 'CONFIRMED')
            ->get();

        foreach ($bookings as $booking) {
            // Kirim notifikasi ke pengguna
            $notificationService->sendCheckinReminderNotification(
                $booking->user,
                $booking->booking_code,
                $booking->schedule->route->name,
                $tomorrow
            );

            $count++;
        }

        return $count;
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

        // Gunakan zona waktu yang benar
        $now = Carbon::now('Asia/Jakarta');
        $today = $now->format('Y-m-d');

        // Tambahkan log untuk debugging
        Log::info("Running boarding reminders at {$now}");

        try {
            // Ambil semua booking yang akan berangkat hari ini
            $bookings = \App\Models\Booking::with(['user', 'schedule.route'])
                ->where('departure_date', $today)
                ->where('status', 'CONFIRMED')
                ->get();

            Log::info("Found {$bookings->count()} bookings for today");

            foreach ($bookings as $booking) {
                try {
                    // Hitung waktu keberangkatan yang benar
                    $departureTime = $booking->schedule->departure_time;
                    $departureDateTime = Carbon::createFromFormat(
                        'Y-m-d H:i:s',
                        $booking->departure_date . ' ' . $departureTime
                    );

                    // Debug waktu keberangkatan
                    Log::info("Booking {$booking->booking_code}: Departure at {$departureDateTime}, Now {$now}");

                    // Hitung selisih dalam jam
                    $hoursDiff = $now->diffInHours($departureDateTime, false);

                    if ($hoursDiff <= $hours && $hoursDiff > 0) {
                        Log::info("Sending boarding notification for booking {$booking->booking_code}, {$hoursDiff} hours remaining");

                        // Kirim notifikasi ke pengguna
                        $notificationService->sendBoardingReminderNotification(
                            $booking->user,
                            $booking->booking_code,
                            $booking->schedule->route->name ?? 'Unknown Route',
                            $departureTime,
                            $hoursDiff
                        );

                        $count++;
                    }
                } catch (\Exception $e) {
                    Log::error("Error processing boarding reminder for booking {$booking->id}: " . $e->getMessage());
                    // Lanjutkan ke booking berikutnya
                    continue;
                }
            }

            Log::info("Sent {$count} boarding notifications");
            return $count;
        } catch (\Exception $e) {
            Log::error("Error in sendBoardingReminders: " . $e->getMessage());
            throw $e;
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
}
