module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        '3xl': '35px 35px 35px rgba(0, 0, 0, 0.3)',
        'inner-md': 'inset 10px 10px 35px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
};
