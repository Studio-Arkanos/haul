/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a1220',
          900: '#0f1c2e',
          800: '#16253b',
          700: '#1e334f',
          600: '#2a4566',
        },
        steel: {
          400: '#8ba3bc',
          300: '#a8bcd0',
          200: '#c5d4e3',
        },
        container: {
          DEFAULT: '#e85d04',
          light: '#f48c06',
          dark: '#dc2f02',
        },
        cream: '#f4f1ea',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
