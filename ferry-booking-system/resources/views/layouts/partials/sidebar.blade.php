<!-- layouts/partials/sidebar.blade.php -->
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
    x-transition:leave-end="-translate-x-full"
    class="fixed inset-y-0 left-0 z-40 w-64 flex flex-col lg:hidden">

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

    <!-- Sidebar content for mobile -->
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
                <!-- Navigation menu -->
                <nav class="space-y-1">
                    <!-- Dashboard -->
                    <a href="{{ route('admin.dashboard') }}"
                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.dashboard') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                            <i class="fas fa-tachometer-alt"></i>
                        </div>
                        <span>Dashboard</span>
                    </a>

                    <!-- Schedules -->
                    <a href="{{ route('admin.schedules.index') }}"
                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.schedules.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <span>Schedules</span>
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

                    <!-- Bookings -->
                    <a href="{{ route('admin.bookings.index') }}"
                        class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.bookings.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                        <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                            <i class="fas fa-ticket-alt"></i>
                        </div>
                        <span>Bookings</span>
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
                        @if(Auth::guard('admin')->check() || Auth::guard('operator')->check())
                        <form method="POST" action="{{ route(Auth::guard('admin')->check() ? 'admin.logout' : 'operator.logout') }}" class="mt-1">
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
                    <!-- Navigation menu -->
                    <nav class="space-y-1">
                        <!-- Dashboard -->
                        <a href="{{ route('admin.dashboard') }}"
                            class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.dashboard') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                            <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                <i class="fas fa-tachometer-alt"></i>
                            </div>
                            <span>Dashboard</span>
                        </a>

                        <!-- Schedules -->
                        <a href="{{ route('admin.schedules.index') }}"
                            class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.schedules.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                            <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <span>Schedules</span>
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

                        <!-- Bookings -->
                        <a href="{{ route('admin.bookings.index') }}"
                            class="nav-item group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('admin.bookings.*') ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white' }}">
                            <div class="nav-icon mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                <i class="fas fa-ticket-alt"></i>
                            </div>
                            <span>Bookings</span>
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
                            @if(Auth::guard('admin')->check() || Auth::guard('operator')->check())
                            <form method="POST" action="{{ route(Auth::guard('admin')->check() ? 'admin.logout' : 'operator.logout') }}" class="mt-1">
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
