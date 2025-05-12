import React from 'react';
import { Search, Calendar, CreditCard, QrCode } from 'lucide-react';

const HowToBookSection = ({ settings }) => {
  const steps = [
    {
      number: 1,
      icon: settings.step1_icon || 'search',
      title: settings.step1_title || 'Pencarian Rute',
      description: settings.step1_description || 'Masukkan asal, tujuan, dan tanggal perjalanan Anda untuk menemukan feri yang tersedia.'
    },
    {
      number: 2,
      icon: settings.step2_icon || 'calendar',
      title: settings.step2_title || 'Pilih Jadwal',
      description: settings.step2_description || 'Pilih dari jadwal yang tersedia dan jenis feri yang sesuai dengan kebutuhan Anda.'
    },
    {
      number: 3,
      icon: settings.step3_icon || 'credit-card',
      title: settings.step3_title || 'Melakukan Pembayaran',
      description: settings.step3_description || 'Pembayaran yang aman melalui berbagai pilihan termasuk kartu kredit dan mobile banking.'
    },
    {
      number: 4,
      icon: settings.step4_icon || 'qr-code',
      title: settings.step4_title || 'Dapatkan E-Ticket',
      description: settings.step4_description || 'Dapatkan tiket elektronik Anda secara instan melalui email atau unduh dari akun Anda.'
    }
  ];

  const getIcon = (iconType) => {
    const iconClasses = "text-xl sm:text-2xl";
    switch (iconType) {
      case 'search':
      case 'fas fa-search':
        return <Search className={iconClasses} />;
      case 'calendar':
      case 'fas fa-calendar-alt':
        return <Calendar className={iconClasses} />;
      case 'credit-card':
      case 'fas fa-credit-card':
        return <CreditCard className={iconClasses} />;
      case 'qr-code':
      case 'fas fa-qrcode':
        return <QrCode className={iconClasses} />;
      default:
        return <i className={`${iconType} ${iconClasses}`}></i>;
    }
  };

  return (
    <section id="howto" className="py-16 sm:py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {settings.howto_title || 'Bagaimana cara memesan tiket kapal feri Anda'}
          </h2>
          <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600">
            {settings.howto_subtitle || 'Ikuti langkah-langkah sederhana ini untuk memesan perjalanan Anda'}
          </p>
        </div>

        <div className="mt-10 sm:mt-16 relative">
          {/* Line Connector - Hidden on mobile */}
          <div className="hidden lg:block absolute top-1/2 transform -translate-y-1/2 left-0 right-0 h-0.5 bg-gray-200"></div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="relative bg-white p-4 sm:p-6 rounded-lg shadow-md z-10 h-full">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary-600 text-white font-bold">
                  {step.number}
                </div>
                <div className="text-center pt-6">
                  <div className="inline-flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                    {getIcon(step.icon)}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToBookSection;