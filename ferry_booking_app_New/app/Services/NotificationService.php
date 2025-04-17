<?php

// app/Services/NotificationService.php
namespace App\Services;

use App\Models\Notification;
use App\Models\User;

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
}
