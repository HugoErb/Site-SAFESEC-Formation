import daisyui from "daisyui"
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
      keyframes: {
        appear: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(5px)', opacity: '1' },
        },
        swipeLeft: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        swipeRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        appear: 'appear 0.3s ease forwards',
        swipeLeft: 'swipeLeft 0.3s ease forwards',
        swipeRight: 'swipeRight 0.3s ease forwards',
      },
      transformOrigin: {
        'center': 'center',
      },
      scale: {
        '0': '0',
        '100': '1',
      },
    },
  },
  plugins: [daisyui],
}
