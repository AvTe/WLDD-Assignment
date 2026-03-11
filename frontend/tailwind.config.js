/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      DEFAULT: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.25rem',
      '3xl': '1.5rem',
      full: '9999px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#690031',
          50: '#fdf2f7',
          100: '#fce7f0',
          200: '#fbcfe3',
          300: '#f9a8cc',
          400: '#f472a8',
          500: '#ea4486',
          600: '#d42565',
          700: '#b8184d',
          800: '#690031',
          900: '#4a0023',
        },
        accent: {
          DEFAULT: '#ff584a',
          50: '#fff3f1',
          100: '#ffe4e1',
          200: '#ffcfc9',
          300: '#ffada3',
          400: '#ff584a',
          500: '#f83b2c',
          600: '#e5200f',
          700: '#c11809',
          800: '#9f170c',
          900: '#831a12',
        },
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
};
