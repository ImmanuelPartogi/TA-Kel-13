<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Auth\Notifications\ResetPassword;

class CustomResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Reset Password Ferry Booking App')
            ->line('Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda.')
            ->action('Reset Password', url(config('app.url').'/reset-password/'.$this->token.'?email='.$notifiable->getEmailForPasswordReset()))
            ->line('Link reset password ini akan kedaluwarsa dalam '.config('auth.passwords.users.expire').' menit.')
            ->line('Jika Anda tidak meminta reset password, tidak ada tindakan lebih lanjut yang diperlukan.');
    }
}
