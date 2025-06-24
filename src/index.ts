import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { transform } from './core/transform';
import { codeSegments } from './macros/find';

export const unpluginFactory: UnpluginFactory<KonzolOptions> = options => {
  const virtualModuleId = 'virtual:konzol'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'unplugin-konzol',
    enforce: 'pre',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const code = codeSegments.find + codeSegments.cases
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
        if (transformedCode == null) {
          return
        }
        return {
          code: `import '${virtualModuleId}';\n${transformedCode.code}`,
          map: transformedCode.map,
        }
      }
      return transform(code, id, options)
    }
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)
export default unplugin
