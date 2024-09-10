/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'verde-claro': '#4CAF50',
        'verde-medio': '#388E3C',
        'verde-oscuro': '#2C6B2F',
        'gris-claro': '#F5F5F5',
        'gris-medio': '#E0E0E0',
        'gris-oscuro': '#9E9E9E',
        'azul-claro': '#2196F3',
        'amarillo': '#FFEB3B',
        'rojo': '#F44336',
      },
    },
  },
  plugins: [],
}
