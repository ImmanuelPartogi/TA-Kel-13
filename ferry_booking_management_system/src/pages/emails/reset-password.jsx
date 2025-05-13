// src/pages/auth/emails/reset-password.jsx
import React from 'react';

const ResetPasswordEmail = ({ token }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div style={{ 
      fontFamily: 'Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif',
      lineHeight: 1.5,
      color: '#1f2937',
      backgroundColor: '#f9fafb',
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      paddingTop: '40px',
      paddingBottom: '40px'
    }}>
      <div style={{
        maxWidth: '550px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#0f4c81',
          padding: '28px 0',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            letterSpacing: '0.5px'
          }}>FerryPass</h2>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          <h1 style={{
            color: '#0f4c81',
            fontSize: '20px',
            fontWeight: 600,
            marginTop: 0,
            marginBottom: '24px'
          }}>Reset Password</h1>

          <p style={{
            color: '#4b5563',
            fontSize: '15px',
            lineHeight: 1.6,
            margin: '0 0 16px'
          }}>Halo,</p>

          <p style={{
            color: '#4b5563',
            fontSize: '15px',
            lineHeight: 1.6,
            margin: '0 0 16px'
          }}>
            Kami menerima permintaan untuk mengatur ulang password akun Anda. 
            Gunakan kode verifikasi berikut untuk melanjutkan proses reset password.
          </p>

          {/* Verification Container */}
          <div style={{
            margin: '32px 0',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px'
            }}>Kode Verifikasi</div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '32px',
              letterSpacing: '4px',
              fontWeight: 700,
              color: '#0f4c81',
              backgroundColor: '#f3f4f6',
              padding: '16px 24px',
              borderRadius: '6px',
              display: 'inline-block'
            }}>{token}</div>
          </div>

          {/* Expiry */}
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            textAlign: 'center',
            margin: '16px 0 32px'
          }}>
            Berlaku selama <strong style={{ color: '#0f4c81' }}>60 menit</strong>
          </div>

          {/* Alert */}
          <div style={{
            backgroundColor: '#fff8e6',
            borderLeft: '3px solid #f59e0b',
            padding: '16px',
            margin: '24px 0',
            borderRadius: '4px'
          }}>
            <span style={{
              color: '#92400e',
              fontWeight: 600,
              marginBottom: '4px',
              display: 'block',
              fontSize: '15px'
            }}>Perhatian:</span>
            <p style={{
              color: '#92400e',
              fontSize: '14px',
              margin: 0
            }}>
              "Jika Anda tidak mengajukan permintaan untuk mengatur ulang kata sandi, 
              silakan abaikan pesan ini."
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '24px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#6b7280',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontWeight: 600,
            color: '#0f4c81',
            fontSize: '16px',
            marginBottom: '16px'
          }}>FerryPass</div>

          <div style={{ margin: '16px 0' }}>
            <a href="tel:+621234567890" style={{
              color: '#0f4c81',
              textDecoration: 'none',
              fontWeight: 500
            }}>+62 123 4567 890</a>
            <span> | </span>
            <a href="mailto:support@ferrypass.com" style={{
              color: '#0f4c81',
              textDecoration: 'none',
              fontWeight: 500
            }}>support@ferrypass.com</a>
          </div>

          <div style={{
            marginTop: '16px',
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            <p>Email ini dikirim secara otomatis. Mohon untuk tidak membalas.</p>
            <p>&copy; {currentYear} FerryPass. Seluruh hak cipta dilindungi.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordEmail;