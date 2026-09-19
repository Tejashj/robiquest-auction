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
        primary: '#16A085',
        primaryHover: '#1abc9c',
        headlineAccent: '#D8CFB4',
        themeBg: '#000000',
        themeSurface: '#000000',
        themeCard: '#000000',
        themeBorder: 'rgba(255, 255, 255, 0.08)',
        inputFill: 'rgba(255, 255, 255, 0.03)',
      },
      borderRadius: {
        'theme': '18px',
        'xl': '18px',
        '2xl': '18px',
        '3xl': '18px',
        '4xl': '18px',
      },
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        outfit: ['Poppins', 'sans-serif'],
        space: ['Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 25px -5px rgba(22, 160, 133, 0.45)',
        'neon-cyan-lg': '0 0 45px -5px rgba(22, 160, 133, 0.6)',
        'neon-emerald': '0 0 25px -5px rgba(22, 160, 133, 0.45)',
        'neon-gold': '0 0 25px -5px rgba(216, 207, 180, 0.45)',
        'primary-glow': '0 0 25px rgba(22, 160, 133, 0.35)',
        'glass': '0 12px 40px 0 rgba(0, 0, 0, 0.7)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.04)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        shimmer: 'shimmer 2.5s infinite',
      },
    },
  },
  plugins: [],
};
