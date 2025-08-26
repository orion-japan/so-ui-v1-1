/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    typography: require('./typography'), // ← カスタムtypographyを読み込み
    extend: {
      colors: {
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          700: '#374151',
          800: '#1F2A37',
          900: '#111928',
        },
        primary: {
          50: '#EBF5FF',
          100: '#E1EFFE',
          200: '#C3DDFD',
          300: '#A4CAFE',
          600: '#1C64F2',
          700: '#1A56DB',
        },
        blue: {
          500: '#E1EFFE',
        },
        green: {
          50: '#F3FAF7',
          100: '#DEF7EC',
          800: '#03543F',
        },
        yellow: {
          100: '#FDF6B2',
          800: '#723B13',
        },
        purple: {
          50: '#F6F5FF',
        },
        indigo: {
          25: '#F5F8FF',
          100: '#E0EAFF',
          600: '#444CE7',
        },
        sofiaPurple: '#a586d6',
        sofiaPink: '#f3c6d8',
      },
      screens: {
        mobile: '100px',
        tablet: '640px',
        pc: '769px',
      },
      fontFamily: {
        sans: [
          '"Noto Sans JP"',
          'Hiragino Kaku Gothic ProN',
          'Meiryo',
          'sans-serif',
        ],
        sofia: ['"Noto Serif JP"', 'serif'],
        zen: ['"Zen Maru Gothic"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
      lineHeight: {
        relaxed: '1.625', // default
        loose: '1.75',    // 確実に leading-loose を 1.75 に固定
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
};
