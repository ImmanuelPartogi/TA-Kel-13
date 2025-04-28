@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-800">Detail Refund</h1>
            <p class="mt-1 text-gray-600">ID: <span class="font-medium">#{{ $refund->id }}</span></p>
        </div>
        <div class="mt-4 md:mt-0">
            <a href="{{ route('admin.refunds.index') }}" class="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors shadow-sm">
                <i class="fas fa-arrow-left mr-2 text-sm"></i> Kembali
            </a>
        </div>
    </div>

    <!-- Success message -->
    @if(session('success'))
        <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas fa-check-circle text-green-500"></i>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-green-700">{{ session('success') }}</p>
                </div>
                <div class="ml-auto pl-3">
                    <div class="-mx-1.5 -my-1.5">
                        <button type="button" onclick="this.parentElement.parentElement.parentElement.parentElement.style.display='none'" class="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100">
                            <span class="sr-only">Dismiss</span>
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    @endif

    <!-- Error message -->
    @if($errors->any())
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas fa-exclamation-circle text-red-500"></i>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Ada beberapa kesalahan:</h3>
                    <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
                <div class="ml-auto pl-3">
                    <div class="-mx-1.5 -my-1.5">
                        <button type="button" onclick="this.parentElement.parentElement.parentElement.parentElement.style.display='none'" class="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100">
                            <span class="sr-only">Dismiss</span>
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    @endif

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Refund Details -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Refund Info Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="font-semibold text-lg text-gray-800">Informasi Refund</h2>
                </div>

                <div class="p-6 space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500 mb-1">ID Refund</p>
                            <p class="font-medium">#{{ $refund->id }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Status</p>
                            <div>
                                @if($refund->status == 'PENDING')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Pending
                                    </span>
                                @elseif($refund->status == 'APPROVED')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Approved
                                    </span>
                                @elseif($refund->status == 'REJECTED')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Rejected
                                    </span>
                                @elseif($refund->status == 'COMPLETED')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Completed
                                    </span>
                                @endif
                            </div>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Jumlah Refund</p>
                            <p class="font-medium text-blue-600">Rp {{ number_format($refund->amount, 0, ',', '.') }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Metode Refund</p>
                            <p>
                                @if($refund->refund_method == 'ORIGINAL_PAYMENT_METHOD')
                                    Metode Pembayaran Asal
                                @elseif($refund->refund_method == 'BANK_TRANSFER')
                                    Transfer Bank
                                @elseif($refund->refund_method == 'CASH')
                                    Tunai
                                @endif
                            </p>
                        </div>
                        @if($refund->refund_method == 'BANK_TRANSFER')
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Nama Bank</p>
                                <p>{{ $refund->bank_name }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Nomor Rekening</p>
                                <p>{{ $refund->bank_account_number }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Nama Pemilik Rekening</p>
                                <p>{{ $refund->bank_account_name }}</p>
                            </div>
                        @endif
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Dibuat Pada</p>
                            <p>{{ $refund->created_at->format('d M Y H:i') }}</p>
                        </div>
                        @if($refund->transaction_id)
                            <div>
                                <p class="text-sm text-gray-500 mb-1">ID Transaksi</p>
                                <p>{{ $refund->transaction_id }}</p>
                            </div>
                        @endif
                    </div>

                    <div class="border-t border-gray-100 pt-4">
                        <p class="text-sm text-gray-500 mb-1">Alasan Refund</p>
                        <p>{{ $refund->reason }}</p>
                    </div>
                </div>
            </div>

            <!-- Booking Information Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="font-semibold text-lg text-gray-800">Informasi Booking</h2>
                </div>

                <div class="p-6 space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Kode Booking</p>
                            <p class="font-medium">{{ $refund->booking->booking_code }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Status Booking</p>
                            <div>
                                @if($refund->booking->status == 'PENDING')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Pending
                                    </span>
                                @elseif($refund->booking->status == 'CONFIRMED')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Confirmed
                                    </span>
                                @elseif($refund->booking->status == 'CANCELLED')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Cancelled
                                    </span>
                                @elseif($refund->booking->status == 'COMPLETED')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Completed
                                    </span>
                                @elseif($refund->booking->status == 'REFUNDED')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        Refunded
                                    </span>
                                @endif
                            </div>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Rute</p>
                            <p>{{ $refund->booking->schedule->route->origin }} - {{ $refund->booking->schedule->route->destination }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Tanggal Keberangkatan</p>
                            <p>{{ \Carbon\Carbon::parse($refund->booking->booking_date)->format('d M Y') }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Penumpang</p>
                            <p>{{ $refund->booking->passenger_count }} orang</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Kendaraan</p>
                            <p>{{ $refund->booking->vehicle_count }} unit</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Total Pembayaran</p>
                            <p class="font-medium">Rp {{ number_format($refund->booking->total_amount, 0, ',', '.') }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Dibuat Pada</p>
                            <p>{{ $refund->booking->created_at->format('d M Y H:i') }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Payment Information Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="font-semibold text-lg text-gray-800">Informasi Pembayaran</h2>
                </div>

                <div class="p-6 space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500 mb-1">ID Pembayaran</p>
                            <p class="font-medium">#{{ $refund->payment->id }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Status Pembayaran</p>
                            <div>
                                @if($refund->payment->status == 'PENDING')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Pending
                                    </span>
                                @elseif($refund->payment->status == 'SUCCESS')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Success
                                    </span>
                                @elseif($refund->payment->status == 'FAILED')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Failed
                                    </span>
                                @elseif($refund->payment->status == 'REFUNDED')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        Refunded
                                    </span>
                                @endif
                            </div>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Jumlah Pembayaran</p>
                            <p class="font-medium">Rp {{ number_format($refund->payment->amount, 0, ',', '.') }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Metode Pembayaran</p>
                            <p>{{ $refund->payment->payment_method }} ({{ $refund->payment->payment_channel }})</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Tanggal Pembayaran</p>
                            <p>{{ $refund->payment->payment_date ? $refund->payment->payment_date->format('d M Y H:i') : 'N/A' }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 mb-1">ID Transaksi</p>
                            <p>{{ $refund->payment->transaction_id ?? 'N/A' }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Column - User & Actions -->
        <div class="space-y-6">
            <!-- User Information Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="font-semibold text-lg text-gray-800">Informasi Pengguna</h2>
                </div>

                <div class="p-6">
                    <div class="flex flex-col items-center text-center mb-6">
                        <div class="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                            <i class="fas fa-user-circle text-4xl text-gray-400"></i>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900">{{ $refund->booking->user->name }}</h3>
                        <p class="text-sm text-gray-500">Member sejak {{ $refund->booking->user->created_at->format('M Y') }}</p>
                    </div>

                    <div class="border-t border-gray-200 pt-4">
                        <dl class="divide-y divide-gray-200">
                            <div class="py-3 flex justify-between">
                                <dt class="text-sm font-medium text-gray-500">Email</dt>
                                <dd class="text-sm text-right text-gray-900">{{ $refund->booking->user->email }}</dd>
                            </div>
                            <div class="py-3 flex justify-between">
                                <dt class="text-sm font-medium text-gray-500">Telepon</dt>
                                <dd class="text-sm text-right text-gray-900">{{ $refund->booking->user->phone ?? 'N/A' }}</dd>
                            </div>
                            <div class="py-3 flex justify-between">
                                <dt class="text-sm font-medium text-gray-500">Total Booking</dt>
                                <dd class="text-sm text-right text-gray-900">{{ $refund->booking->user->total_bookings ?? '0' }}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            <!-- Actions Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="font-semibold text-lg text-gray-800">Tindakan</h2>
                </div>

                <div class="p-6 space-y-4">
                    @if($refund->status === 'PENDING')
                        <form action="{{ route('admin.refunds.approve', $refund->id) }}" method="POST">
                            @csrf
                            <button type="submit" class="w-full flex justify-center items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm">
                                <i class="fas fa-check-circle mr-2"></i> Setujui Refund
                            </button>
                        </form>

                        <button type="button" class="w-full flex justify-center items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm"
                                onclick="document.getElementById('rejectModal').classList.remove('hidden')">
                            <i class="fas fa-times-circle mr-2"></i> Tolak Refund
                        </button>

                        <!-- Reject Modal -->
                        <div id="rejectModal" class="fixed inset-0 flex items-center justify-center z-50 hidden">
                            <div class="fixed inset-0 bg-black opacity-50"></div>
                            <div class="bg-white rounded-lg overflow-hidden shadow-xl relative z-10 w-full max-w-md">
                                <div class="px-6 py-4 border-b border-gray-200">
                                    <h3 class="text-lg font-semibold text-gray-800">Tolak Refund</h3>
                                </div>
                                <form action="{{ route('admin.refunds.reject', $refund->id) }}" method="POST">
                                    @csrf
                                    <div class="p-6">
                                        <div class="mb-4">
                                            <label for="rejection_reason" class="block text-sm font-medium text-gray-700 mb-1">
                                                Alasan Penolakan <span class="text-red-500">*</span>
                                            </label>
                                            <textarea id="rejection_reason" name="rejection_reason" rows="3"
                                                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                required></textarea>
                                        </div>
                                        <div class="flex justify-end space-x-2">
                                            <button type="button" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                                                    onclick="document.getElementById('rejectModal').classList.add('hidden')">
                                                Batal
                                            </button>
                                            <button type="submit" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">
                                                Tolak
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    @elseif($refund->status === 'APPROVED')
                        <button type="button" class="w-full flex justify-center items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
                                onclick="document.getElementById('completeModal').classList.remove('hidden')">
                            <i class="fas fa-check-double mr-2"></i> Selesaikan Refund
                        </button>

                        <!-- Complete Modal -->
                        <div id="completeModal" class="fixed inset-0 flex items-center justify-center z-50 hidden">
                            <div class="fixed inset-0 bg-black opacity-50"></div>
                            <div class="bg-white rounded-lg overflow-hidden shadow-xl relative z-10 w-full max-w-md">
                                <div class="px-6 py-4 border-b border-gray-200">
                                    <h3 class="text-lg font-semibold text-gray-800">Selesaikan Refund</h3>
                                </div>
                                <form action="{{ route('admin.refunds.complete', $refund->id) }}" method="POST">
                                    @csrf
                                    <div class="p-6">
                                        <div class="mb-4">
                                            <label for="transaction_id" class="block text-sm font-medium text-gray-700 mb-1">
                                                ID Transaksi <span class="text-red-500">*</span>
                                            </label>
                                            <input type="text" id="transaction_id" name="transaction_id"
                                                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                required>
                                            <p class="text-xs text-gray-500 mt-1">Masukkan ID transaksi refund dari sistem pembayaran</p>
                                        </div>
                                        <div class="flex justify-end space-x-2">
                                            <button type="button" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                                                    onclick="document.getElementById('completeModal').classList.add('hidden')">
                                                Batal
                                            </button>
                                            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                                                Selesaikan
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    @endif

                    <a href="{{ route('admin.bookings.show', $refund->booking_id) }}" class="block w-full text-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md shadow-sm">
                        <i class="fas fa-eye mr-2"></i> Lihat Detail Booking
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
