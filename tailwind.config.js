/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Colors ───────────────────────────────────────────────────────────
      colors: {
        // Golden amber — primary brand accent (logo "SAI", headings, highlights)
        amber: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDDEA0',
          300: '#FCC86A',
          400: '#F9AA34',
          500: '#F5A623', // ← primary brand amber
          600: '#D4880A',
          700: '#A96B07',
          800: '#7C4E07',
          900: '#4F3207',
          950: '#2A1803',
        },
        // Neutral dark scale — surfaces, borders, muted text
        zinc: {
          950: '#0A0A0A', // near-black background (brand bg)
          900: '#111111',
          850: '#161616',
          800: '#1C1C1C', // card surface
          750: '#222222',
          700: '#2A2A2A', // border
          600: '#3D3D3D',
          500: '#555555',
          400: '#777777',
          300: '#AAAAAA', // secondary text
          200: '#CCCCCC',
          100: '#E5E5E5',
          50:  '#F5F5F5',
        },
      },

      // ─── Semantic color aliases (use these in components) ─────────────────
      // Access via CSS variables defined in globals.css:
      //   bg-[--color-bg], text-[--color-primary], etc.

      // ─── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        // Display: ultra-bold condensed — mirrors the KE:SAI logo style
        display: [
          '"Barlow Condensed"',
          '"Oswald"',
          '"Anton"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        // Body: clean geometric sans — readable, modern, technical
        sans: [
          '"Inter"',
          '"Inter var"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        // Mono: code labels, URLs, technical references
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          '"Fira Mono"',
          '"Roboto Mono"',
          'ui-monospace',
          'monospace',
        ],
      },

      fontSize: {
        // Display sizes — for hero headings
        '7xl': ['4.5rem',  { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        '8xl': ['6rem',    { lineHeight: '1',    letterSpacing: '-0.025em' }],
        '9xl': ['8rem',    { lineHeight: '0.95', letterSpacing: '-0.03em' }],
      },

      fontWeight: {
        black: '900', // for display/logo text
      },

      letterSpacing: {
        tightest: '-0.04em',
        tight:    '-0.02em',
        wide:     '0.1em',
        widest:   '0.2em',  // tagline tracking
      },

      // ─── Spacing / Layout ─────────────────────────────────────────────────
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },

      // ─── Borders ──────────────────────────────────────────────────────────
      borderColor: {
        DEFAULT: '#2A2A2A',
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '10px',
        xl: '16px',
      },

      // ─── Box Shadow ───────────────────────────────────────────────────────
      boxShadow: {
        // Amber glow — for focused/active states and highlight accents
        'glow-amber':  '0 0 20px rgba(245, 166, 35, 0.3)',
        'glow-amber-lg': '0 0 40px rgba(245, 166, 35, 0.25)',
        // Subtle card lift on dark bg
        'card':        '0 1px 3px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.8)',
        'card-hover':  '0 4px 12px rgba(0,0,0,0.7)',
      },

      // ─── Transitions ──────────────────────────────────────────────────────
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        250: '250ms',
        400: '400ms',
      },

      // ─── Animation ────────────────────────────────────────────────────────
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-amber': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(245, 166, 35, 0.3)' },
          '50%':      { boxShadow: '0 0 24px rgba(245, 166, 35, 0.6)' },
        },
      },
      animation: {
        'fade-up':     'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':     'fade-in 0.4s ease both',
        'pulse-amber': 'pulse-amber 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
