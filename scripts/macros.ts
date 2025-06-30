import { minify } from "@swc/core"
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ObjectValue = string | number | boolean | null | undefined | ObjectValue[] | { [key: string]: ObjectValue };
type SearchResults = Record<string, ObjectValue>;


export const namespace = (name: string, segment: string) =>
  `globalThis.__kzl_${name} || (globalThis.__kzl_${name}=${segment});`;


export function find(obj: ObjectValue, patternParts: string[]): SearchResults {
  const results: SearchResults = {};

  function traverse(
    current: ObjectValue,
    currentPath: string[],
    patternIndex: number
  ): void {
    // Base case: we've matched all pattern parts
    if (patternIndex >= patternParts.length) {
      const displayPath = currentPath.join('.');
      results[displayPath] = current;
      return;
    }

    // Early return if current value can't be traversed
    if (current == null || typeof current !== 'object') {
      return;
    }

    const patternPart = patternParts[patternIndex];

    // Handle wildcard pattern
    if (patternPart === '*') {
      if (Array.isArray(current)) {
        for (let i = 0; i < current.length; i++) {
          traverse(
            current[i],
            [...currentPath, i.toString()],
            patternIndex + 1
          );
        }
      } else {
        // Handle object properties
        for (const key in current) {
          if (Object.prototype.hasOwnProperty.call(current, key)) {
            traverse(
              current[key],
              [...currentPath, key],
              patternIndex + 1
            );
          }
        }
      }
      return;
    }

    // Handle specific patterns
    if (Array.isArray(current)) {
      const index = parseInt(patternPart, 10);
      if (!isNaN(index) && index >= 0 && index < current.length) {
        traverse(
          current[index],
          [...currentPath, patternPart],
          patternIndex + 1
        );
      }
    } else if (Object.prototype.hasOwnProperty.call(current, patternPart)) {
      traverse(
        current[patternPart],
        [...currentPath, patternPart],
        patternIndex + 1
      );
    }
  }

  traverse(obj, [], 0);
  return results;
}

export async function cases(value: any, logic: any) {
  if (value instanceof Promise) value = await value
  let e = () => logic.else?.(value)
  if (value == null) return logic.null?.(value) ?? e()
  if (Array.isArray(value)) return logic.arr?.(value) ?? e()
  if (value instanceof Map) return logic.map?.(value) ?? e()
  if (value instanceof Set) return logic.set?.(value) ?? e()
  if (typeof value === 'number') return logic.num?.(value) ?? e()
  if (typeof value === 'string') return logic.str?.(value) ?? e()
  return e()
}

export function search(obj: any, searchString: any, caseSensitive = false) {
  const results: any = {};
  const visited = new WeakSet();
  
  function search(current: any, path: any = '') {
    // Handle circular references
    if (current !== null && typeof current === 'object') {
      if (visited.has(current)) {
        return;
      }
      visited.add(current);
    }
    
    // Check if current value is a string and contains the substring
    if (typeof current === 'string') {
      const searchStr = caseSensitive ? searchString : searchString.toLowerCase();
      const currentStr = caseSensitive ? current : current.toLowerCase();
      
      if (currentStr.includes(searchStr)) {
        results[path] = current;
      }
    }
    
    // Recursively search object properties
    if (current !== null && typeof current === 'object') {
      if (Array.isArray(current)) {
        // Handle arrays
        current.forEach((item, index) => {
          const newPath = path ? `${path}.${index}` : `${index}`;
          search(item, newPath);
        });
      } else {
        // Handle objects
        Object.keys(current).forEach(key => {
          const newPath = path ? `${path}.${key}` : key;
          search(current[key], newPath);
        });
      }
    }
  }
  
  search(obj);
  return results;
}

async function buildVirtualModule() {
  // TODO: Better error handling
  fs.writeFileSync(
    path.resolve(__dirname, "../assets/virtual-module.min.js"),
    (await minify(
      [cases, find, search]
        .map(func => namespace(func.name, func.toString()))
        .join(";"),
      {
        compress: true,
        mangle: true,
        format: {
          comments: false,
        },
      }
    )).code
  );
}
buildVirtualModule()

