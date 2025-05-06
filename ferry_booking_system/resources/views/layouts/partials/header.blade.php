<!-- layouts/partials/header.blade.php -->
<header class="relative z-10 flex-shrink-0 h-16 bg-white shadow-sm overflow-hidden">
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

    <div class="flex h-full px-4">
        <button @click="sidebarOpen = true"
            class="md:hidden text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 self-center">
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

                <!-- Notifications dropdown -->
                <div x-data="{ open: false }" class="relative">
                    <button @click="open = !open" class="p-1 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none">
                        <span class="sr-only">View notifications</span>
                        <i class="fas fa-bell"></i>
                    </button>

                    <div x-cloak x-show="open" @click.away="open = false"
                        class="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div class="py-1">
                            <div class="px-4 py-2 border-b">
                                <h3 class="text-sm font-semibold">Notifications</h3>
                            </div>

                            <!-- Sample notifications, replace with real data -->
                            <div class="max-h-60 overflow-y-auto">
                                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b">
                                    <div class="flex items-start">
                                        <div class="flex-shrink-0 mt-0.5">
                                            <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                <i class="fas fa-ticket-alt text-primary-600"></i>
                                            </div>
                                        </div>
                                        <div class="ml-3 w-0 flex-1">
                                            <p class="text-sm font-medium text-gray-900">New booking received</p>
                                            <p class="text-xs text-gray-500">5 minutes ago</p>
                                        </div>
                                    </div>
                                </a>
                                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <div class="flex items-start">
                                        <div class="flex-shrink-0 mt-0.5">
                                            <div class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                                <i class="fas fa-chart-line text-green-600"></i>
                                            </div>
                                        </div>
                                        <div class="ml-3 w-0 flex-1">
                                            <p class="text-sm font-medium text-gray-900">Daily report available</p>
                                            <p class="text-xs text-gray-500">1 hour ago</p>
                                        </div>
                                    </div>
                                </a>
                            </div>

                            <div class="border-t">
                                <a href="#" class="block px-4 py-2 text-xs text-center text-primary-600 font-medium">
                                    View all notifications
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Profile dropdown - visible only on mobile -->
                <div class="md:hidden flex items-center ml-3">
                    <span class="inline-block text-sm text-gray-700 mr-2">{{ Auth::user()->name ?? 'Guest' }}</span>
                </div>
            </div>
        </div>
    </div>
</header>
