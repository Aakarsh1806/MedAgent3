/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        critical: '#FF4D4F',
        'high-risk': '#FA8C16',
        moderate: '#FADB14',
        stable: '#52C41A',
        primary: '#1677FF',
        'bg-base': '#F5F7FA',
        'card-bg': '#FFFFFF',
      },
      borderRadius: {
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.12)',
        glow: '0 0 20px rgba(255,77,79,0.35)',
        'glow-blue': '0 0 20px rgba(22,119,255,0.25)',
      },
      animation: {
        'pulse-critical': 'pulse-critical 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'flash': 'flash 0.5s ease-in-out',
        'typing': 'typing 1.2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-critical': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,77,79,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(255,77,79,0)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        flash: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(255,77,79,0.15)' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
