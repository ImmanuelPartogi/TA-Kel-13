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
