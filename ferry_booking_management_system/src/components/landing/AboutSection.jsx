import React from 'react';
import { Medal } from 'lucide-react';
import { getAssetUrl } from '../../utils/api';

const AboutSection = ({ settings }) => {
  const stats = [
    { value: settings.stats_daily_trips || '150+', label: 'Perjalanan Harian' },
    { value: settings.stats_ferries || '50+', label: 'Kapal Ferry' },
    { value: settings.stats_routes || '25+', label: 'Rute' },
    { value: settings.stats_passengers || '1M+', label: 'Penumpang Bahagia' }
  ];

  return (
    <section id="about" className="py-16 sm:py-20 bg-primary-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
              {settings.about_title || 'Tentang Layanan Ferry Kami'}
            </h2>
            <p className="text-primary-100 mb-4 sm:mb-6 text-sm sm:text-lg">
              {settings.about_content || 'Platform tiket ferry kami telah memainkan peran penting dalam mendukung transportasi air di Kawasan Danau Toba. Kami berkomitmen untuk menyediakan layanan yang aman, terpercaya, dan terjangkau bagi penumpang maupun kendaraan.'}
            </p>
            <p className="text-primary-100 mb-4 sm:mb-6 text-sm sm:text-lg">
              {settings.about_mission || 'Misi kami adalah menyederhanakan perjalanan air melalui teknologi, sambil tetap menjaga standar keselamatan dan layanan pelanggan yang tinggi.'}
            </p>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-10">
              {stats.map((stat, index) => (
                <div key={index}>
                  <p className="text-2xl sm:text-4xl font-bold">{stat.value}</p>
                  <p className="text-primary-100 text-sm sm:text-base">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 lg:mt-0 relative">
            <div className="boat-animation">
              <img
                src={getAssetUrl(settings.about_image) || getAssetUrl('images/ferry.png')}
                alt="Ferry Boat"
                className="rounded-lg shadow-2xl w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 sm:-bottom-10 -right-4 sm:-right-10 bg-primary-500 rounded-lg p-4 sm:p-8 shadow-xl max-w-[200px]">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Medal className="text-2xl sm:text-4xl text-yellow-400" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-xl font-bold">Award-winning Service</h3>
                  <p className="text-xs sm:text-sm text-primary-100">Best Ferry Operator 2023</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;