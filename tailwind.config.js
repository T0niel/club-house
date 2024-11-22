/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.ejs'],
  theme: {
    extend: {
      colors: {
        'transparent-gray-bg': 'rgba(0, 0, 0, 0.5)',
      },    
      backgroundImage: {
        'index-background': "url('/images/index-layer.svg')",
      },
      animation: {
        'slide-bottom': 'slide-bottom-keyframe 800ms ease-in-out',
        'slide-right-left': 'slide-right-left-keyframe 1s ease-out',
      },
      keyframes: {
        'slide-bottom-keyframe': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20%)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0px)',
          },
        },
        'slide-right-left-keyframe': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-20%)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0px)',
          },
        },
      },
    },
  },
  plugins: [],
};

