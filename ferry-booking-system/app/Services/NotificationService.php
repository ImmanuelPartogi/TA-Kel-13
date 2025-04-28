<?php

// app/Services/NotificationService.php
namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

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
     * @return Notification
     */
    public function sendNotification(User $user, string $title, string $message, string $type = 'SYSTEM', string $priority = 'LOW', ?array $data = null)
    {
        $notification = new Notification([
            'user_id' => $user->id,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'is_read' => false,
            'priority' => $priority,
            'data' => $data,
            'sent_via' => 'APP_NOTIFICATION',
        ]);

        $notification->save();

        // TODO: Implement push notification if needed

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
        ];

        return $this->sendNotification($user, $title, $message, 'BOOKING', 'MEDIUM', $data);
    }

    /**
     * Send payment success notification
     *
     * @param User $user
     * @param string $bookingCode
     * @param string $amount
     * @return Notification
     */
    public function sendPaymentSuccessNotification(User $user, string $bookingCode, string $amount)
    {
        $title = 'Pembayaran Berhasil';
        $message = "Pembayaran untuk booking {$bookingCode} sebesar Rp {$amount} telah berhasil. Terima kasih atas pembayaran Anda.";
        $data = [
            'booking_code' => $bookingCode,
            'action' => 'VIEW_BOOKING',
            'amount' => $amount,
        ];

        return $this->sendNotification($user, $title, $message, 'PAYMENT', 'MEDIUM', $data);
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
     * @return Notification
     */
    public function sendBoardingReminderNotification(User $user, string $bookingCode, string $routeName, string $departureTime)
    {
        $title = 'Pengingat Boarding';
        $message = "Kapal untuk rute {$routeName} dengan kode booking {$bookingCode} akan berangkat dalam 1 jam pada pukul {$departureTime}. Harap segera melakukan boarding.";
        $data = [
            'booking_code' => $bookingCode,
            'action' => 'VIEW_BOOKING',
            'departure_time' => $departureTime,
        ];

        return $this->sendNotification($user, $title, $message, 'BOARDING', 'HIGH', $data);
    }

    /**
     * Send boarding notification to admin
     *
     * @param User $admin
     * @param string $bookingCode
     * @param string $routeName
     * @param string $departureTime
     * @param int $passengerCount
     * @return Notification
     */
    public function sendAdminBoardingNotification(User $admin, string $bookingCode, string $routeName, string $departureTime, int $passengerCount)
    {
        $title = 'Informasi Boarding';
        $message = "Kapal {$routeName} dengan kode booking {$bookingCode} akan berangkat dalam 1 jam pada pukul {$departureTime}. Terdapat {$passengerCount} penumpang yang akan boarding.";
        $data = [
            'booking_code' => $bookingCode,
            'action' => 'VIEW_BOOKING_ADMIN',
            'departure_time' => $departureTime,
            'passenger_count' => $passengerCount,
        ];

        return $this->sendNotification($admin, $title, $message, 'ADMIN_BOARDING', 'MEDIUM', $data);
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
        // Cek apakah pengguna memiliki device token
        if (empty($user->device_token)) {
            return false;
        }

        try {
            // Implementasi FCM atau layanan push notification lainnya
            // Contoh menggunakan FCM via HTTP v1 API
            $client = new \GuzzleHttp\Client();

            $response = $client->post(
                'https://fcm.googleapis.com/v1/projects/your-project-id/messages:send',
                [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $this->getFcmAccessToken(),
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
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
                                    'channel_id' => 'boarding_reminders',
                                ],
                            ],
                        ],
                    ],
                ]
            );

            Log::info('Push notification sent', [
                'user_id' => $user->id,
                'title' => $title,
                'response' => $response->getStatusCode()
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send push notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get FCM access token
     *
     * @return string
     */
    private function getFcmAccessToken()
    {
        // Implementasi untuk mendapatkan FCM access token dari service account
        // Ini hanya contoh - Anda perlu mengimplementasikan sesuai kebutuhan
        return config('services.fcm.server_key');
    }
}
