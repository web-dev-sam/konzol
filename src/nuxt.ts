import type { Options } from './types'
import { addRspackPlugin, addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit'
import rspack from './rspack'
import vite from './vite'
import webpack from './webpack'

export interface ModuleOptions extends Options {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-unplugin-starter',
    configKey: 'unpluginStarter',
  },
  defaults: {
    // ...default options
  },
  setup(options, _nuxt) {
    addVitePlugin(() => vite(options))
    addWebpackPlugin(() => webpack(options))
    addRspackPlugin(() => rspack(options))
  },
})
