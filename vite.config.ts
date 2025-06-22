import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import devConsole from './src/plugins/vite-plugin-dev-console'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    devConsole({
      functionName: '$dev'
    })
  ]
})
