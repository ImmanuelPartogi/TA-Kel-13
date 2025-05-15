<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Ferry Ticket System') }} - Authentication</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=nunito:400,500,600,700&display=swap" rel="stylesheet" />

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Styles -->
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
                            'admin': {
                                DEFAULT: '#4f46e5',
                                'light': '#e0e7ff',
                                'dark': '#4338ca',
                            },
                            'operator': {
                                DEFAULT: '#0ea5e9',
                                'light': '#e0f2fe',
                                'dark': '#0284c7',
                            }
                        }
                    }
                }
            }
        </script>
        @include('layouts.partials.styles')
    @endif

    <style>
        .auth-background {
            background-color: #f9fafb;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .wave-animation {
            animation: wave 8s ease-in-out infinite;
        }

        @keyframes wave {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-15px);
            }
        }
    </style>
</head>

<body class="font-sans auth-background min-h-screen flex flex-col">
    <div class="flex flex-col items-center justify-center min-h-screen p-4">
        <!-- Logo and App Name -->
        <div class="mb-8 text-center">
            <div class="inline-block mb-4">
                <!-- Logo -->
                <div class="flex items-center justify-center h-16 w-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full mx-auto shadow-lg">
                    <i class="fas fa-ship text-white text-2xl wave-animation"></i>
                </div>
            </div>
            <h1 class="text-2xl font-bold text-gray-800">{{ config('app.name', 'Ferry Ticket System') }}</h1>
            <p class="text-gray-500">Sistem Pemesanan Tiket Kapal Ferry</p>
        </div>

        <!-- Content Container -->
        <div class="w-full max-w-md">
            @yield('content')
        </div>

        <!-- Footer -->
        <div class="mt-8 text-center text-gray-500 text-sm">
            <p>&copy; {{ date('Y') }} {{ config('app.name', 'Ferry Ticket System') }}. All rights reserved.</p>
            <div class="mt-2 flex justify-center space-x-4">
                <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <i class="fab fa-twitter"></i>
                </a>
                <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <i class="fab fa-instagram"></i>
                </a>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    @yield('scripts')
</body>
</html>
