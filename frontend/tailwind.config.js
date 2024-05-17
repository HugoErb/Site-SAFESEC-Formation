module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      md2: '1080px',
      lg: '1024px',
      xl: '1280px'
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
