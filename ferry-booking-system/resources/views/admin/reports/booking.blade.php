@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Laporan Booking</h1>
        <form action="{{ route('admin.reports.booking') }}" method="GET" class="d-inline">
            <input type="hidden" name="start_date" value="{{ $startDate->format('Y-m-d') }}">
            <input type="hidden" name="end_date" value="{{ $endDate->format('Y-m-d') }}">
            @if(request('route_id'))
                <input type="hidden" name="route_id" value="{{ request('route_id') }}">
            @endif
            @if(request('status'))
                <input type="hidden" name="status" value="{{ request('status') }}">
            @endif
            <button type="submit" class="d-none d-sm-inline-block btn btn-sm btn-success shadow-sm" name="export" value="csv">
                <i class="fas fa-download fa-sm text-white-50"></i> Export CSV
            </button>
        </form>
    </div>

    <div class="row">
        <!-- Date range info -->
        <div class="col-md-12 mb-4">
            <div class="card shadow">
                <div class="card-body">
                    <h5>Periode: {{ $startDate->format('d F Y') }} - {{ $endDate->format('d F Y') }}</h5>
                    @if(request('route_id'))
                        <h5>Rute: {{ $bookings->first()?->schedule->route->origin ?? '' }} - {{ $bookings->first()?->schedule->route->destination ?? '' }}</h5>
                    @endif
                    @if(request('status'))
                        <h5>Status: {{ request('status') }}</h5>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Summary Cards -->
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-primary shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                Total Booking</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $totalBookings }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-calendar fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-success shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                Total Pendapatan</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-info shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                Total Penumpang</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $totalPassengers }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-users fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-warning shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                Total Kendaraan</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $totalVehicles }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-car fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Status Breakdown -->
        <div class="col-lg-6 mb-4">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Breakdown Status</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered" width="100%" cellspacing="0">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Jumlah</th>
                                    <th>Total Nilai</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($statusCount as $item)
                                <tr>
                                    <td>{{ $item['status'] }}</td>
                                    <td>{{ $item['count'] }}</td>
                                    <td>Rp {{ number_format($item['amount'], 0, ',', '.') }}</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filter Form -->
        <div class="col-lg-6 mb-4">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Filter Laporan</h6>
                </div>
                <div class="card-body">
                    <form action="{{ route('admin.reports.booking') }}" method="GET">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="start_date">Tanggal Mulai</label>
                                <input type="date" class="form-control" id="start_date" name="start_date" value="{{ $startDate->format('Y-m-d') }}" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="end_date">Tanggal Akhir</label>
                                <input type="date" class="form-control" id="end_date" name="end_date" value="{{ $endDate->format('Y-m-d') }}" required>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="route_id">Rute</label>
                                <select class="form-control" id="route_id" name="route_id">
                                    <option value="">Semua Rute</option>
                                    @foreach(\App\Models\Route::where('status', 'ACTIVE')->get() as $route)
                                        <option value="{{ $route->id }}" {{ request('route_id') == $route->id ? 'selected' : '' }}>
                                            {{ $route->origin }} - {{ $route->destination }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="status">Status</label>
                                <select class="form-control" id="status" name="status">
                                    <option value="">Semua Status</option>
                                    <option value="PENDING" {{ request('status') == 'PENDING' ? 'selected' : '' }}>Pending</option>
                                    <option value="CONFIRMED" {{ request('status') == 'CONFIRMED' ? 'selected' : '' }}>Confirmed</option>
                                    <option value="CANCELLED" {{ request('status') == 'CANCELLED' ? 'selected' : '' }}>Cancelled</option>
                                    <option value="COMPLETED" {{ request('status') == 'COMPLETED' ? 'selected' : '' }}>Completed</option>
                                    <option value="REFUNDED" {{ request('status') == 'REFUNDED' ? 'selected' : '' }}>Refunded</option>
                                    <option value="RESCHEDULED" {{ request('status') == 'RESCHEDULED' ? 'selected' : '' }}>Rescheduled</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">Filter</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Bookings Table -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Daftar Booking</h6>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Kode Booking</th>
                            <th>Pengguna</th>
                            <th>Rute</th>
                            <th>Jadwal</th>
                            <th>Tanggal</th>
                            <th>Penumpang</th>
                            <th>Kendaraan</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($bookings as $booking)
                        <tr>
                            <td>{{ $booking->booking_code }}</td>
                            <td>{{ $booking->user->name }}</td>
                            <td>{{ $booking->schedule->route->origin }} - {{ $booking->schedule->route->destination }}</td>
                            <td>{{ $booking->schedule->departure_time }} - {{ $booking->schedule->arrival_time }}</td>
                            <td>{{ \Carbon\Carbon::parse($booking->booking_date)->format('d M Y') }}</td>
                            <td>{{ $booking->passenger_count }}</td>
                            <td>{{ $booking->vehicle_count }}</td>
                            <td>Rp {{ number_format($booking->total_amount, 0, ',', '.') }}</td>
                            <td>
                                <span class="badge
                                    @if($booking->status == 'CONFIRMED') badge-success
                                    @elseif($booking->status == 'PENDING') badge-warning
                                    @elseif($booking->status == 'CANCELLED') badge-danger
                                    @elseif($booking->status == 'COMPLETED') badge-info
                                    @elseif($booking->status == 'RESCHEDULED') badge-primary
                                    @else badge-secondary @endif
                                ">
                                    {{ $booking->status }}
                                </span>
                            </td>
                            <td>
                                <a href="{{ route('admin.bookings.show', $booking->id) }}" class="btn btn-sm btn-info">
                                    <i class="fas fa-eye"></i>
                                </a>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    $(document).ready(function() {
        $('#dataTable').DataTable();
    });
</script>
@endsection
