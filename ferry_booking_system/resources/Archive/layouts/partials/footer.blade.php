<!-- layouts/partials/footer.blade.php -->
<footer class="bg-white border-t border-gray-200 py-4 relative overflow-hidden">
    <!-- Footer blob decoration -->
    <div class="absolute opacity-15 -right-24 -bottom-20">
        <svg class="animate-float-slow" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
            style="width: 150px;">
            <path fill="#4470f4"
                d="M46.7,-47.9C59.1,-34.4,67.3,-16.9,67.7,1.3C68,19.5,60.4,38.6,46.9,52.1C33.4,65.6,14,73.4,-5.2,73.1C-24.4,72.7,-43.5,64.2,-55.5,49.8C-67.5,35.4,-72.4,15,-69.4,-3.1C-66.3,-21.2,-55.4,-36.9,-41.6,-49.8C-27.8,-62.7,-10.9,-72.7,3.7,-74.1C18.3,-75.5,34.3,-61.4,46.7,-47.9Z"
                transform="translate(100 100)" />
        </svg>
    </div>
    <div class="absolute opacity-15 left-10 -bottom-10">
        <svg class="animate-bounce-slow" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
            style="width: 120px;">
            <path fill="#81a8ff"
                d="M35.6,-53.8C45.4,-44.9,52.6,-33.3,58.5,-20C64.5,-6.7,69.2,8.3,67.1,22.7C64.9,37.1,56.1,51,43.3,58.2C30.6,65.5,15.3,66.2,0.8,65C-13.6,63.9,-27.3,61,-39.3,53.7C-51.3,46.4,-61.7,34.6,-67.3,20.2C-72.9,5.9,-73.6,-11,-67.8,-25.4C-61.9,-39.8,-49.4,-51.7,-36,-59.1C-22.5,-66.4,-8.1,-69.2,2.9,-68.1C14,-67,25.9,-62.8,35.6,-53.8Z"
                transform="translate(100 100)" />
        </svg>
    </div>

    <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="flex flex-col sm:flex-row justify-between items-center">
            <div class="text-sm text-gray-500 mb-2 sm:mb-0">
                &copy; {{ date('Y') }} Ferry Ticket System. All rights reserved.
            </div>
            <div class="text-sm text-gray-500">
                Version 1.0.0
            </div>
        </div>
    </div>
</footer>
