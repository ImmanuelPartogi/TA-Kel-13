import React from 'react';
import { Anchor, Shield, TicketIcon, Wallet } from 'lucide-react';

const FeaturesSection = ({ settings }) => {
  const features = [
    {
      icon: settings.feature1_icon || 'anchor',
      title: settings.feature1_title || 'Layanan Terbaik',
      description: settings.feature1_description || 'Keberangkatan dan kedatangan yang tepat waktu dengan prioritas utama pada kepuasan penumpang'
    },
    {
      icon: settings.feature2_icon || 'shield',
      title: settings.feature2_title || 'Keselamatan Prioritas Utama',
      description: settings.feature2_description || 'Kami memprioritaskan keselamatan dengan kapal yang terawat baik dan staf yang terlatih'
    },
    {
      icon: settings.feature3_icon || 'ticket',
      title: settings.feature3_title || 'Pemesanan mudah',
      description: settings.feature3_description || 'Sistem pemesanan tiket online yang sederhana dengan konfirmasi instan'
    },
    {
      icon: settings.feature4_icon || 'wallet',
      title: settings.feature4_title || 'Harga Terjangkau',
      description: settings.feature4_description || 'Harga kompetitif dengan diskon khusus untuk wisatawan reguler'
    }
  ];

  const getIcon = (iconType) => {
    const iconClasses = "text-xl sm:text-2xl";
    switch (iconType) {
      case 'anchor':
      case 'fas fa-anchor':
        return <Anchor className={iconClasses} />;
      case 'shield':
      case 'fas fa-shield-alt':
        return <Shield className={iconClasses} />;
      case 'ticket':
      case 'fas fa-ticket-alt':
        return <TicketIcon className={iconClasses} />;
      case 'wallet':
      case 'fas fa-wallet':
        return <Wallet className={iconClasses} />;
      default:
        return <i className={`${iconType} ${iconClasses}`}></i>;
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-16 right-0 opacity-10">
        <div className="w-[500px] h-[500px] bg-primary-500 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute -bottom-16 left-0 opacity-10">
        <div className="w-[450px] h-[450px] bg-primary-700 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {settings.features_title || 'Mengapa Memilih Layanan Ferry Kami'}
          </h2>
          <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600">
            {settings.features_subtitle || 'Nikmati perjalanan terbaik di Danau Toba dengan berbagai keuntungan berikut'}
          </p>
        </div>

        <div className="mt-10 sm:mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="text-center px-2 sm:px-4">
              <div className="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                {getIcon(feature.icon)}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;