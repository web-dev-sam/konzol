import { defineConfig } from 'vite'
import Konzol from './src/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    Konzol({
      functionName: 'log!',
      entry: 'main.ts',
    })
  ],
})
