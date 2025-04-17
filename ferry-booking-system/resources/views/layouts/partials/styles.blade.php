<style>
    /* Base Styles */
    body {
        font-family: 'Nunito', sans-serif;
        overflow-x: hidden;
        /* Prevent horizontal scrolling from blobs */
    }

    /* Smooth Scrolling */
    html {
        scroll-behavior: smooth;
        scroll-padding-top: 80px;
        /* Add padding for fixed header */
    }

    /* Wave Animation */
    .wave-animation {
        animation: wave 8s ease-in-out infinite;
    }

    @keyframes wave {

        0%,
        100% {
            transform: translateY(0);
        }

        50% {
            transform: translateY(-15px);
        }
    }

    /* Boat Animation */
    .boat-animation {
        animation: boat 6s ease-in-out infinite;
    }

    @keyframes boat {

        0%,
        100% {
            transform: translateY(0) rotate(-2deg);
        }

        50% {
            transform: translateY(-10px) rotate(2deg);
        }
    }

    /* Blob Animation */
    .blob-animation {
        animation: blob 10s ease-in-out infinite alternate;
    }

    @keyframes blob {
        0% {
            transform: translateY(0) scale(1);
        }

        50% {
            transform: translateY(-5px) scale(1.05);
        }

        100% {
            transform: translateY(5px) scale(0.95);
        }
    }

    /* Floating Blob Animation */
    .floating-blob {
        animation: floating 15s ease-in-out infinite alternate;
    }

    @keyframes floating {
        0% {
            transform: translate(0, 0) rotate(0deg);
        }

        33% {
            transform: translate(10px, 15px) rotate(5deg);
        }

        66% {
            transform: translate(-10px, 5px) rotate(-5deg);
        }

        100% {
            transform: translate(5px, -15px) rotate(2deg);
        }
    }

    /* Rotating Blob Animation */
    .rotating-blob {
        animation: rotating 30s linear infinite;
        transform-origin: center center;
    }

    @keyframes rotating {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    /* Pulsing Blob Animation */
    .pulsing-blob {
        animation: pulsing 8s ease-in-out infinite;
        transform-origin: center center;
    }

    @keyframes pulsing {

        0%,
        100% {
            transform: scale(1);
            opacity: 0.7;
        }

        50% {
            transform: scale(1.05);
            opacity: 0.9;
        }
    }

    /* Bounce Animation for QR */
    .bounce-animation {
        animation: bounce 2s ease-in-out infinite;
    }

    @keyframes bounce {

        0%,
        100% {
            transform: translateY(0);
        }

        50% {
            transform: translateY(-10px);
        }
    }

    /* Fade-in Animation for Modal */
    .modal-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Smooth navbar transitions */
    #navbar {
        transition: transform 0.3s ease-in-out, background-color 0.3s ease, box-shadow 0.3s ease;
    }

    /* Active nav item transition */
    .nav-link,
    .mobile-nav-link {
        transition: color 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
    }

    /* Blob positioning helpers */
    .section-blob {
        position: absolute;
        pointer-events: none;
        /* Make sure it doesn't interfere with clicks */
        z-index: 0;
    }

    /* Custom Swiper Styles */
    .appSwiper {
        width: 100%;
        height: 100%;
        margin: 0 auto;
    }

    .swiper-slide {
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.3s ease;
    }

    .swiper-pagination-bullet {
        width: 8px;
        height: 8px;
        background: #cbd5e1;
        opacity: 0.5;
    }

    .swiper-pagination-bullet-active {
        background: #0ea5e9;
        opacity: 1;
    }

    /* Phone frame animation */
    @keyframes float {

        0%,
        100% {
            transform: translateY(0);
        }

        50% {
            transform: translateY(-5px);
        }
    }

    .phone-float {
        animation: float 3s ease-in-out infinite;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
        width: 10px;
    }

    ::-webkit-scrollbar-track {
        background: #f1f5f9;
    }

    ::-webkit-scrollbar-thumb {
        background: #0ea5e9;
        border-radius: 5px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #0284c7;
    }

    /* Touch optimization for mobile */
    @media (max-width: 640px) {
        .touch-target {
            min-height: 44px;
            min-width: 44px;
        }

        /* Adjust blobs for mobile */
        .section-blob {
            transform: scale(0.7);
            opacity: 0.5;
        }
    }

    /* Fix for mobile hover effects */
    @media (hover: hover) {
        .hover\:scale-105:hover {
            transform: scale(1.05);
        }
    }
</style>
