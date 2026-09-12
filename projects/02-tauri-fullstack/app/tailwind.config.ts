import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--ds-color-primary)',
        surface: 'var(--ds-color-surface)',
        ink: 'var(--ds-color-ink)',
      },
    },
  },
  plugins: [],
} satisfies Config;
