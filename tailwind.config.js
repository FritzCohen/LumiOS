/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,json}'],
  corePlugins: {
    textColor: true
  },
  theme: {
    colors: {
      primary: "var(--primary)",
      "primary-light": "var(--primaryLight)",
      secondary: "var(--secondary)",
      "secondary-light": "var(--secondaryLight)",
      "text-base": "var(--textBase)",
    },
    extend: {},
  },
  keyframes: {
    focusGlow: {
      '0%': { boxShadow: '0 0 0 0 rgba(0, 120, 212, 0.7)' },
      '100%': { boxShadow: '0 0 0 6px rgba(0, 120, 212, 0)' },
    },
  },
  animation: {
    glow: 'focusGlow 0.4s ease-out',
  },
  plugins: [
    function ({ addComponents }) {
      const newUtilities = {
        '.fade-in': {
          '@apply opacity-0 transition-opacity ease-linear duration-700': {},
          '&.show': {
            '@apply opacity-100': {},
          },
        },
      };
      addComponents(newUtilities);
    },
  ],
}