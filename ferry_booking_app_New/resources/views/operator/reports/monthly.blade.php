@extends('layouts.app')

@section('title', 'Laporan Bulanan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Laporan Bulanan: {{ $month->format('F Y') }}</h3>
                    <div class="card-tools">
                        <a href="{{ route('operator.reports.index') }}" class="btn btn-sm btn-default">
                            <i class="fas fa-arrow-left"></i> Kembali
                        </a>
                        <a href="{{ route('operator.reports.monthly', ['month' => $month->format('Y-m'), 'export' => 'csv']) }}" class="btn btn-sm btn-success">
                            <i class="fas fa-file-csv"></i> Export CSV
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    @if(empty($routeData))
                        <div class="alert alert-info">
                            <h5><i class="icon fas fa-info"></i> Informasi</h5>
                            Tidak ada data yang tersedia untuk bulan ini.
                        </div>
                    @else
                        <!-- Summary Cards -->
                        <div class="row">
                            <div class="col-md-3">
                                <div class="small-box bg-info">
                                    <div class="inner">
                                        <h3>{{ array_sum(array_map(function($route) { return $route['total_passengers']; }, $routeData)) }}</h3>
                                        <p>Total Penumpang</p>
                                    </div>
                                    <div class="icon">
                                        <i class="fas fa-users"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="small-box bg-success">
                                    <div class="inner">
                                        <h3>{{ array_sum(array_map(function($route) { return $route['total_vehicles']; }, $routeData)) }}</h3>
                                        <p>Total Kendaraan</p>
                                    </div>
                                    <div class="icon">
                                        <i class="fas fa-car"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="small-box bg-warning">
                                    <div class="inner">
                                        <h3>{{ count($routeData) }}</h3>
                                        <p>Rute Aktif</p>
                                    </div>
                                    <div class="icon">
                                        <i class="fas fa-route"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="small-box bg-danger">
                                    <div class="inner">
                                        <h3>Rp {{ number_format(array_sum(array_map(function($route) { return $route['total_amount']; }, $routeData)), 0, ',', '.') }}</h3>
                                        <p>Total Pendapatan</p>
                                    </div>
                                    <div class="icon">
                                        <i class="fas fa-money-bill"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Routes Data -->
                        @foreach($routeData as $routeId => $data)
                            <div class="card mt-4">
                                <div class="card-header bg-primary">
                                    <h3 class="card-title">Rute: {{ $data['route']->origin }} - {{ $data['route']->destination }}</h3>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="info-box">
                                                <span class="info-box-icon bg-info"><i class="fas fa-users"></i></span>
                                                <div class="info-box-content">
                                                    <span class="info-box-text">Total Penumpang</span>
                                                    <span class="info-box-number">{{ $data['total_passengers'] }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="info-box">
                                                <span class="info-box-icon bg-success"><i class="fas fa-car"></i></span>
                                                <div class="info-box-content">
                                                    <span class="info-box-text">Total Kendaraan</span>
                                                    <span class="info-box-number">{{ $data['total_vehicles'] }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="info-box">
                                                <span class="info-box-icon bg-danger"><i class="fas fa-money-bill"></i></span>
                                                <div class="info-box-content">
                                                    <span class="info-box-text">Total Pendapatan</span>
                                                    <span class="info-box-number">Rp {{ number_format($data['total_amount'], 0, ',', '.') }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="table-responsive mt-3">
                                        <table class="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Tanggal</th>
                                                    <th>Total Penumpang</th>
                                                    <th>Total Kendaraan</th>
                                                    <th>Total Pendapatan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @php
                                                    // Sort dates
                                                    ksort($data['dates']);
                                                @endphp
                                                @foreach($data['dates'] as $date => $dateData)
                                                <tr>
                                                    <td>{{ \Carbon\Carbon::parse($date)->format('d F Y') }}</td>
                                                    <td>{{ $dateData['passengers'] }}</td>
                                                    <td>{{ $dateData['vehicles'] }}</td>
                                                    <td>Rp {{ number_format($dateData['amount'], 0, ',', '.') }}</td>
                                                </tr>
                                                @endforeach
                                                <tr class="bg-light">
                                                    <th>Total</th>
                                                    <th>{{ $data['total_passengers'] }}</th>
                                                    <th>{{ $data['total_vehicles'] }}</th>
                                                    <th>Rp {{ number_format($data['total_amount'], 0, ',', '.') }}</th>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    $(function() {
        // Charts could be added here if needed
    });
</script>
@endsection
