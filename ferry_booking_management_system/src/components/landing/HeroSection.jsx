import React from 'react';
import { getAssetUrl } from '../../utils/api';

const HeroSection = ({ settings }) => {
  return (
    <section
      id="home"
      className="relative pt-16 pb-32 flex content-center items-center justify-center"
      style={{ minHeight: '100vh' }}
    >
      <div
        className="absolute top-0 w-full h-full bg-center bg-cover"
        style={{
          backgroundImage: `url('${getAssetUrl(settings.hero_image) || 'https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?q=80&w=2070'}')`
        }}
      >
        <span className="w-full h-full absolute opacity-50 bg-black"></span>
      </div>

      <div className="container relative mx-auto px-4">
        <div className="items-center flex flex-wrap">
          <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
            <div className="mt-8 sm:mt-12">
              <h1 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 leading-tight">
                {settings.hero_title || 'Jelajahi Keindahan Danau dengan Layanan Ferry Kami'}
              </h1>
              <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-300 mb-6 sm:mb-8">
                {settings.hero_subtitle || 'Pesan tiket ferry Anda secara online untuk pengalaman perjalanan yang mulus.'}
              </p>
              <div className="flex flex-col xs:flex-row justify-center xs:space-x-4 space-y-4 xs:space-y-0">
                <a
                  href="#routes"
                  className="bg-primary-600 text-white font-bold px-6 py-3 rounded-lg inline-block transition-all duration-300 hover:bg-primary-700 hover:shadow-lg"
                >
                  {settings.primary_button_text || 'Telusuri Rute Pilihan Anda'}
                </a>
                <a
                  href="#howto"
                  className="bg-transparent border-2 border-white text-white font-bold px-6 py-3 rounded-lg inline-block transition-all duration-300 hover:bg-white hover:text-primary-600"
                >
                  {settings.secondary_button_text || 'Panduan Mudah Memesan Tiket'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave SVG */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="waves"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
            <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
            <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
            <use xlinkHref="#gentle-wave" x="48" y="7" fill="#fff" />
          </g>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;