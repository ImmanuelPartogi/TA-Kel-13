// src/utils/tailwindConfig.js
const tailwindConfig = {
    theme: {
      extend: {
        fontFamily: {
          'sans': ['Poppins', 'sans-serif']
        },
        colors: {
          'primary': {
            50: '#f0f5ff', 
            100: '#e1eaff', 
            200: '#c8d9ff', 
            300: '#a4c1ff', 
            400: '#81a8ff', 
            500: '#5e8eff', 
            600: '#4470f4', 
            700: '#3459db', 
            800: '#2c47b8', 
            900: '#263a94', 
          },
          'secondary': {
            50: '#edf8ff', 
            100: '#dbf0ff', 
            200: '#bde4ff', 
            300: '#94d3ff', 
            400: '#65bdff', 
            500: '#3aa3ff', 
            600: '#2186f0', 
            700: '#1a6ed6', 
            800: '#1958b0', 
            900: '#174890', 
          }
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
        }
      }
    }
  };
  
  export default tailwindConfig;