/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#020617', // slate-950
      },
      boxShadow: {
        'glow-amber': '0 0 15px -3px rgba(245, 158, 11, 0.25)',
        'glow-indigo': '0 0 15px -3px rgba(99, 102, 241, 0.25)',
        'glow-emerald': '0 0 15px -3px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
};
