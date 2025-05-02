<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Admin Panel') - Ferry Ticket System</title>

    <!-- Scripts & Styles -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">

    <!-- Tailwind Config -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        'sans': ['Poppins', 'sans-serif']
                    },
                    colors: {
                        'primary': {
                            50: '#f0f5ff', // Biru sangat terang
                            100: '#e1eaff', // Biru pastel terang
                            200: '#c8d9ff', // Biru muda cerah
                            300: '#a4c1ff', // Biru langit cerah
                            400: '#81a8ff', // Biru royale muda
                            500: '#5e8eff', // Biru royale cerah
                            600: '#4470f4', // Biru royale klasik
                            700: '#3459db', // Biru royale kuat
                            800: '#2c47b8', // Biru kuat dalam
                            900: '#263a94', // Biru tua kuat
                        },
                        'secondary': {
                            50: '#edf8ff', // Biru es cerah
                            100: '#dbf0ff', // Biru air terang
                            200: '#bde4ff', // Biru langit terang
                            300: '#94d3ff', // Biru laut cerah
                            400: '#65bdff', // Biru laut vibrant
                            500: '#3aa3ff', // Biru laut kuat
                            600: '#2186f0', // Biru laut klasik
                            700: '#1a6ed6', // Biru laut dalam
                            800: '#1958b0', // Biru laut tua
                            900: '#174890', // Biru laut sangat tua
                        }
                    },
                    animation: {
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        'float': 'float 6s ease-in-out infinite',
                        'float-slow': 'float 8s ease-in-out infinite',
                        'drift': 'drift 10s ease-in-out infinite',
                        'spin-slow': 'spin 15s linear infinite',
                        'morph': 'morph 10s ease-in-out infinite',
                        'morph-slow': 'morph 15s ease-in-out infinite',
                        'waves': 'waves 12s ease-in-out infinite',
                        'bounce-slow': 'bounce-slow 8s ease-in-out infinite',
                        'drift-right': 'drift-right 12s ease-in-out infinite',
                        'drift-left': 'drift-left 12s ease-in-out infinite',
                    }
                }
            }
        }
    </script>

    <!-- Custom styles -->
    <style>
        [x-cloak] {
            display: none !important;
        }

        /* Scrollbar Styles */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-track {
            background: #f1f5f9;
        }

        ::-webkit-scrollbar-thumb {
            background: #94a3b8;
            border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #64748b;
        }

        /* Animation classes */
        .nav-item {
            transition: all 0.2s ease;
        }

        .nav-item:hover {
            transform: translateX(5px);
        }

        .nav-icon {
            transition: all 0.2s ease;
        }

        .nav-item:hover .nav-icon {
            transform: scale(1.2);
        }

        .alert-fade {
            animation: fadeOut 5s forwards;
        }

        @keyframes fadeOut {
            90% {
                opacity: 1;
            }

            100% {
                opacity: 0;
            }
        }

        /* Blob Animations */
        @keyframes float {
            0% {
                transform: translateY(0px);
            }

            50% {
                transform: translateY(-15px);
            }

            100% {
                transform: translateY(0px);
            }
        }

        @keyframes drift {
            0% {
                transform: translate(0px, 0px);
            }

            25% {
                transform: translate(10px, -5px);
            }

            50% {
                transform: translate(0px, -10px);
            }

            75% {
                transform: translate(-10px, -5px);
            }

            100% {
                transform: translate(0px, 0px);
            }
        }

        @keyframes morph {
            0% {
                border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            }

            50% {
                border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            }

            100% {
                border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            }
        }

        @keyframes waves {
            0% {
                transform: scaleY(1) scaleX(1);
            }

            25% {
                transform: scaleY(1.05) scaleX(0.95);
            }

            50% {
                transform: scaleY(0.95) scaleX(1.05);
            }

            75% {
                transform: scaleY(1.05) scaleX(0.95);
            }

            100% {
                transform: scaleY(1) scaleX(1);
            }
        }

        @keyframes bounce-slow {

            0%,
            100% {
                transform: translateY(-5%);
                animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
            }

            50% {
                transform: translateY(0);
                animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
            }
        }

        @keyframes drift-right {
            0% {
                transform: translateX(0);
            }

            50% {
                transform: translateX(15px);
            }

            100% {
                transform: translateX(0);
            }
        }

        @keyframes drift-left {
            0% {
                transform: translateX(0);
            }

            50% {
                transform: translateX(-15px);
            }

            100% {
                transform: translateX(0);
            }
        }

        .animate-float {
            animation: float 6s ease-in-out infinite;
        }

        .animate-float-slow {
            animation: float 8s ease-in-out infinite;
        }

        .animate-drift {
            animation: drift 10s ease-in-out infinite;
        }

        .animate-spin-slow {
            animation: spin 15s linear infinite;
        }

        .animate-morph {
            animation: morph 10s ease-in-out infinite;
        }

        .animate-morph-slow {
            animation: morph 15s ease-in-out infinite;
        }

        .animate-waves {
            animation: waves 12s ease-in-out infinite;
        }

        .animate-bounce-slow {
            animation: bounce-slow 8s ease-in-out infinite;
        }

        .animate-drift-right {
            animation: drift-right 12s ease-in-out infinite;
        }

        .animate-drift-left {
            animation: drift-left 12s ease-in-out infinite;
        }

        .blob-wrapper {
            overflow: hidden;
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 0;
            pointer-events: none;
        }

        .content-wrapper {
            position: relative;
            z-index: 10;
        }

        .blob {
            transform-origin: center center;
            will-change: transform;
        }
    </style>

    @yield('styles')
</head>

<body class="bg-gray-50 font-sans">
    <div x-data="{ sidebarOpen: false }" class="min-h-screen flex">
        <!-- Mobile sidebar backdrop -->
        <div x-cloak x-show="sidebarOpen" x-transition:enter="transition-opacity ease-linear duration-300"
            x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100"
            x-transition:leave="transition-opacity ease-linear duration-300" x-transition:leave-start="opacity-100"
            x-transition:leave-end="opacity-0" class="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75"
            @click="sidebarOpen = false" aria-hidden="true">
        </div>

        <!-- Mobile sidebar panel -->
        <div x-cloak x-show="sidebarOpen" x-transition:enter="transition ease-in-out duration-300 transform"
            x-transition:enter-start="-translate-x-full" x-transition:enter-end="translate-x-0"
            x-transition:leave="transition ease-in-out duration-300 transform" x-transition:leave-start="translate-x-0"
            x-transition:leave-end="-translate-x-full" class="fixed inset-y-0 left-0 z-40 w-64 flex flex-col lg:hidden">

            <!-- Close button -->
            <div class="absolute top-0 right-0 -mr-12 pt-2">
                <button type="button"
                    class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    @click="sidebarOpen = false">
                    <span class="sr-only">Close sidebar</span>
                    <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Sidebar content -->
            <div
                class="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-primary-900 to-primary-700 shadow-xl overflow-y-auto relative">
                <!-- Blob background for mobile sidebar -->
                <div class="blob-wrapper opacity-30">
                    <svg class="absolute blob animate-drift" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                        style="width: 300px; right: -150px; top: -50px">
                        <path fill="#FFFFFF"
                            d="M43.6,-57.3C56.1,-49.8,65.8,-35.6,71.7,-19.4C77.7,-3.2,79.9,14.9,73.8,29.4C67.6,44,53.2,55,37.5,61.5C21.9,68,4.9,70.1,-11.3,68.1C-27.5,66.1,-43.1,60,-55.8,48.5C-68.5,37,-78.4,20.1,-78.1,3.5C-77.8,-13,-67.3,-26,-56.5,-35.4C-45.7,-44.8,-34.7,-50.5,-23.4,-57.9C-12.1,-65.3,-0.6,-74.5,9.5,-72.8C19.6,-71.1,31.2,-64.8,43.6,-57.3Z"
                            transform="translate(100 100)" />
                    </svg>
                    <svg class="absolute blob animate-morph" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                        style="width: 300px; left: -150px; bottom: 100px">
                        <path fill="#FFFFFF"
                            d="M35.6,-53.8C45.4,-44.9,52.6,-33.3,58.5,-20C64.5,-6.7,69.2,8.3,67.1,22.7C64.9,37.1,56.1,51,43.3,58.2C30.6,65.5,15.3,66.2,0.8,65C-13.6,63.9,-27.3,61,-39.3,53.7C-51.3,46.4,-61.7,34.6,-67.3,20.2C-72.9,5.9,-73.6,-11,-67.8,-25.4C-61.9,-39.8,-49.4,-51.7,-36,-59.1C-22.5,-66.4,-8.1,-69.2,2.9,-68.1C14,-67,25.9,-62.8,35.6,-53.8Z"
                            transform="translate(100 100)" />
                    </svg>
                    <svg class="absolute blob animate-waves" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                        style="width: 200px; right: -50px; bottom: 200px">
                        <path fill="#FFFFFF"
                            d="M48.2,-71.1C59.4,-61.9,63.6,-43.1,67.2,-25.7C70.9,-8.4,74,7.6,69.7,20.8C65.4,33.9,53.6,44.2,40.9,52.8C28.1,61.4,14.1,68.3,-1.2,69.9C-16.5,71.5,-33,67.7,-46.9,59C-60.8,50.3,-72.1,36.7,-75.6,21.3C-79.1,6,-74.9,-11.1,-65.8,-23.2C-56.6,-35.3,-42.5,-42.6,-29.6,-51.2C-16.6,-59.8,-4.9,-69.8,8.9,-74.9C22.7,-80,45.5,-80.2,48.2,-71.1Z"
                            transform="translate(100 100)" />
                    </svg>
                </div>

                <div class="content-wrapper">
                    <div class="flex-shrink-0 flex items-center px-4 py-5">
                        <img class="h-10 w-auto" src="{{ asset('images/logo.png') }}" alt="Ferry Ticket">
                        <span class="ml-3 text-xl font-semibold text-white">Ferry Admin</span>
                    </div>
                    <div class="mt-2 flex-1 px-2">
                        <!-- Navigation menu from partials -->
                        <nav class="space-y-1">
                            @php
                                $isAdmin = Auth::guard('admin')->check();
                                $isOperator = Auth::guard('operator')->check();
                            @endphp

                            @if ($isAdmin)
                                <!-- Dashboard -->
                                <a href="{{ route('admin.dashboard') }}"
                                    class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.dashboard') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                    <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                        <i class="fas fa-tachometer-alt"></i>
                                    </div>
                                    <span>Dashboard</span>
                                </a>

                                <!-- Routes -->
                                <a href="{{ route('admin.routes.index') }}"
                                    class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.routes.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                    <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                        <i class="fas fa-route"></i>
                                    </div>
                                    <span>Routes</span>
                                </a>

                                <!-- Vessels -->
                                <a href="{{ route('admin.ferries.index') }}"
                                    class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.vessels.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                    <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                        <i class="fas fa-ship"></i>
                                    </div>
                                    <span>Vessels</span>
                                </a>

                                <!-- Schedules -->
                                <a href="{{ route('admin.schedules.index') }}"
                                    class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.schedules.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                    <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                        <i class="fas fa-calendar-alt"></i>
                                    </div>
                                    <span>Schedules</span>
                                </a>

                                <!-- Bookings -->
                                <a href="{{ route('admin.bookings.index') }}"
                                    class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.bookings.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                    <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                        <i class="fas fa-ticket-alt"></i>
                                    </div>
                                    <span>Bookings</span>
                                </a>

                                <!-- Refunds -->
                                <a href="{{ route('admin.refunds.index') }}"
                                    class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.refunds.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                    <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                        <i class="fas fa-money-bill-wave"></i>
                                    </div>
                                    <span>Refund</span>
                                </a>

                                <!-- Passengers -->
                                <a href="{{ route('admin.users.index') }}"
                                    class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.passengers.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                    <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                        <i class="fas fa-users"></i>
                                    </div>
                                    <span>Passengers</span>
                                </a>

                                <!-- Reports -->
                                <a href="{{ route('admin.reports.index') }}"
                                    class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.reports.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                    <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                        <i class="fas fa-chart-line"></i>
                                    </div>
                                    <span>Reports</span>
                                </a>

                                <!-- System Operators -->
                                <a href="{{ route('admin.operators.index') }}"
                                    class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.users.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                    <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                        <i class="fas fa-user-shield"></i>
                                    </div>
                                    <span>Operators</span>
                                </a>
                            @endif

                            @if ($isOperator)
                                <!-- Dashboard -->
                                <a href="{{ route('operator.dashboard') }}"
                                    class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('operator.dashboard') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                    <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                        <i class="fas fa-tachometer-alt"></i>
                                    </div>
                                    <span>Dashboard</span>
                                </a>

                                <!-- Bookings -->
                                <a href="{{ route('operator.bookings.index') }}"
                                    class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('operator.bookings.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                    <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                        <i class="fas fa-ticket-alt"></i>
                                    </div>
                                    <span>Bookings</span>
                                </a>

                                <!-- Schedules -->
                                <a href="{{ route('operator.schedules.index') }}"
                                    class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('operator.schedules.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                    <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                        <i class="fas fa-calendar-alt"></i>
                                    </div>
                                    <span>Schedules</span>
                                </a>

                                <!-- Reports -->
                                <a href="{{ route('operator.reports.index') }}"
                                    class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('operator.reports.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                    <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                        <i class="fas fa-chart-line"></i>
                                    </div>
                                    <span>Reports</span>
                                </a>
                            @endif
                        </nav>
                    </div>
                    <div class="p-4 border-t border-primary-800">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div
                                    class="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                                    <i class="fas fa-user"></i>
                                </div>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-white">{{ Auth::user()->name ?? 'Guest' }}</p>
                                @if (Auth::guard('admin')->check() || Auth::guard('operator')->check())
                                    <form method="POST"
                                        action="{{ route(Auth::guard('admin')->check() ? 'admin.logout' : 'operator.logout') }}"
                                        class="mt-1">
                                        @csrf
                                        <button type="submit"
                                            class="text-xs text-primary-200 hover:text-white flex items-center">
                                            <i class="fas fa-sign-out-alt mr-1"></i> Logout
                                        </button>
                                    </form>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Static sidebar for desktop -->
        <div class="hidden lg:flex lg:flex-shrink-0">
            <div class="flex flex-col w-64">
                <div
                    class="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-primary-900 to-primary-700 shadow-xl relative">
                    <!-- Blob background for desktop sidebar -->
                    <div class="blob-wrapper opacity-30">
                        <svg class="absolute blob animate-drift" viewBox="0 0 200 200"
                            xmlns="http://www.w3.org/2000/svg" style="width: 300px; right: -150px; top: -50px">
                            <path fill="#FFFFFF"
                                d="M43.6,-57.3C56.1,-49.8,65.8,-35.6,71.7,-19.4C77.7,-3.2,79.9,14.9,73.8,29.4C67.6,44,53.2,55,37.5,61.5C21.9,68,4.9,70.1,-11.3,68.1C-27.5,66.1,-43.1,60,-55.8,48.5C-68.5,37,-78.4,20.1,-78.1,3.5C-77.8,-13,-67.3,-26,-56.5,-35.4C-45.7,-44.8,-34.7,-50.5,-23.4,-57.9C-12.1,-65.3,-0.6,-74.5,9.5,-72.8C19.6,-71.1,31.2,-64.8,43.6,-57.3Z"
                                transform="translate(100 100)" />
                        </svg>
                        <svg class="absolute blob animate-morph" viewBox="0 0 200 200"
                            xmlns="http://www.w3.org/2000/svg" style="width: 300px; left: -150px; bottom: 100px">
                            <path fill="#FFFFFF"
                                d="M35.6,-53.8C45.4,-44.9,52.6,-33.3,58.5,-20C64.5,-6.7,69.2,8.3,67.1,22.7C64.9,37.1,56.1,51,43.3,58.2C30.6,65.5,15.3,66.2,0.8,65C-13.6,63.9,-27.3,61,-39.3,53.7C-51.3,46.4,-61.7,34.6,-67.3,20.2C-72.9,5.9,-73.6,-11,-67.8,-25.4C-61.9,-39.8,-49.4,-51.7,-36,-59.1C-22.5,-66.4,-8.1,-69.2,2.9,-68.1C14,-67,25.9,-62.8,35.6,-53.8Z"
                                transform="translate(100 100)" />
                        </svg>
                        <svg class="absolute blob animate-waves" viewBox="0 0 200 200"
                            xmlns="http://www.w3.org/2000/svg" style="width: 200px; right: -50px; bottom: 200px">
                            <path fill="#FFFFFF"
                                d="M48.2,-71.1C59.4,-61.9,63.6,-43.1,67.2,-25.7C70.9,-8.4,74,7.6,69.7,20.8C65.4,33.9,53.6,44.2,40.9,52.8C28.1,61.4,14.1,68.3,-1.2,69.9C-16.5,71.5,-33,67.7,-46.9,59C-60.8,50.3,-72.1,36.7,-75.6,21.3C-79.1,6,-74.9,-11.1,-65.8,-23.2C-56.6,-35.3,-42.5,-42.6,-29.6,-51.2C-16.6,-59.8,-4.9,-69.8,8.9,-74.9C22.7,-80,45.5,-80.2,48.2,-71.1Z"
                                transform="translate(100 100)" />
                        </svg>
                    </div>

                    <div class="content-wrapper">
                        <div class="flex-shrink-0 flex items-center px-4 py-5">
                            <img class="h-10 w-auto" src="{{ asset('images/logo.png') }}" alt="Ferry Ticket">
                            <span class="ml-3 text-xl font-semibold text-white">Ferry Admin</span>
                        </div>
                        <div class="mt-2 flex-1 flex flex-col overflow-y-auto px-2">
                            <!-- Navigation menu from partials -->
                            <nav class="space-y-1">
                                @php
                                    $isAdmin = Auth::guard('admin')->check();
                                    $isOperator = Auth::guard('operator')->check();
                                @endphp

                                @if ($isAdmin)
                                    <!-- Dashboard -->
                                    <a href="{{ route('admin.dashboard') }}"
                                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.dashboard') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                            <i class="fas fa-tachometer-alt"></i>
                                        </div>
                                        <span>Dashboard</span>
                                    </a>

                                    <!-- Routes -->
                                    <a href="{{ route('admin.routes.index') }}"
                                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.routes.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                            <i class="fas fa-route"></i>
                                        </div>
                                        <span>Routes</span>
                                    </a>

                                    <!-- Vessels -->
                                    <a href="{{ route('admin.ferries.index') }}"
                                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.vessels.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                            <i class="fas fa-ship"></i>
                                        </div>
                                        <span>Vessels</span>
                                    </a>

                                    <!-- Schedules -->
                                    <a href="{{ route('admin.schedules.index') }}"
                                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.schedules.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                            <i class="fas fa-calendar-alt"></i>
                                        </div>
                                        <span>Schedules</span>
                                    </a>

                                    <!-- Bookings -->
                                    <a href="{{ route('admin.bookings.index') }}"
                                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.bookings.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                            <i class="fas fa-ticket-alt"></i>
                                        </div>
                                        <span>Bookings</span>
                                    </a>

                                    <!-- Refunds -->
                                    <a href="{{ route('admin.refunds.index') }}"
                                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.refunds.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                            <i class="fas fa-money-bill-wave"></i>
                                        </div>
                                        <span>Refund</span>
                                    </a>

                                    <!-- Passengers -->
                                    <a href="{{ route('admin.users.index') }}"
                                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.passengers.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                            <i class="fas fa-users"></i>
                                        </div>
                                        <span>Passengers</span>
                                    </a>

                                    <!-- Reports -->
                                    <a href="{{ route('admin.reports.index') }}"
                                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.reports.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                            <i class="fas fa-chart-line"></i>
                                        </div>
                                        <span>Reports</span>
                                    </a>

                                    <!-- System Operators -->
                                    <a href="{{ route('admin.operators.index') }}"
                                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.users.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                            <i class="fas fa-user-shield"></i>
                                        </div>
                                        <span>Operators</span>
                                    </a>
                                @endif

                                @if ($isOperator)
                                    <!-- Dashboard -->
                                    <a href="{{ route('operator.dashboard') }}"
                                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('operator.dashboard') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                            <i class="fas fa-tachometer-alt"></i>
                                        </div>
                                        <span>Dashboard</span>
                                    </a>

                                    <!-- Bookings -->
                                    <a href="{{ route('operator.bookings.index') }}"
                                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('operator.bookings.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                            <i class="fas fa-ticket-alt"></i>
                                        </div>
                                        <span>Bookings</span>
                                    </a>

                                    <!-- Schedules -->
                                    <a href="{{ route('operator.schedules.index') }}"
                                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('operator.schedules.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                            <i class="fas fa-calendar-alt"></i>
                                        </div>
                                        <span>Schedules</span>
                                    </a>

                                    <!-- Reports -->
                                    <a href="{{ route('operator.reports.index') }}"
                                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('operator.reports.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                            <i class="fas fa-chart-line"></i>
                                        </div>
                                        <span>Reports</span>
                                    </a>
                                @endif
                            </nav>
                        </div>
                        <div class="p-4 border-t border-primary-800">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div
                                        class="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                                        <i class="fas fa-user"></i>
                                    </div>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm font-medium text-white">{{ Auth::user()->name ?? 'Guest' }}</p>
                                    @if (Auth::guard('admin')->check() || Auth::guard('operator')->check())
                                        <form method="POST"
                                            action="{{ route(Auth::guard('admin')->check() ? 'admin.logout' : 'operator.logout') }}"
                                            class="mt-1">
                                            @csrf
                                            <button type="submit"
                                                class="text-xs text-primary-200 hover:text-white flex items-center">
                                                <i class="fas fa-sign-out-alt mr-1"></i> Logout
                                            </button>
                                        </form>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main content area -->
        <div class="flex flex-col flex-1 overflow-hidden">
            <!-- Top navigation -->
            <div class="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm overflow-hidden">
                <!-- Header blob decorations -->
                <div class="absolute opacity-15 -right-16 -top-16">
                    <svg class="animate-morph-slow" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                        style="width: 180px;">
                        <path fill="#4470f4"
                            d="M48.6,-58.3C62.3,-49.4,72.6,-33.6,76.3,-16.3C80.1,1.1,77.3,19.9,68.4,33.5C59.5,47.2,44.6,55.6,28.7,62.5C12.9,69.4,-4,74.8,-19.1,71.3C-34.2,67.8,-47.6,55.6,-57.2,40.8C-66.8,26.1,-72.6,8.8,-71.2,-7.9C-69.8,-24.6,-61.3,-40.5,-48.4,-49.8C-35.6,-59.1,-18.3,-61.7,-0.3,-61.3C17.7,-60.9,34.8,-67.3,48.6,-58.3Z"
                            transform="translate(100 100)" />
                    </svg>
                </div>
                <div class="absolute opacity-15 left-20 top-0">
                    <svg class="animate-drift-right" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                        style="width: 120px;">
                        <path fill="#3aa3ff"
                            d="M46.7,-47.9C59.1,-34.4,67.3,-16.9,67.7,1.3C68,19.5,60.4,38.6,46.9,52.1C33.4,65.6,14,73.4,-5.2,73.1C-24.4,72.7,-43.5,64.2,-55.5,49.8C-67.5,35.4,-72.4,15,-69.4,-3.1C-66.3,-21.2,-55.4,-36.9,-41.6,-49.8C-27.8,-62.7,-10.9,-72.7,3.7,-74.1C18.3,-75.5,34.3,-61.4,46.7,-47.9Z"
                            transform="translate(100 100)" />
                    </svg>
                </div>

                <button @click="sidebarOpen = true"
                    class="lg:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                    <span class="sr-only">Open sidebar</span>
                    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div class="flex-1 px-4 flex justify-between">
                    <div class="flex-1 flex items-center">
                        <h1 class="text-xl font-bold text-gray-800">@yield('header', 'Dashboard')</h1>
                    </div>
                    <div class="ml-4 flex items-center md:ml-6">
                        <!-- Date display -->
                        <div class="hidden sm:flex items-center bg-gray-100 text-gray-600 rounded-lg py-1 px-3 mr-4">
                            <i class="far fa-calendar-alt mr-2"></i>
                            <span>{{ date('d M Y') }}</span>
                        </div>

                        <!-- Profile dropdown - visible only on mobile -->
                        <div class="lg:hidden flex items-center">
                            <span
                                class="inline-block text-sm text-gray-700 mr-2">{{ Auth::user()->name ?? 'Guest' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main content -->
            <main class="flex-1 overflow-y-auto bg-gray-50 relative">
                <!-- Background blobs for main content -->
                <div class="blob-wrapper">
                    <div class="absolute opacity-10 right-0 top-10">
                        <svg class="animate-morph-slow" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                            style="width: 400px;">
                            <path fill="#3aa3ff"
                                d="M48.2,-71.1C59.4,-61.9,63.6,-43.1,67.2,-25.7C70.9,-8.4,74,7.6,69.7,20.8C65.4,33.9,53.6,44.2,40.9,52.8C28.1,61.4,14.1,68.3,-1.2,69.9C-16.5,71.5,-33,67.7,-46.9,59C-60.8,50.3,-72.1,36.7,-75.6,21.3C-79.1,6,-74.9,-11.1,-65.8,-23.2C-56.6,-35.3,-42.5,-42.6,-29.6,-51.2C-16.6,-59.8,-4.9,-69.8,8.9,-74.9C22.7,-80,45.5,-80.2,48.2,-71.1Z"
                                transform="translate(100 100)" />
                        </svg>
                    </div>
                    <div class="absolute opacity-10 left-0 bottom-0">
                        <svg class="animate-drift" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                            style="width: 350px;">
                            <path fill="#4470f4"
                                d="M45,-54.3C55.6,-45.4,60.2,-28.4,63.3,-11.3C66.4,5.9,68,23.1,60.9,35.6C53.9,48.1,38.2,55.8,22.3,60.5C6.4,65.3,-9.7,67.1,-26.4,63.7C-43.1,60.2,-60.3,51.6,-67.9,37.2C-75.4,22.8,-73.3,2.6,-68.4,-15.7C-63.5,-34,-55.8,-50.4,-43.2,-58.7C-30.6,-67,-15.3,-67.2,0.9,-68.4C17.2,-69.5,34.4,-63.2,45,-54.3Z"
                                transform="translate(100 100)" />
                        </svg>
                    </div>
                    <div class="absolute opacity-10 bottom-40 right-1/4">
                        <svg class="animate-waves" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                            style="width: 250px;">
                            <path fill="#5e8eff"
                                d="M48.6,-58.3C62.3,-49.4,72.6,-33.6,76.3,-16.3C80.1,1.1,77.3,19.9,68.4,33.5C59.5,47.2,44.6,55.6,28.7,62.5C12.9,69.4,-4,74.8,-19.1,71.3C-34.2,67.8,-47.6,55.6,-57.2,40.8C-66.8,26.1,-72.6,8.8,-71.2,-7.9C-69.8,-24.6,-61.3,-40.5,-48.4,-49.8C-35.6,-59.1,-18.3,-61.7,-0.3,-61.3C17.7,-60.9,34.8,-67.3,48.6,-58.3Z"
                                transform="translate(100 100)" />
                        </svg>
                    </div>
                    <div class="absolute opacity-10 top-1/3 left-1/4">
                        <svg class="animate-float" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                            style="width: 220px;">
                            <path fill="#2186f0"
                                d="M35.6,-53.8C45.4,-44.9,52.6,-33.3,58.5,-20C64.5,-6.7,69.2,8.3,67.1,22.7C64.9,37.1,56.1,51,43.3,58.2C30.6,65.5,15.3,66.2,0.8,65C-13.6,63.9,-27.3,61,-39.3,53.7C-51.3,46.4,-61.7,34.6,-67.3,20.2C-72.9,5.9,-73.6,-11,-67.8,-25.4C-61.9,-39.8,-49.4,-51.7,-36,-59.1C-22.5,-66.4,-8.1,-69.2,2.9,-68.1C14,-67,25.9,-62.8,35.6,-53.8Z"
                                transform="translate(100 100)" />
                        </svg>
                    </div>
                    <div class="absolute opacity-10 top-10 left-10">
                        <svg class="animate-drift-left" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                            style="width: 180px;">
                            <path fill="#81a8ff"
                                d="M46.7,-47.9C59.1,-34.4,67.3,-16.9,67.7,1.3C68,19.5,60.4,38.6,46.9,52.1C33.4,65.6,14,73.4,-5.2,73.1C-24.4,72.7,-43.5,64.2,-55.5,49.8C-67.5,35.4,-72.4,15,-69.4,-3.1C-66.3,-21.2,-55.4,-36.9,-41.6,-49.8C-27.8,-62.7,-10.9,-72.7,3.7,-74.1C18.3,-75.5,34.3,-61.4,46.7,-47.9Z"
                                transform="translate(100 100)" />
                        </svg>
                    </div>
                </div>

                <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
                    <!-- Alert messages -->
                    @if (session('success'))
                        <div class="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm alert-fade"
                            role="alert">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-check-circle text-green-500 text-xl"></i>
                                </div>
                                <div class="ml-3">
                                    <p class="font-medium">{{ session('success') }}</p>
                                </div>
                            </div>
                        </div>
                    @endif

                    @if (session('error'))
                        <div class="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm alert-fade"
                            role="alert">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-exclamation-circle text-red-500 text-xl"></i>
                                </div>
                                <div class="ml-3">
                                    <p class="font-medium">{{ session('error') }}</p>
                                </div>
                            </div>
                        </div>
                    @endif

                    <!-- Page content -->
                    @yield('content')
                </div>
            </main>

            <!-- Footer -->
            <footer class="bg-white border-t border-gray-200 py-4 relative overflow-hidden">
                <!-- Footer blob decoration -->
                <div class="absolute opacity-15 -right-24 -bottom-20">
                    <svg class="animate-float-slow" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                        style="width: 150px;">
                        <path fill="#4470f4"
                            d="M46.7,-47.9C59.1,-34.4,67.3,-16.9,67.7,1.3C68,19.5,60.4,38.6,46.9,52.1C33.4,65.6,14,73.4,-5.2,73.1C-24.4,72.7,-43.5,64.2,-55.5,49.8C-67.5,35.4,-72.4,15,-69.4,-3.1C-66.3,-21.2,-55.4,-36.9,-41.6,-49.8C-27.8,-62.7,-10.9,-72.7,3.7,-74.1C18.3,-75.5,34.3,-61.4,46.7,-47.9Z"
                            transform="translate(100 100)" />
                    </svg>
                </div>
                <div class="absolute opacity-15 left-10 -bottom-10">
                    <svg class="animate-bounce-slow" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                        style="width: 120px;">
                        <path fill="#81a8ff"
                            d="M35.6,-53.8C45.4,-44.9,52.6,-33.3,58.5,-20C64.5,-6.7,69.2,8.3,67.1,22.7C64.9,37.1,56.1,51,43.3,58.2C30.6,65.5,15.3,66.2,0.8,65C-13.6,63.9,-27.3,61,-39.3,53.7C-51.3,46.4,-61.7,34.6,-67.3,20.2C-72.9,5.9,-73.6,-11,-67.8,-25.4C-61.9,-39.8,-49.4,-51.7,-36,-59.1C-22.5,-66.4,-8.1,-69.2,2.9,-68.1C14,-67,25.9,-62.8,35.6,-53.8Z"
                            transform="translate(100 100)" />
                    </svg>
                </div>

                <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div class="flex flex-col sm:flex-row justify-between items-center">
                        <div class="text-sm text-gray-500 mb-2 sm:mb-0">
                            &copy; 2023 Ferry Ticket System. All rights reserved.
                        </div>
                        <div class="text-sm text-gray-500">
                            Version 1.0.0
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>

    @yield('scripts')

    <!-- Global App Scripts -->
    <script>
        // Auto-hide alerts after 5 seconds
        setTimeout(function() {
            const alerts = document.querySelectorAll('.alert-fade');
            alerts.forEach(alert => {
                alert.style.display = 'none';
            });
        }, 5000);
    </script>
</body>

</html>
