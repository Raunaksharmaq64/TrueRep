/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#FF8000',
        'brand-amber': '#FFB800',
        'brand-orange-light': '#FF9000',
        'bg-primary': '#050505',
        'bg-secondary': '#0B0B0B',
        'bg-tertiary': '#141414',
        'black-true': '#000000',
        'surface-glass-subtle': 'rgba(255, 255, 255, 0.03)',
        'surface-glass-light': 'rgba(255, 255, 255, 0.04)',
        'surface-glass-medium': 'rgba(255, 255, 255, 0.10)',
        'text-primary': '#FFFFFF',
        'text-secondary': 'rgba(255, 255, 255, 0.8)',
        'text-tertiary': 'rgba(255, 255, 255, 0.7)',
        'text-muted': 'rgba(255, 255, 255, 0.6)',
        'text-subtle': 'rgba(255, 255, 255, 0.5)',
        'text-faint': 'rgba(255, 255, 255, 0.27)',
        'text-accent': '#FFB800',
        'danger-red': '#F43F5E',
        'heatmap-red': '#FF0004',
        'heatmap-yellow': '#FFCC00',
        'stroke-glass': 'rgba(255, 255, 255, 0.07)',
        'stroke-accent': '#FF8000',
        'stroke-highlight': '#FFB800',
        'stroke-danger': '#F43F5E',
      },
      fontFamily: {
        doto: ['"Doto"', 'sans-serif'],
        inter: ['"Inter"', 'sans-serif'],
        aboreto: ['"Aboreto"', 'serif'],
        sans: ['"Arial MT Pro"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'xs': '4px',
        'md': '16px',
        'lg': '20px',
        'xl': '52px',
        '2xl': '64px',
        '3xl': '80px',
        '4xl': '110px',
        '5xl': '160px',
        'pill': '9999px',
      },
      boxShadow: {
        'cta': '0 8px 18px rgba(255, 128, 0, 0.25)',
        'panel': '0 24px 48px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 32px rgba(255, 128, 0, 0.25)',
        'card': '0 12px 24px rgba(255, 128, 0, 0.38)',
        'section': '0 0 24px rgba(255, 128, 0, 0.15)',
      },
      backdropBlur: {
        'nav': '18px',
        'card': '16px',
      },
      letterSpacing: {
        'tight-9': '-0.09em',
      }
    },
  },
  plugins: [],
}
