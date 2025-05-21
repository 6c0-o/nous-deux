// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'nous-pink': {
          light: '#ffb6c1',
          DEFAULT: '#ff4d8f',
          dark: '#ff1a75',
        },
        'nous-burgundy': {
          DEFAULT: '#4a0d29',
          dark: '#320a1c',
        },
      },
    },
  },
  plugins: [],
};
