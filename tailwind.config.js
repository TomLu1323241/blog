module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        '3xl': '20px 20px 20px rgba(0, 0, 0, 0.3)',
        'inner-md': 'inset 10px 10px 20px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
};
