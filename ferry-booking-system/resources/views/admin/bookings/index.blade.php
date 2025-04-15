@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Manajemen Booking</h1>
        <a href="{{ route('admin.bookings.create') }}" class="d-none d-sm-inline-block btn btn-primary shadow-sm">
            <i class="fas fa-plus fa-sm text-white-50"></i> Tambah Booking
        </a>
    </div>

    <!-- Search Form -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Filter Booking</h6>
        </div>
        <div class="card-body">
            <form action="{{ route('admin.bookings.index') }}" method="GET">
                <div class="row">
                    <div class="col-md-3 mb-3">
                        <label for="booking_code">Kode Booking</label>
                        <input type="text" class="form-control" id="booking_code" name="booking_code" value="{{ request('booking_code') }}">
                    </div>
                    <div class="col-md-3 mb-3">
                        <label for="user_name">Nama Pengguna</label>
                        <input type="text" class="form-control" id="user_name" name="user_name" value="{{ request('user_name') }}">
                    </div>
                    <div class="col-md-3 mb-3">
                        <label for="route_id">Rute</label>
                        <select class="form-control" id="route_id" name="route_id">
                            <option value="">Semua Rute</option>
                            @foreach($routes as $route)
                                <option value="{{ $route->id }}" {{ request('route_id') == $route->id ? 'selected' : '' }}>
                                    {{ $route->origin }} - {{ $route->destination }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-3 mb-3">
                        <label for="status">Status</label>
                        <select class="form-control" id="status" name="status">
                            <option value="">Semua Status</option>
                            <option value="PENDING" {{ request('status') == 'PENDING' ? 'selected' : '' }}>Pending</option>
                            <option value="CONFIRMED" {{ request('status') == 'CONFIRMED' ? 'selected' : '' }}>Confirmed</option>
                            <option value="CANCELLED" {{ request('status') == 'CANCELLED' ? 'selected' : '' }}>Cancelled</option>
                            <option value="COMPLETED" {{ request('status') == 'COMPLETED' ? 'selected' : '' }}>Completed</option>
                            <option value="REFUNDED" {{ request('status') == 'REFUNDED' ? 'selected' : '' }}>Refunded</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3 mb-3">
                        <label for="booking_date_from">Tanggal Booking Dari</label>
                        <input type="date" class="form-control" id="booking_date_from" name="booking_date_from" value="{{ request('booking_date_from') }}">
                    </div>
                    <div class="col-md-3 mb-3">
                        <label for="booking_date_to">Tanggal Booking Sampai</label>
                        <input type="date" class="form-control" id="booking_date_to" name="booking_date_to" value="{{ request('booking_date_to') }}">
                    </div>
                    <div class="col-md-6 mb-3 d-flex align-items-end">
                        <button type="submit" class="btn btn-primary me-2">
                            <i class="fas fa-search fa-sm"></i> Cari
                        </button>
                        <a href="{{ route('admin.bookings.index') }}" class="btn btn-secondary">
                            <i class="fas fa-sync-alt fa-sm"></i> Reset
                        </a>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Booking List -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Daftar Booking</h6>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Kode Booking</th>
                            <th>Pengguna</th>
                            <th>Rute</th>
                            <th>Tanggal</th>
                            <th>Jumlah Penumpang</th>
                            <th>Jumlah Kendaraan</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Dibuat Pada</th>
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
                                <td>{{ $booking->vehicle_count }}</td>
                                <td>Rp {{ number_format($booking->total_amount, 0, ',', '.') }}</td>
                                <td>
                                    @if($booking->status == 'PENDING')
                                        <span class="badge bg-warning text-dark">Pending</span>
                                    @elseif($booking->status == 'CONFIRMED')
                                        <span class="badge bg-success">Confirmed</span>
                                    @elseif($booking->status == 'CANCELLED')
                                        <span class="badge bg-danger">Cancelled</span>
                                    @elseif($booking->status == 'COMPLETED')
                                        <span class="badge bg-info">Completed</span>
                                    @elseif($booking->status == 'REFUNDED')
                                        <span class="badge bg-secondary">Refunded</span>
                                    @endif
                                </td>
                                <td>{{ $booking->created_at->format('d M Y H:i') }}</td>
                                <td>
                                    <a href="{{ route('admin.bookings.show', $booking->id) }}" class="btn btn-info btn-sm">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="10" class="text-center">Tidak ada data booking</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-3">
                {{ $bookings->appends(request()->except('page'))->links() }}
            </div>
        </div>
    </div>
</div>
@endsection
