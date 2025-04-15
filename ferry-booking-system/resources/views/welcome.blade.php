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
                        },
                        sidebar: {
                            DEFAULT: '#0f172a',
                            hover: '#1e293b',
                            active: '#334155',
                        },
                        admin: '#dc2626',
                        operator: '#0284c7',
                    }
                }
            }
        }
    </script>

    <!-- Font Awesome for icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-slate-100 font-poppins text-slate-800 antialiased">
    <div id="wrapper" class="flex">
        <!-- Sidebar -->
        <div id="sidebar-wrapper" class="fixed h-screen w-72 -ml-72 overflow-y-auto transition-all duration-300 ease-in-out bg-sidebar text-slate-400 shadow-lg z-40 md:ml-0">
            <div class="{{ Auth::guard('admin')->check() ? 'bg-admin' : (Auth::guard('operator')->check() ? 'bg-operator' : 'bg-primary') }} text-white text-lg font-bold py-6 px-4 uppercase border-b border-slate-700 flex items-center justify-center">
                <i class="fas fa-ship mr-3 text-xl"></i>
                <span>{{ config('app.name', 'Ferry Booking') }}</span>
            </div>

            @if(Auth::guard('admin')->check() || Auth::guard('operator')->check())
            <div class="py-6 px-4 border-b border-slate-700/50 text-center">
                <div class="w-16 h-16 rounded-full bg-slate-600 mx-auto flex items-center justify-center mb-3">
                    <i class="fas fa-user text-white text-2xl"></i>
                </div>
                <div class="text-white font-semibold text-lg">
                    {{ Auth::guard('admin')->check() ? Auth::guard('admin')->user()->name : Auth::guard('operator')->user()->name }}
                </div>
                <div class="text-sm text-slate-400">
                    {{ Auth::guard('admin')->check() ? 'Administrator' : 'Operator' }}
                </div>
            </div>
            @endif

            <div class="py-4">
                @if(Auth::guard('admin')->check())
                    <!-- Admin Menu -->
                    <a href="{{ route('admin.dashboard') }}" class="flex items-center px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('admin.dashboard') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1' }} transition-all duration-200">
                        <i class="fas fa-tachometer-alt w-5 mr-3"></i> Dashboard
                    </a>
                    <a href="{{ route('admin.routes.index') }}" class="flex items-center px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('admin.routes.*') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1' }} transition-all duration-200">
                        <i class="fas fa-route w-5 mr-3"></i> Rute
                    </a>
                    <a href="{{ route('admin.ferries.index') }}" class="flex items-center px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('admin.ferries.*') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1' }} transition-all duration-200">
                        <i class="fas fa-ship w-5 mr-3"></i> Kapal
                    </a>
                    <a href="{{ route('admin.schedules.index') }}" class="flex items-center px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('admin.schedules.*') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1' }} transition-all duration-200">
                        <i class="fas fa-calendar-alt w-5 mr-3"></i> Jadwal
                    </a>
                    <a href="{{ route('admin.bookings.index') }}" class="flex items-center px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('admin.bookings.*') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1' }} transition-all duration-200">
                        <i class="fas fa-ticket-alt w-5 mr-3"></i> Booking
                    </a>
                    <a href="{{ route('admin.reports.index') }}" class="flex items-center px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('admin.reports.*') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1' }} transition-all duration-200">
                        <i class="fas fa-chart-bar w-5 mr-3"></i> Laporan
                    </a>
                    <a href="{{ route('admin.users.index') }}" class="flex items-center px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('admin.users.*') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1' }} transition-all duration-200">
                        <i class="fas fa-users w-5 mr-3"></i> Pengguna
                    </a>

                    @if(auth()->guard('admin')->user()->is_super_admin ?? false)
                    <button id="adminMenuToggle" class="w-full flex items-center justify-between px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('admin.admins.*') || request()->routeIs('admin.operators.*') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white' }} transition-all duration-200">
                        <div class="flex items-center">
                            <i class="fas fa-user-cog w-5 mr-3"></i>
                            <span>Manajemen Admin</span>
                        </div>
                        <i class="fas fa-angle-down transition-transform" id="adminMenuArrow"></i>
                    </button>
                    <div class="pl-4 {{ request()->routeIs('admin.admins.*') || request()->routeIs('admin.operators.*') ? 'block' : 'hidden' }}" id="adminSubmenu">
                        <a href="{{ route('admin.admins.index') }}" class="flex items-center px-6 py-2 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('admin.admins.*') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1' }} transition-all duration-200">
                            <i class="fas fa-user-shield w-5 mr-3"></i> Admin
                        </a>
                        <a href="{{ route('admin.operators.index') }}" class="flex items-center px-6 py-2 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('admin.operators.*') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1' }} transition-all duration-200">
                            <i class="fas fa-user-tie w-5 mr-3"></i> Operator
                        </a>
                    </div>
                    @endif

                @elseif(Auth::guard('operator')->check())
                    <!-- Operator Menu -->
                    <a href="{{ route('operator.dashboard') }}" class="flex items-center px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('operator.dashboard') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1' }} transition-all duration-200">
                        <i class="fas fa-tachometer-alt w-5 mr-3"></i> Dashboard
                    </a>
                    <a href="{{ route('operator.schedules.index') }}" class="flex items-center px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('operator.schedules.*') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1' }} transition-all duration-200">
                        <i class="fas fa-calendar-alt w-5 mr-3"></i> Jadwal
                    </a>
                    <a href="{{ route('operator.bookings.index') }}" class="flex items-center px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('operator.bookings.*') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1' }} transition-all duration-200">
                        <i class="fas fa-ticket-alt w-5 mr-3"></i> Booking
                    </a>
                    <a href="{{ route('operator.bookings.check-in') }}" class="flex items-center px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('operator.bookings.check-in') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1' }} transition-all duration-200">
                        <i class="fas fa-clipboard-check w-5 mr-3"></i> Check-in
                    </a>
                    <a href="{{ route('operator.reports.index') }}" class="flex items-center px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium {{ request()->routeIs('operator.reports.*') ? 'bg-sidebar-active text-white' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1' }} transition-all duration-200">
                        <i class="fas fa-chart-bar w-5 mr-3"></i> Laporan
                    </a>
                @else
                    <!-- Guest Menu -->
                    <div class="px-6 py-3 mx-3 text-white font-medium">
                        <h6 class="mb-0">Login Sebagai</h6>
                    </div>
                    <a href="{{ route('admin.login') }}" class="flex items-center px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1 transition-all duration-200">
                        <i class="fas fa-user-shield w-5 mr-3"></i> Admin
                    </a>
                    <a href="{{ route('operator.login') }}" class="flex items-center px-6 py-3 mx-3 my-1 rounded-lg text-sm font-medium text-slate-400 hover:bg-sidebar-hover hover:text-white hover:translate-x-1 transition-all duration-200">
                        <i class="fas fa-user-tie w-5 mr-3"></i> Operator
                    </a>
                @endif
            </div>

            @if(Auth::guard('admin')->check() || Auth::guard('operator')->check())
                <div class="mt-auto border-t border-slate-700/50 p-6">
                    @if(Auth::guard('admin')->check())
                        <form id="logout-form" action="{{ route('admin.logout') }}" method="POST">
                            @csrf
                            <button type="submit" class="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </form>
                    @elseif(Auth::guard('operator')->check())
                        <form id="logout-form" action="{{ route('operator.logout') }}" method="POST">
                            @csrf
                            <button type="submit" class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </form>
                    @endif
                </div>
            @endif
        </div>
        <!-- /#sidebar-wrapper -->

        <!-- Page Content -->
        <div id="page-content-wrapper" class="flex-1 transition-all duration-300 md:ml-72">
            <nav class="bg-white shadow-sm px-6 py-3">
                <div class="flex items-center justify-between">
                    <button class="text-slate-600 hover:text-slate-900 focus:outline-none" id="menu-toggle">
                        <i class="fas fa-bars text-xl"></i>
                    </button>

                    <div class="flex items-center">
                        @if(Auth::guard('admin')->check())
                            <span class="text-slate-600 font-medium ml-2">
                                <i class="fas fa-user-shield mr-1"></i> Admin Panel
                            </span>
                        @elseif(Auth::guard('operator')->check())
                            <span class="text-slate-600 font-medium ml-2">
                                <i class="fas fa-user-tie mr-1"></i> Operator Panel
                            </span>
                        @endif
                    </div>
                </div>
            </nav>

            <div class="p-6">
                <div class="animate-fade-in">
                    @yield('content')
                </div>
            </div>
        </div>
        <!-- /#page-content-wrapper -->
    </div>
    <!-- /#wrapper -->

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('js/app.js') }}" defer></script>

    <!-- Menu Toggle Script -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Menu toggle functionality
            const menuToggle = document.getElementById('menu-toggle');
            const wrapper = document.getElementById('wrapper');
            const sidebar = document.getElementById('sidebar-wrapper');
            const pageContent = document.getElementById('page-content-wrapper');

            if(menuToggle && wrapper) {
                menuToggle.addEventListener('click', function(e) {
                    e.preventDefault();

                    // For desktop
                    if (window.innerWidth >= 768) {
                        if (sidebar.classList.contains('md:ml-0')) {
                            sidebar.classList.remove('md:ml-0');
                            sidebar.classList.add('md:-ml-72');
                            pageContent.classList.remove('md:ml-72');
                            pageContent.classList.add('md:ml-0');
                        } else {
                            sidebar.classList.remove('md:-ml-72');
                            sidebar.classList.add('md:ml-0');
                            pageContent.classList.remove('md:ml-0');
                            pageContent.classList.add('md:ml-72');
                        }
                    }
                    // For mobile
                    else {
                        if (sidebar.classList.contains('-ml-72')) {
                            sidebar.classList.remove('-ml-72');
                            sidebar.classList.add('ml-0');
                        } else {
                            sidebar.classList.remove('ml-0');
                            sidebar.classList.add('-ml-72');
                        }
                    }
                });
            }

            // Admin submenu toggle
            const adminMenuToggle = document.getElementById('adminMenuToggle');
            const adminSubmenu = document.getElementById('adminSubmenu');
            const adminMenuArrow = document.getElementById('adminMenuArrow');

            if(adminMenuToggle && adminSubmenu) {
                adminMenuToggle.addEventListener('click', function() {
                    adminSubmenu.classList.toggle('hidden');
                    adminMenuArrow.classList.toggle('rotate-180');
                });
            }

            // Add animation classes to content elements
            const contentElements = document.querySelectorAll('.animate-fade-in');
            contentElements.forEach((element, index) => {
                element.style.animationDelay = `${index * 0.1}s`;
            });
        });
    </script>

    <style>
        /* Animation for fade in */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
    </style>

    @yield('scripts')
</body>
</html>
