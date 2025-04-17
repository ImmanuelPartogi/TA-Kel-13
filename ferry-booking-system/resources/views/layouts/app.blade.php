<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Ferry Ticket System') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=nunito:400,500,600,700&display=swap" rel="stylesheet" />

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Swiper CSS & JS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Swiper/8.4.5/swiper-bundle.min.css" />
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
        @include('layouts.partials.styles')
    @endif
</head>

<body class="bg-gray-50 font-sans {{ Auth::guard('admin')->check() ? 'admin' : (Auth::guard('operator')->check() ? 'operator' : '') }}">
    <div class="flex h-screen overflow-hidden">
        <!-- Sidebar Component -->
        @include('layouts.partials.sidebar')

        <!-- Content area -->
        <div class="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
            <!-- Top navbar Component -->
            @include('layouts.partials.header')

            <!-- Main content -->
            <main class="flex-1 overflow-y-auto bg-gray-50 p-4">
                @yield('content')
            </main>

            <!-- Footer Component (if needed) -->
            @include('layouts.partials.footer')
        </div>
    </div>

    <!-- Alpine.js for dropdowns and sidebar -->
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>

    <!-- Include common scripts -->
    @include('layouts.partials.scripts')

    <!-- Page specific scripts -->
    @yield('scripts')
</body>
</html>
