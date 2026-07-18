import type { Config } from 'tailwindcss';

/**
 * PathWiser design tokens — ported from the Stage 1 static prototype.
 * Preserves the dark theme, yellow/teal/violet accents, and
 * IBM Plex Mono + Plus Jakarta Sans typography.
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#06090e',
          surface: 'rgba(10, 15, 22, 0.85)',
          elevated: 'rgba(17, 24, 35, 0.9)',
          glass: 'rgba(255, 255, 255, 0.02)',
          'glass-strong': 'rgba(255, 255, 255, 0.05)',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          strong: 'rgba(255, 255, 255, 0.12)',
        },
        // Persona accents — Candidate/Employer/University map to Yellow/Teal/Violet
        pw: {
          yellow: '#facc15',
          teal: '#2dd4bf',
          violet: '#a78bfa',
          rose: '#fb7185',
          emerald: '#34d399',
          sky: '#38bdf8',
          amber: '#fbbf24',
        },
        text: {
          1: '#f1f5f9',
          2: '#94a3b8',
          3: '#475569',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      transitionTimingFunction: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      boxShadow: {
        'pw-glow-yellow': '0 0 0 3px rgba(250,204,21,0.12)',
        'pw-glow-teal': '0 0 0 3px rgba(45,212,191,0.12)',
        'pw-glow-violet': '0 0 0 3px rgba(167,139,250,0.12)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pipePulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(250,204,21,0)' },
          '50%': { boxShadow: '0 0 0 4px rgba(250,204,21,0.18)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 1.2s cubic-bezier(0.4, 0, 0.2, 1) both',
        'pipe-pulse': 'pipePulse 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
