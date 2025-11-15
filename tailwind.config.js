/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A5D1A',
          dark: '#0F3A0F',
          light: '#2A7D2A',
        },
        secondary: {
          DEFAULT: '#8B5E3C',
          dark: '#6B4528',
          light: '#AB7E5C',
        },
        cream: {
          DEFAULT: '#F8F5F0',
          light: '#FFFFFF',
          dark: '#E8E5E0',
        },
        accent: {
          DEFAULT: '#D4A017',
          dark: '#B89015',
          light: '#F4B817',
        },
        error: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          dark: '#991B1B',
        },
      },
      spacing: {
        '8': '8px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
        '64': '64px',
      },
      borderRadius: {
        '8': '8px',
        '12': '12px',
        '16': '16px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
}

