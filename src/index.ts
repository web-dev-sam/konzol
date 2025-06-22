import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { transform } from './core/transform';

export const unpluginFactory: UnpluginFactory<KonzolOptions | undefined> = options => ({
  name: 'unplugin-konzol',
  enforce: 'pre',
  transformInclude(id) {
    return id.endsWith('main.ts')
  },
  transform(code, id) {
    return transform(code, id, options)
  },
})

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)
export default unplugin
