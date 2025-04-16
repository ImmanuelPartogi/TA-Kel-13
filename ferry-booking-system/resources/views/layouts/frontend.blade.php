<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Ferry Booking System') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        'poppins': ['Poppins', 'sans-serif'],
                    },
                    colors: {
                        primary: {
                            DEFAULT: '#2563eb',
                            dark: '#1d4ed8',
                        }
                    }
                }
            }
        }
    </script>

    <!-- Font Awesome for icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 font-poppins text-gray-800 antialiased">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm fixed w-full z-10">
        <div class="container mx-auto px-4">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="{{ route('home') }}" class="flex items-center">
                        <i class="fas fa-ship text-blue-600 text-2xl mr-2"></i>
                        <span class="text-xl font-bold text-blue-600">{{ config('app.name', 'Ferry Booking') }}</span>
                    </a>
                </div>

                <div class="hidden md:flex items-center space-x-4">
                    <a href="{{ route('home') }}" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Beranda</a>
                    <a href="{{ route('schedules') }}" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Jadwal</a>
                    <a href="{{ route('contact') }}" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Hubungi Kami</a>

                    <a href="{{ route('admin.login') }}" class="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium">Admin</a>
                    <a href="{{ route('operator.login') }}" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">Operator</a>
                </div>

                <div class="md:hidden flex items-center">
                    <button class="mobile-menu-button text-gray-700 hover:text-blue-600 focus:outline-none">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile menu -->
        <div class="mobile-menu hidden md:hidden">
            <a href="{{ route('home') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Beranda</a>
            <a href="{{ route('schedules') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Jadwal</a>
            <a href="{{ route('contact') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Hubungi Kami</a>
            <a href="{{ route('admin.login') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin</a>
            <a href="{{ route('operator.login') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Operator</a>
        </div>
    </nav>

    <!-- Main Content -->
    <main>
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="bg-blue-900 text-white py-8">
        <div class="container mx-auto px-4">
            <div class="flex flex-col md:flex-row justify-between">
                <div class="mb-6 md:mb-0">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-ship text-white text-2xl mr-2"></i>
                        <span class="text-xl font-bold">{{ config('app.name', 'Ferry Booking') }}</span>
                    </div>
                    <p class="text-blue-200 max-w-md">Sistem pemesanan tiket kapal ferry yang memudahkan Anda untuk bepergian antar pulau dengan nyaman dan aman.</p>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <div>
                        <h3 class="text-lg font-medium mb-4">Perusahaan</h3>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-blue-200 hover:text-white">Tentang Kami</a></li>
                            <li><a href="#" class="text-blue-200 hover:text-white">Kebijakan Privasi</a></li>
                            <li><a href="#" class="text-blue-200 hover:text-white">Syarat & Ketentuan</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="text-lg font-medium mb-4">Bantuan</h3>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-blue-200 hover:text-white">FAQ</a></li>
                            <li><a href="#" class="text-blue-200 hover:text-white">Hubungi Kami</a></li>
                            <li><a href="#" class="text-blue-200 hover:text-white">Cara Pemesanan</a></li>
                        </ul>
                    </div>

                    <div class="col-span-2 md:col-span-1">
                        <h3 class="text-lg font-medium mb-4">Sosial Media</h3>
                        <div class="flex space-x-4">
                            <a href="#" class="text-blue-200 hover:text-white text-xl"><i class="fab fa-facebook"></i></a>
                            <a href="#" class="text-blue-200 hover:text-white text-xl"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="text-blue-200 hover:text-white text-xl"><i class="fab fa-instagram"></i></a>
                            <a href="#" class="text-blue-200 hover:text-white text-xl"><i class="fab fa-youtube"></i></a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="border-t border-blue-800 mt-8 pt-6 text-center md:text-left">
                <p class="text-blue-300">&copy; {{ date('Y') }} {{ config('app.name', 'Ferry Booking System') }}. All Rights Reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script>
        // Mobile menu toggle
        document.addEventListener('DOMContentLoaded', function() {
            const mobileMenuButton = document.querySelector('.mobile-menu-button');
            const mobileMenu = document.querySelector('.mobile-menu');

            if (mobileMenuButton && mobileMenu) {
                mobileMenuButton.addEventListener('click', function() {
                    mobileMenu.classList.toggle('hidden');
                });
            }
        });
    </script>

    @yield('scripts')
</body>
</html>
