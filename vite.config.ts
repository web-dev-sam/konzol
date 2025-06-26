import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Konzol from './src/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    Vue(),
    Konzol({
      functionName: 'log!',
      entry: 'src/tests/dev/main.ts',
    })
  ],
})
