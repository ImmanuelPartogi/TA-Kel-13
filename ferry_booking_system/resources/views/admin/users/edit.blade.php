@extends('layouts.app')

@section('content')
<div class="container px-4 py-6 mx-auto">
    <div class="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Edit Pengguna</h1>
        <a href="{{ route('admin.users.show', $user->id) }}" class="mt-3 md:mt-0 inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
        </a>
    </div>

    @if($errors->any())
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
            <ul class="list-disc ml-6">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
            <button class="absolute top-2 right-2 text-red-700" onclick="this.parentElement.remove()">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    @endif

    <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 class="text-lg font-semibold text-blue-600">Form Edit Pengguna</h2>
        </div>
        <div class="p-6">
            <form action="{{ route('admin.users.update', $user->id) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nama <span class="text-red-500">*</span></label>
                        <input type="text" class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" id="name" name="name" value="{{ old('name', $user->name) }}" required>
                    </div>
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
                        <input type="email" class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" id="email" name="email" value="{{ old('email', $user->email) }}" required>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Telepon <span class="text-red-500">*</span></label>
                        <input type="text" class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" id="phone" name="phone" value="{{ old('phone', $user->phone) }}" required>
                    </div>
                    <div>
                        <label for="gender" class="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                        <select class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" id="gender" name="gender">
                            <option value="">-- Pilih Jenis Kelamin --</option>
                            <option value="MALE" {{ old('gender', $user->gender) == 'MALE' ? 'selected' : '' }}>Laki-laki</option>
                            <option value="FEMALE" {{ old('gender', $user->gender) == 'FEMALE' ? 'selected' : '' }}>Perempuan</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label for="date_of_birthday" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                        <input type="date" class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" id="date_of_birthday" name="date_of_birthday" value="{{ old('date_of_birthday', $user->date_of_birthday ? $user->date_of_birthday->format('Y-m-d') : '') }}">
                    </div>
                    <div>
                        <label for="id_type" class="block text-sm font-medium text-gray-700 mb-1">Jenis Identitas</label>
                        <select class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" id="id_type" name="id_type">
                            <option value="">-- Pilih Jenis Identitas --</option>
                            <option value="KTP" {{ old('id_type', $user->id_type) == 'KTP' ? 'selected' : '' }}>KTP</option>
                            <option value="SIM" {{ old('id_type', $user->id_type) == 'SIM' ? 'selected' : '' }}>SIM</option>
                            <option value="PASPOR" {{ old('id_type', $user->id_type) == 'PASPOR' ? 'selected' : '' }}>Paspor</option>
                        </select>
                    </div>
                </div>

                <div class="mt-6">
                    <label for="id_number" class="block text-sm font-medium text-gray-700 mb-1">Nomor Identitas</label>
                    <input type="text" class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" id="id_number" name="id_number" value="{{ old('id_number', $user->id_number) }}">
                </div>

                <div class="mt-6">
                    <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <textarea class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" id="address" name="address" rows="3">{{ old('address', $user->address) }}</textarea>
                </div>

                <div class="border-t border-gray-200 my-6 pt-6">
                    <h3 class="text-lg font-medium text-gray-900">Ubah Password</h3>
                    <p class="text-sm text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengubah password</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                        <input type="password" class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" id="password" name="password">
                    </div>
                    <div>
                        <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                        <input type="password" class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" id="password_confirmation" name="password_confirmation">
                    </div>
                </div>

                <div class="mt-6">
                    <button type="submit" class="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div class="border-b border-gray-200 bg-red-50 px-6 py-3">
            <h2 class="text-lg font-semibold text-red-600">Zona Berbahaya</h2>
        </div>
        <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900">Hapus Pengguna</h3>
            <p class="text-sm text-gray-500 mt-1">Penghapusan pengguna bersifat permanen dan tidak dapat dibatalkan. Semua data terkait pengguna akan dihapus.</p>

            <form action="{{ route('admin.users.destroy', $user->id) }}" method="POST" class="mt-4" onsubmit="return confirm('Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.');">
                @csrf
                @method('DELETE')
                <button type="submit" class="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus Pengguna
                </button>
            </form>
        </div>
    </div>
</div>
@endsection
