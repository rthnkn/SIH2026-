/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#faf8f5',
          100: '#f5f0ea',
          200: '#ede5d9',
          300: '#e0d4c4',
          400: '#c8b8a4',
          500: '#a89880',
        },
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#52b788',
          500: '#2d6a4f',
          600: '#1b4332',
          700: '#143326',
          800: '#0d2218',
          900: '#081610',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#52b788',
          500: '#2d6a4f',
          600: '#1b4332',
        },
        healthcare: {
          teal: '#2d6a4f',
          green: '#40916c',
          amber: '#d4a373',
          red: '#c1121f',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'elderly-sm': ['1rem', { lineHeight: '1.5rem' }],
        'elderly-base': ['1.125rem', { lineHeight: '1.75rem' }],
        'elderly-lg': ['1.25rem', { lineHeight: '1.875rem' }],
        'elderly-xl': ['1.5rem', { lineHeight: '2rem' }],
        'elderly-2xl': ['1.875rem', { lineHeight: '2.5rem' }],
        'elderly-3xl': ['2.25rem', { lineHeight: '3rem' }],
      },
      spacing: {
        'elderly': '1rem',
      },
      borderRadius: {
        'elderly': '1rem',
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
}
