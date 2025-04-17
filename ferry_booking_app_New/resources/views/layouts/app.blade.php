<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Ferry Ticket System</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=nunito:400,500,600,700&display=swap" rel="stylesheet" />
    <!-- Add Swiper CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Swiper/8.4.5/swiper-bundle.min.css" />
    <!-- Add Swiper JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Swiper/8.4.5/swiper-bundle.min.js"></script>

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

<body
    class="bg-gray-50 font-sans {{ Auth::guard('admin')->check() ? 'admin' : (Auth::guard('operator')->check() ? 'operator' : '') }}">
    <div class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <div id="sidebar"
            class="fixed inset-y-0 left-0 z-30 w-64 transform transition duration-300 ease-in-out md:translate-x-0 -translate-x-full bg-gray-900 text-white">
            <!-- Sidebar Header -->
            <div
                class="{{ Auth::guard('admin')->check() ? 'bg-indigo-700' : (Auth::guard('operator')->check() ? 'bg-blue-700' : 'bg-blue-700') }} py-4 px-4">
                <div class="flex items-center justify-center">
                    <i class="fas fa-ship text-2xl mr-2"></i>
                    <h1 class="text-xl font-bold tracking-wider">{{ config('app.name', 'Ferry Booking') }}</h1>
                </div>
            </div>

            <!-- Sidebar Menu -->
            <div class="py-4 h-full flex flex-col">
                <nav class="px-4 flex-grow">
                    @if (Auth::guard('admin')->check())
                        <!-- Admin Menu -->
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">ADMIN MENU</p>
                        <a href="{{ route('admin.dashboard') }}"
                            class="flex items-center py-2.5 px-4 mb-1 rounded-lg {{ request()->routeIs('admin.dashboard') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }}">
                            <i class="fas fa-tachometer-alt w-5 text-center"></i>
                            <span class="ml-3">Dashboard</span>
                        </a>
                        <a href="{{ route('admin.routes.index') }}"
                            class="flex items-center py-2.5 px-4 mb-1 rounded-lg {{ request()->routeIs('admin.routes.*') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }}">
                            <i class="fas fa-route w-5 text-center"></i>
                            <span class="ml-3">Rute</span>
                        </a>
                        <a href="{{ route('admin.ferries.index') }}"
                            class="flex items-center py-2.5 px-4 mb-1 rounded-lg {{ request()->routeIs('admin.ferries.*') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }}">
                            <i class="fas fa-ship w-5 text-center"></i>
                            <span class="ml-3">Kapal</span>
                        </a>
                        <a href="{{ route('admin.schedules.index') }}"
                            class="flex items-center py-2.5 px-4 mb-1 rounded-lg {{ request()->routeIs('admin.schedules.*') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }}">
                            <i class="fas fa-calendar-alt w-5 text-center"></i>
                            <span class="ml-3">Jadwal</span>
                        </a>
                        <a href="{{ route('admin.bookings.index') }}"
                            class="flex items-center py-2.5 px-4 mb-1 rounded-lg {{ request()->routeIs('admin.bookings.*') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }}">
                            <i class="fas fa-ticket-alt w-5 text-center"></i>
                            <span class="ml-3">Booking</span>
                        </a>
                        <a href="{{ route('admin.reports.index') }}"
                            class="flex items-center py-2.5 px-4 mb-1 rounded-lg {{ request()->routeIs('admin.reports.*') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }}">
                            <i class="fas fa-chart-bar w-5 text-center"></i>
                            <span class="ml-3">Laporan</span>
                        </a>
                        <a href="{{ route('admin.users.index') }}"
                            class="flex items-center py-2.5 px-4 mb-1 rounded-lg {{ request()->routeIs('admin.users.*') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }}">
                            <i class="fas fa-users w-5 text-center"></i>
                            <span class="ml-3">Pengguna</span>
                        </a>

                        @if (auth()->guard('admin')->user()->is_super_admin ?? false)
                            <div x-data="{ open: {{ request()->routeIs('admin.admins.*') || request()->routeIs('admin.operators.*') ? 'true' : 'false' }} }">
                                <button @click="open = !open"
                                    class="flex items-center w-full py-2.5 px-4 mb-1 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white">
                                    <i class="fas fa-user-cog w-5 text-center"></i>
                                    <span class="ml-3">Manajemen Admin</span>
                                    <i class="fas fa-angle-down ml-auto" :class="{ 'transform rotate-180': open }"></i>
                                </button>
                                <div x-show="open" class="pl-4 mt-1">
                                    <a href="{{ route('admin.admins.index') }}"
                                        class="flex items-center py-2 px-4 rounded-lg {{ request()->routeIs('admin.admins.*') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }}">
                                        <i class="fas fa-user-shield w-5 text-center"></i>
                                        <span class="ml-3">Admin</span>
                                    </a>
                                    <a href="{{ route('admin.operators.index') }}"
                                        class="flex items-center py-2 px-4 rounded-lg {{ request()->routeIs('admin.operators.*') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }}">
                                        <i class="fas fa-user-tie w-5 text-center"></i>
                                        <span class="ml-3">Operator</span>
                                    </a>
                                </div>
                            </div>
                        @endif
                    @elseif(Auth::guard('operator')->check())
                        <!-- Operator Menu -->
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">OPERATOR MENU</p>
                        <a href="{{ route('operator.dashboard') }}"
                            class="flex items-center py-2.5 px-4 mb-1 rounded-lg {{ request()->routeIs('operator.dashboard') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }}">
                            <i class="fas fa-tachometer-alt w-5 text-center"></i>
                            <span class="ml-3">Dashboard</span>
                        </a>
                        <a href="{{ route('operator.schedules.index') }}"
                            class="flex items-center py-2.5 px-4 mb-1 rounded-lg {{ request()->routeIs('operator.schedules.*') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }}">
                            <i class="fas fa-calendar-alt w-5 text-center"></i>
                            <span class="ml-3">Jadwal</span>
                        </a>
                        <a href="{{ route('operator.bookings.index') }}"
                            class="flex items-center py-2.5 px-4 mb-1 rounded-lg {{ request()->routeIs('operator.bookings.*') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }}">
                            <i class="fas fa-ticket-alt w-5 text-center"></i>
                            <span class="ml-3">Booking</span>
                        </a>
                        <a href="{{ route('operator.bookings.check-in') }}"
                            class="flex items-center py-2.5 px-4 mb-1 rounded-lg {{ request()->routeIs('operator.bookings.check-in') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }}">
                            <i class="fas fa-clipboard-check w-5 text-center"></i>
                            <span class="ml-3">Check-in</span>
                        </a>
                        <a href="{{ route('operator.reports.index') }}"
                            class="flex items-center py-2.5 px-4 mb-1 rounded-lg {{ request()->routeIs('operator.reports.*') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white' }}">
                            <i class="fas fa-chart-bar w-5 text-center"></i>
                            <span class="ml-3">Laporan</span>
                        </a>
                    @else
                        <!-- Guest Menu -->
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">LOGIN SEBAGAI</p>
                        <a href="{{ route('admin.login') }}"
                            class="flex items-center py-2.5 px-4 mb-1 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white">
                            <i class="fas fa-user-shield w-5 text-center"></i>
                            <span class="ml-3">Admin</span>
                        </a>
                        <a href="{{ route('operator.login') }}"
                            class="flex items-center py-2.5 px-4 mb-1 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white">
                            <i class="fas fa-user-tie w-5 text-center"></i>
                            <span class="ml-3">Operator</span>
                        </a>
                    @endif
                </nav>

                <!-- Sidebar Footer -->
                @if (Auth::guard('admin')->check() || Auth::guard('operator')->check())
                    <div class="mt-auto px-4 py-4 border-t border-gray-800">
                        <div class="flex items-center pb-3">
                            <div class="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                                <i class="fas fa-user text-gray-300"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-white">
                                    {{ Auth::guard('admin')->check() ? Auth::guard('admin')->user()->name : (Auth::guard('operator')->check() ? Auth::guard('operator')->user()->name : '') }}
                                </p>
                                <p class="text-xs text-gray-400">
                                    {{ Auth::guard('admin')->check() ? 'Admin' : 'Operator' }}</p>
                            </div>
                        </div>
                        @if (Auth::guard('admin')->check())
                            <form id="logout-form" action="{{ route('admin.logout') }}" method="POST">
                                @csrf
                                <button type="submit"
                                    class="w-full flex items-center justify-center py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-colors">
                                    <i class="fas fa-sign-out-alt mr-2"></i> Logout
                                </button>
                            </form>
                        @elseif(Auth::guard('operator')->check())
                            <form id="logout-form" action="{{ route('operator.logout') }}" method="POST">
                                @csrf
                                <button type="submit"
                                    class="w-full flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors">
                                    <i class="fas fa-sign-out-alt mr-2"></i> Logout
                                </button>
                            </form>
                        @endif
                    </div>
                @endif
            </div>
        </div>

        <!-- Content area -->
        <div class="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
            <!-- Top navbar -->
            <header class="bg-white shadow-sm border-b border-gray-200">
                <div class="flex items-center justify-between h-16 px-4">
                    <!-- Mobile hamburger button -->
                    <button id="sidebarToggle" type="button" class="text-gray-600 md:hidden">
                        <i class="fas fa-bars text-xl"></i>
                    </button>

                    <!-- Page title -->
                    <h2 class="text-lg font-medium text-gray-800 md:ml-0 ml-4">
                        @if (Auth::guard('admin')->check())
                            Admin Panel
                        @elseif(Auth::guard('operator')->check())
                            Operator Panel
                        @else
                            Ferry Booking System
                        @endif
                    </h2>

                    <!-- Right side user menu -->
                    <div class="flex items-center">
                        @if (Auth::guard('admin')->check() || Auth::guard('operator')->check())
                            <div class="text-right">
                                <span class="hidden md:inline-block text-sm font-medium text-gray-700">Selamat
                                    datang,</span>
                                <span class="hidden md:block text-xs text-gray-500">
                                    {{ Auth::guard('admin')->check() ? Auth::guard('admin')->user()->name : (Auth::guard('operator')->check() ? Auth::guard('operator')->user()->name : '') }}
                                </span>
                            </div>
                        @endif
                    </div>
                </div>
            </header>

            <!-- Main content -->
            <main class="flex-1 overflow-y-auto bg-gray-50 p-4">
                @yield('content')
            </main>
        </div>
    </div>

    <!-- Alpine.js for dropdowns and sidebar -->
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const sidebarToggle = document.getElementById('sidebarToggle');
            const sidebar = document.getElementById('sidebar');

            if (sidebarToggle && sidebar) {
                sidebarToggle.addEventListener('click', function() {
                    if (sidebar.classList.contains('-translate-x-full')) {
                        sidebar.classList.remove('-translate-x-full');
                        sidebar.classList.add('translate-x-0');
                    } else {
                        sidebar.classList.remove('translate-x-0');
                        sidebar.classList.add('-translate-x-full');
                    }
                });
            }

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', function(event) {
                const windowWidth = window.innerWidth;
                if (windowWidth < 768 && !sidebar.contains(event.target) && !sidebarToggle.contains(event
                        .target)) {
                    sidebar.classList.remove('translate-x-0');
                    sidebar.classList.add('-translate-x-full');
                }
            });
        });
    </script>

    @yield('scripts')
</body>

</html>
