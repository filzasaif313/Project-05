/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // StockSense Obsidian Gold & Ember Terminal Palette (Zero Blue, Zero Green, Zero Purple)
        navy: {
          DEFAULT: '#0C0A09',  // Warm Pitch Obsidian background
          base: '#0C0A09',
          950: '#080706',
          900: '#0C0A09',
          850: '#141210',
          800: '#1C1917',
        },
        midnight: {
          DEFAULT: '#1C1917',  // Dark Charcoal Stone panels / navigation
          surface: '#1C1917',
          panel: '#1C1917',
          card: '#221F1D',
          elevated: '#292524',
          border: '#38332E',
          700: '#44403C',
          800: '#38332E',
          850: '#292524',
          900: '#1C1917',
          950: '#0C0A09',
        },
        electric: {
          DEFAULT: '#F59E0B',  // Radiant Amber Gold primary actions & active states
          hover: '#D97706',
          light: '#FCD34D',
          dim: '#B45309',
        },
        violet: {
          DEFAULT: '#F97316',  // Sunset Ember / Flame Orange AI & Store Brain accent
          hover: '#EA580C',
          light: '#FB923C',
          dim: '#C2410C',
        },
        lavender: {
          DEFAULT: '#FB923C',  // Warm Apricot secondary accent
          soft: '#FDBA74',
          dim: '#EA580C',
        },
        offwhite: {
          DEFAULT: '#FAFAF9',  // Warm Off White primary text
          soft: '#F5F5F4',
          muted: '#E7E5E4',
        },
        slate: {
          DEFAULT: '#A8A29E',  // Warm Stone secondary text
          dim: '#78716C',
          dark: '#57534E',
        },
        softgreen: {
          DEFAULT: '#FBBF24',  // Sun Gold healthy / success state (no green)
          light: '#FCD34D',
          dark: '#D97706',
        },
        softred: {
          DEFAULT: '#EF4444',  // Crimson Red errors / alerts
          light: '#F87171',
          dark: '#DC2626',
        },
        softamber: {
          DEFAULT: '#F59E0B',  // Amber warning / threshold
          light: '#FCD34D',
          dark: '#D97706',
        },

        // Backward compatibility aliases mapped to new palette
        ink: {
          DEFAULT: '#0C0A09',
          950: '#0C0A09',
          900: '#141210',
          850: '#1C1917',
          800: '#221F1D',
          700: '#38332E',
          600: '#44403C',
        },
        graphite: {
          DEFAULT: '#1C1917',
          surface: '#1C1917',
          card: '#221F1D',
          border: '#38332E',
        },
        ivory: {
          DEFAULT: '#FAFAF9',
          soft: '#F5F5F4',
          muted: '#A8A29E',
          dim: '#78716C',
        },
        sage: {
          DEFAULT: '#FBBF24',
          light: '#FCD34D',
          dark: '#D97706',
        },
        copper: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
          dark: '#D97706',
        },
        amber: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
          dark: '#D97706',
        },
        brick: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
        lime: {
          DEFAULT: '#FBBF24',
          400: '#FCD34D',
          500: '#FBBF24',
          600: '#D97706',
        },
        cream: {
          DEFAULT: '#FAFAF9',
          100: '#FAFAF9',
          200: '#F5F5F4',
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
