import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { transform } from './core/transform'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'
import { type KonzolOptions } from './types/types'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const unpluginFactory: UnpluginFactory<KonzolOptions> = (options) => {
  const virtualModuleId = 'virtual:konzol'
  const resolvedVirtualModuleId = `\0${virtualModuleId}`

  return {
    name: 'unplugin-konzol',
    enforce: 'pre',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const code = fs.readFileSync(
          path.resolve(__dirname, '../assets/virtual-module.min.js'),
          'utf-8'
        )
        console.info(`Konzol: Virtual module injected (${code.length} characters)`)
        return code
      }
    },
    transformInclude(id) {
      return /\.(js|ts|jsx|tsx)$/.test(id) && !id.includes('node_modules')
    },
    transform(code, id) {
      const usesGlobals = /(log!\()/.test(code)
      if (usesGlobals && !code.includes(virtualModuleId)) {
        const transformedCode = transform(code, id, options)
        if (transformedCode == null || 'error' in transformedCode) {
          return
        }
        return {
          code: `import '${virtualModuleId}';\n${transformedCode.code}`,
          map: transformedCode.map,
        }
      }
      const result = transform(code, id, options)
      if (result == null || 'error' in result) {
        return
      }
      console.log(result.code)
      return result
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)
export default unplugin
