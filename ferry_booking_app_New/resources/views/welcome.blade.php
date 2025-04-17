<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Ferry Ticket System</title>

    <!-- Styles / Scripts -->
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    @else
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        fontFamily: {
                            'sans': ['Nunito', 'sans-serif'],
                        },
                        colors: {
                            'primary': {
                                50: '#f0f9ff',
                                100: '#e0f2fe',
                                200: '#bae6fd',
                                300: '#7dd3fc',
                                400: '#38bdf8',
                                500: '#0ea5e9',
                                600: '#0284c7',
                                700: '#0369a1',
                                800: '#075985',
                                900: '#0c4a6e',
                            },
                            'secondary': {
                                50: '#ecfdf5',
                                100: '#d1fae5',
                                200: '#a7f3d0',
                                300: '#6ee7b7',
                                400: '#34d399',
                                500: '#10b981',
                                600: '#059669',
                                700: '#047857',
                                800: '#065f46',
                                900: '#064e3b',
                            }
                        },
                        screens: {
                            'xs': '480px',
                        }
                    }
                }
            }
        </script>
        <style>
            /* Base Styles */
            body {
                font-family: 'Nunito', sans-serif;
                overflow-x: hidden;
                /* Prevent horizontal scrolling from blobs */
            }

            /* Smooth Scrolling */
            html {
                scroll-behavior: smooth;
                scroll-padding-top: 80px;
                /* Add padding for fixed header */
            }

            /* Wave Animation */
            .wave-animation {
                animation: wave 8s ease-in-out infinite;
            }

            @keyframes wave {

                0%,
                100% {
                    transform: translateY(0);
                }

                50% {
                    transform: translateY(-15px);
                }
            }

            /* Boat Animation */
            .boat-animation {
                animation: boat 6s ease-in-out infinite;
            }

            @keyframes boat {

                0%,
                100% {
                    transform: translateY(0) rotate(-2deg);
                }

                50% {
                    transform: translateY(-10px) rotate(2deg);
                }
            }

            /* Blob Animation */
            .blob-animation {
                animation: blob 10s ease-in-out infinite alternate;
            }

            @keyframes blob {
                0% {
                    transform: translateY(0) scale(1);
                }

                50% {
                    transform: translateY(-5px) scale(1.05);
                }

                100% {
                    transform: translateY(5px) scale(0.95);
                }
            }

            /* Floating Blob Animation */
            .floating-blob {
                animation: floating 15s ease-in-out infinite alternate;
            }

            @keyframes floating {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                }

                33% {
                    transform: translate(10px, 15px) rotate(5deg);
                }

                66% {
                    transform: translate(-10px, 5px) rotate(-5deg);
                }

                100% {
                    transform: translate(5px, -15px) rotate(2deg);
                }
            }

            /* Rotating Blob Animation */
            .rotating-blob {
                animation: rotating 30s linear infinite;
                transform-origin: center center;
            }

            @keyframes rotating {
                0% {
                    transform: rotate(0deg);
                }

                100% {
                    transform: rotate(360deg);
                }
            }

            /* Pulsing Blob Animation */
            .pulsing-blob {
                animation: pulsing 8s ease-in-out infinite;
                transform-origin: center center;
            }

            @keyframes pulsing {

                0%,
                100% {
                    transform: scale(1);
                    opacity: 0.7;
                }

                50% {
                    transform: scale(1.05);
                    opacity: 0.9;
                }
            }

            /* Bounce Animation for QR */
            .bounce-animation {
                animation: bounce 2s ease-in-out infinite;
            }

            @keyframes bounce {

                0%,
                100% {
                    transform: translateY(0);
                }

                50% {
                    transform: translateY(-10px);
                }
            }

            /* Fade-in Animation for Modal */
            .modal-fade-in {
                animation: fadeIn 0.3s ease-out forwards;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }

                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Smooth navbar transitions */
            #navbar {
                transition: transform 0.3s ease-in-out, background-color 0.3s ease, box-shadow 0.3s ease;
            }

            /* Active nav item transition */
            .nav-link,
            .mobile-nav-link {
                transition: color 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
            }

            /* Blob positioning helpers */
            .section-blob {
                position: absolute;
                pointer-events: none;
                /* Make sure it doesn't interfere with clicks */
                z-index: 0;
            }

            /* Custom Swiper Styles */
            .appSwiper {
                width: 100%;
                height: 100%;
                margin: 0 auto;
            }

            .swiper-slide {
                display: flex;
                justify-content: center;
                align-items: center;
                transition: all 0.3s ease;
            }

            .swiper-pagination-bullet {
                width: 8px;
                height: 8px;
                background: #cbd5e1;
                opacity: 0.5;
            }

            .swiper-pagination-bullet-active {
                background: #0ea5e9;
                opacity: 1;
            }

            /* Phone frame animation */
            @keyframes float {

                0%,
                100% {
                    transform: translateY(0);
                }

                50% {
                    transform: translateY(-5px);
                }
            }

            .phone-float {
                animation: float 3s ease-in-out infinite;
            }

            /* Custom Scrollbar */
            ::-webkit-scrollbar {
                width: 10px;
            }

            ::-webkit-scrollbar-track {
                background: #f1f5f9;
            }

            ::-webkit-scrollbar-thumb {
                background: #0ea5e9;
                border-radius: 5px;
            }

            ::-webkit-scrollbar-thumb:hover {
                background: #0284c7;
            }

            /* Touch optimization for mobile */
            @media (max-width: 640px) {
                .touch-target {
                    min-height: 44px;
                    min-width: 44px;
                }

                /* Adjust blobs for mobile */
                .section-blob {
                    transform: scale(0.7);
                    opacity: 0.5;
                }
            }

            /* Fix for mobile hover effects */
            @media (hover: hover) {
                .hover\:scale-105:hover {
                    transform: scale(1.05);
                }
            }
        </style>
    @endif
</head>

<body class="antialiased bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white/95 backdrop-blur-sm shadow-md fixed w-full z-50 transition-all duration-300" id="navbar">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex">
                    <div class="flex-shrink-0 flex items-center">
                        <img class="h-16 sm:h-20 md:h-24 w-auto" src="{{ asset('images/logo.png') }}" alt="Ferry Ticket Logo">
                        <span class="ml-4 text-1xl sm:text-1xl font-bold text-primary-600 truncate">FerryTicket</span>
                    </div>
                    <div class="hidden sm:ml-6 sm:flex sm:space-x-4 md:space-x-8" id="desktop-menu">
                        <a href="#home"
                            class="nav-link border-primary-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            data-section="home">
                            Beranda
                        </a>
                        <a href="#routes"
                            class="nav-link border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            data-section="routes">
                            Rute
                        </a>
                        <a href="#howto"
                            class="nav-link border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            data-section="howto">
                            Cara Pemesanan
                        </a>
                        <a href="#about"
                            class="nav-link border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            data-section="about">
                            Tentang Kami
                        </a>
                        <a href="#contact"
                            class="nav-link border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            data-section="contact">
                            Kontak
                        </a>
                    </div>
                </div>
                <div class="hidden sm:ml-6 sm:flex sm:items-center">
                    @if (Route::has('login'))
                        <div class="space-x-4">
                            @auth
                                <a href="{{ url('/dashboard') }}"
                                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                    Dashboard
                                </a>
                            @else
                                {{-- <a href="#download-app"
                                    class="show-app-modal inline-flex items-center px-4 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                    Masuk
                                </a> --}}

                                {{-- @if (Route::has('register'))
                                    <a href="{{ route('register') }}" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                        Daftar
                                    </a>
                                @endif --}}
                            @endauth
                        </div>
                    @endif
                </div>
                <div class="-mr-2 flex items-center sm:hidden">
                    <button type="button"
                        class="mobile-menu-button inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 touch-target"
                        aria-controls="mobile-menu" aria-expanded="false">
                        <span class="sr-only">Buka menu utama</span>
                        <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile menu, show/hide based on menu state. -->
        <div class="sm:hidden hidden transition-all duration-300 ease-in-out" id="mobile-menu">
            <div class="pt-2 pb-3 space-y-1" id="mobile-nav-links">
                <a href="#home"
                    class="mobile-nav-link bg-primary-50 border-primary-500 text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium touch-target"
                    data-section="home">
                    Beranda
                </a>
                <a href="#routes"
                    class="mobile-nav-link border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium touch-target"
                    data-section="routes">
                    Rute
                </a>
                <a href="#howto"
                    class="mobile-nav-link border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium touch-target"
                    data-section="howto">
                    Cara Pemesanan
                </a>
                <a href="#about"
                    class="mobile-nav-link border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium touch-target"
                    data-section="about">
                    Tentang Kami
                </a>
                <a href="#contact"
                    class="mobile-nav-link border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium touch-target"
                    data-section="contact">
                    Kontak
                </a>
            </div>
            <div class="pt-4 pb-3 border-t border-gray-200">
                @if (Route::has('login'))
                    <div class="mt-3 space-y-1 px-4">
                        @auth
                            <a href="{{ url('/dashboard') }}"
                                class="block px-4 py-2 text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-gray-100 touch-target">
                                Dashboard
                            </a>
                        @else
                            {{-- <a href="#download-app"
                                class="show-app-modal block px-4 py-2 text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-gray-100 touch-target">
                                Masuk
                            </a>
                            @if (Route::has('register'))
                                <a href="#download-app"
                                    class="show-app-modal block px-4 py-2 text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-gray-100 touch-target">
                                    Daftar
                                </a>
                            @endif --}}
                        @endauth
                    </div>
                @endif
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="relative pt-16 pb-32 flex content-center items-center justify-center"
        style="min-height: 100vh;">
        <div class="absolute top-0 w-full h-full bg-center bg-cover"
            style="background-image: url('{{ $settings['hero_image'] ?? 'https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?q=80&w=2070' }}');">
            <span id="blackOverlay" class="w-full h-full absolute opacity-50 bg-black"></span>
        </div>

        <div class="container relative mx-auto px-4">
            <div class="items-center flex flex-wrap">
                <div class="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
                    <div class="mt-8 sm:mt-12">
                        <h1
                            class="text-white font-semibold text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 leading-tight">
                            {{ $settings['hero_title'] ?? 'Jelajahi Keindahan Danau dengan Layanan Ferry Kami' }}
                        </h1>
                        <p class="mt-2 sm:mt-4 text-base sm:text-lg text-gray-300 mb-6 sm:mb-8">
                            {{ $settings['hero_subtitle'] ?? 'Pesan tiket ferry Anda secara online untuk pengalaman perjalanan yang mulus. Transportasi air yang aman, nyaman, dan terjangkau ke tujuan Anda.' }}
                        </p>
                        <div class="flex flex-col xs:flex-row justify-center xs:space-x-4 space-y-4 xs:space-y-0">
                            <a href="#routes"
                                class="bg-primary-600 text-white font-bold px-6 py-3 rounded-lg inline-block transition-all duration-300 hover:bg-primary-700 hover:shadow-lg touch-target">
                                {{ $settings['primary_button_text'] ?? 'Telusuri Rute Pilihan Anda' }}
                            </a>
                            <a href="#howto"
                                class="bg-transparent border-2 border-white text-white font-bold px-6 py-3 rounded-lg inline-block transition-all duration-300 hover:bg-white hover:text-primary-600 touch-target">
                                {{ $settings['secondary_button_text'] ?? 'Panduan Mudah Memesan Tiket' }}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="absolute bottom-0 left-0 right-0">
            <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
                <defs>
                    <path id="gentle-wave"
                        d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                </defs>
                <g class="parallax">
                    <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
                    <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
                    <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
                    <use xlink:href="#gentle-wave" x="48" y="7" fill="#fff" />
                </g>
            </svg>
        </div>
    </section>

    {{-- <!-- Quick Search Box -->
    <section class="py-12 sm:py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-xl p-5 sm:p-8 -mt-20 md:-mt-32 relative z-10 border border-gray-100">
                <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">Find Your Ferry Route</h2>
                <form class="grid grid-cols-1 gap-4 sm:gap-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="origin" class="block text-sm font-medium text-gray-700 mb-1">From</label>
                            <select id="origin" name="origin"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 touch-target">
                                <option value="" selected disabled>Select origin</option>
                                <option value="merak">Merak</option>
                                <option value="bakauheni">Bakauheni</option>
                                <option value="ketapang">Ketapang</option>
                                <option value="gilimanuk">Gilimanuk</option>
                            </select>
                        </div>
                        <div>
                            <label for="destination" class="block text-sm font-medium text-gray-700 mb-1">To</label>
                            <select id="destination" name="destination"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 touch-target">
                                <option value="" selected disabled>Select destination</option>
                                <option value="merak">Merak</option>
                                <option value="bakauheni">Bakauheni</option>
                                <option value="ketapang">Ketapang</option>
                                <option value="gilimanuk">Gilimanuk</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input type="date" id="date" name="date"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 touch-target">
                        </div>
                        <div class="flex items-end">
                            <button type="button"
                                class="show-app-modal w-full bg-primary-600 py-3 px-4 rounded-md text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 touch-target">
                                Search
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </section> --}}

    <!-- Available Routes -->
    <section id="routes" class="py-12 sm:py-16 bg-primary-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
                    {{ $settings['routes_title'] ?? 'Rute yang Tersedia' }}</h2>
                <p class="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600">
                    {{ $settings['routes_subtitle'] ?? 'Jelajahi semua rute feri kami yang menghubungkan pulau-pulau' }}
                </p>
            </div>

            <div class="mt-8 sm:mt-12 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                @forelse($allRoutes as $route)
                    <!-- Route Card -->
                    <div
                        class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                        <div class="relative h-40 sm:h-48">
                            <img class="h-full w-full object-cover"
                                src="{{ $route->image_url ?? 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?q=80&w=1978' }}"
                                alt="{{ $route->origin }} - {{ $route->destination }}">
                            @if (isset($route->is_popular) && $route->is_popular)
                                <span
                                    class="absolute top-3 right-3 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    Populer
                                </span>
                            @endif
                        </div>
                        <div class="p-4 sm:p-6 flex-grow flex flex-col">
                            <div class="flex justify-between items-start mb-4">
                                <h3 class="text-lg sm:text-xl font-bold text-gray-900">{{ $route->origin }} -
                                    {{ $route->destination }}</h3>
                            </div>
                            <div class="flex items-center mb-2">
                                <i class="fas fa-clock text-gray-500 mr-2 flex-shrink-0"></i>
                                <span class="text-gray-600 text-sm sm:text-base">Durasi:
                                    ~{{ $route->duration ?? '2' }} jam</span>
                            </div>
                            <div class="flex items-center mb-4">
                                <i class="fas fa-ship text-gray-500 mr-2 flex-shrink-0"></i>
                                <span class="text-gray-600 text-sm sm:text-base">
                                    @if (isset($route->schedule_description) && $route->schedule_description)
                                        {{ $route->schedule_description }}
                                    @else
                                        {{ count($route->schedules) }} jadwal tersedia
                                    @endif
                                </span>
                            </div>
                            <div class="flex justify-between items-center mt-auto pt-4">
                                <div>
                                    <span class="text-gray-500 text-xs sm:text-sm">Mulai dari</span>
                                    <p class="text-base sm:text-lg font-bold text-primary-600">
                                        Rp {{ number_format($route->base_price ?? 60000, 0, ',', '.') }}
                                    </p>
                                </div>
                                <!-- Modified "Book Now" button to trigger app modal -->
                                <a href="#download-app"
                                    class="show-app-modal inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 touch-target">
                                    Pesan Sekarang
                                </a>
                            </div>
                        </div>
                    </div>
                @empty
                    <!-- Fallback when no routes are found -->
                    <div class="col-span-1 md:col-span-2 lg:col-span-3 py-8 text-center">
                        <div class="mx-auto max-w-md">
                            <i class="fas fa-ship text-3xl sm:text-4xl text-gray-400 mb-4"></i>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">Tidak ada rute yang tersedia saat ini
                            </h3>
                            <p class="text-gray-500">Silakan periksa kembali nanti untuk rute feri yang tersedia.</p>
                        </div>
                    </div>
                @endforelse
            </div>

            <div class="mt-8 sm:mt-12 text-center">
                <!-- Modified "View All Details" button to trigger app modal -->
                <a href="#download-app"
                    class="show-app-modal inline-flex items-center px-5 sm:px-6 py-2 sm:py-3 border border-primary-600 text-sm sm:text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 touch-target">
                    Lihat Semua Detail
                    <i class="fas fa-arrow-right ml-2"></i>
                </a>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 sm:py-20 bg-white relative overflow-hidden">
        <!-- Decorative blobs for Features section -->
        <div class="section-blob -top-16 right-0 opacity-10">
            <svg width="500" height="500" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                class="pulsing-blob">
                <path fill="#0ea5e9"
                    d="M32.1,-47.8C42.6,-37.9,52.8,-29.4,59.6,-17.5C66.3,-5.7,69.6,9.3,65.5,22.1C61.4,34.8,49.9,45.3,37.1,52.3C24.2,59.3,10,62.9,-3.9,62.4C-17.9,61.9,-31.6,57.5,-45.5,49.3C-59.4,41.1,-73.5,29.2,-76.8,14.7C-80,0.1,-72.4,-17.1,-63.1,-31.6C-53.9,-46.1,-42.9,-57.8,-30.4,-66.7C-17.9,-75.5,-3.9,-81.4,6.6,-76.7C17,-72,21.7,-57.7,32.1,-47.8Z"
                    transform="translate(100 100)" />
            </svg>
        </div>
        <div class="section-blob -bottom-16 left-0 opacity-10">
            <svg width="450" height="450" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                class="rotating-blob" style="animation-duration: 45s;">
                <path fill="#0284c7"
                    d="M45.3,-60.7C57.4,-49.4,65.2,-34.2,70.6,-17.5C76,0,79.8,18.9,73.7,32.6C67.5,46.3,51.4,54.8,35.5,60.7C19.6,66.7,3.9,70.1,-13.6,70.3C-31.2,70.5,-50.5,67.6,-64.4,56.3C-78.3,45,-86.7,25.4,-86.5,6.1C-86.2,-13.1,-77.2,-32,-63.6,-43.9C-50,-55.9,-31.9,-61,-15.3,-64.6C1.3,-68.1,15.9,-70.2,29.7,-68.9C43.4,-67.7,56.3,-63.1,45.3,-60.7Z"
                    transform="translate(100 100)" />
            </svg>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div class="text-center">
                <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
                    {{ $settings['features_title'] ?? 'Mengapa Memilih Layanan Ferry Kami' }}</h2>
                <p class="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600">
                    {{ $settings['features_subtitle'] ?? 'Nikmati perjalanan terbaik di Danau Toba dengan berbagai keuntungan berikut' }}
                </p>
            </div>

            <div class="mt-10 sm:mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <!-- Feature 1 -->
                <div class="text-center px-2 sm:px-4">
                    <div
                        class="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                        <i class="{{ $settings['feature1_icon'] ?? 'fas fa-anchor' }} text-xl sm:text-2xl"></i>
                    </div>
                    <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {{ $settings['feature1_title'] ?? 'Layanan Terbaik' }}</h3>
                    <p class="text-sm sm:text-base text-gray-600">
                        {{ $settings['feature1_description'] ?? 'Keberangkatan dan kedatangan yang tepat waktu dengan prioritas utama pada kepuasan penumpang' }}
                    </p>
                </div>

                <!-- Feature 2 -->
                <div class="text-center px-2 sm:px-4">
                    <div
                        class="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                        <i class="{{ $settings['feature2_icon'] ?? 'fas fa-shield-alt' }} text-xl sm:text-2xl"></i>
                    </div>
                    <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {{ $settings['feature2_title'] ?? 'Keselamatan Prioritas Utama' }}</h3>
                    <p class="text-sm sm:text-base text-gray-600">
                        {{ $settings['feature2_description'] ?? 'Kami memprioritaskan keselamatan dengan kapal yang terawat baik dan staf yang terlatih' }}
                    </p>
                </div>

                <!-- Feature 3 -->
                <div class="text-center px-2 sm:px-4">
                    <div
                        class="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                        <i class="{{ $settings['feature3_icon'] ?? 'fas fa-ticket-alt' }} text-xl sm:text-2xl"></i>
                    </div>
                    <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {{ $settings['feature3_title'] ?? 'Pemesanan mudah' }}</h3>
                    <p class="text-sm sm:text-base text-gray-600">
                        {{ $settings['feature3_description'] ?? 'Sistem pemesanan tiket online yang sederhana dengan konfirmasi instan' }}
                    </p>
                </div>

                <!-- Feature 4 -->
                <div class="text-center px-2 sm:px-4">
                    <div
                        class="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                        <i class="{{ $settings['feature4_icon'] ?? 'fas fa-wallet' }} text-xl sm:text-2xl"></i>
                    </div>
                    <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {{ $settings['feature4_title'] ?? 'Harga Terjangkau' }}</h3>
                    <p class="text-sm sm:text-base text-gray-600">
                        {{ $settings['feature4_description'] ?? 'Harga kompetitif dengan diskon khusus untuk wisatawan reguler' }}
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- How to Book -->
    <section id="howto" class="py-16 sm:py-20 bg-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
                    {{ $settings['howto_title'] ?? 'Bagaimana cara memesan tiket kapal feri Anda' }}</h2>
                <p class="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600">
                    {{ $settings['howto_subtitle'] ?? 'Ikuti langkah-langkah sederhana ini untuk memesan perjalanan Anda' }}
                </p>
            </div>

            <div class="mt-10 sm:mt-16 relative">
                <!-- Line Connector - Hidden on mobile, visible on larger screens -->
                <div
                    class="hidden lg:block absolute top-1/2 transform -translate-y-1/2 left-0 right-0 h-0.5 bg-gray-200">
                </div>

                <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <!-- Step 1 -->
                    <div class="relative bg-white p-4 sm:p-6 rounded-lg shadow-md z-10 h-full">
                        <div
                            class="absolute -top-5 left-1/2 transform -translate-x-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary-600 text-white font-bold">
                            1
                        </div>
                        <div class="text-center pt-6">
                            <div
                                class="inline-flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                                <i class="{{ $settings['step1_icon'] ?? 'fas fa-search' }} text-xl sm:text-2xl"></i>
                            </div>
                            <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                                {{ $settings['step1_title'] ?? 'Pencarian Rute' }}</h3>
                            <p class="text-sm sm:text-base text-gray-600">
                                {{ $settings['step1_description'] ?? 'Masukkan asal, tujuan, dan tanggal perjalanan Anda untuk menemukan feri yang tersedia.' }}
                            </p>
                        </div>
                    </div>

                    <!-- Step 2 -->
                    <div class="relative bg-white p-4 sm:p-6 rounded-lg shadow-md z-10 h-full">
                        <div
                            class="absolute -top-5 left-1/2 transform -translate-x-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary-600 text-white font-bold">
                            2
                        </div>
                        <div class="text-center pt-6">
                            <div
                                class="inline-flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                                <i
                                    class="{{ $settings['step2_icon'] ?? 'fas fa-calendar-alt' }} text-xl sm:text-2xl"></i>
                            </div>
                            <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                                {{ $settings['step2_title'] ?? 'Pilih Jadwal' }}</h3>
                            <p class="text-sm sm:text-base text-gray-600">
                                {{ $settings['step2_description'] ?? 'Pilih dari jadwal yang tersedia dan jenis feri yang sesuai dengan kebutuhan Anda.' }}
                            </p>
                        </div>
                    </div>

                    <!-- Step 3 -->
                    <div class="relative bg-white p-4 sm:p-6 rounded-lg shadow-md z-10 h-full">
                        <div
                            class="absolute -top-5 left-1/2 transform -translate-x-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary-600 text-white font-bold">
                            3
                        </div>
                        <div class="text-center pt-6">
                            <div
                                class="inline-flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                                <i
                                    class="{{ $settings['step3_icon'] ?? 'fas fa-credit-card' }} text-xl sm:text-2xl"></i>
                            </div>
                            <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                                {{ $settings['step3_title'] ?? 'Melakukan Pembayaran' }}</h3>
                            <p class="text-sm sm:text-base text-gray-600">
                                {{ $settings['step3_description'] ?? 'Pembayaran yang aman melalui berbagai pilihan termasuk kartu kredit dan mobile banking.' }}
                            </p>
                        </div>
                    </div>

                    <!-- Step 4 -->
                    <div class="relative bg-white p-4 sm:p-6 rounded-lg shadow-md z-10 h-full">
                        <div
                            class="absolute -top-5 left-1/2 transform -translate-x-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary-600 text-white font-bold">
                            4
                        </div>
                        <div class="text-center pt-6">
                            <div
                                class="inline-flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                                <i class="{{ $settings['step4_icon'] ?? 'fas fa-qrcode' }} text-xl sm:text-2xl"></i>
                            </div>
                            <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                                {{ $settings['step4_title'] ?? 'Dapatkan E-Ticket' }}</h3>
                            <p class="text-sm sm:text-base text-gray-600">
                                {{ $settings['step4_description'] ?? 'Dapatkan tiket elektronik Anda secara instan melalui email atau unduh dari akun Anda.' }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonials -->
    <section class="py-16 sm:py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Apa Yang Dikatakan Pelanggan Kami</h2>
                <p class="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600">Baca testimoni dari penumpang yang pernah
                    bepergian bersama kami</p>
            </div>

            <div class="mt-10 sm:mt-16 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                <!-- Testimonial 1 -->
                <div class="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-sm h-full">
                    <div class="flex items-center mb-4">
                        <div class="text-yellow-400 flex">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                        <span class="ml-2 text-gray-600">5.0</span>
                    </div>
                    <p class="text-gray-700 mb-6 text-sm sm:text-base">"Proses pemesanan online sangat mudah. Saya
                        langsung menerima e-tiket saya, dan ferry-nya bersih serta nyaman. Saya pasti akan menggunakan
                        layanan ini lagi!"</p>
                    <div class="flex items-center mt-auto">
                        <img class="h-10 w-10 rounded-full object-cover"
                            src="https://randomuser.me/api/portraits/women/17.jpg" alt="Customer">
                        <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">Sarah Johnson</h4>
                            <p class="text-xs sm:text-sm text-gray-500">Bepergian dari Balige ke Onanrunggu</p>
                        </div>
                    </div>
                </div>

                <!-- Testimonial 2 -->
                <div class="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-sm h-full">
                    <div class="flex items-center mb-4">
                        <div class="text-yellow-400 flex">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star-half-alt"></i>
                        </div>
                        <span class="ml-2 text-gray-600">4.5</span>
                    </div>
                    <p class="text-gray-700 mb-6 text-sm sm:text-base">"Layanan yang sangat baik dan keberangkatan yang
                        tepat waktu. Sangat direkomendasikan untuk perjalanan keluarga melintasi pulau-pulau!"</p>
                    <div class="flex items-center mt-auto">
                        <img class="h-10 w-10 rounded-full object-cover"
                            src="https://randomuser.me/api/portraits/men/32.jpg" alt="Customer">
                        <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">Budi Santoso</h4>
                            <p class="text-xs sm:text-sm text-gray-500">Bepergian dari Balige ke Onanrunggu</p>
                        </div>
                    </div>
                </div>

                <!-- Testimonial 3 -->
                <div class="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-sm h-full">
                    <div class="flex items-center mb-4">
                        <div class="text-yellow-400 flex">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                        <span class="ml-2 text-gray-600">5.0</span>
                    </div>
                    <p class="text-gray-700 mb-6 text-sm sm:text-base">"Saya terkesan dengan standar keselamatan di
                        atas kapal. Kru bersikap profesional, dan perjalanan berlangsung lancar. Sistem online membuat
                        pemesanan menjadi sangat mudah."</p>
                    <div class="flex items-center mt-auto">
                        <img class="h-10 w-10 rounded-full object-cover"
                            src="https://randomuser.me/api/portraits/women/62.jpg" alt="Customer">
                        <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">Dewi Putri</h4>
                            <p class="text-xs sm:text-sm text-gray-500">Bepergian dari Balige ke Onanrunggu</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- About Us -->
    <section id="about" class="py-16 sm:py-20 bg-primary-600 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                <div>
                    <h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                        {{ $settings['about_title'] ?? 'Tentang Layanan Ferry Kami' }}</h2>
                    <p class="text-primary-100 mb-4 sm:mb-6 text-sm sm:text-lg">
                        {{ $settings['about_content'] ?? 'Berdiri sejak tahun 2010, platform tiket ferry kami telah memainkan peran penting dalam mendukung transportasi air di Kawasan Danau Toba. Kami berkomitmen untuk menyediakan layanan yang aman, terpercaya, dan terjangkau bagi penumpang maupun kendaraan.' }}
                    </p>
                    <p class="text-primary-100 mb-4 sm:mb-6 text-sm sm:text-lg">
                        {{ $settings['about_mission'] ?? 'Misi kami adalah menyederhanakan perjalanan air melalui teknologi, sambil tetap menjaga standar keselamatan dan layanan pelanggan yang tinggi. Dengan jaringan rute yang luas, kami mendukung konektivitas transportasi air di berbagai kawasan, terutama di Kawasan Danau Toba. Kami bangga menjadi bagian dari solusi perjalanan yang efisien dan terpercaya bagi masyarakat.' }}
                    </p>
                    <div class="grid grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-10">
                        <div>
                            <p class="text-2xl sm:text-4xl font-bold">{{ $settings['stats_daily_trips'] ?? '150+' }}
                            </p>
                            <p class="text-primary-100 text-sm sm:text-base">Perjalanan Harian</p>
                        </div>
                        <div>
                            <p class="text-2xl sm:text-4xl font-bold">{{ $settings['stats_ferries'] ?? '50+' }}</p>
                            <p class="text-primary-100 text-sm sm:text-base">Kapal Ferry</p>
                        </div>
                        <div>
                            <p class="text-2xl sm:text-4xl font-bold">{{ $settings['stats_routes'] ?? '25+' }}</p>
                            <p class="text-primary-100 text-sm sm:text-base">Rute</p>
                        </div>
                        <div>
                            <p class="text-2xl sm:text-4xl font-bold">{{ $settings['stats_passengers'] ?? '1M+' }}</p>
                            <p class="text-primary-100 text-sm sm:text-base">Penumpang Bahagia</p>
                        </div>
                    </div>
                </div>
                <div class="mt-10 lg:mt-0 relative">
                    <div class="boat-animation">
                        <img src="{{ $settings['about_image'] ?? 'images/ferry.png' }}"
                            alt="Ferry Boat" class="rounded-lg shadow-2xl w-full h-auto">
                            <img class="h-16 sm:h-20 md:h-24 w-auto" src="{{ asset('images/logo.png') }}" alt="Ferry Ticket Logo">

                    </div>
                    <div
                        class="absolute -bottom-6 sm:-bottom-10 -right-4 sm:-right-10 bg-primary-500 rounded-lg p-4 sm:p-8 shadow-xl max-w-[200px]">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <i class="fas fa-medal text-2xl sm:text-4xl text-yellow-400"></i>
                            </div>
                            <div class="ml-3 sm:ml-4">
                                <h3 class="text-base sm:text-xl font-bold">Award-winning Service</h3>
                                <p class="text-xs sm:text-sm text-primary-100">Best Ferry Operator 2023</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 sm:py-20 bg-primary-700 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">
                {{ $settings['cta_title'] ?? 'Siap untuk Memulai Perjalanan Anda?' }}</h2>
            <p class="text-lg sm:text-xl text-primary-100 mb-8 sm:mb-12 max-w-3xl mx-auto">
                {{ $settings['cta_subtitle'] ?? 'Pesan tiket feri Anda secara online untuk pengalaman perjalanan yang mulus. Transportasi laut yang aman, nyaman, dan terjangkau ke tempat tujuan Anda.' }}
            </p>
            <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <a href="#routes"
                    class="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white touch-target">
                    <i class="fas fa-ship mr-2"></i> Jelajahi Rute
                </a>
                <a href="#download-app"
                    class="show-app-modal inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-white text-sm sm:text-base font-medium rounded-md text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white touch-target">
                    <i class="fas fa-sign-in-alt mr-2"></i> Masuk
                </a>
            </div>
        </div>
    </section>

    <!-- Contact & Footer -->
    <section id="contact" class="bg-gray-900 text-white pt-16 sm:pt-20 pb-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                <!-- Company Info -->
                <div>
                    <div class="flex items-center mb-6">
                        <img class="h-8 sm:h-10 w-auto" src="{{ asset('images/logo.png') }}"
                            alt="Ferry Ticket Logo">
                        <span
                            class="ml-2 text-lg sm:text-xl font-bold text-white">{{ $settings['site_name'] ?? 'FerryTicket' }}</span>
                    </div>
                    <p class="text-gray-400 mb-4 text-sm sm:text-base">
                        {{ $settings['footer_description'] ?? 'Mitra terpercaya Anda untuk perjalanan di kawasan Danau Toba. Pesan tiket feri Anda secara online untuk pengalaman yang mulus.' }}
                    </p>
                    <div class="flex space-x-4">
                        <a href="{{ $settings['social_facebook'] ?? '#' }}"
                            class="text-gray-400 hover:text-white touch-target p-1">
                            <i class="fab fa-facebook-f text-lg"></i>
                        </a>
                        <a href="{{ $settings['social_twitter'] ?? '#' }}"
                            class="text-gray-400 hover:text-white touch-target p-1">
                            <i class="fab fa-twitter text-lg"></i>
                        </a>
                        <a href="{{ $settings['social_instagram'] ?? '#' }}"
                            class="text-gray-400 hover:text-white touch-target p-1">
                            <i class="fab fa-instagram text-lg"></i>
                        </a>
                        <a href="{{ $settings['social_youtube'] ?? '#' }}"
                            class="text-gray-400 hover:text-white touch-target p-1">
                            <i class="fab fa-youtube text-lg"></i>
                        </a>
                    </div>
                </div>

                <!-- Quick Links -->
                <div>
                    <h3 class="text-lg font-semibold mb-4 sm:mb-6">Quick Links</h3>
                    <ul class="space-y-2 sm:space-y-3">
                        <li><a href="#home"
                                class="text-gray-400 hover:text-white text-sm sm:text-base block touch-target py-1">Beranda</a>
                        </li>
                        <li><a href="#routes"
                                class="text-gray-400 hover:text-white text-sm sm:text-base block touch-target py-1">Rute</a>
                        </li>
                        <li><a href="#howto"
                                class="text-gray-400 hover:text-white text-sm sm:text-base block touch-target py-1">Cara
                                Pemesanan</a></li>
                        <li><a href="#about"
                                class="text-gray-400 hover:text-white text-sm sm:text-base block touch-target py-1">Tentang
                                Kami</a></li>
                        <li><a href="#"
                                class="text-gray-400 hover:text-white text-sm sm:text-base block touch-target py-1">Syarat
                                & Ketentuan</a></li>
                        <li><a href="#"
                                class="text-gray-400 hover:text-white text-sm sm:text-base block touch-target py-1">Kebijakan
                                Privasi</a></li>
                        <li>
                            <a href="{{ route('operator.login') }}"
                                class="text-gray-400 hover:text-white text-sm sm:text-base block touch-target py-1">Login</a>
                        </li>
                    </ul>
                </div>

                <!-- Contact Information -->
                <div>
                    <h3 class="text-lg font-semibold mb-4 sm:mb-6">Contact Us</h3>
                    <ul class="space-y-2 sm:space-y-3">
                        <li class="flex items-start">
                            <i class="fas fa-map-marker-alt text-primary-500 mt-1 mr-3 flex-shrink-0"></i>
                            <span
                                class="text-gray-400 text-sm sm:text-base">{{ $settings['footer_address'] ?? 'Jl. Pelabuhan Raya No. 123, Jakarta Utara, Indonesia' }}</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-phone-alt text-primary-500 mt-1 mr-3 flex-shrink-0"></i>
                            <span
                                class="text-gray-400 text-sm sm:text-base">{{ $settings['footer_phone'] ?? '+62 21 1234 5678' }}</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-envelope text-primary-500 mt-1 mr-3 flex-shrink-0"></i>
                            <span
                                class="text-gray-400 text-sm sm:text-base">{{ $settings['footer_email'] ?? 'info@ferryticket.com' }}</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-clock text-primary-500 mt-1 mr-3 flex-shrink-0"></i>
                            <span class="text-gray-400 text-sm sm:text-base">Dukungan Pelanggan: 24/7</span>
                        </li>
                    </ul>
                </div>

                <!-- Newsletter -->
                <div>
                    <h3 class="text-lg font-semibold mb-4 sm:mb-6">Berlangganan Buletin</h3>
                    <p class="text-gray-400 mb-4 text-sm sm:text-base">Dapatkan informasi terbaru tentang rute baru dan
                        penawaran khusus</p>
                    <form class="flex">
                        <input type="email" placeholder="Your email address"
                            class="px-3 sm:px-4 py-2 w-full rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 text-sm sm:text-base">
                        <button type="submit"
                            class="bg-primary-600 px-3 sm:px-4 py-2 rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 touch-target">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            </div>

            <div class="border-t border-gray-800 mt-10 sm:mt-16 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center">
                <p class="text-gray-400 text-sm sm:text-base">
                    {{ $settings['footer_copyright'] ?? '© ' . date('Y') . ' Ferry Ticket System. All rights reserved.' }}
                </p>
                <div class="mt-4 md:mt-0 flex items-center justify-center">
                    <img src="{{ asset('images/logo.png') }}" alt="Payment Methods"
                        class="h-16 sm:h-24 md:h-32">
                </div>
            </div>
        </div>
    </section>

    <!-- App Download Modal with SVG Blobs - Fixed Version -->
    <div id="appDownloadModal"
        class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center hidden">
        <div class="bg-white rounded-xl p-5 sm:p-8 max-w-md w-full mx-4 relative overflow-hidden modal-fade-in">
            <!-- Close button -->
            <button id="closeAppModal"
                class="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 z-20 bg-white bg-opacity-80 rounded-full w-8 h-8 flex items-center justify-center touch-target">
                <i class="fas fa-times text-xl"></i>
            </button>

            <!-- Background decorative blobs -->
            <div
                class="absolute -top-20 -left-16 w-64 h-64 bg-primary-100 rounded-full blur-2xl opacity-50 blob-animation">
            </div>
            <div class="absolute -bottom-20 -right-16 w-72 h-72 bg-secondary-100 rounded-full blur-2xl opacity-50 blob-animation"
                style="animation-delay: 1s;"></div>

            <div class="relative z-10">
                <!-- Header with wave decoration -->
                <div class="text-center mb-3 relative">
                    <div
                        class="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-primary-500 rounded-full flex items-center justify-center">
                        <i class="fas fa-mobile-alt text-2xl sm:text-4xl text-white"></i>
                        <!-- Small floating element -->
                        <svg class="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 text-primary-300"
                            viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M20.222 0c1.406 0 2.54 1.137 2.607 2.534V24l-2.677-2.273l-1.47-1.338l-1.604-1.398l.67 2.205H3.71c-1.402 0-2.54-1.065-2.54-2.476V2.534C1.17 1.137 2.31.003 3.715.003H20.22Z">
                            </path>
                        </svg>
                    </div>

                    <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Dapatkan Aplikasi Mobile Kami</h3>
                    <p class="text-gray-600 mb-1 text-sm sm:text-base">Rasakan pengalaman pemesanan feri yang lancar
                    </p>

                    <!-- Decorative wave -->
                    <svg class="w-full h-4 sm:h-6 text-primary-100" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0 10 C 30 4 70 4 100 10 L 100 0 L 0 0 Z" fill="currentColor"></path>
                    </svg>
                </div>

                <!-- Simple Two Tab Layout Instead of Swiper -->
                <div class="mb-6 mt-3">
                    <!-- Tab Navigation -->
                    <div class="flex border-b border-gray-200 mb-4">
                        <button id="app-tab-btn"
                            class="w-1/2 py-2 text-center text-sm font-medium text-primary-600 border-b-2 border-primary-500">
                            Fitur Aplikasi
                        </button>
                        <button id="download-tab-btn"
                            class="w-1/2 py-2 text-center text-sm font-medium text-gray-500 hover:text-gray-700">
                            Unduh Aplikasi
                        </button>
                    </div>

                    <!-- App Features Tab Content -->
                    <div id="app-features-content" class="block">
                        <div class="flex flex-col items-center">
                            <div class="relative mb-4 mt-2">
                                <!-- App screenshot in phone frame -->
                                <div class="relative mx-auto w-40 sm:w-48 h-auto phone-float">
                                    <div class="relative z-10 mx-auto">
                                        <!-- Phone Frame Outline -->
                                        <div
                                            class="relative rounded-xl overflow-hidden border-4 border-gray-800 w-full h-full shadow-lg">
                                            <!-- App Screenshot -->
                                            <img src="https://images.unsplash.com/photo-1606768666853-403c90a981ad?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3"
                                                alt="Ferry Ticket App" class="w-full h-auto">
                                            <!-- Home Button -->
                                            <div
                                                class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-800 rounded-full">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h4 class="text-base sm:text-lg font-semibold text-gray-800 mb-2">Pemesanan yang Cepat &
                                Mudah</h4>

                            <!-- App features list -->
                            <div class="bg-gray-50 rounded-lg p-3 w-full">
                                <ul class="text-xs sm:text-sm text-gray-600 space-y-2">
                                    <li class="flex items-start">
                                        <i class="fas fa-check-circle text-primary-500 mt-1 mr-2 flex-shrink-0"></i>
                                        <span>Jadwal feri secara real-time</span>
                                    </li>
                                    <li class="flex items-start">
                                        <i class="fas fa-check-circle text-primary-500 mt-1 mr-2 flex-shrink-0"></i>
                                        <span>Pembayaran mobile yang aman</span>
                                    </li>
                                    <li class="flex items-start">
                                        <i class="fas fa-check-circle text-primary-500 mt-1 mr-2 flex-shrink-0"></i>
                                        <span>Tiket digital untuk menaiki kapal feri</span>
                                    </li>
                                </ul>
                            </div>

                            <p class="text-xs text-center text-gray-500 mt-3">Klik “Unduh Aplikasi” untuk memulai</p>
                        </div>
                    </div>

                    <!-- Download Tab Content -->
                    <div id="download-content" class="hidden">
                        <div class="flex flex-col items-center">
                            <div class="relative bounce-animation mb-4 mt-2">
                                <!-- QR Code Container with styling -->
                                <div class="p-3 sm:p-4 bg-white border-2 border-primary-100 rounded-lg shadow-lg">
                                    <!-- QR code image -->
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://ferryticket.com/app"
                                        alt="Download App QR Code" class="h-32 w-32 sm:h-36 sm:w-36">
                                </div>

                                <!-- Phone icon indicator -->
                                <div
                                    class="absolute -top-2 -right-2 bg-primary-500 text-white p-1 sm:p-2 rounded-full">
                                    <i class="fas fa-qrcode text-sm sm:text-base"></i>
                                </div>
                            </div>

                            <p class="text-sm sm:text-base font-medium text-gray-700 mb-2">Pindai untuk mengunduh</p>
                            <p class="text-xs sm:text-sm text-gray-500 mb-4">Gunakan kamera ponsel Anda untuk memindai
                                kode QR ini
                            </p>

                            <!-- App store buttons -->
                            <div class="flex justify-center space-x-3 sm:space-x-4 mb-4">
                                <a href="#"
                                    class="flex items-center justify-center bg-black text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800 touch-target">
                                    <i class="fab fa-apple text-lg sm:text-xl mr-2"></i>
                                    <div class="text-left">
                                        <div class="text-xs">Unduh di</div>
                                        <div class="text-xs sm:text-sm font-semibold">App Store</div>
                                    </div>
                                </a>
                                <a href="#"
                                    class="flex items-center justify-center bg-black text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800 touch-target">
                                    <i class="fab fa-google-play text-lg sm:text-xl mr-2"></i>
                                    <div class="text-left">
                                        <div class="text-xs">Dapatkan di</div>
                                        <div class="text-xs sm:text-sm font-semibold">Google Play</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Benefits section -->
                <div class="bg-gray-50 rounded-lg p-3 sm:p-4 mb-2">
                    <h4 class="font-semibold text-gray-800 mb-2 flex items-center text-sm sm:text-base">
                        <i class="fas fa-star text-yellow-400 mr-2"></i>
                        Mengapa Memilih Aplikasi Kami
                    </h4>
                    <ul class="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-primary-500 mt-1 mr-2 flex-shrink-0"></i>
                            <span>Proses pemesanan lebih cepat</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-primary-500 mt-1 mr-2 flex-shrink-0"></i>
                            <span>Diskon eksklusif untuk ponsel</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-primary-500 mt-1 mr-2 flex-shrink-0"></i>
                            <span>Pembaruan status feri secara real-time</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script>
        // Mobile menu toggle and all existing script logic
        document.addEventListener('DOMContentLoaded', function() {
            const mobileMenuButton = document.querySelector('.mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');

            // Improved mobile menu toggle with animation
            mobileMenuButton.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
                // Change icon between hamburger and X
                const icon = this.querySelector('svg');
                if (mobileMenu.classList.contains('hidden')) {
                    icon.innerHTML =
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />';
                } else {
                    icon.innerHTML =
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />';
                }
            });

            // This is now handled in the navigation click events above

            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    if (!this.classList.contains('show-app-modal')) {
                        e.preventDefault();
                        const target = document.querySelector(this.getAttribute('href'));
                        if (target) {
                            // Adjust offset based on screen size
                            const offset = window.innerWidth < 640 ? 60 : 70;
                            window.scrollTo({
                                top: target.offsetTop - offset,
                                behavior: 'smooth'
                            });

                            // Note: Mobile menu closing is now handled by the nav link click handler
                        }
                    }
                });
            });

            // Improved navbar scroll behavior with transparency
            const navbar = document.getElementById('navbar');
            let lastScrollTop = 0;

            window.addEventListener('scroll', function() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                if (scrollTop > 50) {
                    navbar.classList.add('bg-white/95', 'shadow-md');
                    navbar.classList.remove('bg-white/80');

                    // Hide navbar when scrolling down, show when scrolling up (on mobile)
                    if (window.innerWidth < 640) {
                        if (scrollTop > lastScrollTop && scrollTop > 300) {
                            // Scrolling down
                            navbar.style.transform = 'translateY(-100%)';
                        } else {
                            // Scrolling up
                            navbar.style.transform = 'translateY(0)';
                        }
                    } else {
                        navbar.style.transform = '';
                    }
                } else {
                    navbar.classList.remove('bg-white/95', 'shadow-md');
                    navbar.classList.add('bg-white/80');
                    navbar.style.transform = '';
                }
                lastScrollTop = scrollTop;
            });

            // Responsive handling for resize events
            window.addEventListener('resize', function() {
                if (window.innerWidth >= 640) {
                    mobileMenu.classList.add('hidden');
                    const icon = mobileMenuButton.querySelector('svg');
                    icon.innerHTML =
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />';
                    navbar.style.transform = '';
                }
            });

            // App download modal functionality
            const appDownloadModal = document.getElementById('appDownloadModal');
            const closeAppModal = document.getElementById('closeAppModal');
            const appTabBtn = document.getElementById('app-tab-btn');
            const downloadTabBtn = document.getElementById('download-tab-btn');
            const appFeaturesContent = document.getElementById('app-features-content');
            const downloadContent = document.getElementById('download-content');

            // Tab switching functionality
            function showAppFeatures() {
                appFeaturesContent.classList.remove('hidden');
                appFeaturesContent.classList.add('block');
                downloadContent.classList.add('hidden');
                downloadContent.classList.remove('block');

                appTabBtn.classList.add('text-primary-600', 'border-b-2', 'border-primary-500');
                appTabBtn.classList.remove('text-gray-500');

                downloadTabBtn.classList.remove('text-primary-600', 'border-b-2', 'border-primary-500');
                downloadTabBtn.classList.add('text-gray-500');
            }

            function showDownloadOptions() {
                downloadContent.classList.remove('hidden');
                downloadContent.classList.add('block');
                appFeaturesContent.classList.add('hidden');
                appFeaturesContent.classList.remove('block');

                downloadTabBtn.classList.add('text-primary-600', 'border-b-2', 'border-primary-500');
                downloadTabBtn.classList.remove('text-gray-500');

                appTabBtn.classList.remove('text-primary-600', 'border-b-2', 'border-primary-500');
                appTabBtn.classList.add('text-gray-500');
            }

            // Add click event listeners to tabs
            if (appTabBtn) {
                appTabBtn.addEventListener('click', showAppFeatures);
            }

            if (downloadTabBtn) {
                downloadTabBtn.addEventListener('click', showDownloadOptions);
            }

            // Function to show the app download modal
            function showAppDownloadModal(e) {
                e.preventDefault(); // Prevent the default link behavior
                appDownloadModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open

                // Reset to first tab when opening modal
                if (appTabBtn && appFeaturesContent) {
                    showAppFeatures();
                }
            }

            // Add click event listeners to all elements with the show-app-modal class
            document.querySelectorAll('.show-app-modal').forEach(button => {
                button.addEventListener('click', showAppDownloadModal);
            });

            // Close modal when the close button is clicked
            if (closeAppModal) {
                closeAppModal.addEventListener('click', function() {
                    appDownloadModal.classList.add('hidden');
                    document.body.style.overflow = ''; // Re-enable scrolling
                });
            }

            // Close modal when clicking outside the modal content
            if (appDownloadModal) {
                appDownloadModal.addEventListener('click', function(e) {
                    if (e.target === appDownloadModal) {
                        appDownloadModal.classList.add('hidden');
                        document.body.style.overflow = '';
                    }
                });
            }

            // Close modal with Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && appDownloadModal && !appDownloadModal.classList.contains(
                        'hidden')) {
                    appDownloadModal.classList.add('hidden');
                    document.body.style.overflow = '';
                }
            });

            // Function to set active navigation link
            function setActiveNavLink(sectionId) {
                // Desktop menu
                document.querySelectorAll('#desktop-menu .nav-link').forEach(link => {
                    // Remove active classes
                    link.classList.remove('border-primary-500', 'text-gray-900');
                    link.classList.add('border-transparent', 'text-gray-500');

                    // Add active classes if this link matches the current section
                    if (link.getAttribute('data-section') === sectionId) {
                        link.classList.remove('border-transparent', 'text-gray-500');
                        link.classList.add('border-primary-500', 'text-gray-900');
                    }
                });

                // Mobile menu
                document.querySelectorAll('#mobile-nav-links .mobile-nav-link').forEach(link => {
                    // Remove active classes
                    link.classList.remove('bg-primary-50', 'border-primary-500', 'text-primary-700');
                    link.classList.add('border-transparent', 'text-gray-500');

                    // Add active classes if this link matches the current section
                    if (link.getAttribute('data-section') === sectionId) {
                        link.classList.remove('border-transparent', 'text-gray-500');
                        link.classList.add('bg-primary-50', 'border-primary-500', 'text-primary-700');
                    }
                });
            }

            // Handle click events on navigation links
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    // Get section ID and update active link
                    const sectionId = this.getAttribute('data-section');
                    setActiveNavLink(sectionId);

                    // Optional: Close mobile menu when a link is clicked
                    if (this.classList.contains('mobile-nav-link')) {
                        mobileMenu.classList.add('hidden');
                        const icon = mobileMenuButton.querySelector('svg');
                        icon.innerHTML =
                            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />';
                    }
                });
            });

            // Update active link on scroll - improved version
            const sections = document.querySelectorAll('section[id]');

            function updateActiveSection() {
                const scrollPosition = window.scrollY + 150; // Adjust offset to trigger sooner

                // Find the current section
                let currentSection = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionBottom = sectionTop + section.offsetHeight;

                    // Check if we're in this section
                    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                        currentSection = section.getAttribute('id');
                    }
                });

                // If we're at the very top of the page, select the first section
                if (window.scrollY < 50) {
                    currentSection = 'home';
                }

                // If we're at the very bottom of the page, select the last section
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
                    currentSection = 'contact';
                }

                // Update navigation highlighting if we have a valid section
                if (currentSection) {
                    setActiveNavLink(currentSection);
                }
            }

            // Set first active section on page load
            window.addEventListener('load', updateActiveSection);

            // Update on scroll with throttling for better performance
            let scrollThrottleTimer;
            window.addEventListener('scroll', function() {
                if (!scrollThrottleTimer) {
                    scrollThrottleTimer = setTimeout(function() {
                        updateActiveSection();
                        scrollThrottleTimer = null;
                    }, 100); // Throttle to 100ms
                }
            });
        });
    </script>
</body>

</html>
