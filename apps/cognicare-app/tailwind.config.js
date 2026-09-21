/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ner: {
          bark: '#3E2723',
          earth: '#5D4037',
          terracotta: '#D84315',
          amber: '#E65100',
          sand: '#EFEBE9',
          cream: '#FFFDF9',
          card: '#FFFFFF',
          forest: '#2E7D32',
          moss: '#1B5E20',
          mint: '#E8F5E9',
          gold: '#FFB300',
          chai: '#8D6E63',
          redSilk: '#C62828',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'tactile': '0 6px 0 0 #3E2723, 0 10px 20px rgba(62, 39, 35, 0.15)',
        'tactile-green': '0 6px 0 0 #1B5E20, 0 10px 20px rgba(46, 125, 50, 0.15)',
        'tactile-pressed': '0 2px 0 0 #3E2723, 0 4px 10px rgba(62, 39, 35, 0.1)',
        'card-warm': '0 4px 20px -2px rgba(93, 64, 55, 0.08)',
      }
    },
  },
  plugins: [],
}
