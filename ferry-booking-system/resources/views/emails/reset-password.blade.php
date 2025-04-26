<!DOCTYPE html>
<html>
<head>
    <title>Reset Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .token {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
            font-size: 32px;
            letter-spacing: 5px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Reset Password</h2>
        </div>

        <p>Halo,</p>

        <p>Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda.</p>

        <p>Gunakan kode berikut ini untuk reset password Anda:</p>

        <div class="token">{{ $token }}</div>

        <p>Kode reset password ini akan kadaluarsa dalam 60 menit.</p>

        <p>Jika Anda tidak meminta reset password, abaikan email ini dan tidak ada perubahan yang akan dilakukan.</p>

        <p>Terima kasih,<br>Tim {{ config('app.name') }}</p>

        <div class="footer">
            <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Seluruh hak cipta dilindungi.</p>
        </div>
    </div>
</body>
</html>
