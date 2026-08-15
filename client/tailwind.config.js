/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8A5F41',
        secondary: '#A77F60',
        background: '#FAF9F6', // Off-white
        text: '#333333', // Dark charcoal
      }
    },
  },
  plugins: [],
}
