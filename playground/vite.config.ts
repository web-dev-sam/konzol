import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import Unplugin from '../src/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    Unplugin({ macroName: 'log!' }),
    Vue(),
  ],
})
