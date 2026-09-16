/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        themePrimary: '#16A085',
        themePrimaryHover: '#1abc9c',
        themeGold: '#D8CFB4',
        themeBg: '#000000',
        themeSurface: '#080808',
        themeCard: '#0d0d0d',
      },
      borderRadius: {
        'theme': '18px',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
