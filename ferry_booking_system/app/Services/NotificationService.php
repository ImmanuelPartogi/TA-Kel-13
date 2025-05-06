<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class NotificationService
{
    /**
     * Send notification to user
     *
     * @param User $user
     * @param string $title
     * @param string $message
     * @param string $type
     * @param string $priority
     * @param array|null $data
     * @param string $sentVia
     * @return Notification
     */
    public function sendNotification(User $user, string $title, string $message, string $type = 'SYSTEM', string $priority = 'LOW', ?array $data = null, string $sentVia = 'APP_NOTIFICATION')
    {
        // Validasi tipe notifikasi berdasarkan enum yang ada
        $validTypes = ['BOOKING', 'PAYMENT', 'SCHEDULE_CHANGE', 'BOARDING', 'SYSTEM', 'PROMO'];
        if (!in_array($type, $validTypes)) {
            $type = 'SYSTEM';
        }

        // Validasi prioritas
        $validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        if (!in_array($priority, $validPriorities)) {
            $priority = 'LOW';
        }

        // Buat notifikasi
        $notification = new Notification([
            'user_id' => $user->id,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'is_read' => false,
            'priority' => $priority,
            'data' => $data,
            'sent_via' => $sentVia
        ]);

        $notification->save();

        // Kirim push notification jika pengguna memiliki device token
        if (!empty($user->device_token)) {
            $this->sendPushNotification($user, $title, $message, $data);
        }

        return $notification;
    }

    /**
     * Send booking confirmation notification
     *
     * @param User $user
     * @param string $bookingCode
     * @param string $routeName
     * @param string $bookingDate
     * @return Notification
     */
    public function sendBookingConfirmationNotification(User $user, string $bookingCode, string $routeName, string $bookingDate)
    {
        $title = 'Booking Dikonfirmasi';
        $message = "Booking Anda dengan kode {$bookingCode} untuk rute {$routeName} pada tanggal {$bookingDate} telah dikonfirmasi. Silakan check-in pada hari keberangkatan.";
        $data = [
            'booking_code' => $bookingCode,
            'action' => 'VIEW_BOOKING',
            'booking_date' => $bookingDate,
            'route_name' => $routeName
        ];

        return $this->sendNotification($user, $title, $message, 'BOOKING', 'MEDIUM', $data);
    }

    /**
     * Send payment success notification
     *
     * @param User $user
     * @param string $bookingCode
     * @param string $amount
     * @param string $paymentMethod
     * @return Notification
     */
    public function sendPaymentSuccessNotification(User $user, string $bookingCode, string $amount, string $paymentMethod = null)
    {
        $title = 'Pembayaran Berhasil';
        $paymentInfo = $paymentMethod ? " melalui {$paymentMethod}" : "";
        $message = "Pembayaran untuk booking {$bookingCode} sebesar Rp {$amount}{$paymentInfo} telah berhasil. Terima kasih atas pembayaran Anda.";
        $data = [
            'booking_code' => $bookingCode,
            'action' => 'VIEW_BOOKING',
            'amount' => $amount,
            'payment_method' => $paymentMethod
        ];

        return $this->sendNotification($user, $title, $message, 'PAYMENT', 'MEDIUM', $data);
    }

    /**
     * Send payment reminder notification
     *
     * @param User $user
     * @param string $bookingCode
     * @param string $amount
     * @param string $expiryTime
     * @return Notification
     */
    public function sendPaymentReminderNotification(User $user, string $bookingCode, string $amount, string $expiryTime)
    {
        $title = 'Pengingat Pembayaran';
        $message = "Pembayaran untuk booking {$bookingCode} sebesar Rp {$amount} akan berakhir pada {$expiryTime}. Segera lakukan pembayaran untuk menghindari pembatalan otomatis.";
        $data = [
            'booking_code' => $bookingCode,
            'action' => 'VIEW_PAYMENT',
            'amount' => $amount,
            'expiry_time' => $expiryTime
        ];

        return $this->sendNotification($user, $title, $message, 'PAYMENT', 'HIGH', $data);
    }

    /**
     * Send schedule change notification
     *
     * @param User $user
     * @param string $bookingCode
     * @param string $routeName
     * @param string $oldDateTime
     * @param string $newDateTime
     * @param string $reason
     * @return Notification
     */
    public function sendScheduleChangeNotification(User $user, string $bookingCode, string $routeName, string $oldDateTime, string $newDateTime, string $reason)
    {
        $title = 'Perubahan Jadwal';
        $message = "Jadwal untuk booking {$bookingCode} pada rute {$routeName} telah berubah dari {$oldDateTime} menjadi {$newDateTime}. Alasan: {$reason}";
        $data = [
            'booking_code' => $bookingCode,
            'action' => 'VIEW_BOOKING',
            'old_datetime' => $oldDateTime,
            'new_datetime' => $newDateTime,
            'reason' => $reason,
        ];

        return $this->sendNotification($user, $title, $message, 'SCHEDULE_CHANGE', 'HIGH', $data);
    }

    /**
     * Send booking cancellation notification
     *
     * @param User $user
     * @param string $bookingCode
     * @param string $routeName
     * @param string $bookingDate
     * @param string $reason
     * @return Notification
     */
    public function sendBookingCancellationNotification(User $user, string $bookingCode, string $routeName, string $bookingDate, string $reason)
    {
        $title = 'Booking Dibatalkan';
        $message = "Booking Anda dengan kode {$bookingCode} untuk rute {$routeName} pada tanggal {$bookingDate} telah dibatalkan. Alasan: {$reason}";
        $data = [
            'booking_code' => $bookingCode,
            'action' => 'VIEW_BOOKING',
            'booking_date' => $bookingDate,
            'reason' => $reason,
        ];

        return $this->sendNotification($user, $title, $message, 'BOOKING', 'HIGH', $data);
    }

    /**
     * Send boarding reminder notification
     *
     * @param User $user
     * @param string $bookingCode
     * @param string $routeName
     * @param string $departureTime
     * @param int $hoursRemaining
     * @return Notification
     */
    public function sendBoardingReminderNotification(User $user, string $bookingCode, string $routeName, string $departureTime, int $hoursRemaining = 1)
    {
        $title = 'Pengingat Boarding';
        $timeInfo = ($hoursRemaining > 1) ? "{$hoursRemaining} jam" : "1 jam";
        $message = "Kapal untuk rute {$routeName} dengan kode booking {$bookingCode} akan berangkat dalam {$timeInfo} pada pukul {$departureTime}. Harap segera melakukan check-in dan boarding.";
        $data = [
            'booking_code' => $bookingCode,
            'action' => 'VIEW_TICKET',
            'departure_time' => $departureTime,
            'hours_remaining' => $hoursRemaining
        ];

        $notification = $this->sendNotification($user, $title, $message, 'BOARDING', 'HIGH', $data);

        // Ambil booking ID dari kode booking
        try {
            $booking = \App\Models\Booking::where('booking_code', $bookingCode)->first();
            if ($booking) {
                $this->logNotification($notification, 'BOARDING', $booking->id);
            }
        } catch (\Exception $e) {
            Log::error("Gagal mencatat log notifikasi boarding: " . $e->getMessage());
        }

        return $notification;
    }

    /**
     * Send checkin reminder notification
     *
     * @param User $user
     * @param string $bookingCode
     * @param string $routeName
     * @param string $departureDate
     * @return Notification
     */
    public function sendCheckinReminderNotification(User $user, string $bookingCode, string $routeName, string $departureDate)
    {
        $title = 'Pengingat Check-in';
        $message = "Jangan lupa untuk melakukan check-in untuk perjalanan Anda pada rute {$routeName} dengan kode booking {$bookingCode} pada tanggal {$departureDate}. Check-in dapat dilakukan melalui aplikasi 24 jam sebelum keberangkatan.";
        $data = [
            'booking_code' => $bookingCode,
            'action' => 'VIEW_BOARDING',
            'departure_date' => $departureDate
        ];

        return $this->sendNotification($user, $title, $message, 'BOARDING', 'MEDIUM', $data);
    }

    /**
     * Send weather alert notification
     *
     * @param User $user
     * @param string $bookingCode
     * @param string $routeName
     * @param string $departureDate
     * @param string $weatherInfo
     * @return Notification
     */
    public function sendWeatherAlertNotification(User $user, string $bookingCode, string $routeName, string $departureDate, string $weatherInfo)
    {
        $title = 'Peringatan Cuaca';
        $message = "Perhatian untuk perjalanan Anda pada rute {$routeName} (kode booking: {$bookingCode}) pada tanggal {$departureDate}. {$weatherInfo}. Harap pantau aplikasi untuk informasi lebih lanjut.";
        $data = [
            'booking_code' => $bookingCode,
            'action' => 'VIEW_BOOKING',
            'departure_date' => $departureDate,
            'weather_info' => $weatherInfo
        ];

        return $this->sendNotification($user, $title, $message, 'SYSTEM', 'HIGH', $data);
    }

    /**
     * Send promotional notification
     *
     * @param User $user
     * @param string $title
     * @param string $message
     * @param array|null $data
     * @return Notification
     */
    public function sendPromotionalNotification(User $user, string $title, string $message, ?array $data = null)
    {
        return $this->sendNotification($user, $title, $message, 'PROMO', 'LOW', $data);
    }

    /**
     * Send check-in success notification
     *
     * @param User $user
     * @param string $bookingCode
     * @param string $routeName
     * @param string $departureTime
     * @return Notification
     */
    public function sendCheckinSuccessNotification(User $user, string $bookingCode, string $routeName, string $departureTime)
    {
        $title = 'Check-in Berhasil';
        $message = "Check-in untuk perjalanan Anda pada rute {$routeName} dengan kode booking {$bookingCode} telah berhasil. Silakan tiba di terminal minimal 30 menit sebelum jadwal keberangkatan pukul {$departureTime}.";
        $data = [
            'booking_code' => $bookingCode,
            'action' => 'VIEW_BOARDING_PASS',
            'departure_time' => $departureTime
        ];

        return $this->sendNotification($user, $title, $message, 'BOARDING', 'MEDIUM', $data);
    }

    /**
     * Send refund notification
     *
     * @param User $user
     * @param string $bookingCode
     * @param string $amount
     * @param string $reason
     * @return Notification
     */
    public function sendRefundNotification(User $user, string $bookingCode, string $amount, string $reason = null)
    {
        $title = 'Pengembalian Dana (Refund)';
        $reasonText = $reason ? " Alasan: {$reason}." : "";
        $message = "Pengembalian dana untuk booking {$bookingCode} sebesar Rp {$amount} telah diproses.{$reasonText} Dana akan dikembalikan ke metode pembayaran yang digunakan dalam 3-5 hari kerja.";
        $data = [
            'booking_code' => $bookingCode,
            'action' => 'VIEW_BOOKING',
            'amount' => $amount,
            'reason' => $reason
        ];

        return $this->sendNotification($user, $title, $message, 'PAYMENT', 'MEDIUM', $data);
    }

    /**
     * Send push notification if device token available
     *
     * @param User $user
     * @param string $title
     * @param string $message
     * @param array $data
     * @return bool
     */
    private function sendPushNotification(User $user, string $title, string $message, array $data = [])
    {
        try {
            // Cek FCM configuration
            $serverKey = config('services.fcm.server_key');

            if (empty($serverKey)) {
                Log::warning('FCM server key not configured');
                return false;
            }

            // Kirim push notification menggunakan FCM
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $serverKey,
                'Content-Type' => 'application/json',
            ])->post('https://fcm.googleapis.com/v1/projects/' . config('services.fcm.project_id') . '/messages:send', [
                'message' => [
                    'token' => $user->device_token,
                    'notification' => [
                        'title' => $title,
                        'body' => $message,
                    ],
                    'data' => $data,
                    'android' => [
                        'notification' => [
                            'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                            'channel_id' => 'ferry_notifications',
                            'sound' => 'default',
                            'priority' => 'high',
                        ],
                    ],
                    'apns' => [
                        'payload' => [
                            'aps' => [
                                'sound' => 'default',
                                'badge' => 1,
                                'content-available' => 1,
                            ],
                        ],
                    ],
                ],
            ]);

            if ($response->successful()) {
                Log::info('Push notification sent successfully', [
                    'user_id' => $user->id,
                    'title' => $title
                ]);
                return true;
            } else {
                Log::error('Failed to send push notification', [
                    'user_id' => $user->id,
                    'error' => $response->body()
                ]);
                return false;
            }
        } catch (\Exception $e) {
            Log::error('Error sending push notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send bulk notifications to multiple users
     *
     * @param array $userIds
     * @param string $title
     * @param string $message
     * @param string $type
     * @param string $priority
     * @param array|null $data
     * @return int Number of notifications sent
     */
    public function sendBulkNotifications(array $userIds, string $title, string $message, string $type = 'SYSTEM', string $priority = 'MEDIUM', ?array $data = null)
    {
        $count = 0;

        foreach ($userIds as $userId) {
            $user = User::find($userId);
            if ($user) {
                $notification = $this->sendNotification($user, $title, $message, $type, $priority, $data);
                if ($notification) {
                    $count++;
                }
            }
        }

        Log::info('Bulk notifications sent', [
            'total_users' => count($userIds),
            'notifications_sent' => $count
        ]);

        return $count;
    }

    /**
     * Menambahkan log notifikasi
     *
     * @param Notification $notification
     * @param string $type
     * @param int $bookingId
     * @return NotificationLog
     */
    private function logNotification(Notification $notification, string $type, int $bookingId)
    {
        try {
            return \App\Models\NotificationLog::create([
                'booking_id' => $bookingId,
                'notification_id' => $notification->id,
                'type' => $type,
                'scheduled_at' => now(),
                'sent_at' => now(),
                'is_sent' => true,
                'status' => 'SENT'
            ]);
        } catch (\Exception $e) {
            Log::error("Gagal mencatat log notifikasi: " . $e->getMessage(), [
                'notification_id' => $notification->id,
                'booking_id' => $bookingId,
                'type' => $type
            ]);
            return null;
        }
    }
}
