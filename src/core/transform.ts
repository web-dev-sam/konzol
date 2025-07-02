import MagicString from 'magic-string'
import { SyntaxError as KonzolSyntaxError } from '../parser/parser'
import { getAllCallExpressions, babelTypes, isExpectedCall, isNestedMacro } from '../utils/babel'
import { konzolParse } from '../utils/parser'
import { logError, logRed, logLog, logSyntaxError, unwrap, charsToKB } from '../utils/utils'
import { build } from './builder'
import { type KonzolOptions } from '../types/types'
import { vueLoader } from './loaders'
import { overwrite } from '../utils/string'


export function transform(codeStr: string, id: string, options: KonzolOptions): { code: string; map: null } | { error: unknown } | void {
  if (!/\.(ts|js|vue)$/.test(id)) return
  if (!options || !options.entry)
    return logRed(`Options are not provided for the plugin.`)

  // Load .vue files
  if (id.endsWith('.vue')) {
    const result = vueLoader(codeStr, id)
    if (result == null) return
    codeStr = result
  }
  
  const macroName = options.functionName?.trim() || 'log!'
  const expressions = getAllCallExpressions(codeStr, macroName)
  const nestedMacroExpressions = expressions.filter(e => isNestedMacro(expressions, e))
  for (const callExpression of nestedMacroExpressions) {
    const expStart = callExpression.start, expEnd = callExpression.end
    const fileLine = callExpression.loc?.start.line, fileCol = callExpression.loc?.start.column
    const link = [id, fileLine, fileCol].filter(Boolean).join(':')
    if (expStart == null || expEnd == null) {
      logError(`Found AST node without start or end position at ${link}. Skipping transformation.`)
      continue
    }
    codeStr = overwrite(codeStr, expStart, expEnd, 'null')
  }

  const code = new MagicString(codeStr)
  const validExpressions = getAllCallExpressions(codeStr, macroName)
  const codeSizes: number[] = []
  let hasReplacement = false
  for (const callExpression of validExpressions) {
    const expStart = callExpression.start, expEnd = callExpression.end
    const fileLine = callExpression.loc?.start.line, fileCol = callExpression.loc?.start.column
    const link = [id, fileLine, fileCol].filter(Boolean).join(':')
    if (expStart == null || expEnd == null) {
      logError(`Found AST node without start or end position at ${link}. Skipping transformation.`)
      continue
    }

    const startOffset = expStart
    const endOffset = expEnd
    const stripCode = () => {
      code.overwrite(startOffset, endOffset, `;`)
      hasReplacement = true
    }

    // Find expression
    const foundExpectedCall = isExpectedCall(callExpression, macroName)
    if (!foundExpectedCall) continue

    // Handle found expression
    if (process.env.NODE_ENV === 'production') {
      stripCode()
      continue
    }

    // Macro needs atleast a format parameter
    if (callExpression.arguments.length === 0) {
      logRed(`Call to "${macroName}" without arguments at ${link}. Statement is ignored.`)
      // TODO: error util for both vite/frontend
      stripCode()
      continue
    }
    const formatExpression = callExpression.arguments[0]
    if (!babelTypes.isStringLiteral(formatExpression)) {
      if (babelTypes.isTemplateLiteral(formatExpression)) {
        logRed(`First argument of "${macroName}" can't be a template literal (e.g. \`\`) at ${link}. Statement is ignored.`)
        stripCode()
        continue
      }
      logRed(`First argument of "${macroName}" must be an inline string literal at ${link}. Statement is ignored.`)
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
          .replace(macroName, loggingCode).toString()
        code.overwrite(startOffset, endOffset, newCode)
        hasReplacement = true
      }
      continue
    }
    const finalCode = build(formatAST, callExpression)
    codeSizes.push(finalCode.length)

    code.overwrite(startOffset, endOffset,
      code.slice(startOffset, endOffset)
        .replace(macroName, finalCode)
        .toString()
    )
    hasReplacement = true
  }
  if (!hasReplacement) return

  logLog(`Hydrate macros (${charsToKB(codeSizes.reduce((a, b) => a + b, 0))}KiB)`)
  return {
    code: code.toString(),
    map: null,
  }
}

