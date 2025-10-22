/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EAF2FF',
          100: '#4169E1',
        },
        secondary: {
          50: '#E0F7F4',
          100: '#19CCA1',
        },
        text: {
          main: '#061826',
          sub: '#4A4D4F',
          muted: '#8D9194',
          cancel: '#e1e3e5',
          invert: '#ffffff',
        },
        success: '#22c55e',
        warning: '#facc15',
        danger: '#ef4444',
        dark: '#1e293b',
        light: '#f8fafc',
      },
    },
  },
  plugins: [],
};
