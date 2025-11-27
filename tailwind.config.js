/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cipher-cyan': '#00D9FF',
        'cipher-green': '#00FF94',
        'cipher-orange': '#FF6B35',
        'cipher-bg': '#0A0E17',
        'cipher-surface': '#141B2D',
        'cipher-border': '#1E2A47',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

