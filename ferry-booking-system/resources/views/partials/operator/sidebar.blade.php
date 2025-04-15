<aside class="main-sidebar sidebar-dark-primary elevation-4">
    <!-- Brand Logo -->
    <a href="{{ route('operator.dashboard') }}" class="brand-link">
        <img src="{{ asset('dist/img/AdminLTELogo.png') }}" alt="Ferry Logo" class="brand-image img-circle elevation-3" style="opacity: .8">
        <span class="brand-text font-weight-light">Ferry Operator</span>
    </a>

    <!-- Sidebar -->
    <div class="sidebar">
        <!-- Sidebar user panel (optional) -->
        <div class="user-panel mt-3 pb-3 mb-3 d-flex">
            <div class="image">
                <img src="{{ asset('dist/img/user2-160x160.jpg') }}" class="img-circle elevation-2" alt="User Image">
            </div>
            <div class="info">
                <a href="#" class="d-block">{{ Auth::guard('operator')->user()->name }}</a>
            </div>
        </div>

        <!-- Sidebar Menu -->
        <nav class="mt-2">
            <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                <!-- Dashboard -->
                <li class="nav-item">
                    <a href="{{ route('operator.dashboard') }}" class="nav-link {{ request()->routeIs('operator.dashboard') ? 'active' : '' }}">
                        <i class="nav-icon fas fa-tachometer-alt"></i>
                        <p>Dashboard</p>
                    </a>
                </li>

                <!-- Bookings -->
                <li class="nav-item {{ request()->routeIs('operator.bookings.*') ? 'menu-open' : '' }}">
                    <a href="#" class="nav-link {{ request()->routeIs('operator.bookings.*') ? 'active' : '' }}">
                        <i class="nav-icon fas fa-ticket-alt"></i>
                        <p>
                            Booking
                            <i class="right fas fa-angle-left"></i>
                        </p>
                    </a>
                    <ul class="nav nav-treeview">
                        <li class="nav-item">
                            <a href="{{ route('operator.bookings.index') }}" class="nav-link {{ request()->routeIs('operator.bookings.index') ? 'active' : '' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Daftar Booking</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('operator.bookings.check-in') }}" class="nav-link {{ request()->routeIs('operator.bookings.check-in') ? 'active' : '' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Check-in Penumpang</p>
                            </a>
                        </li>
                    </ul>
                </li>

                <!-- Schedules -->
                <li class="nav-item {{ request()->routeIs('operator.schedules.*') ? 'menu-open' : '' }}">
                    <a href="#" class="nav-link {{ request()->routeIs('operator.schedules.*') ? 'active' : '' }}">
                        <i class="nav-icon fas fa-calendar-alt"></i>
                        <p>
                            Jadwal
                            <i class="right fas fa-angle-left"></i>
                        </p>
                    </a>
                    <ul class="nav nav-treeview">
                        <li class="nav-item">
                            <a href="{{ route('operator.schedules.index') }}" class="nav-link {{ request()->routeIs('operator.schedules.index') ? 'active' : '' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Daftar Jadwal</p>
                            </a>
                        </li>
                    </ul>
                </li>

                <!-- Reports -->
                <li class="nav-item {{ request()->routeIs('operator.reports.*') ? 'menu-open' : '' }}">
                    <a href="#" class="nav-link {{ request()->routeIs('operator.reports.*') ? 'active' : '' }}">
                        <i class="nav-icon fas fa-chart-bar"></i>
                        <p>
                            Laporan
                            <i class="right fas fa-angle-left"></i>
                        </p>
                    </a>
                    <ul class="nav nav-treeview">
                        <li class="nav-item">
                            <a href="{{ route('operator.reports.index') }}" class="nav-link {{ request()->routeIs('operator.reports.index') ? 'active' : '' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Pilih Laporan</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('operator.reports.daily', ['date' => date('Y-m-d')]) }}" class="nav-link {{ request()->routeIs('operator.reports.daily') ? 'active' : '' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Laporan Harian</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('operator.reports.monthly', ['month' => date('Y-m')]) }}" class="nav-link {{ request()->routeIs('operator.reports.monthly') ? 'active' : '' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Laporan Bulanan</p>
                            </a>
                        </li>
                    </ul>
                </li>

                <!-- Account -->
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <i class="nav-icon fas fa-user-cog"></i>
                        <p>Pengaturan Akun</p>
                    </a>
                </li>

                <!-- Logout -->
                <li class="nav-item">
                    <a href="#" class="nav-link" onclick="event.preventDefault(); document.getElementById('sidebar-logout-form').submit();">
                        <i class="nav-icon fas fa-sign-out-alt"></i>
                        <p>Logout</p>
                    </a>
                    <form id="sidebar-logout-form" action="{{ route('operator.logout') }}" method="POST" class="d-none">
                        @csrf
                    </form>
                </li>
            </ul>
        </nav>
        <!-- /.sidebar-menu -->
    </div>
    <!-- /.sidebar -->
</aside>
