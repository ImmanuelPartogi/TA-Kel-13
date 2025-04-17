@extends('layouts.sidebar')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Detail Booking</h1>
        <div>
            <a href="{{ route('admin.bookings.index') }}" class="btn btn-secondary">
                <i class="fas fa-arrow-left fa-sm"></i> Kembali
            </a>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if($errors->any())
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <ul class="mb-0">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <!-- Booking Info -->
    <div class="row">
        <div class="col-lg-8">
            <div class="card shadow mb-4">
                <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 class="m-0 font-weight-bold text-primary">Informasi Booking</h6>
                    <div class="dropdown no-arrow">
                        <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
                            data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                        </a>
                        <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in"
                            aria-labelledby="dropdownMenuLink">
                            <a class="dropdown-item" href="#">Cetak Tiket</a>
                            <a class="dropdown-item" href="#">Kirim Email</a>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item text-danger" href="#">Batalkan Booking</a>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-3 fw-bold">Kode Booking:</div>
                        <div class="col-md-9">{{ $booking->booking_code }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-3 fw-bold">Status:</div>
                        <div class="col-md-9">
                            @if($booking->status == 'PENDING')
                                <span class="badge bg-warning text-dark">Pending</span>
                            @elseif($booking->status == 'CONFIRMED')
                                <span class="badge bg-success">Confirmed</span>
                            @elseif($booking->status == 'CANCELLED')
                                <span class="badge bg-danger">Cancelled</span>
                                @if($booking->cancellation_reason)
                                    <small class="d-block mt-1">Alasan: {{ $booking->cancellation_reason }}</small>
                                @endif
                            @elseif($booking->status == 'COMPLETED')
                                <span class="badge bg-info">Completed</span>
                            @elseif($booking->status == 'REFUNDED')
                                <span class="badge bg-secondary">Refunded</span>
                            @endif
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-3 fw-bold">Dibuat Pada:</div>
                        <div class="col-md-9">{{ $booking->created_at->format('d M Y H:i') }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-3 fw-bold">Metode Booking:</div>
                        <div class="col-md-9">
                            {{ $booking->booked_by === 'USER' ? 'Online oleh Pengguna' : 'Counter oleh Admin' }}
                            ({{ $booking->booking_channel }})
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-3 fw-bold">Catatan:</div>
                        <div class="col-md-9">{{ $booking->notes ?? 'Tidak ada catatan' }}</div>
                    </div>
                </div>
            </div>

            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Informasi Perjalanan</h6>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-3 fw-bold">Rute:</div>
                        <div class="col-md-9">{{ $booking->schedule->route->origin }} - {{ $booking->schedule->route->destination }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-3 fw-bold">Kapal:</div>
                        <div class="col-md-9">{{ $booking->schedule->ferry->name }} ({{ $booking->schedule->ferry->registration_number }})</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-3 fw-bold">Tanggal Keberangkatan:</div>
                        <div class="col-md-9">{{ \Carbon\Carbon::parse($booking->booking_date)->format('d M Y') }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-3 fw-bold">Jam Keberangkatan:</div>
                        <div class="col-md-9">{{ $booking->schedule->departure_time }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-3 fw-bold">Jam Kedatangan:</div>
                        <div class="col-md-9">{{ $booking->schedule->arrival_time }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-3 fw-bold">Durasi:</div>
                        <div class="col-md-9">{{ $booking->schedule->route->duration }} menit</div>
                    </div>
                </div>
            </div>

            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Data Penumpang</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered" width="100%" cellspacing="0">
                            <thead>
                                <tr>
                                    <th>Kode Tiket</th>
                                    <th>Nama Penumpang</th>
                                    <th>Status</th>
                                    <th>Check-in</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($booking->tickets as $ticket)
                                    <tr>
                                        <td>{{ $ticket->ticket_code }}</td>
                                        <td>{{ $ticket->passenger->name ?? 'N/A' }}</td>
                                        <td>
                                            @if($ticket->status == 'ACTIVE')
                                                <span class="badge bg-success">Aktif</span>
                                            @elseif($ticket->status == 'USED')
                                                <span class="badge bg-info">Digunakan</span>
                                            @elseif($ticket->status == 'CANCELLED')
                                                <span class="badge bg-danger">Dibatalkan</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($ticket->checked_in)
                                                <span class="badge bg-success">Sudah Check-in</span>
                                            @else
                                                <span class="badge bg-warning text-dark">Belum Check-in</span>
                                            @endif
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            @if($booking->vehicle_count > 0)
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Data Kendaraan</h6>
                </div>
                <div class="card-body">
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
                                @foreach($booking->vehicles as $vehicle)
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
                </div>
            </div>
            @endif

            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Riwayat Booking</h6>
                </div>
                <div class="card-body">
                    <div class="timeline">
                        @foreach($booking->bookingLogs()->orderBy('created_at', 'desc')->get() as $log)
                            <div class="timeline-item mb-3">
                                <div class="row no-gutters">
                                    <div class="col-1 text-center">
                                        <div class="timeline-icon bg-primary text-white rounded-circle p-2 d-inline-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                            <i class="fas fa-history"></i>
                                        </div>
                                    </div>
                                    <div class="col-11">
                                        <div class="card border-left-primary shadow-sm">
                                            <div class="card-body py-2">
                                                <div class="small text-gray-500">{{ $log->created_at->format('d M Y H:i:s') }}</div>
                                                <div>Status berubah dari <strong>{{ $log->previous_status }}</strong> menjadi <strong>{{ $log->new_status }}</strong></div>
                                                <div class="small">{{ $log->notes }}</div>
                                                <div class="small text-muted">
                                                    Oleh: {{ $log->changed_by_type }}
                                                    @if($log->changed_by_type == 'ADMIN')
                                                        @if(isset($log->changedByAdmin))
                                                            ({{ $log->changedByAdmin->name }})
                                                        @endif
                                                    @elseif($log->changed_by_type == 'USER')
                                                        @if(isset($log->changedByUser))
                                                            ({{ $log->changedByUser->name }})
                                                        @endif
                                                    @endif
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-4">
            <!-- User Information -->
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Informasi Pengguna</h6>
                </div>
                <div class="card-body">
                    <div class="text-center mb-3">
                        <i class="fas fa-user-circle fa-5x text-gray-300 mb-2"></i>
                        <h5>{{ $booking->user->name }}</h5>
                        <p class="small text-muted">Member sejak {{ $booking->user->created_at->format('M Y') }}</p>
                    </div>
                    <hr>
                    <div class="row mb-2">
                        <div class="col-5 fw-bold">Email:</div>
                        <div class="col-7">{{ $booking->user->email }}</div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-5 fw-bold">Telepon:</div>
                        <div class="col-7">{{ $booking->user->phone ?? 'N/A' }}</div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-5 fw-bold">Total Booking:</div>
                        <div class="col-7">{{ $booking->user->total_bookings ?? '1' }}</div>
                    </div>
                </div>
            </div>

            <!-- Payment Information -->
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Informasi Pembayaran</h6>
                </div>
                <div class="card-body">
                    @if($booking->payments->isNotEmpty())
                        @foreach($booking->payments as $payment)
                            <div class="border rounded p-3 mb-3">
                                <div class="row mb-2">
                                    <div class="col-5 fw-bold">Status:</div>
                                    <div class="col-7">
                                        @if($payment->status == 'PENDING')
                                            <span class="badge bg-warning text-dark">Pending</span>
                                        @elseif($payment->status == 'SUCCESS')
                                            <span class="badge bg-success">Berhasil</span>
                                        @elseif($payment->status == 'FAILED')
                                            <span class="badge bg-danger">Gagal</span>
                                        @elseif($payment->status == 'REFUNDED')
                                            <span class="badge bg-secondary">Dikembalikan</span>
                                        @endif
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-5 fw-bold">Jumlah:</div>
                                    <div class="col-7">Rp {{ number_format($payment->amount, 0, ',', '.') }}</div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-5 fw-bold">Metode:</div>
                                    <div class="col-7">{{ $payment->payment_method }} ({{ $payment->payment_channel }})</div>
                                </div>
                                @if($payment->payment_date)
                                <div class="row mb-2">
                                    <div class="col-5 fw-bold">Tanggal Bayar:</div>
                                    <div class="col-7">{{ \Carbon\Carbon::parse($payment->payment_date)->format('d M Y H:i') }}</div>
                                </div>
                                @endif
                                @if($payment->expiry_date)
                                <div class="row mb-2">
                                    <div class="col-5 fw-bold">Kadaluarsa:</div>
                                    <div class="col-7">
                                        {{ \Carbon\Carbon::parse($payment->expiry_date)->format('d M Y H:i') }}
                                        @if(\Carbon\Carbon::now() > $payment->expiry_date && $payment->status == 'PENDING')
                                            <span class="badge bg-danger">Kadaluarsa</span>
                                        @endif
                                    </div>
                                </div>
                                @endif
                            </div>
                        @endforeach
                    @else
                        <div class="text-center p-3">
                            <p class="mb-0">Tidak ada informasi pembayaran</p>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Update Status Form -->
            @if(in_array($booking->status, ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']))
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Update Status</h6>
                </div>
                <div class="card-body">
                    <form action="{{ route('admin.bookings.update-status', $booking->id) }}" method="POST">
                        @csrf
                        @method('PUT')
                        <div class="mb-3">
                            <label for="status" class="form-label">Status</label>
                            <select class="form-control" id="status" name="status" required>
                                <option value="">Pilih Status</option>
                                @if($booking->status == 'PENDING')
                                    <option value="CONFIRMED">Konfirmasi</option>
                                    <option value="CANCELLED">Batalkan</option>
                                @elseif($booking->status == 'CONFIRMED')
                                    <option value="COMPLETED">Selesai</option>
                                    <option value="CANCELLED">Batalkan</option>
                                @elseif($booking->status == 'COMPLETED')
                                    <option value="REFUNDED">Refund</option>
                                @elseif($booking->status == 'CANCELLED')
                                    <option value="REFUNDED">Refund</option>
                                @endif
                            </select>
                        </div>
                        <div class="mb-3" id="cancellationReasonContainer" style="display: none;">
                            <label for="cancellation_reason" class="form-label">Alasan Pembatalan</label>
                            <select class="form-control" id="cancellation_reason" name="cancellation_reason">
                                <option value="">Pilih Alasan</option>
                                <option value="CUSTOMER_REQUEST">Permintaan Pelanggan</option>
                                <option value="SYSTEM_ISSUE">Masalah Sistem</option>
                                <option value="FERRY_ISSUE">Masalah Kapal</option>
                                <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                                <option value="PAYMENT_TIMEOUT">Timeout Pembayaran</option>
                                <option value="OTHER">Lainnya</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="notes" class="form-label">Catatan</label>
                            <textarea class="form-control" id="notes" name="notes" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Update Status</button>
                    </form>
                </div>
            </div>
            @endif
        </div>
    </div>
</div>

@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function () {
        const statusSelect = document.getElementById('status');
        const cancellationReasonContainer = document.getElementById('cancellationReasonContainer');

        if (statusSelect && cancellationReasonContainer) {
            statusSelect.addEventListener('change', function() {
                if (this.value === 'CANCELLED') {
                    cancellationReasonContainer.style.display = 'block';
                } else {
                    cancellationReasonContainer.style.display = 'none';
                }
            });
        }
    });
</script>
@endsection
