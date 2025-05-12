import React from 'react';
import { Ship, LogIn } from 'lucide-react';

const CTASection = ({ settings }) => {
  const handleShowApp = (e) => {
    e.preventDefault();
    const event = new CustomEvent('showAppModal');
    window.dispatchEvent(event);
  };

  return (
    <section className="py-16 sm:py-20 bg-primary-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">
          {settings.cta_title || 'Siap untuk Memulai Perjalanan Anda?'}
        </h2>
        <p className="text-lg sm:text-xl text-primary-100 mb-8 sm:mb-12 max-w-3xl mx-auto">
          {settings.cta_subtitle || 'Pesan tiket feri Anda secara online untuk pengalaman perjalanan yang mulus. Transportasi laut yang aman, nyaman, dan terjangkau ke tempat tujuan Anda.'}
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <a
            href="#routes"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            <Ship className="mr-2" /> Jelajahi Rute
          </a>
          <a
            href="#download-app"
            onClick={handleShowApp}
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-white text-sm sm:text-base font-medium rounded-md text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            <LogIn className="mr-2" /> Masuk
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;