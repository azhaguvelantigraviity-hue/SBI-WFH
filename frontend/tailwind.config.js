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
        background: {
          DEFAULT: '#F7F6FC',
          dark: '#0D0D10',
        },
        sidebar: {
          light: '#FFFFFF',
          dark: '#131318',
        },
        card: {
          light: '#FFFFFF',
          dark: '#16161F',
        },
        accent: {
          DEFAULT: '#7B5EA7',
          light: '#9B7DC7',
          dark: '#6B46C1',
        },
        border: {
          light: '#E4E1F0',
          dark: '#252530',
        },
        text: {
          primary: '#1A1828',
          secondary: '#5E5A75',
          muted: '#9996B0',
          dark: {
            primary: '#F2F0FF',
            secondary: '#A09CB8',
            muted: '#5E5A75',
          }
        },
        success: '#2ECC8F',
        danger: '#E85D75',
        warning: '#F0A500',
        info: '#4A9EFF',
        purple: '#B06AFF',
        teal: '#2EC4B6',
      },
      fontFamily: {
        sans: ['Instrument Sans', 'sans-serif'],
        fraunces: ['Fraunces', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'premium': '0 8px 32px rgba(0,0,0,0.08)',
        'premium-dark': '0 8px 32px rgba(0,0,0,0.5)',
      }
    },
  },
  plugins: [],
}
