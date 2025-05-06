@extends('layouts.auth')

@section('content')
<div class="w-full">
    <div class="bg-white shadow-xl rounded-2xl overflow-hidden">
        <!-- Login header -->
        <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-800 opacity-90"></div>
            <div class="relative py-8 px-6 md:px-10">
                <div class="text-center">
                    <div class="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-white shadow-md">
                        <i class="fas fa-user-shield text-indigo-600 text-2xl"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-white">Login Admin</h2>
                    <p class="text-indigo-200 mt-2">Masukkan kredensial untuk akses dashboard admin</p>
                </div>
            </div>

            <!-- Decorative Wave -->
            <svg class="absolute bottom-0 w-full text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100">
                <path fill="currentColor" fill-opacity="1" d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,75C1120,75,1280,53,1360,42.7L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
            </svg>
        </div>

        <!-- Login form -->
        <div class="py-8 px-6 md:px-10">
            <form method="POST" action="{{ route('admin.login.submit') }}">
                @csrf

                <div class="mb-6">
                    <label for="email" class="block text-gray-700 text-sm font-medium mb-2">Email</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i class="fas fa-envelope text-gray-400"></i>
                        </div>
                        <input id="email" type="email"
                            class="pl-12 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow @error('email') border-red-500 focus:ring-red-500 @enderror"
                            name="email"
                            value="{{ old('email') }}"
                            required
                            autocomplete="email"
                            autofocus
                            placeholder="email@example.com">
                    </div>
                    @error('email')
                        <p class="mt-1 text-sm text-red-600">
                            <i class="fas fa-exclamation-circle mr-1"></i>
                            {{ $message }}
                        </p>
                    @enderror
                </div>

                <div class="mb-6">
                    <div class="flex items-center justify-between mb-2">
                        <label for="password" class="block text-gray-700 text-sm font-medium">Password</label>
                        @if (Route::has('admin.password.request'))
                            <a class="text-xs text-indigo-600 hover:text-indigo-800 transition-colors" href="{{ route('admin.password.request') }}">
                                Lupa Password?
                            </a>
                        @endif
                    </div>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i class="fas fa-lock text-gray-400"></i>
                        </div>
                        <input id="password"
                            type="password"
                            class="pl-12 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow @error('password') border-red-500 focus:ring-red-500 @enderror"
                            name="password"
                            required
                            autocomplete="current-password"
                            placeholder="••••••••">
                    </div>
                    @error('password')
                        <p class="mt-1 text-sm text-red-600">
                            <i class="fas fa-exclamation-circle mr-1"></i>
                            {{ $message }}
                        </p>
                    @enderror
                </div>

                <div class="flex items-center mb-6">
                    <input id="remember"
                        type="checkbox"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        name="remember"
                        {{ old('remember') ? 'checked' : '' }}>
                    <label for="remember" class="ml-2 block text-sm text-gray-700">
                        Ingat Saya
                    </label>
                </div>

                <div class="mb-6">
                    <button type="submit"
                        class="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        Masuk
                    </button>
                </div>
            </form>
        </div>

        <!-- Login footer -->
        <div class="py-4 px-6 md:px-10 bg-gray-50 border-t border-gray-100 text-center">
            <p class="text-sm text-gray-600">
                Masuk sebagai operator?
                <a href="{{ route('operator.login') }}" class="font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                    <i class="fas fa-user-tie mr-1"></i>
                    Login Operator
                </a>
            </p>
        </div>
    </div>

    <!-- Help & Security -->
    <div class="mt-8 flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-6 md:justify-between">
        <div class="flex items-center justify-center md:justify-start text-sm text-gray-600">
            <i class="fas fa-headset text-gray-400 mr-2"></i>
            <span>Butuh bantuan? <a href="#" class="text-indigo-600 hover:text-indigo-800 transition-colors font-medium">Hubungi Tim Support</a></span>
        </div>
        <div class="flex items-center justify-center md:justify-end text-sm text-gray-600">
            <i class="fas fa-shield-alt text-gray-400 mr-2"></i>
            <span>Koneksi aman terenkripsi</span>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    // You can add any login-specific JavaScript here
    document.addEventListener('DOMContentLoaded', function() {
        // Auto-focus the email input field
        document.getElementById('email').focus();
    });
</script>
@endsection
