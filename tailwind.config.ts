import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coral: '#FF5A5F',
        airbnb: '#222222',
        'soft-dark': '#484848',
        neutral: '#595959',
        'navy-100': '#E0E7FF',
        'navy-800': '#1E1B4B',
        surface: '#FFFFFF',
        'app-bg': '#F7F7F7',
        border: '#EBEBEB',
        success: '#008A05',
        warning: '#FFB400',
        error: '#D93025',
        hover: '#F2F2F2',
        'data-blue': '#0369A1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'salary-sm': ['32px', { fontWeight: '700' }],
        'salary-lg': ['40px', { fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};

export default config;
