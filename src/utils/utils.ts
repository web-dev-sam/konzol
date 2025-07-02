import { createRoot } from '../core/constructs'
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

export function logSyntaxError(error: KonzolSyntaxError, id: string, code: string): string {
  const { message, location } = error
  const { start } = location

  const lines = code.split('\n')
  const errorLine = (lines[start.line - 1] || '').replaceAll('`', '\\`')
  const pointer = `${' '.repeat(start.column - 1)}^`

  const errorStr = `Konzol: Invalid formatter string found in ${id}\n"${errorLine}"\n ${pointer} ${message}\n`
  logRed(errorStr)
  return createRoot({
    body: `console.error(\`${errorStr}\`)`,
    strategy: 'error'
  })
}

export function logRed(str: string, ...args: any[]): void {
  const RED = '\x1b[31m'
  const RESET = '\x1b[0m'
  console.error(getBrand() + RED + str, RED, ...args, RESET)
}

export function logWarn(str: string, ...args: any[]): void {
  const YELLOW = '\x1b[33m'
  const RESET = '\x1b[0m'
  console.warn(getBrand() + YELLOW + str, YELLOW, ...args, RESET)
}

export function logSuccess(str: string, ...args: any[]): void {
  const GREEN = '\x1b[32m'
  const RESET = '\x1b[0m'
  console.info(getBrand() + GREEN + str, GREEN, ...args, RESET)
}

export function logLog(str: string, ...args: any[]): void {
  const GRAY = '\x1b[90m'
  const RESET = '\x1b[0m'
  console.info(getBrand() + GRAY + str, GRAY, ...args, RESET)
}

export function logError(str: string, ...args: any[]): void {
  const BOLD_RED = '\x1b[1m\x1b[31m'
  const RESET = '\x1b[0m'
  console.error(getBrand() + BOLD_RED + str, BOLD_RED, ...args, RESET)
}

function getBrand(): string {
  const GRAY = '\x1b[90m'
  const BOLD_PURPLE = '\x1b[1m\x1b[35m'
  const RESET = '\x1b[0m'
  
  const now = new Date()
  const timestamp = now.toTimeString().split(' ')[0] // Gets HH:MM:SS format
  
  return `${GRAY}${timestamp}${RESET} ${BOLD_PURPLE}[konzol]${RESET} `
}

export function charsToKB(charCount: number): string {
  return (charCount / 1024).toFixed(2)
}

function getCliBrand(): string[] {
  const BOLD_PURPLE = '\x1b[1m\x1b[35m'
  const RESET = '\x1b[0m'
  
  return [
    `${BOLD_PURPLE}`,
    `
██╗  ██╗ ██████╗ ███╗   ██╗███████╗ ██████╗ ██╗     
██║ ██╔╝██╔═══██╗████╗  ██║╚══███╔╝██╔═══██╗██║     
█████╔╝ ██║   ██║██╔██╗ ██║  ███╔╝ ██║   ██║██║     
██╔═██╗ ██║   ██║██║╚██╗██║ ███╔╝  ██║   ██║██║     
██║  ██╗╚██████╔╝██║ ╚████║███████╗╚██████╔╝███████╗
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚══════╝
    `,
    `${RESET}`
  ]
}

export function getVariableName(index: number): string {
  let result = '';
  let currentIndex = index;

  do {
    result = String.fromCharCode(97 + (currentIndex % 26)) + result;
    currentIndex = Math.floor(currentIndex / 26) - 1;
  } while (currentIndex >= 0);

  return result;
}

export type Result<T> = [true, T] | [false, unknown]
export function unwrap<T>(callback: () => T): Result<T> {
  try {
    return [true, callback()]
  } catch (e) {
    return [false, e]
  }
}