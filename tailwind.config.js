/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#674E90',
          50: '#F4F1F8',
          100: '#E9E4F1',
          200: '#D3C9E3',
          300: '#BDAED5',
          400: '#A793C7',
          500: '#9178B9',
          600: '#674E90',
          700: '#4F3B6D',
          800: '#372849',
          900: '#1F1526'
        },
        accent: {
          DEFAULT: '#60A9D1',
          50: '#F0F7FB',
          100: '#E1EEF7',
          200: '#C3DFEF',
          300: '#A5D0E7',
          400: '#87C1DF',
          500: '#60A9D1',
          600: '#3B91BC',
          700: '#2D708F',
          800: '#1F4E62',
          900: '#112C35'
        },
        neutral: {
          DEFAULT: '#131414',
          50: '#F5F5F5',
          100: '#EBEBEB',
          200: '#D6D6D6',
          300: '#C2C2C2',
          400: '#ADADAD',
          500: '#999999',
          600: '#666666',
          700: '#4D4D4D',
          800: '#333333',
          900: '#131414'
        }
      }
    }
  },
  plugins: [],
}