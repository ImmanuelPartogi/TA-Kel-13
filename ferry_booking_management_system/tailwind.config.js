import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins', ...fontFamily.sans]
      },
      colors: {
        'primary': {
          50: '#f0f5ff', // Biru sangat terang
          100: '#e1eaff', // Biru pastel terang
          200: '#c8d9ff', // Biru muda cerah
          300: '#a4c1ff', // Biru langit cerah
          400: '#81a8ff', // Biru royale muda
          500: '#5e8eff', // Biru royale cerah
          600: '#4470f4', // Biru royale klasik
          700: '#3459db', // Biru royale kuat
          800: '#2c47b8', // Biru kuat dalam
          900: '#263a94', // Biru tua kuat
        },
        'secondary': {
          50: '#edf8ff', // Biru es cerah
          100: '#dbf0ff', // Biru air terang
          200: '#bde4ff', // Biru langit terang
          300: '#94d3ff', // Biru laut cerah
          400: '#65bdff', // Biru laut vibrant
          500: '#3aa3ff', // Biru laut kuat
          600: '#2186f0', // Biru laut klasik
          700: '#1a6ed6', // Biru laut dalam
          800: '#1958b0', // Biru laut tua
          900: '#174890', // Biru laut sangat tua
        }
      },
      screens: {
        'xs': '480px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'drift': 'drift 10s ease-in-out infinite',
        'spin-slow': 'spin 15s linear infinite',
        'morph': 'morph 10s ease-in-out infinite',
        'morph-slow': 'morph 15s ease-in-out infinite',
        'waves': 'waves 12s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 8s ease-in-out infinite',
        'drift-right': 'drift-right 12s ease-in-out infinite',
        'drift-left': 'drift-left 12s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        drift: {
          '0%': { transform: 'translate(0px, 0px)' },
          '25%': { transform: 'translate(10px, -5px)' },
          '50%': { transform: 'translate(0px, -10px)' },
          '75%': { transform: 'translate(-10px, -5px)' },
          '100%': { transform: 'translate(0px, 0px)' },
        },
        morph: {
          '0%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
        },
        waves: {
          '0%': { transform: 'scaleY(1) scaleX(1)' },
          '25%': { transform: 'scaleY(1.05) scaleX(0.95)' },
          '50%': { transform: 'scaleY(0.95) scaleX(1.05)' },
          '75%': { transform: 'scaleY(1.05) scaleX(0.95)' },
          '100%': { transform: 'scaleY(1) scaleX(1)' },
        },
        'bounce-slow': {
          '0%, 100%': {
            transform: 'translateY(-5%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          },
        },
        'drift-right': {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(15px)' },
          '100%': { transform: 'translateX(0)' },
        },
        'drift-left': {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-15px)' },
          '100%': { transform: 'translateX(0)' },
        },
      }
    },
  },
  plugins: [],
}