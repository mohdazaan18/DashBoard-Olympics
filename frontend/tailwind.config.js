/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bebas Neue', 'cursive'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        gold: '#FFD700',
        silver: '#C0C0C0',
        bronze: '#CD7F32',
        olympic: {
          blue: '#0085C7',
          yellow: '#F4C300',
          black: '#000000',
          green: '#009F6B',
          red: '#DF0024',
        }
      }
    },
  },
  plugins: [],
}
