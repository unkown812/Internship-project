/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3550B2',
          light: '#4C6EE6',
          dark: '#28408F',
        },
        secondary: {
          DEFAULT: '#FF8A00',
          light: '#FFA333',
          dark: '#CC6E00',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        skewmorphism: '6px 6px 12px rgba(0, 0, 0, 0.05), -6px -6px 12px rgba(255, 255, 255, 0.9)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      skew: {
        sm: '5deg',
        md: '10deg',
        lg: '15deg',
      },
    },
  },
  plugins: [],
};