import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import konzol from './src/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    konzol({
      functionName: 'log!',
      entry: 'src/tests/dev/main.ts',
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
})
