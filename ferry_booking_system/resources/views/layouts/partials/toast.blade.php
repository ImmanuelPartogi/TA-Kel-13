<!-- resources/views/layouts/partials/toast.blade.php -->
@if(session('success') || session('error'))
<div id="toast" class="{{ session('success') ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700' }} border-l-4 p-4 mb-6 rounded-md shadow-sm fixed top-5 right-5 z-50 w-96 transform transition-transform duration-300 translate-x-full" role="alert">
    <div class="flex">
        <div class="flex-shrink-0">
            @if(session('success'))
            <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            @else
            <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            @endif
        </div>
        <div class="ml-3">
            <p class="text-sm">{{ session('success') ?? session('error') }}</p>
        </div>
        <div class="ml-auto pl-3">
            <div class="-mx-1.5 -my-1.5">
                <button type="button" class="inline-flex {{ session('success') ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500' }} rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-{{ session('success') ? 'green' : 'red' }}-500" onclick="dismissToast()">
                    <span class="sr-only">Dismiss</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const toast = document.getElementById('toast');
        if (toast) {
            // Show toast after a brief delay
            setTimeout(() => {
                toast.classList.remove('translate-x-full');
            }, 100);

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                dismissToast();
            }, 5000);
        }
    });

    function dismissToast() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }
</script>
