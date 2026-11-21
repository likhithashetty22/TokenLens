// tailwind.config.js
// TokenLens design tokens: a dark, glassmorphic theme with a single
// signature accent (electric indigo) used sparingly for focus states,
// the score ring, and primary actions.
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#07080d',
          900: '#0c0e16',
          800: '#12141f',
          700: '#1b1e2c',
          600: '#262a3c',
        },
        accent: {
          DEFAULT: '#6c5ce7',
          light: '#8b7bf0',
          dark: '#5344c9',
        },
        good: '#34d399',
        warn: '#fbbf24',
        bad: '#f87171',
        info: '#60a5fa',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        glow: '0 0 40px -8px rgba(108, 92, 231, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease-out both',
        pulseSlow: 'pulseSlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
