@extends('layouts.sidebar')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Edit Pengguna</h1>
        <a href="{{ route('admin.users.show', $user->id) }}" class="d-none d-sm-inline-block btn btn-secondary shadow-sm">
            <i class="fas fa-arrow-left fa-sm text-white-50"></i> Kembali
        </a>
    </div>

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

    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Form Edit Pengguna</h6>
        </div>
        <div class="card-body">
            <form action="{{ route('admin.users.update', $user->id) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="name" class="form-label">Nama <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="name" name="name" value="{{ old('name', $user->name) }}" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
                        <input type="email" class="form-control" id="email" name="email" value="{{ old('email', $user->email) }}" required>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="phone" class="form-label">Telepon <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="phone" name="phone" value="{{ old('phone', $user->phone) }}" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="gender" class="form-label">Jenis Kelamin</label>
                        <select class="form-control" id="gender" name="gender">
                            <option value="">-- Pilih Jenis Kelamin --</option>
                            <option value="MALE" {{ old('gender', $user->gender) == 'MALE' ? 'selected' : '' }}>Laki-laki</option>
                            <option value="FEMALE" {{ old('gender', $user->gender) == 'FEMALE' ? 'selected' : '' }}>Perempuan</option>
                        </select>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="date_of_birthday" class="form-label">Tanggal Lahir</label>
                        <input type="date" class="form-control" id="date_of_birthday" name="date_of_birthday" value="{{ old('date_of_birthday', $user->date_of_birthday ? $user->date_of_birthday->format('Y-m-d') : '') }}">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="id_type" class="form-label">Jenis Identitas</label>
                        <select class="form-control" id="id_type" name="id_type">
                            <option value="">-- Pilih Jenis Identitas --</option>
                            <option value="KTP" {{ old('id_type', $user->id_type) == 'KTP' ? 'selected' : '' }}>KTP</option>
                            <option value="SIM" {{ old('id_type', $user->id_type) == 'SIM' ? 'selected' : '' }}>SIM</option>
                            <option value="PASPOR" {{ old('id_type', $user->id_type) == 'PASPOR' ? 'selected' : '' }}>Paspor</option>
                        </select>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="id_number" class="form-label">Nomor Identitas</label>
                    <input type="text" class="form-control" id="id_number" name="id_number" value="{{ old('id_number', $user->id_number) }}">
                </div>

                <div class="mb-3">
                    <label for="address" class="form-label">Alamat</label>
                    <textarea class="form-control" id="address" name="address" rows="3">{{ old('address', $user->address) }}</textarea>
                </div>

                <hr>

                <div class="mb-3">
                    <h5>Ubah Password</h5>
                    <p class="text-muted small">Biarkan kosong jika tidak ingin mengubah password</p>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="password" class="form-label">Password Baru</label>
                        <input type="password" class="form-control" id="password" name="password">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="password_confirmation" class="form-label">Konfirmasi Password</label>
                        <input type="password" class="form-control" id="password_confirmation" name="password_confirmation">
                    </div>
                </div>

                <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
            </form>
        </div>
    </div>

    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-danger">Zona Berbahaya</h6>
        </div>
        <div class="card-body">
            <h5>Hapus Pengguna</h5>
            <p>Penghapusan pengguna bersifat permanen dan tidak dapat dibatalkan. Semua data terkait pengguna akan dihapus.</p>
            <form action="{{ route('admin.users.destroy', $user->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.');">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn btn-danger">
                    <i class="fas fa-trash fa-sm"></i> Hapus Pengguna
                </button>
            </form>
        </div>
    </div>
</div>
@endsection
