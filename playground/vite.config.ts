import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Unplugin from '../src/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    Inspect(),
    Unplugin(),
  ],
})
