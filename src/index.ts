import type { NodePath } from '@babel/traverse';
import type { UnpluginFactory } from 'unplugin'
import MagicString from 'magic-string';
import { parse, traverse, types } from './utils/babel';
import { createUnplugin } from 'unplugin'
import type { KonzolOptions } from './types';

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



function transform(codeToTransform: string, id: string, options: KonzolOptions = {}): { code: string; map: any } | void {
  if (!/\.(ts|js|vue)$/.test(id)) {
    return;
  }

  let scriptOffset = 0;
  
  // Handle Vue files
  if (id.endsWith('.vue')) {
    const scriptMatch = codeToTransform.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (!scriptMatch) return;
    
    codeToTransform = scriptMatch[1];
    scriptOffset = scriptMatch.index! + scriptMatch[0].indexOf(scriptMatch[1]);
  }

  // Parse the code into an AST
  const ast = parse(codeToTransform, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
  const code = new MagicString(codeToTransform);

  let hasReplacement = false;
  traverse(ast, {
    CallExpression(path: NodePath<types.CallExpression>) {
      const { node } = path;
      const startOffset = node.start! + scriptOffset;
      const endOffset = node.end! + scriptOffset;
      const expectedFuncName = options.functionName || '$log';

      const simpleCallExpression = types.isIdentifier(node.callee) && node.callee.name === expectedFuncName;
      const callExpressionWithNoNNullAssertion = types.isTSNonNullExpression(node.callee) && types.isIdentifier(node.callee.expression) && node.callee.expression.name === expectedFuncName;
      if (simpleCallExpression || callExpressionWithNoNNullAssertion) {
        if (process.env.NODE_ENV !== 'production') {
          code.overwrite(startOffset, endOffset, code.snip(startOffset, endOffset).replace(expectedFuncName, 'console.log').toString())
        } else {
          code.overwrite(startOffset, endOffset, 'undefined')
        }
        hasReplacement = true;
      }
    }
  });
  if (!hasReplacement) return;

  return {
    code: code.toString(),
    map: code.generateMap({ hires: true })
  };
}

