import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        linen: '#f5efe6',
        sand: '#e8d8c3',
        clay: '#5b4636',
        amber: '#d39b5e',
        blush: '#e0b4a4',
        moss: '#7a8b6f',
      },
      boxShadow: {
        soft: '0 8px 20px rgba(91, 70, 54, 0.08)',
      },
    },
  },
  plugins: [typography],
};
