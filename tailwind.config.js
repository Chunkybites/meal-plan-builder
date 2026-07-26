/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07090D',
          900: '#0B0E14',
          850: '#10141C',
          800: '#151A24',
          700: '#1D2430',
          600: '#2A3342',
          500: '#3D4859',
          400: '#5C6980',
          300: '#8B97AB',
          200: '#B9C2D0',
          100: '#E2E7EE',
        },
        volt: {
          300: '#E3FF70',
          400: '#D4FF3F',
          500: '#BDEE21',
          600: '#9CC916',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Sora"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.35)',
        glow: '0 0 0 1px rgba(212,255,63,0.25), 0 4px 32px rgba(212,255,63,0.08)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
