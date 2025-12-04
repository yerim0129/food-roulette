/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 레트로 배경 색상
        'retro-bg': '#0f0f23',
        'retro-card': '#16213e',
        // 네온 색상
        'neon-pink': '#ff2d6a',
        'neon-cyan': '#00fff2',
        'neon-yellow': '#fffc00',
        'neon-green': '#00ff66',
        'neon-orange': '#ff9500',
        'neon-purple': '#a855f7',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', '"DungGeunMo"', 'cursive'],
        korean: ['"DungGeunMo"', '"Press Start 2P"', 'cursive'],
      },
      boxShadow: {
        'neon-pink': '0 0 5px #ff2d6a, 0 0 20px #ff2d6a, 0 0 40px #ff2d6a',
        'neon-cyan': '0 0 5px #00fff2, 0 0 20px #00fff2, 0 0 40px #00fff2',
        'neon-yellow': '0 0 5px #fffc00, 0 0 20px #fffc00, 0 0 40px #fffc00',
        'neon-green': '0 0 5px #00ff66, 0 0 20px #00ff66, 0 0 40px #00ff66',
        'neon-orange': '0 0 5px #ff9500, 0 0 20px #ff9500, 0 0 40px #ff9500',
        'neon-purple': '0 0 5px #a855f7, 0 0 20px #a855f7, 0 0 40px #a855f7',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'blink': 'blink 1s step-end infinite',
        'scanline': 'scanline 8s linear infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
      },
      keyframes: {
        'glow': {
          '0%': {
            filter: 'brightness(1) drop-shadow(0 0 5px currentColor)',
          },
          '100%': {
            filter: 'brightness(1.2) drop-shadow(0 0 20px currentColor)',
          },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}
