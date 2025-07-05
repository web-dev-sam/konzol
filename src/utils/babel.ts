import _generate from '@babel/generator'
import { parse } from '@babel/parser'
import _traverse from '@babel/traverse'
import * as babelTypes from '@babel/types'

// Ensure esm-commonjs compatibility
const __generate = _generate as any
const __traverse = _traverse as any
export const traverse = (typeof _traverse === 'function' ? __traverse : __traverse.default) as typeof _traverse
export const generate = (typeof _generate === 'function' ? __generate : __generate.default) as typeof _generate

export { babelTypes, parse }

export function getAllCallExpressions(code: string, funcName: string): babelTypes.CallExpression[] {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })
  const callExpressions: babelTypes.CallExpression[] = []
  traverse(ast, {
    CallExpression({ node }): void {
      if (isExpectedCall(node, funcName)) {
        callExpressions.push(node)
      }
    },
  })
  return callExpressions
}

export function isNestedMacro(haystack: babelTypes.CallExpression[], needle: babelTypes.CallExpression): boolean {
  return haystack.some((expression) => {
    return expression.start! < needle.start! && expression.end! > needle.end!
  })
}

export function isExpectedCall(expression: babelTypes.CallExpression, macroName: string): boolean {
  const usesMacroSyntax = macroName.endsWith('!')
  const macroFunc = usesMacroSyntax ? macroName.slice(0, -1) : macroName
  const isCallSyntax
    = babelTypes.isIdentifier(expression.callee)
      && expression.callee.name === macroName
  const isMacroSyntax
    = babelTypes.isTSNonNullExpression(expression.callee)
      && babelTypes.isIdentifier(expression.callee.expression)
      && expression.callee.expression.name === macroFunc
  return usesMacroSyntax ? isMacroSyntax : isCallSyntax
}

export function logExpression(expression: babelTypes.CallExpression, code: string): void {
  console.log(code.slice(expression.start!, expression.end!))
}
