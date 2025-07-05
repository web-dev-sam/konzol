import type { UnpluginFactory } from 'unplugin'
import type { KonzolOptions } from './types/types'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createUnplugin } from 'unplugin'
import { transform } from './core/transform'
import { charsToKB, logLog } from './utils/utils'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
          'utf-8',
        )
        logLog(`Add virtual module (${charsToKB(code.length)}KiB)`)
        return code
      }
    },
    transformInclude(id) {
      return /\.(?:js|ts|jsx|tsx)$/.test(id) && !id.includes('node_modules')
    },
    transform(code, id) {
      const usesGlobals = /log!\(/.test(code)
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
      return result
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)
export default unplugin
