@extends('layouts.app')

@section('title', 'Detail Booking')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            @if(session('success'))
                <div class="alert alert-success alert-dismissible">
                    <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
                    {{ session('success') }}
                </div>
            @endif

            @if($errors->any())
                <div class="alert alert-danger alert-dismissible">
                    <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
                    <h5><i class="icon fas fa-ban"></i> Error!</h5>
                    <ul>
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Detail Booking</h3>
                    <div class="card-tools">
                        <a href="{{ route('operator.bookings.index') }}" class="btn btn-sm btn-default">
                            <i class="fas fa-arrow-left"></i> Kembali
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <table class="table table-bordered">
                                <tr>
                                    <th style="width: 30%">Kode Booking</th>
                                    <td>{{ $booking->booking_code }}</td>
                                </tr>
                                <tr>
                                    <th>Status</th>
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
                                </tr>
                                <tr>
                                    <th>Tanggal Booking</th>
                                    <td>{{ \Carbon\Carbon::parse($booking->booking_date)->format('d F Y') }}</td>
                                </tr>
                                <tr>
                                    <th>Total Pembayaran</th>
                                    <td>Rp {{ number_format($booking->total_amount, 0, ',', '.') }}</td>
                                </tr>
                                <tr>
                                    <th>Dibuat pada</th>
                                    <td>{{ $booking->created_at->format('d M Y H:i') }}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <table class="table table-bordered">
                                <tr>
                                    <th style="width: 30%">Pengguna</th>
                                    <td>{{ $booking->user->name }}</td>
                                </tr>
                                <tr>
                                    <th>Email</th>
                                    <td>{{ $booking->user->email }}</td>
                                </tr>
                                <tr>
                                    <th>Telepon</th>
                                    <td>{{ $booking->user->phone ?? '-' }}</td>
                                </tr>
                                <tr>
                                    <th>Rute</th>
                                    <td>{{ $booking->schedule->route->origin }} - {{ $booking->schedule->route->destination }}</td>
                                </tr>
                                <tr>
                                    <th>Jadwal</th>
                                    <td>{{ $booking->schedule->departure_time }} - {{ $booking->schedule->arrival_time }}</td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- Update Status Form -->
                    @if(in_array($booking->status, ['PENDING', 'CONFIRMED']))
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <div class="card card-primary">
                                <div class="card-header">
                                    <h3 class="card-title">Update Status Booking</h3>
                                </div>
                                <form action="{{ route('operator.bookings.update-status', $booking->id) }}" method="POST">
                                    @csrf
                                    <div class="card-body">
                                        <div class="form-group">
                                            <label for="status">Status Baru</label>
                                            <select name="status" id="status" class="form-control" required>
                                                <option value="">Pilih Status</option>
                                                @if($booking->status == 'PENDING')
                                                    <option value="CONFIRMED">Konfirmasi</option>
                                                    <option value="CANCELLED">Batalkan</option>
                                                @elseif($booking->status == 'CONFIRMED')
                                                    <option value="COMPLETED">Selesai</option>
                                                    <option value="CANCELLED">Batalkan</option>
                                                @endif
                                            </select>
                                        </div>
                                        <div class="form-group" id="cancellationReasonGroup" style="display: none;">
                                            <label for="cancellation_reason">Alasan Pembatalan</label>
                                            <textarea name="cancellation_reason" id="cancellation_reason" class="form-control" rows="3"></textarea>
                                        </div>
                                        <div class="form-group">
                                            <label for="notes">Catatan</label>
                                            <textarea name="notes" id="notes" class="form-control" rows="2"></textarea>
                                        </div>
                                    </div>
                                    <div class="card-footer">
                                        <button type="submit" class="btn btn-primary">Update Status</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    @endif

                    <!-- Passenger Details -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Data Penumpang ({{ $booking->tickets->count() }})</h3>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>Kode Tiket</th>
                                                    <th>Nama</th>
                                                    <th>No. ID</th>
                                                    <th>Tipe ID</th>
                                                    <th>Status</th>
                                                    <th>Check-in</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse($booking->tickets as $index => $ticket)
                                                <tr>
                                                    <td>{{ $index + 1 }}</td>
                                                    <td>{{ $ticket->ticket_code }}</td>
                                                    <td>{{ $ticket->passenger_name }}</td>
                                                    <td>{{ $ticket->passenger_id_number }}</td>
                                                    <td>{{ $ticket->passenger_id_type }}</td>
                                                    <td>
                                                        @if($ticket->status == 'ACTIVE')
                                                            <span class="badge badge-success">Aktif</span>
                                                        @elseif($ticket->status == 'USED')
                                                            <span class="badge badge-info">Digunakan</span>
                                                        @elseif($ticket->status == 'CANCELLED')
                                                            <span class="badge badge-danger">Dibatalkan</span>
                                                        @endif
                                                    </td>
                                                    <td>
                                                        @if($ticket->checked_in)
                                                            <span class="badge badge-success">
                                                                <i class="fas fa-check"></i> Sudah Check-in
                                                                <br>{{ $ticket->boarding_time->format('d/m/Y H:i') }}
                                                            </span>
                                                        @else
                                                            <span class="badge badge-secondary">Belum Check-in</span>
                                                        @endif
                                                    </td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td colspan="7" class="text-center">Tidak ada data penumpang</td>
                                                </tr>
                                                @endforelse
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Vehicle Details -->
                    @if($booking->vehicles->count() > 0)
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Data Kendaraan ({{ $booking->vehicles->count() }})</h3>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>Tipe Kendaraan</th>
                                                    <th>Nama Pemilik</th>
                                                    <th>Nomor Plat</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @foreach($booking->vehicles as $index => $vehicle)
                                                <tr>
                                                    <td>{{ $index + 1 }}</td>
                                                    <td>
                                                        @if($vehicle->type == 'MOTORCYCLE')
                                                            Motor
                                                        @elseif($vehicle->type == 'CAR')
                                                            Mobil
                                                        @elseif($vehicle->type == 'BUS')
                                                            Bus
                                                        @elseif($vehicle->type == 'TRUCK')
                                                            Truk
                                                        @endif
                                                    </td>
                                                    <td>{{ $vehicle->owner_name }}</td>
                                                    <td>{{ $vehicle->license_plate }}</td>
                                                </tr>
                                                @endforeach
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    @endif

                    <!-- Payment Details -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Data Pembayaran</h3>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th>ID Pembayaran</th>
                                                    <th>Jumlah</th>
                                                    <th>Metode</th>
                                                    <th>Status</th>
                                                    <th>Tanggal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse($booking->payments as $payment)
                                                <tr>
                                                    <td>{{ $payment->payment_code }}</td>
                                                    <td>Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
                                                    <td>{{ $payment->payment_method }}</td>
                                                    <td>
                                                        @if($payment->status == 'PENDING')
                                                            <span class="badge badge-warning">Menunggu</span>
                                                        @elseif($payment->status == 'SUCCESS')
                                                            <span class="badge badge-success">Sukses</span>
                                                        @elseif($payment->status == 'FAILED')
                                                            <span class="badge badge-danger">Gagal</span>
                                                        @endif
                                                    </td>
                                                    <td>
                                                        @if($payment->payment_date)
                                                            {{ $payment->payment_date->format('d M Y H:i') }}
                                                        @else
                                                            -
                                                        @endif
                                                    </td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td colspan="5" class="text-center">Tidak ada data pembayaran</td>
                                                </tr>
                                                @endforelse
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Booking Logs -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Riwayat Booking</h3>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Waktu</th>
                                                    <th>Status Sebelumnya</th>
                                                    <th>Status Baru</th>
                                                    <th>Diubah Oleh</th>
                                                    <th>Catatan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse($booking->bookingLogs as $log)
                                                <tr>
                                                    <td>{{ $log->created_at->format('d M Y H:i') }}</td>
                                                    <td>
                                                        @if($log->previous_status == 'PENDING')
                                                            <span class="badge badge-warning">Menunggu</span>
                                                        @elseif($log->previous_status == 'CONFIRMED')
                                                            <span class="badge badge-success">Dikonfirmasi</span>
                                                        @elseif($log->previous_status == 'COMPLETED')
                                                            <span class="badge badge-info">Selesai</span>
                                                        @elseif($log->previous_status == 'CANCELLED')
                                                            <span class="badge badge-danger">Dibatalkan</span>
                                                        @endif
                                                    </td>
                                                    <td>
                                                        @if($log->new_status == 'PENDING')
                                                            <span class="badge badge-warning">Menunggu</span>
                                                        @elseif($log->new_status == 'CONFIRMED')
                                                            <span class="badge badge-success">Dikonfirmasi</span>
                                                        @elseif($log->new_status == 'COMPLETED')
                                                            <span class="badge badge-info">Selesai</span>
                                                        @elseif($log->new_status == 'CANCELLED')
                                                            <span class="badge badge-danger">Dibatalkan</span>
                                                        @endif
                                                    </td>
                                                    <td>
                                                        @if($log->changed_by_type == 'USER')
                                                            Pengguna
                                                        @elseif($log->changed_by_type == 'ADMIN')
                                                            Admin
                                                        @elseif($log->changed_by_type == 'OPERATOR')
                                                            Operator
                                                        @else
                                                            Sistem
                                                        @endif
                                                    </td>
                                                    <td>{{ $log->notes }}</td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td colspan="5" class="text-center">Tidak ada riwayat booking</td>
                                                </tr>
                                                @endforelse
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
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
        // Show cancellation reason field when cancel is selected
        $('#status').on('change', function() {
            if ($(this).val() === 'CANCELLED') {
                $('#cancellationReasonGroup').show();
                $('#cancellation_reason').attr('required', true);
            } else {
                $('#cancellationReasonGroup').hide();
                $('#cancellation_reason').attr('required', false);
            }
        });
    });
</script>
@endsection
