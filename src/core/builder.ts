import type { babelTypes } from '../utils/babel'
import type {
  FunctionExpression,
  ParseResult,
  PathSegment,
  VariableExpression,
} from '../utils/parser'
import type { Operation } from './registry'
import {

  isIdentifierSegment,
  isNestedVariableSegment,
  isTextExpression,
  isVariableExpression,
  isWildcardSegment,
} from '../utils/parser'
import { getVariableName, logWarn } from '../utils/utils'
import { createRoot, createString } from './constructs'
import { aliases, operations } from './registry'

export function build(ast: ParseResult, callExpression: babelTypes.CallExpression): string {
  const formatVariableCount = findVariableCount(ast)
  const providedVariableCount = callExpression.arguments.length - 1
  const variableCount = Math.max(formatVariableCount, providedVariableCount)

  const resultFuncArgs: string[] = []
  let i = -1
  type BuildReturn<N extends boolean> = N extends true ? string : null
  const buildFromVariable = <N extends boolean>(
    node: VariableExpression,
    nested: N,
  ): BuildReturn<N> => {
    const varBaseName = getVariableName(++i)
    const tempVarName = `_${varBaseName}`
    const varName = `$${varBaseName}`
    if (nested) {
      logWarn('Nested expressions not supported!')
      return `*` as BuildReturn<N>
    }

    if (node.path.length === 0) { // "{}" "{:count}"
      resultFuncArgs.push(applyModifiers(varName, node.modifiers))
      return null as BuildReturn<N>
    }

    const path = node.path.map((part) => {
      if (isIdentifierSegment(part))
        return part.name
      if (isNestedVariableSegment(part)) {
        return buildFromVariable(part, true)
      }
      if (isWildcardSegment(part))
        return '*'
      return ''
    })

    const result = applyModifiers(tempVarName, node.modifiers)
    const findArgs = `${varName},${JSON.stringify(path)}`
    resultFuncArgs.push(`(${tempVarName}=__kzl_find(${findArgs}),${result})`)
    return null as BuildReturn<N>
  }

  for (const konzolNodeIndex in ast) {
    const konzolNode = ast[konzolNodeIndex]
    if (isTextExpression(konzolNode)) {
      resultFuncArgs.push(createString(konzolNode.value))
      continue
    }
    if (isVariableExpression(konzolNode)) {
      buildFromVariable(konzolNode, false)
    }
  }

  const args = Array.from({ length: variableCount }).map((_, i) => `$${getVariableName(i)}`).join(',')
  const declarations = Array.from({ length: variableCount }).map((_, i) => `_${getVariableName(i)}`).join(',')
  const finalCode = createRoot({
    body: resultFuncArgs.join(','),
    args,
    declarations,
  })
  return finalCode
}

type HandledType = 'null' | 'arr' | 'map' | 'set' | 'num' | 'str' | 'else'
type SafeCasesMap = {
  [K in HandledType]: string
}
export function casesBuilder(checkedVal: string, cases: SafeCasesMap): string {
  return (
    `await __kzl_cases(${checkedVal},{${
      Object.entries(cases)
        .map(([prim, code]) => `${prim}:async v=>${code}`)
        .join(',')
    }})`
  )
}

function applyModifiers(expression: string, modifiers: FunctionExpression[] | null): string {
  const modifierContents = modifiers?.map(modifier => modifier.content)
  if (!modifierContents) {
    return expression
  }

  const operationMap: Record<string, Operation['builder']> = {}
  for (const operation of operations) {
    for (const alias of operation.alias) {
      if (typeof alias === 'string')
        operationMap[alias] = operation.builder
    }
  }

  let result = expression
  for (const modifier of modifierContents) {
    const maybeModifier = parseModifier(modifier)
    if (!maybeModifier)
      continue

    const { prefix, args } = maybeModifier
    let operation = operationMap[prefix]
    const isNativeModifier = prefix.startsWith('@') && prefix !== '@'
    if (isNativeModifier) {
      operation = operationMap['@']
      result = operation?.(result, createString(prefix.slice(1))) ?? result
      continue
    }

    result = operation?.(result, ...args) ?? result
  }
  return result
}

interface Modifier {
  prefix: string
  args: (string | number | boolean | null | undefined)[]
}
function parseModifier(input: string): Modifier | null {
  const pattern = /^([^<]*)(?:<([^>]*)>)?$/
  const match = input.match(pattern)
  if (!match) {
    console.warn(`Invalid modifier format: ${input}\nExpected format: "modifier<arg1, arg2, ...>" or "modifier"`)
    return null
  }

  const [, prefix, argsStr] = match
  const isNativeModifier = prefix.startsWith('@')
  if (!aliases.includes(prefix.trim()) && !isNativeModifier) {
    console.warn(`Unknown modifier: ${prefix.trim()}`)
    return null
  }

  if (argsStr == null || argsStr.trim() === '') {
    return { prefix: prefix.trim(), args: [] }
  }

  const args = argsStr.split(',').map((part) => {
    if (part === '' || part === 'undefined') {
      return undefined // func<0,>   -->   [0, undefined]
    }
    if (part.trim() === '') {
      const normalizedPart = part.replaceAll(/`/g, '\\`')
      return `\`${normalizedPart}\`` // func<0, >  -->   [0, ` `]
    }

    part = part.trim()
    if (!Number.isNaN(Number(part))) {
      return Number(part) // func<0, 1> -->   [0, 1]
    }
    if (part === 'true') {
      return true // func<0, true> -->   [0, true]
    }
    if (part === 'null') {
      return null // func<0, null> -->   [0, null]
    }
    if (part === 'false') {
      return false // func<0, false> -->   [0, false]
    }
    if (
      (part.startsWith('"') && part.endsWith('"'))
      || (part.startsWith('\'') && part.endsWith('\''))
      || (part.startsWith('`') && part.endsWith('`'))
    ) {
      const normalizedPart = createString(part.slice(1, -1))
      return `\`${normalizedPart}` // func<0, "idk`whatever lol 😂"> -->   [0, `idk\`whatever lol 😂`]
    }

    const normalizedPart = createString(part)
    return `\`${normalizedPart}\`` // func<0, idk`whatever lol 😂> -->   [0, `idk\`whatever lol 😂`]
  })

  return { prefix: prefix.trim(), args }
}

function findVariableCount(formatAST: ParseResult): number {
  function findNestedVariableCount(segs: PathSegment[], count = 0): number {
    let layerTotal = count
    for (const seg of segs) {
      if (isNestedVariableSegment(seg)) {
        layerTotal += 1 + findNestedVariableCount(seg.path)
      }
    }
    return layerTotal
  }

  let total = 0
  for (const node of formatAST) {
    if (isVariableExpression(node)) {
      total += 1 + findNestedVariableCount(node.path)
    }
  }
  return total
}
