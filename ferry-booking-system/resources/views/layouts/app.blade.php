<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Ferry Booking System') }}</title>

    <!-- Fonts -->
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet">

    <!-- Styles -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Font Awesome for icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

    <style>
        /* Sidebar styles */
        #sidebar-wrapper {
            min-height: 100vh;
            width: 250px;
            margin-left: -250px;
            transition: margin 0.25s ease-out;
            background-color: #343a40;
            color: #fff;
        }

        #sidebar-wrapper .sidebar-heading {
            padding: 0.875rem 1.25rem;
            font-size: 1.2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        #sidebar-wrapper .list-group {
            width: 250px;
        }

        #sidebar-wrapper .list-group-item {
            background-color: transparent;
            color: rgba(255, 255, 255, 0.5);
            border: none;
            padding: 0.75rem 1.25rem;
        }

        #sidebar-wrapper .list-group-item:hover {
            color: #fff;
            background-color: rgba(255, 255, 255, 0.1);
        }

        #sidebar-wrapper .list-group-item.active {
            color: #fff;
            background-color: rgba(255, 255, 255, 0.2);
        }

        #sidebar-wrapper .list-group-item i {
            margin-right: 0.5rem;
            width: 20px;
            text-align: center;
        }

        #wrapper {
            display: flex;
        }

        #wrapper.toggled #sidebar-wrapper {
            margin-left: 0;
        }

        #page-content-wrapper {
            min-width: 100vw;
            padding: 0;
        }

        .navbar-toggler {
            color: #fff;
            border-color: rgba(255, 255, 255, 0.1);
        }

        .sidebar-user {
            padding: 1rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-user .user-name {
            font-weight: 600;
            font-size: 1rem;
            margin-top: 0.5rem;
        }

        .sidebar-footer {
            margin-top: auto;
            padding: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dropdown-menu {
            background-color: #343a40;
        }

        .dropdown-item {
            color: rgba(255, 255, 255, 0.5);
        }

        .dropdown-item:hover {
            color: #fff;
            background-color: rgba(255, 255, 255, 0.1);
        }

        /* For mobile screens */
        @media (min-width: 768px) {
            #sidebar-wrapper {
                margin-left: 0;
            }

            #page-content-wrapper {
                min-width: 0;
                width: 100%;
            }

            #wrapper.toggled #sidebar-wrapper {
                margin-left: -250px;
            }
        }

        /* Sidebar Header styles */
        .sidebar-heading {
            background-color: #0d6efd; /* primary color for admin */
            color: white;
            padding: 15px;
            font-weight: bold;
            text-align: center;
        }

        /* Admin sidebar color */
        body.admin #sidebar-wrapper {
            background-color: #343a40;
        }
        body.admin .sidebar-heading {
            background-color: #dc3545; /* red for admin */
        }

        /* Operator sidebar color */
        body.operator #sidebar-wrapper {
            background-color: #343a40;
        }
        body.operator .sidebar-heading {
            background-color: #0d6efd; /* blue for operator */
        }
    </style>
</head>
<body class="{{ Auth::guard('admin')->check() ? 'admin' : (Auth::guard('operator')->check() ? 'operator' : '') }}">
    <div id="wrapper">
        <!-- Sidebar -->
        <div id="sidebar-wrapper">
            <div class="sidebar-heading">{{ config('app.name', 'Ferry Booking System') }}</div>

            <div class="list-group list-group-flush">
                @if(Auth::guard('admin')->check())
                    <!-- Admin Menu -->
                    <a href="{{ route('admin.dashboard') }}" class="list-group-item list-group-item-action {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a>
                    <a href="{{ route('admin.routes.index') }}" class="list-group-item list-group-item-action {{ request()->routeIs('admin.routes.*') ? 'active' : '' }}">
                        <i class="fas fa-route"></i> Rute
                    </a>
                    <a href="{{ route('admin.ferries.index') }}" class="list-group-item list-group-item-action {{ request()->routeIs('admin.ferries.*') ? 'active' : '' }}">
                        <i class="fas fa-ship"></i> Kapal
                    </a>
                    <a href="{{ route('admin.schedules.index') }}" class="list-group-item list-group-item-action {{ request()->routeIs('admin.schedules.*') ? 'active' : '' }}">
                        <i class="fas fa-calendar-alt"></i> Jadwal
                    </a>
                    <a href="{{ route('admin.bookings.index') }}" class="list-group-item list-group-item-action {{ request()->routeIs('admin.bookings.*') ? 'active' : '' }}">
                        <i class="fas fa-ticket-alt"></i> Booking
                    </a>
                    <a href="{{ route('admin.reports.index') }}" class="list-group-item list-group-item-action {{ request()->routeIs('admin.reports.*') ? 'active' : '' }}">
                        <i class="fas fa-chart-bar"></i> Laporan
                    </a>
                    <a href="{{ route('admin.users.index') }}" class="list-group-item list-group-item-action {{ request()->routeIs('admin.users.*') ? 'active' : '' }}">
                        <i class="fas fa-users"></i> Pengguna
                    </a>

                    @if(auth()->guard('admin')->user()->is_super_admin ?? false)
                    <a href="#adminSubmenu" data-bs-toggle="collapse" class="list-group-item list-group-item-action">
                        <i class="fas fa-user-cog"></i> Manajemen Admin
                        <i class="fas fa-angle-down float-end"></i>
                    </a>
                    <div class="collapse {{ request()->routeIs('admin.admins.*') || request()->routeIs('admin.operators.*') ? 'show' : '' }}" id="adminSubmenu">
                        <a href="{{ route('admin.admins.index') }}" class="list-group-item list-group-item-action ps-4 {{ request()->routeIs('admin.admins.*') ? 'active' : '' }}">
                            <i class="fas fa-user-shield"></i> Admin
                        </a>
                        <a href="{{ route('admin.operators.index') }}" class="list-group-item list-group-item-action ps-4 {{ request()->routeIs('admin.operators.*') ? 'active' : '' }}">
                            <i class="fas fa-user-tie"></i> Operator
                        </a>
                    </div>
                    @endif

                @elseif(Auth::guard('operator')->check())
                    <!-- Operator Menu -->
                    <a href="{{ route('operator.dashboard') }}" class="list-group-item list-group-item-action {{ request()->routeIs('operator.dashboard') ? 'active' : '' }}">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a>
                    <a href="{{ route('operator.schedules.index') }}" class="list-group-item list-group-item-action {{ request()->routeIs('operator.schedules.*') ? 'active' : '' }}">
                        <i class="fas fa-calendar-alt"></i> Jadwal
                    </a>
                    <a href="{{ route('operator.bookings.index') }}" class="list-group-item list-group-item-action {{ request()->routeIs('operator.bookings.*') ? 'active' : '' }}">
                        <i class="fas fa-ticket-alt"></i> Booking
                    </a>
                    <a href="{{ route('operator.bookings.check-in') }}" class="list-group-item list-group-item-action {{ request()->routeIs('operator.bookings.check-in') ? 'active' : '' }}">
                        <i class="fas fa-clipboard-check"></i> Check-in
                    </a>
                    <a href="{{ route('operator.reports.index') }}" class="list-group-item list-group-item-action {{ request()->routeIs('operator.reports.*') ? 'active' : '' }}">
                        <i class="fas fa-chart-bar"></i> Laporan
                    </a>
                @else
                    <!-- Guest Menu -->
                    <div class="list-group-item">
                        <h6 class="mb-0">Login Sebagai</h6>
                    </div>
                    <a href="{{ route('admin.login') }}" class="list-group-item list-group-item-action">
                        <i class="fas fa-user-shield"></i> Admin
                    </a>
                    <a href="{{ route('operator.login') }}" class="list-group-item list-group-item-action">
                        <i class="fas fa-user-tie"></i> Operator
                    </a>
                @endif
            </div>

            @if(Auth::guard('admin')->check() || Auth::guard('operator')->check())
                <div class="sidebar-footer">
                    @if(Auth::guard('admin')->check())
                        <form id="logout-form" action="{{ route('admin.logout') }}" method="POST">
                            @csrf
                            <button type="submit" class="btn btn-sm btn-danger w-100">
                                <i class="fas fa-sign-out-alt me-1"></i> Logout
                            </button>
                        </form>
                    @elseif(Auth::guard('operator')->check())
                        <form id="logout-form" action="{{ route('operator.logout') }}" method="POST">
                            @csrf
                            <button type="submit" class="btn btn-sm btn-primary w-100">
                                <i class="fas fa-sign-out-alt me-1"></i> Logout
                            </button>
                        </form>
                    @endif
                </div>
            @endif
        </div>
        <!-- /#sidebar-wrapper -->

        <!-- Page Content -->
        <div id="page-content-wrapper">
            <nav class="navbar navbar-expand-md navbar-light bg-light border-bottom">
                <div class="container-fluid">
                    <button class="btn btn-outline-secondary" id="menu-toggle">
                        <i class="fas fa-bars"></i>
                    </button>

                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav ms-auto mt-2 mt-lg-0">
                            @if(Auth::guard('admin')->check())
                                <li class="nav-item">
                                    <span class="nav-link">Admin Panel</span>
                                </li>
                            @elseif(Auth::guard('operator')->check())
                                <li class="nav-item">
                                    <span class="nav-link">Operator Panel</span>
                                </li>
                            @endif
                        </ul>
                    </div>
                </div>
            </nav>

            <div class="container-fluid p-4">
                @yield('content')
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
            const menuToggle = document.getElementById('menu-toggle');
            const wrapper = document.getElementById('wrapper');

            if(menuToggle && wrapper) {
                menuToggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    wrapper.classList.toggle('toggled');
                });
            }

            // Add event listener for collapse menus if using Bootstrap 5
            const collapseElementList = [].slice.call(document.querySelectorAll('.collapse'));
            collapseElementList.map(function(collapseEl) {
                return new bootstrap.Collapse(collapseEl, {
                    toggle: false
                });
            });
        });
    </script>

    @yield('scripts')
</body>
</html>
