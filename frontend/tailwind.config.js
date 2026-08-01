/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand: Deep Indigo-Blue (matching the nav blue in image)
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          405: '#7c86f5',
          450: '#6f79f0',
          500: '#6366f1',
          550: '#5558e8',
          600: '#4f46e5',
          605: '#4a42df',
          650: '#4338ca',
          655: '#3f35c5',
          700: '#3730a3',
          800: '#312e81',
          900: '#1e1b4b',
          950: '#0f0d2b',
        },
        // Accent: Golden Sunset (matching the warm horizon glow in image)
        ocean: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Night sky dark tones (richer dark blues for sidebar/backgrounds)
        night: {
          50:  '#f0f4ff',
          100: '#dde6f5',
          800: '#0d1526',
          850: '#0b1120',
          900: '#08101d',
          950: '#050b14',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0d1526 0%, #1e2a4a 40%, #1a3060 100%)',
        'brand-gradient': 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.4s ease-out both',
        'shake': 'shake 0.4s ease-in-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '20%,60%': { transform: 'translateX(-6px)' }, '40%,80%': { transform: 'translateX(6px)' } },
      },
    },
  },
  plugins: [],
}
