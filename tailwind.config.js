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
          50: '#E98074',
          100: '#e85a4f',
        },
        background: {
          50: '#F9FAFB',
          100: '#d8c3a5',
          200: '#8d8e8a',
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
