<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\User;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SendBoardingReminders extends Command
{
    protected $signature = 'notifications:send-boarding-reminders';
    protected $description = 'Send boarding reminder notifications to users 1 hour before departure';

    public function handle(NotificationService $notificationService)
    {
        $this->info('Checking for upcoming departures...');

        // Waktu sekarang
        $now = Carbon::now('Asia/Jakarta');
        // Waktu 1 jam dari sekarang
        $oneHourFromNow = $now->copy()->addHour();
        // Target di menit 0 (seperti 08:00:00, 09:00:00)
        $targetTime = $oneHourFromNow->format('H:00:00');
        // Target tanggal (hari ini)
        $targetDate = $now->format('Y-m-d');

        Log::info('Running boarding notifications check', [
            'current_time' => $now->toDateTimeString(),
            'target_time' => $targetTime,
            'target_date' => $targetDate
        ]);

        // Cari booking dengan jadwal keberangkatan 1 jam dari sekarang
        $bookings = Booking::where('status', 'CONFIRMED')
            ->where('booking_date', $targetDate)
            ->whereHas('schedule', function ($query) use ($targetTime) {
                // Dapatkan jadwal dengan waktu keberangkatan 1 jam dari sekarang
                $query->whereTime('departure_time', $targetTime);
            })
            ->with(['user', 'schedule.route', 'tickets'])
            ->get();

        $this->info('Found ' . $bookings->count() . ' upcoming departures');

        // Dapatkan admin untuk notifikasi
        $admins = User::where('role', 'ADMIN')->get();

        foreach ($bookings as $booking) {
            try {
                // Format waktu keberangkatan
                $departureTime = Carbon::parse($booking->schedule->departure_time)->format('H:i');
                $routeName = $booking->schedule->route->name;

                // Kirim notifikasi ke penumpang
                $notificationService->sendBoardingReminderNotification(
                    $booking->user,
                    $booking->booking_code,
                    $routeName,
                    $departureTime
                );

                $this->info("Sent boarding reminder to: {$booking->user->name} for booking: {$booking->booking_code}");

                // Kirim notifikasi ke admin
                foreach ($admins as $admin) {
                    $notificationService->sendAdminBoardingNotification(
                        $admin,
                        $booking->booking_code,
                        $routeName,
                        $departureTime,
                        $booking->passenger_count
                    );
                }
            } catch (\Exception $e) {
                Log::error('Failed to send boarding notification', [
                    'booking_id' => $booking->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        $this->info('Boarding reminder check completed');
    }
}
