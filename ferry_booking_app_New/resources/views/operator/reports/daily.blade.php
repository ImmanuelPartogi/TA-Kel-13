@extends('layouts.app')

@section('title', 'Laporan Harian')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Laporan Harian: {{ $date->format('d F Y') }}</h3>
                    <div class="card-tools">
                        <a href="{{ route('operator.reports.index') }}" class="btn btn-sm btn-default">
                            <i class="fas fa-arrow-left"></i> Kembali
                        </a>
                        <a href="{{ route('operator.reports.daily', ['date' => $date->format('Y-m-d'), 'export' => 'csv']) }}" class="btn btn-sm btn-success">
                            <i class="fas fa-file-csv"></i> Export CSV
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    @if($reportData->isEmpty())
                        <div class="alert alert-info">
                            <h5><i class="icon fas fa-info"></i> Informasi</h5>
                            Tidak ada data jadwal yang tersedia untuk tanggal ini.
                        </div>
                    @else
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Rute</th>
                                        <th>Kapal</th>
                                        <th>Jadwal</th>
                                        <th>Total Penumpang</th>
                                        <th>Penumpang Check-in</th>
                                        <th>Total Kendaraan</th>
                                        <th>Detail Kendaraan</th>
                                        <th>Okupansi (%)</th>
                                        <th>Total Booking</th>
                                        <th>Detail Booking</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($reportData as $data)
                                    <tr>
                                        <td>{{ $data['schedule']->route->origin }} - {{ $data['schedule']->route->destination }}</td>
                                        <td>{{ $data['schedule']->ferry->name }}</td>
                                        <td>{{ $data['schedule']->departure_time }} - {{ $data['schedule']->arrival_time }}</td>
                                        <td>{{ $data['passengers'] }}</td>
                                        <td>{{ $data['checked_in_passengers'] }}</td>
                                        <td>{{ $data['vehicles'] }}</td>
                                        <td>
                                            <ul class="list-unstyled">
                                                <li>Motor: {{ $data['motorcycle_count'] }}</li>
                                                <li>Mobil: {{ $data['car_count'] }}</li>
                                                <li>Bus: {{ $data['bus_count'] }}</li>
                                                <li>Truk: {{ $data['truck_count'] }}</li>
                                            </ul>
                                        </td>
                                        <td>{{ number_format($data['occupancy_rate'], 2) }}%</td>
                                        <td>{{ $data['total_bookings'] }}</td>
                                        <td>
                                            <ul class="list-unstyled">
                                                <li>Confirmed: {{ $data['confirmed_bookings'] }}</li>
                                                <li>Completed: {{ $data['completed_bookings'] }}</li>
                                                <li>Cancelled: {{ $data['cancelled_bookings'] }}</li>
                                            </ul>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>

                        <!-- Detail bookings for each schedule -->
                        @foreach($reportData as $index => $data)
                            @if($data['bookings']->isNotEmpty())
                                <div class="mt-4">
                                    <h5>Detail Booking: {{ $data['schedule']->route->origin }} - {{ $data['schedule']->route->destination }} ({{ $data['schedule']->departure_time }})</h5>
                                    <div class="table-responsive">
                                        <table class="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Kode Booking</th>
                                                    <th>Pengguna</th>
                                                    <th>Tanggal</th>
                                                    <th>Penumpang</th>
                                                    <th>Kendaraan</th>
                                                    <th>Total</th>
                                                    <th>Status</th>
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @foreach($data['bookings'] as $booking)
                                                <tr>
                                                    <td>{{ $booking->booking_code }}</td>
                                                    <td>{{ $booking->user->name }}</td>
                                                    <td>{{ \Carbon\Carbon::parse($booking->booking_date)->format('d M Y') }}</td>
                                                    <td>{{ $booking->passenger_count }}</td>
                                                    <td>{{ $booking->vehicles->count() }}</td>
                                                    <td>Rp {{ number_format($booking->total_amount, 0, ',', '.') }}</td>
                                                    <td>
                                                        @if($booking->status == 'PENDING')
                                                            <span class="badge badge-warning">Menunggu</span>
                                                        @elseif($booking->status == 'CONFIRMED')
                                                            <span class="badge badge-success">Dikonfirmasi</span>
                                                        @elseif($booking->status == 'COMPLETED')
                                                            <span class="badge badge-info">Selesai</span>
                                                        @elseif($booking->status == 'CANCELLED')
                                                            <span class="badge badge-danger">Dibatalkan</span>
                                                        @endif
                                                    </td>
                                                    <td>
                                                        <a href="{{ route('operator.bookings.show', $booking->id) }}" class="btn btn-sm btn-info">
                                                            <i class="fas fa-eye"></i> Detail
                                                        </a>
                                                    </td>
                                                </tr>
                                                @endforeach
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            @endif
                        @endforeach
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
