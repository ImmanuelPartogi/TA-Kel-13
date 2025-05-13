import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/welcome.css';  // Import CSS

const Welcome = () => {
  const navigate = useNavigate();
  
  // State management
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [activeTab, setActiveTab] = useState('features');

  // Settings - ini nanti bisa diambil dari API
  const settings = {
    hero_image: 'https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?q=80&w=2070',
    hero_title: 'Jelajahi Keindahan Danau dengan Layanan Ferry Kami',
    hero_subtitle: 'Pesan tiket ferry Anda secara online untuk pengalaman perjalanan yang mulus. Transportasi air yang aman, nyaman, dan terjangkau ke tujuan Anda.',
    primary_button_text: 'Telusuri Rute Pilihan Anda',
    secondary_button_text: 'Panduan Mudah Memesan Tiket',
    routes_title: 'Rute yang Tersedia',
    routes_subtitle: 'Jelajahi semua rute feri kami yang menghubungkan pulau-pulau',
    features_title: 'Mengapa Memilih Layanan Ferry Kami',
    features_subtitle: 'Nikmati perjalanan terbaik di Danau Toba dengan berbagai keuntungan berikut',
    // Feature 1
    feature1_icon: 'fas fa-anchor',
    feature1_title: 'Layanan Terbaik',
    feature1_description: 'Keberangkatan dan kedatangan yang tepat waktu dengan prioritas utama pada kepuasan penumpang',
    // Feature 2
    feature2_icon: 'fas fa-shield-alt',
    feature2_title: 'Keselamatan Prioritas Utama',
    feature2_description: 'Kami memprioritaskan keselamatan dengan kapal yang terawat baik dan staf yang terlatih',
    // Feature 3
    feature3_icon: 'fas fa-ticket-alt',
    feature3_title: 'Pemesanan mudah',
    feature3_description: 'Sistem pemesanan tiket online yang sederhana dengan konfirmasi instan',
    // Feature 4
    feature4_icon: 'fas fa-wallet',
    feature4_title: 'Harga Terjangkau',
    feature4_description: 'Harga kompetitif dengan diskon khusus untuk wisatawan reguler',
    // How to
    howto_title: 'Bagaimana cara memesan tiket kapal feri Anda',
    howto_subtitle: 'Ikuti langkah-langkah sederhana ini untuk memesan perjalanan Anda',
    step1_icon: 'fas fa-search',
    step1_title: 'Pencarian Rute',
    step1_description: 'Masukkan asal, tujuan, dan tanggal perjalanan Anda untuk menemukan feri yang tersedia.',
    step2_icon: 'fas fa-calendar-alt',
    step2_title: 'Pilih Jadwal',
    step2_description: 'Pilih dari jadwal yang tersedia dan jenis feri yang sesuai dengan kebutuhan Anda.',
    step3_icon: 'fas fa-credit-card',
    step3_title: 'Melakukan Pembayaran',
    step3_description: 'Pembayaran yang aman melalui berbagai pilihan termasuk kartu kredit dan mobile banking.',
    step4_icon: 'fas fa-qrcode',
    step4_title: 'Dapatkan E-Ticket',
    step4_description: 'Dapatkan tiket elektronik Anda secara instan melalui email atau unduh dari akun Anda.',
    // About
    about_title: 'Tentang Layanan Ferry Kami',
    about_content: 'Platform tiket ferry kami telah memainkan peran penting dalam mendukung transportasi air di Kawasan Danau Toba. Kami berkomitmen untuk menyediakan layanan yang aman, terpercaya, dan terjangkau bagi penumpang maupun kendaraan.',
    about_mission: 'Misi kami adalah menyederhanakan perjalanan air melalui teknologi, sambil tetap menjaga standar keselamatan dan layanan pelanggan yang tinggi. Dengan jaringan rute yang luas, kami mendukung konektivitas transportasi air di berbagai kawasan, terutama di Kawasan Danau Toba. Kami bangga menjadi bagian dari solusi perjalanan yang efisien dan terpercaya bagi masyarakat.',
    about_image: '/images/ferry.png',
    stats_daily_trips: '150+',
    stats_ferries: '50+',
    stats_routes: '25+',
    stats_passengers: '1M+',
    // CTA
    cta_title: 'Siap untuk Memulai Perjalanan Anda?',
    cta_subtitle: 'Pesan tiket feri Anda secara online untuk pengalaman perjalanan yang mulus. Transportasi laut yang aman, nyaman, dan terjangkau ke tempat tujuan Anda.',
    // Footer
    site_name: 'FerryTicket',
    footer_description: 'Mitra terpercaya Anda untuk perjalanan di kawasan Danau Toba. Pesan tiket feri Anda secara online untuk pengalaman yang mulus.',
    footer_address: 'Jln Siliwangi balige; Balige, Sumatera Utara, Indonesia 22315',
    footer_phone: '(0632) 322777',
    footer_email: 'info@ferryticket.com',
    footer_copyright: `© ${new Date().getFullYear()} Ferry Ticket System. All rights reserved.`,
    social_facebook: '#',
    social_twitter: '#',
    social_instagram: '#',
    social_youtube: '#'
  };

  // Sample routes data - nanti bisa diambil dari API
  const allRoutes = [
    {
      id: 1,
      origin: 'Parapat',
      destination: 'Samosir',
      duration: '2',
      schedule_description: '10 jadwal tersedia',
      base_price: 60000,
      is_popular: true,
      image_url: 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?q=80&w=1978'
    },
    {
      id: 2,
      origin: 'Ajibata',
      destination: 'Tomok',
      duration: '1.5',
      schedule_description: '8 jadwal tersedia',
      base_price: 45000,
      is_popular: false,
      image_url: 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?q=80&w=1978'
    },
    {
      id: 3,
      origin: 'Tigaras',
      destination: 'Simanindo',
      duration: '3',
      schedule_description: '6 jadwal tersedia',
      base_price: 75000,
      is_popular: true,
      image_url: 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?q=80&w=1978'
    }
  ];

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setScrolled(scrollTop > 50);

      // Update active section
      const sections = document.querySelectorAll('section[id]');
      let currentSection = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        const scrollPosition = scrollTop + 150;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          currentSection = section.getAttribute('id');
        }
      });

      if (scrollTop < 50) currentSection = 'home';
      
      if ((window.innerHeight + scrollTop) >= document.body.offsetHeight - 50) {
        currentSection = 'contact';
      }

      if (currentSection) setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navbar hide/show on mobile when scrolling
  useEffect(() => {
    let lastScrollTop = 0;
    const navbar = document.getElementById('navbar');

    const handleNavbarScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (window.innerWidth < 640 && navbar) {
        if (scrollTop > lastScrollTop && scrollTop > 300) {
          navbar.style.transform = 'translateY(-100%)';
        } else {
          navbar.style.transform = 'translateY(0)';
        }
      } else if (navbar) {
        navbar.style.transform = '';
      }
      lastScrollTop = scrollTop;
    };

    window.addEventListener('scroll', handleNavbarScroll);
    return () => window.removeEventListener('scroll', handleNavbarScroll);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setMobileMenuOpen(false);
        const navbar = document.getElementById('navbar');
        if (navbar) navbar.style.transform = '';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to handle smooth scrolling
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = window.innerWidth < 640 ? 60 : 70;
      window.scrollTo({
        top: section.offsetTop - offset,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="antialiased bg-gray-50">
      {/* Navigation */}
      <nav 
        className={`${scrolled ? 'bg-white/95 shadow-md' : 'bg-white/80'} backdrop-blur-sm fixed w-full z-50 transition-all duration-300`}
        id="navbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-16 sm:h-20 md:h-24 w-auto" src="/images/logo.png" alt="Ferry Ticket Logo" />
                <span className="ml-4 text-1xl sm:text-1xl font-bold text-primary-600 truncate">FerryTicket</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4 md:space-x-8" id="desktop-menu">
                {['home', 'routes', 'howto', 'about', 'contact'].map((section) => (
                  <a
                    key={section}
                    href={`#${section}`}
                    className={`nav-link inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activeSection === section
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    data-section={section}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(section);
                    }}
                  >
                    {section === 'home' ? 'Beranda' :
                     section === 'routes' ? 'Rute' :
                     section === 'howto' ? 'Cara Pemesanan' :
                     section === 'about' ? 'Tentang Kami' :
                     'Kontak'}
                  </a>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="space-x-4">
                {/* Auth buttons - sesuaikan dengan state auth */}
              </div>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                type="button"
                className="mobile-menu-button inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 touch-target"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
              >
                <span className="sr-only">Buka menu utama</span>
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden ${mobileMenuOpen ? '' : 'hidden'} transition-all duration-300 ease-in-out`} id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1" id="mobile-nav-links">
            {['home', 'routes', 'howto', 'about', 'contact'].map((section) => (
              <a
                key={section}
                href={`#${section}`}
                className={`mobile-nav-link block pl-3 pr-4 py-2 border-l-4 text-base font-medium touch-target ${
                  activeSection === section
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
                data-section={section}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(section);
                }}
              >
                {section === 'home' ? 'Beranda' :
                 section === 'routes' ? 'Rute' :
                 section === 'howto' ? 'Cara Pemesanan' :
                 section === 'about' ? 'Tentang Kami' :
                 'Kontak'}
              </a>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="mt-3 space-y-1 px-4">
              <Link 
                to="/operator/login" 
                className="block px-4 py-2 text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-gray-100 touch-target"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-16 pb-32 flex content-center items-center justify-center" style={{ minHeight: '100vh' }}>
        <div 
          className="absolute top-0 w-full h-full bg-center bg-cover"
          style={{ backgroundImage: `url('${settings.hero_image}')` }}
        >
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
                  <a 
                    href="#routes"
                    className="bg-primary-600 text-white font-bold px-6 py-3 rounded-lg inline-block transition-all duration-300 hover:bg-primary-700 hover:shadow-lg touch-target"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('routes');
                    }}
                  >
                    {settings.primary_button_text}
                  </a>
                  <a 
                    href="#howto"
                    className="bg-transparent border-2 border-white text-white font-bold px-6 py-3 rounded-lg inline-block transition-all duration-300 hover:bg-white hover:text-primary-600 touch-target"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('howto');
                    }}
                  >
                    {settings.secondary_button_text}
                  </a>
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
              <use href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
              <use href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
              <use href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
              <use href="#gentle-wave" x="48" y="7" fill="#fff" />
            </g>
          </svg>
        </div>
      </section>

      {/* Available Routes */}
      <section id="routes" className="py-12 sm:py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{settings.routes_title}</h2>
            <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600">{settings.routes_subtitle}</p>
          </div>

          <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {allRoutes.length > 0 ? (
              allRoutes.map((route) => (
                <RouteCard 
                  key={route.id} 
                  route={route} 
                  onBookClick={() => setAppModalOpen(true)} 
                />
              ))
            ) : (
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
            <a 
              href="#download-app"
              className="show-app-modal inline-flex items-center px-5 sm:px-6 py-2 sm:py-3 border border-primary-600 text-sm sm:text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 touch-target"
              onClick={(e) => {
                e.preventDefault();
                setAppModalOpen(true);
              }}
            >
              Lihat Semua Detail
              <i className="fas fa-arrow-right ml-2"></i>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="section-blob -top-16 right-0 opacity-10">
          <svg width="500" height="500" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="pulsing-blob">
            <path fill="#0ea5e9"
              d="M32.1,-47.8C42.6,-37.9,52.8,-29.4,59.6,-17.5C66.3,-5.7,69.6,9.3,65.5,22.1C61.4,34.8,49.9,45.3,37.1,52.3C24.2,59.3,10,62.9,-3.9,62.4C-17.9,61.9,-31.6,57.5,-45.5,49.3C-59.4,41.1,-73.5,29.2,-76.8,14.7C-80,0.1,-72.4,-17.1,-63.1,-31.6C-53.9,-46.1,-42.9,-57.8,-30.4,-66.7C-17.9,-75.5,-3.9,-81.4,6.6,-76.7C17,-72,21.7,-57.7,32.1,-47.8Z"
              transform="translate(100 100)" />
          </svg>
        </div>
        <div className="section-blob -bottom-16 left-0 opacity-10">
          <svg width="450" height="450" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="rotating-blob" style={{ animationDuration: '45s' }}>
            <path fill="#0284c7"
              d="M45.3,-60.7C57.4,-49.4,65.2,-34.2,70.6,-17.5C76,0,79.8,18.9,73.7,32.6C67.5,46.3,51.4,54.8,35.5,60.7C19.6,66.7,3.9,70.1,-13.6,70.3C-31.2,70.5,-50.5,67.6,-64.4,56.3C-78.3,45,-86.7,25.4,-86.5,6.1C-86.2,-13.1,-77.2,-32,-63.6,-43.9C-50,-55.9,-31.9,-61,-15.3,-64.6C1.3,-68.1,15.9,-70.2,29.7,-68.9C43.4,-67.7,56.3,-63.1,45.3,-60.7Z"
              transform="translate(100 100)" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{settings.features_title}</h2>
            <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600">{settings.features_subtitle}</p>
          </div>

          <div className="mt-10 sm:mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((num) => (
              <FeatureCard 
                key={num}
                icon={settings[`feature${num}_icon`]}
                title={settings[`feature${num}_title`]}
                description={settings[`feature${num}_description`]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How to Book */}
      <section id="howto" className="py-16 sm:py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{settings.howto_title}</h2>
            <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600">{settings.howto_subtitle}</p>
          </div>

          <div className="mt-10 sm:mt-16 relative">
            <div className="hidden lg:block absolute top-1/2 transform -translate-y-1/2 left-0 right-0 h-0.5 bg-gray-200"></div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((num) => (
                <StepCard
                  key={num}
                  number={num}
                  icon={settings[`step${num}_icon`]}
                  title={settings[`step${num}_title`]}
                  description={settings[`step${num}_description`]}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-16 sm:py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{settings.about_title}</h2>
              <p className="text-primary-100 mb-4 sm:mb-6 text-sm sm:text-lg">{settings.about_content}</p>
              <p className="text-primary-100 mb-4 sm:mb-6 text-sm sm:text-lg">{settings.about_mission}</p>
              
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-10">
                <StatCard number={settings.stats_daily_trips} label="Perjalanan Harian" />
                <StatCard number={settings.stats_ferries} label="Kapal Ferry" />
                <StatCard number={settings.stats_routes} label="Rute" />
                <StatCard number={settings.stats_passengers} label="Penumpang Bahagia" />
              </div>
            </div>
            
            <div className="mt-10 lg:mt-0 relative">
              <div className="boat-animation">
                <img src={settings.about_image} alt="Ferry Boat" className="rounded-lg shadow-2xl w-full h-auto" />
              </div>
              <div className="absolute -bottom-6 sm:-bottom-10 -right-4 sm:-right-10 bg-primary-500 rounded-lg p-4 sm:p-8 shadow-xl max-w-[200px]">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-medal text-2xl sm:text-4xl text-yellow-400"></i>
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

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">{settings.cta_title}</h2>
          <p className="text-lg sm:text-xl text-primary-100 mb-8 sm:mb-12 max-w-3xl mx-auto">{settings.cta_subtitle}</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a 
              href="#routes"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white touch-target"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('routes');
              }}
            >
              <i className="fas fa-ship mr-2"></i> Jelajahi Rute
            </a>
            <a 
              href="#download-app"
              className="show-app-modal inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-white text-sm sm:text-base font-medium rounded-md text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white touch-target"
              onClick={(e) => {
                e.preventDefault();
                setAppModalOpen(true);
              }}
            >
              <i className="fas fa-sign-in-alt mr-2"></i> Masuk
            </a>
          </div>
        </div>
      </section>

      {/* Contact & Footer */}
      <section id="contact" className="bg-gray-900 text-white pt-16 sm:pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-6">
                <img className="h-8 sm:h-10 w-auto" src="/images/logo.png" alt="Ferry Ticket Logo" />
                <span className="ml-2 text-lg sm:text-xl font-bold text-white">{settings.site_name}</span>
              </div>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">{settings.footer_description}</p>
              <div className="flex space-x-4">
                <SocialLink href={settings.social_facebook} icon="fab fa-facebook-f" />
                <SocialLink href={settings.social_twitter} icon="fab fa-twitter" />
                <SocialLink href={settings.social_instagram} icon="fab fa-instagram" />
                <SocialLink href={settings.social_youtube} icon="fab fa-youtube" />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 sm:mb-6">Quick Links</h3>
              <ul className="space-y-2 sm:space-y-3">
                {['Beranda', 'Rute', 'Cara Pemesanan', 'Tentang Kami', 'Syarat & Ketentuan', 'Kebijakan Privasi'].map((item, index) => (
                  <li key={index}>
                    <a 
                      href="#"
                      className="text-gray-400 hover:text-white text-sm sm:text-base block touch-target py-1"
                      onClick={(e) => {
                        e.preventDefault();
                        // Handle navigation
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
                <li>
                  <Link to="/operator/login" className="text-gray-400 hover:text-white text-sm sm:text-base block touch-target py-1">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 sm:mb-6">Contact Us</h3>
              <ul className="space-y-2 sm:space-y-3">
                <ContactInfo icon="fas fa-map-marker-alt" text={settings.footer_address} />
                <ContactInfo icon="fas fa-phone-alt" text={settings.footer_phone} />
                <ContactInfo icon="fas fa-envelope" text={settings.footer_email} />
                <ContactInfo icon="fas fa-clock" text="Dukungan Pelanggan: 24/7" />
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 sm:mt-16 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm sm:text-base">{settings.footer_copyright}</p>
            <div className="mt-4 md:mt-0 flex items-center justify-center">
              <img src="/images/logo.png" alt="Payment Methods" className="h-16 sm:h-24 md:h-32" />
            </div>
          </div>
        </div>
      </section>

      {/* App Download Modal */}
      {appModalOpen && (
        <AppDownloadModal 
          onClose={() => setAppModalOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
};

// Component untuk Route Card
const RouteCard = ({ route, onBookClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col">
      <div className="relative h-40 sm:h-48">
        <img 
          className="h-full w-full object-cover"
          src={route.image_url || 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?q=80&w=1978'}
          alt={`${route.origin} - ${route.destination}`}
        />
        {route.is_popular && (
          <span className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Populer
          </span>
        )}
      </div>
      <div className="p-4 sm:p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            {route.origin} - {route.destination}
          </h3>
        </div>
        <div className="flex items-center mb-2">
          <i className="fas fa-clock text-gray-500 mr-2 flex-shrink-0"></i>
          <span className="text-gray-600 text-sm sm:text-base">
            Durasi: ~{route.duration || '2'} jam
          </span>
        </div>
        <div className="flex items-center mb-4">
          <i className="fas fa-ship text-gray-500 mr-2 flex-shrink-0"></i>
          <span className="text-gray-600 text-sm sm:text-base">
            {route.schedule_description || `${route.schedules?.length || 0} jadwal tersedia`}
          </span>
        </div>
        <div className="flex justify-between items-center mt-auto pt-4">
          <div>
            <span className="text-gray-500 text-xs sm:text-sm">Mulai dari</span>
            <p className="text-base sm:text-lg font-bold text-primary-600">
              Rp {route.base_price?.toLocaleString('id-ID') || '60.000'}
            </p>
          </div>
          <a 
            href="#download-app"
            className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 touch-target"
            onClick={(e) => {
              e.preventDefault();
              onBookClick();
            }}
          >
            Pesan Sekarang
          </a>
        </div>
      </div>
    </div>
  );
};

// Component untuk Feature Card
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="text-center px-2 sm:px-4">
      <div className="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
        <i className={`${icon} text-xl sm:text-2xl`}></i>
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600">{description}</p>
    </div>
  );
};

// Component untuk Step Card
const StepCard = ({ number, icon, title, description }) => {
  return (
    <div className="relative bg-white p-4 sm:p-6 rounded-lg shadow-md z-10 h-full">
      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary-600 text-white font-bold">
        {number}
      </div>
      <div className="text-center pt-6">
        <div className="inline-flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
          <i className={`${icon} text-xl sm:text-2xl`}></i>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-gray-600">{description}</p>
      </div>
    </div>
  );
};

// Component untuk Stat Card
const StatCard = ({ number, label }) => {
  return (
    <div>
      <p className="text-2xl sm:text-4xl font-bold">{number}</p>
      <p className="text-primary-100 text-sm sm:text-base">{label}</p>
    </div>
  );
};

// Component untuk Social Link
const SocialLink = ({ href, icon }) => {
  return (
    <a href={href} className="text-gray-400 hover:text-white touch-target p-1">
      <i className={`${icon} text-lg`}></i>
    </a>
  );
};

// Component untuk Contact Info
const ContactInfo = ({ icon, text }) => {
  return (
    <li className="flex items-start">
      <i className={`${icon} text-primary-500 mt-1 mr-3 flex-shrink-0`}></i>
      <span className="text-gray-400 text-sm sm:text-base">{text}</span>
    </li>
  );
};

// Component untuk App Download Modal
const AppDownloadModal = ({ onClose, activeTab, setActiveTab }) => {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Reset to first tab when opening modal
    setActiveTab('features');
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [setActiveTab]);

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl p-5 sm:p-8 max-w-md w-full mx-4 relative overflow-hidden modal-fade-in">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 z-20 bg-white bg-opacity-80 rounded-full w-8 h-8 flex items-center justify-center touch-target"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        {/* Background decorative blobs */}
        <div className="absolute -top-20 -left-16 w-64 h-64 bg-primary-100 rounded-full blur-2xl opacity-50 blob-animation"></div>
        <div className="absolute -bottom-20 -right-16 w-72 h-72 bg-secondary-100 rounded-full blur-2xl opacity-50 blob-animation" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10">
          {/* Header with wave decoration */}
          <div className="text-center mb-3 relative">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-primary-500 rounded-full flex items-center justify-center">
              <i className="fas fa-mobile-alt text-2xl sm:text-4xl text-white"></i>
              <svg className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 text-primary-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.222 0c1.406 0 2.54 1.137 2.607 2.534V24l-2.677-2.273l-1.47-1.338l-1.604-1.398l.67 2.205H3.71c-1.402 0-2.54-1.065-2.54-2.476V2.534C1.17 1.137 2.31.003 3.715.003H20.22Z"></path>
              </svg>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Dapatkan Aplikasi Mobile Kami</h3>
            <p className="text-gray-600 mb-1 text-sm sm:text-base">Rasakan pengalaman pemesanan feri yang lancar</p>

            {/* Decorative wave */}
            <svg className="w-full h-4 sm:h-6 text-primary-100" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 10 C 30 4 70 4 100 10 L 100 0 L 0 0 Z" fill="currentColor"></path>
            </svg>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 mt-3">
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
              <AppFeaturesTab />
            ) : (
              <DownloadTab />
            )}
          </div>

          {/* Benefits section */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-2">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center text-sm sm:text-base">
              <i className="fas fa-star text-yellow-400 mr-2"></i>
              Mengapa Memilih Aplikasi Kami
            </h4>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary-500 mt-1 mr-2 flex-shrink-0"></i>
                <span>Proses pemesanan lebih cepat</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary-500 mt-1 mr-2 flex-shrink-0"></i>
                <span>Diskon eksklusif untuk ponsel</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary-500 mt-1 mr-2 flex-shrink-0"></i>
                <span>Pembaruan status feri secara real-time</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// App Features Tab Content
const AppFeaturesTab = () => {
  return (
    <div className="block">
      <div className="flex flex-col items-center">
        <div className="relative mb-4 mt-2">
          <div className="relative mx-auto w-40 sm:w-48 h-auto phone-float">
            <div className="relative z-10 mx-auto">
              <div className="relative rounded-xl overflow-hidden border-4 border-gray-800 w-full h-full shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1606768666853-403c90a981ad?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3"
                  alt="Ferry Ticket App" 
                  className="w-full h-auto"
                />
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-800 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Pemesanan yang Cepat & Mudah</h4>

        <div className="bg-gray-50 rounded-lg p-3 w-full">
          <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <i className="fas fa-check-circle text-primary-500 mt-1 mr-2 flex-shrink-0"></i>
              <span>Jadwal feri secara real-time</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check-circle text-primary-500 mt-1 mr-2 flex-shrink-0"></i>
              <span>Pembayaran mobile yang aman</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check-circle text-primary-500 mt-1 mr-2 flex-shrink-0"></i>
              <span>Tiket digital untuk menaiki kapal feri</span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-center text-gray-500 mt-3">Klik "Unduh Aplikasi" untuk memulai</p>
      </div>
    </div>
  );
};

// Download Tab Content
const DownloadTab = () => {
  return (
    <div className="block">
      <div className="flex flex-col items-center">
        <div className="relative bounce-animation mb-4 mt-2">
          <div className="p-3 sm:p-4 bg-white border-2 border-primary-100 rounded-lg shadow-lg">
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://ferryticket.com/app"
              alt="Download App QR Code" 
              className="h-32 w-32 sm:h-36 sm:w-36"
            />
          </div>
          <div className="absolute -top-2 -right-2 bg-primary-500 text-white p-1 sm:p-2 rounded-full">
            <i className="fas fa-qrcode text-sm sm:text-base"></i>
          </div>
        </div>

        <p className="text-sm sm:text-base font-medium text-gray-700 mb-2">Pindai untuk mengunduh</p>
        <p className="text-xs sm:text-sm text-gray-500 mb-4">Gunakan kamera ponsel Anda untuk memindai kode QR ini</p>

        <div className="flex justify-center space-x-3 sm:space-x-4 mb-4">
          <AppStoreButton platform="apple" />
          <AppStoreButton platform="google" />
        </div>
      </div>
    </div>
  );
};

// App Store Button Component
const AppStoreButton = ({ platform }) => {
  return (
    <a 
      href="#"
      className="flex items-center justify-center bg-black text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800 touch-target"
    >
      <i className={`fab fa-${platform === 'apple' ? 'apple' : 'google-play'} text-lg sm:text-xl mr-2`}></i>
      <div className="text-left">
        <div className="text-xs">{platform === 'apple' ? 'Unduh di' : 'Dapatkan di'}</div>
        <div className="text-xs sm:text-sm font-semibold">
          {platform === 'apple' ? 'App Store' : 'Google Play'}
        </div>
      </div>
    </a>
  );
};

export default Welcome;