@extends('layouts.app')

@section('title', 'Daftar Booking')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Daftar Booking</h3>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-12">
                            <form action="{{ route('operator.bookings.index') }}" method="GET" class="form-inline">
                                <div class="row">
                                    <div class="col-md-3 mb-2">
                                        <input type="text" name="booking_code" value="{{ request('booking_code') }}" class="form-control w-100" placeholder="Kode Booking">
                                    </div>
                                    <div class="col-md-3 mb-2">
                                        <input type="text" name="user_name" value="{{ request('user_name') }}" class="form-control w-100" placeholder="Nama Pengguna">
                                    </div>
                                    <div class="col-md-3 mb-2">
                                        <select name="route_id" class="form-control w-100">
                                            <option value="">Semua Rute</option>
                                            @foreach(Auth::guard('operator')->user()->assignedRoutes ?? [] as $routeId => $routeName)
                                                <option value="{{ $routeId }}" {{ request('route_id') == $routeId ? 'selected' : '' }}>
                                                    {{ $routeName }}
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <div class="col-md-3 mb-2">
                                        <select name="status" class="form-control w-100">
                                            <option value="">Semua Status</option>
                                            <option value="PENDING" {{ request('status') == 'PENDING' ? 'selected' : '' }}>Menunggu</option>
                                            <option value="CONFIRMED" {{ request('status') == 'CONFIRMED' ? 'selected' : '' }}>Dikonfirmasi</option>
                                            <option value="COMPLETED" {{ request('status') == 'COMPLETED' ? 'selected' : '' }}>Selesai</option>
                                            <option value="CANCELLED" {{ request('status') == 'CANCELLED' ? 'selected' : '' }}>Dibatalkan</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row mt-2">
                                    <div class="col-md-3 mb-2">
                                        <input type="date" name="booking_date_from" value="{{ request('booking_date_from') }}" class="form-control w-100" placeholder="Tanggal Booking Dari">
                                    </div>
                                    <div class="col-md-3 mb-2">
                                        <input type="date" name="booking_date_to" value="{{ request('booking_date_to') }}" class="form-control w-100" placeholder="Tanggal Booking Sampai">
                                    </div>
                                    <div class="col-md-6 mb-2">
                                        <button type="submit" class="btn btn-primary mr-2">Filter</button>
                                        <a href="{{ route('operator.bookings.index') }}" class="btn btn-secondary">Reset</a>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Kode Booking</th>
                                    <th>Pengguna</th>
                                    <th>Rute</th>
                                    <th>Tanggal</th>
                                    <th>Penumpang</th>
                                    <th>Kendaraan</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($bookings as $booking)
                                <tr>
                                    <td>{{ $booking->booking_code }}</td>
                                    <td>{{ $booking->user->name }}</td>
                                    <td>{{ $booking->schedule->route->origin }} - {{ $booking->schedule->route->destination }}</td>
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
                                @empty
                                <tr>
                                    <td colspan="9" class="text-center">Tidak ada data booking</td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <div class="mt-4">
                        {{ $bookings->appends(request()->query())->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    $(function() {
        // Any additional JavaScript you need
    });
</script>
@endsection
