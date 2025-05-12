import React, { useState, useEffect } from 'react';
import { X, Smartphone, QrCode, Check } from 'lucide-react';

const AppDownloadModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('features');

  useEffect(() => {
    const handleShowModal = () => setIsOpen(true);
    window.addEventListener('showAppModal', handleShowModal);

    return () => {
      window.removeEventListener('showAppModal', handleShowModal);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setActiveTab('features');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-5 sm:p-8 max-w-md w-full relative overflow-hidden modal-fade-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 z-20 bg-white bg-opacity-80 rounded-full w-8 h-8 flex items-center justify-center"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Background decorative blobs */}
        <div className="absolute -top-20 -left-16 w-64 h-64 bg-primary-100 rounded-full blur-2xl opacity-50 blob-animation"></div>
        <div className="absolute -bottom-20 -right-16 w-72 h-72 bg-secondary-100 rounded-full blur-2xl opacity-50 blob-animation" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-3 relative">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-primary-500 rounded-full flex items-center justify-center">
              <Smartphone className="text-2xl sm:text-4xl text-white" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Dapatkan Aplikasi Mobile Kami
            </h3>
            <p className="text-gray-600 mb-1 text-sm sm:text-base">
              Rasakan pengalaman pemesanan feri yang lancar
            </p>

            {/* Decorative wave */}
            <svg className="w-full h-4 sm:h-6 text-primary-100" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 10 C 30 4 70 4 100 10 L 100 0 L 0 0 Z" fill="currentColor"></path>
            </svg>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('features')}
              className={`w-1/2 py-2 text-center text-sm font-medium ${
                activeTab === 'features'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Fitur Aplikasi
            </button>
            <button
              onClick={() => setActiveTab('download')}
              className={`w-1/2 py-2 text-center text-sm font-medium ${
                activeTab === 'download'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unduh Aplikasi
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'features' ? (
            <FeatureTab />
          ) : (
            <DownloadTab />
          )}

          {/* Benefits section */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-2">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center text-sm sm:text-base">
              <i className="fas fa-star text-yellow-400 mr-2"></i>
              Mengapa Memilih Aplikasi Kami
            </h4>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
              <li className="flex items-start">
                <Check className="text-primary-500 mt-1 mr-2 flex-shrink-0 h-4 w-4" />
                <span>Proses pemesanan lebih cepat</span>
              </li>
              <li className="flex items-start">
                <Check className="text-primary-500 mt-1 mr-2 flex-shrink-0 h-4 w-4" />
                <span>Diskon eksklusif untuk ponsel</span>
              </li>
              <li className="flex items-start">
                <Check className="text-primary-500 mt-1 mr-2 flex-shrink-0 h-4 w-4" />
                <span>Pembaruan status feri secara real-time</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureTab = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4 mt-2">
        {/* App screenshot in phone frame */}
        <div className="relative mx-auto w-40 sm:w-48 h-auto phone-float">
          <div className="relative z-10 mx-auto">
            <div className="relative rounded-xl overflow-hidden border-4 border-gray-800 w-full h-full shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1606768666853-403c90a981ad?q=80&w=2574&auto=format&fit=crop"
                alt="Ferry Ticket App"
                className="w-full h-auto"
              />
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-800 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
        Pemesanan yang Cepat & Mudah
      </h4>

      {/* App features list */}
      <div className="bg-gray-50 rounded-lg p-3 w-full">
        <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
          <li className="flex items-start">
            <Check className="text-primary-500 mt-1 mr-2 flex-shrink-0 h-4 w-4" />
            <span>Jadwal feri secara real-time</span>
          </li>
          <li className="flex items-start">
            <Check className="text-primary-500 mt-1 mr-2 flex-shrink-0 h-4 w-4" />
            <span>Pembayaran mobile yang aman</span>
          </li>
          <li className="flex items-start">
            <Check className="text-primary-500 mt-1 mr-2 flex-shrink-0 h-4 w-4" />
            <span>Tiket digital untuk menaiki kapal feri</span>
          </li>
        </ul>
      </div>

      <p className="text-xs text-center text-gray-500 mt-3">
        Klik "Unduh Aplikasi" untuk memulai
      </p>
    </div>
  );
};

const DownloadTab = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative bounce-animation mb-4 mt-2">
        {/* QR Code Container */}
        <div className="p-3 sm:p-4 bg-white border-2 border-primary-100 rounded-lg shadow-lg">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://ferryticket.com/app"
            alt="Download App QR Code"
            className="h-32 w-32 sm:h-36 sm:w-36"
          />
        </div>

        {/* Phone icon indicator */}
        <div className="absolute -top-2 -right-2 bg-primary-500 text-white p-1 sm:p-2 rounded-full">
          <QrCode className="text-sm sm:text-base" />
        </div>
      </div>

      <p className="text-sm sm:text-base font-medium text-gray-700 mb-2">
        Pindai untuk mengunduh
      </p>
      <p className="text-xs sm:text-sm text-gray-500 mb-4">
        Gunakan kamera ponsel Anda untuk memindai kode QR ini
      </p>

      {/* App store buttons */}
      <div className="flex justify-center space-x-3 sm:space-x-4 mb-4">
        <a
          href="#"
          className="flex items-center justify-center bg-black text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          <i className="fab fa-apple text-lg sm:text-xl mr-2"></i>
          <div className="text-left">
            <div className="text-xs">Unduh di</div>
            <div className="text-xs sm:text-sm font-semibold">App Store</div>
          </div>
        </a>
        <a
          href="#"
          className="flex items-center justify-center bg-black text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          <i className="fab fa-google-play text-lg sm:text-xl mr-2"></i>
          <div className="text-left">
            <div className="text-xs">Dapatkan di</div>
            <div className="text-xs sm:text-sm font-semibold">Google Play</div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default AppDownloadModal;