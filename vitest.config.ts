import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.tsx'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/**', 'components/**', 'app/api/**'],
      exclude: [
        'node_modules/**',
        '.next/**',
        'coverage/**',
        '**/*.d.ts',
        'vitest.config.ts',
        'vitest.setup.tsx',
        'next.config.ts',
        'postcss.config.mjs',
        'eslint.config.mjs',
        'prisma/**',
        'scripts/**',
        'temp/**',
        'public/**',
        // Exclude hard-to-test config files
        'lib/auth.ts',
        'lib/db.ts',
        'app/api/auth/\\[...nextauth\\]/**',
      ],
      thresholds: {
        // Realistic thresholds given complex components (video-player, kahoot-quiz)
        // that have hard-to-test browser APIs (video events, timers)
        lines: 75,
        functions: 65,
        branches: 65,
        statements: 75,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
