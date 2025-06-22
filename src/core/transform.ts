import MagicString from "magic-string";
import type { NodePath } from '@babel/traverse';
import { parse as babelParse, traverse, types } from '../utils/babel';

// import { parse } from "../parser/parser";
// console.log(parse("Hey {}"))

export function transform(codeToTransform: string, id: string, options: KonzolOptions = {}): { code: string; map: any } | void {
  if (!/\.(ts|js|vue)$/.test(id)) {
    return;
  }

  let scriptOffset = 0;
  if (id.endsWith('.vue')) {
    const scriptMatch = codeToTransform.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (!scriptMatch) return;

    codeToTransform = scriptMatch[1];
    scriptOffset = scriptMatch.index! + scriptMatch[0].indexOf(scriptMatch[1]);
  }

  // Parse the code into an AST
  const ast = babelParse(codeToTransform, {
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
      const expectedFuncName = options.functionName || 'log!';

      const expectingNonNullAssertionSyntax = expectedFuncName.endsWith('!')
      const isSimpleCallExpression = types.isIdentifier(node.callee) && node.callee.name === expectedFuncName;
      const isNoNNullAssertionSyntax =
        types.isTSNonNullExpression(node.callee) &&
        types.isIdentifier(node.callee.expression) &&
        node.callee.expression.name === expectedFuncName.slice(0, -1);

      const foundExpression = expectingNonNullAssertionSyntax ? isNoNNullAssertionSyntax : isSimpleCallExpression
      if (foundExpression) {
        if (process.env.NODE_ENV === 'production') {
          code.overwrite(startOffset, endOffset, 'undefined')
          hasReplacement = true;
          return;
        }

        const replacedFunc = `() => {
            console.log("Here: ")
            console.log(
              '%c⚡ SYSTEM %c ONLINE %c✓',
              'background: #2c3e50; color: #ecf0f1; padding: 8px 12px; border-radius: 4px 0 0 4px; font-weight: bold;',
              'background: #27ae60; color: white; padding: 8px 12px; font-weight: bold;',
              'background: #27ae60; color: white; padding: 8px 12px; border-radius: 0 4px 4px 0; font-weight: bold;'
            );
        }`

        code.overwrite(
          startOffset,
          endOffset,
          code
            .snip(startOffset, endOffset)
            .replace(expectedFuncName, `;(${replacedFunc})`)
            .toString()
        )
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

