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
        neutral: '#717171',
        'navy-100': '#E0E7FF',
        'navy-800': '#1E1B4B',
        surface: '#F0FDFC',
        'app-bg': '#E6F7F7',
        border: '#B2DFDB',
        success: '#008A05',
        warning: '#FFB400',
        error: '#D93025',
        hover: '#E0F2F1',
        'data-blue': '#0369A1',
        'teal-brand': '#0D9488',
        'sea-green': '#14B8A6',
        'deep-teal': '#0F766E',
        'teal-muted': '#CCFBF1',
        'teal-subtle': '#F0FDFA',
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
