/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts,jsx,tsx,html,js}"],

  theme: {
    extend: {
      colors: {
        primary: '#FFFFFF',
        secondary: '#4a90e2',
        background: '#2d3748',
        buttonBg: '#3a3a4f',
        buttonHoverBg: '#52526e',
      },
      borderRadius: {
        'custom': '8px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  variants: {},
  plugins: [],
}
