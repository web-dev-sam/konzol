import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      exclude: [
        'main.ts',
        '*.config.ts',
        'assets/**',
        'dist/**',
        'src/vite.ts',
        'src/index.ts',
      ],
    },
  },
})
