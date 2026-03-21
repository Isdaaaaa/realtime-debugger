import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        debug: {
          slate: '#0f172a',
          panel: '#111827',
          accent: '#38bdf8',
          warn: '#f59e0b',
          success: '#10b981',
          text: '#e5e7eb',
          muted: '#9ca3af',
          border: '#1f2937'
        }
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Text', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        pulse: '0 0 0 1px rgba(56, 189, 248, 0.3), 0 0 20px rgba(56, 189, 248, 0.15)'
      }
    }
  },
  plugins: []
} satisfies Config;
