/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#0B3B2E',
          deep: '#072A21',
          light: '#135443',
        },
        lime: {
          DEFAULT: '#C6F36B',
          hover: '#B2E84F',
          muted: '#E2F8A8',
        },
        cream: {
          DEFAULT: '#FAF7E8',
          card: '#FFFFFF',
          border: '#E8E4D2',
        },
        mint: {
          DEFAULT: '#E4F4E8',
        },
        pastel: {
          pink: '#F4B6C2',
          yellow: '#F5C451',
          orange: '#F59E5B',
          lavender: '#C9B8F0',
          sky: '#B8DDF0',
        },
        text: {
          primary: '#10231C',
          secondary: '#4B5E55',
          ondark: '#F3F6EF',
          muted: '#A9BDB1',
        },
        status: {
          success: '#1F8A4C',
          warning: '#B7791F',
          danger: '#B91C1C',
        },
      },
      fontFamily: {
        heading: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
        arch: '999px 999px 20px 20px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(16, 35, 28, 0.06)',
        lift: '0 8px 24px rgba(16, 35, 28, 0.08)',
      },
    },
  },
  plugins: [],
};
