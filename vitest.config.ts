import { defineConfig } from 'vitest/config'
import Konzol from './src/vite'

export default defineConfig({
  plugins: [
    Konzol({
      functionName: 'log!',
      entry: 'src/tests/dev/main.ts',
    })
  ],
  test: {
    include: ['test/**/*.test.ts'],
  },
})