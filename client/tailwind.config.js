/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // StockSense "After-Hours Stockroom" Palette
        ink: {
          DEFAULT: '#0B0D0C',
          950: '#0B0D0C', // Deep Ink base
          900: '#111412',
          850: '#171A18', // Graphite surfaces
          800: '#1E221F', // Elevated panels
          700: '#282D2A', // Borders
          600: '#383F3B',
        },
        graphite: {
          DEFAULT: '#171A18',
          surface: '#171A18',
          card: '#1D211F',
          border: '#2A302C',
        },
        ivory: {
          DEFAULT: '#F1EDE3', // Warm Ivory primary text
          soft: '#DCD7CB',
          muted: '#A8A295',
          dim: '#7C776C',
        },
        sage: {
          DEFAULT: '#8FAF87', // Muted Sage inventory healthy / primary retail accent
          light: '#A5C49E',
          dark: '#76946E',
        },
        copper: {
          DEFAULT: '#B8794A', // Copper hardware / accent detail
          light: '#CE8D5D',
          dark: '#9E653B',
        },
        amber: {
          DEFAULT: '#D6A85F', // Soft Amber warning / low stock
          light: '#E4BC78',
          dark: '#B88D47',
        },
        brick: {
          DEFAULT: '#C65A4A', // Muted Brick critical / out of stock / alerts
          light: '#D77263',
          dark: '#A84435',
        },
        // Legacy aliases mapped to new palette to preserve working dashboard
        midnight: {
          950: '#0B0D0C',
          900: '#111412',
          850: '#171A18',
          800: '#1E221F',
          700: '#282D2A',
        },
        lime: {
          DEFAULT: '#8FAF87', // Mapped to Muted Sage
          400: '#A5C49E',
          500: '#8FAF87',
          600: '#76946E',
        },
        cream: {
          DEFAULT: '#F1EDE3',
          100: '#F1EDE3',
          200: '#DCD7CB',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulseFast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radarPing 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        pulseFast: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' },
        },
        radarPing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.8' },
          '80%, 100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.12)' },
        }
      }
    },
  },
  plugins: [],
}
