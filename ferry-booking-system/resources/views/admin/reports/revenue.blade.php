@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Laporan Pendapatan</h1>
        <form action="{{ route('admin.reports.revenue') }}" method="GET" class="d-inline">
            <input type="hidden" name="start_date" value="{{ $startDate->format('Y-m-d') }}">
            <input type="hidden" name="end_date" value="{{ $endDate->format('Y-m-d') }}">
            <input type="hidden" name="group_by" value="{{ $request->group_by }}">
            @if($request->route_id)
                <input type="hidden" name="route_id" value="{{ $request->route_id }}">
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
                    <h5>Pengelompokan:
                        @if($request->group_by == 'daily')
                            Harian
                        @elseif($request->group_by == 'weekly')
                            Mingguan
                        @elseif($request->group_by == 'monthly')
                            Bulanan
                        @endif
                    </h5>
                    @if($request->route_id)
                        <h5>Rute: {{ \App\Models\Route::find($request->route_id)->origin ?? '' }} - {{ \App\Models\Route::find($request->route_id)->destination ?? '' }}</h5>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Summary Cards -->
        <div class="col-xl-6 col-md-6 mb-4">
            <div class="card border-left-primary shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
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

        <div class="col-xl-6 col-md-6 mb-4">
            <div class="card border-left-success shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                Total Transaksi</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $totalTransactions }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-exchange-alt fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Revenue Chart -->
        <div class="col-xl-8 col-lg-7">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Grafik Pendapatan</h6>
                </div>
                <div class="card-body">
                    <div class="chart-area">
                        <canvas id="revenueChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filter Form -->
        <div class="col-xl-4 col-lg-5">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Filter Laporan</h6>
                </div>
                <div class="card-body">
                    <form action="{{ route('admin.reports.revenue') }}" method="GET">
                        <div class="mb-3">
                            <label for="start_date">Tanggal Mulai</label>
                            <input type="date" class="form-control" id="start_date" name="start_date" value="{{ $startDate->format('Y-m-d') }}" required>
                        </div>
                        <div class="mb-3">
                            <label for="end_date">Tanggal Akhir</label>
                            <input type="date" class="form-control" id="end_date" name="end_date" value="{{ $endDate->format('Y-m-d') }}" required>
                        </div>
                        <div class="mb-3">
                            <label for="route_id">Rute</label>
                            <select class="form-control" id="route_id" name="route_id">
                                <option value="">Semua Rute</option>
                                @foreach(\App\Models\Route::where('status', 'ACTIVE')->get() as $route)
                                    <option value="{{ $route->id }}" {{ $request->route_id == $route->id ? 'selected' : '' }}>
                                        {{ $route->origin }} - {{ $route->destination }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="group_by">Kelompokkan Berdasarkan</label>
                            <select class="form-control" id="group_by" name="group_by" required>
                                <option value="daily" {{ $request->group_by == 'daily' ? 'selected' : '' }}>Harian</option>
                                <option value="weekly" {{ $request->group_by == 'weekly' ? 'selected' : '' }}>Mingguan</option>
                                <option value="monthly" {{ $request->group_by == 'monthly' ? 'selected' : '' }}>Bulanan</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">Filter</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Revenue Table -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Detail Pendapatan</h6>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>
                                @if($request->group_by == 'daily')
                                    Tanggal
                                @elseif($request->group_by == 'weekly')
                                    Minggu
                                @elseif($request->group_by == 'monthly')
                                    Bulan
                                @endif
                            </th>
                            <th>Jumlah Transaksi</th>
                            <th>Total Pendapatan</th>
                            <th>Rata-rata per Transaksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($revenues as $revenue)
                        <tr>
                            <td>{{ $revenue->period }}</td>
                            <td>{{ $revenue->transaction_count }}</td>
                            <td>Rp {{ number_format($revenue->total_amount, 0, ',', '.') }}</td>
                            <td>Rp {{ number_format($revenue->transaction_count > 0 ? $revenue->total_amount / $revenue->transaction_count : 0, 0, ',', '.') }}</td>
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
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
$(document).ready(function() {
    $('#dataTable').DataTable();

    // Prepare chart data
    const labels = {!! json_encode($revenues->pluck('period')->toArray()) !!};
    const amounts = {!! json_encode($revenues->pluck('total_amount')->toArray()) !!};
    const transactions = {!! json_encode($revenues->pluck('transaction_count')->toArray()) !!};

    // Revenue Chart
    const ctx = document.getElementById('revenueChart').getContext('2d');
    const revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pendapatan (Rp)',
                    data: amounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Jumlah Transaksi',
                    data: transactions,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Pendapatan (Rp)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Jumlah Transaksi'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
});
</script>
@endsection
