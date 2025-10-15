import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff',
          muted: '#93c5fd',
          dark: '#1d4ed8'
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f1f5f9',
          inverted: '#0f172a'
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5f5',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      borderRadius: {
        xl: '1rem'
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem'
      },
      boxShadow: {
        card: '0 10px 25px -15px rgba(15, 23, 42, 0.35)'
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
