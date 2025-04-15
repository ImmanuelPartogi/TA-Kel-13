@extends('layouts.app')

@section('title', 'Check-in Penumpang')

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
                    <h3 class="card-title">Check-in Penumpang</h3>
                </div>
                <div class="card-body">
                    <div class="row justify-content-center">
                        <div class="col-md-6">
                            <form action="{{ route('operator.bookings.process-check-in') }}" method="POST">
                                @csrf
                                <div class="form-group">
                                    <label for="ticket_code">Kode Tiket</label>
                                    <div class="input-group">
                                        <input type="text" name="ticket_code" id="ticket_code" class="form-control" placeholder="Masukkan kode tiket" value="{{ old('ticket_code', request('ticket_code')) }}" required autofocus>
                                        <div class="input-group-append">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-search"></i> Cari
                                            </button>
                                        </div>
                                    </div>
                                    <small class="form-text text-muted">Masukkan kode tiket untuk melakukan check-in penumpang</small>
                                </div>
                            </form>
                        </div>
                    </div>

                    @if($ticket)
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card card-primary">
                                <div class="card-header">
                                    <h3 class="card-title">Detail Tiket</h3>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <table class="table table-bordered">
                                                <tr>
                                                    <th style="width: 30%">Kode Tiket</th>
                                                    <td>{{ $ticket->ticket_code }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Kode Booking</th>
                                                    <td>{{ $ticket->booking->booking_code }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Status Tiket</th>
                                                    <td>
                                                        @if($ticket->status == 'ACTIVE')
                                                            <span class="badge badge-success">Aktif</span>
                                                        @elseif($ticket->status == 'USED')
                                                            <span class="badge badge-info">Digunakan</span>
                                                        @elseif($ticket->status == 'CANCELLED')
                                                            <span class="badge badge-danger">Dibatalkan</span>
                                                        @endif
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Check-in</th>
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
                                            </table>
                                        </div>
                                        <div class="col-md-6">
                                            <table class="table table-bordered">
                                                <tr>
                                                    <th style="width: 30%">Nama Penumpang</th>
                                                    <td>{{ $ticket->passenger_name }}</td>
                                                </tr>
                                                <tr>
                                                    <th>No. ID</th>
                                                    <td>{{ $ticket->passenger_id_number }} ({{ $ticket->passenger_id_type }})</td>
                                                </tr>
                                                <tr>
                                                    <th>Tanggal</th>
                                                    <td>{{ \Carbon\Carbon::parse($ticket->booking->booking_date)->format('d F Y') }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Rute</th>
                                                    <td>{{ $ticket->booking->schedule->route->origin }} - {{ $ticket->booking->schedule->route->destination }}</td>
                                                </tr>
                                            </table>
                                        </div>
                                    </div>

                                    <!-- Vehicle Info (if exists) -->
                                    @if($ticket->vehicle)
                                    <div class="row mt-3">
                                        <div class="col-12">
                                            <div class="alert alert-info">
                                                <h5><i class="icon fas fa-car"></i> Informasi Kendaraan</h5>
                                                <p>Tipe:
                                                    @if($ticket->vehicle->type == 'MOTORCYCLE')
                                                        Motor
                                                    @elseif($ticket->vehicle->type == 'CAR')
                                                        Mobil
                                                    @elseif($ticket->vehicle->type == 'BUS')
                                                        Bus
                                                    @elseif($ticket->vehicle->type == 'TRUCK')
                                                        Truk
                                                    @endif
                                                </p>
                                                <p>Nomor Plat: {{ $ticket->vehicle->license_plate }}</p>
                                                <p>Pemilik: {{ $ticket->vehicle->owner_name }}</p>
                                            </div>
                                        </div>
                                    </div>
                                    @endif

                                    <div class="row mt-3">
                                        <div class="col-12 text-center">
                                            @if(!$ticket->checked_in && $ticket->status == 'ACTIVE' && $ticket->booking->status == 'CONFIRMED')
                                                <form action="{{ route('operator.bookings.process-check-in') }}" method="POST">
                                                    @csrf
                                                    <input type="hidden" name="ticket_code" value="{{ $ticket->ticket_code }}">
                                                    <button type="submit" class="btn btn-lg btn-success">
                                                        <i class="fas fa-check-circle"></i> Proses Check-in
                                                    </button>
                                                </form>
                                            @elseif($ticket->checked_in)
                                                <div class="alert alert-success">
                                                    <h5><i class="icon fas fa-check"></i> Penumpang ini sudah melakukan check-in</h5>
                                                    <p>Check-in pada: {{ $ticket->boarding_time->format('d/m/Y H:i') }}</p>
                                                </div>
                                            @elseif($ticket->status == 'CANCELLED')
                                                <div class="alert alert-danger">
                                                    <h5><i class="icon fas fa-ban"></i> Tiket telah dibatalkan</h5>
                                                    <p>Tiket ini tidak dapat digunakan karena sudah dibatalkan.</p>
                                                </div>
                                            @elseif($ticket->booking->status != 'CONFIRMED')
                                                <div class="alert alert-warning">
                                                    <h5><i class="icon fas fa-exclamation-triangle"></i> Booking belum dikonfirmasi</h5>
                                                    <p>Status booking saat ini: {{ $ticket->booking->status }}</p>
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    $(function() {
        $('#ticket_code').focus();
    });
</script>
@endsection
