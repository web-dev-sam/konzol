import MagicString, { type SourceMap } from 'magic-string'
import { SyntaxError as KonzolSyntaxError } from '../parser/parser'
import { parse as babelParse, traverse, types } from '../utils/babel'
import { konzolParse } from '../utils/parser'
import { logSyntaxError } from '../utils/utils'
import { build } from './builder'
import { type KonzolOptions } from '../types/types'

export function transform(codeToTransform: string, id: string, options: KonzolOptions, evaluate: boolean = false): { code: string; map: SourceMap | null } | { error: unknown } | undefined {
  if (!/\.(ts|js|vue)$/.test(id)) {
    return
  }
  if (!options || !options.entry) {
    const error = `Konzol: Options are not provided for the plugin.`
    console.error(error)
    return { error }
  }

  let scriptOffset = 0
  if (id.endsWith('.vue')) {
    const scriptMatch = codeToTransform.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    if (!scriptMatch || !scriptMatch.index) return

    codeToTransform = scriptMatch[1]
    scriptOffset = scriptMatch.index + scriptMatch[0].indexOf(scriptMatch[1])
  }

  // Parse the code into an AST
  const ast = babelParse(codeToTransform, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })
  const code = new MagicString(codeToTransform)

  const codeSizes: number[] = []
  let hasReplacement = false
  traverse(ast, {
    CallExpression(path) {
      const { node } = path
      if (!node.start || !node.end) {
        console.warn(
          `Konzol: Found AST node without start or end position at ${id}:${node.loc?.start.line}:${node.loc?.start.column}. Skipping transformation.`,
        )
        return
      }

      const startOffset = node.start + scriptOffset
      const endOffset = node.end + scriptOffset
      const expectedFuncName = options.functionName || 'log!'

      const expectingNonNullAssertionSyntax = expectedFuncName.endsWith('!')
      const isSimpleCallExpression = types.isIdentifier(node.callee) && node.callee.name === expectedFuncName
      const isNoNNullAssertionSyntax =
        types.isTSNonNullExpression(node.callee) &&
        types.isIdentifier(node.callee.expression) &&
        node.callee.expression.name === expectedFuncName.slice(0, -1)

      const foundExpression = expectingNonNullAssertionSyntax ? isNoNNullAssertionSyntax : isSimpleCallExpression
      if (foundExpression) {
        if (process.env.NODE_ENV === 'production') {
          code.overwrite(startOffset, endOffset, 'undefined')
          hasReplacement = true
          return
        }

        if (node.arguments.length === 0) {
          console.warn(
            `Konzol: Call to "${expectedFuncName}" without arguments at ${id}:${node.loc?.start.line}:${node.loc?.start.column}. Statement is ignored.`,
          )
          code.overwrite(startOffset, endOffset, `;`)
          return
        }

        if (!types.isStringLiteral(node.arguments[0])) {
          console.warn(
            `Konzol: First argument of "${expectedFuncName}" must be a string literal at ${id}:${node.loc?.start.line}:${node.loc?.start.column} (You have to write the string inline instead of using variables or expressions). Statement is ignored.`,
          )
          code.overwrite(startOffset, endOffset, `;`)
          return
        }

        const format = node.arguments[0].value
        try {
          const formatAST = konzolParse(format)
          const str = build(formatAST, evaluate) //, node.arguments.slice(1), code);

          const finalCode = `;(${str})`
          codeSizes.push(finalCode.length)

          code.overwrite(startOffset, endOffset, code.snip(startOffset, endOffset).replaceAll(expectedFuncName, finalCode).toString())
          hasReplacement = true
        } catch (e) {
          if (e instanceof KonzolSyntaxError) {
            logSyntaxError(e, id, format)
            return
          }
          throw e
        }
      }
    },
  })
  if (!hasReplacement) return

  // 4518 (Before global vars)
  console.info(`Konzol: Temporarily injected code size: ${codeSizes.reduce((a, b) => a + b, 0)} characters`)

  return {
    code: code.toString(),
    // Source maps for now disabled to make debugging easier
    // map: code.generateMap({ hires: true })
    map: null,
  }
}
