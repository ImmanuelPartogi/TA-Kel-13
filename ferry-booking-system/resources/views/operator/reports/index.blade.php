@extends('layouts.app')

@section('title', 'Laporan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Laporan</h3>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header bg-primary">
                                    <h3 class="card-title">Laporan Harian</h3>
                                </div>
                                <div class="card-body">
                                    <p>Laporan ini menampilkan data operasional per jadwal untuk tanggal tertentu.</p>
                                    <form action="{{ route('operator.reports.daily') }}" method="GET">
                                        <div class="form-group">
                                            <label for="date">Pilih Tanggal</label>
                                            <input type="date" name="date" id="date" class="form-control" value="{{ date('Y-m-d') }}" required>
                                        </div>
                                        <div class="form-group">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-search"></i> Lihat Laporan
                                            </button>
                                            <button type="submit" name="export" value="csv" class="btn btn-success">
                                                <i class="fas fa-file-csv"></i> Export CSV
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header bg-success">
                                    <h3 class="card-title">Laporan Bulanan</h3>
                                </div>
                                <div class="card-body">
                                    <p>Laporan ini menampilkan data bulanan per rute untuk bulan tertentu.</p>
                                    <form action="{{ route('operator.reports.monthly') }}" method="GET">
                                        <div class="form-group">
                                            <label for="month">Pilih Bulan</label>
                                            <input type="month" name="month" id="month" class="form-control" value="{{ date('Y-m') }}" required>
                                        </div>
                                        <div class="form-group">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-search"></i> Lihat Laporan
                                            </button>
                                            <button type="submit" name="export" value="csv" class="btn btn-success">
                                                <i class="fas fa-file-csv"></i> Export CSV
                                            </button>
                                        </div>
                                    </form>
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
