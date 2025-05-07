// src/pages/welcome/WelcomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [settings, setSettings] = useState({});
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    // Fetch settings and routes from API
    const fetchData = async () => {
      try {
        // You would fetch your settings from API here
        setSettings({
          hero_title: 'Jelajahi Keindahan Danau dengan Layanan Ferry Kami',
          hero_subtitle: 'Pesan tiket ferry Anda secara online untuk pengalaman perjalanan yang mulus. Transportasi air yang aman, nyaman, dan terjangkau ke tujuan Anda.',
          primary_button_text: 'Telusuri Rute Pilihan Anda',
          secondary_button_text: 'Panduan Mudah Memesan Tiket',
          routes_title: 'Rute yang Tersedia',
          routes_subtitle: 'Jelajahi semua rute feri kami yang menghubungkan pulau-pulau',
          // ... other settings
        });

        // Fetch available routes
        // This would be an API call in a real application
        setRoutes([
          {
            id: 1,
            origin: 'Merak',
            destination: 'Bakauheni',
            image_url: 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?q=80&w=1978',
            duration: '2',
            schedule_description: '5 jadwal tersedia',
            base_price: 60000,
            is_popular: true
          },
          {
            id: 2,
            origin: 'Ketapang',
            destination: 'Gilimanuk',
            image_url: 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?q=80&w=1978',
            duration: '1',
            schedule_description: '3 jadwal tersedia',
            base_price: 45000,
            is_popular: false
          },
          // ... more routes
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Update active section based on scroll position
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + 150;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 70,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Navigation */}
      <nav className={`bg-white/95 backdrop-blur-sm ${isScrolled ? 'shadow-md' : ''} fixed w-full z-50 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-16 sm:h-20 md:h-24 w-auto" src="/images/logo.png" alt="Ferry Ticket Logo" />
                <span className="ml-4 text-1xl sm:text-1xl font-bold text-primary-600 truncate">FerryTicket</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4 md:space-x-8">
                <button
                  onClick={() => scrollToSection('home')}
                  className={`${activeSection === 'home' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Beranda
                </button>
                <button
                  onClick={() => scrollToSection('routes')}
                  className={`${activeSection === 'routes' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Rute
                </button>
                <button
                  onClick={() => scrollToSection('howto')}
                  className={`${activeSection === 'howto' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Cara Pemesanan
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className={`${activeSection === 'about' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Tentang Kami
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className={`${activeSection === 'contact' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Kontak
                </button>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="space-x-4">
                <Link to="/login" className="inline-flex items-center px-4 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Masuk
                </Link>
              </div>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Buka menu utama</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1">
            <button
              onClick={() => scrollToSection('home')}
              className={`${
                activeSection === 'home'
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
            >
              Beranda
            </button>
            <button
              onClick={() => scrollToSection('routes')}
              className={`${
                activeSection === 'routes'
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
            >
              Rute
            </button>
            <button
              onClick={() => scrollToSection('howto')}
              className={`${
                activeSection === 'howto'
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
            >
              Cara Pemesanan
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className={`${
                activeSection === 'about'
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
            >
              Tentang Kami
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className={`${
                activeSection === 'contact'
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
            >
              Kontak
            </button>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="mt-3 space-y-1 px-4">
              <Link
                to="/login"
                className="block px-4 py-2 text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-gray-100"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-16 pb-32 flex content-center items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="absolute top-0 w-full h-full bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?q=80&w=2070')" }}>
          <span id="blackOverlay" className="w-full h-full absolute opacity-50 bg-black"></span>
        </div>

        <div className="container relative mx-auto px-4">
          <div className="items-center flex flex-wrap">
            <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
              <div className="mt-8 sm:mt-12">
                <h1 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 leading-tight">
                  {settings.hero_title}
                </h1>
                <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-300 mb-6 sm:mb-8">
                  {settings.hero_subtitle}
                </p>
                <div className="flex flex-col xs:flex-row justify-center xs:space-x-4 space-y-4 xs:space-y-0">
                  <button
                    onClick={() => scrollToSection('routes')}
                    className="bg-primary-600 text-white font-bold px-6 py-3 rounded-lg inline-block transition-all duration-300 hover:bg-primary-700 hover:shadow-lg"
                  >
                    {settings.primary_button_text}
                  </button>
                  <button
                    onClick={() => scrollToSection('howto')}
                    className="bg-transparent border-2 border-white text-white font-bold px-6 py-3 rounded-lg inline-block transition-all duration-300 hover:bg-white hover:text-primary-600"
                  >
                    {settings.secondary_button_text}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
              <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
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

      {/* Available Routes Section */}
      <section id="routes" className="py-12 sm:py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {settings.routes_title}
            </h2>
            <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600">
              {settings.routes_subtitle}
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {routes.map(route => (
              <div key={route.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                <div className="relative h-40 sm:h-48">
                  <img className="h-full w-full object-cover" src={route.image_url} alt={`${route.origin} - ${route.destination}`} />
                  {route.is_popular && (
                    <span className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Populer
                    </span>
                  )}
                </div>
                <div className="p-4 sm:p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{route.origin} - {route.destination}</h3>
                  </div>
                  <div className="flex items-center mb-2">
                    <i className="fas fa-clock text-gray-500 mr-2 flex-shrink-0"></i>
                    <span className="text-gray-600 text-sm sm:text-base">Durasi: ~{route.duration} jam</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <i className="fas fa-ship text-gray-500 mr-2 flex-shrink-0"></i>
                    <span className="text-gray-600 text-sm sm:text-base">{route.schedule_description}</span>
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-4">
                    <div>
                      <span className="text-gray-500 text-xs sm:text-sm">Mulai dari</span>
                      <p className="text-base sm:text-lg font-bold text-primary-600">
                        Rp {route.base_price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <Link to="/login" className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Pesan Sekarang
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {routes.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 py-8 text-center">
                <div className="mx-auto max-w-md">
                  <i className="fas fa-ship text-3xl sm:text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada rute yang tersedia saat ini</h3>
                  <p className="text-gray-500">Silakan periksa kembali nanti untuk rute feri yang tersedia.</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <Link to="/login" className="inline-flex items-center px-5 sm:px-6 py-2 sm:py-3 border border-primary-600 text-sm sm:text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Lihat Semua Detail
              <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Other sections (Features, How To Book, About Us, etc.) would go here */}

      {/* Login Button in Footer */}
      <div className="fixed bottom-6 right-6 z-30">
        <Link to="/login" className="bg-primary-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 flex items-center space-x-2">
          <i className="fas fa-sign-in-alt"></i>
          <span className="hidden sm:inline">Login</span>
        </Link>
      </div>

      {/* Other welcome page sections could be added here */}
    </>
  );
};

export default WelcomePage;