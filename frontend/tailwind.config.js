/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // or 'media' for media query based dark mode
  theme: {
    extend: {
      colors: {
        // Custom brand colors can be added here
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '2rem',
      },
      boxShadow: {
        'solid': '0 0 0 2px currentColor',
        'outline': '0 0 0 3px rgba(66, 153, 225, 0.5)',
      },
      height: {
        'screen-75': '75vh',
        'screen-50': '50vh',
      },
      minHeight: {
        '10': '2.5rem',
        '20': '5rem',
        '80': '20rem',
        'screen-50': '50vh',
        'screen-75': '75vh',
      },
      maxHeight: {
        '0': '0',
        'screen-75': '75vh',
        'screen-80': '80vh',
      },
      scale: {
        '102': '1.02',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
} 