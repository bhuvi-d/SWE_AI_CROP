/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          50: '#f2fcf5',
          100: '#e1f8e8',
          200: '#c3ecd0',
          300: '#94d9ac',
          400: '#5bbc82',
          500: '#34a062',
          600: '#26814d',
          700: '#226740',
          800: '#1f5136',
          900: '#1a432e',
          950: '#0d2519',
        },
        earth: {
          50: '#fbf7f3',
          100: '#f5efe6',
          200: '#ebdec9',
          300: '#dec49f',
          400: '#d0a775',
          500: '#c68d53',
          600: '#ba7444',
          700: '#9b5b3a',
          800: '#7f4b36',
          900: '#673e2e',
          950: '#371f17',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
