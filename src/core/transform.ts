import type { Options } from '../types'
import process from 'node:process'
import MagicString from 'magic-string'
import { SyntaxError as KonzolSyntaxError } from '../parser/parser'
import { babelTypes, getAllCallExpressions, isExpectedCall, isNestedMacro } from '../utils/babel'
import { konzolParse } from '../utils/parser'
import { overwrite } from '../utils/string'
import { charsToKB, logError, logLog, logSyntaxError, unwrap } from '../utils/utils'
import { build } from './builder'
import { vueLoader } from './loaders'

export function transform(codeStr: string, id: string, options?: Options): { code: string, map: null } | { error: unknown } | void {
  const result = /\.(ts|js|tsx|jsx|vue)$/.exec(id)
  if (result == null)
    return

  const tsSupported = ['ts', 'tsx', 'vue'].includes(result[1])
  if (!tsSupported && options?.macroName?.trim()?.endsWith('!')) {
    return logError(`Macro names ending with "!" are only supported in TypeScript files (e.g. .ts, .tsx, .vue). Please remove the "!" from the macro name or use a TypeScript file.`)
  }

  const macroName = options?.macroName?.trim() || 'log!'
  if (!/^(?:[\p{ID_Start}$_]|\\u(?:[\dA-Fa-f]{4}|\{[\dA-Fa-f]+\}))(?:[\p{ID_Continue}$\u200C\u200D]|\\u(?:[\dA-Fa-f]{4}|\{[\dA-Fa-f]+\}))*!?$/u.test(macroName)) {
    return logError(`Invalid macro name "${macroName}". Macro names must be valid JS indentifiers (variable names).`)
  }

  // Load .vue files
  if (id.endsWith('.vue')) {
    const result = vueLoader(codeStr, id)
    if (result == null)
      return
    codeStr = result
  }

  const expressions = getAllCallExpressions(codeStr, macroName)
  const nestedMacroExpressions = expressions.filter(e => isNestedMacro(expressions, e))
  for (const callExpression of nestedMacroExpressions) {
    const expStart = callExpression.start
    const expEnd = callExpression.end
    const fileLine = callExpression.loc?.start.line
    const fileCol = callExpression.loc?.start.column
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
    const expStart = callExpression.start
    const expEnd = callExpression.end
    const fileLine = callExpression.loc?.start.line
    const fileCol = callExpression.loc?.start.column
    const link = [id, fileLine, fileCol].filter(Boolean).join(':')
    if (expStart == null || expEnd == null) {
      logError(`Found AST node without start or end position at ${link}. Skipping transformation.`)
      continue
    }

    const startOffset = expStart
    const endOffset = expEnd
    const stripCode = (): void => {
      code.overwrite(startOffset, endOffset, `;`)
      hasReplacement = true
    }

    // Find expression
    const foundExpectedCall = isExpectedCall(callExpression, macroName)
    if (!foundExpectedCall)
      continue

    // Handle found expression
    if (process.env.NODE_ENV === 'production') {
      stripCode()
      continue
    }

    // Macro needs atleast a format parameter
    if (callExpression.arguments.length === 0) {
      logError(`Call to "${macroName}" without arguments at ${link}. Statement is ignored.`)
      // TODO: error util for both vite/frontend
      stripCode()
      continue
    }
    const formatExpression = callExpression.arguments[0]
    if (!babelTypes.isStringLiteral(formatExpression)) {
      if (babelTypes.isTemplateLiteral(formatExpression)) {
        logError(`First argument of "${macroName}" can't be a template literal (e.g. \`\`) at ${link}. Statement is ignored.`)
        stripCode()
        continue
      }
      logError(`First argument of "${macroName}" must be an inline string literal at ${link}. Statement is ignored.`)
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
          .replace(macroName, loggingCode)
          .toString()
        code.overwrite(startOffset, endOffset, newCode)
        hasReplacement = true
      }
      continue
    }
    const finalCode = build(formatAST, callExpression)
    codeSizes.push(finalCode.length)

    code.overwrite(startOffset, endOffset, code.slice(startOffset, endOffset)
      .replace(macroName, finalCode)
      .toString())
    hasReplacement = true
  }
  if (!hasReplacement)
    return

  logLog(`Hydrate macros (${charsToKB(codeSizes.reduce((a, b) => a + b, 0))}KiB)`)
  return {
    code: code.toString(),
    map: null,
  }
}
