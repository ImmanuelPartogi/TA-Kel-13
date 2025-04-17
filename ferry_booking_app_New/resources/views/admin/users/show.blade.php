@extends('layouts.sidebar')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Detail Pengguna</h1>
        <div>
            <a href="{{ route('admin.users.edit', $user->id) }}" class="btn btn-primary shadow-sm">
                <i class="fas fa-edit fa-sm text-white-50"></i> Edit
            </a>
            <a href="{{ route('admin.users.index') }}" class="btn btn-secondary shadow-sm">
                <i class="fas fa-arrow-left fa-sm text-white-50"></i> Kembali
            </a>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-4">
            <!-- User Profile Card -->
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Profil Pengguna</h6>
                </div>
                <div class="card-body">
                    <div class="text-center mb-4">
                        @if($user->profile_picture)
                            <img src="{{ asset('storage/' . $user->profile_picture) }}" alt="{{ $user->name }}" class="img-profile rounded-circle" style="width: 150px; height: 150px; object-fit: cover;">
                        @else
                            <div class="img-profile rounded-circle d-flex justify-content-center align-items-center bg-primary text-white mx-auto" style="width: 150px; height: 150px; font-size: 4rem;">
                                {{ strtoupper(substr($user->name, 0, 1)) }}
                            </div>
                        @endif
                        <h4 class="mt-3">{{ $user->name }}</h4>
                        <p class="text-muted">
                            Member sejak {{ $user->created_at->format('d M Y') }}
                        </p>
                    </div>

                    <div class="mb-2 row">
                        <label class="col-sm-4 col-form-label fw-bold">Email:</label>
                        <div class="col-sm-8">
                            <p class="form-control-static">{{ $user->email }}</p>
                        </div>
                    </div>
                    <div class="mb-2 row">
                        <label class="col-sm-4 col-form-label fw-bold">Telepon:</label>
                        <div class="col-sm-8">
                            <p class="form-control-static">{{ $user->phone ?? 'Tidak ada' }}</p>
                        </div>
                    </div>
                    <div class="mb-2 row">
                        <label class="col-sm-4 col-form-label fw-bold">Alamat:</label>
                        <div class="col-sm-8">
                            <p class="form-control-static">{{ $user->address ?? 'Tidak ada' }}</p>
                        </div>
                    </div>
                    <div class="mb-2 row">
                        <label class="col-sm-4 col-form-label fw-bold">Nomor Identitas:</label>
                        <div class="col-sm-8">
                            <p class="form-control-static">
                                @if($user->id_number && $user->id_type)
                                    {{ $user->id_type }}: {{ $user->id_number }}
                                @else
                                    Tidak ada
                                @endif
                            </p>
                        </div>
                    </div>
                    <div class="mb-2 row">
                        <label class="col-sm-4 col-form-label fw-bold">Tanggal Lahir:</label>
                        <div class="col-sm-8">
                            <p class="form-control-static">{{ $user->date_of_birthday ? $user->date_of_birthday->format('d M Y') : 'Tidak ada' }}</p>
                        </div>
                    </div>
                    <div class="mb-2 row">
                        <label class="col-sm-4 col-form-label fw-bold">Jenis Kelamin:</label>
                        <div class="col-sm-8">
                            <p class="form-control-static">
                                @if($user->gender == 'MALE')
                                    Laki-laki
                                @elseif($user->gender == 'FEMALE')
                                    Perempuan
                                @else
                                    Tidak ada
                                @endif
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- User Stats Card -->
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Statistik Pengguna</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="card border-left-primary shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                Total Booking</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $user->bookings->count() }}</div>
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
                                                Booking Aktif</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                                {{ $user->bookings->whereIn('status', ['PENDING', 'CONFIRMED'])->count() }}
                                            </div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-clipboard-check fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="card border-left-info shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                                Booking Selesai</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                                {{ $user->bookings->where('status', 'COMPLETED')->count() }}
                                            </div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-check-circle fa-2x text-gray-300"></i>
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
                                                Booking Dibatalkan</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                                {{ $user->bookings->where('status', 'CANCELLED')->count() }}
                                            </div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-ban fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-8">
            <!-- User Bookings -->
            <div class="card shadow mb-4">
                <div class="card-header py-3 d-flex justify-content-between align-items-center">
                    <h6 class="m-0 font-weight-bold text-primary">Riwayat Booking</h6>
                </div>
                <div class="card-body">
                    @if($user->bookings->isEmpty())
                        <p class="text-center py-3">Pengguna ini belum memiliki booking</p>
                    @else
                        <div class="table-responsive">
                            <table class="table table-bordered" width="100%" cellspacing="0">
                                <thead>
                                    <tr>
                                        <th>Kode Booking</th>
                                        <th>Rute</th>
                                        <th>Tanggal</th>
                                        <th>Jumlah Penumpang</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($user->bookings as $booking)
                                        <tr>
                                            <td>{{ $booking->booking_code }}</td>
                                            <td>{{ $booking->schedule->route->origin }} - {{ $booking->schedule->route->destination }}</td>
                                            <td>{{ \Carbon\Carbon::parse($booking->booking_date)->format('d M Y') }}</td>
                                            <td>{{ $booking->passenger_count }}</td>
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
                                            <td>
                                                <a href="{{ route('admin.bookings.show', $booking->id) }}" class="btn btn-info btn-sm">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif
                </div>
            </div>

            <!-- User Vehicles -->
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Kendaraan Terdaftar</h6>
                </div>
                <div class="card-body">
                    @if($user->vehicles->isEmpty())
                        <p class="text-center py-3">Pengguna ini belum mendaftarkan kendaraan</p>
                    @else
                        <div class="table-responsive">
                            <table class="table table-bordered" width="100%" cellspacing="0">
                                <thead>
                                    <tr>
                                        <th>Jenis</th>
                                        <th>Plat Nomor</th>
                                        <th>Merk</th>
                                        <th>Model</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($user->vehicles->unique('license_plate') as $vehicle)
                                        <tr>
                                            <td>
                                                @if($vehicle->type == 'MOTORCYCLE')
                                                    <span class="badge bg-primary">Motor</span>
                                                @elseif($vehicle->type == 'CAR')
                                                    <span class="badge bg-success">Mobil</span>
                                                @elseif($vehicle->type == 'BUS')
                                                    <span class="badge bg-warning text-dark">Bus</span>
                                                @elseif($vehicle->type == 'TRUCK')
                                                    <span class="badge bg-danger">Truk</span>
                                                @endif
                                            </td>
                                            <td>{{ $vehicle->license_plate }}</td>
                                            <td>{{ $vehicle->brand ?? 'N/A' }}</td>
                                            <td>{{ $vehicle->model ?? 'N/A' }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
