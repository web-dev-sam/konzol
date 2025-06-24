import { SyntaxError as KonzolSyntaxError } from '../parser/parser'

export function unproxify(obj: unknown): any {
  if (obj == null) return
  if (typeof obj === 'object' && "_rawValue" in obj) {
    const res = (obj as any)._rawValue
    res._original = obj
    return res
  }

  const seen = new WeakSet()
  function cloneWithoutProxy(value: unknown, depth = 0): any {
    if (depth > 10) return '[Max depth reached]'
    if (value == null || typeof value !== 'object')
      return value;
    if (seen.has(value)) return '[Circular Reference]'
    seen.add(value);

    try {
      if (Array.isArray(value))
        return value.map(item => cloneWithoutProxy(item, depth + 1))

      const plainObject: Record<PropertyKey, any> = {}
      for (const key in value) {
        try {
          plainObject[key] = cloneWithoutProxy((value as any)[key], depth + 1);
        } catch (error) {
          plainObject[key] = `[Error accessing property: ${error}]`;
        }
      }

      // Get non-enumerable own properties
      const ownKeys = Object.getOwnPropertyNames(value);
      for (const key of ownKeys) {
        if (!(key in plainObject)) {
          try {
            const descriptor = Object.getOwnPropertyDescriptor(value, key);
            if (descriptor && descriptor.get) {
              plainObject[key] = cloneWithoutProxy((value as any)[key], depth + 1);
            } else if (descriptor && descriptor.value !== undefined) {
              plainObject[key] = cloneWithoutProxy(descriptor.value, depth + 1);
            }
          } catch {
            // Skip properties that can't be accessed
          }
        }
      }
      return plainObject;
    } finally {
      seen.delete(value);
    }
  }

  const result = cloneWithoutProxy(obj);
  result._original = obj;
  return result
}

export function logSyntaxError(error: KonzolSyntaxError, id: string, code: string): void {
  const { message, location } = error;
  const { start } = location;

  const lines = code.split('\n');
  const errorLine = lines[start.line - 1] || '';
  const pointer = ' '.repeat(start.column - 1) + '^';
  
  logRed(`Konzol: Invalid formatter string found in\n    ${id}\n`);
  logRed(`"${errorLine}"`);
  logRed(` ${pointer} ${message}\n`);
}



export function logRed(...args: any[]): void {
  const RED = '\x1b[31m';
  const RESET = '\x1b[0m';

  console.log(RED, ...args, RESET);
}