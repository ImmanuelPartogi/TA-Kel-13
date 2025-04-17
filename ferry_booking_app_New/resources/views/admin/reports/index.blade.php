@extends('layouts.sidebar')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Laporan</h1>
    </div>

    <div class="row">
        <div class="col-md-4 mb-4">
            <div class="card shadow h-100">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Laporan Booking</h6>
                </div>
                <div class="card-body">
                    <form action="{{ route('admin.reports.booking') }}" method="GET">
                        <div class="mb-3">
                            <label for="start_date" class="form-label">Tanggal Mulai <span class="text-danger">*</span></label>
                            <input type="date" class="form-control" id="start_date" name="start_date" value="{{ date('Y-m-01') }}" required>
                        </div>
                        <div class="mb-3">
                            <label for="end_date" class="form-label">Tanggal Akhir <span class="text-danger">*</span></label>
                            <input type="date" class="form-control" id="end_date" name="end_date" value="{{ date('Y-m-t') }}" required>
                        </div>
                        <div class="mb-3">
                            <label for="route_id" class="form-label">Rute</label>
                            <select class="form-control" id="route_id" name="route_id">
                                <option value="">Semua Rute</option>
                                @foreach($routes as $route)
                                    <option value="{{ $route->id }}">
                                        {{ $route->origin }} - {{ $route->destination }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="status" class="form-label">Status</label>
                            <select class="form-control" id="status" name="status">
                                <option value="">Semua Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="CANCELLED">Cancelled</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="REFUNDED">Refunded</option>
                            </select>
                        </div>
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-search fa-sm"></i> Lihat Laporan
                            </button>
                            <button type="submit" class="btn btn-success" name="export" value="csv">
                                <i class="fas fa-file-csv fa-sm"></i> Export CSV
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="col-md-4 mb-4">
            <div class="card shadow h-100">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Laporan Pendapatan</h6>
                </div>
                <div class="card-body">
                    <form action="{{ route('admin.reports.revenue') }}" method="GET">
                        <div class="mb-3">
                            <label for="start_date" class="form-label">Tanggal Mulai <span class="text-danger">*</span></label>
                            <input type="date" class="form-control" id="start_date" name="start_date" value="{{ date('Y-m-01') }}" required>
                        </div>
                        <div class="mb-3">
                            <label for="end_date" class="form-label">Tanggal Akhir <span class="text-danger">*</span></label>
                            <input type="date" class="form-control" id="end_date" name="end_date" value="{{ date('Y-m-t') }}" required>
                        </div>
                        <div class="mb-3">
                            <label for="route_id" class="form-label">Rute</label>
                            <select class="form-control" id="route_id" name="route_id">
                                <option value="">Semua Rute</option>
                                @foreach($routes as $route)
                                    <option value="{{ $route->id }}">
                                        {{ $route->origin }} - {{ $route->destination }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="group_by" class="form-label">Kelompokkan Berdasarkan <span class="text-danger">*</span></label>
                            <select class="form-control" id="group_by" name="group_by" required>
                                <option value="daily">Harian</option>
                                <option value="weekly">Mingguan</option>
                                <option value="monthly" selected>Bulanan</option>
                            </select>
                        </div>
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-search fa-sm"></i> Lihat Laporan
                            </button>
                            <button type="submit" class="btn btn-success" name="export" value="csv">
                                <i class="fas fa-file-csv fa-sm"></i> Export CSV
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="col-md-4 mb-4">
            <div class="card shadow h-100">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Laporan Jadwal</h6>
                </div>
                <div class="card-body">
                    <form action="{{ route('admin.reports.schedule') }}" method="GET">
                        <div class="mb-3">
                            <label for="start_date" class="form-label">Tanggal Mulai <span class="text-danger">*</span></label>
                            <input type="date" class="form-control" id="start_date" name="start_date" value="{{ date('Y-m-01') }}" required>
                        </div>
                        <div class="mb-3">
                            <label for="end_date" class="form-label">Tanggal Akhir <span class="text-danger">*</span></label>
                            <input type="date" class="form-control" id="end_date" name="end_date" value="{{ date('Y-m-t') }}" required>
                        </div>
                        <div class="mb-3">
                            <label for="route_id" class="form-label">Rute</label>
                            <select class="form-control" id="route_id" name="route_id">
                                <option value="">Semua Rute</option>
                                @foreach($routes as $route)
                                    <option value="{{ $route->id }}">
                                        {{ $route->origin }} - {{ $route->destination }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-search fa-sm"></i> Lihat Laporan
                            </button>
                            <button type="submit" class="btn btn-success" name="export" value="csv">
                                <i class="fas fa-file-csv fa-sm"></i> Export CSV
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6 mb-4">
            <div class="card shadow">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Statistik Cepat</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="card border-left-primary shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                Booking Bulan Ini</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                                {{ $stats['bookings_this_month'] }}
                                            </div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-calendar fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="card border-left-success shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                                Pendapatan Bulan Ini</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                                Rp {{ number_format($stats['revenue_this_month'], 0, ',', '.') }}
                                            </div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-money-bill fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="card border-left-info shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                                Booking Minggu Ini</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                                {{ $stats['bookings_this_week'] }}
                                            </div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-clipboard-list fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="card border-left-warning shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                                Booking Hari Ini</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                                {{ $stats['bookings_today'] }}
                                            </div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-ticket-alt fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-6 mb-4">
            <div class="card shadow">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Rute Populer</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered" width="100%" cellspacing="0">
                            <thead>
                                <tr>
                                    <th>Rute</th>
                                    <th>Jumlah Booking</th>
                                    <th>Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                @if(count($popularRoutes) > 0)
                                    @foreach($popularRoutes as $route)
                                        <tr>
                                            <td>{{ $route->origin }} - {{ $route->destination }}</td>
                                            <td>{{ $route->booking_count }}</td>
                                            <td>Rp {{ number_format($route->total_revenue, 0, ',', '.') }}</td>
                                        </tr>
                                    @endforeach
                                @else
                                    <tr>
                                        <td colspan="3" class="text-center">Tidak ada data</td>
                                    </tr>
                                @endif
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
