@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-800">Buat Refund</h1>
            <p class="mt-1 text-gray-600">Untuk Booking: <span class="font-medium">{{ $booking->booking_code }}</span></p>
        </div>
        <div class="mt-4 md:mt-0">
            <a href="{{ route('admin.bookings.show', $booking->id) }}" class="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors shadow-sm">
                <i class="fas fa-arrow-left mr-2 text-sm"></i> Kembali
            </a>
        </div>
    </div>

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
        <!-- Left Column - Refund Form -->
        <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="font-semibold text-lg text-gray-800">Form Refund</h2>
                </div>

                <div class="p-6">
                    <form action="{{ route('admin.refunds.store', $booking->id) }}" method="POST">
                        @csrf
                        <div class="space-y-6">
                            <div>
                                <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
                                    Jumlah Refund <span class="text-red-500">*</span>
                                </label>
                                <div class="flex">
                                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">Rp</span>
                                    <input type="number" id="amount" name="amount" min="0" max="{{ $booking->total_amount }}"
                                        value="{{ old('amount', $booking->total_amount) }}"
                                        class="flex-1 min-w-0 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" required>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Maksimal: Rp {{ number_format($booking->total_amount, 0, ',', '.') }}</p>
                            </div>

                            <div>
                                <label for="reason" class="block text-sm font-medium text-gray-700 mb-1">
                                    Alasan Refund <span class="text-red-500">*</span>
                                </label>
                                <textarea id="reason" name="reason" rows="3"
                                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" required>{{ old('reason') }}</textarea>
                            </div>

                            <div>
                                <label for="refund_method" class="block text-sm font-medium text-gray-700 mb-1">
                                    Metode Refund <span class="text-red-500">*</span>
                                </label>
                                <select id="refund_method" name="refund_method"
                                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" required>
                                    <option value="">Pilih Metode</option>
                                    <option value="ORIGINAL_PAYMENT_METHOD" {{ old('refund_method') == 'ORIGINAL_PAYMENT_METHOD' ? 'selected' : '' }}>Metode Pembayaran Asal</option>
                                    <option value="BANK_TRANSFER" {{ old('refund_method') == 'BANK_TRANSFER' ? 'selected' : '' }}>Transfer Bank</option>
                                    <option value="CASH" {{ old('refund_method') == 'CASH' ? 'selected' : '' }}>Tunai</option>
                                </select>
                            </div>

                            <div id="bankTransferFields" class="space-y-4 {{ old('refund_method') == 'BANK_TRANSFER' ? '' : 'hidden' }}">
                                <div>
                                    <label for="bank_name" class="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Bank <span class="text-red-500">*</span>
                                    </label>
                                    <input type="text" id="bank_name" name="bank_name" value="{{ old('bank_name') }}"
                                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                </div>

                                <div>
                                    <label for="bank_account_number" class="block text-sm font-medium text-gray-700 mb-1">
                                        Nomor Rekening <span class="text-red-500">*</span>
                                    </label>
                                    <input type="text" id="bank_account_number" name="bank_account_number" value="{{ old('bank_account_number') }}"
                                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                </div>

                                <div>
                                    <label for="bank_account_name" class="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Pemilik Rekening <span class="text-red-500">*</span>
                                    </label>
                                    <input type="text" id="bank_account_name" name="bank_account_name" value="{{ old('bank_account_name') }}"
                                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                </div>
                            </div>

                            <div class="pt-4">
                                <button type="submit" class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <i class="fas fa-save mr-2"></i> Buat Refund
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Right Column - Booking Details -->
        <div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
                <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 class="font-semibold text-gray-800">Ringkasan Booking</h2>
                </div>

                <div class="p-6">
                    <dl class="divide-y divide-gray-200">
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Kode Booking</dt>
                            <dd class="text-sm font-medium text-blue-600">{{ $booking->booking_code }}</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Status</dt>
                            <dd>
                                @if($booking->status == 'PENDING')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Pending
                                    </span>
                                @elseif($booking->status == 'CONFIRMED')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Confirmed
                                    </span>
                                @elseif($booking->status == 'COMPLETED')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Completed
                                    </span>
                                @endif
                            </dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Pengguna</dt>
                            <dd class="text-sm text-gray-900">{{ $booking->user->name }}</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Rute</dt>
                            <dd class="text-sm text-gray-900">{{ $booking->schedule->route->origin }} - {{ $booking->schedule->route->destination }}</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Tanggal</dt>
                            <dd class="text-sm text-gray-900">{{ \Carbon\Carbon::parse($booking->booking_date)->format('d M Y') }}</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Penumpang</dt>
                            <dd class="text-sm text-gray-900">{{ $booking->passenger_count }} orang</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Kendaraan</dt>
                            <dd class="text-sm text-gray-900">{{ $booking->vehicle_count }} unit</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Pembayaran</dt>
                            <dd class="text-sm text-gray-900">{{ $payment->payment_method }} ({{ $payment->payment_channel }})</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Total Bayar</dt>
                            <dd class="text-sm font-bold text-blue-600">Rp {{ number_format($booking->total_amount, 0, ',', '.') }}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const refundMethod = document.getElementById('refund_method');
        const bankTransferFields = document.getElementById('bankTransferFields');

        refundMethod.addEventListener('change', function() {
            if (this.value === 'BANK_TRANSFER') {
                bankTransferFields.classList.remove('hidden');
            } else {
                bankTransferFields.classList.add('hidden');
            }
        });
    });
</script>
@endsection
