<!-- Sidebar -->
<div id="sidebar" class="fixed inset-y-0 left-0 z-30 w-64 transform transition duration-300 ease-in-out md:translate-x-0 -translate-x-full bg-gray-900 text-white">
    <!-- Sidebar Header -->
    <div class="{{ Auth::guard('admin')->check() ? 'bg-indigo-700' : (Auth::guard('operator')->check() ? 'bg-blue-700' : 'bg-blue-700') }} py-4 px-4">
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
