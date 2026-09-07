import type { Config } from 'tailwindcss';

/**
 * Colour tokens are declared in OKLCH in src/app/globals.css and referenced here
 * through CSS variables, so the palette has a single source of truth.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'oklch(var(--canvas) / <alpha-value>)',
        surface: 'oklch(var(--surface) / <alpha-value>)',
        raised: 'oklch(var(--raised) / <alpha-value>)',
        ink: 'oklch(var(--ink) / <alpha-value>)',
        muted: 'oklch(var(--muted) / <alpha-value>)',
        faint: 'oklch(var(--faint) / <alpha-value>)',
        line: 'oklch(var(--line) / <alpha-value>)',
        hairline: 'oklch(var(--hairline) / <alpha-value>)',
        brand: {
          DEFAULT: 'oklch(var(--brand) / <alpha-value>)',
          strong: 'oklch(var(--brand-strong) / <alpha-value>)',
          bright: 'oklch(var(--brand-bright) / <alpha-value>)',
          wash: 'oklch(var(--brand-wash) / <alpha-value>)',
        },
        deep: {
          DEFAULT: 'oklch(var(--deep) / <alpha-value>)',
          soft: 'oklch(var(--deep-soft) / <alpha-value>)',
          line: 'oklch(var(--deep-line) / <alpha-value>)',
          text: 'oklch(var(--deep-text) / <alpha-value>)',
        },
        signal: {
          amber: 'oklch(var(--signal-amber) / <alpha-value>)',
          green: 'oklch(var(--signal-green) / <alpha-value>)',
          red: 'oklch(var(--signal-red) / <alpha-value>)',
          violet: 'oklch(var(--signal-violet) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        eyebrow: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.14em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.08', letterSpacing: '-0.022em' }],
        'display-md': ['3rem', { lineHeight: '1.04', letterSpacing: '-0.026em' }],
        'display-lg': ['4rem', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
      },
      maxWidth: {
        prose: '68ch',
        shell: '78rem',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translate3d(0, 8px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
