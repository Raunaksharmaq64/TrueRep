/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        abyss: '#040811',
        'surface-dark': '#0e131d',
        'surface-panel': '#080e1a',
        'surface-card': '#0f172a',
        'primary-cyan': '#00d2ff',
        'cyan-ice': '#38bdf8',
        'navy-deep': '#0077b6',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'text-muted': '#475569',
      },
      fontFamily: {
        premis: ['"Premis"', '"Premis Regular"', '"Outfit"', '"Space Grotesk"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        heading: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'cyan-glow': '0 0 25px rgba(0, 210, 255, 0.4)',
        'cyan-glow-lg': '0 0 40px rgba(0, 210, 255, 0.6)',
        'cyan-soft': '0 0 16px rgba(0, 210, 255, 0.25)',
        'glass-card': '0 8px 32px rgba(0, 180, 216, 0.08)',
      },
      keyframes: {
        slideUpAthlete: {
          '0%': { transform: 'translateY(100px) scale(0.95)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideDownNav: {
          '0%': { transform: 'translateY(-60px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        equalizer: {
          '0%, 100%': { height: '30%' },
          '50%': { height: '100%' },
        }
      },
      animation: {
        'slide-up-athlete': 'slideUpAthlete 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slideInLeft 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down-nav': 'slideDownNav 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
