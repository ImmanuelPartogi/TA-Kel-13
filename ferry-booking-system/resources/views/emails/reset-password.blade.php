<!DOCTYPE html>
<html>
<head>
    <title>Reset Password</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.5;
            color: #1f2937;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
        }

        .email-container {
            max-width: 550px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header {
            background-color: #0f4c81;
            padding: 28px 0;
            text-align: center;
        }

        .logo {
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            margin: 0;
            letter-spacing: 0.5px;
        }

        .content {
            padding: 32px;
        }

        h1 {
            color: #0f4c81;
            font-size: 20px;
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 24px;
        }

        p {
            color: #4b5563;
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 16px;
        }

        .verification-container {
            margin: 32px 0;
            text-align: center;
        }

        .verification-label {
            font-size: 13px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }

        .verification-code {
            font-family: monospace;
            font-size: 32px;
            letter-spacing: 4px;
            font-weight: 700;
            color: #0f4c81;
            background-color: #f3f4f6;
            padding: 16px 24px;
            border-radius: 6px;
            display: inline-block;
        }

        .expiry {
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            margin: 16px 0 32px;
        }

        .expiry strong {
            color: #0f4c81;
        }

        .alert {
            background-color: #fff8e6;
            border-left: 3px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
        }

        .alert-title {
            color: #92400e;
            font-weight: 600;
            margin-bottom: 4px;
            display: block;
            font-size: 15px;
        }

        .alert-text {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }

        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
        }

        .footer {
            background-color: #f9fafb;
            padding: 24px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }

        .company-name {
            font-weight: 600;
            color: #0f4c81;
            font-size: 16px;
            margin-bottom: 16px;
        }

        .contact {
            margin: 16px 0;
        }

        .contact a {
            color: #0f4c81;
            text-decoration: none;
            font-weight: 500;
        }

        .copyright {
            margin-top: 16px;
            font-size: 12px;
            color: #9ca3af;
        }

        @media only screen and (max-width: 550px) {
            .email-container {
                margin: 0;
                width: 100%;
                max-width: none;
                border-radius: 0;
            }

            .content {
                padding: 24px 20px;
            }

            .verification-code {
                font-size: 28px;
                padding: 12px 16px;
                letter-spacing: 3px;
            }
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            <h2 class="logo">FerryPass</h2>
        </div>

        <div class="content">
            <h1>Reset Password</h1>

            <p>Halo,</p>

            <p>Kami menerima permintaan untuk mengatur ulang password akun Anda. Gunakan kode verifikasi berikut untuk melanjutkan proses reset password.</p>

            <div class="verification-container">
                <div class="verification-label">Kode Verifikasi</div>
                <div class="verification-code">{{ $token }}</div>
            </div>

            <div class="expiry">
                Berlaku selama <strong>60 menit</strong>
            </div>

            <div class="alert">
                <span class="alert-title">Perhatian:</span>
                <p class="alert-text">"Jika Anda tidak mengajukan permintaan untuk mengatur ulang kata sandi, silakan abaikan pesan ini."</p>
            </div>

        </div>

        <div class="footer">
            <div class="company-name">FerryPass</div>

            <div class="contact">
                <a href="tel:+621234567890">+62 123 4567 890</a> &nbsp;|&nbsp;
                <a href="mailto:support@ferrypass.com">support@ferrypass.com</a>
            </div>

            <div class="copyright">
                <p>Email ini dikirim secara otomatis. Mohon untuk tidak membalas.</p>
                <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Seluruh hak cipta dilindungi.</p>
            </div>
        </div>
    </div>
</body>
</html>
