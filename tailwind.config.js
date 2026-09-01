/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/client/index.html', './src/client/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#12211C', muted: '#4A5B55', soft: '#6B7C76' },
        leaf: { 50: '#EEF6F1', 100: '#D8EBE0', 300: '#8FC5A6', 500: '#2E7D5B', 600: '#25664A', 700: '#1C4E39' },
        sand: { 50: '#FBF8F3', 100: '#F4EEE4', 200: '#E7DECE' },
        alert: { 50: '#FDF0EC', 100: '#FADDD4', 500: '#C4441F', 600: '#A63616' },
        warn: { 50: '#FEF7E7', 100: '#FBEAC2', 600: '#9A6B08' }
      },
      fontFamily: {
        sans: ['"Inter var"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: { card: '0 1px 2px rgba(18,33,28,0.06), 0 8px 24px -12px rgba(18,33,28,0.18)' }
    }
  },
  plugins: []
};
