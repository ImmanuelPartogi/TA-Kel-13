<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Ferry Booking System') }} - Login</title>

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
                        admin: {
                            DEFAULT: '#dc2626',
                            dark: '#b91c1c',
                            light: '#f87171',
                        },
                        operator: {
                            DEFAULT: '#0284c7',
                            dark: '#0369a1',
                            light: '#7dd3fc',
                        },
                    },
                    backgroundImage: {
                        'ferry-pattern': "url('https://img.freepik.com/free-vector/sea-background-video-conferencing_23-2148627754.jpg')",
                    }
                }
            }
        }
    </script>

    <!-- Font Awesome for icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="font-poppins bg-slate-100 min-h-screen">
    <div class="min-h-screen flex flex-col">
        <!-- Simple navbar -->
        <nav class="bg-white shadow-sm">
            <div class="container mx-auto px-6 py-3">
                <div class="flex justify-between items-center">
                    <div class="flex items-center">
                        <i class="fas fa-ship text-blue-600 text-2xl mr-3"></i>
                        <span class="text-xl font-bold text-gray-800">{{ config('app.name', 'Ferry Booking System') }}</span>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main content -->
        <main class="flex-grow flex items-center justify-center p-4">
            @yield('content')
        </main>

        <!-- Footer -->
        <footer class="bg-white shadow-inner py-4">
            <div class="container mx-auto px-6">
                <div class="text-center text-gray-500 text-sm">
                    &copy; {{ date('Y') }} {{ config('app.name', 'Ferry Booking System') }}. All rights reserved.
                </div>
            </div>
        </footer>
    </div>

    @yield('scripts')
</body>
</html>
