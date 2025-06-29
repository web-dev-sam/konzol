import MagicString, { type SourceMap } from 'magic-string'
import { SyntaxError as KonzolSyntaxError } from '../parser/parser'
import { getAllCallExpressions, babelTypes } from '../utils/babel'
import { konzolParse } from '../utils/parser'
import { logRed, logSyntaxError, unwrap } from '../utils/utils'
import { build } from './builder'
import { type KonzolOptions } from '../types/types'
import { vueLoader } from './loaders'


export function transform(codeStr: string, id: string, options: KonzolOptions): { code: string; map: SourceMap | null } | { error: unknown } | void {
  if (!/\.(ts|js|vue)$/.test(id)) return
  if (!options || !options.entry)
    return logRed(`Konzol: Options are not provided for the plugin.`)

  // Load .vue files
  if (id.endsWith('.vue')) {
    const result = vueLoader(codeStr, id)
    if (result == null) return
    codeStr = result
  }

  const callExpressions = getAllCallExpressions(codeStr)
  const code = new MagicString(codeStr)
  const codeSizes: number[] = []
  let hasReplacement = false
  for (const callExpression of callExpressions) {
    const expStart = callExpression.start, expEnd = callExpression.end
    const fileLine = callExpression.loc?.start.line, fileCol = callExpression.loc?.start.column
    const link = [id, fileLine, fileCol].filter(Boolean).join(':')
    if (expStart == null || expEnd == null) {
      console.error(`Konzol: Found AST node without start or end position at ${link}. Skipping transformation.`)
      continue
    }

    const startOffset = expStart
    const endOffset = expEnd
    const macroName = options.functionName?.trim() || 'log!'
    const usesMacroSyntax = macroName.endsWith('!')
    const macroFunc = usesMacroSyntax ? macroName.slice(0, -1) : macroName
    const stripCode = () => {
      code.overwrite(startOffset, endOffset, `;`)
      hasReplacement = true
    }

    // Find expression
    const isCallSyntax =
      babelTypes.isIdentifier(callExpression.callee) &&
      callExpression.callee.name === macroName
    const isMacroSyntax =
      babelTypes.isTSNonNullExpression(callExpression.callee) &&
      babelTypes.isIdentifier(callExpression.callee.expression) &&
      callExpression.callee.expression.name === macroFunc
    const foundExpression = usesMacroSyntax ? isMacroSyntax : isCallSyntax
    if (!foundExpression) continue

    // Handle found expression
    if (process.env.NODE_ENV === 'production') {
      stripCode()
      continue
    }

    // Macro needs atleast a format parameter
    if (callExpression.arguments.length === 0) {
      logRed(`Konzol: Call to "${macroName}" without arguments at ${link}. Statement is ignored.`)
      // TODO: error util for both vite/frontend
      stripCode()
      continue
    }
    const formatExpression = callExpression.arguments[0]
    if (!babelTypes.isStringLiteral(formatExpression)) {
      logRed(`Konzol: First argument of "${macroName}" must be an inline string literal at ${link}. Statement is ignored.`)
      stripCode()
      continue
    }

    // Handle format string syntax errors
    const format = formatExpression.value
    const [success, formatAST] = unwrap(() => konzolParse(format))
    if (!success) {
      if (formatAST instanceof KonzolSyntaxError) {
        const loggingCode = logSyntaxError(formatAST, id, format)
        const newCode = code
          .slice(startOffset, endOffset)
          .replace(macroName, `;(_=>${loggingCode})`)
          .toString()
        code.overwrite(startOffset, endOffset, newCode)
        hasReplacement = true
      }
      continue
    }

    const finalCode = build(formatAST, callExpression)
    codeSizes.push(finalCode.length)

    code.overwrite(
      startOffset, endOffset,
      code.slice(startOffset, endOffset)
        .replace(macroName, finalCode).toString()
    )
    hasReplacement = true
  }
  if (!hasReplacement) return

  console.info(`Konzol: Temporarily injected code size: ${codeSizes.reduce((a, b) => a + b, 0)} characters`)
  return {
    code: code.toString(),
    map: null,
  }
}

