<!-- layouts/partials/styles.blade.php -->
<style>
    [x-cloak] {
        display: none !important;
    }

    /* Scrollbar Styles */
    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    ::-webkit-scrollbar-track {
        background: #f1f5f9;
    }

    ::-webkit-scrollbar-thumb {
        background: #94a3b8;
        border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #64748b;
    }

    /* Animation classes */
    .nav-item {
        transition: all 0.2s ease;
    }

    .nav-item:hover {
        transform: translateX(5px);
    }

    .nav-icon {
        transition: all 0.2s ease;
    }

    .nav-item:hover .nav-icon {
        transform: scale(1.2);
    }

    .alert-fade {
        animation: fadeOut 5s forwards;
    }

    @keyframes fadeOut {
        90% {
            opacity: 1;
        }

        100% {
            opacity: 0;
        }
    }

    /* Blob Animations */
    @keyframes float {
        0% {
            transform: translateY(0px);
        }

        50% {
            transform: translateY(-15px);
        }

        100% {
            transform: translateY(0px);
        }
    }

    @keyframes drift {
        0% {
            transform: translate(0px, 0px);
        }

        25% {
            transform: translate(10px, -5px);
        }

        50% {
            transform: translate(0px, -10px);
        }

        75% {
            transform: translate(-10px, -5px);
        }

        100% {
            transform: translate(0px, 0px);
        }
    }

    @keyframes morph {
        0% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
        }

        50% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
        }

        100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
        }
    }

    @keyframes waves {
        0% {
            transform: scaleY(1) scaleX(1);
        }

        25% {
            transform: scaleY(1.05) scaleX(0.95);
        }

        50% {
            transform: scaleY(0.95) scaleX(1.05);
        }

        75% {
            transform: scaleY(1.05) scaleX(0.95);
        }

        100% {
            transform: scaleY(1) scaleX(1);
        }
    }

    @keyframes bounce-slow {
        0%,
        100% {
            transform: translateY(-5%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
        }

        50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
        }
    }

    @keyframes drift-right {
        0% {
            transform: translateX(0);
        }

        50% {
            transform: translateX(15px);
        }

        100% {
            transform: translateX(0);
        }
    }

    @keyframes drift-left {
        0% {
            transform: translateX(0);
        }

        50% {
            transform: translateX(-15px);
        }

        100% {
            transform: translateX(0);
        }
    }

    .animate-float {
        animation: float 6s ease-in-out infinite;
    }

    .animate-float-slow {
        animation: float 8s ease-in-out infinite;
    }

    .animate-drift {
        animation: drift 10s ease-in-out infinite;
    }

    .animate-spin-slow {
        animation: spin 15s linear infinite;
    }

    .animate-morph {
        animation: morph 10s ease-in-out infinite;
    }

    .animate-morph-slow {
        animation: morph 15s ease-in-out infinite;
    }

    .animate-waves {
        animation: waves 12s ease-in-out infinite;
    }

    .animate-bounce-slow {
        animation: bounce-slow 8s ease-in-out infinite;
    }

    .animate-drift-right {
        animation: drift-right 12s ease-in-out infinite;
    }

    .animate-drift-left {
        animation: drift-left 12s ease-in-out infinite;
    }

    .blob-wrapper {
        overflow: hidden;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 0;
        pointer-events: none;
    }

    .content-wrapper {
        position: relative;
        z-index: 10;
    }

    .blob {
        transform-origin: center center;
        will-change: transform;
    }
</style>
