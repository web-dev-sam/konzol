import type { SyntaxError as KonzolSyntaxError } from '../parser/parser'

interface ProxyLike {
  _rawValue: unknown
}

interface UnproxifiedResult {
  _original: unknown
  [key: PropertyKey]: unknown
}

function isProxyLike(obj: unknown): obj is ProxyLike {
  return typeof obj === 'object' && obj !== null && '_rawValue' in obj
}

function isObject(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === 'object' && value !== null
}

export function unproxify(obj: unknown): UnproxifiedResult | undefined {
  if (obj == null) return undefined

  if (isProxyLike(obj)) {
    const res = obj._rawValue as UnproxifiedResult
    res._original = obj
    return res
  }

  const seen = new WeakSet<object>()

  function cloneWithoutProxy(value: unknown, depth = 0): unknown {
    if (depth > 10) return '[Max depth reached]'
    if (value == null || typeof value !== 'object') return value
    if (seen.has(value)) return '[Circular Reference]'
    seen.add(value)

    try {
      if (Array.isArray(value)) {
        return value.map((item) => cloneWithoutProxy(item, depth + 1))
      }

      const plainObject: Record<PropertyKey, unknown> = {}

      // Handle enumerable properties
      for (const key in value) {
        try {
          plainObject[key] = cloneWithoutProxy((value as Record<PropertyKey, unknown>)[key], depth + 1)
        } catch (error) {
          plainObject[key] = `[Error accessing property: ${String(error)}]`
        }
      }

      // Get non-enumerable own properties
      if (isObject(value)) {
        const ownKeys = Object.getOwnPropertyNames(value)
        for (const key of ownKeys) {
          if (!(key in plainObject)) {
            try {
              const descriptor = Object.getOwnPropertyDescriptor(value, key)
              if (descriptor?.get) {
                plainObject[key] = cloneWithoutProxy((value as Record<PropertyKey, unknown>)[key], depth + 1)
              } else if (descriptor?.value !== undefined) {
                plainObject[key] = cloneWithoutProxy(descriptor.value, depth + 1)
              }
            } catch {
              // Skip properties that can't be accessed
            }
          }
        }
      }

      return plainObject
    } finally {
      seen.delete(value)
    }
  }

  const result = cloneWithoutProxy(obj) as UnproxifiedResult
  result._original = obj
  return result
}

export function logSyntaxError(error: KonzolSyntaxError, id: string, code: string): void {
  const { message, location } = error
  const { start } = location

  const lines = code.split('\n')
  const errorLine = lines[start.line - 1] || ''
  const pointer = `${' '.repeat(start.column - 1)}^`

  logRed(`Konzol: Invalid formatter string found in\n    ${id}\n`)
  logRed(`"${errorLine}"`)
  logRed(` ${pointer} ${message}\n`)
}

export function logRed(...args: unknown[]): void {
  const RED = '\x1b[31m'
  const RESET = '\x1b[0m'

  console.log(RED, ...args, RESET)
}
