/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── DESIGN.md Clinical Blue Palette ── */
        primary:             { DEFAULT: '#004AC6', light: '#2563EB', dark: '#003EA8', container: '#2563EB', 'on': '#FFFFFF', 'on-container': '#EEEFFF' },
        secondary:           { DEFAULT: '#00687A', light: '#4CD7F6', dark: '#004E5C', container: '#57DFFE', 'on': '#FFFFFF', 'on-container': '#006172' },
        tertiary:            { DEFAULT: '#006056', light: '#26DEC9', dark: '#005048', container: '#007B6F', 'on': '#FFFFFF', 'on-container': '#B2FFF1' },
        surface:             { DEFAULT: '#FAF8FF', dim: '#D2D9F4', bright: '#FAF8FF', 'container-lowest': '#FFFFFF', 'container-low': '#F2F3FF', 'container': '#EAEDFF', 'container-high': '#E2E7FF', 'container-highest': '#DAE2FD', variant: '#DAE2FD' },
        'on-surface':        { DEFAULT: '#131B2E', variant: '#434655' },
        'inverse-surface':   '#283044',
        'inverse-on-surface':'#EEF0FF',
        outline:             { DEFAULT: '#737686', variant: '#C3C6D7' },
        'surface-tint':      '#0053DB',
        error:               { DEFAULT: '#BA1A1A', container: '#FFDAD6', 'on': '#FFFFFF', 'on-container': '#93000A' },
        /* ── Functional colors ── */
        success:             { DEFAULT: '#16A34A', light: '#DCFCE7' },
        warning:             { DEFAULT: '#EAB308', light: '#FEF9C3' },
        navy:                '#0F172A',
        /* ── Keep compatibility aliases ── */
        brand: {
          primary:   '#004AC6',
          secondary: '#00687A',
          accent:    '#2BE0CB',
          dark:      '#0F172A',
          light:     '#FAF8FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg':   ['48px', { lineHeight: '56px',  fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-lg-m': ['32px', { lineHeight: '40px',  fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg':  ['32px', { lineHeight: '40px',  fontWeight: '600', letterSpacing: '-0.01em' }],
        'headline-md':  ['24px', { lineHeight: '32px',  fontWeight: '600' }],
        'body-lg':      ['18px', { lineHeight: '28px',  fontWeight: '400' }],
        'body-md':      ['16px', { lineHeight: '24px',  fontWeight: '400' }],
        'label-md':     ['14px', { lineHeight: '20px',  fontWeight: '500', letterSpacing: '0.01em' }],
        'label-sm':     ['12px', { lineHeight: '16px',  fontWeight: '600' }],
      },
      borderRadius: {
        'card':  '1.5rem',   /* 24px — cards */
        'btn':   '0.75rem',  /* 12px — buttons/inputs */
        'badge': '9999px',   /* pill */
      },
      boxShadow: {
        'level-0': 'none',
        'level-1': '0px 4px 20px rgba(15, 23, 42, 0.05)',
        'level-2': '0px 6px 28px rgba(15, 23, 42, 0.10)',
        'level-3': '0px 12px 40px rgba(15, 23, 42, 0.15)',
        'card':       '0px 4px 20px rgba(15, 23, 42, 0.05)',
        'card-hover': '0px 6px 28px rgba(15, 23, 42, 0.10)',
        'glow-ai':    '0px 0px 20px rgba(43, 224, 203, 0.25)',
        'input-focus':'0px 0px 0px 4px rgba(37, 99, 235, 0.15)',
      },
      spacing: {
        'container-max': '1440px',
        'gutter': '24px',
      },
      maxWidth: {
        'container': '1440px',
      },
      animation: {
        'fade-in':     'fadeIn 0.3s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'mesh':        'meshShift 20s ease-in-out infinite',
        'float':       'float 6s ease-in-out infinite',
        'glow-pulse':  'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        meshShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(43, 224, 203, 0.15)' },
          '50%':      { boxShadow: '0 0 35px rgba(43, 224, 203, 0.35)' },
        },
      },
      backdropBlur: {
        'glass': '12px',
      },
    },
  },
  plugins: [],
}
